import styled from "styled-components"

const TableContainer = styled.div.attrs(props => ({
  fontSize: props.fontSize || "12px"
}))`
  width: calc(100% - 320px);
  padding: 10px;

  & .ant-table {
    font-size: ${props => props.fontSize};
  }
`
export default TableContainer
