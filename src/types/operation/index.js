const Handlers = require('./handlers')
const Validate = require('./validate')
const getPermissions = require('./getPermissions')

function Operation(operation, operationOptions = {}) {
  return async function (options = {}) {
    options = Object.assign({ operation }, operationOptions, options)
    Validate(operation, options)

    let source = null

    const permissions = getPermissions(options)

    return Handlers.query(options)
      .then(data => {
        //Store source data from query
        if (operation !== 'create') source = data
        return data
      })
      .then(data => Handlers.extract(data, options))
      .then(data => Handlers.permission(data, options, permissions))
      .then(data => Handlers.action(data, options, permissions))
      .then(data => Handlers.filter(data, options, permissions, Handlers.extract(source, options)))
      .then(data => Handlers.apply(source, data, options))
  }
}

module.exports = Operation
