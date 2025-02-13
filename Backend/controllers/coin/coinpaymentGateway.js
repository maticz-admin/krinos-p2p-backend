// import package
import coinpayments from 'coinpayments';
import qs from 'querystring'
import fs from 'fs'

// import config
import config from '../../config';
import { balMoveToBNBTask } from '../../config/cron';

// import model
import {
    Currency,
    Transaction,
    Assets,
    Wallet,
    User
} from '../../models';

// import controller
import { mailTemplateLang } from '../emailTemplate.controller';
import * as binanceCtrl from '../binance.controller';
import { createPassBook } from '../passbook.controller';

// import lib
import { createHmac } from '../../lib/crypto';
import isEmpty from '../../lib/isEmpty';

var coinPayment = new coinpayments({
    key: config.coinpaymentGateway.PUBLIC_KEY,
    secret: config.coinpaymentGateway.PRIVATE_KEY,
});

export const createAddress = async (currencySymbol, emailId, ipnUrl) => {
    try {
        //emailId = emailId;
      //  ipnUrl = config.IPN_URL;
    //   let cursym = currencySymbol == "BNB(Bep20)" ? "BNB.BSC" : currencySymbol;
        let respData = await coinPayment.getCallbackAddress({ currency: currencySymbol, label: emailId, ipn_url: ipnUrl });
        return {
            'address': respData.address,
            'privateKey': '',
            'destTag': respData.dest_tag       //currencySymbol == 'XRP' ? : ""
        }
    } catch (err) {
        return {
            'address': '',
            'privateKey': '',
            'destTag': ''
        }
    }
}

export const createWithdrawal = async ({
    currencySymbol,
    amount,
    address,
    destTag
}) => {
    try {
        let respData = await coinPayment.createWithdrawal({
            'amount': parseFloat(amount),
            address,
            'currency': currencySymbol
        });

        return {
            status: true,
            data: respData
        }
    } catch (err) {
        return {
            status: false,
            message: err.toString()
        }
    }
}

/** 
 * Generate Signature
*/
export const generateSign = (secretKey, payload) => {
    let payloadString = qs.stringify(payload).replace(/%20/g, `+`);
    const signature = createHmac(`sha512`, secretKey)
    signature.update(payloadString)
    return signature.digest('hex');
}

export const verifySign = (req, res, next) => {
    try {
        let reqBody = req.body;
        let header = req.headers;


        if (isEmpty(reqBody)) {
            return res.status(400).json({ 'success': false, 'message': 'MISSING_PAYLOAD' })
        }

        if (isEmpty(header['hmac'])) {
            return res.status(400).json({ 'success': false, 'message': 'MISSING_API_SIGNATURE' })
        }

        if (isEmpty(reqBody.ipn_mode)) {
            return res.status(400).json({ 'success': false, 'message': 'MISSING_IPN_MODE' })
        }

        if (reqBody.ipn_mode != 'hmac') {
            return res.status(400).json({ 'success': false, 'message': 'MISMATCH_IPN_MODE' })
        }


        if (isEmpty(reqBody.merchant)) {
            return res.status(400).json({ 'success': false, 'message': 'MISSING_MERCHANT' })
        }

        if (reqBody.merchant != config.coinpaymentGateway.MERCHANT_ID) {
            return res.status(400).json({ 'success': false, 'message': 'MISMATCH_MERCHANT_ID' })
        }

        let createSign = generateSign(config.coinpaymentGateway.IPN_SECRET, reqBody)

        if (createSign != header['hmac']) {
            return res.status(400).json({ 'success': false, 'message': 'MISMATCH_API_SIGNATURE' })
        }

        return next()
    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': 'SOMETHING_WRONG' })
    }
}


function write_log(msg) {
    try {
        var now = new Date();
        var log_file =
            "log/common_log_" +
            now.getFullYear() +
            now.getMonth() +
            now.getDay() +
            ".txt";
        fs.appendFileSync(log_file, msg);
        return true;
    } catch (err) {
    }
}

