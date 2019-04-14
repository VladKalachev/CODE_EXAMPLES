import moment from "moment"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import {
  chartExistsSelector,
  countersHistorySelector,
  lastUpdateSelector,
  modeSelector,
  switchMode
} from "../../modules/components/electro"
import { showModal } from "../../modules/ui"
import { Button } from "../Layout/Styled Antd Components"
import { Row, TabMenuContainer, Title } from "../Layout/Styled Components"
import ChartModal from "./ChartModal"
import RequestHistoryModal from "./RequestHistoryModal"
import RequestReportModal from "./RequestReportModal"

const ButtonContainer = styled.div`
  margin: 0 8px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const FlexContainer = styled.div`
  padding: 0 15px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  & ${Title} {
    padding-top: 8px;
    font-family: ${props => props.theme.fontPrimary};
    font-size: 12px;
  }
`
/**
 * @name TabMenu
 *
 * @connections Получает данные из Electro/index.js
 *
 * @desc Контейнер для отображения верхнего меню
 */
class TabMenu extends Component {
  /* Открываем модальное окно графика */
  showChartModal = () => {
    this.props.showModal("ant", {
      component: ChartModal,
      componentProps: {},
      footer: null,
      width: "865px",
      height: "400px"
    })
  }

  /* Открываем модальное окно запроса исторических данных */
  showRequestHistoryModal = () => {
    this.props.showModal("ant", {
      component: RequestHistoryModal,
      componentProps: {},
      footer: null,
      title: "Выберите дату для просмотра истории показаний"
    })
  }

  /* Открываем модальное окно запроса отчета */
  showRequestReportModal = () => {
    this.props.showModal("ant", {
      component: RequestReportModal,
      componentProps: {},
      footer: null,
      title: "Выбор отчета"
    })
  }
  

  /* Переключение между историческими и актуальными данными */
  switchMode = () => {
    const { mode, switchMode } = this.props
    const switchingTo = mode === "actual" ? "historical" : "actual"

    switchMode(switchingTo)
  }

  renderModeInformation = () => {
    const { countersHistory, lastUpdate, mode } = this.props

    if (mode === 'actual') {
      return `Вы просматриваете актуальные данные : ${moment(lastUpdate).format("DD.MM.YYYY HH:mm")}`
    } else {
      return `Вы просматриваете исторические данные : ${moment(countersHistory.time).format("DD.MM.YYYY HH:mm")}`
    }
  }

  render() {
    const { chartExists, countersHistory, mode } = this.props

    return (
      <TabMenuContainer>
        <FlexContainer>
          <Title>
            {this.renderModeInformation()}
          </Title>
          <Row>
            {/* Если загружен какой-либо график - рендерим кнопку с возможностью его вызова */}
            {chartExists && (
              <ButtonContainer>
                <Button
                  type="primary"
                  onClick={this.showChartModal}
                >
                  Открыть последний график
                </Button>
              </ButtonContainer>
            )}
            {/* Если загружены исторические данные - рендерим кнопку для переключения между историческими и актуальными данными */}
            {countersHistory.loaded && (
              <ButtonContainer>
                <Button type="primary" onClick={this.switchMode}>
                  {mode === "actual"
                    ? "Переключиться на исторические данные"
                    : "Переключиться на актуальные данные"}
                </Button>
              </ButtonContainer>
            )}
            {/* Кнопка вызова модального окна "Истории показаний" */}
            <ButtonContainer>
              <Button type="primary" onClick={this.showRequestHistoryModal}>
                Запросить исторические данные
              </Button>
            </ButtonContainer>
            {/* Кнопка вызова модального окна для запроса Excel отчета */}
            <ButtonContainer>
              <Button type="primary" onClick={this.showRequestReportModal}>
                Отчет
              </Button>
            </ButtonContainer>
          </Row>
        </FlexContainer>
      </TabMenuContainer>
    )
  }
}

export default connect(
  state => ({
    chartExists: chartExistsSelector(state),
    countersHistory: countersHistorySelector(state),
    lastUpdate: lastUpdateSelector(state),
    mode: modeSelector(state)
  }),
  { switchMode, showModal }
)(TabMenu)
