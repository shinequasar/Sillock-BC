## Sillock contract manager

### Sample Address
---
1. owner (default -> byobl)
    - address : 0x7c189f9a26624dbe04ad53c69202fff8c5b5eb17
    - privKey : 0xef1e32d4b227355aa71e565844f8ab413b46dbf03c3136b795f3778116fdbf4f
2. non_owner1
    - address : 0xca8bbe857aaf9ad4b4879fd35e101ab8fde3862f  
    - privKey : 0x29cff573f0eed3e8c1ca41ec36299ae22b1c12cd7f0e99c4117eb89657f1f110
3. non_owner2
    - address : 0x92b1fdb25e992527705de1b699ceb45f92f9caee  
    - privKey : 0x32f6dd7d2c8a44c9e390cfd2c1253171537f2d9b83a41c0b7efc7e0c2bd82f0d

or  `node contract.js --addr={owner | non_owner1 | non_owner2}`

### Contract call
---
**usage**
```
node contract.js --addr={owner(default) | non_owner1 | non_owner2} <function name> <args1> <args2> ...
```

**returnEmptyCert**
```
node contract.js --addr=non_owner1 returnEmptyCert
```

**mintEmptyCert (only owner)**
```
node contract.js --addr=owner mintEmptyCert 0xca8bbe857aaf9ad4b4879fd35e101ab8fde3862f 100
```

**mintCert**
```
node contract.js mintCert testCert 0xca8bbe857aaf9ad4b4879fd35e101ab8fde3862f test.url true 20210306
```

**getTotalCertCount**
```
node contract.js getTotalCertCount
```