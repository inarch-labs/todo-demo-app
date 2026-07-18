'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export interface AiParseResult {
  title: string | null
  titleSource: string | null
  body: string | null
  bodySource: string | null
  dueDate: string | null
  dueDateSource: string | null
}

interface Props {
  result: AiParseResult
  userInput: string
  onApprove: (fields: { title: string; body: string | null; dueDate: string | null }) => void
  onReject: () => void
}

function SourceChip({ source, onDismiss }: { source: string; onDismiss: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded mt-1"
      style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: 'rgb(161, 98, 7)' }}>
      From: {source}
      <button onClick={onDismiss} className="ml-0.5 hover:opacity-70" aria-label="Dismiss suggestion">×</button>
    </span>
  )
}

export function AiReviewDialog({ result, userInput, onApprove, onReject }: Props) {
  const [title, setTitle] = useState(result.title ?? userInput)
  const [titleSource, setTitleSource] = useState(result.titleSource)
  const [body, setBody] = useState(result.body ?? '')
  const [bodySource, setBodySource] = useState(result.bodySource)
  const [dueDate, setDueDate] = useState(result.dueDate ?? '')
  const [dueDateSource, setDueDateSource] = useState(result.dueDateSource)

  function handleApprove() {
    onApprove({
      title: title.trim() || userInput,
      body: body.trim() || null,
      dueDate: dueDate || null,
    })
  }

  return (
    <Dialog open onOpenChange={open => !open && onReject()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>✦</span> AI Suggestion
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Title</p>
            <Input
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleSource(null) }}
              className="text-sm"
            />
            {titleSource && <SourceChip source={titleSource} onDismiss={() => setTitleSource(null)} />}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
            <Textarea
              value={body}
              onChange={e => { setBody(e.target.value); setBodySource(null) }}
              placeholder="No additional context…"
              rows={3}
              className="resize-none text-sm"
            />
            {bodySource && <SourceChip source={bodySource} onDismiss={() => setBodySource(null)} />}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Due date</p>
            <input
              type="date"
              value={dueDate}
              onChange={e => { setDueDate(e.target.value); setDueDateSource(null) }}
              className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {dueDateSource && <SourceChip source={dueDateSource} onDismiss={() => setDueDateSource(null)} />}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={onReject}>Reject</Button>
            <Button size="sm" onClick={handleApprove}>Approve</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
