module.exports = function (options) {
  try {
    const { acl, resource, operation } = options

    const permissions = {
      read: {
        any: acl.readAny(resource),
        own: acl.readOwn(resource),
      },
      current: {
        any: acl[`${operation}Any`](resource),
        own: acl[`${operation}Own`](resource),
      },
    }

    /* Check for any/own permissions */
    if (!permissions.current.any.granted && !permissions.current.own.granted)
      throw new Error(`Access denied (${resource})`)

    return permissions
  } catch (err) {
    throw err
  }
}
