import { Schema } from "mongoose";

import isEmpty from '../../lib/isEmpty'
import { AddOffertagValidation, paymenttypesvalidation } from "../../validation/P2PcreateAdmin.validation";
import OfferTag from "../../models/OfferTags";
import p2pcreateOrder from "../../models/P2p-createorders";
import Tradehistory  from "../../models/tradehistory";
import PaymentTypes from "../../models/paymenttype";
import { Cms, ContactUs, Currency, EmailTemplate, FaqCategory, User } from "../../models";
import emailtemplate from "../../models/emailtemplate";
import OwnerWallet from "../../models/ownerwallet";
import {UseAccount} from "./token.controller";
import { encodedata, encryptString } from "../../lib/cryptoJS";


const filterSearchQuery = async (query = {}, fields = []) => {
    let filterQuery = {};
    if (!isEmpty(query) && !isEmpty(query.search)) {
        let filterArray = []
        for (const key of fields) {
            let filter = {};
            filter[key] = new RegExp(query.search, 'i');
            filterArray.push(filter)
        }
        filterQuery = { "$or": filterArray };
    }
    return filterQuery
}

export const Addoffertag = async (req, res) => {

    let reqBody = req.body;

    try {
        var validation = await AddOffertagValidation(req?.body);
        if(validation.isValid){
            const admincms = new OfferTag({
                Name: reqBody.name,
                Description: reqBody.description,
            })
            const adminCMS = await admincms.save()
            if(adminCMS){
                return res.send(encodedata({ 
                    "status" : "success",
                    "message": "created successfully" 
                }))
            }else{
                return res.send(encodedata({ 
                    "status" : "failed",
                    "message": "Error found" 
                }))
            }

        }
        else{
            return res.send(encodedata({ 
                "status" : "failed",
                "error" : validation.errors,
                "message": "Invalid inputs" 
            }))
        }
    } catch (err) {
        return res.send(encodedata({ 
            "status" : "failed",
            "message": "Something Went Worng" 
        }))
    }
}


export const Editoffertag = async (req, res) => {

    let reqBody = req.body;
    try {
        var validation = AddOffertagValidation(req?.body);
        if(validation.isValid){
            let filter = { _id: req.body.id };
        let update = {
            Name: reqBody.name,
            Description: reqBody.description,
            status: reqBody.status
        }
        const editdata = await OfferTag.findOneAndUpdate(filter, { $set: update } , {new : true})
        if (editdata) {
            return res.send({ 
                "status" : "success",
                "message": "Updated successfully" 
            })
        } else {
            return res.send({ 
                "status" : "success",
                "message": "Updated successfully" 
            })
        }
        }
        else{
            return res.send({ 
                "status" : "failed",
                "error" : validation.errors,
                "message": "Invalid inputs" 
            })
        }
    } catch (err) {
        return res.send({ 
            "status" : "failed",
            "message": "Something Went Worng" 
        })
    }
}

export const Getalloffertag = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        // console.log('req.queryreq.query----', pagination)
        let filter = await filterSearchQuery(req.query, ['Name', 'Description']);
        // console.log('filter----', filter)

        const count =  await OfferTag.find(filter).count();
        // console.log('count----', count)

        const result =  await OfferTag.find(filter).sort({createdAt : -1}).skip(pagination.skip).limit(pagination.limit);
    //   console.log('result-----', result)
        if (result == "" || result == null) {
            return res.send({ 
                "status" : "success",
                "message": "Retrive successfully",
                "data" : [],
                "count" : 0
            })
        }
        else{

            return res.send({ 
                "status" : "success",
                "message": "Retrive successfully",
                "data" : result,
                "count": count
            })
        }
    } catch (e) {
        return res.send({ 
            "status" : "failed",
            "message": "Something Went Worng"
        })
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

export const getofferhistory = async(req , res) => {
    try{
        let pagination = paginationQuery(req.query);
        let filter = await filterSearchQuery(req.query, ['firstName', 'email']);
        filter.$expr = {$eq: ['$userId', '$$createrid']};
        let filter1 = await filterSearchQuery(req.query, ['createrid', 'orderid' , "coin"]);
        let countdata = await p2pcreateOrder.aggregate([
            {$match : filter1},
            {
                $lookup:{
                    from: "user",
                    localField: "createrid",
                    foreignField: "userId",
                    as: "userdata"
                }
            },
            { $unwind: {
                "path": "$userdata",
                "preserveNullAndEmptyArrays": true
            } }
        ]);
        let count = countdata?.length;
        let Export = req.query.export;
        const header = ["Date", "Creater Id", "Order Id", "Currency" , "Type" , "Prefered Currency" , "Price Type" , "Time Limit" , "Min Buy" , "Max Buy" , "Offer Margin"];

        if (Export == "csv" || Export == "xls") {
            let exportData = await p2pcreateOrder.find({}).sort({ createdAt: -1 });
            let csvData = [header];
            if (exportData && exportData.length > 0) {
              for (let item of exportData) {
                var arr = [];
                var margin = item?.offermargin ? item?.offermargin : "-"
                arr.push(item.createdAt, item.createrid, item.orderid, item.coin , item.ordertype , item?.preferedcurrency , item?.pricetype , item?.offertimelimit , item?.min , item.max , margin);
                csvData.push(arr);
              }
            }
            return  res.csv(csvData);
          } else if (Export == "pdf") {
            let data = await p2pcreateOrder.find({}).sort({ createdAt: -1 });
            let result = {
                count: count,
                pdfData: data
            }
            return res.status(200).json(encodedata({ 'success': true, "messages": "success", result }))
            }
            else {
                var result = await p2pcreateOrder.aggregate([
                    {$match : filter1},
                    {
                        $lookup:{
                            from: "user",
                            localField: "createrid",
                            foreignField: "userId",
                            as: "userdata"
                        }
                    },
                    { $unwind: {
                        "path": "$userdata",
                        "preserveNullAndEmptyArrays": true
                    } }
                ]).sort({ createdAt: -1 }).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));
                }

                return res.json(encodedata({
                    type: "success",
                    data: result,
                    count: count
                }));
            }

       
    
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
}


