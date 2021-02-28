// SillockCert 컨트랙트와 직접 상호작용
const SillockCert = artifacts.require("./CertToken.sol");
const truffleAssert = require('truffle-assertions');

contract("SillockCert", async(accounts) => {

    var SillockCertInstance;
    var owner = accounts[0];
    var non_owner = accounts[1];

    // 각 테스트가 진행되기 전에 실행됩니다.
    before(async function() {
        // set contract instance into a variable
        SillockCertInstance = await SillockCert.new({from:owner});
    })

    it("#1 mint Empty Cert", async function() {
        await SillockCertInstance.mintEmptyCert(non_owner, 10, { from:owner });
        
        var expectedVal = await SillockCertInstance.returnEmptyCert(non_owner, { from:owner });

        assert.equal(expectedVal, 10, "Fail to give empty cert");

    })

    it("#2 [Failure test] Only owner can mint empty cert", async function() {
        await truffleAssert.fails(SillockCertInstance.mintEmptyCert(non_owner, 10, { from:non_owner }));
    })

    it("#3 mint Real Cert", async function() {
        
        var certName = "test";
        var holder = non_owner;
        var url= "ipfsurl";
        var exchangeable = true;
        var date = 1234;

        var beforeNo = parseInt(await SillockCertInstance.getTotalCertCount());

        // first - get EmptyCert
        await SillockCertInstance.mintEmptyCert(non_owner, 10, { from:owner });

        // Second - mint Cert
        await SillockCertInstance.mintCert(
            certName,
            holder,
            url,
            exchangeable,
            date,
            { from:non_owner });

        var afterNo = parseInt(await SillockCertInstance.getTotalCertCount());


        assert.equal(beforeNo + 1, afterNo, "Fail to mint real cert");
    });
    
    it("#4 [Failure test] To mint cert you must have empty cert", async function() {
        
        var certName = "test2";
        var holder = non_owner;
        var url= "ipfsurl";
        var exchangeable = true;
        var date = 1234;

        // Second - mint Cert
        await truffleAssert.fails(SillockCertInstance.mintCert(
            certName,
            holder,
            url,
            exchangeable,
            date,
            { from:owner }));

    });

    it("#5 Set authorized org", async function() {

        let name = "testOrg";
        let url = "test.org";
        let addr = accounts[1];
        let authorized = true;

        await SillockCertInstance.authorize(
            name,
            addr,
            url,
            { from:owner });

        var isAuthor = await SillockCertInstance.isAuthorized(accounts[1]);

        assert.equal(isAuthor, true, "Fail to enroll org");

    });

    it("#6 Set authorized org", async function() {


        await SillockCertInstance.deauthorize(
            accounts[1],
            { from:owner });

        var isAuthor = await SillockCertInstance.isAuthorized(accounts[1]);

        assert.equal(isAuthor, false, "Fail to deauthorize org");

    });

});