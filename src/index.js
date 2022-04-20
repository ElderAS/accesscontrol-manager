const Operation = require('./types/operation')

module.exports = function (options = {}) {
  return {
    create: Operation('create', options),
    read: Operation('read', options),
    update: Operation('update', options),
    delete: Operation('delete', options),
  }
}