export const gettradehistory = async(req , res) => {
    try{
        let pagination = paginationQuery(req.query);
        let filter = await filterSearchQuery(req.query, ['orderid']);
        
        let filter1 = await filterSearchQuery(req.query, ['coin', 'preferedcurrency']);
        filter1.$expr = {$eq: ['$orderid', '$$orderid']};
        let datas = await Tradehistory.aggregate([
            { $match: filter },
            {
                $lookup:{
                    from: "p2pcreateOrder",
                    let: { orderid: "$orderid" },
                    pipeline: [{ $match: filter1 }],
                    as: "orderdata"
                }
            },
            
            { $unwind: {
                "path": "$orderdata",
                "preserveNullAndEmptyArrays": true
            } }
        ]);
        let count = datas?.length

        let Export = req.query.export;
        const header = ["Date", "Order Id", "Swap Amount", "Admin Fee" , "Prefered Currency Value" , "Currency" , "Preferedcurrency" , "Status"];

        if (Export == "csv" || Export == "xls") {
            let exportData = await Tradehistoryaggregate([
                {
                    $lookup:{
                        from: "p2pcreateOrder",
                        localField: "orderid",
                        foreignField: "orderid",
                        as: "orderdata"
                    }
                },
                { $unwind: {
                    "path": "$orderdata",
                    "preserveNullAndEmptyArrays": true
                } }
            ]).sort({ createdAt: -1 });
            let csvData = [header];
            if (exportData && exportData.length > 0) {
              for (let item of exportData) {
                let arr = [];
                var margin = item?.offermargin ? item?.offermargin : "-"
                arr.push(item.createdAt, item.orderid, item.receive , item.adminfee , item?.pay , item?.orderdata?.preferedcurrency , item?.orderdata?.coin , item?.status);
                csvData.push(arr);
              }
            }
            return res.csv(csvData);
          } else if (Export == "pdf") {
            let data = await Tradehistory.aggregate([
                {
                    $lookup:{
                        from: "p2pcreateOrder",
                        localField: "orderid",
                        foreignField: "orderid",
                        as: "orderdata"
                    }
                },
                { $unwind: {
                    "path": "$orderdata",
                    "preserveNullAndEmptyArrays": true
                } }
            ]).sort({ createdAt: -1 });
            let result = {
                count: count,
                pdfData: data
            }
            return res.status(200).json(encodedata({ 'success': true, "messages": "success", result }))
            }

        else{
            var result = await Tradehistory.aggregate([
                { $match: filter },
                {
                    $lookup:{
                        from: "p2pcreateOrder",
                        let: { orderid: "$orderid" },
                        pipeline: [{ $match: filter1 }],
                        as: "orderdata"
                    }
                },
                { $unwind: {
                    "path": "$orderdata",
                    "preserveNullAndEmptyArrays": true
                } }
            ]).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));
            return res.json(encodedata({
                type: "success",
                data: result,
                count: count
            }));
        }
    }
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
}

