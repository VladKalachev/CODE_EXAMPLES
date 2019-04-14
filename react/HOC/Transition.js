import React, { Component } from "react"
import ReactCSSTransitionGroup from "react-addons-css-transition-group"

/**
 * @name Transition
 *
 * @desc HOC для ReactCSSTransitionGroup, т.к. без простыни пропсов код выглядит лучше.
 */
export default class Transition extends Component {
  render() {
    const {
      children,
      name,
      transitionAppear = true,
      transitionAppearTimeout = 150,
      transitionEnter = false,
      tranitionLeave = false
    } = this.props

    return (
      <ReactCSSTransitionGroup
        transitionName={name}
        transitionAppear={transitionAppear}
        transitionAppearTimeout={transitionAppearTimeout}
        transitionEnter={transitionEnter}
        transitionLeave={tranitionLeave}
      >
        {children}
      </ReactCSSTransitionGroup>
    )
  }
}
