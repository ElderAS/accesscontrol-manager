module.exports = function (data, options, permissions) {
  const { user, resource } = options
  const { own, any } = permissions.current

  async function check(entry) {
    try {
      if (entry && own.granted && (await options.isOwnerFunc(entry, user, options)))
        return {
          permissionType: 'own',
          isOwner: true,
          data: entry,
        }

      if (any.granted)
        return {
          permissionType: 'any',
          isOwner: false,
          data: entry,
        }

      if (!entry)
        return {
          permissionType: null,
          isOwner: false,
          data: entry,
        }
    } catch (err) {
      return
    }
  }

  if (data instanceof Array) return Promise.all(data.map(check))

  return check(data).then(e => {
    if (!e) throw new Error(`Access denied (${resource})`)
    return e
  })
}
