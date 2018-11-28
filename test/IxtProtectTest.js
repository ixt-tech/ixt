const IxtProtect = artifacts.require("./IxtProtect.sol");

contract("IXTProtect", async (accounts) => {
  let ixtProtect;

  const deployer = accounts[0];
  const verifier = accounts[1];
  const user = accounts[2];
  const Products = { 
    PERSONAL_PROTECTION: 0
  };

  function memberData() {
    return {
      membershipNumber: 123123123,
      memberAddress: user,
      productsCovered: [ Products.PERSONAL_PROTECTION ],
      invitationCode: 0
    };
  }

  beforeEach(async () => {
    ixtProtect = await IxtProtect.new(verifier);
  });

  it("Should inherit the Ownable contract", async () => {
    const owner =  await ixtProtect.owner();
    assert.equal(owner, deployer);
  });

  describe("Join function", () => {
    let member = memberData();

    it("Should allow a verifier to join a new user", async () => {
      ixtProtect.join();

    });

    it("Should not allow a verifier to join an existing user", async () => {
      const member = memberData();

    });

    it("Should not allow a non-verifier to join a new user", async () => {
      const member = memberData();

    });

    it("Should not allow a non-verifier to join an existing user", async () => {
      const member = memberData();

    });
  }); 

});
