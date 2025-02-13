var express = require("express");
// var ip           = require('ip');
// const bitcoin_rpc  = require('node-bitcoin-rpc');
var bodyParser = require("body-parser");
const CryptoJS = require("crypto-js");
const Tx = require("ethereumjs-tx").Transaction;
const https = require("https");

// var myip = ip.address();
var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
const Web3 = require("web3");
const web3 = new Web3("http://localhost:8545");

// var erc20 = require("./erc20");

// const web3 = new Web3(
//   "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
// );
app.use(bodyParser.json());


// let contract = new web3.eth.Contract(minABI, contractAddr);

app.get("/test", function (req, res) {
  var account = web3.eth.accounts.create();
  res.json(account);
});

app.get("/getLatestBlock",async function (req,res){

   const latest = await web3.eth.getBlockNumber();
   return res.status(200).json({status:true,data:latest})
})

app.get("/getnewaddress",async function (req,res){

    let account = await web3.eth.accounts.create();
    return res.status(200).json({'status':true,data:account});
})


/**
 * ETH DEPOSIT
 * METHOD: POST
 * BODY : privateKey, fromAddress, toAddress
 */

app.post('/eth-move-to-admin',async (req,res) => {
try{
         
    let reqBody = req.body

    let privateKey = reqBody.privateKey;
    let fromAddress = reqBody.fromAddress;
    let toAddress = reqBody.toAddress;

    if (privateKey.substring(0, 2) == "0x") {
       privateKey = privateKey.substring(2);
    } else {
       privateKey = privateKey;
    }
      
    let getBalance = await web3.eth.getBalance(fromAddress)
    let balance = web3.utils.fromWei(getBalance, "ether");
    let getGasPrice = await web3.eth.getGasPrice(); 
    let txCount = await web3.eth.getTransactionCount(fromAddress);

    let gaslimit = await web3.utils.toHex(100000);
    let fee = web3.utils.toHex(getGasPrice) * gaslimit;
    fee = web3.utils.fromWei(fee.toString(), "ether")
    
    let amount = balance - fee;
    
    if (balance >= amount) {
      var updateVal = {};
     amount = web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether"));

      const txObject = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(gaslimit),
        gasPrice: web3.utils.toHex(getGasPrice),
        to: toAddress.toString(),
        from: fromAddress.toString(),
        value: amount,
      };

      var bufferPrivateKey = Buffer.from(privateKey, "hex");
      const tx = new Tx(txObject, { chain: "ropsten" });
      // const tx = new Tx(txObject, { chain: "mainnet" });
      tx.sign(bufferPrivateKey);
      const serializedTx = tx.serialize();
      const raw1 = "0x" + serializedTx.toString("hex");
      let transactionData = await web3.eth.sendSignedTransaction(raw1);
        
        return res.json({
          txHash: transactionData,
          status: true,
        });
      } else {
        return res.status(500).json({ "status":false, 'message': "no balance" });
      }

   }catch(err){
     return res.status(500).json({'status':false,'message':'Error On Server'})
   }
})


/**
 * ETH WITHDRAW
 * METHOD: POST
 * BODY : privateKey, fromAddress, toAddress, amount
 */

app.post('/eth-move-to-user',async (req,res) => {
try{

    let reqBody = req.body

    let privateKey = reqBody.privateKey;
    let fromAddress = reqBody.fromAddress;
    let toAddress = reqBody.toAddress;
    let amount = reqBody.amount;

    if (privateKey.substring(0, 2) == "0x") {
       privateKey = privateKey.substring(2);
    } else {
       privateKey = privateKey;
    }
      
    let getBalance = await web3.eth.getBalance(fromAddress)
    let balance = web3.utils.fromWei(getBalance, "ether");
    let getGasPrice = await web3.eth.getGasPrice(); 
    let txCount = await web3.eth.getTransactionCount(fromAddress);

    let gaslimit = await web3.utils.toHex(100000);
    if (parseFloat(balance) > parseFloat(amount)) {

      amount = web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether"));

      const txObject = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(gaslimit),
        gasPrice: web3.utils.toHex(getGasPrice),
        to: toAddress.toString(),
        from: fromAddress.toString(),
        value: amount,
      };

      var bufferPrivateKey = Buffer.from(privateKey, "hex");
      const tx = new Tx(txObject, { chain: "ropsten" });
      // const tx = new Tx(txObject, { chain: "mainnet" });
      tx.sign(bufferPrivateKey);
      const serializedTx = tx.serialize();
      const raw1 = "0x" + serializedTx.toString("hex");
      let transactionData = await web3.eth.sendSignedTransaction(raw1);
        
        return res.json({ 'status': true, 'data': transactionData, 'message': 'Withdraw successfully'});
      } else {
        return res.status(500).json({ "status":false, 'message': "Insuffient ETH balance" });
      }

   }catch(err){
     return res.status(500).json({'status':false,'message':'Error On Server'})
   }
})


