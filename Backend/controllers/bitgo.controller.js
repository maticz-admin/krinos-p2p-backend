const { BitGo } = require('bitgo');
import node2fa from 'node-2fa';
const bitcoin = require('bitcoinjs-lib');
import TronWeb from 'tronweb';
import Web3 from 'web3';
import Currency from "../models/currency";
import Wallet from "../models/wallet";
import Transaction from "../models/Transaction";
import { createPassBook } from './passbook.controller';
import { mailTemplateLang } from '../controllers/emailTemplate.controller';

import config from "../config/index";

const bitcore = require('bitcore-lib');

const tron_rpc_url = 'https://greatest-newest-emerald.tron-mainnet.quiknode.pro/ac81d8377a69068d91f54299e01b5b8851c1e43b'
const EVM_RPC = {
    bnb : "https://practical-spring-frog.bsc.quiknode.pro/dabbf8657aa56f634cb64e11baadf47cec7be616/",
    eth : "https://still-cool-hill.quiknode.pro/9bc3fbdf9f4d222c9e1843b1ab5f2de64fc31352",
    pol : "https://dimensional-attentive-frog.matic.quiknode.pro/e172038277e7698137daaad81e1771cb9e36401e"
}

const ACCESS_TOKEN = "v2xf3063bbd890a0851ac72d800858cfb40cf0e1c51e3d51953e577f94206c78da2" //network ip
// "v2xe7986f8c95d9471b2ea822db534548f2a3a6d8b195322c0dd76a61935e0820d1" // systemip
//"v2x4f64554b8e88600a5a12ef8d37193cd6739f3b6db4dbd2a5982d8fe276f6c89c"
//"v2x6e5c38b17ddcf2f1cdb545245cfa77378988bfa46755f389697b4b2c0754d501"//without ip
// const ENTERPRICE_ID = "67c9458ecaef5bed16fc5d5ea8331431"

const ENTERPRICE_ID = "67bf20b0cb4ae0362b9d9321ec3fcd83"
const WEBHOOK_URL = "https://qc3kj71m-2053.inc1.devtunnels.ms/bitgo-webhook";

const bitgo = new BitGo({
    accessToken: ACCESS_TOKEN,
    env: 'prod',   //'test',
});

export const CreateAddress = async(symbol , label , phrase) => {
    try{
        console.log("inside create address" , symbol , label);
        
        const { wallet } = await bitgo.coin(symbol).wallets().generateWallet({
            label: label, //'murugavelrajmaticz@gmail.com',
            passphrase: phrase, //'murugavelwallet',
            enterprise: ENTERPRICE_ID
        });
        console.log("create wallet" , wallet);
        
        let addwebhok = await wallet.addWebhook({
            type: 'transfer',
            allToken: false,
            url: WEBHOOK_URL,
            label: 'For Transaction',
        })
        console.log("addwebhok",addwebhok)
        return {
            webhookid : addwebhok?.id,
            walletid : addwebhok?.walletId,
            address  : wallet?._wallet?.receiveAddress?.address
        }
    }
    catch(e){
        console.log("error on create wallet" , e);
    }
}


export const SendAmount = async(walletid , symbol , amount , recipientAddress) => {
    try {
        console.log("enter send Amount");
        
        // Define the wallet ID (replace with actual wallet ID)
        const wallet = await bitgo.coin(symbol).wallets().get({ id: walletid });
        let bal = await wallet.balance()
        // Define the recipient address and amount to send (in satoshis)
        // const recipientAddress = 'tb1qkfht7nnd64d6cg578sr6qv75ksjuw6ck6nq7yn';
        const amountToSend = amount   //10000; // Example amount in satoshis (0.0001 BTC)
    
        // Create a transaction
        // const webhook = await wallet.addWebhook

        
        const transaction = await wallet.sendMany({
          recipients: [
            {
              address: recipientAddress,
              amount: amountToSend,
            },
          ],
          // Optional: Set the fee rate (in satoshis per byte)
          feeRate: 1000, // Example fee rate
          // Specify the passphrase to unlock the wallet
          walletPassphrase: 'murugavelwallet',
        });
        console.log('Transaction Sent: ', transaction);
      } catch (error) {
        console.error('Error sending transaction:', error);
      }
}


