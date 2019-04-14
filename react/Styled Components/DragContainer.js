import styled from "styled-components"
import DragScroll from "react-dragscroll"

const DragContainer = styled(DragScroll)`
  position: relative;
  overflow: hidden;
  cursor: grab;
  transition: all 0.25s ease-out;

  width: 100%;
  height: 100%;

  @media (max-width: 1700px) {
    max-width: 1180px;
    margin-left: -40px;
  }
  @media (min-width: 1700px) {
    margin: 40px 0 0 50px;
  }
`

export default DragContainer
