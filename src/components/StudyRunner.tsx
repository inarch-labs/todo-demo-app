'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { deriveStudyProgress } from '@inarch/sdk/study'
import type { Study, StudyStep, StudyRatingAnswer, TelemetryEvent } from '@inarch/sdk'
import { useTelemetry } from '@inarch/sdk/telemetry/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface StudyContextValue {
  reportSuccess: () => void
}

const StudyContext = createContext<StudyContextValue | null>(null)

export function useStudy() {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error('useStudy must be used within StudyProvider')
  return ctx
}

/**
 * A locally-synthesized event, appended to local state immediately when an
 * action happens so deriveStudyProgress() reflects it right away — the real
 * event is already on its way to the server via useTelemetry(), but that's
 * batched/flushed on a timer, not synchronous, so the UI can't wait on it
 * for its own next render. Never sent anywhere itself; only ever read back
 * through deriveStudyProgress(), which only touches type/studyId/stepId/
 * createdAt/answers — doesn't need to be a byte-perfect TelemetryEvent.
 */
function localEvent(payload: Record<string, unknown>): TelemetryEvent {
  return {
    id: `local-${Math.random().toString(36).slice(2)}`,
    sessionId: 'local',
    branch: 'local',
    createdAt: new Date().toISOString(),
    ...payload,
  } as TelemetryEvent
}

export function StudyProvider({ study, children }: { study: Study; children: ReactNode }) {
  const telemetry = useTelemetry()
  const [events, setEvents] = useState<TelemetryEvent[] | null>(null)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [, forceTick] = useState(0)
  const shownRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    fetch(`/api/study/${study.id}`)
      .then(r => r.json())
      .then((data: { events: TelemetryEvent[]; startedAt: string }) => {
        setEvents(data.events)
        setStartedAt(data.startedAt)
      })
  }, [study.id])

  const progress = events && startedAt ? deriveStudyProgress(study, events, startedAt) : null

  const reportSuccess = useCallback(() => {
    if (progress?.successAt) return // idempotent, matches the old markSuccess guard
    telemetry.trackSuccess(study.id)
    setEvents(prev => (prev ? [...prev, localEvent({ type: 'success', studyId: study.id })] : prev))
  }, [progress?.successAt, study.id, telemetry])

  const dismiss = useCallback((step: Extract<StudyStep, { type: 'instruction' }>) => {
    telemetry.trackInstructionDismissed(study.id, step.id)
    setEvents(prev => (prev ? [...prev, localEvent({ type: 'instruction_dismissed', studyId: study.id, stepId: step.id })] : prev))
  }, [study.id, telemetry])

  const submitRating = useCallback((step: Extract<StudyStep, { type: 'rating' }>, answers: StudyRatingAnswer[]) => {
    telemetry.trackRating(study.id, step.id, answers)
    setEvents(prev => (prev ? [...prev, localEvent({ type: 'rating', studyId: study.id, stepId: step.id, answers })] : prev))
  }, [study.id, telemetry])

  // Log instruction_shown once per step, and schedule a re-check for
  // elapsed-time triggers so they fire without user input.
  useEffect(() => {
    if (!progress) return

    if (progress.nextCheckAtMs !== null) {
      const remaining = progress.nextCheckAtMs - Date.now()
      const timer = setTimeout(() => forceTick(t => t + 1), Math.max(remaining, 0))
      return () => clearTimeout(timer)
    }

    const step = progress.activeStep
    if (step?.type === 'instruction' && !shownRef.current.has(step.id)) {
      shownRef.current.add(step.id)
      telemetry.trackInstructionShown(study.id, step.id)
      setEvents(prev => (prev ? [...prev, localEvent({ type: 'instruction_shown', studyId: study.id, stepId: step.id })] : prev))
    }
  }, [progress, study.id, telemetry])

  const activeStep = progress?.activeStep ?? null

  return (
    <StudyContext.Provider value={{ reportSuccess }}>
      {children}
      {activeStep?.type === 'instruction' && (
        <InstructionBanner step={activeStep} onDismiss={() => dismiss(activeStep)} />
      )}
      {activeStep?.type === 'rating' && (
        <RatingDialog step={activeStep} onSubmit={answers => submitRating(activeStep, answers)} />
      )}
    </StudyContext.Provider>
  )
}

function InstructionBanner({ step, onDismiss }: { step: Extract<StudyStep, { type: 'instruction' }>; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-card border border-border rounded-lg shadow-lg p-4 z-50">
      <p className="text-sm mb-3">{step.content}</p>
      {step.dismissible && (
        <Button size="sm" variant="outline" onClick={onDismiss}>Got it</Button>
      )}
    </div>
  )
}

function RatingDialog({ step, onSubmit }: { step: Extract<StudyStep, { type: 'rating' }>; onSubmit: (answers: StudyRatingAnswer[]) => void }) {
  const [values, setValues] = useState<Record<string, string>>({})

  function submit() {
    const answers: StudyRatingAnswer[] = step.questions
      .filter(q => q.optional || values[q.id])
      .map(q => ({ questionId: q.id, value: values[q.id] ?? '' }))
    onSubmit(answers)
  }

  const canSubmit = step.questions.every(q => q.optional || values[q.id])

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Quick feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {step.questions.map(q => (
            <div key={q.id}>
              <p className="text-sm font-medium mb-2">{q.prompt}</p>
              {q.kind === 'scale' ? (
                <div className="flex gap-2">
                  {Array.from({ length: q.scaleMax ?? 5 }, (_, i) => i + 1).map(n => (
                    <Button
                      key={n}
                      type="button"
                      size="sm"
                      variant={values[q.id] === String(n) ? 'default' : 'outline'}
                      onClick={() => setValues(v => ({ ...v, [q.id]: String(n) }))}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              ) : (
                <Textarea
                  value={values[q.id] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [q.id]: e.target.value }))}
                  rows={2}
                  className="text-sm"
                />
              )}
            </div>
          ))}
          <Button onClick={submit} disabled={!canSubmit} className="w-full">Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
