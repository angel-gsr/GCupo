import React from 'react'
import { NavigationMenu } from './navigation-menu'

describe('<NavigationMenu />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<NavigationMenu />)
  })
})