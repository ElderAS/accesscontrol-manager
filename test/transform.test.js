const MoviesMock = require('./mocks/entries/movies')
const Manager = require('../src')()
const AccessControl = require('accesscontrol')
const RulesMock = require('./mocks/rules')
const acl = new AccessControl(RulesMock)
const Clone = require('./clone')

describe('Transform', () => {
  test('No transform should not affect result (multi)', async () => {
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

  test('Transform should change result (multi)', async () => {
    let result = await Manager.read({
      acl: acl.can('admin'),
      resource: 'Movie',
      user: {},
      query: () => Clone(MoviesMock),
      transformFunc: val => {
        val._transformed = true
        return val
      },
      isOwnerFunc(doc, user) {
        if (!user) return false
        return doc.owner === user.id
      },
    })

    expect(result).toEqual(
      Clone(MoviesMock).map(e => {
        e._transformed = true
        return e
      }),
    )
  })

  test('No transform should not affect result (single)', async () => {
    expect(
      await Manager.read({
        acl: acl.can('admin'),
        resource: 'Movie',
        user: {},
        query: () => Clone(MoviesMock[0]),
        isOwnerFunc(doc, user) {
          if (!user) return false
          return doc.owner === user.id
        },
      }),
    ).toEqual(Clone(MoviesMock[0]))
  })

  test('Transform should change result (single)', async () => {
    let result = await Manager.read({
      acl: acl.can('admin'),
      resource: 'Movie',
      user: {},
      query: () => Clone(MoviesMock[0]),
      transformFunc: val => {
        val._transformed = true
        return val
      },
      isOwnerFunc(doc, user) {
        if (!user) return false
        return doc.owner === user.id
      },
    })

    expect(result).toEqual({
      _transformed: true,
      ...Clone(MoviesMock[0]),
    })
  })
})
