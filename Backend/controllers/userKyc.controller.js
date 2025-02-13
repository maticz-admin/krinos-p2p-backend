// import package
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';


// import modal
import { User, UserKyc } from '../models';

// import config
import config from '../config';

// import controller
import * as cloudinaryCtrl from './cloudinary.controller';
import { mailTemplateLang } from './emailTemplate.controller';
import { newNotification } from './notification.controller'

// import lib
import imageFilter from '../lib/imageFilter';
import isEmpty from '../lib/isEmpty';
import { removeKycDbFile, removeKycReqFile } from '../lib/removeFile';
import {
    paginationQuery,
    filterQuery,
    filterProofQuery,
    filterSearchQuery
} from '../lib/adminHelpers';
import { encodedata } from '../lib/cryptoJS';

const ObjectId = mongoose.Types.ObjectId;


/** 
 * Multer Image Uploade 
*/
const kycStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.IMAGE.KYC_PATH);
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, 'file-' + Date.now() + path.extname(file.originalname));
    }
});

let kycUpload = multer({
    storage: kycStorage,
    fileFilter: imageFilter,
    limits: { fileSize: config.IMAGE.ID_DOC_SIZE }
}).fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
    { name: 'selfiImage', maxCount: 1 },
    { name: 'frontImageAddress', maxCount: 1 },
])

let IDUpload = multer({
    storage: kycStorage,
    fileFilter: imageFilter,
    limits: { fileSize: config.IMAGE.ID_DOC_SIZE }
}).fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
    { name: 'selfiImage', maxCount: 1 },
    { name: 'panImage', maxCount: 1 },
])

