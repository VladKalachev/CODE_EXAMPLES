import React, { Component } from "react"
import ErrorPage from "../Layout/ErrorPage"
import { Loader } from "../Layout/Styled Components"

/**
 * @name LoadingWrapper
 *
 * @desc HOC для отслеживания загрузки при переходе между модулями.
 *       Если что-то не загрузилось при инициализации(initialError) рендерит страницу ошибки.
 *       Если есть загрузка - возвращает лоадер.
 *       Т.к. на локалке большая часть запросов выполняется быстро - делаем небольшой таймаут, чтобы пользователь насладился лоадером :)
 */
export default class LoadingWrapper extends Component {
  state = {
    loading: true,
    error: false
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.error !== this.props.error) {
      this.timeout = setTimeout(() => {
        this.setState({ error: this.props.error })
      }, this.props.delay || 450)
    }
    if (prevProps.loading !== this.props.loading) {
      this.timeout = setTimeout(() => {
        this.setState({ loading: this.props.loading })
      }, this.props.delay || 450)
    }
  }

  componentWillUnmount = () => {
    clearTimeout(this.timeout)
  }

  render() {
    const { component: Component } = this.props

    if (this.state.error) return <ErrorPage />

    if (this.state.loading) return <Loader />

    return Component
  }
}
