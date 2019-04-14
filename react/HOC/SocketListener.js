import { Component } from "react"

/**
 * @name SocketListener
 *
 * @desc При рендере модуля с подключением по вебсокету -
 *       с таймаутом в 10с. подключается к серверу.
 *       При переходе в другой модуль - отключается от сервера с таймаутом в 12с.
 */
export default class SocketListener extends Component {
  componentDidMount = () => {
    setTimeout(() => {
      this.props.subscribe()
    }, 10000)
  }

  componentWillUnmount = () => {
    setTimeout(() => {
      this.props.unsubscribe()
    }, 12000)
  }

  render() {
    return null
  }
}
