import moment from "moment"
import { createSelector } from "reselect"
import SockJS from "sockjs-client"
import { ELECTRO_HOST } from "../../config"
import { FAIL, SUCCESS } from "../../middlewares/apiMiddleware"
import { checkArrayLength, createNotification } from "../../utils"
import {
  checkChartData,
  transformChartData,
  sortCounters
} from "../../utils/reduxHelpers"

/* Constants */

const moduleName = "electro"

export const LOAD_HISTORY_DATE = `${moduleName}/LOAD_HISTORY_DATE`
export const LOAD_ALL_COUNTERS = `${moduleName}/LOAD_ALL_COUNTERS`
export const UPDATE_COUNTERS = `${moduleName}/UPDATE_COUNTERS`
export const DOWNLOAD_REPORT = `${moduleName}/DOWNLOAD_REPORT`
export const UPDATE_CRIT_LOAD = `${moduleName}/UPDATE_CRIT_LOAD`
export const UPDATE_KW_DEVIATION = `${moduleName}/UPDATE_KW_DEVIATION`
export const LOAD_CHART = `${moduleName}/LOAD_CHART`
export const SWITCH_MODE = `${moduleName}/SWITCH_MODE`
export const CLEAR_NOTIFICATION = `${moduleName}/CLEAR_NOTIFICATION`
export const CLEAR_CHART_CALL = `${moduleName}/CLEAR_CHART_CALL`
export const CLEAR_REPORT = `${moduleName}/CLEAR_REPORT`

let socket

/* Initial State */

/**
 * @param {Object}  chart - объект данных для построения графика
 * @param {Boolean} chart.called - вызван ли модальник графика (используется для вызова модального окна при первоначальной загрузке данных)
 * @param {Object}  chart.data -  данные графика (тип графика, массив данных, массив ошибок)
 * @param {Boolean} chart.exists - загружены ли данные для графика
 * @param {Object}  chart.meta - данные о названии графика и местоположении счетчика для отрисовки шапки графика
 *
 * @param {Array}   counters - массив счетчиков (актуальные данные)
 *
 * @param {Object}  countersHistory - объект исторических данных по счетчикам
 * @param {Array}   countersHistory.data - массив данных по счетчикам (структура как в counters)
 * @param {Boolean} countersHistory.loaded - загружены ли какие-либо исторические данные
 * @param {String}  countersHistory.time - дата исторических данных
 *
 * @param {String}  currentDate - текущая дата
 *
 * @param {Boolean} initialError - true если произошла ошибка при загрузке инициализационных данных
 *
 * @param {String}  lastUpdate - Время последних загруженных данных (записывается при инициализации и вебсокетом).
 *                              Используется для отображения уведомления о потере связи с сервером
 *
 * @param {Object}  loading - объект состояний загрузки
 * @param {Boolean} loading.chart - состояние загрузки при запросе данных графика
 * @param {Boolean} loading.history - состояние загрузки при запросе исторических данных
 * @param {Boolean} loading.initial - состояние загрузки при инициализации приложения
 * @param {Boolean} loading.report - состояние загрузки при запросе отчета
 *
 * @param {String}  mode - текущий режим отображения данных с счетчиков - актуальные или исторические
 *
 * @param {Object}  notification - объект для отображения уведомлений
 *
 * @param {String}  report - сюда записывается отчет, после скачивания поле обнуляется
 */
export const initialState = {
  chart: {
    called: true,
    data: {},
    exists: false,
    meta: {}
  },
  counters: [],
  countersHistory: {
    data: [],
    loaded: false,
    time: null
  },
  currentDate: moment(),
  initialError: false,
  lastUpdate: moment().startOf("minute"),
  loading: {
    chart: false,
    history: false,
    initial: false,
    report: false
  },
  mode: "actual",
  notification: {},
  report: null
}

/* Reducer */

