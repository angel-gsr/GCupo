import React from 'react'
import { SelectTeacherStep } from './SelectTeacherStep'

describe('<SelectTeacherStep />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<SelectTeacherStep />)
  })
})