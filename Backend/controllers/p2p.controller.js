// import package
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import node2fa from 'node-2fa';

// import model
import {
    Currency,
    P2pPair,
    P2pPost,
    Wallet,
    P2pOrder,
    UserSetting
} from '../models'

// import config
import config from '../config';
import { socketEmitOne } from '../config/socketIO'
import { p2pOrderCrossTime, p2pPostCrossDate } from '../config/cron'

// import controller
import { mailTemplateLang } from './emailTemplate.controller';

// import lib
import {
    paginationQuery,
    filterSearchQuery
} from "../lib/adminHelpers";
import { IncCntObjId } from '../lib/generalFun';
import isEmpty from '../lib/isEmpty';
import { toFixed } from '../lib/roundOf';
import { findBtwDates } from '../lib/dateHelper'
import imageFilter from '../lib/imageFilter';

//const new ObjectId = mongoose.Types.new ObjectId;
const { ObjectId } = require('mongoose').Types;


/** 
 * Multer Image Uploade 
*/
const attachStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.IMAGE.P2P_PATH);
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, 'file-' + Date.now() + path.extname(file.originalname));
    }
});

let attachUpload = multer({
    storage: attachStorage,
    fileFilter: imageFilter,
    limits: { fileSize: config.IMAGE.P2P_SIZE }
}).fields([
    { name: 'attachment', maxCount: 1 },
])

