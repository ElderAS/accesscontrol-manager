const Entry = require('./entry')
const Notation = require('notation')

function Operation(operation, operationOptions = {}) {
  return function(options = {}) {
    options = Object.assign({}, operationOptions, options)
    if ((optionValidator = OptionValidator(operation, options))) return Promise.reject(optionValidator)
    let original = null

    let permissions = {
      read: { any: null, own: null },
      current: { any: null, own: null },
    }
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

    return performQuery({ operation, options })
      .then(data => {
        //Store original data from query
        original = data
        return data
      })
      .then(data => extractData({ data, options }))
      .then(data => findPermission({ data, options, permissions }))
      .then(data => {
        if (data instanceof Array) return data.filter(Boolean)
        if (!data) throw new Error('No access')
        return data
      })
      .then(data => performAction({ data, options, permissions, operation }))
      .then(data => filterResult({ data, options, permissions }))
      .then(data => applyData({ original, data, options }))
  }
}

function extractData({ data, options }) {
  if (!options.documentPath) return data
  return new Notation(data).get(options.documentPath)
}

function applyData({ original, data, options }) {
  if (!options.documentPath) return data
  new Notation(original).set(options.documentPath, data)

  return original
}

function findPermission({ data, options, permissions }) {
  return data instanceof Array ? Promise.all(data.map(checkPermission)) : checkPermission(data)

  async function checkPermission(entry) {
    if (entry && permissions.current.own.granted && (await options.isOwnerFunc(entry, options.user))) {
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

    if (!entry) {
      return {
        permissionType: null,
        isOwner: false,
        data: entry,
      }
    }

    return null
  }
}

function performAction({ data, options, permissions, operation }) {
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

  async function performActionSingle(entry) {
    let meta = { isOwner: entry.isOwner }
    let permission = entry.permissionType ? permissions.current[entry.permissionType] : null

    if (operation === 'create') return Action(permission && permission.filter(entry.data), meta)
    if (operation === 'read') return entry.data
    if (operation === 'update') return Action(entry.data, permission && permission.filter(options.data), meta)
    if (operation === 'delete') return Action(entry.data, meta)
  }
}

function performQuery({ operation, options }) {
  if (operation === 'create') return Promise.resolve(options.data)
  return Promise.resolve(options.query())
}

function filterResult({ data, options, permissions }) {
  let preTransformFunc = options.transformFunc || options.preTransformFunc || (val => val)
  let postTransformFunc = options.postTransformFunc || (val => val)

  if (data instanceof Array) return data.map(filterResultSingle)
  return filterResultSingle(data)

  function filterResultSingle(entry) {
    if (!entry.data) return null
    return new Entry(postTransformFunc(permissions.read[entry.permissionType].filter(preTransformFunc(entry.data))), {
      isOwner: entry.isOwner,
    })
  }
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

module.exports = Operation
