// import package
import mongoose from 'mongoose';
import config from '../config/index'
// import modal
import {
    User,
    UserKyc,
    ContactUs,
    SupportTicket,
    Transaction,
    Notification,
    SiteSetting,
    Wallet,
    SpotTrade
} from '../models';

import {paginationQuery} from '../lib/adminHelpers'
// const new ObjectId = mongoose.Types.new ObjectId;
const { ObjectId } = require('mongoose').Types;


/** 
 * Get Recent Transaction
 * URL : /api/recentTransaction
 * METHOD : GET
*/
export const getRecentTransaction = (req, res) => {
    Transaction.find({
        "userId": req.user.userId
    }, {
        "createdAt": 1,
        "paymentType": 1,
        "coin": 1,
        "actualAmount": 1,
        "amount": 1,
        'txid': 1,
        "status": 1
    }).sort({ "createdAt": -1 }).limit(5).exec((err, data) => {
        if (err) { return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" }) }
        return res.status(200).json({ "success": true, 'result': data })
    })
}

/** 
 * Get Login History
 * URL : /api/loginHistory
 * METHOD : GET
*/
export const getLoginHistory = async (req, res) => {
    try{
   const data = await User.aggregate([
        { "$match": { '_id': new ObjectId(req.user.id) } },
        { "$unwind": "$loginhistory" },
        { "$sort": { "loginhistory.createdDate": -1 } },
        { "$limit": 5 },
        {
            "$project": {
                "createdDate": "$loginhistory.createdDate",
                "ipaddress": "$loginhistory.ipaddress",
                "regionName": "$loginhistory.regionName",
                "countryName": "$loginhistory.countryName",
                "broswername": "$loginhistory.broswername",
                "os": "$loginhistory.os",
                "status": "$loginhistory.status"
            }
        }
    ])
        if (err) {
            return res.status(200).json({ "success": true, 'result': data })
        }else{
            return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" }) 
        }
    }catch(err){
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" }) 
    }
    
}

/**
 * Get User Trade History
 * URL : /api/spot/tradeHistory/{{pairId}}
 * METHOD : GET
 * Query : page, limit
 */
 export const gettradehistory_dash = async (req, res) => {
    try {


      let pagination = paginationQuery(req.query);
      const count = await SpotTrade.aggregate([
        {
          $match: {
            userId: new ObjectId(req.user.id),
            status: {
              $in: ["pending", "completed", "cancel"],
            },
          },
        },
      ]);
  
      let data = await SpotTrade.aggregate([
        {
          $match: {
            userId: new ObjectId(req.user.id),
            status: {
              $in: ["pending", "completed", "cancel"],
            },
          },
        },
        { $unwind: "$filled" },
        { $sort: { createdAt: -1 } },
  
        {
          $project: {
            createdAt: 1,
            firstCurrency: 1,
            secondCurrency: 1,
            orderType:1,
            quantity:1,
            buyorsell: 1,
            price: "$filled.price",
            filledQuantity: "$filled.filledQuantity",
            Fees: "$filled.Fees",
            orderValue: "$filled.orderValue",
          },
        },
        { $skip: pagination.skip },
        { $limit: pagination.limit },
      ]);
  
      let reportData = await SpotTrade.aggregate([
        {
          $match: {
            userId: new ObjectId(req.user.id),
            status: {
              $in: ["pending", "completed", "cancel"],
            },
          },
        },
        { $unwind: "$filled" },
        { $sort: { createdAt: -1 } },
  
        {
          $project: {
            createdAt: 1,
            firstCurrency: 1,
            secondCurrency: 1,
            buyorsell: 1,
            orderType:1,
            price: "$filled.price",
            filledQuantity: "$filled.filledQuantity",
            Fees: "$filled.Fees",
            orderValue: "$filled.orderValue",
          },
        },
      ]);

      console.log("ordertypeeeeeeeeeeeeeeeeeeeeeee",)
      return res
        .status(200)
        .json({ success: true, result: data, count: count.length, reportData });
    } catch (err) {
        console.log("errrrrrrrrrrrrrrr",err)
      return res.status(500).json({ success: false });
    }
  };
/** 
 * Get Notification History
 * URL : /api/notificationHistory
 * METHOD : GET
*/
export const getNotificationHistory = (req, res) => {
    Notification.find({
        "userId": req.user.id
    }).sort({ "createdAt": -1 }).limit(5).exec((err, data) => {
        if (err) { return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" }) }
        return res.status(200).json({ "success": true, 'result': data })
    })
}

/** 
 * Get Dashboard Balance Detail
 * URL : /api/getDashBal
 * METHOD : GET
*/
export const getDashBal = async (req, res) => {
    try {
        const siteSetting = await SiteSetting.findOne({}, { "userDashboard": 1 });
        if (siteSetting) {
            let currencyId = siteSetting.userDashboard.map(item => item.currencyId)
            console.log("currencyId-siteSetting",currencyId)
            if (currencyId && currencyId.length > 0) {
                let userAsset = await Wallet.aggregate([
                    {
                        "$match": {
                            "_id": new ObjectId(req.user.id),
                        }
                    },
                    { "$unwind": "$assets" },
                    {
                        "$match": {
                            "assets._id": { "$in": currencyId },
                        }
                    },
                    {
                        "$project": {
                            '_id': 0,
                            'currency': '$assets._id',
                            'coin': '$assets.coin',
                            'derivativeBal': '$assets.derivativeBal',
                            'spotBal': '$assets.spotBal',
                            'p2pBal': '$assets.p2pBal'
                        }
                    }
                ]
                )
                if (userAsset && userAsset.length > 0) {
                    let result = []
                    userAsset.map(item => {
                        let findData = siteSetting.userDashboard.find(el => el.currencyId == item.currency.toString())
                        if (findData) {
                            result.push({
                                ...item,
                                ...{
                                    'colorCode': findData.colorCode
                                }
                            })
                        }
                    })
                    return res.status(200).json({ 'success': true, 'message': "Fetch success", result })
                }
            }
            return res.status(400).json({ 'success': false, 'message': "no record" })
        }
    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}



export const totalCount = async (req, res) => {
    try {
        let userCount = await User.countDocuments({ status: "verified" })
        let kycCount = await UserKyc.countDocuments({
                "$or": [{
                    "idProof.status": {$in:["pending"]},
                }, {
                    "addressProof.status": {$in:["pending"]},
                },
                
                ]
        })
        let contactCount = await ContactUs.countDocuments({ softDelete: false })
        let supportCount = await SupportTicket.countDocuments({})
        let transCount = await Transaction.countDocuments({ paymentType: "coin_withdraw", status: "pending"})
        let depositCount =await Transaction.countDocuments({ paymentType: "fiat_deposit", status: "pending"})
        let totalCount = {
            userCount : userCount,
            kycCount : kycCount,
            contactCount : contactCount,
            supportCount : supportCount,
            transCount : transCount,
            depositCount:depositCount
        }
        return res.status(200).json({ status: 'success', totalCount })
    } catch (err) {
        return res.status(200).json({ status: 'success', totalCount :{
            userCount : 0,
            kycCount : 0,
            contactCount : 0,
            supportCount : 0,
            transCount : 0,
            depositCount:0
        }
    })
    }
}

export const getHistory = async (req, res) => {

    try {

        let orderHistory = await SpotTrade.aggregate([


            { "$sort": { '_id': -1 } },

            {
                "$project": {
                    "orderDate": {
                        "$dateToString": {
                            "date": '$orderDate',
                            "format": "%Y-%m-%d %H:%M"
                        }
                    },
                    "firstCurrency": 1,
                    "secondCurrency": 1,
                    "orderType": 1,
                    "buyorsell": 1,
                    "averagePrice": {
                        "$reduce": {
                            'input': "$filled",
                            'initialValue': 0,
                            'in': {
                                "$avg": { "$add": ["$$value", "$$this.price"] }
                            }
                        }
                    },
                    "price": 1,
                    "filledQuantity": 1,
                    "quantity": 1,
                    "orderValue": 1,
                    "conditionalType": 1,
                    "status": 1,
                }
            },
            { "$limit": 5 },
        ])

        let trdeHistory = await SpotTrade.aggregate([
            { "$unwind": "$filled" },
            { "$sort": { "createdAt": -1 } },
            {
                "$project": {
                    "firstCurrency": 1,
                    "secondCurrency": 1,
                    "buyorsell": 1,
                    "price": "$filled.price",
                    "filledQuantity": "$filled.filledQuantity",
                    "orderValue": "$filled.orderValue",
                    "Fees": "$filled.Fees",
                    "createdAt": {
                        "$dateToString": {
                            "date": '$filled.createdAt',
                            "format": "%Y-%m-%d %H:%M"
                        }
                    },
                }
            },
            { "$limit": 5 },


        ])

        let depositHistory = await Transaction.aggregate([
            {
                "$match": {
                    "paymentType": { "$in": ["coin_deposit", "fiat_deposit"] },
                }
            },
            { "$sort": { "createdAt": -1 } },

            {
                "$lookup": {
                    "from": 'user',
                    "localField": "userId",
                    "foreignField": "userId",
                    "as": "userInfo"
                }
            },
            { "$unwind": "$userInfo" },
            {
                "$project": {
                    "email": "$userInfo.email",
                    "currencySymbol": 1,
                    "userAssetId": 1,
                    "image": {
                        '$concat': [config.SERVER_URL, config.IMAGE.DEPOSIT_URL_PATH, "$image"]
                    },
                    "actualAmount": 1,
                    "amount": 1,
                    "txid": 1,
                    "toaddress": 1,
                    "status": 1,
                    "paymentType": 1,
                    "createdAt": {
                        "$dateToString": {
                            "date": '$createdAt',
                            "format": "%Y-%m-%d %H:%M"
                        }
                    }
                }
            },

            { "$limit": 5 },
        ])

        let withdrawHistory = await Transaction.aggregate([
            {
                "$match": {
                    "paymentType": { "$in": ["coin_withdraw", "fiat_withdraw"] },
                }
            },
            { "$sort": { "createdAt": -1 } },
            {
                "$lookup": {
                    "from": 'user',
                    "localField": "userId",
                    "foreignField": "userId",
                    "as": "userInfo"
                }
            },
            { "$unwind": "$userInfo" },
            {
                "$project": {
                    "email": "$userInfo.email",
                    "currencySymbol": 1,
                    "amount": 1,
                    "actualAmount": 1,
                    "commissionFee": 1,
                    "bankDetail": 1,
                    "txid": 1,
                    "toaddress": 1,
                    "status": 1,
                    "paymentType": 1,
                    "createdAt": {
                        "$dateToString": {
                            "date": '$createdAt',
                            "format": "%Y-%m-%d %H:%M"
                        }
                    }
                }
            },

            { "$limit": 5 },
        ])

        const result = {
            orderHistory: orderHistory,
            trdeHistory: trdeHistory,
            depositHistory: depositHistory,
            withdrawHistory: withdrawHistory
        }

        return res.status(200).json({ status: 'success', result })
    } catch (err) {
    }

}
