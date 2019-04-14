import moment from "moment"
import React, { Component } from "react"
import {
  default as Highcharts,
  default as ReactHighcharts
} from "react-highcharts"
import { connect } from "react-redux"
import styled from "styled-components"
import { theme } from "../../index"
import {
  chartMetaSelector,
  chartSelector
} from "../../modules/components/electro"
import { checkArrayLength } from "../../utils"

Highcharts.Highcharts.setOptions({
  lang: {
    months: [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь"
    ],
    shortMonths: [
      "Янв.",
      "Фев.",
      "Мар.",
      "Апр.",
      "Май",
      "Июн.",
      "Июл.",
      "Авг.",
      "Сен.",
      "Окт.",
      "Ноя.",
      "Дек."
    ],
    weekdays: [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота"
    ]
  }
})

const ErrorContainer = styled.div`
  max-height: 200px;
  padding: 10px;
  overflow-y: scroll;

  & li {
    margin-bottom: 4px;
  }

  & li:last-child {
    margin-bottom: 0;
  }
`

const Container = styled.div`
  position: relative;
  top: -10px;
`

const Divider = styled.div`
  height: 1px;
  background-color: ${props => props.theme.greyLight1};
  margin: -24px 0 10px 0px;
  width: 100%;
`

const FormSubtitle = styled.div`
  display: inline-block;
  text-align: left;
  background-color: ${props => props.theme.white};
  margin-bottom: 15px;
  padding-right: 10px;
`
/* Исходные настройки для всех графиков */
const options = {
  credits: false,
  chart: {
    type: "spline",
    scrollablePlotArea: {
      minWidth: 600,
      scrollPositionX: 1
    }
  },
  time: {
    timezone: "Europe/Moscow",
    useUTC: false
  },
  title: {
    text: "График"
  },
  subtitle: {
    text: "Нет данных"
  },
  xAxis: {
    type: "datetime",
    labels: {
      overflow: "justify"
    }
  },
  plotOptions: {
    spline: {
      lineWidth: 3,
      states: {
        hover: {
          lineWidth: 4
        }
      },
      marker: {
        enabled: false
      }
    }
  },
  navigation: {
    menuItemStyle: {
      fontSize: "10px"
    }
  }
}

/* Дополнительные настройки для графика электропотребления */
const energyOptions = {
  yAxis: {
    title: {
      text: "Электропотребление"
    },
    labels: {
      formatter: function() {
        return this.value + "кВ"
      }
    },
    minorGridLineWidth: 0,
    gridLineWidth: 0,
    alternateGridColor: null
  },
  tooltip: {
    valueSuffix: " кВ",
    crosshairs: true,
    shared: true
  }
}

/* Дополнительные настройки для графика нагрузки */
const loadOptions = {
  yAxis: {
    title: {
      text: "Нагрузка"
    },
    labels: {
      formatter: function() {
        return this.value + "%"
      }
    },
    minorGridLineWidth: 0,
    gridLineWidth: 0,
    alternateGridColor: null
  },
  tooltip: {
    valueSuffix: " %",
    crosshairs: true,
    shared: true
  }
}

/* Дополнительные настройки для графика напряжения */
const voltageOptions = {
  yAxis: {
    title: {
      text: "Напряжение"
    },
    labels: {
      formatter: function() {
        return this.value + "В"
      }
    },
    minorGridLineWidth: 0,
    gridLineWidth: 0,
    alternateGridColor: null
  },
  tooltip: {
    valueSuffix: " В",
    crosshairs: true,
    shared: true
  }
}

/**
 * @name ChartModal
 *
 * @connections Вызывается из Electro/index.js и Electro/TabMenu.js
 *
 * @desc Модальное окно, в котором отображается построенный график
 */