export const SendAmountSend = async (walletid, symbol, amount, recipientAddress) => {
    try {
        // Get the wallet
        const wallet = await bitgo.coin(symbol).wallets().get({ id: walletid });

        // Define the transaction details
        const transaction = await wallet.send({
            address: recipientAddress,  // Recipient address
            amount: amount,  // Amount to send
            feeRate: 1000,  // Set fee rate (optional)
            walletPassphrase: 'murugavelwallet',  // Passphrase to unlock the wallet
        });

        console.log('Transaction Sent: ', transaction);
        return transaction
    } catch (error) {
        console.error('Error sending transaction:', error);
    }
};


export const GetBitgoBalance = async(walletid , symbol) => {
    try{
        const wallet = await bitgo.coin(symbol).wallets().get({ id: walletid });
        let bal = await wallet.balance();
        return bal;
    }
    catch(e){
        console.log("error on get bitgobalance" , e);
    }
}


/** 
 * Bitgo Deposit Webhook
 * URL: /api/depositbitgowebhook
 * BODY : currency, address, txn_id, amount, dest_tag
*/
export const depositwebhook = async (req, res) => {
    // write_log(JSON.stringify(req.body))
    // write_log(JSON.stringify(req.headers))
    try {
        console.log("deposited webhookk" , req?.body);
        let reqBody = req?.body;
        
        // {
        //     "hash": "77d342de7bc66ed3cbccc2f1c2a8250f1d6f9f0d33fa0d2338baa2ee2cd35cce",
        //     "transfer": "67ee1f20433579b93adab161e6401ac7",
        //     "coin": "tbtc",
        //     "type": "transfer",
        //     "state": "unconfirmed",
        //     "wallet": "67ee1c55e4a2d5d0707f5aad903afd17",
        //     "walletType": "hot",
        //     "transferType": "receive",
        //     "baseValue": 28648,
        //     "baseValueString": "28648",
        //     "value": 28648,
        //     "valueString": "28648",
        //     "feeString": "165",
        //     "initiator": [
        //       "external"
        //     ],
        //     "receiver": "tb1p9scn9yfxkd2aeu4hhflpxwsyvcy5g475aemkhc6hls84yz05lyrsvg4dnh"
        //   }
         // Resources
        //req?.body;
        // let coinpaymentsymbol = reqBody?.coin == "tbtc" ? "BTC" : "ETH"
        let AdminAddress = config?.BITGO_ADMIN_WALLET[reqBody?.coin?.toLowerCase()]?.address //"tb1pqykx30ajt9twvud6s76cuhm4cr5asjly2zskpmjka4vt07r8fh7qwxuesy"
        let decimal = config?.BITGO_ADMIN_WALLET[reqBody?.coin?.toLowerCase()]?.decimal
        // let AdminWalletId = config?.BITGO_ADMIN_WALLET[reqBody?.coin?.toLowerCase()]?.walletid;


        if (reqBody?.state == 'confirmed' && reqBody?.transferType == "receive" ) {  //&& reqBody?.value > 0//reqBody?.state == 'unconfirmed' && 
            let currencyData = await Currency.findOne({ 'bitgosymbol': reqBody?.coin })
            let trxnData = await Transaction.findOne({ 'currencyId': currencyData._id, 'txid': reqBody.txn_id });
            console.log("trxnDatatrxnDatatrxnData" , trxnData);
            if(false){
                return res.status(400).json({ 'success': false, 'messages': "Transaction already exist" })
            }
            console.log("currencyData",currencyData)
            if (!currencyData) {
               return res.status(400).json({ 'success': false, 'messages': "Invalid currency" })
            }
            let findAsset = {
                '_id': currencyData?._id,
                'address': reqBody?.receiver
            }
            let usrWallet = await Wallet.findOne({ assets: { $elemMatch: findAsset }})
            let userAssetData = await Wallet.findOne({ assets: { $elemMatch: findAsset }}).populate({ path: "_id" })
            let userWalletData = usrWallet.assets.id(currencyData._id);
            if (!userWalletData) {
               return res.status(400).json({ 'success': false, 'messages': "Invalid assets" })
            }
            if (trxnData) {
               return res.status(400).json({ 'success': false, 'messages': "Already payment exists" })
            }
            let transactions = new Transaction();
            transactions["userId"] = usrWallet?.userId;
            transactions["currencyId"] = currencyData?._id;
            transactions["coin"] = reqBody?.coin;
            transactions["toAddress"] = reqBody?.receiver;
            transactions["amount"] = reqBody?.value/10**8;
            transactions["actualAmount"] = reqBody?.baseValue/10**parseFloat(decimal);
            transactions["txid"] = reqBody?.hash;
            transactions["status"] = 'pending';
            transactions["paymentType"] = 'coin_deposit';
            transactions["commissionFee"] = parseFloat(reqBody?.feeString)/10**parseFloat(decimal);
            transactions["transfer_id"] = reqBody?.transfer;
            // if (currencyData.symbol == 'XRP') {
            //     transactions["destTag"] = reqBody.dest_tag;
            // }
            let beforeBalance = parseFloat(userWalletData.p2pBal);
            userWalletData.p2pBal = parseFloat(userWalletData.p2pBal) + parseFloat(reqBody?.value/10**parseFloat(decimal))
            await usrWallet.save();

            // CREATE PASS_BOOK
            createPassBook({
                'userId' : usrWallet._id,
                'coin' : currencyData.coin,
                'currencyId' : currencyData._id,
                'tableId' : transactions._id,
                'beforeBalance' : beforeBalance,
                'afterBalance' : parseFloat(userWalletData.p2pBal),
                'amount' : parseFloat(reqBody?.value/10**parseFloat(decimal)),
                'type' : 'coin_deposit',
                'category' : 'credit'
            })
            // await Assets.findOneAndUpdate(
            //     { '_id': userAssetData._id },
            //     { $inc: { 'spotwallet': parseFloat(reqBody.amount).toFixed(8) } }
            // )
            let content = {
                'email': userAssetData._id.email,
                'date': new Date(),
                'amount': parseFloat(reqBody?.value/10**parseFloat(decimal)).toFixed(8),
                'transactionId': reqBody?.hash,
                'currency': reqBody?.coin,
            };
            mailTemplateLang({
                'userId': userAssetData._id._id,
                'identifier': 'User_deposit',
                'toEmail': userAssetData._id.email,
                content
            })
            
            let gasestimate;
            if(reqBody?.coin == "tbtc"){
                // gasestimate = await EstimateGaseFeeForBTC(reqBody?.wallet , reqBody?.coin , AdminAddress , 1000);
                gasestimate = await EstimateGasForCoin(reqBody?.coin);
            }
            else{
                gasestimate = await EstimateGasForCoin(reqBody?.coin);
            }
            let final_amount = parseFloat(reqBody?.value) - parseFloat(gasestimate?.gasfee);
            const transaction = await internalTransfer(reqBody?.wallet, reqBody?.coin, reqBody?.valueString, AdminAddress)
            console.log("transactiontransactiontransaction",transaction)
            if(transaction?.state == 'signed'){
                transactions["status"] = 'completed';
            }
            let trxData = await transactions.save();
            return res.status(200).json({ 'success': true, 'messages': "Updated successfully" })
        }
       // return res.status(400).json({ 'success': true, 'messages': "Payment status pending" })
    } catch (err) {
        console.log("Error on send amount", err);
        return res.status(500).json({ 'success': false, 'messages': "Error on server" })
    }
}


