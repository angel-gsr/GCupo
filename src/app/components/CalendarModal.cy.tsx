import React from 'react'
import { CalendarModal } from './CalendarModal'

describe('<CalendarModal />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<CalendarModal />)
  })
})