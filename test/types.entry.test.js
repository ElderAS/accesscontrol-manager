const Entry = require("../src/types/entry");
const MovieMock = require("./mocks/entries/movie");

test("Entry returns same output as input data", () => {
  expect(new Entry(MovieMock, { isOwner: false })).toEqual(MovieMock);
});

test("Entry isOwner is true", () => {
  let entry1 = new Entry(MovieMock, { isOwner: true });
  let entry2 = new Entry(MovieMock, { isOwner: false });
  let entry3 = new Entry(MovieMock, { isOwner: true });

  expect(entry1.isOwner).toBe(true);
  expect(entry2.isOwner).toBe(false);
  expect(entry3.isOwner).toBe(true);
});

test("Entry isOwner is false", () => {
  expect(new Entry(MovieMock, { isOwner: false }).isOwner).toBe(false);
});