export const WithdrawAmount = async(req , res) => {
    try{
//         let transfer = await SendAmount("67fde42f273253b0e76c90b9def57de9", "tbtc", 1000, "tb1pqykx30ajt9twvud6s76cuhm4cr5asjly2zskpmjka4vt07r8fh7qwxuesy");
// return
        let {coin , amount , receiveraddress , fee , twoFACode} = req?.body;
        let AdminAddress = config?.BITGO_ADMIN_WALLET[coin?.toLowerCase()]?.address //"tb1pqykx30ajt9twvud6s76cuhm4cr5asjly2zskpmjka4vt07r8fh7qwxuesy"
        let decimal = config?.BITGO_ADMIN_WALLET[coin?.toLowerCase()]?.decimal
        let AdminWalletId = config?.BITGO_ADMIN_WALLET[coin?.toLowerCase()]?.walletid;
        let currencyData = await Currency.findOne({ 'bitgosymbol': coin })
        if (!currencyData) {
            return res.status(400).json(encodedata({ 'success': false, 'messages': "Invalid currency" }))
        }
        let findAsset = {
            '_id': currencyData._id,
            'address': reqBody?.receiver 
        }
        let usrWallet = await Wallet.findOne({ assets: { $elemMatch: findAsset } })
        let userAssetData = await Wallet.findOne({ assets: { $elemMatch: findAsset } }).populate({ path: "_id" })
        let userWalletData = usrWallet.assets.id(currencyData._id);
        if (!userWalletData) {
            return res.status(400).json(encodedata({ 'success': false, 'messages': "Invalid assets" }))
        }

        let userData = await User.findOne({ "_id": req.user.id });
        if (userData?.google2Fa?.secret == '') {
            console.log('------------------2');
            return res.status(500).json(encodedata({ "success": false, 'errors': { 'twoFACode': 'TWO_FA_MSG' } }))
        }

        let verifyTwoFaCode = node2fa.verifyToken(userData?.google2Fa?.secret, twoFACode);
        if (!(verifyTwoFaCode && verifyTwoFaCode.delta == 0)) {
            console.log('------------------3');
            return res.status(400).json(encodedata({ "success": false, 'errors': { 'twoFACode': "INVALID_CODE" } }))
        }



        if(userWalletData?.p2pBal > (parseFloat(amount) + parseFloat(fee))){
            let adminbalance = await GetBitgoBalance(coin, AdminWalletId);
            let gasestimate = await EstimateGasForCoin(reqBody?.coin);
            if((adminbalance/10**decimal) > (parseFloat(amount) + parseFloat(fee) + parseFloat(gasestimate?.gasfee))){
                let transactions = new Transaction();
                transactions["userId"] = usrWallet?.userId;
                transactions["currencyId"] = currencyData?._id;
                transactions["coin"] = coin;
                transactions["toAddress"] = receiveraddress;
                transactions["amount"] = amount;
                transactions["actualAmount"] = parseFloat(amount) + parseFloat(fee);
                // transactions["txid"] = reqBody?.hash;
                transactions["status"] = 'pending';
                transactions["paymentType"] = 'coin_withdraw';
                transactions["commissionFee"] = fee;
                // transactions["transfer_id"] = reqBody?.transfer;
                let trxData = await transactions.save();
                let beforeBalance = parseFloat(userWalletData.p2pBal);
                userWalletData.p2pBal = parseFloat(userWalletData.p2pBal) - (parseFloat(amount) + parseFloat(fee))
                await usrWallet.save();
                // CREATE PASS_BOOK
                createPassBook({
                    'userId' : usrWallet._id,
                    'coin' : currencyData.coin,
                    'currencyId' : currencyData._id,
                    'tableId' : trxData._id,
                    'beforeBalance' : beforeBalance,
                    'afterBalance' : parseFloat(userWalletData.p2pBal),
                    'amount' : amount,
                    'type' : 'coin_withdraw',
                    'category' : 'debit'
                })
            }
            else{
                return res.status(400).json({ 'success': false, 'messages': "Insufficient fund in admin wallet" })
            }
        }
        else{
            return res.status(400).json({ 'success': false, 'messages': "Insufficient fund" })
        }
        // if (userWalletData?.p2pBal > amount) {
        //     let userbalance = await GetBitgoBalance(coin, userWalletData?.bitgo_id);
        //     if (userbalance > amount) {
                // let transfer = await SendAmount(userWalletData?.bitgo_id, coin, amount, receiveraddress);
        //     }
        // }

        
    }
    catch(e){
        console.log("error on withdraw amount" , e);
    }
}



