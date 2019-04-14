import React, { Component } from "react"
import styled from "styled-components"
import { theme } from "../../index"
import Transition from "../HOC/Transition"
import { Button, Icon, Slider } from "../Layout/Styled Antd Components"
import { CounterBlock, Title } from "../Layout/Styled Components"

const IconContainer = styled.span`
  position: absolute;
  font-size: 15px;
  right: 10px;
  top: 8px;
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:hover {
    color: ${props => props.theme.primary};
    transform: scale(1.15);
  }
`

const SliderContainer = styled.div`
  & ${Title} {
    font-size: 15px;
  }
  & p {
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.theme.grey};
    padding-bottom: 10px;
  }
`
/**
 * @name CounterBackSide
 *
 * @connections Получает данные из Electro/Counter.js
 *
 * @desc Отображает заднюю сторону карточки счетчика с настройками
 */
export default class CounterBackSide extends Component {
  /* Настройки слайдера - Критическая нагрузка */
  renderCritSlider = (min, max, critLoad, handleCritSliderChange) => {
    const sliderProps = {
      onChange: handleCritSliderChange,
      range: false,
      min: min,
      max: max,
      value: critLoad,
      tipFormatter: value => `${value}%`,
      marks: {
        50: {
          style: {
            color: theme.primaryGreen
          },
          label: <strong>50%</strong>
        },
        [Number(critLoad)]: `${Number(critLoad)}%`,
        100: {
          style: {
            color: theme.primaryRed
          },
          label: <strong>100%</strong>
        }
      }
    }
    return <Slider {...sliderProps} />
  }

  /* Настройки слайдера - Максимальное отклонение напряжения */
  renderMaxForm = (min, max, maxLoad, handleMaxSliderChange) => {
    const sliderProps = {
      onChange: handleMaxSliderChange,
      range: false,
      min: min,
      max: max,
      value: maxLoad,
      tipFormatter: value => `${value}%`,
      marks: {
        1: {
          style: {
            color: theme.primaryGreen
          },
          label: <strong>1%</strong>
        },
        [Number(maxLoad)]: `${Number(maxLoad)}%`,
        15: {
          style: {
            color: theme.primaryRed
          },
          label: <strong>15%</strong>
        }
      }
    }
    return <Slider {...sliderProps} />
  }

  render() {
    const {
      flipCard,
      numCounter,
      error,
      critLoad,
      kwDeviation,
      isButtonDisabled,
      handleCritSliderChange,
      handleMaxSliderChange,
      saveSettings
    } = this.props

    return (
      <Transition name="counter__back">
        <CounterBlock error={error} flex={true} padding="10px">
          {/* Иконка закрытия настроек (флипает карточку на переднюю сторону) */}
          <IconContainer>
            <Icon type="close" theme="outlined" onClick={flipCard} />
          </IconContainer>
          {/* Заголовок - Настройки счетчика */}
          <SliderContainer>
            <Title>Настройки счетчика №{numCounter}</Title>
          </SliderContainer>
          {/* Блок - Слайдер критической нагрузки */}
          <SliderContainer>
            <p>Критическая нагрузка</p>
            {this.renderCritSlider(50, 100, critLoad, handleCritSliderChange)}
          </SliderContainer>
          {/* Блок - Слайдер максимального отклонения напряжения */}
          <SliderContainer>
            <p>Максимальное отклонение напряжения</p>
            {this.renderMaxForm(1, 15, kwDeviation, handleMaxSliderChange)}
          </SliderContainer>
          {/* Блок - Подтверждение изменения настроек счетчика */}
          <SliderContainer>
            <Button
              type="primary"
              onClick={saveSettings}
              disabled={isButtonDisabled()}
            >
              Подтвердить изменения
            </Button>
          </SliderContainer>
        </CounterBlock>
      </Transition>
    )
  }
}
