import moment from "moment"
import { createSelector } from "reselect"
import SockJS from "sockjs-client"
import { LIGHT_HOST } from "../../config"
import { FAIL, SUCCESS } from "../../middlewares/apiMiddleware"
import { createNotification } from "../../utils"
import { transform, transformRoomsData } from "../../utils/reduxHelpers"

/* Constants */

const moduleName = "light"

export const LOAD_ALL_FLOORS = `${moduleName}/LOAD_ALL_FLOORS`
export const CHANGE_ENERGY_MODE = `${moduleName}/CHANGE_ENERGY_MODE`
export const CHANGE_FLOOR = `${moduleName}/CHANGE_FLOOR`
export const SELECT_ROOM = `${moduleName}/SELECT_ROOM`
export const FLUSH_ROOM = `${moduleName}/FLUSH_ROOM`
export const CALCULATE_MAP_OFFSETS = `${moduleName}/CALCULATE_MAP_OFFSETS`
export const CHANGE_STATE_LIGHT_ROOM = `${moduleName}/CHANGE_STATE_LIGHT_ROOM`
export const CHANGE_STATE_FLOOR = `${moduleName}/CHANGE_STATE_FLOOR`
export const GET_LIGHT_IN_ROOMS = `${moduleName}/GET_LIGHT_IN_ROOMS`
export const UPDATE_LIGHT_IN_ROOMS = `${moduleName}/UPDATE_LIGHT_IN_ROOMS`
export const CLEAR_NOTIFICATION = `${moduleName}/CLEAR_NOTIFICATION`

let socket

/* Initial State */

/**
 * @param {Array}  bboxes - массив данных для отрисовки комнат поверх карты
 *
 * @param {Number}  currentFloor - выбранный в меню этаж
 *
 * @param {Array}  floors - массив этажей, внутри этажа данные о помещениях
 *
 * @param {Boolean} initialError - true если произошла ошибка при загрузке инициализационных данных
 *
 * @param {String}  lastUpdate - Время последних загруженных данных (записывается при инициализации и вебсокетом).
 *                              Используется для отображения уведомления о потере связи с сервером
 *
 * @param {Object} lightInRooms - Данные по комнатам
 *
 * @param {Boolean} lightState
 *
 * @param {Object}  loading - объект состояний загрузки
 * @param {Boolean} loading.energySaving - состояние загрузки при изменении режима энергосбережения / рабочего
 * @param {Boolean} loading.initialFloors - состояние загрузки при инициализации приложения, загрузка данных по этажам (карты, помещения)
 * @param {Boolean} loading.initialLight - состояние загрузки при инициализации приложения, загрузка данных по освещению в помещениях
 * @param {Boolean} loading.lightFloor - состояние загрузки при переключении света на этаже
 * @param {Boolean} loading.lightSwitch - состояние загрузки при переключении света
 *
 * @param {String} mode - Рабочий / энергосберегающий режим (working / saving)
 *
 * @param {Object}  notification - объект для отображения уведомлений
 *
 * @param {Number} selectedRoom - Выбранная комната для отображения в меню
 */

export const initialState = {
  bboxes: [],
  currentFloor: null,
  floors: [],
  initialError: false,
  lastUpdate: moment().startOf("minute"),
  lightInRooms: {},
  lightState: true,
  loading: {
    energySaving: false,
    initialFloors: true,
    initialLight: true,
    lightFloor: false,
    lightSwitch: false
  },
  mode: null,
  notification: {},
  selectedRoom: null
}

/* Reducer */

