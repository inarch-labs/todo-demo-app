'use client'

import { TestConfigPage } from '@inarch/sdk/config'

export default function InarchConfigRoute() {
  return (
    <TestConfigPage
      productName="To Do!"
      knownEvents={[]}
      onSave={async definition => {
        // Dogfooding only: real persistence is the integration's problem
        // (see onSave prop). Storing locally here just to see the form work.
        console.log('Saved test definition:', definition)
        window.localStorage.setItem('inarch-test-definition', JSON.stringify(definition))
        window.alert('Saved. Check the console / localStorage for the TestDefinition.')
      }}
    />
  )
}
