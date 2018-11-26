function Entry(data, options = {}) {
  Entry.prototype.isOwner = options.isOwner
  Object.assign(this, data)

  return this
}

module.exports = Entry
