const MoviesMock = require("./mocks/entries/movies");
const Manager = require("../src")();
const AccessControl = require("accesscontrol");
const RulesMock = require("./mocks/rules");

const Clone = require("./clone");
const acl = new AccessControl(RulesMock);

describe("Auth", () => {
  test("Unauthorized (non existing role) access should throw", async () => {
    await expect(
      Manager.read({
        acl: acl.can("nonexistent"),
        resource: "Movie",
        user: {},
        isOwnerFunc: () => true,
        query: () => Clone(MoviesMock)
      })
    ).rejects.toThrow("Role not found");
  });

  test("Unauthorized (no matching rules) access should throw", async () => {
    await expect(
      Manager.read({
        acl: acl.can("fake"),
        resource: "Movie",
        user: {},
        isOwnerFunc: () => true,
        query: () => Clone(MoviesMock)
      })
    ).rejects.toThrow(`Access denied (Movie)`);
  });
});