export default function reducer(state = initialState, action) {
  const { type, payload, response } = action

  switch (type) {
    case LOAD_ALL_FLOORS:
      return {
        ...state,
        loading: {
          ...state.loading,
          initialFloors: true
        }
      }

    case LOAD_ALL_FLOORS + SUCCESS:
      let floors = response.sort((a, b) => a.floor - b.floor)

      return {
        ...state,
        floors,
        currentFloor: floors[0] && floors[0].floor,
        loading: {
          ...state.loading,
          initialFloors: false
        },
        initialError: false
      }

    case LOAD_ALL_FLOORS + FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          initialFloors: false
        },
        notification: createNotification("error", "Не удалось получить данные"),
        initialError: true
      }

    case CHANGE_ENERGY_MODE:
      return {
        ...state,
        loading: {
          ...state.loading,
          energySaving: true
        }
      }
    case CHANGE_ENERGY_MODE + SUCCESS:
      const { data, mode } = response

      return {
        ...state,
        loading: {
          ...state.loading,
          energySaving: false
        },
        mode,
        lightInRooms: transformRoomsData(state, data)
      }
    case CHANGE_ENERGY_MODE + FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          energySaving: false
        },
        notification: createNotification(
          "error",
          "Не удалось изменить режим работы освещения"
        )
      }

    case GET_LIGHT_IN_ROOMS:
      return {
        ...state,
        loading: {
          ...state.loading,
          initialLight: true
        }
      }

    case GET_LIGHT_IN_ROOMS + SUCCESS:
      return {
        ...state,
        lastUpdate: moment().startOf("minute"),
        lightInRooms: transform(response.roomsData),
        mode: response.lightMode,
        loading: {
          ...state.loading,
          initialLight: false
        },
        initialError: false
      }

    case GET_LIGHT_IN_ROOMS + FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          initialLight: false
        },
        notification: createNotification(
          "error",
          "Не удалось получить данные о включенном свете"
        ),
        initialError: true
      }

    case UPDATE_LIGHT_IN_ROOMS:
      const { roomsData, lightMode } = payload

      return {
        ...state,
        lastUpdate: moment().startOf("minute"),
        lightInRooms: transformRoomsData(state, roomsData),
        mode: lightMode ? lightMode : state.mode
      }

    case CHANGE_STATE_LIGHT_ROOM:
      return {
        ...state,
        loading: {
          ...state.loading,
          lightSwitch: true
        }
      }

    case CHANGE_STATE_LIGHT_ROOM + SUCCESS:
      return {
        ...state,
        lightInRooms: {
          ...state.lightInRooms,
          [response.rpId]: {
            ...state.lightInRooms[response.rpId],
            state: response.state
          }
        },
        loading: {
          ...state.loading,
          lightSwitch: false
        }
      }

    case CHANGE_STATE_LIGHT_ROOM + FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          lightSwitch: false
        },
        notification: createNotification(
          "error",
          "Произошла ошибка при переключении света в комнате"
        )
      }

    case CHANGE_STATE_FLOOR: {
      return {
        ...state,
        loading: {
          ...state.loading,
          lightFloor: true
        }
      }
    }

    case CHANGE_STATE_FLOOR + SUCCESS: {
      return {
        ...state,
        lightInRooms: transformRoomsData(state, response.data),
        loading: {
          ...state.loading,
          lightFloor: false
        }
      }
    }

    case CHANGE_STATE_FLOOR + FAIL: {
      return {
        ...state,
        loading: {
          ...state.loading,
          lightFloor: false
        },
        notification: createNotification(
          "error",
          "Произошла ошибка при переключении света на этаже"
        )
      }
    }

    case SELECT_ROOM:
      return {
        ...state,
        selectedRoom: payload.rpId
      }

    case FLUSH_ROOM:
      return {
        ...state,
        selectedRoom: payload
      }

    case CHANGE_FLOOR:
      return {
        ...state,
        currentFloor: payload.floorNumber,
        selectedRoom: null,
        bboxes: []
      }

    case CALCULATE_MAP_OFFSETS:
      return {
        ...state,
        bboxes: payload
      }

    case CLEAR_NOTIFICATION:
      return {
        ...state,
        notification: {}
      }

    default:
      return state
  }
}

/* Selectors */

const stateSelector = state => state[moduleName]

export const bboxesSelector = createSelector(
  stateSelector,
  state => state.bboxes
)

export const currentFloorSelector = createSelector(
  stateSelector,
  state => state.currentFloor
)

export const floorsSelector = createSelector(
  stateSelector,
  state => state.floors
)

export const floorSelector = createSelector(
  [floorsSelector, currentFloorSelector],
  (floors, currentFloor) =>
    floors.find(floor => floor.floor === currentFloor) || {}
)

export const initialErrorSelector = createSelector(
  stateSelector,
  state => state.initialError
)

export const lastUpdateSelector = createSelector(
  stateSelector,
  state => state.lastUpdate
)

export const lightInRoomsSelector = createSelector(
  stateSelector,
  state => state.lightInRooms
)

export const loadingEnergySavingSelector = createSelector(
  stateSelector,
  state => state.loading.energySaving
)

export const loadingInitialSelector = createSelector(
  stateSelector,
  state => state.loading.initialFloors + state.loading.initialLight
)

export const loadingLightFloorSwitchSelector = createSelector(
  stateSelector,
  state => state.loading.lightFloor
)

export const loadingLightRoomSwitchSelector = createSelector(
  stateSelector,
  state => state.loading.lightSwitch
)

export const modeSelector = createSelector(stateSelector, state => state.mode)

export const notificationSelector = createSelector(
  stateSelector,
  state => state.notification
)

export const selectedRoomSelector = createSelector(
  stateSelector,
  state => state.selectedRoom
)

export const roomDataSelector = createSelector(
  [floorSelector, selectedRoomSelector],
  (floor, selectedRoom) =>
    floor && floor.rooms.find(room => room.rpId === selectedRoom)
)

export const roomTitleSelector = createSelector(
  roomDataSelector,
  room => room && room.title
)

export const lightInRoomSelector = createSelector(
  [roomDataSelector, lightInRoomsSelector, selectedRoomSelector],
  (room, lightInRooms, selectedRoom) => room && lightInRooms[selectedRoom]
)

export const areAllRoomsOnTheFloorActiveSelector = createSelector(
  [floorSelector, lightInRoomsSelector],
  (floor, lightInRooms) =>
    ((floor.rooms || []).map(item => item.rpId) || []).every(
      rpId => lightInRooms[rpId] && lightInRooms[rpId].state === 1
    )
)

