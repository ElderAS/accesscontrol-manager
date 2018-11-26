const MoviesMock = require('./mocks/entries/movies')
const Manager = require('../src')()
const AccessControl = require('accesscontrol')
const RulesMock = require('./mocks/rules')
const UserMock = require('./mocks/entries/user')

const acl = new AccessControl(RulesMock)

describe('Delete', () => {
  test('Guest cannot delete', async () => {
    await expect(
      Manager.delete({
        acl: acl.can('guest'),
        resource: 'Movie',
        user: {},
        query: () => MoviesMock[0],
        deleteFunc: () => MoviesMock[0],
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).rejects.toThrow('No access')
  })

  test('Owner cannot delete any', async () => {
    await expect(
      Manager.delete({
        acl: acl.can('owner'),
        resource: 'Movie',
        user: UserMock,
        query: () => MoviesMock[0],
        deleteFunc: MoviesMock[0],
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).rejects.toThrow('No access')
  })

  test('Owner can delete own', async () => {
    expect(
      await Manager.delete({
        acl: acl.can('owner'),
        resource: 'Movie',
        user: UserMock,
        query: () => MoviesMock[1],
        deleteFunc: () => MoviesMock[1],
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).toMatchObject(MoviesMock[1])
  })

  test('Admin can delete any', async () => {
    expect(
      await Manager.delete({
        acl: acl.can('admin'),
        resource: 'Movie',
        user: {},
        query: () => MoviesMock,
        deleteFunc: data => data,
        isOwnerFunc(doc, user) {
          return true
        },
      }),
    ).toMatchObject(MoviesMock)
  })
})
