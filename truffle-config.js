const HDWalletProvider = require('truffle-hdwallet-provider-klaytn');
// const PrivateKeyConnector = require('connect-privkey-to-provider');

const fs = require('fs');
const privateKey = fs.readFileSync(".secret").toString().trim();
const GASLIMIT = '20000000';
const BAOBAB_URL = "https://api.baobab.klaytn.net:8651"
const CYPRESS_URL = ""

module.exports = {
  networks: {
    cypress: {
      provider: () => new HDWalletProvider(privateKey, CYPRESS_URL),
      network_id: '8217', // cypress
      gas: GASLIMIT,
      gasPrice: null
    },

    baobab: {
      provider: () => new HDWalletProvider(privateKey, BAOBAB_URL),
      network_id: '1001', // baobab
      gas: GASLIMIT,
      gasPrice: null
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.6"
    },
  },
};
