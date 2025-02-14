// import package
import mongoose from 'mongoose';
import node2fa from 'node-2fa';
import multer from 'multer';
import path from 'path';
import configp from "../config/index";
// import model
import {
    User,
    UserKyc,
    Transaction,
    Currency,
    Wallet
} from '../models';

// import controller
import { mailTemplateLang } from './emailTemplate.controller';
import { newNotification } from './notification.controller';
import * as coinCtrl from './coin.controller';
import { createPassBook } from './passbook.controller';

// import config
import config from '../config';
import { autoWithdraw } from '../config/cron';

// import lib
// import { comparePassword } from '../lib/bcrypt';
import imageFilter from '../lib/imageFilter';
import isEmpty from '../lib/isEmpty';
import { paymentType } from '../lib/displayStatue'
import { encryptString, decryptString, decryptObject, encodedata } from '../lib/cryptoJS'
import { precentConvetPrice } from '../lib/calculation';
import { paginationQuery, filterSearchQuery } from '../lib/adminHelpers';
import { findBtwDates, getTimeStamp } from '../lib/dateHelper'
import wallet from '../models/wallet';
import { transferToAddress } from './P2PCONTROLLER/token.controller';
import OwnerWallet from '../models/ownerwallet';


const ObjectId = mongoose.Types.ObjectId;

/** 
 * Multer Image Uploade 
*/
const walletStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.IMAGE.DEPOSIT_PATH);
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, 'file-' + Date.now() + path.extname(file.originalname));
    }
});

let walletUpload = multer({
    storage: walletStorage,
    fileFilter: imageFilter,
    limits: { fileSize: config.IMAGE.DEFAULT_SIZE }
}).fields([
    { name: 'image', maxCount: 1 }
])

export const uploadWalletDoc = (req, res, next) => {
    walletUpload(req, res, function (err) {
        if (!isEmpty(req.validationError)) {
            return res.status(400).json({ "success": false, 'errors': { [req.validationError.fieldname]: req.validationError.messages } })
        }
        else if (err instanceof multer.MulterError) {
            return res.status(400).json({ "success": false, 'errors': { [err.field]: "TOO_LARGE" } })
        }
        else if (err) {
            return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
        }
        return next();
    })
}

/** 
 * Decrypt Token
 * BODY : token
*/
export const decryptWallet = (req, res, next) => {
    try {
        let api_key = req.header("x-api-key");
        let authorization = req.header('Authorization')
        if (api_key !== null && api_key !== undefined && authorization == undefined) {
            return next();
        }
        else{
        let token = decryptObject(req.body.token)
        req.body = token;
        return next();
        }
    } catch (err) {
        return res.status(500).json({ 'status': false, 'message': "SOMETHING_WRONG" });
    }
}

// export const getWallet = async (req, res) => {
//     try {
//         let walletData = await Wallet.findOne({
//             '_id': req.user.id
//         }, {
//             '_id': 0,
//             'binSubAcctId': 1,
//             "assets._id": 1,
//             "assets.coin": 1,
//             "assets.address": 1,
//             "assets.destTag": 1,
//             "assets.spotBal": 1,
//             "assets.derivativeBal": 1
//         })
//         if (!walletData) {
//             return res.status(400).json({ 'success': false })
//         }
//         return res.status(200).json({ 'success': true, 'messages': "successfully", 'result': walletData.assets })
//     }
//     catch (err) {
//         return res.status(500).json({ 'success': false })
//     }
// }


export const getHideZeroStatus = async (req, res) => {
    try {
        let hideZeroStatus = await Wallet.findOne({
            '_id': req.user.id
        }, {
            "hideZeroStatus": 1,
        }
        )

        return res.status(200).json({ 'success': true, 'hideZeroStatus': hideZeroStatus, })

    } catch (err) {
        return res.status(500).json({ 'success': false })

    }
}


export const updateHideZeroStatus = async (req, res) => {
    try {
        let reqBody = req.body;

        const updateData = await wallet.findOneAndUpdate({ "_id": ObjectId(req.user.id) }, { hideZeroStatus: reqBody.hideZeroStatus }, { new: true },)

        return res.status(200).json({ 'success': true, message: "zero balance asstes hide  successfully" })

    } catch (err) {
        return res.status(500).json({ 'success': false })

    }
}
export const getWallet = async (req, res) => {
    try {
        let walletData = await Wallet.findOne({
            '_id': req.user.id
        }, {
            '_id': 0,
            "hideZeroStatus": 1,
            'binSubAcctId': 1,
            "assets._id": 1,
            "assets.coin": 1,
            "assets.address": 1,
            "assets.destTag": 1,
            "assets.spotBal": 1,
            "assets.derivativeBal": 1,
            "assets.p2pBal": 1
        })
        var userInfo = await User.findOne({
            '_id': req.user.id
        })

        if (!walletData) {
            return res.status(400).json(encodedata({ 'success': false }))
        }
        let assetList = [], usrAsset = walletData.assets;

        walletData.assets.map(function (el) {
            if (el.address == '') {
                assetList.push(el._id)
            }
        });
        if (assetList && assetList.length > 0) {
            let updateAsset = await updateAddress(assetList, req.user.userId, {
                'walletId': walletData._id,
                "binSubAcctEmail": req.user.binSubAcctEmail,
                "emailId": req.user.email ? req.user.email : userInfo.phoneNo
            })

            if (updateAsset && updateAsset.length > 0) {
                usrAsset = updateAsset
            }
        }
        return res.status(200).json(encodedata({ 'success': true, 'messages': "successfully", 'result': usrAsset, }))
    }
    catch (err) {
        return res.status(500).json(encodedata({ 'success': false }))
    }
}

//walletbalance

export const getbalance = async (req, res) => {
    try {
        let balancedata = await wallet.findOne({ "_id": req.user.id });
        if (!balancedata) {
            return res.status(400).json({ 'success': true, 'messages': "USER_NOT_FOUND" })
        }
        let assetDoc = balancedata.assets.find((val) => (val.coin == req.query.symbol));

        if (!assetDoc) {
            return res.status(400).json({ 'success': true, 'messages': "NOT_FOUND" })
        }
        let result = {
            "coin": assetDoc.coin,
            "coinbal": assetDoc.spotBal
        }
        return res.status(200).json({ 'success': true, 'messages': "success", 'result': result })
    }
    catch (err) {
        return res.status(500).json({ 'status': false, 'message': "Error occured" });
    }
}




