// import package
import mongoose from 'mongoose';
import multer from 'multer';
import config from '../config';
import path from 'path';

// import controller
import { mailTemplate, mailTemplateLang } from './emailTemplate.controller';
import * as ethGateway from './coin/ethGateway';

// import modal
import {
    SupportCategory,
    SupportTicket,
    User,
    Admin
} from '../models'
import TicketSupport from '../models/SupportTicket';
import { newNotification } from './notification.controller'

// import lib
import { IncCntObjId } from '../lib/generalFun';
import {
    paginationQuery,
    filterSearchQuery
} from '../lib/adminHelpers';
import isEmpty from '../lib/isEmpty';
import imageFilter from '../lib/imageFilter';
import { encodedata } from '../lib/cryptoJS';

const ObjectId = mongoose.Types.ObjectId;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname == "file") {
            cb(null, config.IMAGE.SUPPORT_PATH)
        }/*else{
        cb(null, config.IMAGE.CURRENCY_PATH)
      }*/
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

var upload = multer({ storage: storage });
export const supportUpload = upload.fields([{ name: 'file', maxCount: 1 }])

/** 
 * Multer Image Uploade 
*/
const attachmentStore = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.IMAGE.SUPPORT_PATH);
    },
    filename: function (req, file, cb) {
        cb(null, 'attachment-' + Date.now() + path.extname(file.originalname));
    }
});

let attachmentUpload = multer({
    storage: attachmentStore,
    onError: function (err, next) {
        next(err);
    },
    fileFilter: imageFilter,
    limits: { fileSize: config.IMAGE.DEFAULT_SIZE }
}).fields([
    { name: 'attachment', maxCount: 1 },
])

export const uploadAttachment = (req, res, next) => {
    try {
        console.log('reqreqreq-------', req.files);
        attachmentUpload(req, res, function (err) {
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
    } catch {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/** 
 * Add Support Cateogory
 * URL: /adminapi/supportCategory
 * METHOD : POST
 * BODY : categoryName
*/
export const addSupportCategory = async (req, res) => {
    try {
        let reqBody = req.body;
        let checkCategory = await SupportCategory.findOne({ "categoryName": reqBody.categoryName })
        if (!isEmpty(checkCategory)) {
            return res.status(400).json(encodedata({ status: false, message: 'Name already exist' }))
        }
        if (isEmpty(reqBody.categoryName)) {
            return res.status(400).json(encodedata({ "success": false, 'errors': { 'categoryName': "Required" } }))
        }
        let newDoc = new SupportCategory({
            'categoryName': reqBody.categoryName
        })
        await newDoc.save()
        return res.status(200).json(encodedata({ "success": false, 'result': { 'messages': "Added successfully" } }))
    } catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'errors': { 'messages': "Error on server" } }))
    }
}

/** 
 * Edit Support Cateogory
 * URL: /adminapi/supportCategory
 * METHOD : PUT
 * BODY : categoryName, status, categoryId
*/
export const editSupportCategory = async (req, res) => {
    try {
        let reqBody = req.body;
        let checkCategory = await SupportCategory.findOne({
            "categoryName": reqBody.categoryName,
            "_id": { "$ne": reqBody.categoryId }
        })
        if (checkCategory) {
            return res.status(400).json(encodedata({ "success": false, 'errors': { 'categoryName': "category name already exists" } }))
        }
        await SupportCategory.updateOne(
            { "_id": reqBody.categoryId },
            {
                "$set": {
                    "categoryName": reqBody.categoryName,
                    'status': reqBody.status
                }
            }
        )
        return res.status(200).json(encodedata({ "success": false, 'result': { 'messages': "updated successfully" } }))
    } catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'errors': { 'messages': "Error on server" } }))
    }
}

/** 
 * Get Support Cateogory
 * URL: /adminapi/supportCategory
 * METHOD : GET
*/
export const getSupportCategory = async (req, res) => {
    try{
    let filter = filterSearchQuery(req.query, ['categoryName'])
    const categoryData = await SupportCategory.find(filter, { 'categoryName': 1, 'status': 1 })
    if(categoryData){
        return res.status(200).json(encodedata({ "success": true, 'result': { 'data': categoryData } }))
    }else{
        return res.status(500).json(encodedata({ "success": false, 'errors': { 'messages': "Error on server" } }))
    }
}catch(e){
    return res.status(500).json(encodedata({ "success": false, 'errors': { 'messages': "Error on server" } }))
}
    // SupportCategory.find(filter, { 'categoryName': 1, 'status': 1 }, (err, categoryData) => {
    //     if (err) {
    //         return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    //     }
    //     return res.status(200).json({ "success": true, 'result': { 'data': categoryData } })
    // })
}

