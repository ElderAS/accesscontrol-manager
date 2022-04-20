module.exports = async function (options = {}) {
  const { preQueryFunc = v => v, operation, data, query } = options

  try {
    switch (operation) {
      case 'create':
        return data
      default:
        return preQueryFunc(query())
    }
  } catch (err) {
    throw err
  }
}
