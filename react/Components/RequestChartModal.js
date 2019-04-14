import moment from "moment"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { systemDeploymentDate } from "../../config/constants"
import {
  loadChart,
  loadingChartSelector
} from "../../modules/components/electro"
import { hideModal } from "../../modules/ui"
import {
  Button,
  DatePicker,
  Radio,
  RadioGroup
} from "../Layout/Styled Antd Components"
import { CardTitle } from "../Layout/Styled Components"

const Container = styled.div`
  min-height: 450px;
  text-align: center;
`

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  left: 0;
`

const MenuTable = styled.table`
  margin: 0 auto;
  padding-top: 10px;
  width: 70%;
  & td {
    padding: 3px;
    vertical-align: top;
    position: relative;
    text-align: center;
  }
`

const StatName = styled.h4`
  width: 100%;
  text-align: center;
  padding: 9px 0;
`

const RadioContainer = styled.div`
  margin: 0 0 10px 0;
  display: flex;
  justify-content: center;
`

const HorizontalLine = styled.hr`
  border-top: 1px solid ${props => props.theme.greyLight2};
`

const DatePickerContainer = styled.div`
  display: flex;
  align-self: center;
`

const StatContainer = styled.div`
  display: flex;
  align-content: center;
  flex-direction: column;

  &:last-child {
    margin-bottom: 20px;
  }