/** 
 * Update Address for Existing User
*/
export const updateAddress = async (assetList, userId, option = {}) => {
    try {
        let currencyList = await Currency.aggregate([
            { "$match": { "_id": { "$in": assetList } } },
            {
                "$facet": {
                    "crypto": [
                        { "$match": { "type": 'crypto' } },
                        {
                            "$project": {
                                "type": 1,
                                "coin": 1,
                                "depositType": 1,
                                "tokenType": 1,
                                "coinpaymentsymbol" : 1
                            }
                        }
                    ],
                    "token": [
                        { "$match": { "type": 'token' } },
                        {
                            "$project": {
                                "type": 1,
                                "coin": 1,
                                "depositType": 1,
                                "tokenType": 1,
                                "coinpaymentsymbol" : 1
                            }
                        }
                    ],
                    "fiat": [
                        { "$match": { "type": 'fiat' } },
                        {
                            "$project": {
                                "type": 1,
                                "coin": 1,
                                "depositType": 1,
                                "tokenType": 1,
                                "coinpaymentsymbol" : 1
                            }
                        }
                    ],
                }
            },
        ]);
        let walletData;
        if (currencyList && currencyList.length > 0) {
            if (currencyList[0].crypto && currencyList[0].crypto.length > 0) {
                for (let cryptoData of currencyList[0].crypto) {
                    let cryptoDoc = await coinCtrl.generateCryptoAddr({
                        'currencyList': [cryptoData],
                        'option': { ...option, 'userId': userId }
                    })


                    walletData = await Wallet.findOneAndUpdate({
                        'userId': userId,
                        'assets._id': cryptoData._id
                    }, {
                        "$set": {
                            "assets.$.address": cryptoDoc[0].address,
                            "assets.$.destTag": cryptoDoc[0].destTag,
                            "assets.$.privateKey": cryptoDoc[0].privateKey,
                        }
                    }, {
                        "fields": {
                            '_id': 0,
                            'binSubAcctId': 1,
                            "assets._id": 1,
                            "assets.coin": 1,
                            "assets.address": 1,
                            "assets.destTag": 1,
                            "assets.spotBal": 1,
                            "assets.derivativeBal": 1,
                            "assets.p2pBal": 1,
                        },
                        "new": true

                    })
                }
            }

            if (currencyList[0].token && currencyList[0].token.length > 0) {
                for (let tokenData of currencyList[0].token) {
                    // walletData = await Wallet.findOneAndUpdate({
                    //     'userId': userId,
                    //     'assets._id': tokenData._id
                    // }, {
                    //     "$set": {
                    //         "assets.$.address": tokenData[0].address,
                    //         "assets.$.destTag": tokenData[0].destTag,
                    //         "assets.$.privateKey": tokenData[0].privateKey,
                    //     }
                    // }, {
                    //     "fields": {
                    //         '_id': 0,
                    //         'binSubAcctId': 1,
                    //         "assets._id": 1,
                    //         "assets.coin": 1,
                    //         "assets.address": 1,
                    //         "assets.destTag": 1,
                    //         "assets.spotBal": 1,
                    //         "assets.derivativeBal": 1,
                    //         "assets.p2pBal": 1,
                    //     },
                    //     "new": true

                    // })
                    let tokenDoc = await coinCtrl.generateTokenAddr({
                        'currencyList': [tokenData],
                        'walletData': walletData,
                    })

                    walletData = await Wallet.findOneAndUpdate({
                        'userId': userId,
                        'assets._id': tokenData._id
                    }, {
                        "$set": {
                            "assets.$.address": tokenDoc[0].address,
                            "assets.$.privateKey": tokenDoc[0].privateKey,
                        }
                    }, {
                        "fields": {
                            '_id': 0,
                            'binSubAcctId': 1,
                            "assets._id": 1,
                            "assets.coin": 1,
                            "assets.address": 1,
                            "assets.destTag": 1,
                            "assets.spotBal": 1,
                            "assets.derivativeBal": 1,
                            "assets.p2pBal": 1,
                        },
                        "new": true

                    })
                }
            }

            if (currencyList[0].fiat && currencyList[0].fiat.length > 0) {
                for (let fiatData of currencyList[0].fiat) {
                    let fiatDoc = await coinCtrl.generateFiatAddr({
                        'currencyList': [fiatData]
                    })

                    walletData = await Wallet.findOneAndUpdate({
                        'userId': userId,
                        'assets._id': fiatData._id
                    }, {
                        "$set": {
                            "assets.$.address": fiatDoc[0].address,
                        }
                    }, {
                        "fields": {
                            '_id': 0,
                            'binSubAcctId': 1,
                            "assets._id": 1,
                            "assets.coin": 1,
                            "assets.address": 1,
                            "assets.destTag": 1,
                            "assets.spotBal": 1,
                            "assets.derivativeBal": 1,
                            "assets.p2pBal": 1,
                        },
                        "new": true

                    })
                }
            }
            if (walletData) {
                return walletData.assets
            }
        }
        return []

    } catch (err) {
        return []
    }
}
/** 
 * Get Asset By Curreny
 * METHOD: GET
 * URL : /api/getAsset/:currencyId
*/
export const getAssetByCurrency = async (req, res) => {
    try {
        let walletDoc = await Wallet.findOne({ "_id": req.user.id });
        if (!walletDoc) {
            return res.status(400).json({ 'success': true, 'messages': "NOT_FOUND" })
        }

        let assetDoc = walletDoc.assets.id(req.params.currencyId);
        if (!assetDoc) {
            return res.status(400).json({ 'success': true, 'messages': "NOT_FOUND" })
        }

        let result = {
            "spotBal": assetDoc.spotBal,
            "derivativeBal": assetDoc.derivativeBal,
            'currencyId': assetDoc._id,
        }
        return res.status(200).json({ 'success': true, 'messages': "success", 'result': result })
    } catch (err) {
        return res.status(500).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Check User KYC
*/
export const checkUserKyc = async (req, res, next) => {
    try {
        let user = await User.findOne({ _id: req.user.id })
        if (!user.email) {
            return res.status(400).json({ "success": false, 'message': "EMAIL_SUMBIT" })
        }
        let userKyc = await UserKyc.findOne({ "userId": req.user.id });
        if (!user.email) {
            return res.status(400).json({ "success": false, 'message': "EMAIL_SUMBIT" })
        }
        if (!userKyc) {
            return res.status(400).json({ "success": false, 'message': "KYC_SUBMIT_ALERT" })
        }
        if (userKyc.idProof.status == 'approved' && userKyc.addressProof.status == 'approved') {
            return next();
        } else if (userKyc.idProof.status == 'pending' || userKyc.addressProof.status == 'pending') {
            return res.status(400).json({ "success": false, 'message': "Your KYC must be verified to proceed Deposit" })
        } else {
            return res.status(400).json({ "success": false, 'message': "KYC_SUBMIT_ALERT" })
        }
    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/** 
 * User Withdraw
 * URL: /api/fiatWithdraw
 * METHOD : POST
 * BODY: currencyId, amount, bankId, twoFACode
*/
export const withdrawFiatRequest = async (req, res) => {
    try {
        let api_key = req.header("x-api-key");
        if (api_key !== null && api_key !== undefined && req.user.withdraw !== true) {
            return res.status(400).json({ 'status': false, 'message': "You don't have permission to WithdrawFiatRequest" });
        }
        else {

            let reqBody = req.body;
            reqBody.amount = parseFloat(reqBody.amount);
            let userData = await User.findOne({ "_id": req.user.id, 'bankDetails._id': reqBody.bankId });

            if (!userData) {
                return res.status(400).json({ 'success': false, 'errors': { 'bankId': 'INVALID_BANK_ACCOUNT' } })
            }

            if (userData.google2Fa.secret == '') {
                return res.status(500).json({ "success": false, 'errors': { 'twoFACode': 'TWO_FA_MSG' } })
            }

            let verifyTwoFaCode = node2fa.verifyToken(userData.google2Fa.secret, reqBody.twoFACode);
            if (!(verifyTwoFaCode && verifyTwoFaCode.delta == 0)) {
                return res.status(400).json({ "success": false, 'errors': { 'twoFACode': "INVALID_CODE" } })
            }

            let bankDetails = userData.bankDetails.id(reqBody.bankId);
            if (!bankDetails) {
                return res.status(400).json({ 'success': false, 'errors': { 'bankId': 'INVALID_BANK_ACCOUNT' } })
            }

            let usrWallet = await Wallet.findOne({
                '_id': req.user.id
            }, {
                '_id': 1,
                'binSubAcctId': 1,
                "assets._id": 1,
                "assets.coin": 1,
                "assets.address": 1,
                "assets.destTag": 1,
                "assets.spotBal": 1,
                "assets.derivativeBal": 1,
                "assets.p2pBal": 1,
            })

            if (!usrWallet) {
                return res.status(400).json({ 'success': false, 'message': 'NO_DATA' })
            }

            let usrAsset = usrWallet.assets.id(reqBody.currencyId);
            if (!usrAsset) {
                return res.status(400).json({ 'success': false, 'message': 'NO_DATA' })
            }

            let curData = await Currency.findOne({ '_id': reqBody.currencyId })
            if (!curData) {
                return res.status(400).json({ 'success': false, 'message': 'NO_DATA' })
            }

            let finalAmount = reqBody.amount + precentConvetPrice(reqBody.amount, curData.withdrawFee);
            if (usrAsset.p2pBal < finalAmount) {
                return res.status(400).json({ 'success': false, 'errors': { 'finalAmount': 'INSUFFICIENT_BALANCE' } })
            }

            if (curData.minimumWithdraw > finalAmount) {
                return res.status(400).json({ 'success': false, 'errors': { 'finalAmount': 'WITHDRAW_TOO_LOW' } })
            }

            var transactions = new Transaction();
            transactions["userId"] = req.user.userId;
            transactions["currencyId"] = reqBody.currencyId;
            transactions["coin"] = curData.coin;
            transactions["amount"] = finalAmount;
            transactions["actualAmount"] = reqBody.amount;
            transactions["paymentType"] = 'fiat_withdraw';
            transactions["commissionFee"] = curData.withdrawFee;
            transactions['bankDetail'] = bankDetails;
            transactions["status"] = 'new';


            let beforeBalance = parseFloat(usrAsset.spotBal);
            usrAsset.spotBal = parseFloat(usrAsset.spotBal) - parseFloat(finalAmount);
            let updateWallet = await usrWallet.save();
            let trxData = await transactions.save();

            // usrAsset.spotBal = usrAsset.spotBal - finalAmount;
            // let updateWallet = await usrWallet.save();
            // let trxData = await transactions.save();



            // CREATE PASS_BOOK
            createPassBook({
                'userId': req.user.id,
                'coin': curData.coin,
                'currencyId': reqBody.currencyId,
                'tableId': trxData._id,
                'beforeBalance': beforeBalance,
                'afterBalance': parseFloat(usrAsset.spotBal),
                'amount': parseFloat(finalAmount),
                'type': 'fiat_withdraw_request',
                'category': 'debit'
            })



            let encryptToken = encryptString(trxData._id, true)
            let content = {
                'name': userData.firstName,
                'confirmMailUrl': `${config.FRONT_URL}/withdraw-fiat-verification/${encryptToken}`,
            };

            mailTemplateLang({
                'userId': req.user.id,
                'identifier': 'withdraw_request_fiat',
                'toEmail': userData.email,
                content
            })

            // newNotification({
            //     'userId': req.user.id,
            //     'currencyId': trxData.currencyId,
            //     'transactionId': trxData._id,
            //     'trxId': trxData._id,
            //     'currencySymbol': trxData.coin,
            //     'amount': trxData.amount,
            //     'paymentType': trxData.paymentType,
            //     'status': trxData.status,
            // })

            return res.status(200).json({ "success": true, 'message': 'VERIFICATION_LINK', 'result': updateWallet.assets })
        }
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/** 
 * User Withdraw
 * URL: /api/fiatWithdraw
 * METHOD : PATCH
 * BODY: token
*/
export const fiatRequestVerify = async (req, res) => {
    try {
        let reqBody = req.body;
        let transactionId = decryptString(reqBody.token, true)
        let trxData = await Transaction.findOne({ "_id": transactionId, 'paymentType': "fiat_withdraw" })
        if (!trxData) {
            return res.status(400).json({ "success": false, 'message': 'INVALID_TOKEN' })
        }

        if (trxData.status != 'new') {
            return res.status(400).json({ "success": false, 'message': 'EXPIRY_TOKEN' })
        }

        trxData.status = 'pending';
        let updateTrxData = await trxData.save();

        // newNotification({
        //     'userId': updateTrxData.userId,
        //     'currencyId': updateTrxData.currencyId,
        //     'transactionId': updateTrxData._id,
        //     'trxId': updateTrxData._id,
        //     'currencySymbol': updateTrxData.coin,
        //     'amount': updateTrxData.amount,
        //     'paymentType': updateTrxData.paymentType,
        //     'status': updateTrxData.status,
        // })

        return res.status(200).json({ "success": true, 'message': 'Successfully verifed withdraw request' })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/** 
 * Coin Withdraw
 * URL: /api/coinWithdraw
 * METHOD : POST
 * BODY: currencyId, coin, amount, receiverAddress, twoFACode
*/
export const withdrawCoinRequest = async (req, res) => {
    try {
        let api_key = req.header("x-api-key");
        if(api_key!==null && api_key!== undefined && req.user.withdraw !==true){
            console.log('------------------1');
             return res.status(400).json(encodedata({ 'status': false, 'message': "You don't have permission to WithdrawCoinRequest" }));      
        }
        else{
        let reqBody = req.body;
        reqBody.amount = parseFloat(reqBody.amount);
        let userData = await User.findOne({ "_id": req.user.id });

        if (userData.google2Fa.secret == '') {
            console.log('------------------2');

            return res.status(500).json(encodedata({ "success": false, 'errors': { 'twoFACode': 'TWO_FA_MSG' } }))
        }

        let verifyTwoFaCode = node2fa.verifyToken(userData.google2Fa.secret, reqBody.twoFACode);
        if (!(verifyTwoFaCode && verifyTwoFaCode.delta == 0)) {
            console.log('------------------3');

            return res.status(400).json(encodedata({ "success": false, 'errors': { 'twoFACode': "INVALID_CODE" } }))
        }

        let usrWallet = await Wallet.findOne({
            '_id': req.user.id
        }, {
            '_id': 1,
            'binSubAcctId': 1,
            "assets._id": 1,
            "assets.coin": 1,
            "assets.address": 1,
            "assets.destTag": 1,
            "assets.spotBal": 1,
            "assets.derivativeBal": 1,
            "assets.p2pBal": 1,
        })
        if (!usrWallet) {
            console.log('------------------4');

            return res.status(400).json(encodedata({ 'success': false, 'message': 'NO_DATA' }))
        }

        let usrAsset = usrWallet.assets.id(reqBody.currencyId);
        if (!usrAsset) {
            console.log('------------------5');

            return res.status(400).json(encodedata({ 'success': false, 'message': 'NO_DATA' }))
        }

        if (reqBody.coin != 'XRP' && usrAsset.address == reqBody.receiverAddress) {
            console.log('------------------6');

            return res.status(400).json(encodedata({ 'success': false, 'errors': { 'receiverAddress': 'RECEIVER_ADDRESS_SHOULD_DIFFER' } }))
        }

        if (reqBody.coin == 'XRP' && usrAsset.destTag == reqBody.destTag) {
            console.log('------------------7');

            return res.status(400).json(encodedata({ 'success': false, 'errors': { 'destTag': 'RECEIVER_TAG_SHOULD_DIFFER' } }))
        }

        let curData = await Currency.findOne({ '_id': reqBody.currencyId })
        if (!curData) {
            console.log('------------------8');

            return res.status(400).json(encodedata({ 'success': false, 'message': 'NO_DATA' }))
        }

        // let finalAmount = reqBody.amount + precentConvetPrice(reqBody.amount, curData.withdrawFee)
        let finalAmount = reqBody.finalAmount //+ parseFloat(curData.withdrawFee)
        if (usrAsset.p2pBal < finalAmount) {
            console.log('------------------9');

            return res.status(400).json(encodedata({ 'success': false, 'errors': { 'finalAmount': 'INSUFFICIENT_BALANCE' } }))
        }

        var transactions = new Transaction();
        transactions["userId"] = req.user.userId;
        transactions["currencyId"] = reqBody.currencyId;
        transactions["coin"] = curData.coin;
        transactions["fromAddress"] = usrAsset.address;
        transactions["toAddress"] = reqBody.receiverAddress;
        transactions["destTag"] = isEmpty(reqBody.destTag) ? '' : reqBody.destTag;
        transactions["amount"] = finalAmount;
        transactions["actualAmount"] = reqBody.amount;
        transactions["paymentType"] = 'coin_withdraw';
        transactions["commissionFee"] = curData.withdrawFee;
        transactions["txid"] = '';
        transactions["type"] = curData.depositType;
        transactions["status"] = 'pending';
        transactions["coinpaymentsymbol"] = curData?.coinpaymentsymbol

        // usrAsset.spotBal = usrAsset.spotBal - finalAmount;
        // let updateWallet = await usrWallet.save();
        // let trxData = await transactions.save();

        let beforeBalance = parseFloat(usrAsset.p2pBal);
        usrAsset.p2pBal = parseFloat(usrAsset.p2pBal) - parseFloat(finalAmount);
        let updateWallet = await usrWallet.save();
        let trxData = await transactions.save();

        // CREATE PASS_BOOK
        createPassBook({
            'userId': req.user.id,
            'coin': curData.coin,
            'currencyId': reqBody.currencyId,
            'tableId': trxData._id,
            'beforeBalance': beforeBalance,
            'afterBalance': parseFloat(usrAsset.spotBal),
            'amount': parseFloat(finalAmount),
            'type': 'coin_withdraw_request',
            'category': 'debit',
            "coinpaymentsymbol" : curData?.coinpaymentsymbol
        })


        let encryptToken = encryptString(trxData._id, true)
        let content = {
            'name': userData.firstName,
            'withdrawApprove': `${config.FRONT_URL}/withdraw-approve/${encryptToken}`,
            'cancelWithdraw': `${config.FRONT_URL}/withdraw-cancel/${encryptToken}`,
        };

        // mailTemplateLang({
        //     'userId': req.user.id,
        //     'identifier': 'withdraw_request',
        //     'toEmail': userData.email,
        //     content
        // })

        // newNotification({
        //     'userId': trxData.userId,
        //     'currencyId': trxData.currencyId,
        //     'transactionId': trxData._id,
        //     'trxId': trxData._id,
        //     'currencySymbol': trxData.currencySymbol,
        //     'amount': trxData.amount,
        //     'paymentType': trxData.paymentType,
        //     'status': trxData.status,
        // })
        return res.status(200).json(encodedata({ "success": true, 'message': 'VERIFICATION_LINK', 'result': updateWallet.assets }))
    }
}
    catch (err) {
        console.log('------------------', err);

        return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))
    }
}

export const withdrawfee = async (req, res) => {
    try {
        var currencyId=req.body.currencyId
        var withdrawamount=req.body.amount
        let CurrencyData = await Currency.findOne({ '_id': currencyId })
        let finalAmount = parseFloat(CurrencyData.withdrawFee)
        return res.status(200).json({ 'success': true, 'messages': "success", 'result': finalAmount })
    }
    catch(err){
        return res.status(500).json({ "success": false, 'message': "Error occured" })
    }
}

/** 
 * User Withdraw
 * URL: /api/fiatWithdraw
 * METHOD : PATCH
 * BODY: token
*/
export const coinRequestVerify = async (req, res) => {
    try {
        let reqBody = req.body;
        let transactionId = decryptString(reqBody.token, true)
        let trxData = await Transaction.findOne({ "_id": transactionId, 'paymentType': "coin_withdraw" })
        if (!trxData) {
            return res.status(400).json({ "success": false, 'message': 'INVALID_TOKEN' })
        }

        if (trxData.status != 'new') {
            return res.status(400).json({ "success": false, 'message': 'EXPIRY_TOKEN' })
        }

        trxData.status = 'pending';
        let updateTrxData = await trxData.save();

        // newNotification({
        //     'userId': updateTrxData.userId,
        //     'currencyId': updateTrxData.currencyId,
        //     'transactionId': updateTrxData._id,
        //     'trxId': updateTrxData._id,
        //     'currencySymbol': updateTrxData.currencySymbol,
        //     'amount': updateTrxData.amount,
        //     'paymentType': updateTrxData.paymentType,
        //     'status': updateTrxData.status,
        // })

        return res.status(200).json({ "success": true, 'message': 'Successfully verify withdraw request' })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/** 
 * Sent Deposit Request To Admin
 * URL: /api/fiatDeposit
 * METHOD : POST
 * BODY : userAssetId, amount, image
*/
export const depositRequest = async (req, res) => {
    try {
        let reqBody = req.body;
        let reqFile = req.files;

        let usrWallet = await Wallet.findOne({ "_id": req.user.id });
        if (!usrWallet) {
            return res.status(400).json({ 'success': false, 'message': 'NO_DATA' })
        }

        let usrAsset = usrWallet.assets.id(reqBody.userAssetId)
        if (!usrAsset) {
            return res.status(400).json({ 'success': false, 'message': 'NO_DATA' })
        }

        let newDoc = new Transaction({
            userId: req.user.userId,
            currencyId: usrAsset._id,
            actualAmount: reqBody.amount,
            amount: reqBody.amount,
            coin: usrAsset.coin,
            status: "pending",
            paymentType: "fiat_deposit",
            image: reqFile.image[0].filename,
        })

        let updateTrxData = await newDoc.save();

        // newNotification({
        //     'userId': updateTrxData.userId,
        //     'currencyId': updateTrxData.currencyId,
        //     'transactionId': updateTrxData._id,
        //     'trxId': updateTrxData._id,
        //     'currencySymbol': updateTrxData.currencySymbol,
        //     'amount': updateTrxData.amount,
        //     'paymentType': updateTrxData.paymentType,
        //     'status': updateTrxData.status,
        // })

        return res.status(200).json({ 'success': true, 'message': "DEPOSIT_REQUEST_SUCCESS" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/** 
 * Wallet Transfer
 * URL: /api/walletTransfer
 * METHOD : POST
 * BODY : fromType, toType, userAssetId, amount
*/
export const walletTransfer = async (req, res) => {
    try {
        let reqBody = req.body;
        reqBody.amount = parseFloat(reqBody.amount);

        let usrWallet = await Wallet.findOne({
            "_id": req.user.id,
        })

        if (!usrWallet) {
            return res.status(400).json({ 'success': false, 'message': 'NO_DATA' })
        }

        let usrAsset = usrWallet.assets.id(reqBody.userAssetId)

        if (!usrAsset) {
            return res.status(400).json({ 'success': false, 'message': 'NO_DATA' })
        }

        let currencyDoc = await Currency.findOne({ "_id": reqBody.userAssetId })

        if (!currencyDoc) {
            return res.status(400).json({ 'success': false, 'message': 'NO_DATA' })
        }

        if (reqBody.fromType == 'spot') {

            if (usrAsset.spotBal <= 0) {
                return res.status(400).json({ 'success': false, 'message': 'INSUFFICIENT_BALANCE' })
            }

            if (usrAsset.spotBal < reqBody.amount) {
                return res.status(400).json({ 'success': false, 'message': 'INSUFFICIENT_BALANCE' })
            }

            usrAsset.spotBal = usrAsset.spotBal - reqBody.amount;

            if (reqBody.toType == 'derivative') {
                usrAsset.derivativeBal = usrAsset.derivativeBal + reqBody.amount;
            } else if (reqBody.toType == 'p2p') {
                usrAsset.p2pBal = usrAsset.p2pBal + reqBody.amount;
            }
        } else if (reqBody.fromType == 'derivative') {
            if (usrAsset.derivativeBal <= 0) {
                return res.status(400).json({ 'success': false, 'message': 'INSUFFICIENT_BALANCE' })
            }

            if (usrAsset.derivativeBal < reqBody.amount) {
                return res.status(400).json({ 'success': false, 'message': 'INSUFFICIENT_BALANCE' })
            }

            usrAsset.derivativeBal = usrAsset.derivativeBal - reqBody.amount;

            if (reqBody.toType == 'spot') {
                usrAsset.spotBal = usrAsset.spotBal + reqBody.amount;
            } else if (reqBody.toType == 'p2p') {
                usrAsset.p2pBal = usrAsset.p2pBal + reqBody.amount;
            }
        } else if (reqBody.fromType == 'p2p') {
            if (usrAsset.p2pBal <= 0) {
                return res.status(400).json({ 'success': false, 'message': 'INSUFFICIENT_BALANCE' })
            }

            if (usrAsset.p2pBal < reqBody.amount) {
                return res.status(400).json({ 'success': false, 'message': 'INSUFFICIENT_BALANCE' })
            }

            usrAsset.p2pBal = usrAsset.p2pBal - reqBody.amount;

            // if (reqBody.toType == 'spot') {
            //     usrAsset.spotBal = usrAsset.spotBal + reqBody.amount;
            // } else if (reqBody.toType == 'derivative') {
            //     usrAsset.derivativeBal = usrAsset.derivativeBal + reqBody.amount;
            // }
        }

        let newTrnx = new Transaction({
            userId: req.user.id,
            currencyId: currencyDoc._id,
            actualAmount: reqBody.amount,
            amount: reqBody.amount,
            currencySymbol: currencyDoc.coin,
            status: "completed",
            paymentType: currencyDoc.type == 'crypto' ? "coin_transfer" : "fiat_transfer",
        })

        await usrWallet.save();
        await newTrnx.save();
        return res.json({ 'status': true, 'message': "WALLET_TRANSFER_SUCCESS" });

    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/** 
 * Fund Transfer User to User
 * URL: /api/fundTransfer
 * METHOD: POST
 * BODY: currencyId, toUserEmail, amount, twoFACode
*/
export const fundTransfer = async (req, res) => {
    try {
        let reqBody = req.body;
        reqBody.amount = parseFloat(reqBody.amount)
        reqBody.toUserEmail = reqBody.toUserEmail.toLowerCase();
        let toUserData = await User.findOne({ "email": reqBody.toUserEmail })
        if (!toUserData) {
            return res.status(500).json({ "success": false, 'errors': { 'toUserEmail': 'Email Not Exit' } })
        }

        let usrWallet = await Wallet.findOne({ "_id": req.user.id });
        if (!usrWallet) {
            return res.status(400).json({ 'success': false, 'message': 'NO_DATA' })
        }

        let usrAsset = usrWallet.assets.id(reqBody.currencyId)
        if (!usrAsset) {
            return res.status(400).json({ 'success': false, 'message': 'NO_DATA' })
        }

        if (req.user.google2Fa && !isEmpty(req.user.google2Fa.secret)) {

            let verifyTwoFaCode = node2fa.verifyToken(req.user.google2Fa.secret, reqBody.twoFACode);
            if (!(verifyTwoFaCode && verifyTwoFaCode.delta == 0)) {
                return res.status(400).json({ "success": false, 'errors': { 'twoFACode': "Invalid Code" } })
            }

            let curData = await Currency.findOne({ "_id": reqBody.currencyId })
            if (!curData) {
                return res.status(400).json({ 'success': false, 'message': 'NO_CURRENCY' })
            }

            let finalAmount = reqBody.amount + precentConvetPrice(reqBody.amount, curData.fundFee)
            if (usrAsset.spotBal < finalAmount) {
                return res.status(400).json({ 'success': false, 'errors': { 'finalAmount': 'INSUFFICIENT_BALANCE' } })
            }

            usrAsset.spotBal = usrAsset.spotBal - finalAmount;
            await usrWallet.save();

            await Wallet.updateOne({
                "_id": toUserData._id,
                'assets._id': reqBody.currencyId
            }, {
                "$inc": {
                    "assets.$.spotBal": reqBody.amount
                }
            })

            let transactionData = new Transaction({
                "userId": req.user.id,
                "currencyId": reqBody.currencyId,
                'coin': curData.coin,
                'amount': finalAmount,
                'actualAmount': reqBody.amount,
                'status': 'completed',
                'paymentType': 'fund',
                'toUserId': toUserData._id,
                'fromUserId': req.user.id,
            })
            await transactionData.save();
            return res.status(200).json({ 'success': true, 'message': "Amount transfer successfully" })
        } else {
            return res.status(500).json({ "success": false, 'errors': { 'twoFACode': 'Please enable two factor authentication' } })
        }
    } catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}

/** 
 * fundList
*/
export const fundList = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['coin']);

        filter['paymentType'] = { "$in": ["fund"] };

        let count = await Transaction.countDocuments(filter)

        let data = await Transaction.find(filter, {
            'userId': 1,
            'coin': 1,
            // "userAssetId": 1,
            "image": 1,
            "actualAmount": 1,
            "amount": 1,
            "txid": 1,
            "toUserId": 1,
            "status": 1,
            "paymentType": 1,
            "createdAt": 1
        }).sort({ "createdAt": -1 }).skip(pagination.skip).limit(pagination.limit);

        let result = {
            data,
            count: count.length
        }
        return res.status(200).json({ "success": true, result })
    } catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}

/** 
 * Get Transaction History
 * URL: /api/history/transaction/fiat
 * METHOD : GET
*/
export const getTrnxHistory = async (req, res) => {
    try {
        const { paymentType } = req.params;
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['currencySymbol', 'status']);

        if (!['fiat', 'crypto','token'.includes(paymentType)]) {
            return res.status(400).json(encodedata({ 'success': false, 'message': 'Invalid type' }))
        }
        if (paymentType == 'crypto') {
            if (req.query.type == 'all') {
                filter['paymentType'] = { "$in": ['coin_deposit', 'coin_withdraw', 'coin_transfer'] }
            } else if (req.query.type == 'deposit') {
                filter['paymentType'] = { "$in": ['coin_deposit'] }
            } else if (req.query.type == 'withdraw') {
                filter['paymentType'] = { "$in": ['coin_withdraw'] }
            } else if (req.query.type == 'transfer') {
                filter['paymentType'] = { "$in": ['coin_transfer'] }
            } else {
                filter['paymentType'] = { "$in": ['coin_deposit', 'coin_withdraw', 'coin_transfer'] }
            }
        } else if (paymentType == 'fiat') {
            if (req.query.type == 'all') {
                filter['paymentType'] = { "$in": ['fiat_deposit', 'fiat_withdraw', 'fiat_transfer'] }
            } else if (req.query.type == 'fiat_deposit') {
                filter['paymentType'] = { "$in": ['fiat_deposit'] }
            } else if (req.query.type == 'fiat_withdraw') {
                filter['paymentType'] = { "$in": ['fiat_withdraw'] }
            } else if (req.query.type == 'transfer') {
                filter['paymentType'] = { "$in": ['fiat_transfer'] }
            } else {
                filter['paymentType'] = { "$in": ['fiat_deposit', 'fiat_withdraw', 'fiat_transfer'] }
            }
        }

        // if(req.query.type == 'all'){
        //     filter['paymentType'] = { "$in": ['fiat_deposit', 'fiat_withdraw', 'fiat_transfer'] }
        // } else {
        //     filter['paymentType'] = paymentType
        // }
        filter['userId'] = req.user.userId
        if (req.query.coin != 'all') {
            filter['coin'] = req.query.coin;
        }

        const count = await Transaction.countDocuments(filter)
        const data = await Transaction.find(filter, {
            'createdAt': 1,
            'paymentType': 1,
            'coin': 1,
            'amount': 1,
            'bankDetail': 1,
            'status': 1,
            'toAddress': 1
        }).skip(pagination.skip).limit(pagination.limit).sort({ _id: -1 })

        let result = {
            data,
            count: count
        }
        return res.status(200).json(encodedata({ "success": true, result }))
    } catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'message': 'Error on server' }))
    }
}

/** 
 * Get Deposit List
 * URL : /adminapi/depositList
 * METHOD : GET
*/
export const getDepositList = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let Export = req.query.export;
        let filter = filterSearchQuery(req.query, ['toAddress', 'coin', 'txid', 'status']);
        filter['paymentType'] = { "$in": ["coin_deposit", "fiat_deposit"] };
        const header = ["Created date", "User Id", "To Address", "Coin", "Payment Type", "Transfer Amount", "Status"]

        if (Export == 'csv' || Export == 'xls') {
            let exportData = await Transaction.find(filter, {
                'userId': 1,
                'coin': 1,
                // "userAssetId": 1,
                "image": 1,
                "actualAmount": 1,
                "amount": 1,
                "txid": 1,
                "toAddress": 1,
                "status": 1,
                "paymentType": 1,
                "createdAt": 1
            }).sort({ "createdAt": -1 })
            let csvData = [
                header
            ]
            if (exportData && exportData.length > 0) {
                for (let item of exportData) {
                    let arr = []
                    arr.push(
                        item.createdAt.toLocaleString(),
                        item.userId,
                        item.paymentType == 'coin_deposit' ? '-' : elt.toAddress,
                        item.coin,
                        paymentType(item.paymentType),
                        item.amount,
                        item.status,
                    )
                    csvData.push(arr)
                }
            }
            return res.csv(csvData)

        } else if (Export == 'pdf') {
            let count = await Transaction.countDocuments(filter)

            let data = await Transaction.find(filter, {
                'userId': 1,
                'coin': 1,
                // "userAssetId": 1,
                "image": 1,
                "actualAmount": 1,
                "amount": 1,
                "txid": 1,
                "toAddress": 1,
                "status": 1,
                "paymentType": 1,
                "createdAt": 1
            }).sort({ "createdAt": -1 })
            // .skip(pagination.skip).limit(pagination.limit);

            let result = {
                pdfData: data,
                count: count
            }
            return res.status(200).json({ "success": true, result })
        } else {
            let count = await Transaction.countDocuments(filter)

            let data = await Transaction.find(filter, {
                'userId': 1,
                'coin': 1,
                // "userAssetId": 1,
                "image": 1,
                "actualAmount": 1,
                "amount": 1,
                "txid": 1,
                "toAddress": 1,
                "status": 1,
                "paymentType": 1,
                "createdAt": 1
            }).sort({ "createdAt": -1 }).skip(pagination.skip).limit(pagination.limit);

            let result = {
                data,
                count: count
            }

            return res.status(200).json({ "success": true, result })
        }
    } catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}

/** 
 * Get Withdraw List
 * URL : /adminapi/withdrawList
 * METHOD : GET
*/
export const getWithdrawList = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['userId', 'toAddress', 'coin', 'txid', 'status']);
        let Export = req.query.export
        const header = ["Created date", "User Id", "To Address/Account", "Coin", "PaymentType", "Transfer Amount", "Status"]
        filter['paymentType'] = { "$in": ["coin_withdraw", "fiat_withdraw"] };
        if (Export == 'csv' || Export == 'xls') {
            let count = await Transaction.countDocuments(filter)
            let exportData = await Transaction.find(filter, {
                'userId': 1,
                'coin': 1,
                // "userAssetId": 1,
                "image": 1,
                "actualAmount": 1,
                "amount": 1,
                "commissionFee": 1,
                "bankDetail": 1,
                "txid": 1,
                "toAddress": 1,
                "destTag": 1,
                "status": 1,
                "paymentType": 1,
                "createdAt": 1
            }).sort({ "createdAt": -1 })
            let csvData = [
                header
            ]
            if (exportData && exportData.length > 0) {
                for (let item of exportData) {
                    let arr = []
                    arr.push(
                        item.createdAt.toLocaleString(),
                        item.userId,
                        item.paymentType == 'fiat_withdraw' ? item.bankDetail.accountNo : item.toAddress,
                        item.coin,
                        paymentType(item.paymentType),
                        item.actualAmount,
                        item.status,
                    )
                    csvData.push(arr)
                }
            }
            return res.csv(csvData)
        } else if (Export == 'pdf') {
            let count = await Transaction.countDocuments(filter)
            let data = await Transaction.find(filter, {
                'userId': 1,
                'coin': 1,
                // "userAssetId": 1,
                "image": 1,
                "actualAmount": 1,
                "amount": 1,
                "commissionFee": 1,
                "bankDetail": 1,
                "txid": 1,
                "toAddress": 1,
                "destTag": 1,
                "status": 1,
                "paymentType": 1,
                "createdAt": 1
            }).sort({ "createdAt": -1 })
            // .skip(pagination.skip).limit(pagination.limit);

            let result = {
                PdfData: data,
                count: count
            }
            return res.status(200).json(encodedata({ "success": true, result }))
        } else {
            let count = await Transaction.countDocuments(filter)
            let data = await Transaction.find(filter, {
                'userId': 1,
                'coin': 1,
                // "userAssetId": 1,
                "image": 1,
                "actualAmount": 1,
                "amount": 1,
                "commissionFee": 1,
                "bankDetail": 1,
                "txid": 1,
                "toAddress": 1,
                "destTag": 1,
                "status": 1,
                "paymentType": 1,
                "createdAt": 1
            }).sort({ "createdAt": -1 }).skip(pagination.skip).limit(pagination.limit);
            let result = {
                data,
                count: count
            }
            return res.status(200).json(encodedata({ "success": true, result }))
        }
    } catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'message': 'Error on server' }))
    }
}

