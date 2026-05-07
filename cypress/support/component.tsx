import './commands'
import React from 'react'
import { mount } from 'cypress/react'
import { MemoryRouter } from "react-router-dom"
import type { MountOptions, MountReturn } from 'cypress/react'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: (component: React.ReactNode, options?: MountOptions) => Chainable<MountReturn>
    }
  }
}

Cypress.Commands.add("mount", (component, options = {}) => {
  return mount(
    <MemoryRouter>
      {component}
    </MemoryRouter>,
    options
  )
})