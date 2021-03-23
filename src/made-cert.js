<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

const cert = {
    madeCert : async function () {
        
        var params = [document.getElementById('cert-mynum').value,
                    document.getElementById('cert-name').value,
                    document.getElementById('cert-holder').value, 
                    document.getElementById('cert-process').value, 
                    document.getElementById('cert-period').value, 
                    document.getElementById('cert-exchangable').value == 'true', 
                    document.getElementById('cert-date').value]
                    var obj = JSON.stringify(params); 
        console.log(JSON.stringify(params));          
        axios({
            method: 'get',
            url: 'https://66efd3ee-b1cc-4780-9b6b-74f61045e2bf.mock.pstmn.io/cert',
            responseType: 'json'
          })
            .then(function (response) {
                console.log(response);
            });
      },

      printCert : async function () {
       
      }
}