/**
 * ERC_20 DEPOSIT
 * METHOD: POST
 * BODY : userPrivateKey, adminPrivateKey fromAddress, toAddress, contractAddress, minAbi, decimals, amount
 */

app.post('/erc20-token-move-to-admin',async(req,res)=> {
  try{

    let reqBody = req.body;

    let privateKey = reqBody.userPrivateKey; // User PrivateKey
    let fromAddress = reqBody.fromAddress; // User Address
    let toAddress = reqBody.toAddress; // Admin Address
    let adminPrivateKey = reqBody.adminPrivateKey; // Admin PrivateKey
    let contractAddress = reqBody.contractAddress;
    let minAbi = reqBody.minAbi;
    let decimals = reqBody.decimals;
    let amount = reqBody.amount;

    if (privateKey.substring(0, 2) == "0x") {
       privateKey = privateKey.substring(2);
    } else {
       privateKey = privateKey;
    }

    if (adminPrivateKey.substring(0, 2) == "0x") {
       adminPrivateKey = adminPrivateKey.substring(2);
    } else {
       adminPrivateKey = adminPrivateKey;
    }

    let muldecimal = 10 ** parseFloat(decimals)
    
    let contract = new web3.eth.Contract(JSON.parse(minAbi), contractAddress);
    let tokenBalance = await contract.methods.balanceOf(fromAddress).call();
    tokenBalance = tokenBalance/muldecimal;

    if(parseFloat(tokenBalance) > 0){
      if(parseFloat(tokenBalance) >= parseFloat(amount)){
          let getBalance = await web3.eth.getBalance(fromAddress)
          let balance = web3.utils.fromWei(getBalance, "ether");
          let getGasPrice = await web3.eth.getGasPrice(); 
          let txCount = await web3.eth.getTransactionCount(fromAddress);

          let gaslimit = await web3.utils.toHex(100000);
          let fee = web3.utils.toHex(getGasPrice) * gaslimit;
          fee = web3.utils.fromWei(fee.toString(), "ether")
          
          if(parseFloat(fee) > parseFloat(balance)){
            // parseFloat(web3.utils.toWei("0.00041", "ether"))
            // let sendAmount = parseFloat(fee) - parseFloat(balance)
            let { status, message, data } = await sendEth({fromAddress:toAddress,toAddress:fromAddress,privateKey:adminPrivateKey,amount:fee});
            
            if(status){

              let sentTokenData = await sendToken({toAddress,fromAddress,contractAddress,privateKey,txCount,gaslimit,getGasPrice,amount,muldecimal,contract})

              if(sentTokenData && sentTokenData.status){
                return res.status(200).json({'status':true,'data':sentTokenData.data})
              }else{
                return res.status(400).json({'status':false,'message':sentTokenData.message})
              }
            }
          }else{
            
            let sentTokenData = await sendToken({toAddress,fromAddress,contractAddress,privateKey,txCount,gaslimit,getGasPrice,amount,muldecimal,contract})

            if(sentTokenData && sentTokenData.status){
              return res.status(200).json({'status':true,'data':sentTokenData.data})
            }else{
              return res.status(400).json({'status':false,'message':sentTokenData.message})
            }
          }
      }else{
        return res.status(400).json({'status':false,'message':"Insuffient Token Balance"})
      }
    }else{
        return res.status(400).json({'status':false,'message':"There is No Token Deposit"})
    }
    
  }catch(err){
    return res.status(500).json({'status':false,'message':'Error On Server'})
  }
})



/**
 * ERC_20 WITHDRAW
 * METHOD: POST
 * BODY : privateKey, fromAddress, toAddress, contractAddress, minAbi, decimals, amount
 */