export const EstimateGasForCoin = async(coin) => {
    try{
        let estimategas = await bitgo.coin(coin).feeEstimate({numBlocks: 2});
        console.log("estimategas" , estimategas);

        if(coin == "tbtc"){
            return {
                gasfee : estimategas?.feePerKb
            }
        }
        else if(coin == "eth"){
            return {
                gasfee : estimategas?.feePerKb
            }
        }
    }
    catch(e){
        console.log("error on estimate gas for coin" , e);
    }
}

export const EstimateGaseFeeForBTC = async(walletid , coin , recipientAddress , amount) => {
    try{
        const wallet = await bitgo.coin(coin).wallets().get({ id: walletid });
        const txPrebuild = await wallet.prebuildTransaction({
            recipients: [{
              address: recipientAddress,
              amount: amount, // in satoshis
            }],
            feeTxConfirmTarget: 2 // estimate fee for 2-block confirmation
          });

          console.log('Estimated fee (satoshis):', txPrebuild.feeInfo);
          return {gasfee : txPrebuild?.feeInfo?.fee}
    }
    catch(e){
        console.log("error on estimate gas fee for btc" , e);
        
    }
}

export const serializeTransaction = async(toAmount , walletaddress) => {
    try{
        const network = bitcoin.networks.mainet;
        const txid = 'e3c...'; // Replace with actual txid
        const vout = 0;

        // Sender private key (WIF format)
        const keyPair = bitcoin.ECPair.fromWIF('cR3...yourPrivateKeyWIF...', network);

        // Destination address
        const toAddress = 'tb1q...';

        // Build the transaction
        const txb = new bitcoin.TransactionBuilder(network);
        txb.addInput(txid, vout); // Add input
        txb.addOutput(toAddress, 10000); // Amount in satoshis

        // Sign input
        txb.sign(0, keyPair);

        // Build and serialize
        const tx = txb.build();
        const rawTx = tx.toHex();
        return rawTx;
    }
    catch(e){
        console.log("Error on serialize transaction" , e);
    }
}