/** 
 * Get Support Category for drop down
 * URL: /api/getSptCat
 * METHOD : GET
*/
export const getSptCat = async (req, res) => {
    try{
    const categoryData = await SupportCategory.find({ "status": "active" }, { 'categoryName': 1 })
    if(categoryData){
        return res.status(200).json({ "success": true, 'result': categoryData })
    }else{
        return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    }
}catch(e){
    return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
}
    // SupportCategory.find({ "status": "active" }, { 'categoryName': 1 }, (err, categoryData) => {
    //     if (err) {
    //         return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    //     }
    //     return res.status(200).json({ "success": true, 'result': categoryData })
    // })s
}

/** 
 * Get Single Support Cateogory
 * URL: /adminapi/getSingleSupportCategory
 * METHOD : GET
 * PARAMS : categoryId
*/
export const getSingleSupportCategory = async (req, res) => {
    try{
    const Supportcat = await SupportCategory.findOne({ '_id': req.params.categoryId }, { 'categoryName': 1 })
    if(Supportcat){

            return res.status(200).json({ "success": true, 'result': Supportcat })
    }
    else{
        return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } }) 
    }
}catch(err){
    return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
}
}

/** 
 * Create New Ticket
 * URL: /api/ticket
 * METHOD : POST
 * BODY : categoryId, message
*/
export const createNewTicket = async (req, res) => {
    try {
        let reqBody = req.body;
        console.log('reqBody-----', reqBody)
        let reqFile = req.files;
        let adminDetail = await Admin.findOne({ "role": "superadmin" });
        if (!adminDetail) {
            return res.status(500).json({ 'success': false, "message": "Error on server" })
        }
        let ckeckUser = await User.findOne({ _id: req.user.id })
        let newDoc = new SupportTicket({
            'userId': req.user.id,
            'ursUiqueId': ckeckUser.userId,
            'adminId': adminDetail._id,
            'categoryId': reqBody.categoryId,
            'roomid' : reqBody?.roomid,
            'reply': [{
                'senderId': req.user.id,
                'receiverId': adminDetail._id,
                'message': reqBody.message,
                'attachment': reqFile && reqFile.attachment ? reqFile.attachment[0].filename : "",
            }]
        })
        newDoc.tickerId = await IncCntObjId(newDoc._id)
        let ticketData = await newDoc.save();
        let usrData = await User.findOne({ "_id": req.user.id })
        if (usrData) {
            let content = {
                'ID': ticketData.tickerId,
                'ticketId': ticketData.tickerId

            };

            mailTemplateLang({
                'userId': usrData._id,
                'identifier': 'new_support_ticket_user',
                'toEmail': usrData.email,
                content
            })
        }

        if (adminDetail) {
            let content = {
                'ID': ticketData.tickerId,
            };
            mailTemplate('new_support_ticket_admin', adminDetail.email, content)
        }
        let doc = {
            'userId': req.user.id,
            'title': 'Support Ticket',
            'description': 'Your Ticket Raised Successfully',
        }
        newNotification(doc)
        return res.status(200).json(encodedata({ 'success': true, "message": "Ticket raised successfully" }))
    } catch (err) {
        console.log('errrrrr', err)
        return res.status(500).json(encodedata({ 'success': false, "message": "Error on server" }))
    }
}