class ChartModal extends Component {
  /* Рендерим все произошедшие со счетчиком ошибки за период времени */
  showErrors = errors => {
    const errorMessages = {
      "0001": "Превышение максимальной нагрузки на электросчетчике",
      "0002": "Превышение допустимого отклонения напряжения от нормы",
      "0003": "Превышение критической нагрузки на электросчетчике",
      "0004": "Счетчик сломан"
    }

    const switchErrorMessage = errorCode => {
      if (errorMessages[errorCode]) return errorMessages[errorCode]
      return "Неизвестная ошибка"
    }

    return errors.map(error => (
      <li key={error.from + error.to + error.type}>
        C {moment(error.from).format("DD.MM.YYYY HH:mm")} до{" "}
        {moment(error.to).format("DD.MM.YYYY HH:mm")} -{" "}
        {switchErrorMessage(error.type)}
      </li>
    ))
  }

  /* Рендерим график потребленной электроэнергии */
  renderEnergyChart = (chart, subtitle) => {
    const { energyData, errors, errorsData } = chart

    const series = [
      {
        name: "Потребление",
        color: theme.chartLineDark,
        data: energyData
      }
    ]

    const finalConfig = {
      ...options,
      ...energyOptions,
      title: { text: "График потребленной электроэнергии" },
      xAxis: { ...options.xAxis, plotBands: errorsData },
      subtitle: { text: subtitle },
      series,
      tooltip: {
        ...options.tooltip,
        ...energyOptions.tooltip
      }
    }

    return (
      <React.Fragment>
        <ReactHighcharts config={finalConfig} />

        {checkArrayLength(errors) && (
          <Container>
            <FormSubtitle>История ошибок</FormSubtitle>
            <Divider />
            <ErrorContainer>{this.showErrors(errors)}</ErrorContainer>
          </Container>
        )}
      </React.Fragment>
    )
  }

  /* Рендерим график нагрузки на электросчетчике */
  renderLoadChart = (chart, subtitle) => {
    const { currentData, critLoadData } = chart

    const series = [
      {
        name: "Критическая нагрузка",
        color: theme.chartLineRed,
        data: critLoadData
      },
      {
        name: "Нагрузка",
        color: theme.chartLineDark,
        data: currentData
      }
    ]

    const finalConfig = {
      ...options,
      ...loadOptions,
      title: { text: "График нагрузки на электросчетчике" },
      subtitle: { text: subtitle },
      series,
      tooltip: {
        ...options.tooltip,
        ...loadOptions.tooltip
      }
    }

    return <ReactHighcharts config={finalConfig} />
  }

  /* Рендерим график напряжения на электросчетчике */
  renderVoltageChart = (chart, subtitle) => {
    const { voltageData, minVoltageData, maxVoltageData } = chart

    const series = [
      {
        name: "Напряжение",
        color: theme.chartLineDark,
        data: voltageData
      },
      {
        name: "Минимальное напряжение",
        color: theme.chartLineRed,
        data: minVoltageData
      },
      {
        name: "Максимальное напряжение",
        color: theme.chartLineRed,
        data: maxVoltageData
      }
    ]

    const finalConfig = {
      ...options,
      ...voltageOptions,
      title: { text: "График напряжения на электросчетчике" },
      subtitle: { text: subtitle },
      series,
      tooltip: {
        ...options.tooltip,
        ...voltageOptions.tooltip
      }
    }

    return <ReactHighcharts config={finalConfig} />
  }

  render() {
    const {
      chart: { type },
      chartMeta: { numCounter, floor, title }
    } = this.props

    const propsSubtitle = `Счетчик №${numCounter}. Местонахождение: Этаж ${floor} ${title}`

    if (type === "energy")
      return this.renderEnergyChart(this.props.chart, propsSubtitle)
    if (type === "load")
      return this.renderLoadChart(this.props.chart, propsSubtitle)
    if (type === "voltage")
      return this.renderVoltageChart(this.props.chart, propsSubtitle)
    return null
  }
}

export default connect(state => ({
  chart: chartSelector(state),
  chartMeta: chartMetaSelector(state)
}))(ChartModal)
