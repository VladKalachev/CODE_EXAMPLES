import React, { Component } from "react"
import styled from "styled-components"
import MenuItem from "./MenuItem"

const MenuContainer = styled.nav`
  background-color: ${props => props.theme.white};
  width: 100%;
  height: 40px;
  display: flex;
`

export default class TabMenu extends Component {
  render() {
    const { active, items, onChange, prefix, selectionKey } = this.props
    return (
      <MenuContainer>
        {items.map(item => (
          <MenuItem
            activeId={active}
            className={
              Number(active) === Number(item[selectionKey]) && "active"
            }
            key={Number(item[selectionKey])}
            itemId={Number(item[selectionKey])}
            onChange={onChange}
          >
            {prefix + item[selectionKey]}
          </MenuItem>
        ))}
      </MenuContainer>
    )
  }
}