/* Action Creators */

/** 
  @name subscribeRooms
  @websocket

  @desc Подключается и обрабатывает сообщения с вебсокета.
*/
export const subscribeRooms = () => dispatch => {
  socket = new SockJS(LIGHT_HOST + "light/stream")

  socket.onopen = function(e) {
    console.log("[Light Web Socket] Open", e)
    socket.send(JSON.stringify({ type: "join", data: "handshaking" }))
  }

  socket.onmessage = function(e) {
    console.log("[Light Web Socket] New Message", e)
    dispatch({
      type: UPDATE_LIGHT_IN_ROOMS,
      payload: JSON.parse(e.data)
    })
  }

  socket.onerror = function(err) {
    console.log("[Light Web Socket] Error", err)
  }

  socket.onclose = function(e) {
    console.log("[Light Web Socket] Close", e)
  }
}

/** 
  @name unsubscribeRooms
  @websocket

  @desc Если есть подключение через вебсокет - отключает его.
*/
export const unsubscribeRooms = () => dispatch => {
  socket && socket.close()
}

/** 
  @name changeStateLightRoom
  @async
  
  @desc Делает запрос на включение/выключение света в комнате.

  @param {Boolean} lightState - Состояние света в комнате (вкл/выкл).
  @param {Number} rpId - ID Raspberry Pi, относящейся в комнате.
*/
export const changeStateLightRoom = (lightState, rpId) => ({
  type: CHANGE_STATE_LIGHT_ROOM,
  $api: {
    url: `${LIGHT_HOST}state/switch?rpId=${rpId}&state=${lightState}`
  }
})

/** 
  @name changeEnergyMode
  @async
  
  @desc Делает запрос на включение/выключение энергосберегающего режима в здании.

  @param {String} mode - Режим (working / saving)
*/
export const changeEnergyMode = mode => ({
  type: CHANGE_ENERGY_MODE,
  $api: {
    url: `${LIGHT_HOST}mode/switch`,
    options: {
      method: "PUT",
      body: mode,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    }
  },
  payload: { mode }
})

/** 
  @name loadAllFloors
  @async
  
  @desc Делает инициализационный запрос о помещениях, находящихся на этаже и их svgPath для отрисовки. 
*/
export const loadAllFloors = () => ({
  type: LOAD_ALL_FLOORS,
  $api: {
    url: `${LIGHT_HOST}roomsInfo`
  }
})

/** 
  @name getLightInRooms
  @async
  
  @desc Делает инициализационный запрос о текущем состоянии света в помещениях.
*/
export const getLightInRooms = () => ({
  type: GET_LIGHT_IN_ROOMS,
  $api: {
    url: `${LIGHT_HOST}light/system`
  }
})

/** 
  @name changeStateFloor
  @async
  
  @desc Делает запрос на включение/выключение света на этаже. После возврата 200 статуса с сервера вызывает action creator, выключающий все комнаты на этаже в приложении.

  @param {String} lightState - Состояние света(включить/выключить).
  @param {Number} floorNumber - Номер этажа.
*/
export const changeStateFloor = (lightState, floorNumber) => ({
  type: CHANGE_STATE_FLOOR,
  $api: {
    url: `${LIGHT_HOST}state/turn?floor=${floorNumber}&state=${lightState}`,
    options: {
      method: "PUT"
    }
  }
})

/** 
  @name changeFloor
  
  @desc Меняет отображаемый этаж.

  @param {Number} floorNumber - Номер этажа.
*/
export const changeFloor = floorNumber => ({
  type: CHANGE_FLOOR,
  payload: {
    floorNumber
  }
})

/** 
  @name selectRoom
  
  @desc Выбор комнаты для вызова данных в правом меню.

  @param {Number} rpId - ID Raspberry Pi, подключенной в помещении.
*/
export const selectRoom = rpId => ({
  type: SELECT_ROOM,
  payload: {
    rpId
  }
})

/** 
  @name calculateMapOffsets
  
  @desc Исходя из полученных с бэка данных составляет комнаты для дальнейшей отрисовки.

  @param {[{}]} data - Массив комнат(bboxes)
  @param {Number} data.object.width - Ширина svg комнаты
  @param {Number} data.object.height - Высота svg комнаты
  @param {Number} data.object.x - Смещение комнаты по карте горизонтально
  @param {Number} data.object.y - Смещение комнаты по карте вертикально
  @param {Number} data.object.rpId - ID Raspberry Pi, подключенной в помещении.
*/
export const calculateMapOffsets = data => ({
  type: CALCULATE_MAP_OFFSETS,
  payload: [...data]
})

/** 
  @name clearNotification

  @desc Уведомления вызываются через изменение redux store, поэтому чтобы при любом изменении пропсов не открывались уведомления, после первого вызова переменная вызова обнуляется.
*/
export const clearNotification = () => ({
  type: CLEAR_NOTIFICATION
})