/** 
 * Approve Coin Withdraw
 * URL: /adminapi/coinWithdraw/approve
 * METHOD : POST
 * BODY: transactionId
*/
export const coinWithdrawApprove = async (req, res) => {
    try {
        let reqParam = req.params

        let trxData = await Transaction.findOneAndUpdate({
            '_id': reqParam.transactionId,
            'paymentType': 'coin_withdraw',
            'status': 'pending'
        }, {
            'status': 'completed'
        }, { 'new': true });

        if (!trxData) {
            return res.status(400).json({ "success": false, 'message': 'Invalid Token' })
        }
        let currencyData = await Currency.findOne({ _id: trxData.currencyId })
        if(currencyData?.depositType == "local"){
            let walletdata = await OwnerWallet.findOne({type : "WALLET"});
            let owner = walletdata?.privatekey //decryptString(walletdata?.privatekey);
            let result = await transferToAddress(currencyData?.contractAddress , 
                trxData.actualAmount , owner,
                trxData.toAddress , currencyData?.minABI , currencyData?.tokenType);

            if (!result.status) {
                return res.status(400).json({ "success": false, 'message': 'SOMETHING_WRONG' })
            }
            trxData.txid = result?.hash?.transactionHash;
            let updateTrxData = await trxData.save();
        }

        if(currencyData?.depositType == "coin_payment"){
            let withdrawData = await coinCtrl.coinWithdraw({
                'type': trxData.type,
                'coin': trxData.coinpaymentsymbol,                 //trxData.coin,
                'toAddress': trxData.toAddress,
                'amount': trxData.actualAmount,
                'currencyDetails': currencyData,
            })
            if (!withdrawData.status) {
                return res.status(400).json({ "success": false, 'message': 'SOMETHING_WRONG' })
            }
    
            trxData.txid = withdrawData.trxId;
            let updateTrxData = await trxData.save();
        }
        

        let usrData = await User.findOne({ 'userId': trxData.userId })
        if (usrData) {

            let content = {
                'amount': trxData.actualAmount,
                'currency': trxData.coin,
                'transactionId': reqParam.transactionId,
                'date': new Date(),
            };

            mailTemplateLang({
                'userId': usrData._id,
                'identifier': 'Withdraw_notification',
                'toEmail': usrData.email,
                content
            })

            // newNotification({
            //     'userId': updateTrxData.userId,
            //     'currencyId': updateTrxData.currencyId,
            //     'transactionId': updateTrxData._id,
            //     'trxId': updateTrxData._id,
            //     'currencySymbol': updateTrxData.currencySymbol,
            //     'amount': updateTrxData.amount,
            //     'paymentType': updateTrxData.paymentType,
            //     'status': updateTrxData.status,
            // })

        }

        return res.status(200).json({ 'success': true, 'message': "Withdraw successfully" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}


/** 
 * Approve Coin Withdraw
 * URL: /api/WithdrawCancel
 * METHOD : POST
 * BODY: authToken
*/
export const WithdrawCancel = async (req, res) => {
    try {

        let reqBody = req.body;
        let transactionId = decryptString(reqBody.token, true)
        let trxData = await Transaction.findOne({
            '_id': transactionId,
            'paymentType': 'coin_withdraw',
            'status': 'pending'
        })
        if (!trxData) {
            return res.status(400).json({ "success": false, 'message': 'Invalid Token' })
        }

        if (trxData && trxData.status != "pending") {
            return res.json({ status: false, message: "Your Withdraw Already " + trxData.status });
        }


        if (trxData && trxData.status == "pending") {
            trxData.status = "cancelled"
            await Wallet.updateOne({
                'userId': trxData.userId,
                'assets._id': trxData.currencyId
            }, {
                '$inc': {
                    'assets.$.spotBal': trxData.amount,
                }
            })
            await trxData.save()
            return res.json({ status: true, message: "Request Cancelled Successfully!!!" });
        }
        else {
            return res.json({ status: false, message: "Your Withdraw Already " + trxData.status });
        }
    } catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}


//problem in the auto withdraw
autoWithdraw.start();
export const AutoWithdraw = async () => {
    try {
        let TransactionData = await Transaction.aggregate([
            {
                "$match": {
                    status: "pending",
                    paymentType: "coin_withdraw"
                }
            },
            {
                "$lookup":
                {
                    "from": 'user',
                    "localField": "userId",
                    "foreignField": "userId",
                    "as": "userDetails"
                }
            },
            { "$unwind": "$userDetails" },

        ])

        let setTime = new Date(new Date().getTime() - 7200000); //2 hour
        for (let item of TransactionData) {
            if (item.status == "pending") {
                if (item.createdAt <= setTime) {
                    await Wallet.updateOne({
                        'userId': item.userId,
                        'assets._id': item.currencyId
                    }, {
                        '$inc': {
                            'assets.$.spotBal': item.amount,
                        }
                    })
                    await Transaction.findOneAndUpdate({
                        '_id': item._id,
                    },
                        {
                            "$set": {
                                "status": "time_expired"
                            }
                        })
                    let content = {
                        'amount': item.actualAmount,
                        'currency': item.coin,
                        'transactionId': '-',
                        'message': "Your Withdraw Cancelled Because Timed Out",
                        'date': new Date(),
                    };

                    mailTemplateLang({
                        'userId': item.userDetails._id,
                        'identifier': 'Withdraw_notification',
                        'toEmail': item.userDetails.email,
                        content
                    })
                }
            }
        }
    } catch (err) { }
}

/** 
 * Approve Coin Withdraw
 * URL: /api/WithdrawApprove
 * METHOD : POST
 * BODY: authToken
*/
export const WithdrawApprove = async (req, res) => {
    try {
        let reqBody = req.body;
        let transactionId = decryptString(reqBody.token, true)
        let trxData = await Transaction.findOne({
            '_id': transactionId,
            'paymentType': 'coin_withdraw',
            'status': 'pending'
        })
        if (!trxData) {
            return res.status(400).json({ "success": false, 'message': 'Invalid Token' })
        }

        let setTime = new Date(new Date().getTime() - 120000); //2 min

        if (trxData.createdAt <= setTime) {
            if (trxData && trxData.status == "pending") {
                trxData.status = "time_expired"

                await Wallet.updateOne({
                    'userId': trxData.userId,
                    'assets._id': trxData.currencyId
                }, {
                    '$inc': {
                        'assets.$.p2pBal': trxData.amount,
                    }
                })
                await trxData.save()
                return res.json({ status: false, message: "Your Withdraw Cancelled Because Time Expired!!!" });
            } else {
                return res.json({ status: false, message: "Your Withdraw Already " + trxData.status });
            }
        }

        if (trxData && trxData.status != "pending") {
            return res.json({ status: false, message: "Your Withdraw Already " + trxData.status });
        }

        let currencyData = await Currency.findOne({ _id: trxData.currencyId })
        if(currencyData?.depositType == "local"){

        }
        if(currencyData?.depositType == "coin_payment"){
            let withdrawData = await coinCtrl.coinWithdraw({
                'type': trxData.type,
                'coin': trxData.coinpaymentsymbol,   //trxData.coin,
                'toAddress': trxData.toAddress,
                'amount': trxData.actualAmount,
                'currencyDetails': currencyData,
            })
    
            if (!withdrawData.status) {
                return res.status(400).json({ "success": false, 'message': 'SOMETHING_WRONG' })
            }
    
            if (withdrawData.status) {
                trxData.txid = withdrawData.trxId;
                trxData.status = "completed";
                let updateTrxData = await trxData.save();
            }
        }
        

        let usrData = await User.findOne({ 'userId': trxData.userId })
        if (usrData) {

            let content = {
                'amount': trxData.actualAmount,
                'currency': trxData.coin,
                'transactionId': withdrawData.trxId,
                'message': "Your Withdraw Successfully Completed",
                'date': new Date(),
            };

            mailTemplateLang({
                'userId': usrData._id,
                'identifier': 'Withdraw_notification',
                'toEmail': usrData.email,
                content
            })

            // newNotification({
            //     'userId': updateTrxData.userId,
            //     'currencyId': updateTrxData.currencyId,
            //     'transactionId': updateTrxData._id,
            //     'trxId': updateTrxData._id,
            //     'currencySymbol': updateTrxData.currencySymbol,
            //     'amount': updateTrxData.amount,
            //     'paymentType': updateTrxData.paymentType,
            //     'status': updateTrxData.status,
            // })

        }

        return res.status(200).json({ 'success': true, 'message': "Withdraw successfully" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}

/** 
 * Reject Coin Withdraw
 * URL: /adminapi/coinWithdraw/reject
 * METHOD : POST
*/
export const coinWithdrawReject = async (req, res) => {
    try {
        let reqParam = req.params

        let trxData = await Transaction.findOneAndUpdate({
            '_id': reqParam.transactionId,
            'paymentType': 'coin_withdraw',
            'status': 'pending'
        }, {
            'status': 'rejected'
        }, { 'new': true });

        if (!trxData) {
            return res.status(400).json({ "success": false, 'message': 'Invalid Token' })
        }
        // await Wallet.updateOne({
        //     "userId": trxData.userId,
        //     'assets._id': trxData.currencyId
        // }, {
        //     "$inc": {
        //         "assets.$.spotBal": trxData.amount
        //     }
        // })

        let usrWallet = await Wallet.findOne({ 'userId': trxData.userId });
        let usrAsset = usrWallet.assets.id(trxData.currencyId);

        let beforeBalance = parseFloat(usrAsset.p2pBal);
        usrAsset.p2pBal = parseFloat(usrAsset.p2pBal) + parseFloat(trxData.amount);
        let updateWallet = await usrWallet.save();

        let usrData = await User.findOne({ 'userId': trxData.userId });
        if (usrData) {
            // CREATE PASS_BOOK
            createPassBook({
                'userId': usrData._id,
                'coin': trxData.coin,
                'currencyId': trxData.currencyId,
                'tableId': trxData._id,
                'beforeBalance': beforeBalance,
                'afterBalance': parseFloat(usrAsset.p2pBal),
                'amount': parseFloat(trxData.amount),
                'type': 'coin_withdraw_rejected',
                'category': 'credit'
            })
        }

        // newNotification({
        //     'userId': trxData.userId,
        //     'currencyId': trxData.currencyId,
        //     'transactionId': trxData._id,
        //     'trxId': trxData._id,
        //     'currencySymbol': trxData.currencySymbol,
        //     'amount': trxData.amount,
        //     'paymentType': trxData.paymentType,
        //     'status': trxData.status,
        // })

        return res.status(200).json({ 'success': true, 'message': "Withdraw successfully rejected" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}

/** 
 * Approve Fiat Withdraw
 * URL: /adminapi/coinWithdraw/approve
 * METHOD : POST
 * BODY: transactionId
*/
export const fiatWithdrawApprove = async (req, res) => {
    try {
        let reqParam = req.params

        let trxData = await Transaction.findOneAndUpdate({
            '_id': reqParam.transactionId,
            'paymentType': 'fiat_withdraw',
            'status': 'pending'
        }, {
            'status': 'completed'
        }, { 'new': true });

        if (!trxData) {
            return res.status(400).json({ "success": false, 'message': 'Invalid Token' })
        }

        let usrData = await User.findOne({ 'userId': trxData.userId })
        if (usrData) {
            let content = {
                'amount': trxData.actualAmount,
                'currency': trxData.coin,
                'transactionId': reqParam.transactionId,
                'date': new Date(),
            };

            mailTemplateLang({
                'userId': usrData._id,
                'identifier': 'Withdraw_notification',
                'toEmail': usrData.email,
                content
            })

            // newNotification({
            //     'userId': trxData.userId,
            //     'currencyId': trxData.currencyId,
            //     'transactionId': trxData._id,
            //     'trxId': trxData._id,
            //     'currencySymbol': trxData.currencySymbol,
            //     'amount': trxData.amount,
            //     'paymentType': trxData.paymentType,
            //     'status': trxData.status,
            // })
        }

        return res.status(200).json({ 'success': true, 'message': "Withdraw successfully" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}

/** 
 * Reject Coin Withdraw
 * URL: /adminapi/coinWithdraw/reject
 * METHOD : POST
*/
export const fiatWithdrawReject = async (req, res) => {
    try {
        let reqParam = req.params

        let trxData = await Transaction.findOneAndUpdate({
            '_id': reqParam.transactionId,
            'paymentType': 'fiat_withdraw',
            'status': 'pending'
        }, {
            'status': 'rejected'
        }, { 'new': true });

        if (!trxData) {
            return res.status(400).json({ "success": false, 'message': 'Invalid Token' })
        }

        // await Wallet.updateOne({
        //     "userId": trxData.userId,
        //     'assets._id': trxData.currencyId
        // }, {
        //     "$inc": {
        //         "assets.$.spotBal": trxData.amount
        //     }
        // })


        let usrWallet = await Wallet.findOne({ 'userId': trxData.userId });
        let usrAsset = usrWallet.assets.id(trxData.currencyId);

        let beforeBalance = parseFloat(usrAsset.spotBal);
        usrAsset.spotBal = parseFloat(usrAsset.spotBal) + parseFloat(trxData.amount);
        let updateWallet = await usrWallet.save();

        let usrData = await User.findOne({ 'userId': trxData.userId });

        // if(usrData){
        //    let content = {
        //         'amount': trxData.actualAmount,
        //         'currency': trxData.coin,
        //         'transactionId': reqParam.transactionId,
        //         'date': new Date(),
        //     };

        //     mailTemplateLang({
        //         'userId': usrData._id,
        //         'identifier': 'Withdraw_Rejected',
        //         'toEmail': usrData.email,
        //         content
        //     })
        // }

        // CREATE PASS_BOOK
        createPassBook({
            'userId': usrData._id,
            'coin': trxData.coin,
            'currencyId': trxData.currencyId,
            'tableId': trxData._id,
            'beforeBalance': beforeBalance,
            'afterBalance': parseFloat(usrAsset.p2pBal),
            'amount': parseFloat(trxData.amount),
            'type': 'fiat_withdraw_rejected',
            'category': 'credit'
        })


        // newNotification({
        //     'userId': trxData.userId,
        //     'currencyId': trxData.currencyId,
        //     'transactionId': trxData._id,
        //     'trxId': trxData._id,
        //     'currencySymbol': trxData.currencySymbol,
        //     'amount': trxData.amount,
        //     'paymentType': trxData.paymentType,
        //     'status': trxData.status,
        // })

        return res.status(200).json({ 'success': true, 'message': "Withdraw successfully rejected" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}



/** 
 * Admin Approved Fiat Deposit Request
 * URL: /adminapi/fiatDeposit/approve
 * METHOD : POST
 * BODY : transactionId, amount
*/
export const fiatDepositApprove = async (req, res) => {
    try {
        let reqBody = req.body;

        let trxData = await Transaction.findOne({
            "_id": reqBody.transactionId,
            "paymentType": "fiat_deposit",
            "status": "pending"
        })

        if (!trxData) {
            return res.status(400).json({ "success": false, 'message': 'Invalid Token' })
        }

        if (trxData.amount < reqBody.amount) {
            return res.status(400).json({ "success": false, 'message': 'Amount should be lower than depoist amount' })
        }

        trxData.status = "completed";
        trxData.txid = trxData._id;
        trxData.actualAmount = parseFloat(trxData.amount); // reqBody.amount;

        let transactionData = await trxData.save();

        let usrWallet = await Wallet.findOne({ 'userId': transactionData.userId });
        let usrAsset = usrWallet.assets.id(transactionData.currencyId);

        let beforeBalance = parseFloat(usrAsset.spotBal);
        usrAsset.spotBal = parseFloat(usrAsset.spotBal) + parseFloat(trxData.amount);
        let updateWallet = await usrWallet.save();

        // await Wallet.updateOne({
        //     "userId": transactionData.userId,
        //     'assets._id': transactionData.currencyId
        // }, {
        //     "$inc": {
        //         "assets.$.spotBal": reqBody.amount
        //     }
        // })

        let content = {
            'amount': reqBody.amount,
            'currency': transactionData.coin,
            'transactionId': reqBody.transactionId,
            'date': new Date(),
        };

        let usrData = await User.findOne({ "userId": transactionData.userId })
        if (usrData) {
            mailTemplateLang({
                'userId': usrData._id,
                'identifier': 'User_deposit',
                'toEmail': usrData.email,
                content
            })

            // CREATE PASS_BOOK
            createPassBook({
                'userId': usrData._id,
                'coin': transactionData.coin,
                'currencyId': transactionData.currencyId,
                'tableId': transactionData._id,
                'beforeBalance': beforeBalance,
                'afterBalance': parseFloat(usrAsset.spotBal),
                'amount': parseFloat(trxData.amount),
                'type': 'fiat_deposit',
                'category': 'credit'
            })

            // newNotification({
            //     'userId': usrData._id,
            //     'currencyId': transactionData.currencyId,
            //     'transactionId': transactionData._id,
            //     'trxId': transactionData._id,
            //     'currencySymbol': transactionData.coin,
            //     'amount': transactionData.amount,
            //     'paymentType': transactionData.paymentType,
            //     'status': transactionData.status,
            // })

        }

        return res.status(200).json({ 'success': false, "message": "Amount added successfully" })

    } catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}

/** 
 * Create New User Wallet at Signup
*/
export const newUsrWallet = async (walletData, option = {}) => {
    try {
        if (isEmpty(walletData)) {
            return false
        }

        let currencyList = await Currency.aggregate([
            // { "$match": { "depositType": depositType } },
            {
                "$facet": {
                    "crypto": [
                        { "$match": { "type": 'crypto' } },
                        {
                            "$project": {
                                "type": 1,
                                "coin": 1,
                                "depositType": 1,
                                "tokenType": 1,
                                "coinpaymentsymbol" : 1
                            }
                        }
                    ],
                    "token": [
                        { "$match": { "type": 'token' } },
                        {
                            "$project": {
                                "type": 1,
                                "coin": 1,
                                "depositType": 1,
                                "tokenType": 1,
                                "coinpaymentsymbol" : 1
                            }
                        }
                    ],
                    "fiat": [
                        { "$match": { "type": 'fiat' } },
                        {
                            "$project": {
                                "type": 1,
                                "coin": 1,
                                "depositType": 1,
                                "tokenType": 1,
                                "coinpaymentsymbol" : 1
                            }
                        }
                    ],
                }
            },
        ]);

        if (currencyList && currencyList.length > 0) {

            if (currencyList[0].crypto && currencyList[0].crypto.length > 0) {
                walletData['assets'] = [
                    ...walletData['assets'],
                    ...await coinCtrl.generateCryptoAddr({
                        'currencyList': currencyList[0].crypto,
                        'option': { ...option, 'userId': walletData.userId }
                    })
                ]
            }

            if (currencyList[0].token && currencyList[0].token.length > 0) {
                walletData['assets'] = [
                    ...walletData['assets'],
                    ...await coinCtrl.generateTokenAddr({
                        'currencyList': currencyList[0].token,
                        'walletData': walletData,

                    })
                ]
            }

            if (currencyList[0].fiat && currencyList[0].fiat.length > 0) {
                walletData['assets'] = [
                    ...walletData['assets'],
                    ...await coinCtrl.generateFiatAddr({
                        'currencyList': currencyList[0].fiat
                    })
                ]
            }
            await walletData.save();
        }
        return true
    } catch (err) {
        return false
    }
}

/**
 * Create new asset to all user at create new currency
*/
export const newAssetAllUsr = async (currency) => {
    try {
        await Wallet.updateMany({}, {
            "$push": {
                'assets': {
                    "_id": currency._id,
                    "coin": currency.coin,
                }
            }
        }, { 'multi': true })
        return true
    } catch (err) {
        return false
    }
}