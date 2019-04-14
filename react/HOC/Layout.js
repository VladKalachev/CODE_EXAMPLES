import React, { Component } from "react"
import styled from "styled-components"
import SideMenu from "./SideMenu"

const Container = styled.div`
  position: relative;
  display: flex;
  max-height: 100%;
`

const Content = styled.div`
  width: 91.5vw;
  background-color: ${props => props.theme.greyLight1};
  display: flex;
  flex-direction: row;
  position: relative;
`

export default class Layout extends Component {
  render() {
    return (
      <Container>
        <SideMenu />
        <Content>{this.props.children}</Content>
      </Container>
    )
  }
}