export default function reducer(state = initialState, action) {
  const { type, data, payload, response } = action

  switch (type) {
    case LOAD_HISTORY_DATE:
      return {
        ...state,
        loading: {
          ...state.loading,
          history: true
        },
        error: false
      }

    case LOAD_HISTORY_DATE + SUCCESS:
      if (response && !checkArrayLength(response.payload)) {
        return {
          ...state,
          loading: {
            ...state.loading,
            history: false
          },
          notification: createNotification(
            "warning",
            "В базе недостаточно данных по выбранной дате"
          )
        }
      } else {
        return {
          ...state,
          loading: {
            ...state.loading,
            history: false
          },
          mode: "historical",
          countersHistory: {
            data: sortCounters(response.payload),
            loaded: true,
            time: data.date
          },
          notification: createNotification(
            "success",
            `Успешно загружены данные за ${moment(data.date).format(
              "DD.MM.YYYY"
            )}`
          )
        }
      }

    case LOAD_HISTORY_DATE + FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          history: false
        },
        error: true,
        notification: createNotification(
          "error",
          "При запросе данных произошла ошибка"
        )
      }

    case LOAD_ALL_COUNTERS:
      return {
        ...state,
        loading: {
          ...state.loading,
          initial: true
        }
      }

    case LOAD_ALL_COUNTERS + SUCCESS:
      return {
        ...state,
        counters: checkArrayLength(response.payload)
          ? sortCounters(response.payload)
          : [],
        loading: {
          ...state.loading,
          initial: false
        },
        lastUpdate: moment().startOf("minute"),
        initialError: false
      }

    case LOAD_ALL_COUNTERS + FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          initial: false
        },
        notification: createNotification(
          "error",
          "Не удалось загрузить данные электросчетчиков. Попробуйте позже"
        ),
        initialError: true
      }

    case UPDATE_CRIT_LOAD + SUCCESS:
      return {
        ...state,
        counters: state.counters.map(counter =>
          counter.rpId === action.data.rpId
            ? {
                ...counter,
                critLoad: {
                  ...counter.critLoad,
                  value: action.data.critValue
                }
              }
            : counter
        ),
        notification: createNotification(
          "success",
          "Критическая нагрузка обновлена"
        )
      }

    case UPDATE_CRIT_LOAD + FAIL:
      return {
        ...state,
        notification: createNotification(
          "error",
          "Не удалось обновить критическую нагрузку. Попробуйте позже"
        )
      }

    case UPDATE_KW_DEVIATION + SUCCESS:
      return {
        ...state,
        counters: state.counters.map(counter =>
          counter.rpId === action.data.rpId
            ? { ...counter, kwDeviation: action.data.kwValue }
            : counter
        ),
        notification: createNotification(
          "success",
          "Максимальное отклонение напряжения обновлено"
        )
      }

    case UPDATE_KW_DEVIATION + FAIL:
      return {
        ...state,
        notification: createNotification(
          "error",
          "Не удалось обновить максимальное отклонение напряжения. Попробуйте позже"
        )
      }

    case UPDATE_COUNTERS:
      return {
        ...state,
        counters: sortCounters(payload.payload),
        lastUpdate: moment().startOf("minute")
      }

    case LOAD_CHART:
      return {
        ...state,
        loading: {
          ...state.loading,
          chart: true
        }
      }

    case LOAD_CHART + SUCCESS:
      if (checkChartData(response)) {
        /* Рендерим график */
        return {
          ...state,
          chart: {
            ...state.chart,
            data: transformChartData(response),
            meta: action.meta,
            called: false,
            exists: true
          },
          loading: {
            ...state.loading,
            chart: false
          }
        }
      } else {
        /* Если в массиве нет данных - вызываем уведомление */
        return {
          ...state,
          loading: {
            ...state.loading,
            chart: false
          },
          notification: createNotification(
            "warning",
            "В базе недостаточно данных для построения графика"
          )
        }
      }

    case LOAD_CHART + FAIL:
      return {
        ...state,
        notification: createNotification(
          "error",
          "Не удалось запросить данные для построения графика. Попробуйте позже"
        ),
        loading: {
          ...state.loading,
          chart: false
        }
      }

    case DOWNLOAD_REPORT:
      return {
        ...state,
        loading: {
          ...state.loading,
          report: true
        }
      }

    case DOWNLOAD_REPORT + SUCCESS:
      return {
        ...state,
        report: response,
        loading: {
          ...state.loading,
          report: false
        }
      }

    case DOWNLOAD_REPORT + FAIL:
      return {
        ...state,
        notification: createNotification(
          "error",
          "Не удалось выполнить запрос. Попробуйте позже"
        ),
        loading: {
          ...state.loading,
          report: false
        }
      }

    case SWITCH_MODE:
      return {
        ...state,
        mode: data.mode
      }

    case CLEAR_NOTIFICATION:
      return {
        ...state,
        notification: {}
      }

    case CLEAR_CHART_CALL:
      return {
        ...state,
        chart: { ...state.chart, called: true }
      }

    case CLEAR_REPORT:
      return {
        ...state,
        report: false
      }

    default:
      return state
  }
}

