const { BitGo } = require('bitgo');

import Currency from "../models/currency";
import Wallet from "../models/wallet";
import Transaction from "../models/Transaction";
import { createPassBook } from './passbook.controller';
import { mailTemplateLang } from '../controllers/emailTemplate.controller';


const ACCESS_TOKEN = "v2x4f64554b8e88600a5a12ef8d37193cd6739f3b6db4dbd2a5982d8fe276f6c89c"
//"v2x6e5c38b17ddcf2f1cdb545245cfa77378988bfa46755f389697b4b2c0754d501"//without ip
const ENTERPRICE_ID = "67c9458ecaef5bed16fc5d5ea8331431"
const WEBHOOK_URL = "";

const bitgo = new BitGo({
    accessToken: ACCESS_TOKEN,
    env: 'test',
    });

export const CreateAddress = async(symbol , label , phrase) => {
    try{
        const { wallet } = await bitgo.coin(symbol).wallets().generateWallet({
            label: label, //'murugavelrajmaticz@gmail.com',
            passphrase: phrase, //'murugavelwallet',
            enterprise: ENTERPRICE_ID
        });
        let addwebhok = await wallet.addWebhook({
            type: 'transfer',
            allToken: false,
            url: WEBHOOK_URL,
            label: 'For Transaction',
        })
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
        let reqBody = req?.body;
        if (reqBody?.state == 'confirmed' && reqBody?.transferType == "receive") {
            let currencyData = await Currency.findOne({ 'coinpaymentsymbol': reqBody?.coin })
            if (!currencyData) {
                return res.status(400).json({ 'success': false, 'messages': "Invalid currency" })
            }
            let findAsset = {
                '_id': currencyData._id,
                'address': reqBody?.receiver 
            }
            let usrWallet = await Wallet.findOne({ assets: { $elemMatch: findAsset }})
            let userAssetData = await Wallet.findOne({ assets: { $elemMatch: findAsset }}).populate({ path: "_id" })
            let userWalletData = usrWallet.assets.id(currencyData._id);
            if (!userWalletData) {
                return res.status(400).json({ 'success': false, 'messages': "Invalid assets" })
            }
            let trxnData = await Transaction.findOne({ 'currencyId': currencyData._id, 'txid': reqBody.txn_id });

            if (trxnData) {
                return res.status(400).json({ 'success': false, 'messages': "Already payment exists" })
            }
            let transactions = new Transaction();
            transactions["userId"] = usrWallet?.userId;
            transactions["currencyId"] = currencyData?._id;
            transactions["coin"] = reqBody?.coin;
            transactions["toAddress"] = reqBody?.receiver;
            transactions["amount"] = reqBody?.value/10**8;
            transactions["actualAmount"] = reqBody?.baseValue/10**8;
            transactions["txid"] = reqBody?.hash;
            transactions["status"] = 'completed';
            transactions["paymentType"] = 'coin_deposit';
            transactions["commissionFee"] = parseFloat(reqBody?.feeString)/10**8;
            transactions["transfer_id"] = reqBody?.transfer;
            // if (currencyData.symbol == 'XRP') {
            //     transactions["destTag"] = reqBody.dest_tag;
            // }

            let trxData = await transactions.save();

            

            let beforeBalance = parseFloat(userWalletData.p2pBal);
            userWalletData.p2pBal = parseFloat(userWalletData.p2pBal) + parseFloat(reqBody?.value/10**8)
            await usrWallet.save();

            // CREATE PASS_BOOK
            createPassBook({
                'userId' : usrWallet._id,
                'coin' : currencyData.coin,
                'currencyId' : currencyData._id,
                'tableId' : trxData._id,
                'beforeBalance' : beforeBalance,
                'afterBalance' : parseFloat(userWalletData.p2pBal),
                'amount' : parseFloat(reqBody?.value/10**8),
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
                'amount': parseFloat(reqBody?.value/10**8).toFixed(8),
                'transactionId': reqBody?.hash,
                'currency': reqBody?.coin,
            };

            mailTemplateLang({
                'userId': userAssetData._id._id,
                'identifier': 'User_deposit',
                'toEmail': userAssetData._id.email,
                content
            })

            return res.status(200).json({ 'success': true, 'messages': "Updated successfully" })
        }
        return res.status(400).json({ 'success': true, 'messages': "Payment status pending" })
    } catch (err) {
        return res.status(500).json({ 'success': false, 'messages': "Error on server" })
    }
}


export const WithdrawAmount = async(req , res) => {
    try{
        let {coin , amount , receiveraddress} = req?.body;
        let currencyData = await Currency.findOne({ 'coinpaymentsymbol': coin })
        if (!currencyData) {
            return res.status(400).json({ 'success': false, 'messages': "Invalid currency" })
        }
        let findAsset = {
            '_id': currencyData._id,
            'address': reqBody?.receiver 
        }
        let usrWallet = await Wallet.findOne({ assets: { $elemMatch: findAsset } })
        let userAssetData = await Wallet.findOne({ assets: { $elemMatch: findAsset } }).populate({ path: "_id" })
        let userWalletData = usrWallet.assets.id(currencyData._id);
        if (!userWalletData) {
            return res.status(400).json({ 'success': false, 'messages': "Invalid assets" })
        }
        if (userWalletData?.p2pBal > amount) {
            let userbalance = await GetBitgoBalance(coin, userWalletData?.bitgo_id);
            if (userbalance > amount) {
                let transfer = await SendAmount(userWalletData?.bitgo_id, coin, amount, receiveraddress)
            }
        }
        

    }
    catch(e){
        console.log("error on withdraw amount" , e);
    }
}



const WALLET_ID = "67dbaaefc9532fc37ee600f1ba71dc42";  // Your Source Wallet ID
const DESTINATION_WALLET_ID = "tb1p5c4p0uk4cv6juzrxcypgdstydds9x2crllcspc28cn4sre6jhg9skrkgyr"; // Your Destination Wallet ID
const COIN_TYPE = "tbtc"; // Use "btc", "eth", or "tbtc" (testnet BTC)

export async function internalTransfer() {
    try {
        const wallet = await bitgo.coin(COIN_TYPE).wallets().get({ id: WALLET_ID });

        console.log(`Wallet Found: ${wallet.label()} (${wallet.id()})`);

        // Internal Transfer
        const transfer = await wallet.send({
            amount: 1,  // Amount in satoshis (e.g., 100000 = 0.00000001 BTC)
            address: DESTINATION_WALLET_ID, // Destination Wallet ID within BitGo
            //walletPassphrase: process.env.WALLET_PASSPHRASE, // Needed if using a password-protected wallet
            type: "internal" // Internal transfer (avoids blockchain fees)
        });

        console.log("Transfer Successful:", transfer);
    //     const wallet = await bitgo.coin("tbtc").wallets().get({ id: "67dace8747425cbe905d49fd34b0a6bc" });
    // let transferlist = await wallet.transfers();
    // console.log("list of transaction" , transferlist);
    } catch (error) {
        console.error("Error in Internal Transfer:", error.message);
    }
}


