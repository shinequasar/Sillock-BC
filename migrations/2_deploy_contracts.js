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
      console.log(CertToken)
      fs.writeFile('deployedAddress.txt', CertToken.address,
        (err) => {
          if (err) throw err;
          console.log("Success to write contract address");
        }
      )
      fs.writeFile('bytesCode.txt', CertToken._json.bytecode,
      (err) => {
        if (err) throw err;
        console.log("Success to write contract address");
      }
    )
    }
  })
};