/* Selectors */

const stateSelector = state => state[moduleName]

export const chartSelector = createSelector(
  stateSelector,
  state => state.chart.data
)

export const chartCalledSelector = createSelector(
  stateSelector,
  state => state.chart.called
)

export const chartExistsSelector = createSelector(
  stateSelector,
  state => state.chart.exists
)

export const chartMetaSelector = createSelector(
  stateSelector,
  state => state.chart.meta
)

export const countersHistorySelector = createSelector(
  stateSelector,
  state => state.countersHistory
)

export const currentDateSelector = createSelector(
  stateSelector,
  state => state.currentDate
)

export const errorSelector = createSelector(
  stateSelector,
  state => state.error
)

export const initialErrorSelector = createSelector(
  stateSelector,
  state => state.initialError
)

export const lastUpdateSelector = createSelector(
  stateSelector,
  state => state.lastUpdate
)

export const loadingChartSelector = createSelector(
  stateSelector,
  state => state.loading.chart
)

export const loadingHistorySelector = createSelector(
  stateSelector,
  state => state.loading.history
)

export const loadingInitialSelector = createSelector(
  stateSelector,
  state => state.loading.initial
)

export const loadingReportSelector = createSelector(
  stateSelector,
  state => state.loading.report
)

export const modeSelector = createSelector(
  stateSelector,
  state => state.mode
)

export const countersSelector = createSelector(
  [stateSelector, modeSelector],
  (state, mode) =>
    mode === "actual" ? state.counters : state.countersHistory.data
)

export const notificationSelector = createSelector(
  stateSelector,
  state => state.notification
)

export const reportSelector = createSelector(
  stateSelector,
  state => state.report
)

/* Action Creators */

/** 
  @name subscribeCounters
  @websocket

  @desc Подключается и обрабатывает сообщения с вебсокета.
*/
export const subscribeCounters = () => dispatch => {
  socket = new SockJS(ELECTRO_HOST + "electro/stream")

  socket.onopen = function(e) {
    console.log("[Electro Web Socket] Open", e)
    socket.send(JSON.stringify({ type: "join", data: "handshaking" }))
  }

  socket.onmessage = function(e) {
    console.log("[Electro Web Socket] New Message", e)
    dispatch({
      type: UPDATE_COUNTERS,
      payload: JSON.parse(e.data)
    })
  }

  socket.onerror = function(err) {
    console.log("[Electro Web Socket] Error", err)
  }

  socket.onclose = function(e) {
    console.log("[Electro Web Socket] Close", e)
  }
}

/** 
  @name unsubscribeCounters
  @websocket

  @desc Если есть подключение через вебсокет - отключает его.
*/
export const unsubscribeCounters = () => dispatch => {
  socket && socket.close()
}

/** 
  @name loadAllCounters
  @async

  @desc Делает инициализационный запрос за данными счетчиков.
*/
export const loadAllCounters = () => ({
  type: LOAD_ALL_COUNTERS,
  $api: {
    url: `${ELECTRO_HOST}electro/initialize`
  }
})