export const getpaymenttypes = async(req , res) => {
    try{
            let pagination = paginationQuery(req.query);
            let filter = await filterSearchQuery(req.query, ['Name', 'Description']);
            const count =  await PaymentTypes.find(filter).count();
            const result =  await PaymentTypes.find(filter).sort({createdAt : -1}).skip(pagination.skip).limit(pagination.limit);
            return res.json({
                type: "success",
                data: result,
                count: count
            });
    }
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
}

export const addpaymenttypes = async(req , res) => {
    try{
        var validation = paymenttypesvalidation(req?.body);
        if(validation.isValid){
            var newdata = new PaymentTypes({
                Name : req?.body?.name,
                label : req?.body?.name,
                value : req?.body?.name
            })
            var result = await newdata.save();
            return res.json({
                type: "success",
                data: result,
            });
        }
        else{
            return res.send({ 
                "status" : "failed",
                "error" : validation.errors,
                "message": "Invalid inputs" 
            })
        }
        
    }
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
}

export const editpaymenttypes = async(req , res) => {
    try{
        var validation = paymenttypesvalidation(req?.body);
        if(validation.isValid){
            var updatedata = {};
        if(req?.body?.name){
            updatedata.Name = req?.body?.name,
            updatedata.label = req?.body?.name,
            updatedata.value = req?.body?.name
        }
        if(req?.body?.status){
            updatedata.status = req?.body?.status
        }
        var result = await PaymentTypes.findOneAndUpdate({
            _id : req?.body?.id,
        } , {$set : updatedata});

        return res.json({
            type: "success",
            data: result,
        });
        }
        else{
            return res.send({ 
                "status" : "failed",
                "error" : validation.errors,
                "message": "Invalid inputs" 
            })
        }
    }
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
}




export const filteruser = async(req , res) => {
    try{
        const pagination = await paginationQuery(req.body).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));;
        const filter = await filterSearchQuery(req.body,['email','firstName']);
        const count = await User.find(filter).count();
        const result = await User.find(filter).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));
        return res.json({
            type: "success",
            data: result,
            count : count
        });
    }
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
}

export const filtercurrency = async(req , res) => {
    try{
        const pagination = await paginationQuery(req.body).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));;
        const filter = await filterSearchQuery(req.body,['name','type','coin' , 'symbol']);
        const result = await Currency.find(filter).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));
        return res.json({
            type: "success",
            data: result,
        });
    }
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
}

export const filtercms = async(req , res) => {
    try{
        const pagination = await paginationQuery(req.body).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));;
        const filter = await filterSearchQuery(req.body,['identifier']);
        const result = await Cms.find(filter).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));
        return res.json({
            type: "success",
            data: result,
        });
    }
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
}

export const filtercontactus = async(req , res) => {
    try{
        const pagination = await paginationQuery(req.body).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));;
        const filter = await filterSearchQuery(req.body,['name' , "email"]);
        const result = await ContactUs.find(filter).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));
        return res.json({
            type: "success",
            data: result,
        });
    }
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
}

export const filterfaqcategory = async(req , res) => {
    try{
        const pagination = await paginationQuery(req.body).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));;
        const filter = await filterSearchQuery(req.body,['name']);
        const result = await FaqCategory.find(filter).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));
        return res.json({
            type: "success",
            data: result,
        });
    }
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
} 


export const filteremailtemplate = async(req , res) => {
    try{
        const pagination = await paginationQuery(req.body).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));;
        const filter = await filterSearchQuery(req.body,['identifier' , 'subject' , ]);
        const result = await EmailTemplate.find(filter).skip(parseInt(pagination.skip)).limit(parseInt(pagination.limit));
        return res.json({
            type: "success",
            data: result,
        });
    }
    catch(e){
        return res.json({
            type : "failed",
            message : "Error found"
        })
    }
} 

export const GetWallet = async(req , res) => {
    try{
        var result = await OwnerWallet.findOne({type : "WALLET"});
        return res.json({
            type : "success" , 
            data : result
        })
    }
    catch(e){
        return res.json({
            type : "failed" , 
            data : result
        })
    }
}

export const updatewallet = async(req , res) => {
    try{
        var address = await UseAccount(req?.body?.privatekey);
        var privatekey = req?.body?.privatekey;
        var result = await OwnerWallet.findOneAndUpdate({type : "WALLET"} , 
        {$set : {privatekey : privatekey , walletaddress : address}}
        );
        return res.json(encodedata({
            type : "success", 
            data : result
        }))
    }
    catch(e){
        console.log('e------', e)
        return res.json({
            type : "failed" , 
            data : result,
            message: "Server error"
        })
    }
}




