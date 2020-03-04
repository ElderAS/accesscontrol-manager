const MoviesMock = require("./mocks/entries/movies");
const Manager = require("../src")();
const AccessControl = require("accesscontrol");
const RulesMock = require("./mocks/rules");
const UserMock = require("./mocks/entries/user");

const acl = new AccessControl(RulesMock);
const Clone = require("./clone");

describe("Update", () => {
  test("Guest cannot update", async () => {
    await expect(
      Manager.update({
        acl: acl.can("guest"),
        resource: "Movie",
        user: {},
        query: () => Clone(MoviesMock[0]),
        data: Clone(MoviesMock[0]),
        updateFunc: () => Clone(MoviesMock[0]),
        isOwnerFunc(doc, user) {
          if (!user) return false;
          return doc.owner === user.id;
        }
      })
    ).rejects.toThrow(`Access denied (Movie)`);
  });

  test("Owner cannot update any", async () => {
    await expect(
      Manager.update({
        acl: acl.can("owner"),
        resource: "Movie",
        user: UserMock,
        data: Clone(MoviesMock[0]),
        query: () => Clone(MoviesMock[0]),
        updateFunc: data => {
          return data;
        },
        isOwnerFunc(doc, user) {
          if (!user) return false;
          return doc.owner === user.id;
        }
      })
    ).rejects.toThrow(`Access denied (Movie)`);
  });

  test('Owner can update own but not "createdAt"', async () => {
    let expectedResult = Clone(MoviesMock[1]);
    expectedResult.name = "New name";

    expect(
      await Manager.update({
        acl: acl.can("owner"),
        resource: "Movie",
        user: UserMock,
        data: { name: "New name", createdAt: new Date() },
        query: () => Clone(MoviesMock[1]),
        updateFunc: (data, aclData) => {
          Object.assign(data, aclData);

          return data;
        },
        isOwnerFunc(doc, user) {
          if (!user) return false;
          return doc.owner === user.id;
        }
      })
    ).toEqual(expectedResult);
  });

  test("Admin update any", async () => {
    let newDate = JSON.stringify(new Date());
    let mocks = Clone(MoviesMock);
    mocks.map(d => (d.createdAt = newDate));

    expect(
      await Manager.update({
        acl: acl.can("admin"),
        resource: "Movie",
        user: {},
        data: { createdAt: newDate },
        query: () => Clone(MoviesMock),
        updateFunc: (data, aclData) => {
          Object.assign(data, aclData);

          return data;
        },
        isOwnerFunc(doc, user) {
          return true;
        }
      })
    ).toEqual(mocks);
  });
});
