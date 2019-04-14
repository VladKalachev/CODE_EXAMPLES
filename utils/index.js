const fetch = require("node-fetch")

export const transformArrayToObject = array =>
  array.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {})

/**
 * @name getSafeValue
 * @desc Функция для получения значения объекта безопасно, чтобы при отсутствии поля в объекте не вылетала ошибка "Cannot read property of ..."
 *
 * @param {function} value - функция, возвращающая нужное значение
 * @param {any} defaultValue - значение, которое будет возвращено если value выдаст ошибку
 */
export const getSafeValue = (value, defaultValue = null) => {
  try {
    return value()
  } catch (err) {
    return defaultValue
  }
}

/**
 * @name checkArrayLength
 * @desc Функция для проверки является ли проверяемое значение массивом и проверяем есть ли в нем данные
 *
 * @param {any} array - проверяемое значение
 */
export const checkArrayLength = array =>
  Array.isArray(array) && array.length > 0

/* Принимает массив вида [[name, url]]. Возвращает объект с полями {name: data(полученная от url)} */
export const requestData = async array => {
  try {
    const labels = array.map(item => item[0])
    const urls = array.map(item => item[1])

    const fetchedData = await Promise.all(urls.map(url => fetch(url)))
    const parsedData = await Promise.all(fetchedData.map(item => item.json()))

    const data = parsedData
      .map((data, index) => ({
        id: labels[index],
        data
      }))
      .reduce((obj, item) => {
        obj[item.id] = item.data
        return obj
      }, {})

    return data
  } catch (err) {
    console.log(err)
    return undefined
  }
}