/** 
 * User Ticket List
 * URL: /api/ticket
 * METHOD : GET
*/
export const userTicketList = async (req, res) => {
    try {

        let userData = await User.findOne({ "_id": req.user.id }, {
            "_id": 1,
            "firstName": 1
        });

        if (userData) {

            let adminData = await Admin.findOne({ "role": "superadmin" }, {
                "_id": 1,
                "name": 1
            })
            console.log('userDatauserDatauserData----',adminData, userData)

            if (adminData) {
                let tickerData = await SupportTicket.aggregate([
                    { '$match': { 'userId': new ObjectId(req.user.id) } },
                    {
                        "$lookup": {
                            "from": 'supportcategory',
                            "localField": "categoryId",
                            "foreignField": "_id",
                            "as": "categoryInfo"
                        }
                    },
                    { "$unwind": "$categoryInfo" },

                    {
                        "$project": {
                            '_id': 1,
                            'categoryName': "$categoryInfo.categoryName",
                            'tickerId': 1,
                            'status': 1,
                            'userId': 1,
                            'adminId': 1,
                            'reply': 1,
                            'createdAt': 1
                        }
                    }
                ])

                if (tickerData) {
                    let result = {
                        'ticketList': tickerData,
                        'sender': userData,
                        'receiver': adminData
                    }
                console.log('resultresult-----',  tickerData, userData, adminData)

                    return res.status(200).json(encodedata({ 'success': true, result }))
                }
            }
        }
        return res.status(400).json(encodedata({ 'success': false, 'message': 'NO_DATA' }))
    }
    catch (err) {
        console.log('errerr------', err)
        return res.status(500).json(encodedata({ 'success': false, "message": "Error on server" }))
    }
}

/** 
 * User Reply Message
 * URL: /api/ticket
 * METHOD : PUT
 * BODY : ticketId, receiverId, message
*/
export const usrReplyMsg = async (req, res) => {
    let reqBody = req.body;
    let reqFile = req.files;
    try{
   const ticketData = await SupportTicket.findOneAndUpdate(
        {
            "_id": reqBody.ticketId,
            "userId": req.user.id,
            "adminId": reqBody.receiverId,
        },
        {
            "$push": {
                "reply": {
                    'senderId': req.user.id,
                    'receiverId': reqBody.receiverId,
                    "message": reqBody.message,
                    'attachment': reqFile && reqFile.attachment ? reqFile.attachment[0].filename : "",
                }
            }
        },
        { "new": true })
            if (ticketData) {
                return res.status(200).json({ 'success': true, "message": 'Successfully reply the message', 'result': ticketData.reply.reverse() })
            } else {
                return res.status(400).json({ 'success': false, "message": "No records" })
            }
        }catch(err){
            return res.status(500).json({ 'success': false, "message": "Something went wrong" })
        }
          
}

/** 
 * Closed Ticket
 * URL: /api/ticket
 * METHOD : PATCH
 * BODY: ticketId
*/
export const closeTicket = async (req, res)=> {
    try {
        const {ticketId} = req.body;
        const {id} = req.user;
        const ticketData = await TicketSupport.findOneAndUpdate(
            {
                "_id": ticketId,
                "userId": id
            },
            { "status": "closed" },
            {
                "fields": {
                    "_id": 0,
                    "status": 1
                },
                "new": true
            }
        );
            // console.log('ticketData----', ticketData)
        if (!ticketData) {
            return res.status(400).json(encodedata({ 'success': false, 'message': "NO_DATA" }));
        }

        return res.status(200).json(encodedata({ 'success': true, 'message': "Ticket closed successfully", 'result': ticketData }));
    } catch (err) {
        console.log('err-----', err)
        return res.status(500).json(encodedata({ 'success': false, 'message': "SOMETHING_WRONG" }));
    }
}



/** 
 * Get Ticket Message List
 * URL: adminapi/ticketMessage
 * METHOD : GET
 * QUERY: ticketId
*/
export const getTicketMessage = async (req, res) => {
    let reqQuery = req.query;
    try{
        const ticketData = await  TicketSupport.aggregate([
            {
                "$match": {
                    "tickerId": reqQuery.ticketId,
                    "adminId": req.user.id
                }
            },
            {
                "$lookup": {
                    "from": 'user',
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "userInfo"
                }
            },
            { "$unwind": "$userInfo" },
            {
                "$lookup": {
                    "from": 'admins',
                    "localField": "adminId",
                    "foreignField": "_id",
                    "as": "adminInfo"
                }
            },
            { "$unwind": "$adminInfo" },
            {
                "$project": {
                    "userId": 1,
                    "userName": "$userInfo.firstName",
                    "adminId": 1,
                    "adminName": "$adminInfo.name",
                    "tickerId": 1,
                    "reply": 1,
                    "status": 1
                }
            }
    
        ])

        if(ticketData && ticketData.length > 0){
            return res.status(200).json({ 'success': true, 'result': ticketData[0] })
        }else{
            return res.status(400).json({ 'success': false, "message": "NO_DATA" }) 
        }
}catch(e){
    return res.status(500).json({ 'success': false, "message": "Error on server" })
}
}

