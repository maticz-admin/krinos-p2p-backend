import axios from "axios";
const fs = require("fs");
import { Cms, Currency, Faq, Notification, SiteSetting, Transaction, User, UserKyc, Wallet } from "../../models";
import isEmpty from '../../lib/isEmpty'
import OfferTag from "../../models/OfferTags";
import p2pcreateOrder from "../../models/P2p-createorders";
import Orderchat from "../../models/Chat_schema";
import { Mongoose } from "mongoose";
import wallet from "../../models/wallet";
import { socketEmit, socketEmitofferrequest, socketEmitOne } from "../../config/socketIO";
import Tradehistory from "../../models/tradehistory";
import { newNotification } from "../notification.controller";
import PaymentTypes from "../../models/paymenttype";
import config from "../../config/index";
import multer from 'multer';
import path, { parse } from 'path';
import imageFilter from '../../lib/imageFilter';
import MessageNotification from "../../models/messagenotification";
import { Bnbtrasfer, Estimategas, transferToAddress, UseERC20 } from "./token.controller";
import { decryptString } from "../../lib/cryptoJS";
import { createPassBook } from "../passbook.controller";
import { mailTemplateLang } from "../emailTemplate.controller";
import OwnerWallet from "../../models/ownerwallet";
import { decodedata, encodedata } from "../../lib/cryptoJS"

export const CreateP2Porder = async (req, res) => {
    try {
        console.log('req?.bodyreq?.body-----', req?.body);
        var count = await p2pcreateOrder.find({});
        var createdata = req?.body?.createdata;
        createdata.orderid = "P2PORDER-" + count?.length
        var data = new p2pcreateOrder(createdata);
        await data.save().then(async (data) => {
            var checkUser = await User.findOne({ userId: data?.createrid })
            let doc = {
                'userId': checkUser._id,
                'title': 'Trade_Request',
                'description': 'You received one trade request',
            }
            await newNotification(doc)

            var marketvalue = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${data?.coin}&tsyms=${data?.preferedcurrency}`);
            var resmarketvalue = marketvalue?.data[data?.preferedcurrency];

            var convertedvalue = (resmarketvalue / 100) * parseFloat(data?.offermargin);
            var currencyvalue = (data?.fixedmarketrate != "0") ? data?.fixedmarketrate : parseFloat(resmarketvalue) + parseFloat(convertedvalue);
            var receive = 0;
            if (data?.ordertype == "Sell") {

                receive = ((1 / currencyvalue) * parseFloat(data?.max)).toFixed(8);

            }
            if (data?.ordertype == "Buy") {
                var onepercent = currencyvalue / 100;
                var finalvalue = currencyvalue + onepercent;
                receive = (1 / currencyvalue) * parseFloat(data?.max);
            }


            console.log('data-----------------', data);
            return res.status(200).json(encodedata({
                type: "success",
                data: data,
                value: receive,//data?.fixedmarketrate ? data?.fixedmarketrate : currencyvalue,
                coin: data?.coin
            }))
        }).catch((E) => {
            console.log('eeeeeeeeeeeeeeeeee-----', E)
            return res.status(500).json(encodedata({
                type: "failed",
                message: "Error found"
            }))
        });
    }
    catch (e) {
        return res.status(500).json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const Filterp2porderhooks = async (req, res) => {
    try {

        const finddata = buildFindData(req.body);
        console.log('finddata-----', finddata)

        const result = await p2pcreateOrder.aggregate([
            {
                "$match": finddata
            },
            {
                $lookup: {
                    from: "user",
                    localField: "createrid",
                    foreignField: "userId",
                    as: "userdata"
                }
            },
            {
                $unwind: {
                    "path": "$userdata",
                    "preserveNullAndEmptyArrays": true
                }
            }
        ])
            .sort({ createdAt: -1 })
            .skip(parseInt(req?.body?.skip) || 0)
            .limit(parseInt(req?.body?.limit) || 10);
        console.log('result-------', result, result.length)
        if (result.length === 0) {
            return res.json(encodedata({
                type: "success",
                data: [],
                message: "No data found"
            }));
        }


        const newarray = await processResults(result);

        return res.status(200).json(encodedata({
            type: "success",
            data: newarray
        }));

    } catch (e) {
        console.log('Error:', e);
        return res.status(500).json(encodedata({
            type: "failed",
            message: "Error found"
        }));
    }
};


const buildFindData = (body) => {
    const finddata = { offerstatus: "created" };

    if (body?.coin) finddata.coin = body.coin;
    if (body?.prefferedcurrency) finddata.preferedcurrency = body.prefferedcurrency;
    if (body?.ordertype) finddata.ordertype = body.ordertype === "Sell" ? "Buy" : "Sell";
    if (body?.amount) {
        finddata.min = { "$lte": parseFloat(body.amount) };
        finddata.max = { "$gte": parseFloat(body.amount) };
    }
    if (body?.paymentmethod) finddata.paymentmethod = { $in: [body.paymentmethod] };

    return finddata;
};


const processResults = async (result) => {
    const newarray = await Promise.all(result.map(async (item) => {
        const coin = item.preferedcurrency;
        let resmarketvalue = 0;

        try {
            const marketvalue = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${item.coin}&tsyms=${coin}`);
            resmarketvalue = marketvalue?.data[coin] || 0;
        } catch (error) {
            console.error(`Failed to fetch market value for ${item.coin} to ${coin}`, error);
        }

        let currencyvalue = item.offermargin !== 0
            ? resmarketvalue + ((resmarketvalue / 100) * parseFloat(item.offermargin))
            : item.fixedmarketrate;

        if (!item.offermargin) {
            const onepercent = resmarketvalue / 100;
            const variablepercent = (currencyvalue - resmarketvalue) / onepercent;
            item = { ...item, "variablepercentage": variablepercent || 0 };
        }

        return {
            ...item,
            prefferedcurrencyvalue: currencyvalue || 0,
            currentmarketvalue: resmarketvalue || 0
        };
    }));

    return newarray;
};