export const uploadAttach = (req, res, next) => {
    attachUpload(req, res, function (err) {
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
 * P2P Pair List
 * URL : /adminapi/p2pPair
*/
export const pairList = async (req, res) => {
    try {
        let Export = req.query.export;
        const header = ["Base Coin", "Quote Coin", "Fee(%)", "Status"]
        if (Export == 'csv' || Export == 'xls') {
            let pagination = paginationQuery(req.query);
            let filter = filterSearchQuery(req.query, [
                "firstCoin",
                "secondCoin",
                "botstatus",
                "status",
            ]);

            let count = await P2pPair.countDocuments(filter);
            let exportData = await P2pPair.find(filter, {
                'firstCoinId': 1,
                'firstCoin': 1,
                'secondCoinId': 1,
                'secondCoin': 1,
                'feePct': 1,
                'markPrice': 1,
                'fetchMarkPrice': 1,
                'markupPercentage': 1,
                'payment': 1,
                'status': 1
            })
            // .skip(pagination.skip).limit(pagination.limit);
            let csvData = [
                header
            ]
            if (exportData && exportData.length > 0) {
                for (let item of exportData) {
                    let arr = []
                    arr.push(
                        item.firstCoin,
                        item.secondCoin,
                        item.feePct,
                        item.status,
                    )
                    csvData.push(arr)
                }
            }
            return res.csv(csvData)
        } else if (Export == 'pdf') {
            let pagination = paginationQuery(req.query);
            let filter = filterSearchQuery(req.query, [
                "firstCoin",
                "secondCoin",
                "botstatus",
                "status",
            ]);

            let count = await P2pPair.countDocuments(filter);
            let data = await P2pPair.find(filter, {
                'firstCoinId': 1,
                'firstCoin': 1,
                'secondCoinId': 1,
                'secondCoin': 1,
                'feePct': 1,
                'markPrice': 1,
                'fetchMarkPrice': 1,
                'markupPercentage': 1,
                'payment': 1,
                'status': 1
            })
            // .skip(pagination.skip).limit(pagination.limit);

            let result = {
                count,
                pdfData: data,
            }
            return res.status(200).json({ 'success': true, 'message': "success", result });
        } else {
            let pagination = paginationQuery(req.query);
            let filter = filterSearchQuery(req.query, [
                "firstCoin",
                "secondCoin",
                "botstatus",
                "status",
            ]);

            let count = await P2pPair.countDocuments(filter);
            let data = await P2pPair.find(filter, {
                'firstCoinId': 1,
                'firstCoin': 1,
                'secondCoinId': 1,
                'secondCoin': 1,
                'feePct': 1,
                'markPrice': 1,
                'fetchMarkPrice': 1,
                'markupPercentage': 1,
                'payment': 1,
                'status': 1
            }).skip(pagination.skip).limit(pagination.limit);

            let result = {
                count,
                data,
            }
            return res.status(200).json({ 'success': true, 'message': "success", result });
        }
    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
    }
};

/** 
 * P2P Add Pair
 * URL : /adminapi/p2pPair
 * METHOD : POST
 * BODY : firstCoinId, secondCoinId, feePct, markPrice, fetchMarkPrice, markupPercentage, payment
*/
export const addPair = async (req, res) => {
    try {
        let reqBody = req.body;
        reqBody.payment = JSON.parse(reqBody.payment)
        let firstCoinDoc = await Currency.findOne({ "_id": reqBody.firstCoinId })
        if (!firstCoinDoc) {
            return res.status(400).json({ 'success': false, 'errors': { 'firstCoinId': "Invalid currency" } });
        }

        let secondCoinDoc = await Currency.findOne({ "_id": reqBody.secondCoinId })
        if (!secondCoinDoc) {
            return res.status(400).json({ 'success': false, 'errors': { 'secondCoinId': "Invalid currency" } });
        }

        let checkPair = await P2pPair.findOne({
            "firstCoinId": reqBody.firstCoinId,
            "secondCoinId": reqBody.secondCoinId,
        });
        if (checkPair) {
            return res.status(400).json({ 'success': false, 'errors': { 'firstCoinId': "Pair is already exists" } });
        }

        let newDoc = new P2pPair({
            tikerRoot: `${firstCoinDoc.coin}${secondCoinDoc.coin}`,
            firstCoinId: reqBody.firstCoinId,
            firstCoin: firstCoinDoc.coin,
            secondCoinId: reqBody.secondCoinId,
            secondCoin: secondCoinDoc.coin,
            feePct: reqBody.feePct,
            markPrice: reqBody.markPrice,
            fetchMarkPrice: reqBody.fetchMarkPrice,
            payment: reqBody.payment
        });
        if (['binance'].includes(reqBody.fetchMarkPrice)) {
            newDoc['markupPercentage'] = reqBody.markupPercentage
        }

        await newDoc.save();
        return res.status(200).json({ 'status': true, 'message': "Pair added successfully" });

    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
    }
}

/** 
 * P2P Edit Pair
 * URL : /adminapi/p2pPair
 * METHOD : PUT
 * BODY : pairId, firstCoinId, secondCoinId, feePct, markPrice, fetchMarkPrice, markupPercentage, payment
*/
export const editPair = async (req, res) => {
    try {
        let reqBody = req.body;
        reqBody.payment = JSON.parse(reqBody.payment)
        let firstCoinDoc = await Currency.findOne({ "_id": reqBody.firstCoinId })
        if (!firstCoinDoc) {
            return res.status(400).json({ 'success': false, 'errors': { 'firstCoinId': "Invalid currency" } });
        }

        let secondCoinDoc = await Currency.findOne({ "_id": reqBody.secondCoinId })
        if (!secondCoinDoc) {
            return res.status(400).json({ 'success': false, 'errors': { 'secondCoinId': "Invalid currency" } });
        }

        let checkPair = await P2pPair.findOne({
            "firstCoinId": reqBody.firstCoinId,
            "secondCoinId": reqBody.secondCoinId,
            "_id": { "$ne": reqBody.pairId },
        });
        // if (checkPair) {
        //     return res.status(400).json({ 'success': false, 'errors': { 'firstCoinId': "Pair is already exists" } });
        // }

        let updateDoc = {
            tikerRoot: `${firstCoinDoc.coin}${secondCoinDoc.coin}`,
            firstCoinId: reqBody.firstCoinId,
            firstCoin: firstCoinDoc.coin,
            secondCoinId: reqBody.secondCoinId,
            secondCoin: secondCoinDoc.coin,
            feePct: reqBody.feePct,
            fetchMarkPrice: reqBody.fetchMarkPrice,
            payment: reqBody.payment,
            status: reqBody.status
        }
        if (['local'].includes(reqBody.fetchMarkPrice)) {
            updateDoc['markPrice'] = reqBody.markPrice
        }

        if (['binance'].includes(reqBody.fetchMarkPrice)) {
            updateDoc['markupPercentage'] = reqBody.markupPercentage
        }

        await P2pPair.updateOne({ "_id": reqBody.pairId }, { "$set": updateDoc });
        return res.status(200).json({ 'success': true, 'message': "Pair updated successfully" });
    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
    }
}

/** 
 * Get Order Report
 * URL : /api/p2p/orderReport
 * METHOD : GET
*/
export const orderReport = async (req, res) => {
    try {
        let Export = req.query.export;
        const header = [
            "Date & Time",
            "Order Id",
            "Buyer ID",
            "Seller ID",
            "Post Type",
            "Base Coin",
            "Quote Coin",
            "Price",
            "Pay Price",
            "Get Price",
            "Fee(%)",
            "Status"
        ]
        if (Export == 'csv' || Export == 'xls') {
            let exportData = await P2pOrder.find({}, {
                'startTime': 1,
                'orderId': 1,
                'buyUniqueId': 1,
                'sellUniqueId': 1,
                'side': 1,
                'firstCoin': 1,
                'secondCoin': 1,
                'price': 1,
                'payValue': 1,
                'receiveValue': 1,
                'feePct': 1,
                'status': 1
            })
            let csvData = [
                header
            ]
            if (exportData && exportData.length > 0) {
                for (let item of exportData) {
                    let arr = []
                    arr.push(
                        item.startTime.toLocaleString(),
                        item.orderId,
                        item.buyUniqueId,
                        item.sellUniqueId,
                        item.side,
                        item.firstCoin,
                        item.secondCoin,
                        item.price,
                        item.payValue,
                        item.receiveValue,
                        item.feePct,
                        item.status
                    )
                    csvData.push(arr)
                }
            }
            return res.csv(csvData)
        } else if (Export == 'pdf') {
            let Data = await P2pOrder.find({}, {
                'startTime': 1,
                'orderId': 1,
                'buyUniqueId': 1,
                'sellUniqueId': 1,
                'side': 1,
                'firstCoin': 1,
                'secondCoin': 1,
                'price': 1,
                'payValue': 1,
                'receiveValue': 1,
                'feePct': 1,
                'status': 1
            }).sort({ "createdAt": -1 }).exec((err, data) => {
                if (err) {
                    return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
                }
                let reqData = {
                    pdfData: data
                }
                return res.status(200).json({ 'success': true, 'message': "FETCH", 'result': reqData });
            })
        } else {
            let Data = await P2pOrder.find({}, {
                'startTime': 1,
                'orderId': 1,
                'buyUniqueId': 1,
                'sellUniqueId': 1,
                'side': 1,
                'firstCoin': 1,
                'secondCoin': 1,
                'price': 1,
                'payValue': 1,
                'receiveValue': 1,
                'feePct': 1,
                'status': 1
            }).sort({ "createdAt": -1 }).exec((err, data) => {
                if (err) {
                    return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
                }
                return res.status(200).json({ 'success': true, 'message': "FETCH", 'result': data });
            })
        }
    } catch (err) {
        return res.status(500).json({ 'success': fasle, message: 'Somethhing went wrong' })
    }

}

/** 
 * Get Single Order Report
 * URL : /api/p2p/getOrderReport
 * METHOD : GET
 * PARAMS : orderId
*/
export const getOrderReport = async (req, res) => {
    let reqParam = req.params;
    P2pOrder.findOne({ 'orderId': reqParam.orderId }).exec((err, orderData) => {
        if (err) {
            return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
        }
        let result = {
            'detail': {
                '_id': orderData._id,
                'orderId': orderData.orderId,
                'buyUserId': orderData.buyUserId,
                'buyUniqueId': orderData.buyUniqueId,
                'sellUserId': orderData.sellUserId,
                'sellUniqueId': orderData.sellUniqueId,
                'firstCoin': orderData.firstCoin,
                'secondCoin': orderData.secondCoin,
                'side': orderData.side,
                'price': orderData.price,
                'payValue': orderData.payValue,
                'receiveValue': orderData.receiveValue,
                'feePct': orderData.feePct,
                'status': orderData.status,
                'disputeStatus': orderData.disputeStatus,
                'disputeDate': orderData.disputeDate,
                'createdAt': orderData.createdAt
                // "":
            },
            'chat': orderData.chat
        }
        return res.status(200).json({ 'success': true, 'message': "FETCH", 'result': result });
    });
};

/** 
 * Admin to User Conversation
 * URL : /adminapi/p2p/conversation
 * METHOD : POST
 * BOGY : orderId, receiverId, message, attachment
*/
export const adminConversation = async (req, res) => {
    try {
        let reqBody = req.body, reqFile = req.files;
        let orderData = await P2pOrder.findOne({ "_id": reqBody.orderId }).populate({ 'path': "postId", 'select': "status" })
        if (!orderData) {
            return res.status(400).json({ 'status': false, 'message': "There is no order" });
        }

        if (orderData && !orderData.postId) {
            return res.status(400).json({ 'status': false, 'message': "There is no trade" });
        }

        if (orderData.status == 'completed') {
            return res.status(400).json({ 'status': false, 'message': "Order already completed" });
        }

        if (orderData.status == 'cancelled') {
            return res.status(400).json({ 'status': false, 'message': "Order Already Cancelled" });
        }

        if (orderData.status == 'closed') {
            return res.status(400).json({ 'status': false, 'message': "Time Exceeded So Order Closed Already" });
        }

        if (orderData.postId.status == 'completed') {
            return res.status(400).json({ 'status': false, 'message': "Trade already completed" });
        }

        if (orderData.postId.status == 'cancelled') {
            return res.status(400).json({ 'status': false, 'message': "Trade already Cancelled" });
        }

        orderData['chat'].push({
            'admin': true,
            'message': reqBody.message,
            'readStatus': false,
            'attachment': reqFile && reqFile.attachment && reqFile.attachment[0] ? reqFile.attachment[0].filename : '',
            'createdAt': new Date()
        })

        let updateDoc = await orderData.save();

        let result = {
            'chat': updateDoc.chat
        }

        socketEmitOne('p2pChat', {
            'orderId': reqBody.orderId,
            'chat': updateDoc.chat
        }, updateDoc.buyUserId)

        socketEmitOne('p2pChat', {
            'orderId': reqBody.orderId,
            'chat': updateDoc.chat
        }, updateDoc.sellUserId)

        return res.status(200).json({ 'status': true, 'message': "Message Sent Successfully", result });

    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Dispute Resolve Admin
 * URL : /adminapi/p2p/disputeResolve
 * METHOD : POST
 * BODY : orderId, side
*/
export const disputeResolve = async (req, res) => {
    try {
        let reqBody = req.body;
        let orderData = await P2pOrder.findOne({ "orderId": reqBody.orderId }).populate({ 'path': "postId", 'select': "status minLimit maxLimit initialMinLimit initialMaxLimit endDate side" });

        if (!orderData) {
            return res.status(400).json({ 'status': false, 'message': "There is no order" });
        }

        if (orderData && !orderData.postId) {
            return res.status(400).json({ 'status': false, 'message': "There is no trade" });
        }

        if (reqBody.side == 'buy') {
            orderData['chat'].push({
                'admin': true,
                'message': 'Dispute resolved to buyer.',
                'readStatus': false,
                'attachment': '',
                'createdAt': new Date()
            })
            orderData.status = 'disputed'
            orderData.disputeStatus = 'resolved'
            orderData.disputeTo = 'buy'

            let updateDoc = await orderData.save();

            socketEmitOne('p2pChat', {
                'orderId': updateDoc._id,
                'chat': updateDoc.chat
            }, updateDoc.buyUserId)

            socketEmitOne('p2pChat', {
                'orderId': updateDoc._id,
                'chat': updateDoc.chat
            }, updateDoc.sellUserId)

            let curMaxLimit = updateDoc.postId.maxLimit + updateDoc.payValue, curMinLimit;
            if (curMaxLimit > updateDoc.postId.initialMinLimit) {
                curMinLimit = updateDoc.postId.initialMinLimit
            } else {
                curMinLimit = curMaxLimit;
            }

            if (updateDoc.postId.status == 'pending') {
                let checkUpdate = await P2pPost.updateOne({ "_id": updateDoc.postId._id }, {
                    "$set": {
                        // "minLimit": curMinLimit,
                        // "maxLimit": curMaxLimit,
                        "status": updateDoc.postId.maxLimit > 0 ? "open" : "completed"
                    }
                })
            }

            let balance = toFixed(updateDoc.receiveValue, 8)
            await Wallet.updateOne({
                "_id": updateDoc.buyUserId,
                'assets._id': updateDoc.firstCoinId
            }, {
                "$inc": {
                    "assets.$.p2pBal": balance
                }
            })

            let result = {
                'detail': {
                    'status': updateDoc.status,
                    'disputeStatus': updateDoc.disputeStatus,
                    'disputeDate': updateDoc.disputeDate,
                },
                'chat': updateDoc.chat
            }

            return res.status(200).json({ 'status': true, 'message': "Dispute Resolved for Buyer Successfully.", result });

        } else if (reqBody.side == 'sell') {
            orderData['chat'].push({
                'admin': true,
                'message': 'Dispute resolved to seller.',
                'readStatus': false,
                'attachment': '',
                'createdAt': new Date()
            })
            orderData.status = 'disputed'
            orderData.disputeStatus = 'resolved'
            orderData.disputeTo = 'sell'

            let updateDoc = await orderData.save();

            socketEmitOne('p2pChat', {
                'orderId': updateDoc._id,
                'chat': updateDoc.chat
            }, updateDoc.buyUserId)

            socketEmitOne('p2pChat', {
                'orderId': updateDoc._id,
                'chat': updateDoc.chat
            }, updateDoc.sellUserId)

            if (updateDoc.postId.side == 'buy') {
                let curMaxLimit = updateDoc.postId.maxLimit + updateDoc.payValue, curMinLimit;
                if (curMaxLimit > updateDoc.postId.initialMinLimit) {
                    curMinLimit = updateDoc.postId.initialMinLimit
                } else {
                    curMinLimit = curMaxLimit;
                }

                let postUpdateDoc = {
                    "$inc": {
                        'filledQuantity': -updateDoc.receiveValue
                    },
                    "$set": {
                        "minLimit": curMinLimit,
                        "maxLimit": curMaxLimit,
                    }
                }

                if (updateDoc.postId.status == 'pending') {
                    postUpdateDoc = {
                        "$inc": {
                            'filledQuantity': -updateDoc.receiveValue
                        },
                        "$set": {
                            "minLimit": curMinLimit,
                            "maxLimit": curMaxLimit,
                            "status": curMaxLimit > 0 ? "open" : "completed"
                        }
                    }
                }

                await P2pPost.updateOne({ "_id": updateDoc.postId._id }, postUpdateDoc)



                // Balance Retrieve
                let balance = updateDoc.receiveValue + (updateDoc.receiveValue * (updateDoc.feePct / 100))
                balance = toFixed(balance, 8)
                let checkBal = await Wallet.updateOne({
                    "_id": updateDoc.sellUserId,
                    'assets._id': updateDoc.firstCoinId
                }, {
                    "$inc": {
                        "assets.$.p2pBal": balance
                    }
                })
            } else if (updateDoc.postId.side == 'sell') {

                let curMaxLimit = updateDoc.postId.maxLimit + updateDoc.payValue, curMinLimit;
                if (curMaxLimit > updateDoc.postId.initialMinLimit) {
                    curMinLimit = updateDoc.postId.initialMinLimit
                } else {
                    curMinLimit = curMaxLimit;
                }

                let postUpdateDoc = {
                    "$inc": {
                        'filledQuantity': -updateDoc.receiveValue
                    },
                    "$set": {
                        "minLimit": curMinLimit,
                        "maxLimit": curMaxLimit,
                    }
                }

                if (updateDoc.postId.status == 'pending') {
                    postUpdateDoc = {
                        "$inc": {
                            'filledQuantity': -updateDoc.receiveValue
                        },
                        "$set": {
                            "minLimit": curMinLimit,
                            "maxLimit": curMaxLimit,
                            "status": curMaxLimit > 0 ? "open" : "completed"
                        }
                    }
                } else {
                    let balance = updateDoc.receiveValue + (updateDoc.receiveValue * (updateDoc.feePct / 100))
                    balance = toFixed(balance, 8)
                    await Wallet.updateOne({
                        "_id": updateDoc.sellUserId,
                        'assets._id': updateDoc.firstCoinId
                    }, {
                        "$inc": {
                            "assets.$.p2pBal": balance
                        }
                    })
                }

                await P2pPost.updateOne({ "_id": updateDoc.postId._id }, postUpdateDoc)

            }
            // let curMaxLimit = updateDoc.postId.maxLimit + updateDoc.payValue, curMinLimit;
            // if (curMaxLimit > updateDoc.postId.initialMinLimit) {
            //     curMinLimit = updateDoc.postId.initialMinLimit
            // } else {
            //     curMinLimit = curMaxLimit;
            // }

            // if (updateDoc.postId.status == 'pending') {
            //     let checkUpdate = await P2pPost.updateOne({ "_id": updateDoc.postId._id }, {
            //         "$set": {
            //             // "minLimit": curMinLimit,
            //             // "maxLimit": curMaxLimit,
            //             "status": updateDoc.postId.maxLimit > 0 ? "open" : "completed"
            //         }
            //     })
            // }

            // if (updateDoc.postId.side == 'sell') {
            //     // Balance Retrieve
            //     let balance = updateDoc.receiveValue + (updateDoc.receiveValue * (updateDoc.feePct / 100))
            //     balance = toFixed(balance, 8)
            //     await Wallet.updateOne({
            //         "_id": updateDoc.sellUserId,
            //         'assets._id': updateDoc.firstCoinId
            //     }, {
            //         "$inc": {
            //             "assets.$.p2pBal": balance
            //         }
            //     })
            // }

            let result = {
                'detail': {
                    'status': updateDoc.status,
                    'disputeStatus': updateDoc.disputeStatus,
                    'disputeDate': updateDoc.disputeDate,
                },
                'chat': updateDoc.chat
            }

            return res.status(200).json({ 'status': true, 'message': "Dispute Resolved for Seller Successfully.", result });
        }

        return res.status(400).json({ 'status': true, 'message': "Invalid Type" });

    } catch (err) {
        return res.status(500).json({ 'status': false, 'message': "Something went wrong" });
    }
}

/** 
 * Dispute List
 * URL : /adminapi/p2p/disputeList
 * METHOD : GET
*/
export const disputeList = async (req, res) => {
    P2pOrder.find({
        'disputeStatus': { "$in": ['open', 'resolved'] }
    }, {
        'disputeDate': 1,
        'orderId': 1,
        'buyUniqueId': 1,
        'sellUniqueId': 1,
        'side': 1,
        'firstCoin': 1,
        'secondCoin': 1,
        'price': 1,
        'payValue': 1,
        'receiveValue': 1,
        'feePct': 1,
        'disputeRaisedBy': 1,
        'disputeStatus': 1,
        'disputeTo': 1,
        'status': 1
    }).sort({ "disputeDate": -1 }).exec((err, data) => {
        if (err) {
            return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
        }
        return res.status(200).json({ 'success': true, 'message': "FETCH", 'result': data });
    })
}

/** 
 * Get P2P Pair List
 * URL : /api/p2p/allPairs
*/
export const allPairs = (req, res) => {
    try{
    const data =  P2pPair.find({ "status": 'active' }, {
        '_id': 0,
        'tikerRoot': 1,
        'feePct': 1
    })
    if(data){
        return res.status(200).json({ 'success': true, 'message': "FETCH", 'result': data });
    }else{
        return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
    }
}catch(e){
    return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
}
    // P2pPair.find({ "status": 'active' }, {
    //     '_id': 0,
    //     'tikerRoot': 1,
    //     'feePct': 1
    // }, (err, data) => {
    //     if (err) {
    //         return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
    //     }
    //     return res.status(200).json({ 'success': true, 'message': "FETCH", 'result': data });
    // })
}
/** 
 * Get P2P Detail
 * URL : /api/p2p/detail
 * METHOD : GET
*/
export const getDetail = async (req, res) => {
    try {
        let reqQuery = req.query;
        let result = {
            pairData: [],
            buyOrder: [],
            sellOrder: [],
            recentPost: []
        }

        let pairList = await getPair();
        if (pairList.status) {
            result['pairData'] = pairList.data
        }

        let findOrder = {};
        if (!isEmpty(reqQuery.userId)) {
            findOrder['userId'] = { "$ne": new ObjectId(reqQuery.userId) }
        }

        if (pairList.data && pairList.data.length > 0) {
            if (!isEmpty(reqQuery.firstCoin)) {
                findOrder['firstCoin'] = reqQuery.firstCoin
            } else {
                findOrder['firstCoin'] = pairList.data[0]._id.firstCoin
            }
            findOrder['status'] = { "$in": ['open', 'pending'] }

            let getOrder = await orderList(findOrder, reqQuery.price);
            if (getOrder.status) {
                result['buyOrder'] = getOrder.buyOrder;
                result['sellOrder'] = getOrder.sellOrder;
            }
        }

        let rctPostDoc = await recentPost(findOrder);
        if (rctPostDoc.status) {
            result['recentPost'] = rctPostDoc.recentPost
        }

        return res.status(200).json({ 'success': true, 'message': "Fetch", result });
    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
    }
}

/** 
 * P2P Order List
 * URL : /api/p2p/orderList
 * METHOD : GET
 * QUERY : price, secondCoin, payBy
*/
export const allPostAd = async (req, res) => {
    try {
        let reqQuery = req.query;
        let result = {
            buyOrder: [],
            sellOrder: []
        }

        let findOrder = {};
        if (!isEmpty(reqQuery.userId)) {
            findOrder['userId'] = { "$ne": new ObjectId(reqQuery.userId) }
        }

        if (!isEmpty(reqQuery.secondCoin)) {
            findOrder['secondCoin'] = reqQuery.secondCoin
        }
        if (!isEmpty(reqQuery.payBy)) {
            findOrder['payBy'] = reqQuery.payBy
        }
        if (!isEmpty(reqQuery.firstCoin)) {
            findOrder['firstCoin'] = reqQuery.firstCoin
        }

        findOrder['status'] = { "$in": ['open', 'pending'] }

        let getOrder = await orderList(findOrder, reqQuery.price);
        if (getOrder.status) {
            result['buyOrder'] = getOrder.buyOrder;
            result['sellOrder'] = getOrder.sellOrder;
        }

        return res.status(200).json({ 'success': true, 'message': "Fetch", result });
    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
    }
}

/** 
 * P2P Order List
 * URL : /api/p2p/pair
 * METHOD : GET
*/
export const getPairList = async (req, res) => {
    try {
        let result = []
        let pairList = await getPair();
        if (pairList.status) {
            result = pairList.data
        }
        return res.status(200).json({ 'success': true, 'message': "Fetch", result });
    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
    }
}

/** 
 * Get Order List
*/
export const orderList = async (findQuery, amount = '') => {
    try {

        let matchQuery = {}
        if (!isEmpty(amount) && !isNaN(amount)) {
            matchQuery['remainingQty'] = Number(amount)
        }

        let buyPost = await P2pPost.aggregate([
            { "$match": findQuery },
            { "$match": { "side": "buy" } },
            {
                "$lookup": {
                    "from": 'p2pOrder',
                    "let": {
                        "postId": "$_id"
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "status": "completed",
                                "$expr": {
                                    "$eq": ["$postId", "$$postId"]
                                }
                            }
                        }
                    ],
                    "as": "orderInfo"
                }
            },
            {
                "$project": {
                    'postId': 1,
                    'orderDate': 1,
                    'side': 1,
                    'quantity': 1,
                    'price': 1,
                    'firstCoin': 1,
                    'secondCoin': 1,
                    'minLimit': 1,
                    'maxLimit': 1,
                    'payBy': 1,
                    'status': 1,
                    'filledQuantity': 1,
                    'remainingQty': { "$subtract": ['$quantity', '$filledQuantity'] },
                    'orderCnt': { "$size": "$orderInfo" }
                }
            },
            { "$match": matchQuery }
        ])

        let sellPost = await P2pPost.aggregate([
            { "$match": findQuery },
            { "$match": { "side": "sell" } },
            {
                "$lookup": {
                    "from": 'p2pOrder',
                    "let": {
                        "postId": "$_id"
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "status": "completed",
                                "$expr": {
                                    "$eq": ["$postId", "$$postId"]
                                }
                            }
                        }
                    ],
                    "as": "orderInfo"
                }
            },
            {
                "$project": {
                    'postId': 1,
                    'orderDate': 1,
                    'side': 1,
                    'quantity': 1,
                    'price': 1,
                    'firstCoin': 1,
                    'secondCoin': 1,
                    'minLimit': 1,
                    'maxLimit': 1,
                    'initialMaxLimit': 1,
                    'payBy': 1,
                    'status': 1,
                    'filledQuantity': 1,
                    'remainingQty': { "$subtract": ['$quantity', '$filledQuantity'] },
                    'orderCnt': { "$size": "$orderInfo" }
                }
            },
            { "$match": matchQuery }
        ])

        return {
            'status': true,
            'buyOrder': buyPost,
            'sellOrder': sellPost
        }
    } catch (err) {
        return {
            'status': false
        }
    }
}

/** 
 * Recent Post
*/
export const recentPost = async (findQuery) => {
    try {
        let postList = await P2pPost.find(findQuery, {
            'postId': 1,
            'orderDate': 1,
            'side': 1,
            'quantity': 1,
            'price': 1,
            'firstCoin': 1,
            'secondCoin': 1,
            'minLimit': 1,
            'maxLimit': 1,
            'payBy': 1,
            'status': 1,
        }).sort({ "orderDate": -1 }).limit(2)

        return {
            'status': true,
            'recentPost': postList,
        }
    } catch (err) {
        return {
            'status': false
        }
    }
}

/** 
 * Get Pair
*/
export const getPair = async () => {
    try {
        let pairData = await P2pPair.aggregate([
            { "$match": { "status": 'active' } },
            {
                "$group": {
                    '_id': {
                        "firstCoin": "$firstCoin",
                        "firstCoinId": "$firstCoinId",
                    },
                    'pair': { "$push": "$$ROOT" }
                }
            }
        ])
        return {
            'status': true,
            'data': pairData
        }
    } catch (err) {
        return {
            'status': false
        }
    }
}

/**
 * P2P Post Order Place
 * URL : /api/p2pPostTrade
 * METHOD : POST
 * BODY : firstCoinId, secondCoinId, price, quantity, side, minLimit, maxLimit, payBy, endDate
*/
export const postOrder = async (req, res) => {
    try {
        let reqBody = req.body;
        reqBody.price = toFixed(reqBody.price, 8)
        reqBody.quantity = parseFloat(reqBody.quantity)
        reqBody.minLimit = toFixed(reqBody.minLimit, 8)

        let pairData = await P2pPair.findOne({
            "firstCoinId": reqBody.firstCoinId,
            "secondCoinId": reqBody.secondCoinId
        })

        if (!pairData) {
            return res.status(400).json({ 'status': false, 'message': "Invalid Pair" });
        }

        let usrWallet = await Wallet.findOne({ '_id': req.user.id });
        if (!usrWallet) {
            return res.status(500).json({ 'status': false, 'message': "Error occured" });
        }

        if (reqBody.side == 'sell') {
            let usrAsset = usrWallet.assets.id(pairData.firstCoinId)
            if (!usrAsset) {
                return res.status(500).json({ 'status': false, 'message': "Error occured" });
            }

            let balance = parseFloat(usrAsset.p2pBal),
                orderValue = reqBody.quantity + (reqBody.quantity * (pairData.feePct / 100));

            if (balance < orderValue) {
                return res.status(400).json({ 'status': false, 'message': "Due to insuffient balance order cannot be placed" });
            }

            usrAsset.p2pBal = balance - orderValue;

            await usrWallet.save()
        }

        let newOrder = new P2pPost({
            userId: req.user.id,
            pairId: pairData._id,
            pairName: `${pairData.firstCoin}${pairData.secondCoin}`,
            firstCoinId: pairData.firstCoinId,
            firstCoin: pairData.firstCoin,
            secondCoinId: pairData.secondCoinId,
            secondCoin: pairData.secondCoin,
            price: reqBody.price,
            quantity: reqBody.quantity,
            minLimit: reqBody.minLimit,
            maxLimit: toFixed(reqBody.price * reqBody.quantity, 8),
            initialMinLimit: reqBody.minLimit,
            initialMaxLimit: toFixed(reqBody.price * reqBody.quantity, 8),
            markPrice: pairData.markPrice,
            side: reqBody.side,
            feePct: pairData.feePct,
            orderDate: new Date(),
            endDate: reqBody.endDate,
            payBy: reqBody.payBy,

            // prefcurrencytransfer: bank,
            // bankpaymentdetails: bankdata,




            // fee_amount: fee_amount,
            // minlimit: minlimit,
            // maxlimit: maxlimit,
            // minlimit_initial: minlimit_initial,
            // maxlimit_initial: maxlimit_initial,
            // beforeBalance: equal_fiat_amount,
            // afterBalance: 0,

            // terms: postcheckboxaccept,
            // transferMode: transferMode,

            // paymentDetail: paymentDetail,
        });
        newOrder.postId = IncCntObjId(newOrder._id)
        let orderData = await newOrder.save();

        let content = {
            'id': orderData._id,
        };
        mailTemplateLang({
            'userId': req.user.id,
            'identifier': 'Post_ad',
            'toEmail': req.user.email,
            content
        })

        // let description = "New P2P Ad Posted Successfully";
        // let newNotification = new Notification({
        //     'description': description,
        //     'userId': checkUser._id,
        //     'type': "Trade",
        //     'category': "P2P Post Ad",

        // });
        // newNotification.save();
        return res.status(200).json({ 'status': true, 'message': "Trade posted Succesfully" });

    } catch (err) {
        return res.status(500).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Get Order List
 * METHOD: GET
 * URL : /api/p2p/postOrderList
*/
export const postOrderList = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let count = await P2pPost.countDocuments({ "userId": req.user.id });
        let data = await P2pPost.find({ "userId": req.user.id }, {
            'postId': 1,
            'orderDate': 1,
            'side': 1,
            'quantity': 1,
            'filledQuantity': 1,
            'price': 1,
            'firstCoin': 1,
            'secondCoin': 1,
            'minLimit': 1,
            'maxLimit': 1,
            'payBy': 1,
            'status': 1,
        }).sort({ "orderDate": -1 }).skip(pagination.skip).limit(pagination.limit);

        let result = {
            count,
            data
        }

        return res.status(200).json({ 'status': true, 'message': "Fetch", result })
    } catch (err) {
        return res.status(500).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Check Post
 * METHOD : POST
 * URL : /api/p2p/orderPlace
 * BODY : id, payValue, receiveValue
*/
export const checkPost = async (req, res, next) => {
    try {
        let reqBody = req.body;
        reqBody.payValue = toFixed(reqBody.payValue, 8)
        reqBody.receiveValue = toFixed(reqBody.receiveValue, 8)

        let postData = await P2pPost.findOne({ "_id": reqBody.id, "userId": { "$ne": req.user.id } });
        if (!postData) {
            return res.status(400).json({ 'status': false, 'message': "There is no post" });
        }

        if (postData.status == 'cancelled' || postData.status == 'closed') {
            return res.status(400).json({ 'status': false, 'message': "Sorry Trade Closed" });
        }
        if (!postData.maxLimit) {
            return res.status(400).json({ 'status': false, 'message': "Sorry Trade Closed" });
        }

        let usrSetting = await UserSetting.findOne({ 'userId': new ObjectId(postData.userId) });
        if (postData.side == "sell" && usrSetting.sellVacation == true) {
            return res.status(400).json({ 'status': false, 'message': "Seller is on vacation , please try after some time" });
        }

        if (postData.side == "buy" && usrSetting.buyVacation == true) {
            return res.status(400).json({ 'status': false, 'message': "Buyer is on vacation , please try after some time" });
        }

        let receiveValue = toFixed(reqBody.payValue / postData.price, 8)
        if (receiveValue != reqBody.receiveValue) {
            return res.status(400).json({ 'status': false, 'message': "Sorry Price has been modified by trader, Please refresh and try again." });
        }

        if (reqBody.payValue < postData.minLimit) {
            return res.status(400).json({ 'status': false, 'message': `Please Enter Limit ${postData.minLimit}-${postData.maxLimit}` });
        } else if (reqBody.payValue > postData.maxLimit) {
            return res.status(400).json({ 'status': false, 'message': `Please Enter Limit ${postData.minLimit}-${postData.maxLimit}` });
        }

        return next()

    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Order Place
 * METHOD : POST
 * URL : /api/p2p/orderPlace
 * BODY : id, payValue, receiveValue, side
*/
export const orderPlace = async (req, res) => {
    try {
        let reqBody = req.body;
        reqBody.payValue = toFixed(reqBody.payValue, 8)
        reqBody.receiveValue = toFixed(reqBody.receiveValue, 8)
        let postData = await P2pPost.findOne({ '_id': reqBody.id, "userId": { "$ne": req.user.id } });
        if (!postData) {
            return res.status(400).json({ 'status': false, 'message': "There is no post" });
        }

        let pairData = await P2pPair.findOne({ "_id": postData.pairId })
        if (!pairData) {
            return res.status(400).json({ 'status': false, 'message': "There is no pair" });
        }

        if (postData.status == 'cancelled' || postData.status == 'closed') {
            return res.status(400).json({ 'status': false, 'message': "Sorry Trade Closed" });
        }

        let sellUserId, buyUserId;
        if (reqBody.side == 'buy') {
            buyUserId = req.user.id;
            sellUserId = postData.userId;
        }

        if (reqBody.side == 'sell') {
            buyUserId = postData.userId;
            sellUserId = req.user.id;

            let usrWallet = await Wallet.findOne({ '_id': req.user.id });
            if (!usrWallet) {
                return res.status(500).json({ 'status': false, 'message': "Error occured" });
            }

            let usrAsset = usrWallet.assets.id(postData.firstCoinId)
            if (!usrAsset) {
                return res.status(500).json({ 'status': false, 'message': "Error occured" });
            }

            let balance = parseFloat(usrAsset.p2pBal),
                orderValue = reqBody.receiveValue + (reqBody.receiveValue * (postData.feePct / 100));
            orderValue = toFixed(orderValue, 8)

            if (balance < orderValue) {
                return res.status(400).json({ 'status': false, 'message': `Insufficient ${postData.firstCoin} Balance for this Trade` });
            }

            usrAsset.p2pBal = balance - orderValue;

            await usrWallet.save()
        }

        let nowDate = new Date();
        let startTime = nowDate.setMilliseconds(0);
        let endTime = nowDate.setTime(nowDate.getTime() + pairData.duration * 1000)

        let newOrder = new P2pOrder({
            'postId': postData._id,
            'buyUserId': buyUserId,
            'buyUniqueId': IncCntObjId(buyUserId),
            'sellUserId': sellUserId,
            'sellUniqueId': IncCntObjId(sellUserId),
            'firstCoinId': postData.firstCoinId,
            'firstCoin': postData.firstCoin,
            'secondCoinId': postData.secondCoinId,
            'secondCoin': postData.secondCoin,
            'payValue': reqBody.payValue,
            'receiveValue': reqBody.receiveValue,
            'price': postData.price,
            'side': reqBody.side,
            'feePct': postData.feePct,
            'startTime': startTime,
            'endTime': endTime,
            'payBy': postData.payBy
        })
        newOrder.orderId = IncCntObjId(newOrder._id)
        let orderData = await newOrder.save();
        let curMaxLimit = postData.maxLimit - reqBody.payValue;
        let curMinLimit
        if (postData.minLimit > curMaxLimit) {
            curMinLimit = curMaxLimit
        } else {
            curMinLimit = postData.minLimit
        }

        postData.filledQuantity = postData.filledQuantity + toFixed(reqBody.receiveValue, 8);
        postData.status = 'pending';
        postData.minLimit = toFixed(curMinLimit, 8);
        postData.maxLimit = toFixed(curMaxLimit, 8);

        await postData.save();

        let result = {
            'orderData': {
                'id': orderData._id
            }
        }

        return res.status(200).json({ 'status': true, 'message': "Order Placed Successfully", result });

    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Get Order Detail
 * METHOD : GET
 * URL : /api/p2p/orderDetail
 * PARAM : orderId
*/
export const getOrderDetail = async (req, res) => {
    try {
        let orderData = await P2pOrder.findOne({
            "_id": req.params.orderId
        });
        if (!orderData) {
            return res.status(400).json({ 'status': false, 'message': "There is no order" });
        }

        let pairData = await P2pPair.findOne({
            "firstCoinId": orderData.firstCoinId,
            "secondCoinId": orderData.secondCoinId,
        });

        if (!pairData) {
            return res.status(400).json({ 'status': false, 'message': "There is no pair" });
        }
        let duration = findBtwDates(new Date(), orderData.endTime, 'seconds', true)
        let result = {
            'detail': {
                '_id': orderData._id,
                'buyUserId': orderData.buyUserId,
                'sellUserId': orderData.sellUserId,
                'firstCoin': orderData.firstCoin,
                'secondCoin': orderData.secondCoin,
                'side': orderData.side,
                'startTime': orderData.startTime,
                'endTime': orderData.endTime,
                'status': orderData.status,
                'initialDuration': pairData.duration,
                'duration': duration && duration > 0 ? duration : 0,
                'price': orderData.price,
                'payValue': orderData.payValue,
                'receiveValue': orderData.receiveValue,
                'orderId': orderData.orderId,
                'createdAt': orderData.createdAt
            },
            'chat': orderData.chat
        }

        return res.status(200).json({ "status": true, 'message': "Fetch", 'result': result })
    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * User to User Conversation
 * URL : /api/p2p/conversation
 * METHOD : POST
 * BOGY : orderId, receiverId, message, attachment
*/
export const usrConversation = async (req, res) => {
    try {
        let reqBody = req.body, reqFile = req.files;
        let orderData = await P2pOrder.findOne({ "_id": reqBody.orderId }).populate({ 'path': "postId", 'select': "status" })
        if (!orderData) {
            return res.status(400).json({ 'status': false, 'message': "There is no order" });
        }

        if (orderData && !orderData.postId) {
            return res.status(400).json({ 'status': false, 'message': "There is no trade" });
        }

        if (orderData.status == 'completed') {
            return res.status(400).json({ 'status': false, 'message': "Order already completed" });
        }

        if (orderData.status == 'cancelled') {
            return res.status(400).json({ 'status': false, 'message': "Order Already Cancelled" });
        }

        if (orderData.status == 'closed') {
            return res.status(400).json({ 'status': false, 'message': "Time Exceeded So Order Closed Already" });
        }

        if (orderData.postId.status == 'completed') {
            return res.status(400).json({ 'status': false, 'message': "Trade already completed" });
        }

        if (orderData.postId.status == 'cancelled') {
            return res.status(400).json({ 'status': false, 'message': "Trade already Cancelled" });
        }

        orderData['chat'].push({
            'senderId': req.user.id,
            'receiverId': reqBody.receiverId,
            'admin': false,
            'message': reqBody.message,
            'readStatus': false,
            'attachment': reqFile && reqFile.attachment && reqFile.attachment[0] ? reqFile.attachment[0].filename : '',
            'createdAt': new Date()
        })

        let updateDoc = await orderData.save();

        let result = {
            'chat': updateDoc.chat
        }

        socketEmitOne('p2pChat', {
            'orderId': reqBody.orderId,
            'chat': updateDoc.chat
        }, reqBody.receiverId)
        return res.status(200).json({ 'status': true, 'message': "Message Sent Successfully", result });

    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Cancel Order
 * URL : /api/p2p/cancelOrder
 * METHOD : POST
 * PARAMS : orderId
*/
export const cancelOrder = async (req, res) => {
    try {
        let reqParam = req.params;
        let orderData = await P2pOrder.findOne({ "_id": reqParam.orderId }).populate({ 'path': "postId", 'select': "status minLimit maxLimit initialMinLimit initialMaxLimit" });

        if (!orderData) {
            return res.status(400).json({ 'status': false, 'message': "There is no order" });
        }
        if (orderData.endTime < new Date()) {
            return res.status(400).json({ 'status': false, 'message': "Time Exceeded So Order Closed Already" });
        }

        if (orderData && !orderData.postId) {
            return res.status(400).json({ 'status': false, 'message': "There is no trade" });
        }

        if (orderData.status == 'completed') {
            return res.status(400).json({ 'status': false, 'message': "Already paid. if not paid please raise dispute" });
        }

        if (orderData.status == 'paid') {
            return res.status(400).json({ 'status': false, 'message': "Already paid" });
        }

        if (orderData.status == 'dispute') {
            return res.status(400).json({ 'status': false, 'message': "Your Order Already Dispute" })
        }

        if (orderData.status == 'cancelled') {
            return res.status(400).json({ 'status': false, 'message': "Trade Already Cancelled" });
        }

        if (orderData.status == 'closed') {
            return res.status(400).json({ status: false, message: "Time Exceeded So Trade Closed Already" });
        }

        if (orderData.postId.status == 'completed') {
            return res.status(400).json({ 'status': false, 'message': "Trade already completed" });
        }

        if (orderData.postId.status == 'cancelled') {
            return res.status(400).json({ 'status': false, 'message': "Trade already Cancelled" });
        }

        let receiverId;
        if (req.user.id == orderData.sellUserId.toString()) {
            receiverId = orderData.buyUserId
        } else if (req.user.id == orderData.buyUserId.toString()) {
            receiverId = orderData.sellUserId
        }

        orderData['chat'].push({
            'senderId': req.user.id,
            'receiverId': receiverId,
            'admin': false,
            'message': 'Trade Cancelled',
            'readStatus': false,
            'attachment': '',
            'createdAt': new Date()
        })
        orderData.status = 'cancelled'
        let updateDoc = await orderData.save();
        let result = {
            'orderId': updateDoc._id,
            'detail': {
                'status': updateDoc.status
            },
            'chat': updateDoc.chat
        }

        socketEmitOne('p2pOrderCancel', result, receiverId)

        res.status(200).json({ 'status': true, 'message': "Order Cancelled Successfully.", result });

        if (updateDoc.side == 'sell') {
            let orderValue = updateDoc.receiveValue + (updateDoc.receiveValue * (updateDoc.feePct / 100));
            orderValue = toFixed(orderValue, 8)
            await Wallet.updateOne({
                "_id": updateDoc.sellUserId,
                'assets._id': updateDoc.firstCoinId
            }, {
                "$inc": {
                    "assets.$.p2pBal": orderValue
                }
            })
        }

        let curMaxLimit = updateDoc.postId.maxLimit + updateDoc.payValue, curMinLimit;
        if (curMaxLimit > updateDoc.postId.initialMinLimit) {
            curMinLimit = updateDoc.postId.initialMinLimit
        } else {
            curMinLimit = curMaxLimit;
        }
        await P2pPost.updateOne({ "_id": updateDoc.postId._id }, {
            "$inc": {
                'filledQuantity': -updateDoc.receiveValue
            },
            "$set": {
                "minLimit": curMinLimit,
                "maxLimit": curMaxLimit,
                "status": orderData.endTime < new Date() ? 'closed' : 'open'
            }
        })
        return
    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Transfer Payment
 * URL : /api/p2p/transferPayment
 * METHOD : POST
 * PARAMS : orderId
*/
export const transferPayment = async (req, res) => {
    try {
        let reqParam = req.params;
        let orderData = await P2pOrder.findOne({ "_id": reqParam.orderId }).populate({ 'path': "postId", 'select': "status" });

        if (!orderData) {
            return res.status(400).json({ 'status': false, 'message': "There is no order" });
        }

        if (orderData && !orderData.postId) {
            return res.status(400).json({ 'status': false, 'message': "There is no trade" });
        }

        if (orderData.status == 'paid') {
            return res.status(400).json({ 'status': false, 'message': "Payment Already Confirmed" });
        }

        if (orderData.status == 'cancelled') {
            return res.status(400).json({ 'status': false, 'message': "Order Already Cancelled" });
        }

        if (orderData.status == 'closed') {
            return res.status(400).json({ 'status': false, 'message': "Time Exceeded So Order Closed Already" });
        }
        if (orderData.endTime < new Date()) {
            return res.status(400).json({ 'status': false, 'message': "Time Exceeded So Order Closed Already" });
        }

        if (orderData.status == 'completed') {
            return res.status(400).json({ 'status': false, 'message': "Order Already Completed" });
        }

        let receiverId;
        if (req.user.id == orderData.sellUserId.toString()) {
            receiverId = orderData.buyUserId
        } else if (req.user.id == orderData.buyUserId.toString()) {
            receiverId = orderData.sellUserId
        }

        orderData['chat'].push({
            'senderId': req.user.id,
            'receiverId': receiverId,
            'admin': false,
            'message': 'Payment Confirmed',
            'readStatus': false,
            'attachment': '',
            'createdAt': new Date()
        })

        orderData.status = 'paid'
        let updateDoc = await orderData.save();
        let result = {
            'orderId': updateDoc._id,
            'detail': {
                'status': updateDoc.status
            },
            'chat': updateDoc.chat
        }

        socketEmitOne('p2pTransferPay', result, receiverId)
        return res.status(200).json({ 'status': true, 'message': "Payment Confirmed Successfully.", result });

    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Check Two-FA
*/
export const check2FA = async (req, res, next) => {
    try {
        if (req.user.google2Fa && !isEmpty(req.user.google2Fa.secret)) {
            return next();
        } else {
            return res.status(200).json({ 'status': true, 'message': "TFA not enabled. Please enable TFA to release asset.", result: { 'twoFA': "disabled", } });
        }
    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': "Error on server" });
    }
};

/** 
 * Release Asset
 * URL : /api/p2p/releaseAsset
 * METHOD : POST
 * BODY : orderId, twoFACode
*/
export const releaseAsset = async (req, res) => {
    try {
        let reqBody = req.body;

        let check2Fa = node2fa.verifyToken(req.user.google2Fa.secret, reqBody.twoFACode);
        if (!(check2Fa && check2Fa.delta == 0)) {
            return res.status(400).json({ 'status': false, 'message': "Invalid 2FA Code" });
        }

        let orderData = await P2pOrder.findOne({ "_id": reqBody.orderId }).populate({ 'path': "postId", 'select': "status minLimit maxLimit initialMinLimit initialMaxLimit" });

        if (!orderData) {
            return res.status(400).json({ 'status': false, 'message': "There is no order" });
        }

        if (orderData && !orderData.postId) {
            return res.status(400).json({ 'status': false, 'message': "There is no trade" });
        }

        if (orderData.status == 'open') {
            return res.status(400).json({ 'status': false, 'message': "Payment not yet confirmed" });
        }

        if (orderData.status == 'cancelled') {
            return res.status(400).json({ 'status': false, 'message': "Order Already Cancelled" });
        }

        if (orderData.status == 'closed' || orderData.endTime < new Date()) {
            return res.status(400).json({ 'status': false, 'message': "Time Exceeded So Order Closed Already" });
        }

        if (orderData.status == 'dispute') {
            return res.status(400).json({ 'status': false, 'message': "Order Already Disputed" });
        }

        if (orderData.status == 'completed') {
            return res.status(400).json({ 'status': false, 'message': "Order Already Completed" });
        }

        let receiverId;
        if (req.user.id == orderData.sellUserId.toString()) {
            receiverId = orderData.buyUserId
        } else if (req.user.id == orderData.buyUserId.toString()) {
            receiverId = orderData.sellUserId
        }

        orderData['chat'].push({
            'senderId': req.user.id,
            'receiverId': receiverId,
            'admin': false,
            'message': 'Crypto Released to your wallet',
            'readStatus': false,
            'attachment': '',
            'createdAt': new Date()
        })

        orderData.status = 'completed'
        let updateDoc = await orderData.save();

        let result = {
            'orderId': updateDoc._id,
            'detail': {
                'status': updateDoc.status
            },
            'chat': updateDoc.chat
        }

        socketEmitOne('p2pReleaseAsset', result, receiverId)
        res.status(200).json({ 'status': true, 'message': "Crypto Released Successfully.", result });

        // Balance Retrieve
        await Wallet.updateOne({
            "_id": updateDoc.buyUserId,
            'assets._id': updateDoc.firstCoinId
        }, {
            "$inc": {
                "assets.$.p2pBal": updateDoc.receiveValue
            }
        })

        await P2pPost.updateOne({ "_id": updateDoc.postId._id }, {
            "$set": {
                "status": updateDoc.postId.maxLimit == 0 ? 'completed' : 'open',
            }
        })
        return

    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Order Dispute
 * URL : /api/p2p/disputeOrder
 * METHOD : POST
 * PARAMS : orderId
*/
export const disputeOrder = async (req, res) => {
    try {
        let reqParam = req.params;
        let orderData = await P2pOrder.findOne({ "_id": reqParam.orderId }).populate({ 'path': "postId", 'select': "status" });

        if (!orderData) {
            return res.status(400).json({ 'status': false, 'message': "There is no order" });
        }

        if (orderData && !orderData.postId) {
            return res.status(400).json({ 'status': false, 'message': "There is no trade" });
        }

        if (orderData.status == 'new') {
            return res.status(400).json({ 'status': false, 'message': "Payment not yet confirmed" });
        }

        // if (orderData.disputeStatus == 'resolved') {
        //     return res.status(400).json({ 'status': false, 'message': "Already disputed" });
        // }


        if (orderData.status == 'cancelled') {
            return res.status(400).json({ 'status': false, 'message': "Order Already Cancelled" });
        }

        if (orderData.status == 'dispute' || orderData.disputeStatus == 'resolved') {
            return res.status(400).json({ 'status': false, 'message': "Order Already Disputed" });
        }

        if (orderData.status == 'closed') {
            return res.status(400).json({ 'status': false, 'message': "Time Exceeded So Order Closed Already" });
        }

        if (orderData.status == 'completed') {
            return res.status(400).json({ 'status': false, 'message': "Order Already Completed" });
        }

        let receiverId, disputeRaisedBy;
        if (req.user.id == orderData.sellUserId.toString()) {
            disputeRaisedBy = 'sell'
            receiverId = orderData.buyUserId
        } else if (req.user.id == orderData.buyUserId.toString()) {
            disputeRaisedBy = 'buy'
            receiverId = orderData.sellUserId
        }

        orderData['chat'].push({
            'senderId': req.user.id,
            'receiverId': receiverId,
            'admin': false,
            'message': 'Trade Disputed',
            'readStatus': false,
            'attachment': '',
            'createdAt': new Date()
        })

        orderData.status = 'dispute';
        orderData.disputeStatus = 'open';
        orderData.disputeRaisedBy = disputeRaisedBy
        orderData.disputeDate = new Date();

        let updateDoc = await orderData.save();
        let result = {
            'orderId': updateDoc._id,
            'detail': {
                'status': updateDoc.status
            },
            'chat': updateDoc.chat
        }

        socketEmitOne('p2pOrderDispute', result, receiverId)
        return res.status(200).json({ 'status': true, 'message': "Trade Disputed Successfully.", result });

    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}

/** 
 * Order History
 * URL : /api/p2p/orderHistory
 * METHOD : GET
 * QUERY : page, limit, side, coin, pay
*/
export const orderHistory = async (req, res) => {
    try {
        let filter = {}, reqQuery = req.query, paginationArr = [];
        const pagination = paginationQuery(req.query);

        if (!isEmpty(reqQuery.side)) {
            if (reqQuery.side == 'all') {
                filter['$or'] = [{ "buyUserId": new ObjectId(req.user.id) }, { "sellUserId": new ObjectId(req.user.id) }]
            } else if (reqQuery.side == 'sell') {
                filter['sellUserId'] = new ObjectId(req.user.id)
            } else if (reqQuery.side == 'buy') {
                filter['buyUserId'] = new ObjectId(req.user.id)
            }
        } else {
            filter['$or'] = [{ "buyUserId": new ObjectId(req.user.id) }, { "sellUserId": new ObjectId(req.user.id) }]
        }

        if (!isEmpty(reqQuery.coin) && reqQuery.coin != 'all') {
            filter['firstCoin'] = reqQuery.coin;
        }

        if (!isEmpty(reqQuery.pay) && reqQuery.pay != 'all') {
            filter['payBy'] = reqQuery.pay;
        }
        if (!isEmpty(reqQuery.page) && !isEmpty(reqQuery.limit)) {
            paginationArr = [
                { "$skip": pagination.skip },
                { "$limit": pagination.limit },
            ]
        }

        const count = await P2pOrder.countDocuments(filter)
        const data = await P2pOrder.aggregate([
            { "$match": filter },
            { "$sort": { "createdAt": -1 } },
            ...paginationArr,
            {
                "$lookup": {
                    "from": 'currency',
                    "localField": "firstCoinId",
                    "foreignField": "_id",
                    "as": "firstCoinInfo"
                }
            },
            { "$unwind": "$firstCoinInfo" },

            {
                "$project": {
                    'status': 1,
                    'side': 1,
                    'buyUniqueId': 1,
                    'sellUniqueId': 1,
                    'firstCoinId': 1,
                    'firstCoin': 1,
                    'price': 1,
                    'receiveValue': 1,
                    'disputeStatus': 1,
                    'createdAt': 1,
                    'payBy': 1,
                    'orderId': 1,
                    'image': {
                        "$cond": [
                            { "$eq": ['$firstCoinInfo.image', ''] },
                            "",
                            { "$concat": [config.SERVER_URL, config.IMAGE.CURRENCY_URL_PATH, "$firstCoinInfo.image"] }
                        ]
                    }
                }
            }
        ])

        let result = {
            data,
            count: count
        }
        return res.status(200).json({ "success": true, result })
    } catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}

/** 
 * Order History
 * URL : /api/p2p/orderHistoryDoc
 * METHOD : GET
 * QUERY : side, coin, pay
*/
export const orderHistoryDoc = async (req, res) => {
    try {
        let filter = {}, reqQuery = req.query;

        if (!isEmpty(reqQuery.side)) {
            if (reqQuery.side == 'all') {
                filter['$or'] = [{ "buyUserId": new ObjectId(req.user.id) }, { "sellUserId": new ObjectId(req.user.id) }]
            } else if (reqQuery.side == 'sell') {
                filter['sellUserId'] = new ObjectId(req.user.id)
            } else if (reqQuery.side == 'buy') {
                filter['buyUserId'] = new ObjectId(req.user.id)
            }
        }

        if (!isEmpty(reqQuery.coin) && reqQuery.coin != 'all') {
            filter['firstCoin'] = reqQuery.coin;
        }

        if (!isEmpty(reqQuery.pay) && reqQuery.pay != 'all') {
            filter['payBy'] = reqQuery.pay;
        }
        const data = await P2pOrder.find(filter, {
            'status': 1,
            'side': 1,
            'buyUniqueId': 1,
            'sellUniqueId': 1,
            'firstCoinId': 1,
            'firstCoin': 1,
            'price': 1,
            'receiveValue': 1,
            'createdAt': 1,
            'payBy': 1,
            'orderId': 1
        }).sort({ "createdAt": -1 })

        let result = {
            data,
        }
        return res.status(200).json({ "success": true, result })
    } catch (err) {
        return res.status(500).json({ "success": false, 'message': 'Error on server' })
    }
}


/** 
 * Order Auto Close at Time Cross Cron
*/
p2pOrderCrossTime.start()
export const orderClose = async () => {
    p2pOrderCrossTime.stop()
    try {
        let orderList = await P2pOrder.find({ 'status': 'open', 'endTime': { "$lt": new Date() } }).populate({ 'path': "postId", 'select': "status side minLimit maxLimit initialMinLimit initialMaxLimit endDate" });


        if (orderList && orderList.length > 0) {
            for (let orderData of orderList) {
                if (orderData && orderData.postId) {
                    if (orderData.postId.side == 'sell') {
                        // Balance Retrieve
                        let balance = orderData.receiveValue + (orderData.receiveValue * (orderData.feePct / 100))

                        balance = toFixed(balance, 8)
                        await Wallet.updateOne({
                            "_id": orderData.sellUserId,
                            'assets._id': orderData.firstCoinId
                        }, {
                            "$inc": {
                                "assets.$.p2pBal": balance
                            }
                        })
                    } else if (orderData.side == 'sell') {
                        // Balance Retrieve
                        let balance = orderData.receiveValue + (orderData.receiveValue * (orderData.feePct / 100))

                        balance = toFixed(balance, 8)
                        await Wallet.updateOne({
                            "_id": orderData.sellUserId,
                            'assets._id': orderData.firstCoinId
                        }, {
                            "$inc": {
                                "assets.$.p2pBal": balance
                            }
                        })
                    }

                    let curMaxLimit = orderData.postId.maxLimit + orderData.payValue, curMinLimit;
                    if (curMaxLimit > orderData.postId.initialMinLimit) {
                        curMinLimit = orderData.postId.initialMinLimit
                    } else {
                        curMinLimit = curMinLimit;
                    }
                    let diffMin = findBtwDates(new Date(), orderData.postId.endDate, 'minutes', true)


                    let updatePost = {
                        "minLimit": curMinLimit,
                        "maxLimit": curMaxLimit,
                    }

                    if (diffMin > 0) {
                        updatePost['status'] = 'open'
                    }
                    await P2pPost.updateOne({ "_id": orderData.postId._id }, {
                        "$inc": {
                            'filledQuantity': -orderData.receiveValue
                        },
                        "$set": updatePost
                    })

                    let updateDoc = await P2pOrder.findOneAndUpdate({ "_id": orderData._id }, {
                        "$push": {
                            'chat': {
                                'admin': true,
                                'message': 'Trade Closed due to Time Exceeded',
                                'readStatus': false,
                                'attachment': '',
                                'createdAt': new Date()
                            }
                        },
                        'status': 'closed'
                    }, { "new": true })

                    socketEmitOne('p2pOrderCancel', {
                        'orderId': updateDoc._id,
                        'detail': {
                            'status': updateDoc.status
                        },
                        'chat': updateDoc.chat
                    }, updateDoc.buyUserId)

                    socketEmitOne('p2pOrderCancel', {
                        'orderId': updateDoc._id,
                        'detail': {
                            'status': updateDoc.status
                        },
                        'chat': updateDoc.chat
                    }, updateDoc.sellUserId)
                }
            }
        }
        p2pOrderCrossTime.start()
    } catch (err) {
        p2pOrderCrossTime.start()
    }
}

/** 
 * Order Auto Close at Date Cross Cron
*/
p2pPostCrossDate.start()
export const postClose = async () => {
    p2pPostCrossDate.stop()
    try {
        let postList = await P2pPost.find({ 'status': { "$in": ['open', 'pending'] }, 'endDate': { "$lt": new Date() } });
        if (postList && postList.length > 0) {
            for (let postData of postList) {
                if (postData.side == 'sell') {
                    // Balance Retrieve
                    let remainingQty = postData.quantity - postData.filledQuantity
                    let balance = remainingQty + (remainingQty * (postData.feePct / 100))
                    balance = toFixed(balance, 8)
                    await Wallet.updateOne({
                        "_id": postData.userId,
                        'assets._id': postData.firstCoinId
                    }, {
                        "$inc": {
                            "assets.$.p2pBal": balance
                        }
                    })
                }

                await P2pPost.updateOne({
                    '_id': postData._id
                }, {
                    '$set': {
                        "status": 'closed'
                    }
                })
            }
        }
        p2pPostCrossDate.start()
    } catch (err) {
        p2pPostCrossDate.start()
    }
}

/** 
 * P2P Edit Post
 * URL : /api/p2p/postOrder
 * METHOD : PUT
 * BODY : id, quantity, price, minLimit, maxLimit, payBy
*/
export const editPost = async (req, res) => {
    try {
        let reqBody = req.body;
        reqBody.quantity = parseFloat(reqBody.quantity)
        reqBody.price = parseFloat(reqBody.price)
        reqBody.minLimit = parseFloat(reqBody.minLimit)
        reqBody.minLimit = parseFloat(reqBody.minLimit)

        let postData = await P2pPost.findOne({ "_id": reqBody.id })
        if (!postData) {
            return res.status(400).json({ 'status': false, 'message': "There is no post" });
        }

        if (postData.status == 'open') {

            if (postData.side == 'sell') {

                let usrWallet = await Wallet.findOne({ '_id': req.user.id });
                if (!usrWallet) {
                    return res.status(500).json({ 'status': false, 'message': "Error occured" });
                }

                let usrAsset = usrWallet.assets.id(postData.firstCoinId)
                if (!usrAsset) {
                    return res.status(500).json({ 'status': false, 'message': "Error occured" });
                }
                let remainingQuantity = postData.quantity - postData.filledQuantity;

                let orderValue = remainingQuantity + (remainingQuantity * (postData.feePct / 100));
                usrAsset.p2pBal = usrAsset.p2pBal + orderValue;

                let curQuantity = reqBody.quantity + (reqBody.quantity * (postData.feePct / 100))
                if (usrAsset.p2pBal < curQuantity) {
                    return res.status(400).json({ 'status': false, 'message': `Insufficient ${postData.firstCoin} Balance for this Trade` });
                }

                usrAsset.p2pBal = usrAsset.p2pBal - curQuantity;
                await usrWallet.save()
            }

            postData.quantity = reqBody.quantity;
            postData.filledQuantity = 0;
            postData.price = reqBody.price;
            postData.minLimit = reqBody.minLimit;
            postData.maxLimit = reqBody.maxLimit;
            postData.initialMinLimit = reqBody.minLimit;
            postData.initialMaxLimit = reqBody.maxLimit;
            postData.payBy = reqBody.payBy;

            await postData.save();
            return res.json({ status: true, message: "Post Updated Succesfully" });
        }
        return res.status(400).json({ 'status': false, 'message': 'Operation temporarily not allowed' })
    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}


/** 
 * P2P Cancel Post
 * URL : /api/p2p/postOrder
 * METHOD : PATCH
 * BODY : id
*/
export const cancelPost = async (req, res) => {
    try {
        let reqBody = req.body;
        let postData = await P2pPost.findOne({ "_id": reqBody.id })
        if (!postData) {
            return res.status(400).json({ 'status': false, 'message': "There is no post" });
        }

        if (postData.status == 'open') {
            if (postData.side == 'sell') {
                let usrWallet = await Wallet.findOne({ '_id': req.user.id });
                if (!usrWallet) {
                    return res.status(500).json({ 'status': false, 'message': "Error occured" });
                }

                let usrAsset = usrWallet.assets.id(postData.firstCoinId)
                if (!usrAsset) {
                    return res.status(500).json({ 'status': false, 'message': "Error occured" });
                }
                let remainingQuantity = postData.quantity - postData.filledQuantity;

                let orderValue = remainingQuantity + (remainingQuantity * (postData.feePct / 100));

                usrAsset.p2pBal = usrAsset.p2pBal + orderValue;
                await usrWallet.save()
            }

            postData.status = 'cancelled';
            await postData.save();
            return res.status(200).json({ 'status': true, 'message': "Post Cancelled Succesfully" });
        }
        return res.status(400).json({ 'status': false, 'message': 'Operation temporarily not allowed' })

    } catch (err) {
        return res.status(400).json({ 'status': false, 'message': "Error occured" });
    }
}

/* ************************************ */



/**
 * Post cancel My ad
 * METHOD: POST
 * URL : /api/cancelMyad
 */
export const cancelMyad = async (req, res) => {
    try {

        var userid = req.body.userId;
        var postadid = req.body.postId;
        var Tradedata = await P2PTradeTable.findOne({ _id: postadid });
        // cancel ads remaining amount credited to seller wallet
        if (Tradedata.BuyorSell == "Sell") {
            var assets = await Assets.findOne({ userId: req.body.userId, currencySymbol: Tradedata.firstCurrency });

            var current_cryptobalance = assets.p2pWallet;
            var refund_amount = parseFloat(parseFloat(Tradedata.beforeBalance - Tradedata.afterBalance).toFixed(8));
            var new_cryptobalance = parseFloat(current_cryptobalance.toFixed(8)) + refund_amount;
            var holdingbalance = parseFloat(assets.p2pholdingbalance.toFixed(8)) - refund_amount;
            await Assets.findOneAndUpdate({ _id: new ObjectId(assets._id) }, {
                $set: {
                    p2pholdingbalance: holdingbalance,
                    p2pWallet: new_cryptobalance,
                }
            });
        }
        // End cancel ads

        let update = { status: "3" };
        P2PTradeTable.findOneAndUpdate({ _id: postadid }, { $set: update }, function (err, result) {
            if (result) {
                var pairName = result.firstCurrency + result.secondCurrency;
                return res.status(200).json({ status: true, message: "Trade Cancelled Succesfully" });
            } else {
                return res.status(400).json({ status: false, message: "Unable to Cancel the Trade" });
            }
        });
    } catch (err) {
        return res.status(400).json({ status: false, message: "Error occured" });
    }
};


/**
 * P2P order update
 * URL : /api/p2pPostTrade
 * METHOD : POST
 * BODY : userId, fromcurrency, tocurrency,minlimit,maxlimit,posttradeprice,type,startDate,postprefcurrency,quantity,postcheckboxaccept;
 */
export const p2pUpdateTrade = async (req, res) => {
    try {
        var transferMode = req.body.postprefcurrency;
        var userid = req.body.userId;
        var postadid = req.body.postId;
        var postminlimit = req.body.minlimit;
        var postmaxlimit = req.body.maxlimit;
        var quantity = req.body.quantity;
        var posttradeprice = Number(req.body.price);

        var userdata = await User.findOne({ _id: userid });
        var Tradedata = await P2PTradeTable.findOne({ _id: postadid, status: "0" });
        var assetdata = await Assets.findOne({ userId: req.body.userId, currencySymbol: Tradedata.firstCurrency });

        var current_cryptobalance = parseFloat(assetdata.p2pWallet.toFixed(8));
        var current_holdingbalance = parseFloat(assetdata.p2pholdingbalance.toFixed(8));

        // Old Holding balance removal
        var oldquantity = Tradedata.quantity;
        var oldfeeamount = parseFloat(parseFloat(oldquantity * (Tradedata.fee_percentage / 100)).toFixed(8));
        var oldholdingbalance = parseFloat((parseFloat(oldquantity) + parseFloat(oldfeeamount)).toFixed(8));
        var holdingbalance = parseFloat((current_holdingbalance - oldholdingbalance).toFixed(8));
        var new_cryptobalance = parseFloat((current_cryptobalance + oldholdingbalance).toFixed(8));

        var new_fee_amount = parseFloat(parseFloat(quantity) * (Tradedata.fee_percentage / 100)).toFixed(8);
        var total_amount = parseFloat(quantity) + parseFloat(new_fee_amount);
        if (Tradedata.BuyorSell === "Sell") {
            assetdata.p2pWallet = new_cryptobalance;
            assetdata.p2pholdingbalance = holdingbalance;

            //New Updated values holding balance updation
            if (total_amount < new_cryptobalance) {
                var new_asset = await assetdata.save();
                var new_holdingbalance = new_asset.p2pholdingbalance + total_amount;
                var current_p2pbalance = new_asset.p2pWallet - total_amount;
                new_asset.p2pWallet = current_p2pbalance;
                new_asset.p2pholdingbalance = new_holdingbalance;

                var final_update = await new_asset.save();

                let update = {
                    quantity: quantity,
                    minlimit: postminlimit,
                    maxlimit: postmaxlimit,
                    minlimit_initial: postminlimit,
                    maxlimit_initial: postmaxlimit,
                    price: posttradeprice,
                    fee_amount: new_fee_amount,
                    beforeBalance: total_amount,
                    afterBalance: 0,
                    transferMode: transferMode,
                };

                P2PTradeTable.findOneAndUpdate({ _id: postadid }, { $set: update }, function (err, result) {
                    if (result) {
                        var pairName = result.firstCurrency + result.secondCurrency;
                        return res.json({ status: true, message: "Trade Updated Succesfully" });
                    }
                });
            } else {
                return res.status(400).json({ status: false, message: "Balance is too low to Edit" });
            }
        } else {
            let update = {
                quantity: quantity,
                minlimit: postminlimit,
                maxlimit: postmaxlimit,
                minlimit_initial: postminlimit,
                maxlimit_initial: postmaxlimit,
                price: posttradeprice,
                fee_amount: new_fee_amount,
                beforeBalance: total_amount,
                afterBalance: 0,
                transferMode: transferMode,
            };

            P2PTradeTable.findOneAndUpdate({ _id: postadid }, { $set: update }, function (err, result) {
                if (result) {
                    var pairName = result.firstCurrency + result.secondCurrency;
                    return res.json({ status: true, message: "Trade Updated Succesfully" });
                } else {
                    return res.json({ status: false, message: "Unable to Update the Trade" });
                }
            });
        }
    } catch (err) {
        return res.status(400).json({ status: false, message: "Error occured" });
    }
};

export const disputeTrade = async (req, res) => {
    try {
        var reqBody = req.body;
        var orderbookdata = await P2POrderbook.findOne({ _id: new ObjectId(reqBody.id) });

        if (orderbookdata.status == 0) {
            return res.status(400).json({ status: false, message: "Payment not yet confirmed" });
        }

        if (orderbookdata.status == 2) {
            return res.status(400).json({ status: false, message: "Trade Already Cancelled" });
        }
        if (orderbookdata.status == 3) {
            return res.status(400).json({ status: false, message: "Trade Already Disputed" });
        }
        if (orderbookdata.status == 5) {
            return res.status(400).json({ status: false, message: "Time Exceeded So Trade Closed Already" });
        }

        if (orderbookdata.status == 4) {
            return res.status(400).json({ status: false, message: "Trade Already Completed" });
        }

        var TradeId = orderbookdata.trade_id;
        var orderbookId = orderbookdata._id;

        if (orderbookdata.from_userId == reqBody.userid) {
            var raised_by = "Seller";
        } else {
            var raised_by = "Buyer";
        }

        const dispute = new P2PDispute({
            seller_id: orderbookdata.from_userId,
            buyer_id: orderbookdata.to_userId,
            raised_by: raised_by,
            TradeId: TradeId,
            orderbookId: orderbookId,
        });
        await dispute.save();

        var tradetable = await P2PTradeTable.findOne({ _id: new ObjectId(orderbookdata.trade_id) });
        var Sender_userId = new ObjectId(reqBody.userid);
        var Receiver_userId = orderbookdata.from_userId == reqBody.userid ? new ObjectId(orderbookdata.to_userId) : new ObjectId(orderbookdata.from_userId);
        var message = "Trade Disputed";

        const chatsave = new P2PChat({
            Sender_userId: Sender_userId,
            Receiver_userId: Receiver_userId,
            message: message,
            TradeId: TradeId,
            orderbookId: orderbookId,
        });

        chatsave.save().then(async (saved) => {
            if (saved) {
                await P2POrderbook.findOneAndUpdate({ _id: new ObjectId(orderbookdata._id) }, { $set: { status: 3 } });
                let checkUser = await User.findOne({ _id: Sender_userId });
                var pair = orderbookdata.firstCurrency + "-" + orderbookdata.secondCurrency;
                let content = {
                    id: orderbookdata.trade_id,
                    FiatAmount: orderbookdata.fiat_amount,
                    CryptoAmount: orderbookdata.crypto_amount,
                    Pair: pair,
                };
                mailTemplateLang({
                    userId: Sender_userId,
                    identifier: "Trade_disputed",
                    toEmail: checkUser.email,
                    content,
                });
                let checkUser1 = await User.findOne({ _id: Receiver_userId });
                mailTemplateLang({
                    userId: Receiver_userId,
                    identifier: "Trade_disputed",
                    toEmail: checkUser1.email,
                    content,
                });
                let description = "Your trade was Disputed";

                let newNotification = new Notification({
                    description: description,
                    userId: Sender_userId,
                    uri: "p2pchat",
                    ObjectId: orderbookdata._id,
                });
                await newNotification.save();
                socketEmitOne('notification', {}, Sender_userId);

                let newNotification1 = new Notification({
                    description: description,
                    userId: Receiver_userId,
                    uri: "p2pchat",
                    ObjectId: orderbookdata._id,
                });
                await newNotification1.save();
                socketEmitOne('notification', {}, Receiver_userId);

                const response_chat = await P2PChat.aggregate([{
                    $match: { _id: new ObjectId(saved._id) }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "Sender_userId",
                        foreignField: "_id",
                        as: "senderdetails",
                    },
                },
                { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        localField: "Receiver_userId",
                        foreignField: "_id",
                        as: "receiverdetails",
                    },
                },
                { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        message: 1,
                        attachment: 1,
                        Sender_userId: 1,
                        Receiver_userId: 1,
                        admin: 1,
                        created_at: 1,
                        receiverdetails: {
                            name: {
                                $switch: {
                                    branches: [{
                                        case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                                        then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                                    }],
                                    default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                                }
                            }
                        },
                        senderdetails: {
                            name: {
                                $switch: {
                                    branches: [{
                                        case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                                        then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                                    }],
                                    default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                                }
                            }
                        },
                    },
                }]).sort({ _id: -1 })
                
                if(response_chat){
                    socketEmitChat("p2pchat-" + reqBody.id, response_chat);
                }
                // P2PChat.aggregate([{
                //     $match: { _id: new ObjectId(saved._id) }
                // },
                // {
                //     $lookup: {
                //         from: "users",
                //         localField: "Sender_userId",
                //         foreignField: "_id",
                //         as: "senderdetails",
                //     },
                // },
                // { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                // {
                //     $lookup: {
                //         from: "users",
                //         localField: "Receiver_userId",
                //         foreignField: "_id",
                //         as: "receiverdetails",
                //     },
                // },
                // { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                // {
                //     $project: {
                //         message: 1,
                //         attachment: 1,
                //         Sender_userId: 1,
                //         Receiver_userId: 1,
                //         admin: 1,
                //         created_at: 1,
                //         receiverdetails: {
                //             name: {
                //                 $switch: {
                //                     branches: [{
                //                         case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                //                         then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                //                     }],
                //                     default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                //                 }
                //             }
                //         },
                //         senderdetails: {
                //             name: {
                //                 $switch: {
                //                     branches: [{
                //                         case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                //                         then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                //                     }],
                //                     default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                //                 }
                //             }
                //         },
                //     },
                // }]).sort({ _id: -1 }).exec(function (err, response_chat) {
                //     socketEmitChat("p2pchat-" + reqBody.id, response_chat);
                // });
                return res.json({ status: true, message: "Trade Disputed Successfully." });
            }
        });
    } catch (err) {
        return res.status(400).json({ status: false, message: "Error occured" });
    }
};


export const closeDateCrossed = async () => {
    try {
        var tradeData = await P2PTradeTable.find({ postStartDate: { $lt: new Date() }, status: "0" });
        if (tradeData) {
            tradeData.map(async (item, key) => {
                if (item.BuyorSell == "Sell") {
                    var assets = await Assets.findOne({ userId: new ObjectId(item.userId), currencySymbol: item.firstCurrency });
                    var current_cryptobalance = parseFloat(assets.p2pWallet.toFixed(8));
                    var crypto_amount = item.quantity;
                    var trade_fee = item.fee_amount;
                    var refund_amount = crypto_amount + trade_fee;
                    var new_cryptobalance = current_cryptobalance + refund_amount;
                    var holdingbalance = assets.p2pholdingbalance - refund_amount;

                    var updateObj = { p2pholdingbalance: holdingbalance, p2pWallet: new_cryptobalance };
                    await Assets.findByIdAndUpdate(assets._id, updateObj, { new: true }, function (err, doc) {
                        if (err) {
                        }
                    });
                }

                P2PTradeTable.findByIdAndUpdate(item._id, { status: "3" }, { new: true }, (err, doc) => {
                    if (err) {
                    }
                });
            });
        }
    } catch (err) {
    }
};

export const closeOrder = async () => {
    try {
        var orderbookdatas = await P2POrderbook.aggregate([{
            $match: { $and: [{ status: 0 }, { end_time: { $lt: new Date() } }] }
        }]);
        ;

        if (orderbookdatas.length) {
            orderbookdatas.map(async (orderbookdata, key) => {
                var tradetable = await P2PTradeTable.findOne({ _id: new ObjectId(orderbookdata.trade_id) });

                var message = "Trade Closed due to Time Exceeded";
                var TradeId = orderbookdata.trade_id;
                var orderbookId = orderbookdata._id;

                const chatsave = new P2PChat({
                    admin: 1,
                    message: message,
                    TradeId: TradeId,
                    orderbookId: orderbookId,
                });

                chatsave.save().then(async (saved) => {
                    if (saved) {
                        // Balance credited back to seller
                        var crypto_currency = tradetable.firstCurrency;
                        var crypto_amount = orderbookdata.crypto_amount;
                        var trade_fee = orderbookdata.trade_fee;
                        var refund_amount = crypto_amount + trade_fee;

                        if (tradetable.BuyorSell == 'Buy') {
                            const assets = await Assets.findOne({ userId: new ObjectId(orderbookdata.from_userId), currencySymbol: crypto_currency });
                            var current_cryptobalance = assets.p2pWallet;
                            var new_cryptobalance = current_cryptobalance + refund_amount;
                            var holdingbalance = assets.p2pholdingbalance - refund_amount;
                            await Assets.findOneAndUpdate({ _id: new ObjectId(assets._id) }, {
                                $set: {
                                    p2pholdingbalance: holdingbalance,
                                    p2pWallet: new_cryptobalance,
                                },
                            });
                        }
                        // End

                        // Update trade balance
                        var afterBalance = Number(tradetable.afterBalance) - refund_amount;
                        // Trade Limit condition
                        var quantity = tradetable.quantity + orderbookdata.crypto_amount;
                        var minlimit_initial = tradetable.minlimit_initial;
                        var minlimit = tradetable.minlimit;
                        var maxlimit = tradetable.maxlimit;
                        var currentmaxlimit = maxlimit + orderbookdata.fiat_amount;
                        if (currentmaxlimit > minlimit_initial) {
                            var currentminlimit = minlimit_initial;
                        } else {
                            var currentminlimit = currentmaxlimit;
                        }
                        var status = 0;
                        //  End Limit

                        await P2PTradeTable.findOneAndUpdate({ _id: new ObjectId(tradetable._id) }, {
                            $set: {
                                afterBalance: afterBalance,
                                maxlimit: currentmaxlimit,
                                minlimit: currentminlimit,
                                status: status,
                                quantity: quantity,
                            },
                        });
                        // End Update trade balance

                        // Update trade Status
                        await P2POrderbook.findOneAndUpdate({ _id: new ObjectId(orderbookdata._id) }, {
                            $set: {
                                status: 5,
                            },
                        });
                        // End

                        let checkUser = await User.findOne({ _id: orderbookdata.from_userId });
                        let checkUser1 = await User.findOne({ _id: orderbookdata.to_userId });

                        var pair = orderbookdata.firstCurrency + "-" + orderbookdata.secondCurrency;

                        let description = `Your Trade has been closed for the Pair : ${pair} | Reason : Time Exceeded`;

                        let newNotification = new Notification({
                            description: description,
                            userId: checkUser._id,
                            uri: "p2pchat",
                            ObjectId: orderbookdata._id,
                        });
                        await newNotification.save();
                        socketEmitOne('notification', {}, checkUser._id);

                        let newNotification1 = new Notification({
                            description: description,
                            userId: checkUser1._id,
                            uri: "p2pchat",
                            ObjectId: orderbookdata._id,
                        });
                        newNotification1.save();
                        socketEmitOne('notification', {}, checkUser1._id);

                        const response_chat = await P2PChat.aggregate([{
                            $match: { _id: new ObjectId(saved._id) }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "Sender_userId",
                                foreignField: "_id",
                                as: "senderdetails",
                            },
                        },
                        { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "Receiver_userId",
                                foreignField: "_id",
                                as: "receiverdetails",
                            },
                        },
                        { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                message: 1,
                                attachment: 1,
                                Sender_userId: 1,
                                Receiver_userId: 1,
                                admin: 1,
                                created_at: 1,
                                receiverdetails: {
                                    name: {
                                        $switch: {
                                            branches: [{
                                                case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                                                then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                                            }],
                                            default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                                        }
                                    }
                                },
                                senderdetails: {
                                    name: {
                                        $switch: {
                                            branches: [{
                                                case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                                                then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                                            }],
                                            default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                                        }
                                    }
                                },
                            },
                        }]).sort({ _id: -1 })
                        if(response_chat){
                            socketEmitChat("p2pchat-" + orderbookdata._id, response_chat);
                        }
                        // P2PChat.aggregate([{
                        //     $match: { _id: new ObjectId(saved._id) }
                        // },
                        // {
                        //     $lookup: {
                        //         from: "users",
                        //         localField: "Sender_userId",
                        //         foreignField: "_id",
                        //         as: "senderdetails",
                        //     },
                        // },
                        // { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                        // {
                        //     $lookup: {
                        //         from: "users",
                        //         localField: "Receiver_userId",
                        //         foreignField: "_id",
                        //         as: "receiverdetails",
                        //     },
                        // },
                        // { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                        // {
                        //     $project: {
                        //         message: 1,
                        //         attachment: 1,
                        //         Sender_userId: 1,
                        //         Receiver_userId: 1,
                        //         admin: 1,
                        //         created_at: 1,
                        //         receiverdetails: {
                        //             name: {
                        //                 $switch: {
                        //                     branches: [{
                        //                         case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                        //                         then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                        //                     }],
                        //                     default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                        //                 }
                        //             }
                        //         },
                        //         senderdetails: {
                        //             name: {
                        //                 $switch: {
                        //                     branches: [{
                        //                         case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                        //                         then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                        //                     }],
                        //                     default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                        //                 }
                        //             }
                        //         },
                        //     },
                        // }]).sort({ _id: -1 }).exec(function (err, response_chat) {
                        //     socketEmitChat("p2pchat-" + orderbookdata._id, response_chat);
                        // });
                    }
                });
            });
        }
    } catch (err) {
    }
};



export const releaseCryptocurrency = async (req, res) => {
    try {
        var reqBody = req.body;
        let userId = reqBody.userid;
        let checkUser = await User.findOne({ _id: userId });

        if (checkUser) {
            let check2Fa = node2fa.verifyToken(checkUser.google2Fa.secret, reqBody.twoFACode);

            if (!(check2Fa && check2Fa.ditema == 0)) {
                return res.status(400).json({ status: false, message: "Invalid 2FA Code" });
            } else {
                var orderbookdata = await P2POrderbook.findOne({ _id: new ObjectId(reqBody.id) });

                if (orderbookdata.status == 0) {
                    return res.status(400).json({ status: false, message: "Payment not yet confirmed" });
                }
                if (orderbookdata.status == 2) {
                    return res.status(400).json({ status: false, message: "Trade Already Cancelled" });
                }
                if (orderbookdata.status == 5) {
                    return res.status(400).json({ status: false, message: "Time Exceeded So Trade Closed Already" });
                }
                if (orderbookdata.status == 3) {
                    return res.status(400).json({ status: false, message: "Trade Already Disputed" });
                }
                if (orderbookdata.status == 4) {
                    return res.status(400).json({ status: false, message: "Trade Already Completed" });
                }

                var tradetable = await P2PTradeTable.findOne({ _id: new ObjectId(orderbookdata.trade_id) });

                var Sender_userId = new ObjectId(reqBody.userid);
                var Receiver_userId = new ObjectId(tradetable.userId);
                var message = "Crypto Released to your wallet";
                var TradeId = orderbookdata.trade_id;
                var orderbookId = orderbookdata._id;

                const chatsave = new P2PChat({
                    Sender_userId: Sender_userId,
                    Receiver_userId: Receiver_userId,
                    message: message,
                    TradeId: TradeId,
                    orderbookId: orderbookId,
                });

                chatsave.save().then(async (saved) => {
                    if (saved) {
                        // payment released to buyer
                        var crypto_currency = tradetable.firstCurrency;
                        var assets = await Assets.findOne({ userId: new ObjectId(orderbookdata.to_userId), currencySymbol: crypto_currency });
                        var current_cryptobalance = assets.p2pWallet;
                        var crypto_amount = orderbookdata.crypto_amount;
                        var new_cryptobalance = current_cryptobalance + crypto_amount;
                        await Assets.findOneAndUpdate({ _id: new ObjectId(assets._id) }, { $set: { p2pWallet: new_cryptobalance } });

                        // p2p trade fee
                        var trade_fee = Number(orderbookdata.crypto_amount) * (Number(orderbookdata.trade_fee_percentage) / 100);
                        var holding_balance = Number(orderbookdata.crypto_amount) + Number(trade_fee);
                        Assets.findOneAndUpdate({ userId: new ObjectId(orderbookdata.from_userId), currencySymbol: orderbookdata.firstCurrency }, { $inc: { p2pholdingbalance: -holding_balance } }, { new: true }, function (err, dd) {
                        });

                        // Update trade Status
                        await P2POrderbook.findOneAndUpdate({ _id: new ObjectId(orderbookdata._id) }, { $set: { status: 4 } });
                        await P2PTradeTable.findByIdAndUpdate({ _id: new ObjectId(TradeId) }, { $set: { status: 0 } });

                        if (tradetable.maxlimit == 0) {
                            await P2PTradeTable.findByIdAndUpdate({ _id: new ObjectId(TradeId) }, { $set: { status: 1 } });
                        }
                        await User.update({ _id: Sender_userId }, { $inc: { p2pCompletedSellOrder: 1 } });
                        await User.update({ _id: Receiver_userId }, { $inc: { p2pCompletedBuyOrder: 1 } });

                        // save admin revenue
                        await new AdminRevenue({
                            fee: orderbookdata.trade_fee,
                            email: checkUser.email,
                            amount: orderbookdata.crypto_amount,
                            order_id: orderbookdata._id,
                            trade_id: orderbookdata.trade_id,
                            currency: orderbookdata.firstCurrency,
                            currency_type: "Crypto",
                            type: "P2p",
                        }).save();

                        // send email to seller
                        var pair = orderbookdata.firstCurrency + "-" + orderbookdata.secondCurrency;
                        let content = {
                            Date: new Date(),
                            FiatAmount: orderbookdata.fiat_amount,
                            CryptoAmount: orderbookdata.crypto_amount,
                            Pair: pair,
                        };

                        mailTemplateLang({
                            userId: Sender_userId,
                            identifier: "Trade_completed",
                            toEmail: checkUser.email,
                            content,
                        });

                        // send email to buyer
                        let checkUser1 = await User.findOne({ _id: Receiver_userId });
                        mailTemplateLang({
                            userId: Receiver_userId,
                            identifier: "Trade_completed",
                            toEmail: checkUser1.email,
                            content,
                        });

                        let description = "Crypto Released to your wallet for the Pair : " + pair;
                        // let newNotification = new Notification({
                        //     description: description,
                        //     userId: Receiver_userId,
                        //     uri: "p2pchat",
                        //     new ObjectId: orderbookdata._id,
                        // });
                        // await newNotification.save();
                        // socketEmitOne('notification', {}, Receiver_userId);

                        // get chat history
                        const response_chat = await P2PChat.aggregate([{
                            $match: { _id: new ObjectId(saved._id) }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "Sender_userId",
                                foreignField: "_id",
                                as: "senderdetails",
                            },
                        },
                        { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "Receiver_userId",
                                foreignField: "_id",
                                as: "receiverdetails",
                            },
                        },
                        { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                message: 1,
                                attachment: 1,
                                Sender_userId: 1,
                                Receiver_userId: 1,
                                admin: 1,
                                created_at: 1,
                                receiverdetails: {
                                    name: {
                                        $switch: {
                                            branches: [{
                                                case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                                                then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                                            }],
                                            default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                                        }
                                    }
                                },
                                senderdetails: {
                                    name: {
                                        $switch: {
                                            branches: [{
                                                case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                                                then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                                            }],
                                            default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                                        }
                                    }
                                },
                            },
                        }]).sort({ _id: -1 })
                        if(response_chat){
                            socketEmitChat("p2pchat-" + reqBody.id, response_chat);
                        }
                        // P2PChat.aggregate([{
                        //     $match: { _id: new ObjectId(saved._id) }
                        // },
                        // {
                        //     $lookup: {
                        //         from: "users",
                        //         localField: "Sender_userId",
                        //         foreignField: "_id",
                        //         as: "senderdetails",
                        //     },
                        // },
                        // { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                        // {
                        //     $lookup: {
                        //         from: "users",
                        //         localField: "Receiver_userId",
                        //         foreignField: "_id",
                        //         as: "receiverdetails",
                        //     },
                        // },
                        // { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                        // {
                        //     $project: {
                        //         message: 1,
                        //         attachment: 1,
                        //         Sender_userId: 1,
                        //         Receiver_userId: 1,
                        //         admin: 1,
                        //         created_at: 1,
                        //         receiverdetails: {
                        //             name: {
                        //                 $switch: {
                        //                     branches: [{
                        //                         case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                        //                         then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                        //                     }],
                        //                     default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                        //                 }
                        //             }
                        //         },
                        //         senderdetails: {
                        //             name: {
                        //                 $switch: {
                        //                     branches: [{
                        //                         case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                        //                         then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                        //                     }],
                        //                     default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                        //                 }
                        //             }
                        //         },
                        //     },
                        // }]).sort({ _id: -1 }).exec(function (err, response_chat) {
                        //     socketEmitChat("p2pchat-" + reqBody.id, response_chat);

                        // });
                        // End
                        let userId = await getUserId(req);
                        let wallet = await Assets.findOne({ userId: new ObjectId(userId), currencySymbol: crypto_currency }).lean();
                        return res.json({ status: true, wallet: wallet, message: "Crypto Released Successfully." });
                    }
                });
            }
        }
    } catch (err) {
        return res.status(400).json({ status: false, message: "Error occured" });
    }
};


export const confirmPay = async (req, res) => {
    try {
        var reqBody = req.body;
        var orderbookdata = await P2POrderbook.findOne({ _id: new ObjectId(reqBody.id) });

        if (orderbookdata.status == 1) {
            return res.status(400).json({ status: false, message: "Payment Already Confirmed" });
        }
        if (orderbookdata.status == 2) {
            return res.status(400).json({ status: false, message: "Trade Already Cancelled" });
        }
        if (orderbookdata.status == 5) {
            return res.status(400).json({ status: false, message: "Time Exceeded So Trade Closed Already" });
        }
        if (orderbookdata.status == 3) {
            return res.status(400).json({ status: false, message: "Trade Already Disputed" });
        }
        if (orderbookdata.status == 4) {
            return res.status(400).json({ status: false, message: "Trade Already Completed" });
        }

        var tradetable = await P2PTradeTable.findOne({ _id: new ObjectId(orderbookdata.trade_id) });

        var Sender_userId = new ObjectId(reqBody.userid);
        var Receiver_userId = orderbookdata.from_userId == reqBody.userid ? new ObjectId(orderbookdata.to_userId) : new ObjectId(orderbookdata.from_userId);
        var message = "Payment Confirmed";
        var TradeId = orderbookdata.trade_id;
        var orderbookId = orderbookdata._id;

        const chatsave = new P2PChat({
            Sender_userId: Sender_userId,
            Receiver_userId: Receiver_userId,
            message: message,
            TradeId: TradeId,
            orderbookId: orderbookId,
        });

        chatsave.save().then(async (saved) => {
            if (saved) {
                await P2POrderbook.findOneAndUpdate({ _id: new ObjectId(orderbookdata._id) }, { $set: { status: 1 } });

                let pair = orderbookdata.firstCurrency + "-" + orderbookdata.secondCurrency;
                let description = "Payment has been confirmed for the Pair : " + pair;
                // let newNotification = new Notification({
                //     description: description,
                //     userId: Receiver_userId,
                //     uri: "p2pchat",
                //     new ObjectId: orderbookdata._id,
                // });
                // await newNotification.save();
                // socketEmitOne('notification', {}, Receiver_userId);

                const response_chat = await P2PChat.aggregate([{
                    $match: { _id: new ObjectId(saved._id) }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "Sender_userId",
                        foreignField: "_id",
                        as: "senderdetails",
                    },
                },
                { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        localField: "Receiver_userId",
                        foreignField: "_id",
                        as: "receiverdetails",
                    },
                },
                { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        message: 1,
                        attachment: 1,
                        Sender_userId: 1,
                        Receiver_userId: 1,
                        admin: 1,
                        created_at: 1,
                        receiverdetails: {
                            name: {
                                $switch: {
                                    branches: [{
                                        case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                                        then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                                    }],
                                    default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                                }
                            }
                        },
                        senderdetails: {
                            name: {
                                $switch: {
                                    branches: [{
                                        case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                                        then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                                    }],
                                    default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                                }
                            }
                        },
                    },
                }]).sort({ _id: -1 })
                if(response_chat){
                    socketEmitChat("p2pchat-" + reqBody.id, response_chat); 
                }
                // P2PChat.aggregate([{
                //     $match: { _id: new ObjectId(saved._id) }
                // },
                // {
                //     $lookup: {
                //         from: "users",
                //         localField: "Sender_userId",
                //         foreignField: "_id",
                //         as: "senderdetails",
                //     },
                // },
                // { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                // {
                //     $lookup: {
                //         from: "users",
                //         localField: "Receiver_userId",
                //         foreignField: "_id",
                //         as: "receiverdetails",
                //     },
                // },
                // { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                // {
                //     $project: {
                //         message: 1,
                //         attachment: 1,
                //         Sender_userId: 1,
                //         Receiver_userId: 1,
                //         admin: 1,
                //         created_at: 1,
                //         receiverdetails: {
                //             name: {
                //                 $switch: {
                //                     branches: [{
                //                         case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                //                         then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                //                     }],
                //                     default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                //                 }
                //             }
                //         },
                //         senderdetails: {
                //             name: {
                //                 $switch: {
                //                     branches: [{
                //                         case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                //                         then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                //                     }],
                //                     default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                //                 }
                //             }
                //         },
                //     },
                // }]).sort({ _id: -1 }).exec(function (err, response_chat) {
                //     socketEmitChat("p2pchat-" + reqBody.id, response_chat);
                // });
                return res.json({ status: true, message: "Payment Confirmed Successfully." });
            }
        });
    } catch (err) {
        return res.status(400).json({ status: false, message: "Error occured" });
    }
};

export const cancitemrade = async (req, res) => {
    try {
        var reqBody = req.body;
        var orderbookdata = await P2POrderbook.findOne({ _id: new ObjectId(reqBody.id) });

        if (orderbookdata.status == 1) {
            return res.status(400).json({ status: false, message: "Already paid. if not paid please raise dispute" });
        }
        if (orderbookdata.status == 2) {
            return res.status(400).json({ status: false, message: "Trade Already Cancelled" });
        }
        if (orderbookdata.status == 3) {
            return res.status(400).json({ status: false, message: "Trade Already Disputed" });
        }
        if (orderbookdata.status == 5) {
            return res.status(400).json({ status: false, message: "Time Exceeded So Trade Closed Already" });
        }
        if (orderbookdata.status == 4) {
            return res.status(400).json({ status: false, message: "Trade Already Completed" });
        }

        var tradetable = await P2PTradeTable.findOne({ _id: new ObjectId(orderbookdata.trade_id) });
        var Sender_userId = new ObjectId(reqBody.userid);
        var Receiver_userId = new ObjectId(tradetable.userId);
        var message = "Trade Cancelled";
        var TradeId = orderbookdata.trade_id;
        var orderbookId = orderbookdata._id;

        const chatsave = new P2PChat({
            Sender_userId: Sender_userId,
            Receiver_userId: Receiver_userId,
            message: message,
            TradeId: TradeId,
            orderbookId: orderbookId,
        });

        chatsave.save().then(async (saved) => {
            if (saved) {
                // Balance credited back to seller
                var crypto_currency = tradetable.firstCurrency;
                var crypto_amount = orderbookdata.trade_fee + orderbookdata.crypto_amount;
                var refund_amount = parseFloat(crypto_amount.toFixed(8));

                if (tradetable.BuyorSell == 'Buy') {
                    const assets = await Assets.findOne({ userId: new ObjectId(orderbookdata.from_userId), currencySymbol: crypto_currency });
                    var current_cryptobalance = assets.p2pWallet;
                    var new_cryptobalance = current_cryptobalance + refund_amount;
                    var holdingbalance = assets.p2pholdingbalance - refund_amount;
                    await Assets.findOneAndUpdate({ _id: new ObjectId(assets._id) }, {
                        $set: {
                            p2pholdingbalance: holdingbalance,
                            p2pWallet: new_cryptobalance
                        }
                    });
                }

                // Update trade balance
                var afterBalance = Number(tradetable.afterBalance) - refund_amount;
                var quantity = tradetable.quantity + orderbookdata.crypto_amount;
                // Trade Limit condition
                var minlimit_initial = tradetable.minlimit_initial;
                var minlimit = tradetable.minlimit;
                var maxlimit = tradetable.maxlimit;
                var currentmaxlimit = maxlimit + orderbookdata.fiat_amount;
                if (currentmaxlimit > minlimit_initial) {
                    var currentminlimit = minlimit_initial;
                } else {
                    var currentminlimit = currentmaxlimit;
                }
                var status = 0;
                //  End Limit

                await P2PTradeTable.findOneAndUpdate({ _id: new ObjectId(tradetable._id) }, {
                    $set: {
                        afterBalance: afterBalance,
                        maxlimit: currentmaxlimit,
                        minlimit: currentminlimit,
                        status: status,
                        quantity: quantity,
                    }
                });
                // End Update trade balance

                // Update trade Status
                await P2POrderbook.findOneAndUpdate({ _id: new ObjectId(orderbookdata._id) }, { $set: { status: 2 } });
                // End
                let checkUser = await User.findOne({ _id: orderbookdata.from_userId });
                var pair = orderbookdata.firstCurrency + "-" + orderbookdata.secondCurrency;
                let content = {
                    FiatAmount: orderbookdata.fiat_amount,
                    CryptoAmount: orderbookdata.crypto_amount,
                    Pair: pair,
                };
                mailTemplateLang({
                    userId: checkUser._id,
                    identifier: "Trade_cancelled",
                    toEmail: checkUser.email,
                    content,
                });

                let checkUser1 = await User.findOne({ _id: orderbookdata.to_userId });
                mailTemplateLang({
                    userId: checkUser1._id,
                    identifier: "Trade_cancelled",
                    toEmail: checkUser1.email,
                    content,
                });

                let description = "Your trade was Cancelled";
                // let newNotification = new Notification({
                //     description: description,
                //     userId: checkUser._id,
                //     uri: "p2pchat",
                //     new ObjectId: orderbookdata._id,
                // });
                // await newNotification.save();
                // socketEmitOne('notification', {}, checkUser._id);

                // let newNotification1 = new Notification({
                //     description: description,
                //     userId: checkUser1._id,
                //     uri: "p2pchat",
                //     new ObjectId: orderbookdata._id,
                // });
                // newNotification1.save();
                // socketEmitOne('notification', {}, checkUser1._id);
const response_chat = await P2PChat.aggregate([{
    $match: { _id: new ObjectId(saved._id) }
},
{
    $lookup: {
        from: "users",
        localField: "Sender_userId",
        foreignField: "_id",
        as: "senderdetails",
    },
},
{ $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
{
    $lookup: {
        from: "users",
        localField: "Receiver_userId",
        foreignField: "_id",
        as: "receiverdetails",
    },
},
{ $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
{
    $project: {
        message: 1,
        attachment: 1,
        Sender_userId: 1,
        Receiver_userId: 1,
        admin: 1,
        created_at: 1,
        receiverdetails: {
            name: {
                $switch: {
                    branches: [{
                        case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                        then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                    }],
                    default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                }
            }
        },
        senderdetails: {
            name: {
                $switch: {
                    branches: [{
                        case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                        then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                    }],
                    default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                }
            }
        },
    },
}]).sort({ _id: -1 })
if(response_chat){
    socketEmitChat("p2pchat-" + reqBody.id, response_chat);
}
                // P2PChat.aggregate([{
                //     $match: { _id: new ObjectId(saved._id) }
                // },
                // {
                //     $lookup: {
                //         from: "users",
                //         localField: "Sender_userId",
                //         foreignField: "_id",
                //         as: "senderdetails",
                //     },
                // },
                // { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                // {
                //     $lookup: {
                //         from: "users",
                //         localField: "Receiver_userId",
                //         foreignField: "_id",
                //         as: "receiverdetails",
                //     },
                // },
                // { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                // {
                //     $project: {
                //         message: 1,
                //         attachment: 1,
                //         Sender_userId: 1,
                //         Receiver_userId: 1,
                //         admin: 1,
                //         created_at: 1,
                //         receiverdetails: {
                //             name: {
                //                 $switch: {
                //                     branches: [{
                //                         case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                //                         then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                //                     }],
                //                     default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                //                 }
                //             }
                //         },
                //         senderdetails: {
                //             name: {
                //                 $switch: {
                //                     branches: [{
                //                         case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                //                         then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                //                     }],
                //                     default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                //                 }
                //             }
                //         },
                //     },
                // }]).sort({ _id: -1 }).exec(function (err, response_chat) {
                //     socketEmitChat("p2pchat-" + reqBody.id, response_chat);
                // });
                let userId = await getUserId(req);
                let wallet = await Assets.findOne({ userId: new ObjectId(userId), currencySymbol: crypto_currency }).lean();
                return res.json({ status: true, message: "Trade Cancelled Successfully.", wallet: wallet });
            }
        });
    } catch (err) {
        return res.status(400).json({ status: false, message: "Error occured" });
    }
};

export const saveChatDetails = async (req, res) => {
    try {
        var reqBody = req.body;
        var userid = reqBody.userid;

        if (!userid || userid == undefined) {
            return res.json({ status: false, message: "Please Login to Post a trade" });
        }
        if ((reqBody.msg == "" || reqBody.msg == undefined) && (!req.file || req.file == "undefined")) {
            return res.status(400).json({ status: false, message: "Please Enter Message or attachment" });
        }

        if (!req.file || req.file == "undefined") {
            var attachment = "";
        } else {
            var attachment = req.file.filename;
        }

        var orderbookdata = await P2POrderbook.findOne({ _id: new ObjectId(reqBody.senderid) });

        if (orderbookdata.status == 4) {
            return res.status(400).json({ status: false, message: "Trade already completed" });
        }

        if (orderbookdata.status == 2) {
            return res.status(400).json({ status: false, message: "Trade Already Cancelled" });
        }
        if (orderbookdata.status == 5) {
            return res.status(400).json({ status: false, message: "Time Exceeded So Trade Closed Already" });
        }

        var tradetable = await P2PTradeTable.findOne({ _id: new ObjectId(orderbookdata.trade_id) });
        var Sender_userId = new ObjectId(reqBody.userid);
        var Receiver_userId = new ObjectId(tradetable.userId);
        var message = reqBody.msg;
        var TradeId = orderbookdata.trade_id;
        var orderbookId = orderbookdata._id;

        const chatsave = new P2PChat({
            Sender_userId: Sender_userId,
            Receiver_userId: Receiver_userId,
            message: message,
            TradeId: TradeId,
            orderbookId: orderbookId,
            attachment: attachment,
        });

        chatsave.save().then(async (saved) => {
            if (saved) {
const response_chat = await P2PChat.aggregate([{
    $match: { _id: new ObjectId(saved._id) }
},
{
    $lookup: {
        from: "users",
        localField: "Sender_userId",
        foreignField: "_id",
        as: "senderdetails",
    },
},
{ $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
{
    $lookup: {
        from: "users",
        localField: "Receiver_userId",
        foreignField: "_id",
        as: "receiverdetails",
    },
},
{ $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
{
    $project: {
        message: 1,
        attachment: 1,
        Sender_userId: 1,
        Receiver_userId: 1,
        admin: 1,
        created_at: 1,
        receiverdetails: {
            name: {
                $switch: {
                    branches: [{
                        case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                        then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                    }],
                    default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                }
            }
        },
        senderdetails: {
            name: {
                $switch: {
                    branches: [{
                        case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                        then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                    }],
                    default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                }
            }
        },
    },
}]).sort({ _id: -1 })

if(response_chat){
    socketEmitChat("p2pchat-" + reqBody.senderid, response_chat); 
}
                // P2PChat.aggregate([{
                //     $match: { _id: new ObjectId(saved._id) }
                // },
                // {
                //     $lookup: {
                //         from: "users",
                //         localField: "Sender_userId",
                //         foreignField: "_id",
                //         as: "senderdetails",
                //     },
                // },
                // { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                // {
                //     $lookup: {
                //         from: "users",
                //         localField: "Receiver_userId",
                //         foreignField: "_id",
                //         as: "receiverdetails",
                //     },
                // },
                // { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                // {
                //     $project: {
                //         message: 1,
                //         attachment: 1,
                //         Sender_userId: 1,
                //         Receiver_userId: 1,
                //         admin: 1,
                //         created_at: 1,
                //         receiverdetails: {
                //             name: {
                //                 $switch: {
                //                     branches: [{
                //                         case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                //                         then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                //                     }],
                //                     default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                //                 }
                //             }
                //         },
                //         senderdetails: {
                //             name: {
                //                 $switch: {
                //                     branches: [{
                //                         case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                //                         then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                //                     }],
                //                     default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                //                 }
                //             }
                //         },
                //     },
                // }]).sort({ _id: -1 }).exec(function (err, response_chat) {
                //     socketEmitChat("p2pchat-" + reqBody.senderid, response_chat);
                // });

                return res.json({ status: true, message: "Message Sent Successfully" });
            }
        });
    } catch (err) {
        return res.status(400).json({ status: false, message: "Error occured" });
    }
};

/**
 * Post chat history
 * METHOD: POST
 * URL : /api/getChatDetails
 */
export const getChatDetails = async (req, res) => {
    try {
        var reqBody = req.body;
        var orderbookdata = await P2POrderbook.findOne({ _id: new ObjectId(reqBody.orderId) });
        const response = await P2PChat.aggregate([{
            $match: { orderbookId: new ObjectId(orderbookdata._id) }
        },
        {
            $lookup: {
                from: "users",
                localField: "Sender_userId",
                foreignField: "_id",
                as: "senderdetails",
            },
        },
        { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "users",
                localField: "Receiver_userId",
                foreignField: "_id",
                as: "receiverdetails",
            },
        },
        { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                message: 1,
                attachment: 1,
                Sender_userId: 1,
                Receiver_userId: 1,
                admin: 1,
                created_at: 1,
                receiverdetails: {
                    name: {
                        $switch: {
                            branches: [{
                                case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
                                then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
                            }],
                            default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
                        }
                    }
                },
                senderdetails: {
                    name: {
                        $switch: {
                            branches: [{
                                case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
                                then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
                            }],
                            default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
                        }
                    }
                },
            },
        },
        {
            $sort: { _id: -1 },
        }])
        if(response){
            res.json({ status: true, result: response });
        }
        // P2PChat.aggregate([{
        //     $match: { orderbookId: new ObjectId(orderbookdata._id) }
        // },
        // {
        //     $lookup: {
        //         from: "users",
        //         localField: "Sender_userId",
        //         foreignField: "_id",
        //         as: "senderdetails",
        //     },
        // },
        // { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
        // {
        //     $lookup: {
        //         from: "users",
        //         localField: "Receiver_userId",
        //         foreignField: "_id",
        //         as: "receiverdetails",
        //     },
        // },
        // { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
        // {
        //     $project: {
        //         message: 1,
        //         attachment: 1,
        //         Sender_userId: 1,
        //         Receiver_userId: 1,
        //         admin: 1,
        //         created_at: 1,
        //         receiverdetails: {
        //             name: {
        //                 $switch: {
        //                     branches: [{
        //                         case: { $or: [{ "$ne": ["$receiverdetails.firstName", ""] }, { "$ne": ["$receiverdetails.lastName", ""] }] },
        //                         then: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] }
        //                     }],
        //                     default: { $arrayElemAt: [{ $split: ["$receiverdetails.email", "@"] }, 0] }
        //                 }
        //             }
        //         },
        //         senderdetails: {
        //             name: {
        //                 $switch: {
        //                     branches: [{
        //                         case: { $or: [{ "$ne": ["$senderdetails.firstName", ""] }, { "$ne": ["$senderdetails.lastName", ""] }] },
        //                         then: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] }
        //                     }],
        //                     default: { $arrayElemAt: [{ $split: ["$senderdetails.email", "@"] }, 0] }
        //                 }
        //             }
        //         },
        //     },
        // },
        // {
        //     $sort: { _id: -1 },
        // }]).exec(function (err, response) {
        //     res.json({ status: true, result: response });
        // });
    } catch (err) {
        return res.status(400).json({ status: false, message: "Error occured" });
    }
};

/**
 * Post Single Order details
 * METHOD: POST
 * URL : /api/getSingleOrderDetails
 */
export const getSingleOrderDetails = async (req, res) => {
    try {
        var reqBody = req.body;
        reqBody = req.body;
        var orderbookdata = await P2POrderbook.findOne({ _id: new ObjectId(reqBody.orderId) });
        var tradetable = await P2PTradeTable.findOne({ _id: new ObjectId(orderbookdata.trade_id) });
        const response = await P2POrderbook.aggregate([{
            $match: { _id: new ObjectId(reqBody.orderId) }
        },
        {
            $lookup: {
                from: "P2PTradeTable",
                localField: "trade_id",
                foreignField: "_id",
                as: "tradedata",
            },
        },
        { $unwind: "$tradedata" },
        {
            $lookup: {
                from: "users",
                localField: "from_userId",
                foreignField: "_id",
                as: "sellerdetails",
            },
        },
        { $unwind: "$sellerdetails" },
        {
            $lookup: {
                from: "users",
                localField: "to_userId",
                foreignField: "_id",
                as: "buyerdetails",
            },
        },
        { $unwind: "$buyerdetails" },
        {
            $project: {
                start_time: 1,
                end_time: 1,
                from_userId: 1,
                to_userId: 1,
                _id: 1,
                status: 1,
                BuyorSell: 1,
                crypto_amount: 1,
                fiat_amount: 1,
                price: 1,
                firstCurrency: 1,
                secondCurrency: 1,
                tradedata: {
                    userId: 1,
                    BuyorSell: 1
                },
                buyerdetails: {
                    _id: 1,
                    username: 1,
                },
                sellerdetails: {
                    _id: 1,
                    username: 1,
                },
            },
        }])
        if (response) {
            res.json({ status: true, result: response });
        }
        // P2POrderbook.aggregate([{
        //     $match: { _id: new ObjectId(reqBody.orderId) }
        // },
        // {
        //     $lookup: {
        //         from: "P2PTradeTable",
        //         localField: "trade_id",
        //         foreignField: "_id",
        //         as: "tradedata",
        //     },
        // },
        // { $unwind: "$tradedata" },
        // {
        //     $lookup: {
        //         from: "users",
        //         localField: "from_userId",
        //         foreignField: "_id",
        //         as: "sellerdetails",
        //     },
        // },
        // { $unwind: "$sellerdetails" },
        // {
        //     $lookup: {
        //         from: "users",
        //         localField: "to_userId",
        //         foreignField: "_id",
        //         as: "buyerdetails",
        //     },
        // },
        // { $unwind: "$buyerdetails" },
        // {
        //     $project: {
        //         start_time: 1,
        //         end_time: 1,
        //         from_userId: 1,
        //         to_userId: 1,
        //         _id: 1,
        //         status: 1,
        //         BuyorSell: 1,
        //         crypto_amount: 1,
        //         fiat_amount: 1,
        //         price: 1,
        //         firstCurrency: 1,
        //         secondCurrency: 1,
        //         tradedata: {
        //             userId: 1,
        //             BuyorSell: 1
        //         },
        //         buyerdetails: {
        //             _id: 1,
        //             username: 1,
        //         },
        //         sellerdetails: {
        //             _id: 1,
        //             username: 1,
        //         },
        //     },
        // }]).exec(function (err, response) {
        //     if (response) {
        //         res.json({ status: true, result: response });
        //     }
        // });
    } catch (err) {
        return res.status(400).json({ status: false, message: "Error occured" });
    }
};

/**
 * Post Confirm BUY add
 * METHOD: POST
 * URL : /api/confirmP2PTrade
 */
export const confirmP2PTrade = async (req, res) => {
    /* 
        BuyorSell: "Sell"
        crypto_amount: 5.8
        fiat_amount: "1450"
        userid: "621876bad28a9a131cbed3be"
        _id: "62188157191e1418112bd4f9"
     */

    try {
        var reqBody = req.body;
        var Tradedata = await P2PTradeTable.findOne({ _id: new ObjectId(reqBody._id) });

        if (Tradedata) {
            try {
                if (Tradedata.status == 3 || Tradedata.status == 5) {
                    return res.status(400).json({ status: false, message: "Sorry Trade Closed" });
                }

                var afterBalance = Number(Tradedata.afterBalance) + Number(reqBody.crypto_amount);
                if (Number(parseFloat(afterBalance).toFixed(8)) > Number(parseFloat(Tradedata.beforeBalance).toFixed(8))) {
                    return res.status(400).json({ status: false, message: "currently There is no Limit, try some time" });
                }

                if (Tradedata.afterBalance == Tradedata.beforeBalance) {
                    return res.status(400).json({ status: false, message: "Sorry Trade Closed" });
                }

                var crypto_currency = Tradedata.firstCurrency;
                var crypto_amount = reqBody.crypto_amount;
                var fee_amount = crypto_amount * (Tradedata.fee_percentage / 100);
                var crypto_amount_new = crypto_amount + fee_amount;

                if (Tradedata.BuyorSell == "Sell") {
                    var from_user_id = Tradedata.userId;
                    var to_user_id = reqBody.userid;
                }

                // check current login seller balance
                if (Tradedata.BuyorSell == "Buy") {
                    var assets = await Assets.findOne({ userId: new ObjectId(reqBody.userid), currencySymbol: crypto_currency });
                    var current_cryptobalance = assets.p2pWallet;
                    if (crypto_amount_new > current_cryptobalance) {
                        return res.status(400).json({ status: false, message: "Insufficient " + crypto_currency + " Balance for this Trade" });
                    }

                    var from_user_id = reqBody.userid;
                    var to_user_id = Tradedata.userId;
                }

                var currentDate = new Date();
                // add 30 mins duration
                var end_time = currentDate.setTime(currentDate.getTime() + 5 * 60 * 1000);

                const Orderbook = new P2POrderbook({
                    from_userId: new ObjectId(from_user_id),
                    to_userId: new ObjectId(to_user_id),
                    trade_id: new ObjectId(Tradedata._id),
                    firstCurrency: Tradedata.firstCurrency,
                    secondCurrency: Tradedata.secondCurrency,
                    fiat_amount: reqBody.fiat_amount,
                    crypto_amount: reqBody.crypto_amount,
                    trade_fee_percentage: Tradedata.fee_percentage,
                    trade_fee: fee_amount,
                    BuyorSell: reqBody.BuyorSell,
                    price: Tradedata.price,
                    status: 0, // 0-Open order
                    dispute_status: 0, // 0- No Dispute 1- yes dispute
                    created_date: new Date(),
                    updated_date: new Date(),
                    start_time: new Date(),
                    end_time: end_time,
                });

                Orderbook.save().then(async (saved) => {
                    if (saved) {
                        // Update trade balance
                        var fee_amount = reqBody.crypto_amount * (Tradedata.fee_percentage / 100);
                        var afterBalance = Number(Tradedata.afterBalance) + Number(reqBody.crypto_amount) + fee_amount;

                        // Trade Limit condition
                        var minlimit = Tradedata.minlimit;
                        var maxlimit = Tradedata.maxlimit;
                        var currentmaxlimit = maxlimit - reqBody.fiat_amount;
                        if (currentmaxlimit == 0) {
                            var status = 5;
                        } else {
                            var status = 2;
                        }
                        if (minlimit > currentmaxlimit) {
                            var currentminlimit = currentmaxlimit;
                        } else {
                            var currentminlimit = minlimit;
                        }
                        //  End Limit
                        var quantity = Tradedata.quantity - reqBody.crypto_amount;
                        await P2PTradeTable.findOneAndUpdate({ _id: new ObjectId(Tradedata._id) }, {
                            $set: {
                                afterBalance: parseFloat(afterBalance).toFixed(8),
                                minlimit: currentminlimit,
                                maxlimit: currentmaxlimit,
                                status: status,
                                quantity: quantity,
                            },
                        });

                        // Crypto Balance Update for current logged in seller
                        var crypto_currency = Tradedata.firstCurrency;
                        if (Tradedata.BuyorSell == "Buy") {
                            const assets = await Assets.findOne({ userId: new ObjectId(reqBody.userid), currencySymbol: crypto_currency });
                            var current_cryptobalance = assets.p2pWallet;
                            var crypto_amount = reqBody.crypto_amount;
                            var fee_amount = crypto_amount * (Tradedata.fee_percentage / 100);
                            var deduction_amount = crypto_amount + fee_amount;
                            var new_cryptobalance = current_cryptobalance - deduction_amount;
                            var holdingbalance = assets.p2pholdingbalance + deduction_amount;

                            await Assets.findByIdAndUpdate(assets._id, {
                                p2pholdingbalance: holdingbalance,
                                p2pWallet: new_cryptobalance,
                            });
                        }

                        // let newNotification = new Notification({
                        //     description: "New trade request initiated",
                        //     userId: Tradedata.userId,
                        //     uri: "p2pchat",
                        //     new ObjectId: saved._id,
                        // });
                        // await newNotification.save();
                        // socketEmitOne('notification', {}, Tradedata.userId);

                        let wallet = await Assets.findOne({ userId: new ObjectId(reqBody.userid), currencySymbol: crypto_currency }).lean();

                        return res.status(200).json({ status: true, result: saved._id, wallet: wallet, message: "Order Placed Successfully" });
                    }
                });
            } catch (err) {
                return res.status(400).json({ status: false, message: "Error occured" });
            }
        }
    } catch (err) {
        return res.status(400).json({ status: false, message: "Error occured" });
    }
};

export const p2presolveSeller = async (req, res) => {
    try {
        var reqBody = req.body;
        var id = reqBody._id;

        var disputedata = await P2PDispute.findOne({ orderbookId: id });
        if (disputedata) {
            var update = { status: 1 };
            await P2PDispute.findOneAndUpdate({ _id: disputedata._id }, { $set: update });
        }
        var orderbookdata = await P2POrderbook.findOne({ _id: disputedata.orderbookId }).populate("from_userId", "_id firstName lastName");
        var userId = orderbookdata.from_userId._id;
        var tradetable = await P2PTradeTable.findOne({ _id: disputedata.TradeId });
        var assetdata = await Assets.findOne({ userId: userId, currencySymbol: orderbookdata.firstCurrency });
        if (assetdata) {
            var main_balance = assetdata.p2pWallet;
            var crypto_amount = orderbookdata.crypto_amount;
            var trade_fee = orderbookdata.trade_fee;
            var refund_amount = crypto_amount + trade_fee;

            if (tradetable.BuyorSell == 'Buy') {
                var current_cryptobalance = assetdata.p2pWallet;
                var new_cryptobalance = current_cryptobalance + refund_amount;
                var holdingbalance = assetdata.p2pholdingbalance - refund_amount;
                await Assets.findOneAndUpdate({ _id: assetdata._id }, {
                    $set: {
                        p2pholdingbalance: holdingbalance,
                        p2pWallet: new_cryptobalance
                    }
                });
            }

            // Trade Limit condition
            var afterBalance = Number(tradetable.afterBalance) - refund_amount;
            // Trade Limit condition
            var quantity = tradetable.quantity + orderbookdata.crypto_amount;
            var minlimit_initial = tradetable.minlimit_initial;
            var minlimit = tradetable.minlimit;
            var maxlimit = tradetable.maxlimit;
            var currentmaxlimit = maxlimit + orderbookdata.fiat_amount;
            if (currentmaxlimit > minlimit_initial) {
                var currentminlimit = minlimit_initial;
            } else {
                var currentminlimit = currentmaxlimit;
            }
            var status = 0;
            var minlimit_update = await P2PTradeTable.findOneAndUpdate({ _id: tradetable._id }, {
                $set: {
                    afterBalance: afterBalance,
                    maxlimit: currentmaxlimit,
                    minlimit: currentminlimit,
                    status: status,
                    quantity: quantity,
                }
            });

            if (minlimit_update) {
                var orderbook_update = await P2POrderbook.findOneAndUpdate({ _id: orderbookdata._id }, {
                    $set: {
                        status: 4
                    }
                });

                if (orderbook_update) {

                    let message = `Dispute resolved to seller.`;
                    let chatsave = new P2PChat({
                        admin: 1,
                        message: message,
                        TradeId: orderbookdata.trade_id,
                        orderbookId: orderbookdata._id,
                    });
                    await chatsave.save();

                    let description = "Dispute Resolved Successfully for Your Side.";
                    // let newNotification = new Notification({
                    //     description: description,
                    //     userId: userId,
                    //     uri: "p2pchat",
                    //     new ObjectId: orderbookdata._id,
                    // });
                    // newNotification.save();
                    // socketEmitOne('notification', {}, userId);

                    let description1 = "Dispute Resolved Successfully for Seller Side.";
                    // let newNotification1 = new Notification({
                    //     description: description1,
                    //     userId: orderbookdata.to_userId,
                    //     uri: "p2pchat",
                    //     new ObjectId: orderbookdata._id,
                    // });
                    // newNotification1.save();
                    socketEmitOne('notification', {}, orderbookdata.to_userId);
const response_chat = await P2PChat.aggregate([{
    $match: { _id: chatsave._id }
},
{
    $lookup: {
        from: "users",
        localField: "Sender_userId",
        foreignField: "_id",
        as: "senderdetails",
    },
},
{ $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
{
    $lookup: {
        from: "users",
        localField: "Receiver_userId",
        foreignField: "_id",
        as: "receiverdetails",
    },
},
{ $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
{
    $project: {
        message: 1,
        attachment: 1,
        Sender_userId: 1,
        Receiver_userId: 1,
        admin: 1,
        created_at: 1,
        receiverdetails: {
            _id: 1,
            name: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] },
        },
        senderdetails: {
            _id: 1,
            name: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] },
        },
    },
}]).sort({ _id: -1 })

if(response_chat){
    socketEmitChat("p2pchat-" + orderbookdata._id, response_chat);
}
                    // P2PChat.aggregate([{
                    //     $match: { _id: chatsave._id }
                    // },
                    // {
                    //     $lookup: {
                    //         from: "users",
                    //         localField: "Sender_userId",
                    //         foreignField: "_id",
                    //         as: "senderdetails",
                    //     },
                    // },
                    // { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                    // {
                    //     $lookup: {
                    //         from: "users",
                    //         localField: "Receiver_userId",
                    //         foreignField: "_id",
                    //         as: "receiverdetails",
                    //     },
                    // },
                    // { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                    // {
                    //     $project: {
                    //         message: 1,
                    //         attachment: 1,
                    //         Sender_userId: 1,
                    //         Receiver_userId: 1,
                    //         admin: 1,
                    //         created_at: 1,
                    //         receiverdetails: {
                    //             _id: 1,
                    //             name: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] },
                    //         },
                    //         senderdetails: {
                    //             _id: 1,
                    //             name: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] },
                    //         },
                    //     },
                    // }]).sort({ _id: -1 }).exec(function (err, response_chat) {
                    //     socketEmitChat("p2pchat-" + orderbookdata._id, response_chat);
                    // });

                    return res.status(200).json({ status: true, message: "Dispute Resolved for Seller Successfully." });
                }
            } else {
                return res.status(400).json({ status: false, message: "Min-Max limit Not Updated." });
            }
        } else {
            return res.status(400).json({ status: false, message: "Seller Data Not Found." });
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: "Something went wrong" });
    }
};

export const p2presolveBuyer = async (req, res) => {
    try {
        var reqBody = req.body;
        var id = reqBody._id;
        var disputedata = await P2PDispute.findOne({ orderbookId: id });

        if (disputedata) {
            var update = { status: 1 };
            await P2PDispute.findOneAndUpdate({ _id: disputedata._id }, { $set: update });
        }

        var orderbookdata = await P2POrderbook.findOne({ _id: disputedata.orderbookId }).populate("from_userId", "_id email").populate("to_userId", "_id firstName lastName");
        var userId = orderbookdata.to_userId._id; //buy
        var assetdata = await Assets.findOne({ userId: userId, currencySymbol: orderbookdata.firstCurrency });
        var main_balance = assetdata.p2pWallet;
        var crypto_amount = orderbookdata.crypto_amount;
        var new_mainbalance = main_balance + crypto_amount;

        var update_balance = await Assets.findOneAndUpdate({ _id: assetdata._id }, { $set: { p2pWallet: new_mainbalance } });

        if (update_balance) {
            var holding_balance = orderbookdata.crypto_amount + orderbookdata.trade_fee;
            var deduct_holdingbalance_seller = Assets.findOneAndUpdate({ userId: orderbookdata.from_userId._id, currencySymbol: orderbookdata.firstCurrency }, { $inc: { holdingbalance: -holding_balance } }, { new: true });
            if (deduct_holdingbalance_seller) {
                var dispute_status = await P2POrderbook.findByIdAndUpdate({ _id: orderbookdata._id }, { $set: { status: 4, dispute_status: 1 } });

                var tradetable = await P2PTradeTable.findOne({ _id: orderbookdata.trade_id });
                if (tradetable.maxlimit == 0) {
                    await P2PTradeTable.findByIdAndUpdate({ _id: orderbookdata.trade_id }, { $set: { status: 1 } });
                } else {
                    await P2PTradeTable.findByIdAndUpdate({ _id: orderbookdata.trade_id }, { $set: { status: 0 } });
                }

                if (dispute_status) {

                    let message = `Dispute resolved to buyer.`;
                    let chatsave = new P2PChat({
                        admin: 1,
                        message: message,
                        TradeId: orderbookdata.trade_id,
                        orderbookId: orderbookdata._id,
                    });
                    await chatsave.save();

                    // save admin revenue
                    await new AdminRevenue({
                        fee: orderbookdata.trade_fee,
                        email: orderbookdata.from_userId.email,
                        amount: orderbookdata.crypto_amount,
                        order_id: orderbookdata._id,
                        trade_id: orderbookdata.trade_id,
                        currency: orderbookdata.firstCurrency,
                        currency_type: "Crypto",
                        type: "P2p",
                    }).save();


                    let description = "Dispute Resolved Successfully for Your Side.";
                    // let newNotification = new Notification({
                    //     description: description,
                    //     userId: userId,
                    //     uri: "p2pchat",
                    //     new ObjectId: orderbookdata._id,
                    // });
                    // newNotification.save();
                    // socketEmitOne('notification', {}, userId);

                    let description1 = "Dispute Resolved Successfully for Buyer Side.";
                    // let newNotification1 = new Notification({
                    //     description: description1,
                    //     userId: orderbookdata.from_userId._id,
                    //     uri: "p2pchat",
                    //     new ObjectId: orderbookdata._id,
                    // });
                    // newNotification1.save();
                    socketEmitOne('notification', {}, orderbookdata.from_userId._id);
                    const response_chat = await P2PChat.aggregate([{
                        $match: { _id: chatsave._id }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "Sender_userId",
                            foreignField: "_id",
                            as: "senderdetails",
                        },
                    },
                    { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "Receiver_userId",
                            foreignField: "_id",
                            as: "receiverdetails",
                        },
                    },
                    { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            message: 1,
                            attachment: 1,
                            Sender_userId: 1,
                            Receiver_userId: 1,
                            admin: 1,
                            created_at: 1,
                            receiverdetails: {
                                _id: 1,
                                name: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] },
                            },
                            senderdetails: {
                                _id: 1,
                                name: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] },
                            },
                        },
                    }]).sort({ _id: -1 })
                    if(response_chat){
                        socketEmitChat("p2pchat-" + orderbookdata._id, response_chat);
                    }
                    // P2PChat.aggregate([{
                    //     $match: { _id: chatsave._id }
                    // },
                    // {
                    //     $lookup: {
                    //         from: "users",
                    //         localField: "Sender_userId",
                    //         foreignField: "_id",
                    //         as: "senderdetails",
                    //     },
                    // },
                    // { $unwind: { path: "$senderdetails", preserveNullAndEmptyArrays: true } },
                    // {
                    //     $lookup: {
                    //         from: "users",
                    //         localField: "Receiver_userId",
                    //         foreignField: "_id",
                    //         as: "receiverdetails",
                    //     },
                    // },
                    // { $unwind: { path: "$receiverdetails", preserveNullAndEmptyArrays: true } },
                    // {
                    //     $project: {
                    //         message: 1,
                    //         attachment: 1,
                    //         Sender_userId: 1,
                    //         Receiver_userId: 1,
                    //         admin: 1,
                    //         created_at: 1,
                    //         receiverdetails: {
                    //             _id: 1,
                    //             name: { $concat: ["$receiverdetails.firstName", " ", "$receiverdetails.lastName"] },
                    //         },
                    //         senderdetails: {
                    //             _id: 1,
                    //             name: { $concat: ["$senderdetails.firstName", " ", "$senderdetails.lastName"] },
                    //         },
                    //     },
                    // }]).sort({ _id: -1 }).exec(function (err, response_chat) {
                    //     socketEmitChat("p2pchat-" + orderbookdata._id, response_chat);
                    // });

                    return res.status(200).json({ status: true, message: "Dispute Resolved for Buyer Successfully." });
                } else {
                    return res.status(400).json({ status: false, message: "Dispute Status Not Updated" });
                }
            } else {
                return res.status(400).json({ status: false, message: "Holding Balance Not Updated" });
            }
        } else {
            return res.status(400).json({ status: false, message: "Buyer Asset Not Updated" });
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: "Something went wrong" });
    }
};