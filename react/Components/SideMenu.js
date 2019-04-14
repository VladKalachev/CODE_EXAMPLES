import React, { Component } from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"
import styled from "styled-components"
import logo from "../../assets/img/logo.png"
import logoCompany from "../../assets/img/company-logo.svg"
import { logout, roleSelector } from "../../modules/auth"
import Navigation from "./Navigation"
import LinkNav from "./Styled Components/LinkNav"
import ButtonExit from "./Styled Components/ButtonExit"

const Container = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-rows: repeat(1fr, 4);
  text-align: center;
`

const Logo = styled.div`
  padding: 25px;
  align-items: center;

  & img {
    width: 80px;
    height: 80px;
  }
`
const LogoCompanyContainer = styled(Logo)`
  align-self: flex-end;
  padding-bottom: 10px;

  & img {
    width: 65px;
    height: 65px;
  }
`
const Controls = styled.div`
  align-self: flex-end;
  & .information > div:first-of-type,
  & .exit > div:first-of-type {
    margin-left: 3px;
  }
`

class SideMenu extends Component {
  logout = () => this.props.logout()

  render() {
    return (
      <Container>
        <Logo>
          <img src={logo} alt="logo" />
        </Logo>
        <Navigation role={this.props.role} />
        <Controls>
          <LinkNav
            alias={"information"}
            name={"Справка"}
            url={"/information/"}
          />
          <ButtonExit onClick={this.logout} />
        </Controls>
        <LogoCompanyContainer>
          {" "}
          <a href="/" target="_blank" rel="noopener noreferrer">
            <img src={logoCompany} alt="logo" />
          </a>
        </LogoCompanyContainer>
      </Container>
    )
  }
}

export default withRouter(
  connect(
    state => ({ role: roleSelector(state) }),
    { logout }
  )(SideMenu)
)
