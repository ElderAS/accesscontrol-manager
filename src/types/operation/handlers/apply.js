const Notation = require('notation')

module.exports = function (original, data, options) {
  const { documentPath } = options

  if (!documentPath) return data

  new Notation(original).set(documentPath, data)

  return original
}