app.post('/erc20-token-move-to-user',async(req,res)=> {
  try{

    let reqBody = req.body;
    let privateKey = reqBody.privateKey; 
    let fromAddress = reqBody.fromAddress; 
    let toAddress = reqBody.toAddress; 
    let contractAddress = reqBody.contractAddress;
    let minAbi = reqBody.minAbi;
    let decimals = reqBody.decimals;
    let amount = reqBody.amount;
    
    if (privateKey.substring(0, 2) == "0x") {
       privateKey = privateKey.substring(2);
    } else {
       privateKey = privateKey;
    }

    let muldecimal = 10 ** parseFloat(decimals)
    
    let contract = new web3.eth.Contract(JSON.parse(minAbi), contractAddress);
    let tokenBalance = await contract.methods.balanceOf(fromAddress).call();
    tokenBalance = tokenBalance/muldecimal;
     
      if(parseFloat(tokenBalance) >= parseFloat(amount)){
          let getBalance = await web3.eth.getBalance(fromAddress)
          let balance = web3.utils.fromWei(getBalance, "ether");
          let getGasPrice = await web3.eth.getGasPrice(); 
          let txCount = await web3.eth.getTransactionCount(fromAddress);

          let gaslimit = await web3.utils.toHex(100000);
          let fee = web3.utils.toHex(getGasPrice) * gaslimit;
          fee = web3.utils.fromWei(fee.toString(), "ether")
          
          if(parseFloat(balance) > parseFloat(fee)){
            let sentTokenData = await sendToken({toAddress,fromAddress,contractAddress,privateKey,txCount,gaslimit,getGasPrice,amount,muldecimal,contract})

            if(sentTokenData && sentTokenData.status){
              return res.status(200).json({'status':true,'data':sentTokenData.data})
            }else{
              return res.status(400).json({'status':false,'message':sentTokenData.message})
            }
    
          }else{
             return res.status(400).json({'status':false,'message':'Insuffient gas fee'})            
          }
      }else{
        return res.status(400).json({'status':false,'message':"Insuffient Token Balance"})
      }
    
    
  }catch(err){
    return res.status(500).json({'status':false,'message':'Error On Server'})
  }
})


/**
 * ONLY SEND ETH
 * */

const sendEth = async ({fromAddress,toAddress,privateKey,amount}) => {
  try{
    let getBalance = await web3.eth.getBalance(fromAddress)
    let balance = web3.utils.fromWei(getBalance, "ether");
    let getGasPrice = await web3.eth.getGasPrice(); 
    let txCount = await web3.eth.getTransactionCount(fromAddress);

    let gaslimit = await web3.utils.toHex(100000);
    if (parseFloat(balance) > parseFloat(amount)) {

      amount = web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether"));

      const txObject = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(gaslimit),
        gasPrice: web3.utils.toHex(getGasPrice),
        to: toAddress.toString(),
        from: fromAddress.toString(),
        value: amount,
      };

      var bufferPrivateKey = Buffer.from(privateKey, "hex");
      const tx = new Tx(txObject, { chain: "ropsten" });
      // const tx = new Tx(txObject, { chain: "mainnet" });
      tx.sign(bufferPrivateKey);
      const serializedTx = tx.serialize();
      const raw1 = "0x" + serializedTx.toString("hex");
      let transactionData = await web3.eth.sendSignedTransaction(raw1);
        
        return { 'status': true, 'data': transactionData, 'message': 'Withdraw successfully'};
      } else {
        return { "status":false, 'message': "Insuffient ETH balance" };
      }
  }catch(err){
  }
}

/**
 * ONLY SEND ERC 20
 * */
const sendToken = async ({
toAddress,
fromAddress,
contractAddress,
privateKey,
txCount,
gaslimit,
getGasPrice,
amount,
muldecimal,
contract
}) => {
  
    try{

      amount = parseFloat(amount) * muldecimal
      // let tokenAmount = web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether"));
      // let tokenAmount = web3.utils.toHex(web3.utils.toWei(reqBody.amount.toString(), "ether"));
      let data = contract.methods.transfer(toAddress,amount.toString()).encodeABI();
      let transactionObject = {
          gasLimit: web3.utils.toHex(gaslimit),
          gasPrice: web3.utils.toHex(getGasPrice),
          data: data,
          nonce: txCount,
          from: fromAddress,
          to: contractAddress,
      };

      const tx = new Tx(transactionObject, { chain: 'ropsten' });
      let bufferPrivateKey = Buffer.from(privateKey, "hex");
      tx.sign(bufferPrivateKey);
      const serializedTx = tx.serialize();
      const raw1 = "0x" + serializedTx.toString("hex");
      let txHash = await web3.eth.sendSignedTransaction(raw1);
      return { 'status':true,'data':txHash }

    }catch(err){
      return {'status':false,'message': 'Error On Occured'}
    }
}




app.listen(3000, function () {
});


