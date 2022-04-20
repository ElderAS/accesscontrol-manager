const Notation = require('notation')

module.exports = function (data, options = {}) {
  const { documentPath } = options

  if (!documentPath) return data
  let result = new Notation(data).get(documentPath)

  return result
}