const WALLET_ID = "67dbaaefc9532fc37ee600f1ba71dc42";  // Your Source Wallet ID
const DESTINATION_WALLET_ID = "tb1p5c4p0uk4cv6juzrxcypgdstydds9x2crllcspc28cn4sre6jhg9skrkgyr"; // Your Destination Wallet ID
const COIN_TYPE = "tbtc"; // Use "btc", "eth", or "tbtc" (testnet BTC)

export async function internalTransfer(walletid , symbol , amount , recipientAddress) {
    try {
        // walletid = "67ff57f96c21b7da0bbcf0560ad81c2f"
        // symbol = "polygon"
        // amount = '100000000000000000'
        // recipientAddress = "0x387e71773a6217b5209cb63e8e5b91b4816588a9"
        console.log("internal transfer" , walletid , symbol , amount , recipientAddress);
        
        const wallet = await bitgo.coin(symbol).wallets().get({ id: walletid });
        console.log(`Wallet Found: ${wallet.label()} (${wallet.id()})`);
        // Internal Transfer
        const transfer = await wallet.send({
            amount: amount,  // Amount in satoshis (e.g., 100000 = 0.00000001 BTC)
            address: recipientAddress, // Destination Wallet ID within BitGo
            walletPassphrase: "KRINOSmhi@yopmail.com", // Needed if using a password-protected wallet
            type: "internal" // Internal transfer (avoids blockchain fees)
        });

        console.log("Transfer Successful:", transfer);
        return transfer?.transfer
    //     const wallet = await bitgo.coin("tbtc").wallets().get({ id: "67dace8747425cbe905d49fd34b0a6bc" });
    // let transferlist = await wallet.transfers();
    // console.log("list of transaction" , transferlist);
    } catch (error) {
        console.error("Error in Internal Transfer:", error.message);
    }
}

