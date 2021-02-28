// SillockCert 컨트랙트와 직접 상호작용
const SillockCert = artifacts.require("./CertToken.sol");
const truffleAssert = require('truffle-assertions');

// EcDSA
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

var tokenId;

contract("SillockCert", async(accounts) => {

    var SillockCertInstance;
    var owner = accounts[0];
    var non_owner = accounts[1];
    var non_owner2 = accounts[2];

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
        var tx = await SillockCertInstance.mintCert(
                                certName,
                                holder,
                                url,
                                exchangeable,
                                date,
                                { from:non_owner });
        
        truffleAssert.eventEmitted(tx, 'NewCert', (ev) => {
            
            tokenId = ev.tokenId;
            return true;
        });

        var afterNo = parseInt(await SillockCertInstance.getTotalCertCount());


        assert.equal(beforeNo + 1, afterNo, "Fail to mint real cert");
    });
    
    it("#4 [Failure test] To mint cert you must have empty cert", async function() {
        
        var certName = "test_Failure";
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

    it("#7 Add Sig & [Failure test] Add sig by others", async function() {

        var key = ec.genKeyPair();

        var msgHash = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
        var signature = key.sign(msgHash).toDER().toString('hex');
        
        await SillockCertInstance.addSig(tokenId, signature, { from:non_owner });
        
        contractSig = await SillockCertInstance.getIndexedSig(tokenId, 0);
        assert.equal(signature, contractSig, "Failed to check Sig");

        await truffleAssert.fails(SillockCertInstance.addSig(tokenId, signature, { from:non_owner2 }));

    });

    it("#8 [Failure test] Add Sig. Case : diffrent token ID", async function() {

        tokenId = 1;
        var key = ec.genKeyPair();

        var msgHash = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
        var signature = key.sign(msgHash).toDER().toString('hex');
        
        await truffleAssert.fails(SillockCertInstance.addSig(tokenId, signature, { from:non_owner }));

    });

});