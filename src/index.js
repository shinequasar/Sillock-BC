import Caver from "caver-js";
import { createFromRLPEncoding } from "caver-js/packages/caver-account";

const config = {
    rpcURL: 'https://api.baobab.klaytn.net:8651'
}
const cav = new Caver(config.rpcURL);

// DEPLOYED_ABI, DEPLOYED_ADDRESS BApp 상수들
const agContract = new cav.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS);
const App = {
    auth: {
      accessType: 'keystore',
      keystore:   '',
      password:   ''
    },

    start: async function () {
      const walletFromSession = sessionStorage.getItem('walletInstance');
      if (walletFromSession) {
        try {
          cav.klay.accounts.wallet.add(JSON.parse(walletFromSession));
          this.changeUI(JSON.parse(walletFromSession));
        } catch (e) {
          sessionStorage.removeItem('walletInstance');
        }
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
          const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
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
  
    generateNumbers: async function () {
  
    },
  
    submitAnswer: async function () {
  
    },
  
    deposit: async function () {
      // contract abi, address 필요
      // login된 정보, contract owner 변수 호출

      const walletInstance = this.getWallet();
      if (walletInstance) {
        if (await this.callOwner() !== walletInstance.address) return;
        else {
          var amount = $('#amount').val();
          if (amount) {
            agContract.methods.deposit().send({
              from: walletInstance.address,
              gas: '250000',
              value: cav.utils.toPeb(amount, "KLAY")
            })
            .once('transactionHash', (txHash) => {
              console.log(`txHash: ${txHash}`);
            })
            .once('receipt', (receipt) => {
              console.log(`(#${receipt.blockNumber})`, receipt);
              alert(amount + "Success to send klay");
              location.reload();
            })
            .once('error', (error) => {
              alert(error.message);
            })
          }
        }
      }

    },
  
    callOwner: async function () {
      return await agContract.methods.owner().call();
    },
  
    callContractBalance: async function () {
  
    },
  
    callContractEmptyCerts: async function(walletInstance) {
      return await agContract.methods.returnEmptyCert(walletInstance.address).call();
    },

    getWallet: function () {
      if (cav.klay.accounts.wallet.length) {
        return cav.klay.accounts.wallet[0]
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
      const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);

      // wallet에 추가 -> tx 생성시 쉽게 caver instance를 통해 불러오는 것이 가능
      cav.klay.accounts.wallet.add(walletInstance);

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
    getKlipAddr: function() {

    }
    ,
    generateQRcode: function (address) {
      new QRCode(document.getElementById("qrcode"), "address");
    },

    removeWallet: function () {
      cav.klay.accounts.wallet.clear();
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