/** 
 * Coin Payment Deposit Webhook
 * URL: /api/depositwebhook
 * BODY : currency, address, txn_id, amount, dest_tag
*/
export const depositwebhook = async (req, res) => {
    write_log(JSON.stringify(req.body))
    write_log(JSON.stringify(req.headers))
    try {
        let reqBody = req.body;
        if (reqBody.status >= '100') {
            let currencyData = await Currency.findOne({ 'coinpaymentsymbol': reqBody.currency })

            if (!currencyData) {
                return res.status(400).json({ 'success': false, 'messages': "Invalid currency" })
            }

            // findOne({ assets: { $elemMatch: { _id: ObjectId("63a97d329b330bcc5ebf67e0") , address: "36kdopUXemzyGPb2tWxFYmMT8oCWBqKXBW" , destTag: '' } }})

            let findAsset = {
                '_id': currencyData._id,
                'address': reqBody.address
            }

            // if (currencyData.symbol == 'XRP') {
                findAsset['destTag'] = reqBody.dest_tag ? reqBody.dest_tag : "";
            // }

            // let userAssetData = await Assets.findOne(findAsset).populate({ path: "userId" })
            let usrWallet = await Wallet.findOne({ assets: { $elemMatch: findAsset }})
            let userAssetData = await Wallet.findOne({ assets: { $elemMatch: findAsset }}).populate({ path: "_id" })
        //    let userId = await User.findOne({ userId: usrWallet.userId });
            let userWalletData = usrWallet.assets.id(currencyData._id);
            if (!userWalletData) {
                return res.status(400).json({ 'success': false, 'messages': "Invalid assets" })
            }
            
            // if (userAssetData && !userAssetData.userId) {
            //     return res.status(400).json({ 'success': false, 'messages': "Invalid user data" })
            // }

            let trxnData = await Transaction.findOne({ 'currencyId': currencyData._id, 'txid': reqBody.txn_id });

            if (trxnData) {
                return res.status(400).json({ 'success': false, 'messages': "Already payment exists" })
            }
            let transactions = new Transaction();
            transactions["userId"] = usrWallet.userId;
            transactions["currencyId"] = currencyData._id;
            transactions["coin"] = reqBody.currency;
            transactions["toAddress"] = reqBody.address;
            transactions["amount"] = reqBody.amount;
            transactions["actualAmount"] = reqBody.amount;
            transactions["txid"] = reqBody.txn_id;
            transactions["status"] = 'completed';
            transactions["paymentType"] = 'coin_deposit';
            transactions["commissionFee"] = reqBody.fee;
            if (currencyData.symbol == 'XRP') {
                transactions["destTag"] = reqBody.dest_tag;
            }

            let trxData = await transactions.save();

            

            let beforeBalance = parseFloat(userWalletData.p2pBal);
            userWalletData.p2pBal = parseFloat(userWalletData.p2pBal) + parseFloat(reqBody.amount)
            await usrWallet.save();

            // CREATE PASS_BOOK
            createPassBook({
                'userId' : usrWallet._id,
                'coin' : currencyData.coin,
                'currencyId' : currencyData._id,
                'tableId' : trxData._id,
                'beforeBalance' : beforeBalance,
                'afterBalance' : parseFloat(userWalletData.p2pBal),
                'amount' : parseFloat(reqBody.amount),
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
                'amount': parseFloat(reqBody.amount).toFixed(8),
                'transactionId': reqBody.txn_id,
                'currency': reqBody.currency,
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


/** 
 * Coin Payment Amount Move To Binance Account
*/
balMoveToBNBTask.start();
export const balMoveToBinance = async () => {
    balMoveToBNBTask.stop();
    try {
        let currencyData = await Currency.find({ 'type': { "$in": ['crypto'] } })
        if (currencyData && currencyData.length) {

            let balDetails = await coinPayment.balances()

            for (const [currency, coinBal] of Object.entries(balDetails)) {

                if (coinBal && parseFloat(coinBal.balancef) > 0) {
                    let binanceAddress = await binanceCtrl.depositAddress(currency);
                    if (binanceAddress && binanceAddress.status) {
                        await createWithdrawal({
                            'currencySymbol': currencyData.currencySymbol,
                            'amount': coinBal.balancef,
                            'address': binanceAddress.address,
                            'destTag': binanceAddress.tag
                        })
                    }
                }

            }

            balMoveToBNBTask.start()
        }
    } catch (err) {
        balMoveToBNBTask.start()
    }
}