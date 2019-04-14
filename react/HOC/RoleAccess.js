import { Component } from "react"
import { connect } from "react-redux"
import { roleSelector } from "../../modules/auth"

class RoleAccess extends Component {
  checkAccess = () => {
    const { accessedRoles = [], role } = this.props
    /* Проверяем, есть ли роль пользователя в ролях, у которых есть доступ к модулю */
    return accessedRoles.some(
      accessedRole =>
        role && accessedRole.toLowerCase().trim() === role.toLowerCase().trim()
    )
  }

  render() {
    const { children } = this.props

    /* Если у пользователя есть доступ - рендерим компонент */
    if (this.checkAccess()) {
      return children
    }

    return null
  }
}

export default connect(state => ({
  role: roleSelector(state)
}))(RoleAccess)