export const uploadKyc = (req, res, next) => {
    kycUpload(req, res, function (err) {
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
 * Upload ID Document
*/
export const IDKycUpload = (req, res, next) => {
    IDUpload(req, res, function (err) {
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
 * Create New User KYC Modal
*/
export const createUserKyc = async(userId) => {
    let newDoc = new UserKyc({
        userId
    })
    const SaveDoc = await newDoc.save()
    return true

    // newDoc.save((err, userKyc) => {
    //     if (err) { return console.log() }
    //     return console.log()
    // })
}

/** 
 * Get Kyc Detail
 * URL: /api/kycdetail
 * METHOD : GET
*/
export const getUserKycDetail = async (req, res) => {
    try{
    const data = await UserKyc.findOne({ "userId": req.user.id },{ "_id": 0, "idProof": 1, "addressProof": 1 })
    if(data){
        return res.status(200).json(encodedata({ 'success': true, 'message': "FETCH_SUCCESS", 'result': data }))
    }else{
        return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))
    }
}catch(e){
    return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))
}
    // UserKyc.findOne(
    //     { "userId": req.user.id },
    //     { "_id": 0, "idProof": 1, "addressProof": 1 },
    //     (err, data) => {
    //         if (err) {
    //             return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    //         }
    //         return res.status(200).json({ 'success': true, 'message': "FETCH_SUCCESS", 'result': data })
    //     }
    // )
}

/** 
 * Update Id Proof
 * URL: /api/kyc/idproof
 * METHOD : PUT
 * BODY : type,proofNumber, frontImage, backImage, selfiImage
*/

export const updateIdProof = async (req, res) => {
    try {
        let reqBody = req.body,
            reqFile = req.files;
        let idProofDoc = await UserKyc.findOne({ "userId": req.user.id }, { "idProof": 1, "addressProof": 1 });
        if (!idProofDoc) {
            return res.status(409).json({ 'success': false, 'message': "NO_DATA" })
        }

        if (idProofDoc.idProof.status == 'new' || idProofDoc.idProof.status == 'rejected') {

            idProofDoc.idProof.type = reqBody.type;
            idProofDoc.idProof.proofNumber = reqBody.proofNumber;
            idProofDoc.idProof.frontImage = req.files.frontImage[0].filename;
            idProofDoc.idProof.selfiImage = req.files.selfiImage[0].filename;
            idProofDoc.idProof.panImage = req.files.panImage[0].filename;

            if (idProofDoc.idProof.type != 'passport') {
                idProofDoc.idProof.backImage = req.files.backImage[0].filename;
            }
            idProofDoc.idProof.status = 'pending';
        } else {
            removeKycReqFile(req.files, 'id');
        }

        let updateUsrKyc = await idProofDoc.save();
        let userKycData = {
            idProof: updateUsrKyc.idProof,
            updatedAt: updateUsrKyc.updatedAt
        }

        let usrDoc;
        if (updateUsrKyc.idProof.status == 'pending' && updateUsrKyc.addressProof.status == 'pending' && req.user.type == 'basic_pending') {
            let updateUsr = await User.findOneAndUpdate({ "_id": req.user.id }, {
                type: 'basic_submitted'
            }, {
                "new": true,
                "fields": {
                    "_id": 0,
                    "type": 1,
                }
            })

            usrDoc = {
                type: updateUsr.type
            }
        }

        let doc = {
            userId: req.user.id,
            title: 'KYC',
            description: 'Your KYC ID proof has been submitted'
        }
        newNotification(doc)

        return res.status(200).json({ 'success': true, 'message': "IDENTITY_DOC_UPLOAD_SUCCESS", 'result': userKycData, usrDoc })
    }
    catch (err) {
        removeKycReqFile(req.files, 'id');
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/** 
 * Update Address Proof
 * URL: /api/kyc/addressproof
 * METHOD : PUT
 * BODY : type, frontImage
*/
export const updateAddressProof = async (req, res) => {
    try {
        let reqBody = req.body,
            reqFile = req.files;

        let kycdoc = await UserKyc.findOne({ "userId": req.user.id }, { "idProof": 1, "addressProof": 1 });
        if (!kycdoc) {
            return res.status(409).json({ 'success': false, 'message': "NO_DATA" })
        }

        if (kycdoc.addressProof.status == 'new' || kycdoc.addressProof.status == 'rejected') {
            removeKycDbFile(kycdoc.addressProof)
            kycdoc.addressProof.type = reqBody.type;
            // kycdoc.addressProof.frontImage = await cloudinaryCtrl.uploadImage(reqFile.frontImage[0].path);
            kycdoc.addressProof.frontImage = req.files.frontImage[0].filename;

            kycdoc.addressProof.status = 'pending';
        } else {
            removeKycReqFile(req.files, 'id');
        }

        let updateUsrKyc = await kycdoc.save();
        let userKycData = {
            addressProof: updateUsrKyc.addressProof,
            updatedAt: updateUsrKyc.updatedAt
        }

        let usrDoc;
        if (updateUsrKyc.idProof.status == 'pending' && updateUsrKyc.addressProof.status == 'pending' && req.user.type == 'basic_pending') {
            let updateUsr = await User.findOneAndUpdate({ "_id": req.user.id }, {
                type: 'basic_submitted'
            }, {
                "new": true,
                "fields": {
                    "_id": 0,
                    "type": 1,
                }
            })

            usrDoc = {
                type: updateUsr.type
            }
        }
        let doc = {
            userId: req.user.id,
            title: 'KYC',
            description: 'Your KYC Address proof has been submitted'
        }
        newNotification(doc)
        return res.status(200).json({ 'success': true, 'message': "ADDRESS_DOC_UPLOAD_SUCCESS", 'result': userKycData, usrDoc })
    }
    catch (err) {
        removeKycReqFile(req.files, 'id');
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/** 
 * Update Kyc Detail
 * URL: /api/kyc
 * METHOD : PUT
 * BODY : firstName,lastName,address,country,state,city,postalCode,type,proofNumber,frontImage,backImage,selfiImage,typeAddress,frontImageAddress
*/
export const updateKyc = async (req, res) => {
    try {
        let reqBody = req.body,
            reqFile = req.files;
        let kycDoc = await UserKyc.findOne({ "userId": req.user.id }, { "idProof": 1, "addressProof": 1 });
        if (!kycDoc) {
            return res.status(409).json({ 'success': false, 'message': "NO_DATA" })
        }

        if ((kycDoc.idProof.status == 'new' || kycDoc.idProof.status == 'rejected') && (kycDoc.addressProof.status == 'new' || kycDoc.addressProof.status == 'rejected')) {
            // removeKycDbFile(idProofDoc.idProof)

            kycDoc.idProof.type = reqBody.type;
            kycDoc.idProof.proofNumber = reqBody.proofNumber;
            kycDoc.idProof.frontImage = await cloudinaryCtrl.uploadImage(reqFile.frontImage[0].path);
            kycDoc.idProof.backImage = reqBody.type == 'passport' ? '' : await cloudinaryCtrl.uploadImage(reqFile.backImage[0].path);
            kycDoc.idProof.selfiImage = await cloudinaryCtrl.uploadImage(reqFile.selfiImage[0].path);
            kycDoc.idProof.status = 'pending';

            kycDoc.addressProof.type = reqBody.type;
            kycDoc.addressProof.frontImage = await cloudinaryCtrl.uploadImage(reqFile.frontImageAddress[0].path);
            kycDoc.addressProof.status = 'pending';

        } else {
            removeKycReqFile(req.files, 'id');
            removeKycReqFile(req.files, 'address');
        }

        let userDoc = await User.findOneAndUpdate({
            "_id": req.user.id
        }, {
            'firstName': reqBody.firstName,
            'lastName': reqBody.lastName,
            'address': reqBody.address,
            'country': reqBody.country,
            'state': reqBody.state,
            'city': reqBody.city,
            'postalCode': reqBody.postalCode,
            'type': "basic_submitted"
        }, {
            "new": true,
            "fields": {
                "_id": 0,
                "firstName": 1,
                "lastName": 1,
                "address": 1,
                "country": 1,
                "state": 1,
                "city": 1,
                "postalCode": 1,
                "type": 1,
            }
        })

        let userKycData = await kycDoc.save();

        let result = {
            updateKyc: userKycData,
            account: userDoc
        }

        return res.status(200).json({ 'success': true, 'message': "IDENTITY_DOC_UPLOAD_SUCCESS", 'result': result })
    }
    catch (err) {
        removeKycReqFile(req.files, 'id');
        removeKycReqFile(req.files, 'address');
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/** 
 * Get All User Kyc Detail
 * URL: /api/kyc/addressproof
 * METHOD : PUT
 * BODY : type, frontImage
*/
export const getAllUserKyc = async (req, res) => {
    try {
        console.log('req.query----', req.query)
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['email', 'idProof.status', 'addressProof.status','phoneNo']);

        let count = await UserKyc.aggregate([
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
                    "phoneCode" : "$userInfo.phoneCode",
                    "phoneNo" : "$userInfo.phoneNo",
                    "email": "$userInfo.email",
                    "type": "$userInfo.type",
                    "userid": "$userInfo.userid",
                    "userId": 1,
                    "idProof": {
                        "type": 1,
                        "proofNumber": 1,
                        "status": 1

                    },
                    "addressProof": {
                        "type": 1,
                        "status": 1
                    },
                }
            },
            { "$match": filter },
        ])

        let data = await UserKyc.aggregate([

            { "$sort": { "_id": -1 } },

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
                    "phoneCode" : "$userInfo.phoneCode",
                    "phoneNo" : "$userInfo.phoneNo",
                    "email": "$userInfo.email",
                    "type": "$userInfo.type",
                    "userid": "$userInfo.userid",
                    "userId": 1,
                    "idProof": {
                        "type": 1,
                        "proofNumber": 1,
                        // "frontImage": 1,
                        "frontImage": {
                            '$concat': [config.SERVER_URL, config.IMAGE.KYC_URL_PATH, "$idProof.frontImage"]
                        },
                        // "backImage": 1,
                        "backImage": {
                            '$concat': [config.SERVER_URL, config.IMAGE.KYC_URL_PATH, "$idProof.backImage"]
                        },
                        // "selfiImage": 1,
                        "selfiImage": {
                            '$concat': [config.SERVER_URL, config.IMAGE.KYC_URL_PATH, "$idProof.selfiImage"]
                        },
                        "panImage": {
                            '$concat': [config.SERVER_URL, config.IMAGE.KYC_URL_PATH, "$idProof.panImage"]
                        },
                        "status": 1
                    },
                    "addressProof": {
                        "type": 1,
                        // "frontImage": 1,
                        "frontImage": {
                            '$concat': [config.SERVER_URL, config.IMAGE.KYC_URL_PATH, "$addressProof.frontImage"]
                        },
                        "status": 1

                    },
                }
            },
            { "$match": filter },
            { "$skip": pagination.skip },
            { "$limit": pagination.limit },
        ])


        let result = {
            data,
            count: count.length,
        }
        console.log('result----', result)
        return res.status(200).json(encodedata({ "success": true, result }))
    }
    catch (err) {
        return res.status(500).json({ 'success': false })
    }
}

/** 
 * Approve User Kyc Doc's
 * URL: /api/kyc/addressproof
 * METHOD : POST
 * BODY : userId, formType(idProof,addressProof)
*/
export const approveUserKyc = async (req, res) => {
    try {
        let reqBody = req.body;
        let checkUser = await User.findOne({ _id: reqBody.userId })
        if (!["idProof", "addressProof"].includes(reqBody.formType)) {
            return res.status(400).json({ "success": false, 'message': "Invalid type" })
        }

        let kycData = await UserKyc.findOne({ "userId": reqBody.userId })
        if (!kycData) {
            return res.status(400).json({ "success": false, 'message': "No Data" })
        }

        if (kycData.status == 'new') {
            return res.status(400).json({ "success": false, 'message': "Upload kyc document" })
        }

        if (kycData.status == 'approved') {
            return res.status(400).json({ "success": false, 'message': "KYC doc's already approved" })
        }

        if (kycData.status == 'rejected') {
            return res.status(400).json({ "success": false, 'message': "KYC doc's was rejected. Please upload new document" })
        }


        if (reqBody.formType == 'idProof') {
            kycData.idProof.status = "approved";
            let doc = {
                userId: reqBody.userId,
                title: 'KYC',
                description: 'Your KYC ID proof has been approved',
            }
            newNotification(doc)
            let content = {
                'notice': doc.description,
                'date': new Date(),
            };
            mailTemplateLang({
                'identifier': 'KYC_APPROVE',
                'toEmail': checkUser.email,
                content
            })
        } else if (reqBody.formType == 'addressProof') {
            kycData.addressProof.status = "approved";
            let doc = {
                userId: reqBody.userId,
                title: 'KYC',
                description: 'Your KYC Address proof has been approved',
            }
            newNotification(doc)
            let content = {
                'notice': `We regret to inform you that after careful review, your recent KYC application with Exchange ONE has not been approved at this time. We encourage you to log in to your account and carefully review the application form. If needed, please update the information accurately and completely before resubmitting.

                If you have any questions or require assistance, our support team is here to help. You can reach us at mailto:support@tossvtoss.com.`,//doc.description,
                'date': new Date(),
            };
            mailTemplateLang({
                'identifier': 'KYC_APPROVE',
                'toEmail': checkUser.email,
                content
            })
        }

        await kycData.save();
        // let doc = {
        //     userId: reqBody.userId,
        //     title: 'KYC',
        //     description: 'Your KYC document has been approved',
        // }
        // newNotification(doc)
        return res.status(200).json({ 'success': true, "message": "KYC document approved successfully" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "Something went worng" })
    }
}

/** 
 * Reject User Kyc Doc's
 * URL: /api/kyc/addressproof
 * METHOD : PUT
 * BODY : userId, formType(idProof,addressProof), reason
*/
export const rejectUserKyc = async (req, res) => {
    try {
        let reqBody = req.body;
        let checkUser = await User.findOne({ _id: reqBody.userId })
        if (!["idProof", "addressProof"].includes(reqBody.formType)) {
            return res.status(400).json({ "success": false, 'message': "Invalid type" })
        }
        let kycData = await UserKyc.findOne({ "userId": reqBody.userId })
        if (!kycData) {
            return res.status(400).json({ "success": false, 'message': "No Data" })
        }

        if (kycData.status == 'new') {
            return res.status(400).json({ "success": false, 'message': "Upload kyc document" })
        }

        if (kycData.status == 'approved') {
            return res.status(400).json({ "success": false, 'message': "KYC doc's already approved" })
        }

        if (kycData.status == 'rejected') {
            return res.status(400).json({ "success": false, 'message': "KYC doc's was rejected. Please upload new document" })
        }


        if (reqBody.formType == 'idProof') {
            kycData.idProof.status = "rejected";
            kycData.idProof.reason = reqBody.reason;
            let doc = {
                userId: reqBody.userId,
                title: 'KYC',
                description: 'Your KYC ID proof has been rejected',
            }
            newNotification(doc)
            let content = {
                'notice': doc.description,
                'date': new Date(),
            };
            mailTemplateLang({
                'identifier': 'KYC_REJECT',
                'toEmail': checkUser.email,
                content
            })
        } else if (reqBody.formType == 'addressProof') {
            kycData.addressProof.status = "rejected";
            kycData.addressProof.reason = reqBody.reason;
            let doc = {
                userId: reqBody.userId,
                title: 'KYC',
                description: 'Your KYC Address proof has been rejected',
            }
            newNotification(doc)
            let content = {
                'notice': doc.description,
                'date': new Date(),
            };
            mailTemplateLang({
                'identifier': 'KYC_REJECT',
                'toEmail': checkUser.email,
                content
            })
        }
        await kycData.save();
        // let doc = {
        //     userId: reqBody.userId,
        //     title: 'KYC',
        //     description: 'Your KYC document has been rejected',
        // }
        // newNotification(doc)
        return res.status(200).json({ 'success': true, "message": "KYC document rejected successfully" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "Something went worng" })
    }
}

/** 
 * get Your Single Kyc Data
 * URL: /adminapi/KycList
 * METHOD : POST
 * BODY : id
*/
export const getKycList = async (req, res) => {
    try {
        let reqBody = req.body
        const UserKyc = await UserKyc.aggregate([{ "$match": { 'userId': ObjectId(reqBody.id) } }])
            if (UserKyc) {
                return res.status(200).json({ "status": true, "result": UserKyc })
                
            }else{
                return res.status(500).json({ "status": false, 'message': "Something went wrong" })
            }
         
    } catch (err) {
        return res.status(500).json({ "status": false, 'message': "Something went wrong" })
     }
}
/** 
 * Change User Type
 * URL: /api/changeUsrType
 * METHOD : PUT
 * PARAMS : userId
*/
export const changeUserType = async (req, res) => {
    try {
        let userData = await User.findOne({ "userid": req.params.userId }, { 'type': 1 })
        if (!userData) {
            return res.status(400).json({ "success": false, 'message': "No Data" })
        }

        if (userData.type == 'basic_processing') {
            userData.type = 'basic';
        } else if (userData.type == 'advanced_processing') {
            userData.type = 'advanced';
        } else if (userData.type == 'pro_processing') {
            userData.type = 'pro';
        }

        await userData.save();
        return res.status(200).json({ 'success': true, "message": "Verification type updated successfully" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "Something went worng" })
    }
}