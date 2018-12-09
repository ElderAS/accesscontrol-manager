const MoviesMock = require('./mocks/entries/movies')
const Manager = require('../src')()
const AccessControl = require('accesscontrol')
const RulesMock = require('./mocks/rules')
const UserMock = require('./mocks/entries/user')

const acl = new AccessControl(RulesMock)
const Clone = require('./clone')

describe('Read', () => {
  test('Guest cannot read "createdAt"', async () => {
    expect(
      await Manager.read({
        acl: acl.can('guest'),
        resource: 'Movie',
        user: {},
        query: () => Clone(MoviesMock),
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).toEqual(
      Clone(MoviesMock).map(e => {
        delete e.createdAt
        return e
      }),
    )
  })

  test('Admin can read all', async () => {
    expect(
      await Manager.read({
        acl: acl.can('admin'),
        resource: 'Movie',
        user: {},
        query: () => Clone(MoviesMock),
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).toEqual(Clone(MoviesMock))
  })

  test('Owner can read "createdAt" on own but not on any', async () => {
    expect(
      await Manager.read({
        acl: acl.can('owner'),
        resource: 'Movie',
        user: UserMock,
        query: () => Clone(MoviesMock),
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).toEqual(
      Clone(MoviesMock).map(e => {
        if (e.owner !== UserMock.id) delete e.createdAt
        return e
      }),
    )
  })

  test('Result has isOwner property', async () => {
    expect(
      await Manager.read({
        acl: acl.can('owner'),
        resource: 'Movie',
        user: UserMock,
        query: () => Clone(MoviesMock)[1],
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }).then(res => res.isOwner),
    ).toBe(true)
  })

  test('Read with documentPath', async () => {
    expect(
      await Manager.read({
        acl: acl.can('owner'),
        resource: 'Movie',
        user: UserMock,
        documentPath: 'docs',
        query: () =>
          Clone({
            page: 1,
            pages: 5,
            docs: Clone(MoviesMock),
          }),
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).toEqual({
      page: 1,
      pages: 5,
      docs: Clone(MoviesMock).map(e => {
        if (e.owner !== UserMock.id) delete e.createdAt
        return e
      }),
    })
  })

  test('Read with no results (multi)', async () => {
    expect(
      await Manager.read({
        acl: acl.can('admin'),
        resource: 'Movie',
        user: UserMock,
        query: () => [],
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).toEqual([])
  })

  test('Read with no results (single)', async () => {
    expect(
      await Manager.read({
        acl: acl.can('admin'),
        resource: 'Movie',
        user: UserMock,
        query: () => null,
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).toEqual(null)
  })
})
