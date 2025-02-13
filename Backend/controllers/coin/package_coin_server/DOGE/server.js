import express from "express";
import bodyParser from "body-parser";
import bitcoin_rpc from 'node-bitcoin-rpc'

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const host = '127.0.0.1';
const port = 22555;
const username = 'Lmksssdksdmksndjwh';
const password = "Pvsdnvsdncudgdwqsdevwqsq";
const coin = 'DOGE'
const PORT = 3000;

/** 
 * Create New Address
 * Method : POST
 * Body : userId
*/
app.post('/newAdress', (req, res) => {
  try {
    let reqBody = req.body;
    bitcoin_rpc.init(host, port, username, password)
    bitcoin_rpc.call('getnewaddress', [reqBody.userId], function (err, address) {
      if (err) {
        return res.status(400).json({ 'status': "FAILED", 'message': err.toString() })
      }
      let result = {
        address: address.result
      }
      return res.status(200).json({ 'status': "SUCCESS", 'message': "successfully", result })
    })
  } catch (err) {
    return res.status(400).json({ 'status': "FAILED", 'message': err.toString() })
  }
})

app.get('/walletBal', (req, res) => {
  try {
    bitcoin_rpc.init(host, port, username, password)
    bitcoin_rpc.call('getbalance', [], function (err, address) {
      if (err) {
        return res.status(400).json({ 'status': "FAILED", 'message': err.toString() })
      }

      return res.status(200).json({ 'status': "SUCCESS", 'message': "successfully", result: address })
    })
  } catch (err) {
    return res.status(400).json({ 'status': "FAILED", 'message': err.toString() })
  }
})

/** 
 * Transaction List
 * URL : /transactionList
 * METHOD : GET
 * QUERY : skip
*/
app.get('/transactionList', (req, res) => {
  try {
    let reqQuery = req.query;
    let skip = 0;

    if (reqQuery && reqQuery.skip > 0) {
      skip = parseInt(reqQuery.skip)
    }

    bitcoin_rpc.init(host, port, username, password)
    bitcoin_rpc.call('listtransactions', ["*", 100, skip], function (err, data) {
      if (err) {
        return res.status(400).json({ 'status': "FAILED", 'message': err.toString() })
      }
      let result = {
        list: data.result
      }


      return res.status(200).json({ 'status': "SUCCESS", 'message': "successfully", result })
    })
  } catch (err) {
    return res.status(400).json({ 'status': "FAILED", 'message': err.toString() })
  }
})

/** 
 * Transaction List
 * URL : /transactionList
 * METHOD : POST
 * BODY : amount, toAddress
*/
app.get('/transfer', (req, res) => {
  try {
    let reqBody = req.body;

    bitcoin_rpc.init(host, port, username, password)
    bitcoin_rpc.call('sendtoaddress', [reqBody.toAddress, parseFloat(reqBody.amount).toFixed(8)], function (err, address) {
      if (err) {
        return res.status(400).json({ 'status': "FAILED", 'message': err.toString() })
      }
      let result = {
        trxId: address.result
      }
      return res.status(200).json({ 'status': "SUCCESS", 'message': "successfully", result })
    })
  } catch (err) {
    return res.status(400).json({ 'status': "FAILED", 'message': err.toString() })
  }
})

app.get("/", (req, res) => {
  res.status(200).json({
    message: "I am using babel in NodeJS",
    status: "success",
  });
});

app.listen(PORT, function () {
});