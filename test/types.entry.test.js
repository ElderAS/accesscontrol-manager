const Entry = require('../src/types/entry')
const MovieMock = require('./mocks/entries/movie')

test('Entry returns same output as input data', () => {
  expect(new Entry(MovieMock, { isOwner: false })).toEqual(MovieMock)
})

test('Entry isOwner is true', () => {
  expect(new Entry(MovieMock, { isOwner: true }).isOwner).toBe(true)
})

test('Entry isOwner is false', () => {
  expect(new Entry(MovieMock, { isOwner: false }).isOwner).toBe(false)
})