`

function range(start, end) {
  const result = []
  for (let i = start; i < end; i++) {
    result.push(i)
  }
  return result
}

/**
 * @name RequestChartModal
 *
 * @connections Вызывается из Electro/CounterFrontSide.js
 *
 * @desc Модальное окно для запроса построения графиков
 */
class RequestChartModal extends Component {
  state = {
    timeStep: 1,
    enabledDays: 2,
    beginDate: moment().subtract(1, "h"),
    endDate: moment(),
    startDefaultValue: moment().subtract(1, "h")
  }

  /* Делаем запрос за данными */
  sendChartRequest = (rpId, stat, numCounter, floor, title) => {
    const { beginDate, endDate, timeStep } = this.state

    const data = {
      rpId,
      from: Number(
        moment(beginDate)
          .startOf("minute")
          .format("x")
      ),
      to: Number(moment(endDate).format("x")),
      interval: timeStep,
      type: stat,
      meta: {
        numCounter,
        floor,
        title
      }
    }
    this.props.loadChart(data)
  }

  /* Запрещаем выбор дат в блоке "Начальная точка построения графика" */
  disabledStartDates = current => {
    const { timeStep } = this.state
    const timeStep1h =
      timeStep === 60 && moment(current) > moment().subtract(2, "d")
    const timeStep1d =
      timeStep === 1440 && moment(current) > moment().subtract(30, "d")
    return (
      moment(current) > moment() || // больше чем настоящее
      moment(current) < moment(systemDeploymentDate) || // меньше чем дата установки системы
      timeStep1h ||
      timeStep1d
    )
  }

  /* Запрещаем выбор дат в блоке "Конечная точка построения графика" */
  disabledDates = current => {
    const { enabledDays, beginDate } = this.state

    return (
      moment(current) > moment() || // больше чем настоящее
      moment(current) <
        moment(beginDate)
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0) || // меньше чем начало
      moment(current) < moment(systemDeploymentDate) || // меньше чем дата установки системы
      moment(current) > moment(beginDate).add(enabledDays, "d") // больше чем доступные даты
    )
  }

  /* Запрещаем выбор времени больше чем сейчас (сегодняшний день) в блоке Начальная  точка построения графика */
  disabledStartDateTime = date => {
    if (moment(date).isSame(moment(), "day")) {
      const currentHour = moment().hour() + 1
      const spliceNumber = 24 - currentHour
      return {
        disabledHours: () => range(0, 24).splice(currentHour, spliceNumber)
      }
    }
  }

  /* Запрещаем выбор времени больше чем сейчас (сегодняшний день) в блоке Конечная точка построения графика */
  disabledEndDateTime = date => {
    const { beginDate } = this.state

    if (moment(date).isSame(moment(), "day")) {
      const currentHour = moment().hour()
      const spliceNumber = 23 - currentHour
      return {
        disabledHours: () => range(0, 24).splice(currentHour, spliceNumber)
      }
    }

    if (moment(date).isSame(moment(beginDate), "day")) {
      const hour = moment(beginDate).hour()
      return {
        disabledHours: () => range(0, 24).splice(0, hour)
      }
    }

    if (moment(date).isSame(moment(beginDate).add(1, "day"), "day")) {
      const hour = moment(beginDate).hour() + 2
      return {
        disabledHours: () => range(0, 24).splice(hour, 24)
      }
    }
  }

  /* Выбор Временного шага графика */
  onChange = e => {
    let enabledDays = 2
    let value
    let endDate = moment()
    switch (e.target.value) {
      case 1:
        enabledDays = 2
        value = moment().subtract(2, "h")
        break
      case 10:
        enabledDays = 14
        value = moment().subtract(6, "h")
        break
      case 60:
        enabledDays = 45
        value = moment().subtract(3, "d")
        break
      case 1440:
        enabledDays = 90
        if (moment().subtract(30, "d") > moment(systemDeploymentDate))
          value = moment().subtract(30, "d")
        else value = moment(systemDeploymentDate)
        break

      default:
        return
    }
    this.setState({
      timeStep: e.target.value,
      enabledDays,
      beginDate: value,
      endDate: endDate
    })
  }

  /* Изменение Начальной точки построения графика */
  onBeginDateChange = value =>
    this.setState({ beginDate: value, endDate: null })

  /* Изменение Конечной точки построения графика */
  onEndDateChange = value => this.setState({ endDate: value })

  /* Если недостаточно данных - блокируем кнопку "Построить график" */
  isButtonDisabled = () => {
    const { beginDate, endDate, timeStep } = this.state
    if (!beginDate || !endDate || !timeStep) {
      return true
    }
    return false
  }

  /* Исходя из запрашиваемых данных рендерим заголовок */
  switchName() {
    const { stat } = this.props
    switch (stat) {
      case "energy":
        return "потребленной электроэнергии"
      case "voltage":
        return "напряжения на электросчетчике"
      case "load":
        return "нагрузки на электросчетчике"
      default:
        return
    }
  }

  render() {
    const { counterState, stat, hideModal, loading } = this.props
    if (counterState && counterState.numCounter)
      return (
        <Container>
          <CardTitle>Настройка графика {this.switchName()}</CardTitle>
          <HorizontalLine />
          <MenuTable>
            <tbody>
              <tr>
                <td>Номер счетчика:</td>
                <td>{counterState.numCounter}</td>
              </tr>
              <tr>
                <td>Местонахождение:</td>
                <td>
                  Этаж {counterState.floor}, {counterState.title}
                </td>
              </tr>
            </tbody>
          </MenuTable>
          <HorizontalLine />
          {/* Блок выбора данных для построения графика */}
          <StatContainer>
            <StatName>Временной шаг графика</StatName>
            <RadioContainer>
              <RadioGroup onChange={this.onChange} value={this.state.timeStep}>
                <Radio value={1}>1 минута</Radio>
                <Radio value={10}>10 минут</Radio>
                <Radio value={60}>1 час</Radio>
                {stat === "energy" && <Radio value={1440}>1 день</Radio>}
              </RadioGroup>
            </RadioContainer>
          </StatContainer>
          <StatContainer>
            <StatName>Начальная точка построения графика</StatName>
            <DatePickerContainer>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="Выберите начальную дату"
                onChange={this.onBeginDateChange}
                onOk={this.onBeginDateChange}
                showToday={false}
                disabledDate={this.disabledStartDates}
                disabledTime={this.disabledStartDateTime}
                value={this.state.beginDate}
              />
            </DatePickerContainer>
          </StatContainer>
          <StatContainer>
            <StatName>Конечная точка построения графика</StatName>
            <DatePickerContainer>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="Выберите конечную дату"
                onChange={this.onEndDateChange}
                onOk={this.onEndDateChange}
                disabledDate={this.disabledDates}
                disabledTime={this.disabledEndDateTime}
                value={this.state.endDate}
              />
            </DatePickerContainer>
          </StatContainer>
          <Footer className="ant-modal-footer">
            <div>
              <Button key="back" size="large" onClick={hideModal}>
                Отмена
              </Button>

              <Button
                key="complete"
                type="primary"
                size="large"
                onClick={() =>
                  this.sendChartRequest(
                    counterState.rpId,
                    stat,
                    counterState.numCounter,
                    counterState.floor,
                    counterState.title
                  )
                }
                disabled={this.isButtonDisabled()}
                loading={loading}
              >
                Построить график
              </Button>
            </div>
          </Footer>
        </Container>
      )
    else return null
  }
}

export default connect(
  state => ({ loading: loadingChartSelector(state) }),
  { hideModal, loadChart }
)(RequestChartModal)
