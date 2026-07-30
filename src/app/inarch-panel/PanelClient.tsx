'use client'

import { InarchPanel } from '@inarch/sdk/panel'
import type { TestDefinition } from '@inarch/sdk'
import { INARCH_TEST_ID } from '@/lib/inarch-test-id'

export function PanelClient({ initialDefinition }: { initialDefinition?: TestDefinition }) {
  return (
    <InarchPanel
      productName="To Do!"
      knownEvents={[]}
      initialDefinition={initialDefinition}
      onSaveDefinition={async definition => {
        // Always key on the one shared testId, regardless of whatever id
        // TestConfigPage generated internally — every variant's panel reads
        // and writes the same record, so there's nothing to keep in sync.
        const toSave: TestDefinition = { ...definition, id: INARCH_TEST_ID }
        await fetch('/api/inarch-panel/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSave),
        })
      }}
    />
  )
}
