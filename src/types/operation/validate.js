const requiredOptions = {
  all: ['user', 'acl', 'resource', 'isOwnerFunc'],
  create: ['data', 'createFunc'],
  read: ['query'],
  update: ['query', 'data', 'updateFunc'],
  delete: ['query', 'deleteFunc'],
}

module.exports = function (operation, options) {
  const props = [...requiredOptions.all, ...requiredOptions[operation]]

  if (props.some(op => !(op in options))) throw new Error('Insufficient options - required: ' + JSON.stringify(props))
}
