## SILLOCK Smartcontracts

### latest contract address (BAOBAB)
-

### latest contract address (CYPRESS)
0xd8bbb3420fdf8fd734472efde3197a692107cc2f

### Update contract
`truffle deploy --compile-all --reset --network baobab`

### view 
- 기존 개발하고 있던 내용에 데모발행 기능을 추가해보았다.</br>
- 입력한 값으로, 원하듣 디자인 배경의 수료증을 만들고 이를 PDF화 하여 다운받을 수 있는 기능이다.
- 실제 프로젝트 개발시에는 다른 방법을 사용할 것 같지만, 공부할 겸 만들어봤다.

<img src = "https://user-images.githubusercontent.com/40741363/115665278-05983500-a37e-11eb-92ea-619527340cfb.png" width="530px"><img src = "https://user-images.githubusercontent.com/40741363/115665814-c0c0ce00-a37e-11eb-9e8c-861e547c7000.png" width="380px"></br></br></br></br>


- postman을 이용해 mock server(실제 서버처럼 요청을 받고 응답을 주는 가짜 서버)를 임의로 만들어 두고 axios에서 그 url을 가져와 임의로 구성한 데이터를 넣어줬다.
<img src = "https://user-images.githubusercontent.com/40741363/115666118-20b77480-a37f-11eb-8a5e-4bb2128643ef.png" width="800px"><img src = "https://user-images.githubusercontent.com/40741363/115668595-4134fe00-a382-11eb-9f3e-12b7b599e59a.png" width="800px"></br></br></br>



- Mock Server를 Run 해준 후에, 발행하기를 하면 서버에서 주는 가짜 JSON 정보로 다음과 같이 수료증을 만들어준다
    (임의로 만든 것이기 때문에 혹시몰라 이미지에 낙서를 좀 해뒀다.)

  * 해당 정보, 기관들은 임의로 구성한 것이며 사실과는 관계가 없습니다.</br></br>

- 발행하기 버튼을 누르면 PDF가 다운이 된다. </br></br>
<img src = "https://user-images.githubusercontent.com/40741363/115667303-a4be2c00-a380-11eb-89e4-24f76be7018e.png" width="350px"><img src = "https://user-images.githubusercontent.com/40741363/115667597-ff578800-a380-11eb-86c8-2054493c5868.png" width="550px"></br></br>



- 그럼 다음과 같이 다운받고 저장할 수 있다.
<img src = "https://user-images.githubusercontent.com/40741363/115668020-89075580-a381-11eb-9481-c4380fae867b.png" width="800px"></br></br>



- 해당 과정은 jspdf, html2canvas 두개의 모듈을 이용해 구현하였다.</br>
-> html2canvas를 이용해 컴포넌트의 일부를 캡쳐하고 canvas객체로 만들고,</br>
-> jspdf를 이용해 canvas객체를 pdf로 저장하는 방식이다.</br></br>
- 다음과 같이 만들면 된다. 조금 더 완성도 있게 레이아웃을 배치하고 싶어 addImage의 파라메터 정보를 더 찾아 수정했다.</br>
 ![image](https://user-images.githubusercontent.com/40741363/115670189-19df3080-a384-11eb-8d59-0ca40c2b9f12.png)</br></br>

- 참고)
- https://github.com/MrRio/jsPDF
- https://html2canvas.hertzen.com/configuration
- https://blog.naver.com/rnjsrldnd123/221526274628


