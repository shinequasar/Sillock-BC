pragma solidity ^0.5.6;

import "./ERC721/ERC721Enumerable.sol";

contract CertToken is ERC721Enumerable{
    
    using SafeMath for uint8;
    using SafeMath for uint256;

    struct Cert {
        uint256 tokenId;    // '고유'한 카드 번호

        string  name;       // 자격증의 이름
        uint256 num;        // 자격증 no.
        address issuer;     // 발행자의 주소
        string  imgurl;     // IPFS 자격증 발행 숫자
        address holder;     // 소유자의 주소
        uint    date;       // 행사 날짜
        uint    mintDate;   // 발행 날짜  

        bool    exchangable;   // 교환 가능여부
        bool    authorized;    // 검증 된 발행자인가
    }
    
    // 발행자를 어떻게 설정하는 것이 좋을지
    struct  AuthorizedIssuer {
        string  name;           // 발행자 식별
        address issuerAddress;  // 발행자의 주소
        string  url;            // 발행자의 url
        bool    authorized;     // 검증 받았는지
    }

    mapping (address => mapping(string => uint256[])) private _issuer2Certs;
    mapping (uint256 => Cert) private _id2Certs;

    mapping (address => uint256) private _address2EmptyCert; // TODO: 예상 발행량을 고려해야함
    mapping (address => AuthorizedIssuer) private _authorizedList;
    mapping (uint256 => string[]) private _cert2sig;

    address payable public owner;

    // 1000000000000000000 Peb = klay
    uint256 private issueFee;

    event NewCert(uint256 indexed tokenId, string indexed name, uint no, string url, address holder, address issuer, bool exchangable, bool authorized, uint date, uint now);    
    event BurnCert(uint256 tokenId);

    constructor() public {
        owner = msg.sender; // cert contract's owner
        issueFee = 100000000000000000; // 0.1klay
    }
    
    
    function changeFee(uint256 _fee) onlyOwner public{
        issueFee = _fee;
    }

    function mintCert(string memory _name, address _holder, string memory _url, bool _exchangable, uint256 _date)
    public payable
    returns(uint256){
        

        // 발행하는 주체가 직접 호출해야 함
        address issuer = msg.sender;

        require (_address2EmptyCert[issuer] >= 1, "You don't have enough Empty Certs.");
        uint256 totalAmount = _address2EmptyCert[issuer].sub(1);
        _address2EmptyCert[issuer] = totalAmount;

        uint256 certNo = _issuer2Certs[issuer][_name].length; // 해당 자격 종류 발행 No
        bool authorized = isAuthorized(issuer);
        
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_name, _url, _holder, issuer, _exchangable, _date, block.timestamp)));

        // TODO: ERC721에서 기본적으로 포함하는 요소. holder가 필요한지
        Cert memory newCert = Cert({
            tokenId     : tokenId,
            name        : _name,    // cert name
            num         : certNo,   // cert no.
            imgurl      : _url,     // IPFS
            holder      : _holder,
            date        : _date,
            mintDate    : block.timestamp,
            issuer      : issuer,
            exchangable : _exchangable,
            authorized  : authorized
        });
        
        _issuer2Certs[issuer][_name].push(tokenId);
        _id2Certs[tokenId] = newCert;
        _mint(_holder, tokenId); // 새 자격증 발행
        
        // event NewCert(uint256 indexed tokenId, string indexed name, uint no, string url, address holder, address issuer, bool exchangable, bool authorized, uint date, uint now);    

        emit NewCert(tokenId, _name, certNo, _url, _holder, issuer, _exchangable, authorized, newCert.date, now);
        return tokenId;
    }
    
    // TODO : 권한 holder, owner(byobl), issuer?
    function burnCert(uint256 _tokenId) public{

        Cert memory targetCert = _id2Certs[_tokenId];
        require((msg.sender == owner || msg.sender == targetCert.issuer || msg.sender == targetCert.holder), "BURN ERROR, Permission Error");

        _burn(targetCert.holder, _tokenId);

        targetCert.holder = address(0);
        _id2Certs[_tokenId] = targetCert;
        emit BurnCert(_tokenId);

    }
    
    function transferOwnership(uint256 _tokenId, address _to) public{
        // Check if Cert can be exchange
        Cert memory targetCert = _id2Certs[_tokenId];
        require((msg.sender == owner || msg.sender == targetCert.issuer || msg.sender == targetCert.holder), "BURN ERROR, Permission Error");
        require(_id2Certs[_tokenId].exchangable, "This token can't be exchanged");

        _transferFrom(msg.sender, _to, _tokenId);
        targetCert.holder = _to;
        _id2Certs[_tokenId] = targetCert;
    }

    function getTotalCertCount () public view returns (uint) {
        return totalSupply();
    }

    function getCert(uint _tokenId) public view
    returns(uint256, string memory, uint256, address, string memory, address, uint, uint, bool, bool){
        Cert memory targetCert = _id2Certs[_tokenId];

        return (
            targetCert.tokenId,    
            targetCert.name,       
            targetCert.num,        
            targetCert.issuer,     
            targetCert.imgurl,     
            targetCert.holder,     
            targetCert.date,       
            targetCert.mintDate,   
            targetCert.exchangable,
            targetCert.authorized
        );
    }


    function isAuthorized(address _issuer) public view
    returns(bool){
        return _authorizedList[_issuer].authorized;
    }

    function getIsserInfo(address _issuer) public view
    returns(string memory, address, string memory){
        AuthorizedIssuer memory isserInfo = _authorizedList[_issuer];

        return (
            isserInfo.name,
            isserInfo.issuerAddress,
            isserInfo.url
        );
    }

    // 발행자가 발행할 수 있는 토큰을 추가함
    function mintEmptyCert(address _issuer, uint256 _num) onlyOwner public{
        // 발행자의 주소를 받고 해당 주소와 매핑된 갯수를 한개 추가함
        uint256 totalAmount = _address2EmptyCert[_issuer].add(_num); // using SafeMath
        _address2EmptyCert[_issuer] = totalAmount;
    }

    // KLAY로 구입 가능
    function buyEmptyCert(address _issuer, uint256 _num) public payable
    returns(uint256){
        
        require(_num > 0, "Needs positive value");

        uint256 fee = _num.mul(issueFee);
        require(msg.value > fee, "Not enough money");
        
        owner.transfer(fee); // transfer money to owner
        
        uint256 totalAmount = _address2EmptyCert[_issuer].add(_num); // using SafeMath
        _address2EmptyCert[_issuer] = totalAmount;

        return totalAmount;
    }

    function returnEmptyCert(address _issuer) public view
    returns (uint256){
        return _address2EmptyCert[_issuer];
    }

    function authorize(string memory _name, address _issuer, string memory _url) onlyOwner public{
        
        AuthorizedIssuer memory newAuth = AuthorizedIssuer({
            name            : _name,
            url             : _url,
            issuerAddress   : _issuer,     // 발행자 관련 주소
            authorized      : true
        });

        _authorizedList[_issuer] = newAuth;
    }

    function deauthorize(address _issuer) onlyOwner public{
    
        AuthorizedIssuer memory newAuth = AuthorizedIssuer({
            name            : "",
            url             : "",
            issuerAddress   : address(0),     // 발행자 관련 주소
            authorized      : false
        });

        _authorizedList[_issuer] = newAuth;
    }

    function addSig(uint256 _tokenId, string memory _sig) public{

        Cert memory targetCert = _id2Certs[_tokenId];
        require(targetCert.holder != address(0), "No such Cert");
        require((msg.sender == owner || msg.sender == targetCert.holder), "Add sig error, Permission Error");

       _cert2sig[_tokenId].push(_sig); 

    }

    function getIndexedSig(uint256 _tokenId, uint256 _index) public view
    returns(string memory){
        string memory latestSig = _cert2sig[_tokenId][_index]; 
        return latestSig;
    }

    // fallback
    function() external payable {}

    modifier onlyOwner {
        require (msg.sender == owner, "Only Owner");
        _;
    }
    
}
