import React, { PureComponent } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { loadingSelector, login, loginCheckAuth } from "../../modules/auth"
import {
  Button,
  Form as antdForm,
  Icon,
  Input
} from "../Layout/Styled Antd Components"

const CenteredButton = styled.div`
  display: flex;
  justify-content: center;

  & button {
    background-color: ${props => props.theme.primary};
    padding: 0 15px;
    min-width: 150px;
    border-radius: 15px;
    font-family: ${props => props.theme.fontSecondary};
    font-size: 16px;

    &:hover {
      background-color: ${props => props.theme.primaryDark};
    }

    &:focus {
      background-color: ${props => props.theme.primaryDark};
    }
  }
`

const Form = styled(antdForm)`
  &.ant-form {
    margin-left: 5px;
  }
`

const FormItem = styled(Form.Item)`
  & input {
    min-width: 220px;
    border-radius: 7px;
  }

  &.ant-form-item {
    &:nth-child(1) {
      margin-bottom: 25px;
    }
    &:nth-child(2) {
      margin-bottom: 35px;
    }
    &:nth-child(3) {
      margin-bottom: 15px;
    }
  }
`

class SignInForm extends PureComponent {
  componentDidMount = () => {
    window.addEventListener("keyup", this.handleKeyPress)
    if (localStorage.getItem("token")) {
      this.props.loginCheckAuth()
    }
  }

  componentWillUnmount = () => {
    window.removeEventListener("keyup", this.handleKeyPress)
  }

  handleKeyPress = e => {
    if (e.key === "Enter" || e.which === 13 || e.code === "Enter") {
      this.handleSubmit()
    }
  }

  handleSubmit = e => {
    if (e) e.preventDefault()
    const { form, login } = this.props
    form.validateFields((err, values) => !err && login(values))
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem>
          {getFieldDecorator("username", {
            rules: [{ required: true, message: "Введите логин" }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Логин"
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "Введите пароль" }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Пароль"
            />
          )}
        </FormItem>
        <FormItem>
          <CenteredButton>
            <Button
              loading={this.props.loading}
              type="primary"
              htmlType="submit"
            >
              Войти
            </Button>
          </CenteredButton>
        </FormItem>
      </Form>
    )
  }
}

const InitForm = Form.create()

export default connect(
  state => ({
    loading: loadingSelector(state)
  }),
  { loginCheckAuth, login }
)(InitForm(SignInForm))
