import styled, { css } from "styled-components"

const ColorBlock = styled.div.attrs(props => ({
  error: props.error,
  counter: props.counter
}))`
  width: 100%;
  display: flex;

  ${props =>
    props.counter &&
    css`
      /* Это нужно т.к. блок вложенный в Tooltip рендерится криво и между блоками появляется расстояние */
      &:nth-of-type(1) {
        margin-top: -0.3px;
      }
      &:nth-of-type(2) {
        margin-top: -0.5px;
      }
      &:nth-of-type(3) {
        margin-top: -0.9px;
      }
      &:nth-of-type(4) {
        margin-top: -0.2px;
      }
      &:nth-of-type(5) {
        margin-top: 0px;
      }
    `};

  ${props =>
    props.error === "1" &&
    css`
      background: ${props => props.theme.gradientRed};
    `};

  ${props =>
    props.error === "0" &&
    css`
      background: ${props => props.theme.gradientGreen};
    `};

  & span {
    width: 100%;
    display: flex;
  }

  & p {
    width: 50%;
    text-align: center;
    padding: 5px 0 0 0;
    font-size: 12px;
    font-weight: 600;
    margin-top: 8px;
  }
`

export default ColorBlock
