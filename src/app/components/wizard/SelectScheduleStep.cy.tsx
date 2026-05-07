import React from 'react'
import { SelectScheduleStep } from './SelectScheduleStep'

describe('<SelectScheduleStep />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<SelectScheduleStep />)
  })
})