/** 
  @name loadHistoryDate
  @async

  @desc Делает запрос за историческими данными.

  @param {Number} date - Дата, для которой необходимо запросить данные.
*/
export const loadHistoryDate = date => ({
  type: LOAD_HISTORY_DATE,

  $api: {
    url: `${ELECTRO_HOST}electro/history?date=${Number(
      moment(date).format("x")
    )}`
  },
  data: { date }
})

/** 
  @name updateCritLoad
  @async

  @desc Делает запрос с обновлением значения критической нагрузки на определенном счетчике.

  @param {Number} rpId - ID Raspberry Pi, подключенной к счетчику.
  @param {Number} critValue - Новое значение критической нагрузки.
*/
export const updateCritLoad = (rpId, critValue) => ({
  type: UPDATE_CRIT_LOAD,
  $api: {
    url: `${ELECTRO_HOST}electro/updateCritLoad/${rpId}?critValue=${critValue}`,
    options: {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  },
  data: {
    rpId,
    critValue
  }
})

/** 
  @name updatekwDeviation
  @async

  @desc Делает запрос с обновлением значения максимального отклонения напряжения на определенном счетчике.

  @param {Number} rpId - ID Raspberry Pi, подключенной к счетчику.
  @param {Number} kwValue - Новое значение отклонения напряжения.
*/
export const updatekwDeviation = (rpId, kwValue) => ({
  type: UPDATE_KW_DEVIATION,
  $api: {
    url: `${ELECTRO_HOST}electro/kwDeviation/${rpId}?kwValue=${kwValue}`,
    options: {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  },
  data: {
    rpId,
    kwValue
  }
})

/** 
  @name downloadReport
  @async

  @desc Делает запрос за Excel отчетом.

  @param {String} params - Параметры для составления отчета.
*/
export const downloadReport = params => ({
  type: DOWNLOAD_REPORT,
  $api: {
    url: `${ELECTRO_HOST}electro/report/${params}`,
    responseType: "blob"
  }
})

/** 
  @name loadChart
  @async

  @desc Делает запрос за данными для построения графиков.

  @param {Object} obj - Объект аргументов.
  @param {String} obj.type - Тип графика (напряжение, потребление, нагрузка).
  @param {Number} obj.rpId - ID Raspberry Pi, подключенной к счетчику.
  @param {Number} obj.from - Дата/время начала данных построения графика(Timestamp).
  @param {Number} obj.to - Дата/время окончания данных построения графика(Timestamp).
  @param {Number} obj.interval - Интервал отображения данных(1 минута, 10 минут, 60 минут, 24 часа).
  @param {Object} obj.meta - Данные о помещении, прокидываемые дальше для отображения названия помещения, номера счетчика и этажа.
*/
export const loadChart = ({ type, rpId, from, to, interval, meta }) => ({
  type: LOAD_CHART,
  $api: {
    url: `${ELECTRO_HOST}electro/chart/${type}?rpId=${rpId}&from=${from}&to=${to}&interval=${interval}`
  },
  meta
})

/** 
  @name switchMode

  @desc Изменяет режим просмотра данных(исторические/актуальные)
*/
export const switchMode = mode => ({
  type: SWITCH_MODE,
  data: {
    mode
  }
})

/** 
  @name clearChartCall

  @desc Модальные окна вызываются через изменение redux store, поэтому чтобы при любом изменении пропсов не открывались модальные окна, после первого вызова переменная вызова обнуляется.
*/
export const clearChartCall = () => ({
  type: CLEAR_CHART_CALL
})

/** 
  @name clearNotification

  @desc Уведомления вызываются через изменение redux store, поэтому чтобы при любом изменении пропсов не открывались уведомления, после первого вызова переменная вызова обнуляется.
*/
export const clearNotification = () => ({
  type: CLEAR_NOTIFICATION
})

/** 
  @name clearReport

  @desc Загрузка файла отчета вызывается через изменение redux store, поэтому чтобы при любом изменении пропсов не загружался файл, после первого вызова переменная вызова обнуляется.
*/
export const clearReport = () => ({
  type: CLEAR_REPORT
})
