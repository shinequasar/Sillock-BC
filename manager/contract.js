const Caver = require('caver-js')
const fs = require('fs')
var argv = require('minimist')(process.argv.slice(2), {string: ['addr', '_'], default: {addr: 'owner', network: 'baobab', ipfs: '127.0.0.1'}});
var caver = ""
switch(argv.network) {
    case 'baobab':
        caver = new Caver('https://api.baobab.klaytn.net:8651')
        break

    case 'cypress':
        const accessKeyId = "";
        const secretAccessKey = "";
        
        const option = {
          headers: [
            {name: 'Authorization', value: 'Basic ' + Buffer.from(accessKeyId + ':' + secretAccessKey).toString('base64')},
            {name: 'x-chain-id', value: '8217'},
          ]
        }
        caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option))

        break

}

caver.ipfs.setIPFSNode(argv.ipfs, 8080, true)
var contractInstance = ''

var keyring = ''
const SillockContractManager = {

    parseArg: function () {
        
        var args = argv._
        var addr = argv.addr
        console.log(addr)

        var privateKey = ""
        switch(addr) {
            case 'owner':
                var privateKey = fs.readFileSync("key/owner.txt").toString()
                keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)
                break
            
            case 'non_owner1':
                var privateKey = fs.readFileSync("key/nonowner1.txt").toString()
                keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)

                break

            case 'non_owner2':
                var privateKey = fs.readFileSync("key/nonowner2.txt").toString()
                keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)
                break

            case 'cypress':
                var privateKey = fs.readFileSync("key/cypress.txt").toString()
                keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)
                break
            
            default:
                try{
                    keyring = caver.wallet.keyring.createFromPrivateKey(addr.toString())
                    break
                }
                catch{
                    console.log('Invalid Address')
                    return
                }
        }
        console.log('Address : ' + keyring._address)
        caver.wallet.add(keyring)

        var func = args[0]
        var args = args.slice(1,)

        return [func, args]
    },

    login: async function () {

    },

    init: function () {
        const abi = JSON.parse(fs.readFileSync("../deployedABI.txt"));
        var addr = ""
        switch(argv.network){
            case 'baobab':
                addr = fs.readFileSync("../deployedAddress.txt").toString();
                break
            case 'cypress':
                addr = fs.readFileSync("../cypress/deployedAddress.txt").toString();
                break
            }
        contractInstance = new caver.contract(abi, addr)
    },

    executeFunc: async function (func, args) {
        var value = ""
        this.init()
        
        if (args.length == 0) {
            args[0] = keyring._address
        }

        console.log(args)

        switch(func) {
            case 'mintEmptyCert':
                console.log('MINT EMPTY CERT')
                var addr = args[0]
                var num  = caver.abi.encodeParameter('uint256',args[1])
                console.log(keyring.address)
                value = await contractInstance.methods.mintEmptyCert(addr, num).send({ from:keyring.address, gas:'8500000' })
                console.log(value)
                return value

            case 'returnEmptyCert':
                console.log('GET EMPTY CERT')
                var addr = args[0]

                value = await contractInstance.methods.returnEmptyCert(addr).call()
                console.log(value)
                return value

            case 'mintCert':
                console.log('MINT CERT')
                if (args.length != 5) {
                    console.log('invalid args length')
                }
                var name    = args[0]
                var holder  = args[1]
                var url     = args[2]
                var exchangable = (args[3] == 'true')
                var date    = args[4]

                value = await contractInstance.methods.mintCert(name, holder, url, exchangable, date).send({ from:keyring.address, gas:'8500000' })
                console.log(value)
                return value


            case 'burnCert':
                console.log('BURN CERT')
                if (args.length != 1) {
                    console.log('invalid args length')
                }
                var tokenId = caver.abi.encodeParameter('uint256',args[0])
                value = await contractInstance.methods.burnCert(tokenId).send({ from:keyring.address, gas:'8500000' })
                console.log(value)
                return value

            
            case 'transferOwnership':
                console.log('TRANSFER ONWER')
                if (args.length > 1) {
                    console.log('invalid args length')
                }
                var tokenId = caver.abi.encodeParameter('uint256',args[0])
                var toAddr = args[1]
                value = await contractInstance.methods.transferOwnership(tokenId, toAddr).send({ from:keyring.address, gas:'8500000' })
                
                console.log(value)
                return value

            case 'getTotalCertCount':
                console.log('GET TOTAL COUNT')
                value = await contractInstance.methods.getTotalCertCount().call()
                console.log(value)
                return value

            case 'getCert':
                console.log('GET CERT')
                if (args.length != 1) {
                    console.log('invalid args length')
                }
                var tokenId = caver.abi.encodeParameter('uint256',args[0])
                value = await contractInstance.methods.getCert(tokenId).call()
                console.log(value)
                return value

            case 'isAuthorized':
                console.log('CHECK AUTHORIZED')
                if (args.length != 1) {
                    console.log('invalid args length')
                }
                var orgAddr = args[0]
                value = await contractInstance.methods.isAuthorized(orgAddr).call()
                console.log(value)
                return value

            case 'getIsserInfo':
                console.log('GET ISSUER INFO')
                if (args.length != 1) {
                    console.log('invalid args length')
                }
                var orgAddr = args[0]
                value = await contractInstance.methods.getIsserInfo(orgAddr).call()
                console.log(value)
                return value
            
            case 'buyEmptyCert':
                console.log('BUY EMPTY CERT')
                if (args.length != 1) {
                    console.log('invalid args length')
                }
                var num = caver.abi.encodeParameter('uint256',args[0])

                value = await contractInstance.methods.buyEmptyCert(num).send({ from:keyring.address, gas:'8500000', value:caver.utils.toPeb(1, 'KLAY')})
                console.log(value)
                return value

            case 'authorize':
                console.log('Authorize org')
                if (args.length != 1) {
                    console.log('invalid args length')
                }
                var orgAddr = args[0]
                value = await contractInstance.methods.authorize(orgAddr).send({ from:keyring.address, gas:'8500000' })
                console.log(value)
                return value

            case 'deauthorize':
                console.log('Deauthorize org')
                if (args.length != 1) {
                    console.log('invalid args length')
                }
                var orgAddr = args[0]
                value = await contractInstance.methods.deauthorize(orgAddr).send({ from:keyring.address, gas:'8500000' })
                console.log(value)
                return value

            case 'addSig':
                console.log('Add signiture')
                if (args.length != 2) {
                    console.log('invalid args length')
                }
                var tokenId = caver.abi.encodeParameter('uint256',args[0])
                var sig     = args[1]
                value = await contractInstance.methods.addSig(tokenId, sig).send({ from:keyring.address, gas:'8500000' })
                console.log(value)
                return value

            case 'getIndexedSig':
                console.log('Get indexed Sig')
                if (args.length != 2) {
                    console.log('invalid args length')
                }
                var tokenId = caver.abi.encodeParameter('uint256',args[0])
                var index   = caver.abi.encodeParameter('uint256',args[1])
                value = await contractInstance.methods.getIndexedSig(tokenId, index).call()
                console.log(value)
                return value

            case 'getLatestSig':
                console.log('Get latest Sig')
                if (args.length != 1) {
                    console.log('invalid args length')
                }
                var tokenId = caver.abi.encodeParameter('uint256',args[0])
                value = await contractInstance.methods.getLatestSig(tokenId).call()
                console.log(value)
                return value
    
            case 'totalSupply':
                console.log('Get total supply')
                value = await contractInstance.methods.totalSupply().call()
                console.log(value)
                return value

            case 'changeFee':
                console.log('ChangeFee')
                var num   = caver.abi.encodeParameter('uint256',args[0])

                value = await contractInstance.methods.changeFee(num).send({ from:keyring.address, gas:'8500000' })
                console.log(value)
                return value
    
            case 'returnFee':
                console.log('ReturnFee')

                value = await contractInstance.methods.returnFee().call()
                console.log(value)
                return value
            
            case 'tokenOfOwnerByIndex':
                console.log('Get token of owner by index')
                if (args.length != 2) {
                    console.log('invalid args length')
                }
                var owner = args[0]
                var index = caver.abi.encodeParameter('uint256',args[1])

                value = await contractInstance.methods.tokenOfOwnerByIndex(owner, index).call()
                console.log(value)
                return value

            case 'tokenByIndex':
                console.log('Get token by index')
                if (args.length != 1) {
                    console.log('invalid args length')
                }
                var index = caver.abi.encodeParameter('uint256',args[0])

                value = await contractInstance.methods.tokenByIndex(index).call()
                console.log(value)
                return value
            
            default:
                console.log('Cannot find Func')
        }
    },
    
    addIPFSdata: async function (target) {
        
        const cid = await caver.ipfs.add(target)
        
        console.log("CID : " + cid)
        return cid
    },

    getIPFSdata: async function (cid) {
        
        const contents = await caver.ipfs.get(cid)
        console.log("Content : " + contents)

        return contents
    },
    
    // testIPFS: async function () {
    //     const cid = await caver.ipfs.add(target)
    //     const contents = await caver.ipfs.add(target)

    // },
    
} 

var funcArgs = SillockContractManager.parseArg()
SillockContractManager.init()
//SillockContractManager.addIPFSdata("./test.txt")
// var data = SillockContractManager.getIPFSdata(cid)
// console.log(data)
SillockContractManager.executeFunc(funcArgs[0], funcArgs[1])

module.exports = SillockContractManager