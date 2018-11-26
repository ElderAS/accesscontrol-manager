const MoviesMock = require('./mocks/entries/movies')
const Manager = require('../src')()
const AccessControl = require('accesscontrol')
const RulesMock = require('./mocks/rules')
const UserMock = require('./mocks/entries/user')
const Clone = require('./clone')
const acl = new AccessControl(RulesMock)

describe('Create', () => {
  test('Guest cannot create', async () => {
    await expect(
      Manager.create({
        acl: acl.can('guest'),
        resource: 'Movie',
        user: {},
        data: Clone(MoviesMock[0]),
        createFunc: () => Clone(MoviesMock[0]),
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).rejects.toThrow('No access')
  })

  test('Owner can create own but not set "isVerified"', async () => {
    let { isVerified, ...expected } = Clone(MoviesMock[1])
    expect(
      await Manager.create({
        acl: acl.can('owner'),
        resource: 'Movie',
        user: UserMock,
        data: Clone(MoviesMock[1]),
        createFunc: data => {
          return data
        },
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).toMatchObject(expected)
  })

  test('Owner can create any but not set "isVerified" and not read "createdAt"', async () => {
    let { isVerified, createdAt, ...expected } = Clone(MoviesMock[0])
    expect(
      await Manager.create({
        acl: acl.can('owner'),
        resource: 'Movie',
        user: UserMock,
        data: Clone(MoviesMock[0]),
        createFunc: data => {
          return data
        },
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).toMatchObject(expected)
  })

  test('Admin can create any', async () => {
    expect(
      await Manager.create({
        acl: acl.can('admin'),
        resource: 'Movie',
        user: {},
        data: Clone(MoviesMock[0]),
        createFunc: data => data,
        isOwnerFunc(doc, user) {
          return true
        },
      }),
    ).toMatchObject(Clone(MoviesMock[0]))
  })
})