//estimate tron gas fee
export const UseTronWeb = async () => {
    try {
        let tronWeb = null
        const HttpProvider = TronWeb.providers.HttpProvider;
        const param = {
            fullNode: new HttpProvider(tron_rpc_url),
            solidityNode: new HttpProvider(tron_rpc_url),
            eventServer: new HttpProvider(tron_rpc_url),
        }
        tronWeb = await new TronWeb(param);
        return tronWeb
    } catch (e) {
        console.log("UseTronWeb_err", e);
        return false
    }
}
export const tronEstimateGasFee = async (data) => {
    try {
        const tronWeb = await UseTronWeb();
        let baseAddress = await tronWeb.address.toHex(data.walletaddress);
        if (data.type == 'Token') {
            var options = {feeLimit: 1000000000};
            var parameter = [
                { type: "address", value: data.toAddress },
                { type: "uint256", value: data.amount },
            ];
            const energyEstimate = await tronWeb.transactionBuilder.estimateEnergy(data.contractAddress, "transfer(address,uint256)", options, parameter, baseAddress);
            // step2: get the energy fee unit, this may vary according to TRON network, suggest getting from this API
            const chainParams = await tronWeb.trx.getChainParameters();
            const energyFee = chainParams.filter(item => item.key === 'getEnergyFee')[0].value;
            // step3: get feeLimit as TRX value 
            const feeLimit = tronWeb.fromSun(energyEstimate.energy_required * energyFee);
            return {
                gasFee: feeLimit,
            };
        } else {
            let Estimate_gasdata = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "eth_gasPrice",
                "params": []
            }
            let Gas_price = await Tron_GeBalance(Estimate_gasdata)
            let gasprice = await tronWeb.toDecimal(Gas_price?.result)
            let gaslimit = await tronWeb.toDecimal(0x35c)
            let Estimated_Gas = (gasprice * gaslimit) / 1e6

            return {
                gasFee: Estimated_Gas,
            }

        }

    } catch (e) {
        console.log("tronEstimateGasFee_err", e);
    }
}

//Estimate evm gasfee

export const UseWeb3 = async (data) => {

    try {
      const RPC_URL = EVM_RPC[data?.coin?.tolowerCase()] //UseRPCURL(tokenType);
      console.log("chefaksdgjaskfgjlasjfglasjflasjflas in use web3", tokenType, RPC_URL);
      const httpProvider = new Web3.providers.HttpProvider(RPC_URL);
      const web3 = new Web3(httpProvider);
      return web3;
    } catch (err) {
      console.log("UseWeb3", err)
    }
  };

  const EstGas = async (data, toAddress, amount , decimal) => {
    try {
      const TokenContract = await UsePrivateERC20(data.contractAddress, data.privateKey, data.tokenType)
      let sendamount = amount * (10**decimal)
      /* Encode Transfer ABI */
      let encoded = await TokenContract.methods.transfer(toAddress, sendamount.toString()).encodeABI();
      return encoded
    } catch (e) {
      console.log('EstGas_err', e);
      return {
        status: false
      }
    }
  }

export const evmEstimateGasFee = async (data) => {
    try {
      let gasFee = 0
      let { toAddress, amount, walletaddress, type, tokenType, currency } = data
      const web3 = await UseWeb3(data);
      const gasPrice = await web3.eth.getGasPrice()
      const encoded = type == 'token' ? await EstGas(data, toAddress, amount) : ""
      //Calculate-Estimategasfee
      if (type == 'token') {
        gasFee = await web3.eth.estimateGas({ from: walletaddress, toAddress, encoded })
      } else {
        gasFee = await web3.eth.estimateGas({ from: walletaddress, toAddress })
      }
      return {
        gasFee: gasFee ? ((gasPrice * gasFee) / 10 ** 18).toFixed(5) : 0,
      };
    } catch (e) {
      console.log("evmEstimateGasFee_err", e);
    }
  }

export const btcEstimatedGasPrice = async () => {
    try {
        let response = await axios.get(`${"https://mempool.space/testnet/api/v1/fees/recommended"}`);
        if (response.data == '' || response.data == undefined || response.data == null) {
            let data = {economyFee: 4, hourFee: 150, fastestFee: 262} 
            var Data = {data: data,}
            return Data;
        }else {
            var Data = {data: response.data,}
            return Data;
        }
    } catch (err) {
        console.log("EstimatedGasPrice err", err);
    }
}


export const EstimateGasFee = async(data)=> {
    try{
        if(data?.coin?.tolowerCase() == "tbtc" || data?.coin?.tolowerCase() == "btc"){
            let result = await btcEstimatedGasPrice();
        }
        if(data?.coin?.tolowerCase() == "ttrx" || data?.coin?.tolowerCase() == "trx"){
            let result = await tronEstimateGasFee()
        }
        else{
            let result = await evmEstimateGasFee()
        }
    }
    catch(e){
        console.log("error on estimate gas" , e);
    }
}
