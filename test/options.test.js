const Manager = require('../src')()
const AccessControl = require('accesscontrol')
const RulesMock = require('./mocks/rules')

const acl = new AccessControl(RulesMock)

describe('Options', () => {
  test('Fail if Insufficient options are provided', async () => {
    await expect(
      Manager.read({
        acl: acl.can('guest'),
        resource: 'Movie',
        user: {},
        isOwnerFunc: () => true,
      }),
    ).rejects.toThrow('Insufficient options')
  })
})
