module.exports = function (data, options, permissions) {
  const { operation } = options
  const Action = options[operation + 'Func']

  async function run(entry) {
    const { isOwner, permissionType, data } = entry

    const meta = { isOwner, ...options }
    const permission = permissionType && permissions.current[permissionType]

    switch (operation) {
      case 'create':
        return Action(permission && permission.filter(data), meta)
      case 'read':
        return data
      case 'update':
        return Action(data, permission && permission.filter(options.data), meta)
      case 'delete':
        return Action(data, meta)
    }

    if (operation === 'create') return Action(permission && permission.filter(data), meta)
    if (operation === 'read') return data
    if (operation === 'update') return Action(data, permission && permission.filter(options.data), meta)
    if (operation === 'delete') return Action(data, meta)
  }

  if (data instanceof Array)
    return Promise.all(
      data.map(entry => {
        if (!entry) return
        return run(entry).then(result => {
          entry.data = result
          return entry
        })
      }),
    )

  return run(data).then(result => {
    data.data = result
    return data
  })
}