/** 
 * Admin Reply Message
 * URL: /adminapi/ticketMessage
 * METHOD : PUT
 * BODY : ticketId, receiverId, message
*/
export const replyMessage = async (req, res) => {
    const { ticketId, receiverId, message } = req.body;
    const adminId = req.user.id;
    console.log('reqBody---', ticketId, message, adminId, receiverId);

    try {
        const ticketData = await SupportTicket.findOneAndUpdate(
            {
                ticketId,
                userId: receiverId,
                adminId
            },
            {
                "$push": {
                    reply: {
                        senderId: adminId,
                        receiverId,
                        message
                    }
                }
            },
            { new: true }
        );
            console.log('ticketData-----', ticketData)
        if (!ticketData) {
            return res.status(400).json({ success: false, message: "No record found" });
        }

        const userData = await User.findOne({ _id: receiverId });
        if (!userData) {
            return res.status(404).json({ success: false, message: "No user data found" });
        }

        const content = {
            ticketId,
            message,
            date: new Date().toUTCString()
        };
        await mailTemplateLang({
            identifier: 'support_ticket_reply',
            toEmail: userData.email,
            content
        });

        const notificationDoc = {
            userId: receiverId,
            title: 'Support Ticket',
            description: `Your Support Ticket Admin Reply: ${message}`,
        };
        await newNotification(notificationDoc);

        return res.status(200).json(encodedata({ success: true, message: 'Successfully replied to the message', result: ticketData }));

    } catch (err) {
        console.error("Error replying to ticket:", err);
        return res.status(500).json(encodedata({ success: false, message: "Something went wrong" }))
    }
};



