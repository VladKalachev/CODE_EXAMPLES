import { Spin } from "antd"
import moment from "moment"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { systemDeploymentDate } from "../../config/constants"
import {
  loadHistoryDate,
  countersHistorySelector,
  currentDateSelector,
  loadingHistorySelector,
  modeSelector
} from "../../modules/components/electro"
import { hideModal } from "../../modules/ui"
import { Button, Calendar } from "../Layout/Styled Antd Components"

const CalendarWrapper = styled.div`
  & .ant-fullcalendar-header .ant-radio-group-small {
    display: none;
  }

  & .ant-fullcalendar-year-select {
    order: 2;
    margin-left: 5px;
  }

  & .ant-fullcalendar-month-select {
    order: 1;
  }

  & .ant-fullcalendar-header {
    display: flex;
    justify-content: flex-end;
  }
`

const ButtonContainer = styled.div`
  & button {
    margin-right: 20px;
  }
  & button:last-child {
    margin-right: 0px;
  }
`

const ButtonWrapper = styled.div`
  display: flex;
  margin: auto;
  justify-content: center;
  padding: 10px 0;
`

/**
 * @name RequestHistoryModal
 *
 * @connections Вызывается из Electro/TabMenu.js
 *
 * @desc Модальное окно для запроса исторических данных
 */
class RequestHistoryModal extends Component {
  state = {
    chosenDate: moment()
  }

  componentDidMount = () => {
    const { countersHistory, currentDate, mode } = this.props

    /* При просмотре актуальных данных - выбираем в календаре сегодняшнее число */
    if (mode === "actual") {
      return this.setState({ chosenDate: currentDate })
    }

    /* При просмотре исторических данных - выбираем в календаре дату просматриваемых данных */
    if (mode === "historical") {
      return this.setState({ chosenDate: countersHistory.time })
    }

    return this.setState({ chosenDate: moment() })
  }

  /* Блокируем даты больше сегодняшнего дня или раньше даты установки системы  */
  disabledDate = current =>
    moment(current) > moment() || moment(current) < moment(systemDeploymentDate)

  /* Блокируем кнопку запроса данных если данные за эту дату уже загружены */
  isButtonDisabled = () => {
    const { countersHistory, mode } = this.props
    const { chosenDate } = this.state

    if (
      mode === "historical" &&
      moment(chosenDate).isSame(countersHistory.time)
    ) {
      return true
    }
  }

  /* Выбираем дату/месяц в календаре */
  selectDate = value => this.setState({ chosenDate: value })

  /* Делаем запрос за данными по дате (на 00:00ч) */
  requestData = () => {
    const { currentDate } = this.props
    const { chosenDate } = this.state

    const newDate = moment(chosenDate).startOf("day")

    if (!moment(newDate).isSame(currentDate)) {
      this.props.loadHistoryDate(newDate)
    }
  }

  render() {
    const { hideModal, loading } = this.props
    const { chosenDate } = this.state

    return (
      <CalendarWrapper>
        <Spin spinning={loading}>
          <Calendar
            fullscreen={false}
            onPanelChange={this.selectDate}
            onSelect={this.selectDate}
            value={chosenDate}
            disabledDate={this.disabledDate}
          />
          <ButtonWrapper>
            <ButtonContainer>
              <Button
                type="primary"
                onClick={this.requestData}
                disabled={this.isButtonDisabled()}
              >
                Запросить данные
              </Button>
              <Button onClick={hideModal}>Отмена</Button>
            </ButtonContainer>
          </ButtonWrapper>
        </Spin>
      </CalendarWrapper>
    )
  }
}

export default connect(
  state => ({
    countersHistory: countersHistorySelector(state),
    currentDate: currentDateSelector(state),
    loading: loadingHistorySelector(state),
    mode: modeSelector(state)
  }),
  { loadHistoryDate, hideModal }
)(RequestHistoryModal)
