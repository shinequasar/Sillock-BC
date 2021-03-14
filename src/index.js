import Caver from "caver-js";
import { createFromRLPEncoding } from "caver-js/packages/caver-account";
import QRCode from "qrcode";

const config = {
    rpcURL: 'https://api.baobab.klaytn.net:8651'
}
// const cav = new Caver(config.rpcURL);

// DEPLOYED_ABI, DEPLOYED_ADDRESS BApp 상수들
// const agContract = new this.caver.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS);


const App = {
    caver: "",
    abi: "",
    contractInstance: "",

    auth: {
      accessType: 'keystore',
      keystore:   '',
      password:   ''
    },

    klip: {
      address: '',
    },
    requestKey: "",
    keyring: "",
    start: async function () {
      const walletFromSession = sessionStorage.getItem('walletInstance');
      if (walletFromSession) {
        try {
          this.caver.wallet.add(JSON.parse(walletFromSession));
          this.changeUI(JSON.parse(walletFromSession));
        } catch (e) {
          sessionStorage.removeItem('walletInstance');
        }
      }

      const keyFromSession = sessionStorage.getItem("klipAddress");
      if (keyFromSession) {
        try {
          this.changeUIKlip();
        } catch (e) {
          console.log("error update Klip ui")
        }
      }

      if (this.caver == "") {
        this.changeNetwork("baobab")
      }
    },

    changeNetwork: async function(network) {
      switch(network){
        case 'baobab':
          this.caver = new Caver('https://api.baobab.klaytn.net:8651')
          this.contractInstance = new this.caver.contract(BAOBAB_DEPLOYED_ABI, BAOBAB_DEPLOYED_ADDRESS)
          // this.keyring = this.caver.wallet.keyring.createFromPrivateKey(BAOBAB_PRIV_KEY)
          this.integrateWallet(BAOBAB_PRIV_KEY);
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
          this.caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option))
          this.contractInstance = new this.caver.contract(CYPRESS_DEPLOYED_ABI, CYPRESS_DEPLOYED_ADDRESS)
          // this.keyring = this.caver.wallet.keyring.createFromPrivateKey(CYPRESS_PRIV_KEY)
          this.integrateWallet(CYPRESS_PRIV_KEY);

        }
    },
  
    handleImport: async function () {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0]);
        fileReader.onload = (event) => {
          try {
            if (!this.checkValidKeystore(event.target.result)) {
              $('#message').text('Invalid Keystore');
              return;
            }
            this.auth.keystore = event.target.result;
            $('#message').text('Valid Keystore. Input password');
            document.querySelector('#input-password').focus();
          } catch (event) {
            $('#message').text('Invalid Keystore');
            return;
          }
        }
    },
  
    handlePassword: async function () {
      this.auth.password = event.target.value;
    },
  
    handleLogin: async function () {
      // TODO : Change into private key
      if (this.auth.accessType === 'keystore') {
        try {
          const privateKey = this.caver.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
          this.integrateWallet(privateKey);
        } catch (e) {
          $('#message').text('wrong password')
        }
      }
    },
  
    handleLogout: async function () {
      this.removeWallet();

      location.reload();
    },
  
    klipLogin: async function (){
      var response =  await fetch("https://a2a-api.klipwallet.com/v2/a2a/prepare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: '{"bapp": { "name" : "Sillock" }, "type": "auth" }'
      })
  
      var result = await response.json();
      var requestKey = result.request_key
      console.log(requestKey)
      this.requestKey = requestKey
      // sessionStorage.removeItem('requestKey');
      // sessionStorage.setItem('requestKey', requestKey);
      var canvas = document.getElementById('qrlogin')
      QRCode.toCanvas(canvas, "kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=" + requestKey, function (error) {
        if (error) console.error(error)
      })

    },

    handleKlipLogin: async function (){
      try {
        // var requestKey = sessionStorage.getItem('requestKey')
        var requestKey = this.requestKey
        var response =  await fetch(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=` + requestKey, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        })
        var result = await response.json()
        console.log(result)
        
        if (result.status !== "completed"){
          console.log("not Completed")
          throw "not completed"
        }

        var address = result.result.klaytn_address
        console.log(address)
        sessionStorage.setItem("klipAddress", address)

        this.changeUIKlip()

      } catch (e) {
        $('#message').text('LOGIN FAILED')
      }
    },

    handleKlipMintCert: async function (){
      try {
        // var requestKey = sessionStorage.getItem('requestKey')
        var requestKey = this.requestKey
        var response =  await fetch(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=` + requestKey, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        })
        var result = await response.json()
        console.log(result)
        
        if (result.status !== "completed"){
          console.log("not Completed")
          $('#mintMessage').text('Not yet')

          throw "not completed"
        }

        $('#mintMessage').text('Success')
        this.changeUIKlip()
      } catch (e) {
        $('#mintMessage').text('Not yet')
      }
    },

    changeUIKlip: async function (){
      console.log("this.changeUIKlip")
      $('#klipLoginModal').modal('hide');
      $('#klipMintCertModal').modal('hide');

      $('#login').modal('hide')
      $('#address').text('my address : ' + sessionStorage.getItem("klipAddress"));
    },

    changeUI: async function (walletInstance) {
      // close modal
      $('#loginModal').modal('hide');
      $('#login').hide();
      $('#logout').show();
      $('#address').append('<br>' + '<p>' + 'my address: ' + walletInstance.address + '</p>');
      const certsNum = await this.callContractEmptyCerts(walletInstance);
      $('#ticketAvailable').append('<p>' + 'Available Certs : ' + JSON.stringify(certsNum) + '</p>');

      if (await this.callOwner() === walletInstance.address) {
        $('#owner').show();
      }
    },

    getAllCerts: async function () {
      var certList = new Array()
      var num = await this.contractInstance.methods.totalSupply().call()

      for (var i=0 ; i < num ; i++){
          var tmpCert = new Object()
          var index = this.caver.abi.encodeParameter('uint256',i)
          // get id
          var id = await this.contractInstance.methods.tokenByIndex(index).call()


          console.log(i + " : "+ id)
  
          // get cert
          var tokenId = this.caver.abi.encodeParameter('uint256',id)
          var cert = await this.contractInstance.methods.getCert(tokenId).call()

          tmpCert.tokenId        = cert[0]
          tmpCert.name           = cert[1]
          tmpCert.num            = cert[2]
          tmpCert.issuer         = cert[3]
          tmpCert.imgurl         = cert[4]
          tmpCert.holder         = cert[5]
          tmpCert.date           = cert[6]
          tmpCert.mintDate       = cert[7]
          tmpCert.exchangable    = cert[8]
          tmpCert.authorized     = cert[9]
          
          certList.push(tmpCert)
          //console.log("GET IPFS DATA############")
          //var data = await contract.getIPFSdata(tmpCert.imgurl)
          //console.log(data)
  
  
      }
  
      var jsonData = JSON.stringify(certList)
      $('#allCerts').text(jsonData)

      console.log(jsonData)
  
      console.log(certList)
    },

    mintEmptyCert: async function(){
      console.log('MINT EMPTY CERT')
      var addr = document.getElementById('mint-cert-addr').value
      var n = document.getElementById('mint-cert-num').value
      var num  = this.caver.abi.encodeParameter('uint256', n)

      console.log(addr)
      const walletFromSession = sessionStorage.getItem('walletInstance');
      var myAddr = JSON.parse(walletFromSession)._address
      console.log(myAddr)

      var value = await this.contractInstance.methods.mintEmptyCert(addr, num).send({ from:myAddr, gas:'0x4bfd200' })
      console.log(value)
      value = await contractInstance.methods.returnEmptyCert(addr).call()
      $('#emptyMintMessage').text(`${addr} can mint ${value} certs`)
      
    },

    generateMintQR: async function (){

      var params = [document.getElementById('cert-name').value, document.getElementById('cert-holder').value, document.getElementById('cert-url').value, document.getElementById('cert-exchangable').value == 'true', parseInt(document.getElementById('cert-date').value)]

      var txjson = {
        to : "0xd8bbb3420fdf8fd734472efde3197a692107cc2f",
        value : "0",
        abi   : `{\"constant\": false,\"inputs\": [{\"name\": \"_name\",\"type\": \"string\"},{\"name\": \"_holder\",\"type\": \"address\"},{\"name\": \"_url\",\"type\": \"string\"},{\"name\": \"_exchangable\",\"type\": \"bool\"},{\"name\": \"_date\",\"type\": \"uint256\"}],\"name\": \"mintCert\",\"outputs\": [{\"name\": \"\",\"type\": \"uint256\"}],\"payable\": true,\"stateMutability\": \"payable\",\"type\": \"function\"}`,
        params: `${JSON.stringify(params)}`
      }
      //  "[\"test_string\"]" 
      console.log(JSON.stringify(txjson))

      var response =  await fetch("https://a2a-api.klipwallet.com/v2/a2a/prepare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: `{"bapp": { "name" : "Sillock" }, "type": "execute_contract" ,"transaction" : ${JSON.stringify(txjson)}}`
      })

      var result = await response.json();
      console.log(result)
      var requestKey = result.request_key
      this.requestKey = requestKey
      console.log(requestKey)


      var canvas = document.getElementById('qrMint')
      QRCode.toCanvas(canvas, "kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=" + requestKey, function (error) {
        if (error) console.error(error)
      })
    },

    callOwner: async function () {
      return await this.contractInstance.methods.owner().call();
    },
  
    callContractBalance: async function () {
  
    },
  
    callContractEmptyCerts: async function(walletInstance) {
      return await this.contractInstance.methods.returnEmptyCert(walletInstance.address).call();
    },

    getWallet: function () {
      if (this.caver.klay.accounts.wallet.length) {
        return this.caver.klay.accounts.wallet[0]
      }
    },
  
    checkValidKeystore: function (keystore) {
      const parsedKeystore = JSON.parse(keystore);
      const isValidKeystore = parsedKeystore.version &&
        parsedKeystore.id &&
        parsedKeystore.address &&
        parsedKeystore.crypto;

      return isValidKeystore;
    },
  
    integrateWallet: function (privateKey) {
      // private key에서 wallet instance를 가져옴
      const walletInstance = this.caver.wallet.keyring.createFromPrivateKey(privateKey);

      // wallet에 추가 -> tx 생성시 쉽게 caver instance를 통해 불러오는 것이 가능
      this.caver.wallet.add(walletInstance);

      // session storage에 wallet 저장 (tab이 닫히기 전까지 저장)
      sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));

      this.changeUI(walletInstance);
    },
  
    reset: function () {
      this.auth = {
        keystore: '',
        password: ''
      }
    },
  
    removeWallet: function () {
      this.caver.klay.accounts.wallet.clear();
      sessionStorage.removeItem('walletInstance');
      this.reset();
    },
  
    showTimer: function () {
  
    },
  
    showSpinner: function () {
      var target = document.getElementById("spin");
      return new Spinner(opts).spin(target);
    },
  
    receiveKlay: function () {
  
    }
  };
  
  window.App = App;
  
  window.addEventListener("load", function () {
    App.start();
  });
  
  var opts = {
    lines: 10, // The number of lines to draw
    length: 30, // The length of each line
    width: 17, // The line thickness
    radius: 45, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#5bc0de', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    position: 'absolute' // Element positioning
  };