const Entry = require('../../entry')

module.exports = function (data, options, permissions, source) {
  const { read } = permissions

  let preTransformFunc = options.transformFunc || options.preTransformFunc || (v => v)
  let postTransformFunc = options.postTransformFunc || (v => v)

  function filter(entry, index) {
    const { permissionType, data, isOwner } = entry
    if (!data) return null

    let pre = preTransformFunc(data, options)
    let filtered = read[permissionType].filter(pre)
    let result = postTransformFunc(filtered, options)

    return new Entry(result, {
      isOwner,
      source: source instanceof Array ? source[index] : source,
    })
  }

  return data instanceof Array ? data.map(filter).filter(Boolean) : filter(data)
}
