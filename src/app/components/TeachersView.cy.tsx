import React from 'react'
import { TeachersView } from './TeachersView'

describe('<TeachersView />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<TeachersView />)
  })
})