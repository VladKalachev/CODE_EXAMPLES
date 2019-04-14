import React, { Component } from "react"
import styled from "styled-components"

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
`

const LoaderSvg = styled.svg`
  width: 65px;
  height: 65px;
`

export default class Loader extends Component {
  render() {
    return (
      <Container>
        <LoaderSvg
          className="lds-curve-bars"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
        >
          <g transform="translate(50,50)">
            <circle
              cx="0"
              cy="0"
              r="6.25"
              fill="none"
              stroke="#c8472c"
              strokeWidth="2"
              strokeDasharray="19.634954084936208 19.634954084936208"
              transform="rotate(339.777)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;360 0 0"
                times="0;1"
                dur="1s"
                calcMode="spline"
                keySplines="0.2 0 0.8 1"
                begin="0"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="0"
              cy="0"
              r="12.5"
              fill="none"
              stroke="#412a1e"
              strokeWidth="2"
              strokeDasharray="39.269908169872416 39.269908169872416"
              transform="rotate(359.967)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;360 0 0"
                times="0;1"
                dur="1s"
                calcMode="spline"
                keySplines="0.2 0 0.8 1"
                begin="-0.14285714285714285"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="0"
              cy="0"
              r="18.75"
              fill="none"
              stroke="#f8de3c"
              strokeWidth="2"
              strokeDasharray="58.90486225480862 58.90486225480862"
              transform="rotate(16.9732)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;360 0 0"
                times="0;1"
                dur="1s"
                calcMode="spline"
                keySplines="0.2 0 0.8 1"
                begin="-0.2857142857142857"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="0"
              cy="0"
              r="25"
              fill="none"
              stroke="#fefefe"
              strokeWidth="2"
              strokeDasharray="78.53981633974483 78.53981633974483"
              transform="rotate(51.3077)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;360 0 0"
                times="0;1"
                dur="1s"
                calcMode="spline"
                keySplines="0.2 0 0.8 1"
                begin="-0.42857142857142855"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="0"
              cy="0"
              r="31.25"
              fill="none"
              stroke="#58acf4"
              strokeWidth="2"
              strokeDasharray="98.17477042468103 98.17477042468103"
              transform="rotate(92.174)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;360 0 0"
                times="0;1"
                dur="1s"
                calcMode="spline"
                keySplines="0.2 0 0.8 1"
                begin="-0.5714285714285714"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="0"
              cy="0"
              r="37.5"
              fill="none"
              stroke="#105edd"
              strokeWidth="2"
              strokeDasharray="117.80972450961724 117.80972450961724"
              transform="rotate(136.384)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;360 0 0"
                times="0;1"
                dur="1s"
                calcMode="spline"
                keySplines="0.2 0 0.8 1"
                begin="-0.7142857142857143"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="0"
              cy="0"
              r="43.75"
              fill="none"
              stroke="#0b3075"
              strokeWidth="2"
              strokeDasharray="137.44467859455344 137.44467859455344"
              transform="rotate(182.498)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;360 0 0"
                times="0;1"
                dur="1s"
                calcMode="spline"
                keySplines="0.2 0 0.8 1"
                begin="-0.8571428571428571"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </LoaderSvg>
      </Container>
    )
  }
}
