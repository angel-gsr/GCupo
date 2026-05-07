import React from 'react'
import { ClassroomsView } from './ClassroomsView'

describe('<ClassroomsView />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ClassroomsView />)
  })
})