export const Getcoinlist = async (req, res) => {
    try {
        var result = await Currency.find({ status: "active" });
        // console.log('resultresult------', result);
        updatelastseen(req?.query?.userid)
        return res.json(encodedata({
            type: "success",
            data: result
        }))
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const Getpreferedcurrency = async (req, res) => {
    try {
        var result = await Currency.find({ status: "active" });
        updatelastseen(req?.query?.userid)
        return res.json(encodedata({
            type: "success",
            data: result
        }))
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const Getalloffertag = async (req, res) => {
    try {
        var result = await OfferTag.find({ status: true })
        updatelastseen(req?.query?.userid)
        return res.json(encodedata({
            type: "success",
            data: result
        }))
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}



export const Updateofferviews = async (req, res) => {
    try {
        var viewdata = await p2pcreateOrder.findOne({ orderid: req?.body?.id });
        var totalviews = viewdata + 1
        var result = await p2pcreateOrder.findOneAndUpdate({ orderid: req?.body?.id }, { $set: { views: totalviews } });
        updatelastseen(req?.body?.userid)
        return res.json({
            type: "success",
            data: result
        })
    }
    catch (e) {
        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}

export const Getsingleuser = async (req, res) => {
    try {
        console.log('req?.query-----', req?.query)
        var result = await User.findOne({ "userId": req?.query?.userid ? req?.query?.userid : req?.user?.userId });
        var kyc = await UserKyc.findOne({ userId: result?._id });
        var wallet = await Wallet.findOne({ userId: result?.userId });
        // result = {...result , "kyc" : kyc}
        updatelastseen(req?.query?.userid)
        return res.json(encodedata({
            type: "success",
            data: result,
            kyc: kyc,
            wallet: wallet
        }))
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const canceltrade = async (req, res) => {
    try {
        var text = Date.now().toString();
        const result = await Orderchat.findByIdAndUpdate({ _id: req?.body?.id },
            { $set: { chatstatus: "Inactive", orderendtime: text } }, { new: true });
        updatelastseen(req?.body?.userid)
        return res.json({
            type: "success",
            data: result
        })
    }
    catch (e) {
        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}


export const Placeorder = async (req, res) => {
    try {
        var finddata = { _id: req?.body?.id };
        var updatedata = req?.body?.update;
        var result = await CreateP2Porder.findOneAndUpdate(finddata, { $push: { spender: updatedata } });
        updatelastseen(req?.body?.userid)
        return res.json({
            type: "success",
            data: result
        })
    }
    catch (e) {
        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}


export const adduserreview = async (req, res) => {
    try {
        var result = await User.findOneAndUpdate({ userId: req?.body?.owner }, { $push: { reviews: req?.body?.review } }, { new: true });
        console.log('result----', result)
        updatelastseen(req?.body?.userid)
        var checkUser = await User.findOne({ userId: req?.body?.owner })
        let doc = {
            'userId': checkUser._id,
            'title': 'Review',
            'description': 'You received one review',
        }
        await newNotification(doc)

        return res.json(encodedata({
            type: "success",
            data: result
        }));
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const createroom = async (req, res) => {
    try {
        var check = await Orderchat.findOne({
            'ordercreator': req?.body?.creater,
            'spender': req?.body?.spender,
            'orderid': req?.body?.orderid
        })
        var order = await p2pcreateOrder.findOne({ orderid: req?.body?.orderid })
        var time = parseFloat(check?.orderstarttime) + (60000 * parseFloat(order?.offertimelimit))
        if (check) {
            if (check?.chatstatus == "Inactive" || time < Date.now() || check?.paidstatus == "confirm") {
                var newdata = new Orderchat({
                    'ordercreator': req?.body?.creater,
                    'spender': req?.body?.spender,
                    'message': [],
                    'roomid': req?.body?.roomid,
                    'orderid': req?.body?.orderid,
                    'orderstarttime': Date.now().toString()
                });
                var result = await newdata.save();
                var updata = req.body.updatedata;
                updata.ref = result?._id;
                var newhistory = new Tradehistory({
                    creater: req?.body?.creater,
                    spender: req?.body?.spender,
                    pay: updata?.pay,
                    receive: updata?.receive,
                    adminfee: updata?.adminfee,
                    perprice: updata?.perprice,
                    status: "pending",
                    orderid: req?.body?.orderid,
                    chatref: result?._id
                })
                var historyresult = await newhistory.save();
                var placeorderresult = await p2pcreateOrder.findOneAndUpdate({ orderid: req?.body?.orderid }, { $push: { spenderid: updata } });
                // updatelastseen(req?.body?.userid)
                let checkUser = await User.findOne({ userId: req?.body?.creater });
                let doc = {
                    'userId': checkUser._id,
                    'title': 'Trade_Request',
                    'description': 'You received one trade request',
                }
                await newNotification(doc);
                var getuser = await User.findOne({ userId: req?.body?.creater });
                var useralert = {
                    'roomid': req?.body?.roomid,
                    "owner": getuser._id,
                    "username": getuser.firstName + " " + getuser.lastName,
                    "refid": result?._id,
                    'ordercreator': req?.body?.creater
                }
                socketEmitofferrequest("REQUEST", useralert, getuser._id)
                return res.json({
                    type: "success",
                    data: result,
                    placeorder: placeorderresult,
                    history: historyresult
                });
            }
            else {
                return res.json({
                    type: "success",
                    data: check
                });
            }
        }
        else {
            let finddata = { orderid: req?.body?.orderid };
            var newdata = new Orderchat({
                'ordercreator': req?.body?.creater,
                'spender': req?.body?.spender,
                'message': [],
                'roomid': req?.body?.roomid,
                'orderid': req?.body?.orderid,
                'orderstarttime': Date.now().toString()
            });
            var result = await newdata.save();

            var updata = req.body.updatedata
            updata.ref = result?._id;
            var newhistory = new Tradehistory({
                creater: req?.body?.creater,
                spender: req?.body?.spender,
                pay: updata?.pay,
                receive: updata?.receive,
                adminfee: updata?.adminfee,
                perprice: updata?.perprice,
                status: "pending",
                orderid: req?.body?.orderid,
                chatref: result?._id
            })
            var historyresult = await newhistory.save();
            var placeorderresult = await p2pcreateOrder.findOneAndUpdate(finddata, { $push: { "spenderid": updata } }, { new: true });
            var getuser = await User.findOne({ userId: req?.body?.creater });
            var useralert = {
                'roomid': req?.body?.roomid,
                "owner": getuser._id,
                "username": getuser.firstName + " " + getuser.lastName,
                "refid": result?._id,
                'ordercreator': req?.body?.creater
            }
            socketEmitofferrequest("REQUEST", useralert, getuser._id)
            return res.json({
                type: "success",
                data: result,
                placeorder: placeorderresult,
                history: historyresult
            });
        }
    }
    catch (e) {
        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}

export const Getsingletradechat = async (req, res) => {
    try {
        var aggregateresult = await Orderchat.aggregate([
            {
                "$match": { roomid: req?.query?.roomid }
            },
            {
                $lookup:
                {
                    from: "user",
                    localField: "ordercreator",
                    foreignField: "userId",
                    as: "owner"
                }
            },
            {
                $lookup:
                {
                    from: "p2pcreateOrder",
                    localField: "orderid",
                    foreignField: "orderid",
                    as: "tradedata"
                }
            },
            {
                $unwind: {
                    "path": "$tradedata",
                    "preserveNullAndEmptyArrays": true
                }
            }
        ]);
        updatelastseen(req?.query?.userid);
        console.log('aggregateresult-----', aggregateresult)
        return res.json(encodedata({
            type: "success",
            data: aggregateresult
        }));
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const useroffer = async (req, res) => {
    try {
        var result = await Orderchat.find({ ordercreator: req?.query?.userid });
        updatelastseen(req?.query?.userid)
        return res.json({
            type: "success",
            data: result
        });
    }
    catch (e) {
        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}

export const singlesaledetail = async (req, res) => {
    try {
        console.log('req?.query?.id------', req.body, req.query)
        var result = await p2pcreateOrder.findOne({ _id: req?.query?.id });
        // return false;

        var coin = result?.preferedcurrency;

        var marketvalue = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${result?.coin}&tsyms=${result?.preferedcurrency}`);
        var resmarketvalue = marketvalue?.data[coin];
        var convertedvalue = (resmarketvalue / 100) * parseFloat(result?.offermargin);
        var currencyvalue = result.offermargin != "0" ? resmarketvalue + convertedvalue : result?.fixedmarketrate;
        var variablepercent = 0;
        if (!result.offermargin) {
            var onepercent = resmarketvalue / 100
            variablepercent = (currencyvalue - resmarketvalue) / onepercent;
        }
        updatelastseen(req?.query?.userid);

        return res.json(encodedata({
            type: "success",
            data: result,
            prefferedcurrencyvalue: currencyvalue ? currencyvalue : 0,
            currentmarketvalue: resmarketvalue ? resmarketvalue : 0,
            variablepercentage: variablepercent ? variablepercent : 0
        }));
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}



export const orderstatus = async (req, res) => {
    try {
        // console.log('req?.body?.id------', req?.body)
        // return false
        var result = await Orderchat.findOneAndUpdate({ _id: req?.body?.id }, { $set: { paidstatus: req?.body?.status } }, { new: true });
        var tradehistoryresult = await Tradehistory.findOneAndUpdate({ chatref: req?.body?.id },
            { $set: { status: req?.body?.status } });
        let orderdetail = await p2pcreateOrder.findOne({ orderid: result?.orderid });

        let creater = orderdetail?.ordertype == "Sell" ? result?.ordercreator : result?.spender;
        let spender = orderdetail?.ordertype == "Sell" ? result?.spender : result?.ordercreator;

        if (req?.body?.status == "paid") {
            let checkUser = await User.findOne({ userId: creater });
            let doc = {
                'userId': checkUser._id,
                'title': 'Trade_Request',
                'description': 'User have paid your order',
            }
            await newNotification(doc)
        }
        if (req?.body?.status == "confirm") {
            let checkUser = await User.findOne({ userId: spender });
            let doc = {
                'userId': checkUser._id,
                'title': 'Trade_Request',
                'description': 'Owner confirm your trade',
            }
            await newNotification(doc)
        }
        if (req?.body?.status == "reject") {
            let checkUser = await User.findOne({ userId: spender });
            let ownercheckUser = await User.findOne({ userId: creater });
            let ref = {
                username: ownercheckUser?.firstName + " " + ownercheckUser?.lastName,
                user: checkUser?.userId
            }
            socketEmitofferrequest("DECLINE", ref, checkUser?._id)
        }
        socketEmit("REFRESH", result, result?.rommid);
        // console.log('resultresult-----', result)
        return res.json(encodedata({
            type: "success",
            data: result
        }));
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const getcurrencydata = async (req, res) => {
    try {
        var result = await Currency.findOne({ symbol: req?.query?.symbol });
        updatelastseen(req?.query?.userid)
        return res.json({
            type: "success",
            data: result
        });
    }
    catch (e) {
        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}

export const Adminassetupdate = async (req, res) => {
    try {

        var admin = await wallet.findOne({ userId: "13841853" });//config.OWNERUSERID

        var adminarray = await walletupdate(admin?.assets, req?.body?.coin, req?.body?.adminbalance, true, req?.body?.adminbalance);
        var updateadminasset = await wallet.findOneAndUpdate({ userId: "13841853" }, //config.OWNERUSERID
            { $set: { assets: adminarray } }, { new: true });
        var owner = await wallet.findOne({ userId: req?.body?.ownerid });
        var ownerarray = await walletupdate(owner?.assets, req?.body?.coin, req?.body?.ownerbalance, false, req?.body?.adminbalance);
        var updateownerasset = await wallet.findOneAndUpdate({ userId: req?.body?.ownerid },
            { $set: { assets: ownerarray } }, { new: true });

        var spender = await wallet.findOne({ userId: req?.body?.spenderid });
        var spenderarray = await walletupdate(spender?.assets, req?.body?.coin, req?.body?.spenderbalance, true, req?.body?.adminbalance);
        var updatespenderasset = await wallet.findOneAndUpdate({ userId: req?.body?.spenderid, "assets.coin": req?.body?.coin },
            { $set: { assets: spenderarray } }, { new: true });


        updatelastseen(req?.body?.userid)
        socketEmit("REFRESH", [], req?.body?.roomid)
        return res.json({
            type: "success",
            data: "Successfully updated assets"
        });
    }
    catch (e) {
        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}


const walletupdate = async (data, currency, balance, ref, adminbalance) => {
    await data?.map((e, i) => {
        if (e.coin == currency) {
            if (ref) {
                e.p2pBal = parseFloat(e.p2pBal) + parseFloat(balance)
            }
            else {
                e.p2pBal = parseFloat(e.p2pBal) - (parseFloat(balance) + parseFloat(adminbalance))
            }
        }
    })
    return data;
}

export const updatelastseen = async (userid) => {
    try {
        var time = Date.now();
    }
    catch (e) {
    }
}

export const updateuseronlinestatus = async (req, res) => {
    try {
        var time = Date.now();
        var result = await User.findOneAndUpdate({ userId: req?.body?.userid }, { $set: { lastseen: req?.body?.status } });
        return res.json(encodedata({
            type: "success",
            data: result
        }));
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const Getcms = async (req, res) => {
    try {
        var result = await Cms.findOne({ identifier: req?.query?.identifier, status: "active" });
        return res.json(encodedata({
            type: "success",
            data: result
        }));
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const Getfaq = async (req, res) => {
    try {
        var result = await Faq.find({ status: "active" });
        return res.json(encodedata({
            type: "success",
            data: result
        }));
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const getsitesettings = async (req, res) => {
    try {
        var result = await SiteSetting.find({});
        return res.json(encodedata({
            type: "success",
            data: result[0]
        }));
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}

export const paginationQuery = (query) => {
    let pagination = {
        skip: 0,
        limit: 10,
        page: 1
    }

    if (!isEmpty(query) && !isEmpty(query.page) && !isEmpty(query.limit)) {
        pagination['skip'] = (query.page - 1) * query.limit;
        pagination['limit'] = Number(query.limit);
        pagination['page'] = Number(query.page)
    }
    return pagination;
}


export const gettradehistory = async (req, res) => {
    try {
        // console.log('req?.query?.userId--req?.query?.userId----', req?.query)

        let pagination = paginationQuery(req.query);

        let count = await Tradehistory.find({
            $or: [
                { creater: req?.query?.userId },
                { spender: req?.query?.userId }
            ]
        }).countDocuments();  

        var result = await Tradehistory.aggregate([
            {
                $match: {
                    $or: [
                        { creater: req?.query?.userId },
                        { spender: req?.query?.userId }
                    ]
                }
            },
            {
                $lookup: {
                    from: "p2pcreateOrder",
                    localField: "orderid",
                    foreignField: "orderid",
                    as: "orderdata"
                }
            },
            {
                $unwind: {
                    "path": "$orderdata",
                    "preserveNullAndEmptyArrays": true
                }
            }
        ])
        .sort({ createdAt: -1 })
        .skip(parseInt(pagination.skip))
        .limit(parseInt(pagination.limit));

        // console.log('result-----', result, count);

        return res.status(200).json(encodedata({
            type: "success",
            data: result,
            count: count
        }));
    }
    catch (e) {
        // console.log('eee------', e);
        return res.status(500).json(encodedata({
            type: "failed",
            message: "Error found"
        }));
    }
}


export const getspenderhistory = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let count = await Orderchat.aggregate([{ $match: { spender: req?.query?.userId } }]);
        let result = await Orderchat.aggregate([{ $match: { spender: req?.query?.userId } },
        {
            $lookup: {
                from: "p2pcreateOrder",
                localField: "orderid",
                foreignField: "orderid",
                as: "orderdata"
            }
        },
        {
            $unwind: {
                "path": "$orderdata",
                "preserveNullAndEmptyArrays": true
            }
        }

        ]).sort({ createdAt: -1 }).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));
        return res.json(encodedata({
            type: "success",
            data: result,
            count: count?.length
        }));
    }
    catch (e) {
        return res.json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}


export const gettotaluserbalance = async (req, res) => {
    try {
        var result = await wallet.findOne({ "userId": req?.user?.userId });
        var totalbalance = 0;
        var userasset = result?.assets;
        for (var i = 0; i < userasset?.length; i++) {
            var value = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${userasset[i]?.coin}&tsyms=${"btc"}`);
            var marketvalue = value?.data["BTC"];
            var coinprice = marketvalue * userasset[i]?.p2pBal;
            var newprice = coinprice ? coinprice : 0
            totalbalance = totalbalance + newprice;
        }
        return res.json({
            type: "success",
            data: totalbalance
        });
    }
    catch (e) {

        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}


export const gettradespeed = async (req, res) => {
    try {
        var result = await Orderchat.aggregate([
            { $match: { ordercreator: req?.query?.userid } }, //req?.query?.userid
            {
                $lookup: {
                    from: "p2pcreateOrder",
                    localField: "orderid",
                    foreignField: "orderid",
                    as: "orderdata"
                }
            },
            {
                $unwind: {
                    "path": "$orderdata",
                    "preserveNullAndEmptyArrays": true
                }
            }
        ])

        let starttime = 0;
        let endtime = 0;
        await result?.map((data, i) => {
            starttime = starttime + parseFloat(data?.orderstarttime);
            var time = data?.orderendtime ? parseFloat(data?.orderendtime) : (parseFloat(data?.orderstarttime) + (60000 * parseFloat(data?.orderdata?.offertimelimit)))
            endtime = endtime + parseFloat(time);

        })
        var difference = endtime - starttime;
        var average = difference / result?.length;
        return res.json({
            type: "success",
            data: average
        });
    }
    catch (e) {
        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.IMAGE.PROFILE_PATH2);
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, 'file-' + Date.now() + path.extname(file.originalname));
    }
});
let profilepicUpload = multer({
    storage: profileStorage,
    fileFilter: imageFilter,
    limits: { fileSize: config.IMAGE.ID_DOC_SIZE }
}).fields([
    { name: 'image', maxCount: 1 },
])

export const updateuserprofilepicUpload = (req, res, next) => {
    profilepicUpload(req, res, function (err) {
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

export const updateuserprofilepic = async (req, res) => {
    try {
        let uploadfile = req?.files?.image;
        let imgname = req.files.image[0].filename
        const folpath = 'public/user_profile_img/';
        const folderpath = '/user_profile_img/' + imgname;
        const imgpath = 'public/user_profile_img/' + imgname + '.webp';
        var result = await User.findOneAndUpdate({ userId: req?.body?.userid },
            { "$set": { profileImage: folderpath } });
        // console.log("req?.body?.userid", folderpath);

        return res.status(200).json(encodedata({
            type: "success",
            data: result
        }));
    }
    catch (e) {
        return res.status(500).json(encodedata({
            type: "failed",
            message: "Error found"
        }))
    }
}


export const canceloffer = async (req, res) => {
    try {
        var result = await p2pcreateOrder.findOneAndUpdate({ orderid: req?.body?.orderid }, { $set: { offerstatus: "ended" } });
        return res.json({
            type: "success",
            data: result
        });
    }
    catch (e) {
        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}

export const getpaymentmethod = async (req, res) => {
    try {
        var result = await PaymentTypes.find({ status: "Active" });
        return res.json({
            type: "success",
            data: result
        });
    }
    catch (e) {
        return res.json({
            type: "failed",
            message: "Error found"
        })
    }
}

export const createcryptoaddress = async (req, res) => {
    try {
        var address = await createAddress(req?.body?.symbol, req?.body?.email, config?.coinpaymentGateway?.IPN_URL)
        var result = await wallet.findOneAndUpdate({ "userId": req?.body?.userid, "assets.coin": req?.body?.symbol }, {
            "assets.$.address": ""
        })
    }
    catch (E) {
    }
}


export const Checkdeposit = async (req, res) => {
    try {
        let walletdata = await OwnerWallet.findOne({ type: "WALLET" });
        let owner = walletdata?.walletaddress;
        let user = await User.findOne({ userId: req?.user?.userId })
        let beforeupdate = await wallet.findOne({ userId: req?.user?.userId });
        let currency = await Currency.find({ status: "active" });
        var asset = beforeupdate?.assets
        for (var i = 0; i < asset?.length; i++) {
            let ref = await currency.find(e => e?._id?.toString() == asset[i]?._id?.toString());
            let balanceref = asset[i]?.p2pBal;
            if (ref?.depositType == "local") {
                let tokendata = await UseERC20(ref?.contractAddress, decryptString(asset[i]?.privateKey), ref?.minABI, ref?.tokenType);
                let userbal = tokendata?.balance / 10 ** tokendata?.decimals;
                const bal = parseFloat(balanceref) + parseFloat(userbal);
                if (parseFloat(userbal) > 0) {
                    let estimategas = await Estimategas(ref?.contractAddress, userbal, decryptString(asset[i]?.privateKey), owner, ref?.minABI, ref?.tokenType);
                    let gastransfer = await Bnbtrasfer(owner, asset[i].address, estimategas?.hash, ref?.tokenType);
                    let transfer = await transferToAddress(ref?.contractAddress, userbal, decryptString(asset[i]?.privateKey), owner, ref?.minABI, ref?.tokenType).then(async (data) => {
                        if (data?.status == true || data?.status == "true") {
                            let update = await wallet.findOneAndUpdate(
                                {
                                    userId: req?.user?.userId, "assets.coin": tokendata?.symbol?.toUpperCase()
                                },
                                {
                                    $set: {
                                        "assets.$.p2pBal": bal
                                    }
                                }
                            );
                            if (update) {
                                let transactions = new Transaction();
                                transactions["userId"] = req?.user?.userId;
                                transactions["currencyId"] = ref._id;
                                transactions["coin"] = ref.coin;
                                transactions["toAddress"] = asset[i].address;
                                transactions["amount"] = userbal;
                                transactions["actualAmount"] = userbal;
                                transactions["txid"] = data?.hash?.transactionHash;
                                transactions["status"] = 'completed';
                                transactions["paymentType"] = 'local';
                                let trxData = await transactions.save();

                                createPassBook({
                                    'userId': user._id,
                                    'coin': ref.coin,
                                    'currencyId': ref._id,
                                    'tableId': trxData._id,
                                    'beforeBalance': balanceref,
                                    'afterBalance': parseFloat(bal),
                                    'amount': parseFloat(userbal),
                                    'type': 'local',
                                    'category': 'credit'
                                })

                                let content = {
                                    'email': user.email,
                                    'date': new Date(),
                                    'amount': parseFloat(userbal).toFixed(8),
                                    'transactionId': data?.hash?.transactionHash,
                                    'currency': ref.coin,
                                };

                                mailTemplateLang({
                                    'userId': user._id,
                                    'identifier': 'User_deposit',
                                    'toEmail': user.email,
                                    content
                                })
                            }
                        }

                    });
                }
            }
        }
        let userwallet = await wallet.findOne({ userId: req?.user?.userId });
        return res.json({ success: true, data: userwallet });
    }
    catch (e) {
        return res.json({ success: false, data: {} });
    }
}





