const fs = require('fs')
const CertToken = artifacts.require("./CertToken.sol");

module.exports = function (deployer) {
  deployer.deploy(CertToken)
  .then(()=> {
    if (CertToken._json) {
      fs.writeFile('deployedABI.txt', JSON.stringify(CertToken._json.abi),
        (err) => {
          if (err) throw err;
          console.log("Success to write ABI");  
        } 
      )

      fs.writeFile('deployedAddress.txt', CertToken.address,
        (err) => {
          if (err) throw err;
          console.log("Success to write contract address");
        }
      )
    }
  })
};
