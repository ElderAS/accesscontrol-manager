const Entry = require('./entry')
const Notation = require('notation')

function Operation(operation, operationOptions = {}) {
  let permissions = {
    read: { any: null, own: null },
    current: { any: null, own: null },
  }

  return function(options) {
    Object.assign(options, operationOptions)
    if ((optionValidator = OptionValidator(operation, options))) return Promise.reject(optionValidator)
    let original = null

    /* Set all permission functions */
    try {
      permissions.read.any = options.acl.readAny(options.resource)
      permissions.read.own = options.acl.readOwn(options.resource)
      permissions.current.any = options.acl[operation + 'Any'](options.resource)
      permissions.current.own = options.acl[operation + 'Own'](options.resource)
    } catch (e) {
      return Promise.reject(e)
    }

    /* Check for any/own permissions */
    if (!permissions.current.any.granted && !permissions.current.own.granted)
      return Promise.reject(new Error('No access'))

    return performQuery(operation, options)
      .then(data => {
        //Store original data from query
        original = data
        return data
      })
      .then(data => extractData(data, options))
      .then(data => findPermission(data, options))
      .then(data => {
        if (data instanceof Array) return data.filter(Boolean)
        if (!data) throw new Error('No access')
        return data
      })
      .then(data => performAction(data, options))
      .then(data => filterResult(data))
      .then(data => applyData(original, data, options))
  }

  function extractData(data, options) {
    if (!options.documentPath) return data
    return new Notation(data).get(options.documentPath)
  }

  function applyData(original, data, options) {
    if (!options.documentPath) return data
    new Notation(original).set(options.documentPath, data)

    return original
  }

  function findPermission(data, options) {
    return data instanceof Array ? Promise.all(data.map(checkPermission)) : checkPermission(data)

    async function checkPermission(entry) {
      if (permissions.current.own.granted && (await options.isOwnerFunc(entry, options.user))) {
        return {
          permissionType: 'own',
          isOwner: true,
          data: entry,
        }
      }

      if (permissions.current.any.granted) {
        return {
          permissionType: 'any',
          isOwner: false,
          data: entry,
        }
      }

      return null
    }
  }

  function performAction(data, options) {
    let Action = options[operation + 'Func']

    return data instanceof Array
      ? Promise.all(
          data.map(entry =>
            performActionSingle(entry).then(result => {
              entry.data = result
              return entry
            }),
          ),
        )
      : performActionSingle(data).then(result => {
          data.data = result
          return data
        })

    function performActionSingle(entry) {
      let result
      let meta = { isOwner: entry.isOwner }
      if (operation === 'create') result = Action(permissions.current[entry.permissionType].filter(entry.data), meta)
      if (operation === 'read') result = entry.data
      if (operation === 'update')
        result = Action(entry.data, permissions.current[entry.permissionType].filter(options.data), meta)
      if (operation === 'delete') result = Action(entry.data, meta)

      return Promise.resolve(result)
    }
  }

  function performQuery(operation, options) {
    if (operation === 'create') return Promise.resolve(options.data)
    return Promise.resolve(options.query())
  }

  function filterResult(data) {
    return data instanceof Array
      ? data.map(
          entry => new Entry(permissions.read[entry.permissionType].filter(entry.data), { isOwner: entry.isOwner }),
        )
      : new Entry(permissions.read[data.permissionType].filter(data.data), { isOwner: data.isOwner })
  }

  function OptionValidator(operation, options) {
    let requiredOptions = {
      all: ['user', 'acl', 'resource', 'isOwnerFunc'],
      create: ['data', 'createFunc'],
      read: ['query'],
      update: ['query', 'data', 'updateFunc'],
      delete: ['query', 'deleteFunc'],
    }

    let props = [...requiredOptions.all, ...requiredOptions[operation]]
    if (
      props.some(op => {
        return !(op in options)
      })
    )
      return new Error('Insufficient options - required: ' + JSON.stringify(props))
    return
  }
}

module.exports = Operation
