// test.js
const Caver = require('caver-js')
const caver = new Caver("https://api.baobab.klaytn.net:8651")

async function checkVersion() {
    const version = await caver.rpc.klay.getClientVersion()
    console.log(version)
}

checkVersion()