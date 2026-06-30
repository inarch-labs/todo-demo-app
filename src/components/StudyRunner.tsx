'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Study, StudyStep, StudyRatingAnswer } from '@inarch/sdk'
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

interface ProgressState {
  stepIndex: number
  startedAt: number
  successAt: number | null
}

function isTriggerReady(trigger: StudyStep['trigger'], state: { startedAt: number; successAt: number | null; now: number }) {
  switch (trigger.type) {
    case 'start': return true
    case 'elapsed': return state.now - state.startedAt >= trigger.ms
    case 'success': return state.successAt !== null
    case 'event': return false // not used in phase 1
  }
}

async function postAction(studyId: string, body: Record<string, unknown>) {
  await fetch(`/api/study/${studyId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function StudyProvider({ study, children }: { study: Study; children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [, forceTick] = useState(0)
  const shownRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    fetch(`/api/study/${study.id}`)
      .then(r => r.json())
      .then(p => {
        setProgress({
          stepIndex: p.currentStepIndex,
          startedAt: new Date(p.startedAt).getTime(),
          successAt: p.successAt ? new Date(p.successAt).getTime() : null,
        })
      })
  }, [study.id])

  const advance = useCallback((nextIndex: number) => {
    setProgress(prev => (prev ? { ...prev, stepIndex: nextIndex } : prev))
    void postAction(study.id, { action: 'advance', stepIndex: nextIndex })
  }, [study.id])

  const reportSuccess = useCallback(() => {
    setProgress(prev => {
      if (!prev || prev.successAt !== null) return prev
      return { ...prev, successAt: Date.now() }
    })
    void postAction(study.id, { action: 'success' })
  }, [study.id])

  const dismiss = useCallback((step: StudyStep) => {
    void postAction(study.id, { action: 'event', name: 'instruction_dismissed', stepId: step.id })
    setProgress(prev => {
      if (!prev) return prev
      const nextIndex = prev.stepIndex + 1
      void postAction(study.id, { action: 'advance', stepIndex: nextIndex })
      return { ...prev, stepIndex: nextIndex }
    })
  }, [study.id])

  const submitRating = useCallback((step: StudyStep, answers: StudyRatingAnswer[]) => {
    void postAction(study.id, { action: 'rating', stepId: step.id, answers })
    setProgress(prev => {
      if (!prev) return prev
      const nextIndex = prev.stepIndex + 1
      void postAction(study.id, { action: 'advance', stepIndex: nextIndex })
      return { ...prev, stepIndex: nextIndex }
    })
  }, [study.id])

  // Auto-skip skippable steps once their trigger fires, and schedule a
  // re-check for elapsed-time triggers so they fire without user input.
  useEffect(() => {
    if (!progress) return
    const step = study.steps[progress.stepIndex]
    if (!step) return // study complete

    const now = Date.now()
    const ready = isTriggerReady(step.trigger, { startedAt: progress.startedAt, successAt: progress.successAt, now })

    if (!ready) {
      if (step.trigger.type === 'elapsed') {
        const remaining = step.trigger.ms - (now - progress.startedAt)
        const timer = setTimeout(() => forceTick(t => t + 1), Math.max(remaining, 0))
        return () => clearTimeout(timer)
      }
      return
    }

    if (step.type === 'instruction' && step.skipIfSuccess && progress.successAt !== null) {
      advance(progress.stepIndex + 1)
      return
    }

    if (!shownRef.current.has(step.id)) {
      shownRef.current.add(step.id)
      if (step.type === 'instruction') {
        void postAction(study.id, { action: 'event', name: 'instruction_shown', stepId: step.id })
      }
    }
  }, [progress, study, advance])

  const activeStep = (() => {
    if (!progress) return null
    const step = study.steps[progress.stepIndex]
    if (!step) return null
    const ready = isTriggerReady(step.trigger, { startedAt: progress.startedAt, successAt: progress.successAt, now: Date.now() })
    if (!ready) return null
    if (step.type === 'instruction' && step.skipIfSuccess && progress.successAt !== null) return null
    return step
  })()

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
