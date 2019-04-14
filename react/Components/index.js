import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import {
  chartCalledSelector,
  clearChartCall,
  clearNotification,
  clearReport,
  countersHistorySelector,
  countersSelector,
  errorSelector,
  initialErrorSelector,
  lastUpdateSelector,
  loadAllCounters,
  loadingInitialSelector,
  notificationSelector,
  reportSelector,
  subscribeCounters,
  unsubscribeCounters
} from "../../modules/components/electro"
import { hideModal, showModal } from "../../modules/ui"
import LoadingWrapper from "../HOC/LoadingWrapper"
import NotificationListener from "../HOC/NotificationListener"
import ReportListener from "../HOC/ReportListener"
import SocketListener from "../HOC/SocketListener"
import Transition from "../HOC/Transition"
import { Column, ComponentContainer } from "../Layout/Styled Components"
import ChartModal from "./ChartModal"
import Counter from "./Counter"
import TabMenu from "./TabMenu"

const CountersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
  margin: auto 0;
`

/**
 * @name Electro
 *
 * @connections Вызывает подключение веб-сокета - SocketListener
 *              Вызывает скачивание отчета - ReportListener
 *              Вызывает уведомления - NotificationListener
 *              Рендерит верхнее меню - TabMenu.js
 *              Рендерит массив счетчиков - Counter.js
 *
 * @desc Входной компонент в модуль Электросчетчики
 */
class App extends Component {
  componentDidMount = () => {
    this.props.loadAllCounters()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.countersHistory.data !== this.props.countersHistory.data)
      this.props.hideModal()
  }

  render() {
    const { counters, showModal, clearChartCall, chartCalled } = this.props

    /* Вызов модального окна загруженного графика */
    if (!chartCalled) {
      showModal("ant", {
        component: ChartModal,
        componentProps: {},
        footer: null,
        width: "865px",
        height: "400px"
      })
      clearChartCall()
    }

    const Component = (
      <Transition name="module" transitionAppearTimeout={3000}>
        <ComponentContainer>
          <Column>
            <SocketListener
              subscribe={this.props.subscribeCounters}
              unsubscribe={this.props.unsubscribeCounters}
            />
            <NotificationListener {...this.props} />
            <ReportListener {...this.props} />
            <TabMenu />
            <CountersWrapper>
              {counters.map(counter => (
                <Counter counter={counter} key={counter.rpId} />
              ))}
            </CountersWrapper>
          </Column>
        </ComponentContainer>
      </Transition>
    )

    return (
      <LoadingWrapper
        component={Component}
        loading={this.props.loading}
        error={this.props.initialError}
      />
    )
  }
}

export default connect(
  state => ({
    chartCalled: chartCalledSelector(state),
    counters: countersSelector(state),
    countersHistory: countersHistorySelector(state),
    error: errorSelector(state),
    initialError: initialErrorSelector(state),
    lastUpdate: lastUpdateSelector(state),
    loading: loadingInitialSelector(state),
    notification: notificationSelector(state),
    report: reportSelector(state)
  }),
  {
    loadAllCounters,
    subscribeCounters,
    showModal,
    hideModal,
    clearNotification,
    clearChartCall,
    clearReport,
    unsubscribeCounters
  }
)(App)