/** 
 * Get Overall Ticket List
 * URL: /adminapi/ticketList
 * METHOD : GET
*/
export const getTicketList = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let Export = req.query.export
        const header = ["Ticket ID", "Category Name", "status", "Date"]


        let count = await TicketSupport.aggregate([
            {
                "$sort": {
                    "createdAt": -1
                }
            },

            {
                "$lookup": {
                    "from": 'supportcategory',
                    "localField": "categoryId",
                    "foreignField": "_id",
                    "as": "categoryInfo"
                }
            },
            { "$unwind": "$categoryInfo" },

            {
                "$lookup": {
                    "from": 'user',
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "userInfo"
                }
            },
            { "$unwind": "$userInfo" },

            {
                "$project": {
                    '_id': 1,
                    'tickerId': 1,
                    "categoryName": "$categoryInfo.categoryName",
                    "userName": "$userInfo.firstName",
                    "userId": 1,
                    'ursUiqueId': 1,
                    "adminId": 1,
                    'status': 1,
                    'createdAt': 1,
                    'roomid' : 1,
                    "email" : 1
                }
            }
        ])
        if (Export == 'csv' || Export == 'xls') {
            let exportData = await TicketSupport.aggregate([
                {
                    "$sort": {
                        "createdAt": -1
                    }
                },


                {
                    "$lookup": {
                        "from": 'supportcategory',
                        "localField": "categoryId",
                        "foreignField": "_id",
                        "as": "categoryInfo"
                    }
                },
                { "$unwind": "$categoryInfo" },

                {
                    "$lookup": {
                        "from": 'user',
                        "localField": "userId",
                        "foreignField": "_id",
                        "as": "userInfo"
                    }
                },
                { "$unwind": "$userInfo" },


                {
                    "$project": {
                        '_id': 1,
                        'tickerId': 1,
                        "categoryName": "$categoryInfo.categoryName",
                        "userName": "$userInfo.firstName",
                        "userId": 1,
                        "adminId": 1,
                        'status': 1,
                        'ursUiqueId': 1,
                        'createdAt': 1,
                        'reply': 1,
                        'roomid' : 1,
                        "email" : 1
                    }
                },
                // { "$skip": pagination.skip },
                // { "$limit": pagination.limit },
            ])
            let csvData = [
                header
            ]

            if (exportData && exportData.length > 0) {
                for (let item of exportData) {
                    let arr = []
                    arr.push(
                        item.tickerId,
                        item.categoryName,
                        item.status,
                        item.createdAt.toLocaleString(),
                    )
                    csvData.push(arr)
                }
            }
            return res.csv(csvData)
        } else if (Export == 'pdf') {

            let exportData = await TicketSupport.aggregate([
                {
                    "$sort": {
                        "createdAt": -1
                    }
                },


                {
                    "$lookup": {
                        "from": 'supportcategory',
                        "localField": "categoryId",
                        "foreignField": "_id",
                        "as": "categoryInfo"
                    }
                },
                { "$unwind": "$categoryInfo" },

                {
                    "$lookup": {
                        "from": 'user',
                        "localField": "userId",
                        "foreignField": "_id",
                        "as": "userInfo"
                    }
                },
                { "$unwind": "$userInfo" },


                {
                    "$project": {
                        '_id': 1,
                        'tickerId': 1,
                        "categoryName": "$categoryInfo.categoryName",
                        "userName": "$userInfo.firstName",
                        "userId": 1,
                        "adminId": 1,
                        'status': 1,
                        'ursUiqueId': 1,
                        'createdAt': 1,
                        'reply': 1,
                        'roomid' : 1,
                        "email" : "$userInfo.email"
                    }
                },
                // { "$skip": pagination.skip },
                // { "$limit": pagination.limit },
            ])
            let respData = {
                count: count.length,
                pdfData: exportData
            }
            return res.status(200).json(encodedata({ "success": true, 'result': respData }))
        } else {
            let data = await TicketSupport.aggregate([
                {
                    "$sort": {
                        "createdAt": -1
                    }
                },


                {
                    "$lookup": {
                        "from": 'supportcategory',
                        "localField": "categoryId",
                        "foreignField": "_id",
                        "as": "categoryInfo"
                    }
                },
                { "$unwind": "$categoryInfo" },

                {
                    "$lookup": {
                        "from": 'user',
                        "localField": "userId",
                        "foreignField": "_id",
                        "as": "userInfo"
                    }
                },
                { "$unwind": "$userInfo" },


                {
                    "$project": {
                        '_id': 1,
                        'tickerId': 1,
                        "categoryName": "$categoryInfo.categoryName",
                        "userName": "$userInfo.firstName",
                        "userId": 1,
                        'ursUiqueId': 1,
                        "adminId": 1,
                        'status': 1,
                        'createdAt': 1,
                        'reply': 1,
                        'roomid' : 1,
                        "email" : "$userInfo.email"
                    }
                },
                { "$skip": pagination.skip },
                { "$limit": pagination.limit },
            ])
            let respData = {
                count: count.length,
                data
            }
            return res.status(200).json(encodedata({ "success": true, 'result': respData }))
        }


    } catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'errors': { 'messages': 'Error on server' } }))
    }
}

/** 
 * Ticket List
 * URL: /adminapi/ticketList
 * METHOD : POST
*/
export const ticketList = async (req, res) => {
    try{
        const data = await TicketSupport.aggregate([
            { '$match': { '_id': ObjectId(req.params.ticketId) } },
            {
                "$lookup":
                {
                    "from": 'supportCategory',
                    "localField": "categoryId",
                    "foreignField": "_id",
                    "as": "categoryInfo"
                }
            },
            { "$unwind": "$categoryInfo" },
    
            {
                "$lookup": {
                    "from": 'user',
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "userInfo"
                }
            },
            { "$unwind": "$userInfo" },
    
            {
                "$lookup": {
                    "from": 'admins',
                    "localField": "adminId",
                    "foreignField": "_id",
                    "as": "adminInfo"
                }
            },
            { "$unwind": "$adminInfo" },
    
            {
                "$project": {
                    '_id': 1,
                    'categoryName': "$categoryInfo.categoryName",
                    'status': 1,
                    'userName': "$userInfo.firstName",
                    'adminName': "$adminInfo.name",
                    'userId': 1,
                    'adminId': 1,
                    'createdAt': 1
                }
            }
        ])
        if (data.length <= 0) {
            return res.status(400).json({ 'success': false, 'errors': { "messages": "No chart" } })
        }else{
        return res.status(200).json({ 'success': true, 'result': data[0] })
        }
}catch(e){
    return res.status(500).json({ 'success': false, 'errors': { "messages": "Error on server" } })
}
}