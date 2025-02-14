// import package
import mongoose from 'mongoose';
import node2fa from 'node-2fa';
import moment from 'moment';
import multer from 'multer';
import path from 'path';

// import modal
import {
    User,
    UserToken,
    UserSetting,
    UserKyc,
    Currency,
    Language,
    Assets,
    SiteSetting,
    Wallet,
    Newsletter,
    SpotTrade,
    PerpetualOrder,
    P2pOrder,
    P2pPost
} from '../models';

import { addPriceCNV } from './priceCNV.controller';

// import controller
import { mailTemplate, mailTemplateLang } from './emailTemplate.controller';
import { createUserKyc } from './userKyc.controller';
import * as binanceCtrl from './binance.controller';
import * as walletCtrl from './wallet.controller';
import * as userReferenceCtrl from './userReference.controller'
import { socketEmitOne } from '../config/socketIO';

// import config
import config from '../config';

// import lib
import { encryptString, decryptString, encodedata, decodedata } from '../lib/cryptoJS';
import * as smsHelper from '../lib/smsGateway';
import * as recaptchaFun from '../lib/recaptcha';
import isEmpty from '../lib/isEmpty';
import { IncCntObjId } from '../lib/generalFun';
import {
    paginationQuery,
    filterSearchQuery
} from '../lib/adminHelpers';
import * as numverify from '../lib/numverify'
import { firstCapitalize } from '../lib/stringCase'
import { imgFilter } from '../lib/imageFilter';
import { findOne, findOneAndUpdate } from '../models/emailtemplate';
import { newNotification } from './notification.controller'
import * as ethCtrl from './coin/eth.controller'
import * as bnbCtrl from './coin/bnb.controller';
import * as tronCtrl from './coin/TronGateway';



// const ObjectId = mongoose.Types.ObjectId;
const { ObjectId } = require('mongoose').Types;
/** 
 * Multer Image Uploade 
*/
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.IMAGE.PROFILE_PATH);
    },
    filename: function (req, file, cb) {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});

let profileUpload = multer({
    storage: profileStorage,
    fileFilter: imgFilter,
    limits: { fileSize: config.IMAGE.PROFILE_SIZE }
}).fields([
    { name: 'profileImage', maxCount: 1 },
])

export const uploadProfile = (req, res, next) => {
    profileUpload(req, res, function (err) {
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
 * Check Mobile
*/
export const checkMobile = async (req, res, next) => {
    try {
        let reqBody = req.body;
        let checkDoc = await User.findOne({ "phoneCode": reqBody.phoneCode, "phoneNo": reqBody.phoneNo });
        if (reqBody.type == 'register' && checkDoc) {
            return res.status(400).json({ "success": false, 'message': "Phone number already exist" })
        } else if (reqBody.type == 'login' && !checkDoc) {
            return res.status(400).json({ "success": false, 'message': "Phone number not exist" })
        }

        return next();
    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/**
 * Sent OTP
 * METHOD : POST
 * URL : /api/sentOtp
 * BODY : phoneCode, phoneNo
*/

export const sentOtp = async (req, res) => {
    try {
        let reqBody = req.body;
        console.log('ysdgfyugdsyfugsdyufgyusdgfyugdsyuf----------')

        if (reqBody.type == 'login') {
            let checkDoc = await User.findOne({ "phoneCode": reqBody.phoneCode, "phoneNo": reqBody.phoneNo });
            if (isEmpty(checkDoc) && reqBody.type == 'forgot') {
                console.log('ysdgfyugdsyfugsdyufgyusdgfyugdsyuf----------')
                return res.status(400).json(encodedata({ "success": false, errors: { phone: 'Phone number not exists' } }));
            }
            if (!checkDoc.authenticate(reqBody.password)) {
                console.log('ysdgfyugdsyfugsdyufgyusdgfyugdsyuf----------')

                return res.status(400).json(encodedata({ 'success': false, 'errors': { 'password': "Password incorrect" } }));
            }
        }
        let checkDoc = await User.findOne({ "phoneCode": reqBody.phoneCode, "phoneNo": reqBody.phoneNo });
        if (isEmpty(checkDoc) && reqBody.type == 'forgot') {
            console.log('ysdgfyugdsyfugsdyufgyusdgfyugdsyuf----------')
            return res.status(400).json(encodedata({ "success": false, errors: { phone: 'Phone number not exists' } }));
        }
        let to = `+${reqBody.phoneCode}${reqBody.phoneNo}`;
        let { smsStatus,message } = await smsHelper.sentOtp(to);
       
        if(message === "Max send attempts reached"){
            console.log('ysdgfyugdsyfugsdyufgyusdgfyugdsyuf----------')

            return res.status(400).json(encodedata({ "success": false, errors: { phoneNo: "Max send attempts reached" } }))
        }
        if(message === " Too many requests") {
            console.log('ysdgfyugdsyfugsdyufgyusdgfyugdsyuf----------')

            return res.status(400).json(encodedata({ "success": false, errors: { phoneNo: "Too many requests" } }))
        }
        if(!smsStatus) {
            console.log('ysdgfyugdsyfugsdyufgyusdgfyugdsyuf----------')

            return res.status(400).json(encodedata({ "success": false, errors: { phoneNo: "Invalid mobile number" } }))
        }
        return res.status(200).json(encodedata({ "success": true, "message": "OTP sent successfully, It is only valid for 10 minutes" }));
    } catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))
    }
}

/** 
 * Create New User
 * URL: /api/register
 * METHOD : POST
 * BODY : formType, email, phonceCode, phoneNo, otp, password, confirmPassword, referenceCode, langCode
*/

export const createNewUser = async (req, res) => {
    try {
        let reqBody = req.body;
        // return false;
        // let recaptcha = await recaptchaFun.checkToken(reqBody.reCaptcha);
        // if (recaptcha && recaptcha.status == false) {
        //     return res.status(500).json({ "success": false, 'message': "Invalid reCaptcha" })
        // }
        let newData = {
            'password': reqBody.password,
        }

        if (reqBody.formType == 'email') {
            reqBody.email = reqBody.email.toLowerCase();
            // console.log('reqBody-----', reqBody);

            let checkUser = await User.findOne(({ 'email': reqBody.email }))

            if (checkUser) {
                return res.status(400).json(encodedata({ 'success': false, 'errors': { 'email': "Email already exists" } }));
            }

            newData['email'] = reqBody.email;

        } else if (reqBody.formType == 'mobile') {
            let checkDoc = await User.findOne({ "phonceCode": reqBody.phoneCode, "phoneNo": reqBody.phoneNo });
            if (checkDoc) {
                return res.status(400).json(encodedata({ "success": false, 'erros': { 'phoneNo': "Phone number already exist" } }))
            }
            let to = `+${reqBody.phoneCode}${reqBody.phoneNo}`;
            let { smsStatus,message } = await smsHelper.verifyOtp(to, reqBody.otp);
            if(message === "Max send attempts reached"){
                return res.status(200).json(encodedata({ "success": false, errors: { phoneNo: "Max send attempts reached" } }))
            }
            else if(message === "Too many requests") {
                return res.status(400).json(encodedata({ "success": false, errors: { phoneNo: "Too many requests" } }))
            }
            else if(!smsStatus) {
                return res.status(400).json(encodedata({ "success": false, errors: { phoneNo: "Invalid mobile number" } }))
            }

            newData['phoneCode'] = reqBody.phoneCode;
            newData['phoneNo'] = reqBody.phoneNo;
            newData['phoneStatus'] = 'verified';
            newData['status'] = 'verified';
        }


        let newUser = new User(newData);
        console.log('newUser-----', newUser)
        newUser.userId = IncCntObjId(newUser._id)

        if (!isEmpty(reqBody.referenceCode)) {
            let referenceDoc = await User.findOne({ "userId": reqBody.referenceCode });
            if (!referenceDoc) {
                return res.status(500).json(encodedata({ "success": false, 'errors': { 'referenceCode': "Invalid referal code" } }))
            }
            newUser.referenceCode = reqBody.referenceCode;
        }

        let newDoc = await newUser.save();

        let walletDoc = await Wallet({
            '_id': newDoc._id,
            'userId': newDoc.userId,
            'assets': []
        }).save()

        let encryptToken = encryptString(newDoc._id, true)
        let content = {
            'email': newDoc.email,
            'confirmMailUrl': `${config.FRONT_URL}/email-verification/${encryptToken}`,
            'date': newDoc.createdAt
        };
        createUserKyc(newDoc._id)
        userReferenceCtrl.newUsrReference(newDoc._id)
        walletCtrl.newUsrWallet(walletDoc, {
            'walletId': newDoc._id,
            'emailId':reqBody.email
        })
        const defaultsetting = await defaultUserSetting(newDoc);
        if(reqBody.formType == 'email'){
            const mailtemplate = await mailTemplateLang({
                'userId': newDoc._id,
                'identifier': 'activate_register_user',
                'toEmail': reqBody.email,
                content
            })
        }
        
        // binanceSubAcc(newDoc, walletDoc)

        // mailTemplate('activate_register_user', reqBody.langCode, reqBody.email, content)
        let message = 'Your account has been registered. Please check your email and enable your account.'
        if (reqBody.formType == 'mobile') {
            message = 'Your account has been registered.'
        }
        return res.status(200).json(encodedata({ "success": true, "message": message }))
    }
    catch (err) {
        console.log("ansdkjnaskdas",err);
        return res.status(500).json(encodedata({ "success": false, 'message': "Something went wrong" }))
    }
}

/** 
 * Set Binance Sub Account
*/
export const binanceSubAcc = async (userData, walletDoc) => {
    try {
        if (isEmpty(userData.binSubAcctId) && isEmpty(userData.binSubAcctEmail)) {
            let subAccount = await binanceCtrl.newSubAcc(userData.userId);
            if (subAccount.status) {
                userData.binSubAcctId = subAccount.subaccountId;
                userData.binSubAcctEmail = subAccount.email;
                await userData.save();

                walletDoc.binSubAcctId = subAccount.subaccountId;
                let updateWallet = await walletDoc.save();
                walletCtrl.newUsrWallet(updateWallet, {
                    'binSubAcctEmail': subAccount.email
                })
            }
        }
        return true
    } catch (err) {
        return false
    }
}

/**
 * Check Deposit
 * METHOD : GET
 * URL : /api/check-deposit
*/
export const checkDeposit = async (req, res) => {
    try {
        let currencyData = await Currency.find({ "status": "active" })
        let userData = await User.findOne({ _id: req.user.id })
        // console.log('balance--------------------', userData)
        if (currencyData && currencyData.length > 0) {
            for (let currency of currencyData) {
                if (currency.type == 'crypto') {
                    // if (currency.coin == "ETH") {
                    //     ethCtrl.deposit(req.user.id)
                    // } else
                    if (currency.coin == "BNB") {
                        bnbCtrl.deposit(userData.userId)
                    }
                }
                if (currency.type == 'token') {
                    if (currency.tokenType == 'bep20') {
                        bnbCtrl.tokenDeposit(userData.userId, currency.coin)
                    }
                    if (currency.tokenType == 'trc20') {
                        tronCtrl.tronTokenDeposit(userData.userId, currency.coin)
                    }
                }
            }
        }
        return res.status({ 'status': true })
    } catch (err) {
        return res.status({ 'status': false })
    }
}

/**
 * Email Verification
 * METHOD : POST
 * URL : /api/confirm-mail 
 * BODY : userId
*/
export const confirmMail = async (req, res) => {
    try {
        let reqBody = req.body;
        let userId = decryptString(reqBody.userId, true)
        let userData = await User.findOne({ "_id": userId });
        if (!userData) {
            return res.status(400).json({ "success": false, 'message': "No user found" })
        }

        if (userData.status == "verified" && userData.emailStatus == "verified") {
            return res.status(400).json({ "success": false, 'message': "Url expired" });
        }

        if (userData.emailStatus == 'verified') {
            return res.status(400).json({ "success": false, 'message': "Your email is already verified" })
        }

        userData.status = 'verified';
        userData.emailStatus = 'verified';

        await userData.save();
        userReferenceCtrl.addChild(userData)
        return res.status(200).json({ 'success': true, 'message': "Your email has been verified, you can now log in" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "Error on server" })
    }
}

/**
 * User Login
 * METHOD : POST
 * URL : /api/login 
 * BODY : email, phoneCode, phoneNo, formType, password, loginHistory, langCode, twoFACode
*/
export const userLogin = async (req, res) => {
    try {

        let reqBody = req.body, checkUser;
        console.log('reqBody-login----', reqBody);
        let isLoginHistory = !isEmpty(req.body.loginHistory)

        if (reqBody.formType == 'email') {
            reqBody.email = reqBody.email.toLowerCase();
            checkUser = await User.findOne({ 'email': reqBody.email })
            if (!checkUser) {
                return res.status(404).json(encodedata({ 'success': false, 'errors': { 'email': "Email not found" } }));
            }

//iprestriction
            if(checkUser?.loginhistory?.length > 0 && !checkUser?.loginhistory?.find((e) => e?.ipaddress == reqBody?.loginHistory?.ipaddress) && reqBody?.reftype != "ipotp" && isEmpty(reqBody.twoFACode)){
                if (!checkUser.authenticate(reqBody.password)) {
                    // loginHistory({ ...reqBody.loginHistory, ...{ "status": 'Failed', "reason": "Password incorrect", "userId": checkUser._id } })
                    return res.status(400).json(encodedata({ 'success': false, 'errors': { 'password': "Password incorrect" } }));
                }
                var otp = Math.floor(Math.random()*(9999-1000+1)+1000);
                var otpupdate = await User.findOneAndUpdate({'_id' : checkUser?._id} , {$set : {
                    otp : otp , otptime : new Date(Date.now())
                }})
                let content = {
                    OTP : otp,
                    date : new Date(Date.now())
                }
                mailTemplate('SEND_OTP' , checkUser.email, content);
                   
                return res.status(200).json(encodedata({ 'success': true, result : "otpsent" , 'message' : "OTP send to your mail id"}))
            }
            
            if(reqBody?.reftype == "ipotp"){
                var checkotp = await User.findOne({
                    _id: checkUser._id,
                    otptime: {
                      $gt: new Date(new Date().getTime() - 300000),
                    },
                    otp: reqBody?.otp,
                  });

                if(!checkotp){
                    return res.status(400).json(encodedata({ 'success': false, 'errors': { 'twoFACode': "INVALID_CODE" }  , 'message' : "OTP is invalid or expired"}))
                }
            }
        } else if (reqBody.formType == 'mobile') {
            checkUser = await User.findOne({ 'phoneCode': reqBody.phoneCode, 'phoneNo': reqBody.phoneNo })
            if (!checkUser) {
                return res.status(404).json(encodedata({ 'success': false, 'errors': { 'phoneNo': "Mobile number not found" } }));
            }
            if (isEmpty(reqBody.twoFACode)&& reqBody?.reftype != "ipotp") {
                let to = `+${reqBody.phoneCode}${reqBody.phoneNo}`;
                let { smsStatus,message } = await smsHelper.verifyOtp(to, reqBody.otp);
                if(message === "Max send attempts reached"){
                    return res.status(400).json(encodedata({ "success": false, errors: { phoneNo: "Max send attempts reached" } }))
                }
                else if(message === "Too many requests") {
                    return res.status(400).json(encodedata({ "success": false, errors: { phoneNo: "Too many requests" } }))
                }
                else if(!smsStatus) {
                    return res.status(400).json(encodedata({ "success": false, errors: { otp: "Invalid OTP or expired" } }))
                }
                else if(!smsStatus) {
                    return res.status(400).json(encodedata({ "success": false, errors: { phoneNo: "Invalid Mobile number" } }))
                }
            }

            // ip restriction 

            if(checkUser?.loginhistory?.length > 0 && !checkUser?.loginhistory?.find((e) => e?.ipaddress == reqBody?.loginHistory?.ipaddress) && reqBody?.reftype != "ipotp" && isEmpty(reqBody.twoFACode)){
                if (!checkUser.authenticate(reqBody.password)) {
                    // loginHistory({ ...reqBody.loginHistory, ...{ "status": 'Failed', "reason": "Password incorrect", "userId": checkUser._id } })
                    return res.status(400).json(encodedata({ 'success': false, 'errors': { 'password': "Password incorrect" } }));
                }
                
                let to = `+${checkUser.phoneCode}${checkUser.phoneNo}`;
                let { smsStatus,message} = await smsHelper.sentOtp(to);
                // client.messages
                // .create({
                //   from: keys.TWILIO_PHONE_NUMBER,
                //   to: tonumber,
                //   body: "Your " + keys.fromName + " OTP Code is: " + otp,
                // })
                if(message === "Max send attempts reached"){
                    return res.status(400).json(encodedata({ "success": false, errors: { phoneNo: "Max send attempts reached" } }))
                }
                else if(message === "Too many requests") {
                    return res.status(400).json(encodedata({ "success": false, errors: { phoneNo: "Too many requests" } }))
                }
                else if(!smsStatus) {
                    return res.status(400).json(encodedata({ "success": false, errors: { otp: "Invalid OTP or expired" } }))
                }
                return res.status(200).json(encodedata({ "success": true, result : "otpsent" , "message": "OTP sent successfully, It is only valid for 10 minutes" }));
            }
            if(reqBody?.reftype == "ipotp"){
                
                let to = `+${checkUser.phoneCode}${checkUser.phoneNo}`;
                let {smsStatus ,message} = await smsHelper.verifyOtp(to , reqBody?.otp); 
                // if(message === "Max send attempts reached"){
                //     return res.status(400).json({ "success": false, errors: { phoneNo: "Max send attempts reached" } })
                // }
                // else if(message === "Too many requests") {
                //     return res.status(400).json({ "success": false, errors: { phoneNo: "Too many requests" } })
                // }
                if(!smsStatus) {
                    return res.status(400).json(encodedata({ "success": false, errors: { invalidip: "Invalid  OTP or expired" } }))
                }
                // return res.status(200).json({ "success": true, "message": "OTP sent successfully, It is only valid for 10 minutes" });
            }

        }

        if (checkUser.status != 'verified') {
            return res.status(400).json(encodedata({ 'success': false, 'message': "Your account still not activated" }));
        }

        if (checkUser.hash == "" && checkUser.hash == "") {
            let encryptToken = encryptString(checkUser._id, true)
            checkUser.mailToken = encryptToken;
            await checkUser.save();
            return res.status(400).json(encodedata({ 'success': false, 'message': "Your Password is Old Please Reset Your Password", "authToken": encryptToken }));
        }
        if (!checkUser.authenticate(reqBody.password)) {
            loginHistory({ ...reqBody.loginHistory, ...{ "status": 'Failed', "reason": "Password incorrect", "userId": checkUser._id } })
            return res.status(400).json(encodedata({ 'success': false, 'errors': { 'password': "Password incorrect" } }));
        }


        if (checkUser.google2Fa && !isEmpty(checkUser.google2Fa.secret)) {
            if (isEmpty(reqBody.twoFACode)) {
                return res.status(200).json(encodedata({ 'success': true, 'status': 'TWO_FA', 'message': "Please Enter Your 2 FA Code" }))
            } else {
                let check2Fa = node2fa.verifyToken(checkUser.google2Fa.secret, reqBody.twoFACode)
                if (!(check2Fa && check2Fa.delta == 0)) {
                    return res.status(400).json(encodedata({ 'success': false, 'errors': { 'twoFACode': "INVALID_CODE" } }))
                }

            }
        }


        //ip restriction
        

        let tokenId = new ObjectId()
        let payloadData = {
            "_id": checkUser._id,
            'uniqueId': checkUser.userId,
            'tokenId': tokenId
        }
        let token = new User().generateJWT(payloadData);
        await UserToken.findOneAndUpdate({ 'userId': checkUser._id, 'userCode': checkUser.userId }, { 'tokenId': tokenId, 'token': token }, { 'upsert': true })
        socketEmitOne('FORCE_LOGOUT', token, checkUser._id)

        if (isLoginHistory) {
            loginHistory({ ...reqBody.loginHistory, ...{ "status": 'Success', "reason": "", "userId": checkUser._id } })
        }

        if (reqBody.formType == 'email') {
            let content = {
                'broswername': reqBody.loginHistory && reqBody.loginHistory.broswername,
                'ipaddress': reqBody.loginHistory && reqBody.loginHistory.ipaddress,
                'countryName': reqBody.loginHistory && reqBody.loginHistory.countryName,
                'date': new Date(),
            };

            mailTemplateLang({
                'userId': checkUser._id,
                'identifier': 'Login_notification',
                'toEmail': checkUser.email,
                content
            })
        }
        let doc = {
            'userId': checkUser._id,
            'title': 'User Login',
            'description': 'Login Successfully',
        }
        newNotification(doc)
        // mailTemplate('Login_notification', reqBody.langCode, checkUser.email, content)
        let result = userProfileDetail(checkUser)
        let userSetting = await UserSetting.findOne({ "userId": checkUser._id }, {
            "_id": 0, "theme": 1, "afterLogin": 1
        })
        console.log('resultresult------',  userSetting);
        return res.status(200).json(encodedata({ 'success': true, 'status': "SUCCESS", 'message': "Login successfully", token, result, userSetting }))

    } catch (err) {
        console.log("errerrerrerr",err);
        return res.status(500).json(encodedata({ "success": false, 'message': "Error on server" }))
    }
}

const loginHistory = async ({
    countryName,
    countryCode,
    ipaddress,
    region, // regionName
    broswername,
    ismobile,
    os,
    status,
    reason,
    userId
}) => {

    let data = {
        countryName,
        countryCode,
        ipaddress,
        regionName: region,
        broswername,
        ismobile,
        os,
        status,
        reason,
    }

    // User.update({ '_id': userId }, {
    //     '$push': {
    //         'loginhistory': data,
    //     },
    // }, (err, data) => { })
    const UserUpdate = await User.updateOne(
        { _id: userId }, 
        {
            $push: {
                loginhistory: data,
            },
        }
    );
}


/**
 * Resend OTP
 * METHOD : POST
 * URL : /api/login 
 * BODY : email, phoneCode, phoneNo, formType, password, loginHistory, langCode, twoFACode
*/
export const resendOTP= async (req, res) => {
    try{
        var email =req.body.email
        let updateData = await User.findOne({ 'email': email})
        var otp = Math.floor(Math.random()*(9999-1000+1)+1000);
        updateData.otp = otp
        updateData.otptime = new Date(Date.now())
        // var otpupdate = await User.findOneAndUpdate({'email': email} , {$set : {
        //     otp : otp , otptime : new Date(Date.now())
        // }})
        await updateData.save()
        let content = {
            OTP : updateData.otp,
            date : new Date(Date.now())
        }
        mailTemplate('SEND_OTP' , updateData.email, content);
           
        return res.status(200).json(encodedata({ 'success': true, result : "otpsent" , 'message' : "OTP send to your mail id"}))
    //     let { smsStatus } = await smsHelper.sentOtp(to);
    
    // if (!smsStatus) {
    //     return res.status(400).json({ "success": false, errors: { phoneNo: "Invalid mobile number" } })
    // }
    // return res.status(200).json({ "success": true, result : "otpsent" , "message": "OTP sent successfully, It is only valid for 10 minutes" });

    }
    
  
    catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'message': "Error on server" }))
    }
}




/**
 * Get User Profile
 * METHOD : GET
 * URL : /api/userProfile
*/
export const getUserProfile = async(req, res) => {
    try{
    const userData = await User.findOne({ "_id": req.user.id })
    if(userData){
        let result = userProfileDetail(userData)
        return res.status(200).json(encodedata({ 'success': true, 'result': result }));
    }else{
        return res.status(500).json(encodedata({ "success": false, 'errors': { 'messages': "Error on server" } }))
    }
}catch(e){
    return res.status(500).json(encodedata({ "success": false, 'errors': { 'messages': "Error on server" } }))
}
    // User.findOne(
    //     { "_id": req.user.id },
    //     (err, userData) => {
    //         if (err) {
    //             return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    //         }
    //         let result = userProfileDetail(userData)

    //         return res.status(200).json({ 'success': true, 'result': result });
    //     }
    // )
}

/**
 * Edit User Profile
 * METHOD : PUT
 * URL : /api/userProfile
 * BODY : firstName,lastName,blockNo,address,country,state,city,postalCode
*/
export const editUserProfile = async (req, res) => {
    try {
        let reqBody = req.body;
        let reqFile = req.files;
        let userData = await User.findOne({ "_id": req.user.id });
        userData.firstName = reqBody.firstName;
        userData.lastName = reqBody.lastName;
        userData.blockNo = reqBody.blockNo;
        userData.address = reqBody.address;
        userData.country = reqBody.country;
        userData.state = reqBody.state;
        userData.city = reqBody.city;
        userData.postalCode = reqBody.postalCode;
        userData.editProfile = 'true'

        // if (reqFile.profileImage && reqFile.profileImage[0] && reqFile.profileImage[0].filename) {
        //     userData.profileImage = reqFile.profileImage[0].filename;
        // }


        let updateUserData = await userData.save();
        let result = userProfileDetail(updateUserData)

        return res.status(200).json({ "success": false, 'message': "PROFILE_EDIT_SUCCESS", 'result': result })
    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

const userProfileDetail = (userData) => {
    let data = {
        'userId': userData.userId,
        'firstName': userData.firstName,
        'lastName': userData.lastName,
        'email': userData.email,
        'profileImage': userData.profileImage ? `${config.SERVER_URL}${userData.profileImage}` : "",
        'blockNo': userData.blockNo,
        'address': userData.address,
        'city': userData.city,
        'state': userData.state,
        'country': userData.country,
        'postalCode': userData.postalCode,
        'emailStatus': userData.emailStatus,
        'phoneStatus': userData.phoneStatus,
        'phoneCode': userData.phoneCode,
        'phoneNo': userData.phoneNo,
        'type': userData.type,
        'twoFAStatus': !isEmpty(userData.google2Fa.secret) ? 'enabled' : 'disabled',
        'createAt': moment(userData.createAt).format('DD MMM YYYY'),
        'loginHistory': (userData.loginhistory && userData.loginhistory.slice(-1).length > 0) ? userData.loginhistory.slice(-1)[0] : {},
        'bankDetail': {},
        "level" : userData.level
    }

    if (userData.bankDetails && userData.bankDetails.length > 0) {
        let bankDetail = userData.bankDetails.find((el => el.isPrimary == true))
        if (bankDetail) {
            data.bankDetail['bankName'] = bankDetail.bankName;
            data.bankDetail['accountNo'] = bankDetail.accountNo;
            data.bankDetail['holderName'] = bankDetail.holderName;
            data.bankDetail['bankcode'] = bankDetail.bankcode;
            data.bankDetail['country'] = bankDetail.country;
            data.bankDetail['city'] = bankDetail.city;
        }
    }

    return data
}

/**
 * Update Bank Detail
 * METHOD : POST
 * URL : /api/bankdetail
 * BODY : bankId, bankName,accountNo,holderName,bankcode,country,city,bankAddress,currencyId
 */
export const updateBankDetail = async (req, res) => {
    try {
        let bankDetailsArr = [], reqBody = req.body;
        let message = '';
        let userData = await User.findOne({ "_id": req.user.id })

        let currencyData = await Currency.findOne({ "_id": reqBody.currencyId });
        if (!currencyData) {
            return res.status(500).json({ "success": false, 'errors': { 'currencyId': "Invalid Currency" } })
        }

        if (!isEmpty(reqBody.bankId) && mongoose.Types.ObjectId.isValid(reqBody.bankId)) {
            let bankData = userData.bankDetails.id(reqBody.bankId);

            if (bankData.isPrimary == false && reqBody.isPrimary == true) {
                let isPrimaryId = userData.bankDetails.find(el => el.isPrimary == true)
                if (isPrimaryId) {
                    let isPrimaryData = userData.bankDetails.id(isPrimaryId);
                    isPrimaryData.isPrimary = false;
                }

            } else if (bankData.isPrimary == true && reqBody.isPrimary == false) {
                reqBody.isPrimary = true;
            }

            bankData.bankName = reqBody.bankName;
            bankData.accountNo = reqBody.accountNo;
            bankData.holderName = reqBody.holderName;
            bankData.bankcode = reqBody.bankcode;
            bankData.country = reqBody.country;
            bankData.city = reqBody.city;
            bankData.bankAddress = reqBody.bankAddress;
            bankData.currencyId = reqBody.currencyId;
            bankData.currencySymbol = currencyData.coin;
            bankData.isPrimary = reqBody.isPrimary;
            message = "BANK_EDIT_SUCCESS"
        } else {
            if (userData.bankDetails && userData.bankDetails.length > 0) {
                bankDetailsArr = userData.bankDetails;

                if (reqBody.isPrimary == true) {
                    let bankDetails = userData.bankDetails.find(el => el.isPrimary == true)
                    let bankData = userData.bankDetails.id(bankDetails._id);
                    bankData.isPrimary = false;
                }

                bankDetailsArr.push({
                    bankName: reqBody.bankName,
                    accountNo: reqBody.accountNo,
                    holderName: reqBody.holderName,
                    bankcode: reqBody.bankcode,
                    country: reqBody.country,
                    city: reqBody.city,
                    bankAddress: reqBody.bankAddress,
                    currencyId: reqBody.currencyId,
                    currencySymbol: currencyData.coin,
                    isPrimary: reqBody.isPrimary
                })
            } else {
                bankDetailsArr.push({
                    bankName: reqBody.bankName,
                    accountNo: reqBody.accountNo,
                    holderName: reqBody.holderName,
                    bankcode: reqBody.bankcode,
                    country: reqBody.country,
                    city: reqBody.city,
                    bankAddress: reqBody.bankAddress,
                    currencyId: reqBody.currencyId,
                    currencySymbol: currencyData.coin,
                    isPrimary: true
                })
            }
            userData.bankDetails = bankDetailsArr;
            message = 'BANK_ADD_SUCCESS'
        }

        let updateData = await userData.save();

        return res.status(200).json({ 'success': true, 'message': message, 'result': updateData.bankDetails })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/**
 * GET Bank Detail
 * METHOD : GET
 * URL : /api/bankdetail
 */
export const getBankDetail = async(req, res) => {
    try{
    const userData = await User.findOne(
        { "_id": req.user.id },
        {
            "bankDetails._id": 1,
            "bankDetails.bankName": 1,
            "bankDetails.holderName": 1,
            "bankDetails.accountNo": 1,
            "bankDetails.bankcode": 1,
            "bankDetails.country": 1,
            "bankDetails.city": 1,
            "bankDetails.bankAddress": 1,
            "bankDetails.currencyId": 1,
            "bankDetails.currencySymbol": 1,
            "bankDetails.isPrimary": 1
        })
        if(userData){
            return res.status(200).json({ 'success': true, 'message': "Success", 'result': userData.bankDetails })
        }else{
            return res.status(500).json({ "success": false, 'message': "Error on server" })
        }
    }catch(e){
        return res.status(500).json({ "success": false, 'message': "Error on server" })
    }
    // User.findOne(
    //     { "_id": req.user.id },
    //     {
    //         "bankDetails._id": 1,
    //         "bankDetails.bankName": 1,
    //         "bankDetails.holderName": 1,
    //         "bankDetails.accountNo": 1,
    //         "bankDetails.bankcode": 1,
    //         "bankDetails.country": 1,
    //         "bankDetails.city": 1,
    //         "bankDetails.bankAddress": 1,
    //         "bankDetails.currencyId": 1,
    //         "bankDetails.currencySymbol": 1,
    //         "bankDetails.isPrimary": 1
    //     }, (err, userData) => {
    //         if (err) {
    //             return res.status(500).json({ "success": false, 'message': "Error on server" })
    //         }
    //         return res.status(200).json({ 'success': true, 'message': "Success", 'result': userData.bankDetails })
    //     }
    // )
}

/**
 * Delete Bank Detail
 * METHOD : PUT
 * URL : /api/bankdetail
 * BODY : bankId
*/
export const deleteBankDetail = async (req, res) => {
    try {
        let reqBody = req.body;
        let userData = await User.findOne({ "_id": req.user.id })

        let bankDataRemove = userData.bankDetails.id(reqBody.bankId);

        if (bankDataRemove.isPrimary) {
            let bankDetails = userData.bankDetails.find(el => el._id.toString() != reqBody.bankId)
            if (bankDetails) {
                let bankData = userData.bankDetails.id(bankDetails._id);
                bankData.isPrimary = true;
            }
        }

        bankDataRemove.remove();
        let updateData = await userData.save();

        return res.status(200).json({ 'success': true, 'message': "BANK_DELETE_SUCCESS", 'result': updateData.bankDetails })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/**
 * Set Primary Bank 
 * METHOD : PATCH
 * URL : /api/bankdetail
 * BODY : bankId
*/
export const setPrimaryBank = async (req, res) => {
    try {
        let reqBody = req.body;
        let userData = await User.findOne({ "_id": req.user.id })

        let bankData = userData.bankDetails.id(reqBody.bankId);
        if (!bankData) {
            return res.status(400).json({ "success": false, 'message': "NO_DATA" })
        }

        if (!bankData.isPrimary) {
            let isPrimaryId = userData.bankDetails.find(el => el.isPrimary == true)
            if (isPrimaryId) {
                let isPrimaryData = userData.bankDetails.id(isPrimaryId);
                isPrimaryData.isPrimary = false;
            }
            bankData.isPrimary = true;
        }

        let updateData = await userData.save();

        return res.status(200).json({ 'success': true, 'message': "BANK_SET_PRIMARY_SUCCESS", 'result': updateData.bankDetails })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/**
 * Change New Password
 * METHOD : POST
 * URL : /api/changePassword
 * BODY : password, confirmPassword, oldPassword
*/
export const changePassword = async (req, res) => {
    try {
        let reqBody = req.body;
        let chackStatus = await UserSetting.findOne({ userId: req.user.id })
        let userData = await User.findOne({ "_id": req.user.id });
        if (!userData) {
            return res.status(500).json(encodedata({ "success": false, 'message': "User not found" }))
        }
        if (reqBody.oldPassword) {
            if (reqBody.oldPassword === reqBody.password) {
                return res.status(400).json(encodedata({ 'success': false, 'message': "Old and New password must be different" }))

            }
        }
        if (!userData.authenticate(reqBody.oldPassword)) {
            return res.status(400).json(encodedata({ 'success': false, 'errors': { 'oldPassword': "PASSWORD_INCORRECT" } }))
        }
        userData.password = reqBody.password;
        await userData.save();


        //Notification Checked Conditon

        let usrSetting = await UserSetting.findOne({ "userId": req.user.id }, { "createdAt": 0, "updatedAt": 0 })
        if (usrSetting.passwordChange == true) {
            let encryptToken = encryptString(userData._id, true)
            userData.newEmailToken = encryptToken;
            // await userData.save();

            let content = {
                // 'confirmMailUrl': `${config.FRONT_URL}/Change_Password/${encryptToken}`,
                'date': new Date()
            };
            if (chackStatus.passwordChange == true) {
                mailTemplateLang({
                    'userId': userData._id,
                    'identifier': 'Change_Password',
                    'toEmail': userData.email,
                    content
                })
            }

        }

        let doc = {
            'userId': req.user.id,
            'title': 'Change password ',
            'description': 'Your password has been updated',
        }
        newNotification(doc)
        return res.status(200).json(encodedata({ 'success': true, 'message': "PASSWORD_CHANGE_SUCCESS" }));
    }
    catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))
    }
}

/**
 * Get 2FA Code
 * METHOD : GET
 * URL : /api/security/2fa
 */
export const get2faCode = async (req, res) => {
    try{
    let result = {};
    const userData = await  User.findOne({ "_id": req.user.id })
    console.log("asdsadsadasdas",userData,req.user.id,req.user);
    if(userData){
        let result = await generateTwoFa(userData)
        console.log("result generateTwoFa",result);
        return res.status(200).json({ 'success': true, 'result': result })
    }else{
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}catch(e){
    return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })  
}
    // User.findOne(
    //     { "_id": req.user.id },
    //     (err, userData) => {
    //         if (err) {
    //             return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    //         }
    //         let result = generateTwoFa(userData)
    //         return res.status(200).json({ 'success': true, 'result': result })
    //     }
    // )
}

/**
 * Update 2FA Code
 * METHOD : PUT
 * URL : /api/security/2fa
 * BODY : code, secret, uri
 */
export const update2faCode = async (req, res) => {
    try {
        let reqBody = req.body;
        let userData = await User.findOne({ _id: req.user.id })
        let chackStatus = await UserSetting.findOne({ userId: req.user.id })
        let check2Fa = node2fa.verifyToken(reqBody.secret, reqBody.code)
        if (check2Fa && check2Fa.delta == 0) {
            let updateData = await User.findOneAndUpdate(
                { "_id": req.user.id },
                {
                    "google2Fa.secret": reqBody.secret,
                    "google2Fa.uri": reqBody.uri,
                },
                { "new": true }
            )
            let result = generateTwoFa(updateData)
            if (chackStatus.twoFA == true) {
                let content = {
                    'date': new Date(),
                    'status': "enable"
                };
                mailTemplateLang({

                    'userId': req.user.id,
                    'identifier': 'CHANGE_2FA',
                    'toEmail': userData.email,
                    content
                })
            }

            let doc = {
                'userId': req.user.id,
                'title': '2FA',
                'description': 'Your 2FA has been enabled',
            }
            newNotification(doc)

            return res.status(200).json({ 'success': true, 'message': "TWO_FA_ENABLE_SUCCESS", result })
        }

        return res.status(400).json({ 'success': false, 'errors': { 'code': "INVALID_CODE" } })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/**
 * Disable 2FA Code
 * METHOD : PATCH
 * URL : /api/security/2fa
 * Body : code, secret, uri
 */
export const diabled2faCode = async (req, res) => {
    try {
        let reqBody = req.body;
        let userData = await User.findOne({ "_id": req.user.id })
        let chackStatus = await UserSetting.findOne({ userId: req.user.id })
        if (userData.google2Fa && userData.google2Fa.secret != reqBody.secret) {
            return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
        }

        let check2Fa = node2fa.verifyToken(reqBody.secret, reqBody.code)
        if (check2Fa && check2Fa.delta == 0) {
            userData.google2Fa.secret = '';
            userData.google2Fa.uri = '';
            let updateData = await userData.save();
            let result = generateTwoFa(updateData)

            if (chackStatus.twoFA == true) {
                let content = {
                    'date': new Date(),
                    'status': "disable"
                };
                mailTemplateLang({
                    'userId': req.user.id,
                    'identifier': 'CHANGE_2FA',
                    'toEmail': userData.email,
                    content
                })
            }
            let doc = {
                'userId': req.user.id,
                'title': '2FA',
                'description': ' Your 2FA has been disabled',
            }
            newNotification(doc)
            return res.status(200).json({ 'success': true, 'message': "TWO_FA_DISABLE_SUCCESS", result })
        }
        return res.status(400).json({ 'success': false, 'errors': { 'code': "INVALID_CODE" } })

    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

export const generateTwoFa = async (userData) => {
    let result = {}
    const QRCode = require('qrcode');
    if (userData && userData.google2Fa.secret != "") {
        //config.NODE_TWOFA.QR_IMAGE + 
        // console.log("userData.google2Fa",userData.google2Fa);
        // let newSecret = node2fa.generateSecret({ 'name': config.NODE_TWOFA.NAME, 'account': userData.email })
        // console.log("newSecretgenerateSecret node2fa",newSecret);
        // const GenORcode = await QRCode.toDataURL(newSecret.uri)
        GenORcode   // if(GenORcode){
        //     result = {
        //         secret:  userData.google2Fa.secret,
        //         imageUrl:GenORcode, 
        //         uri: userData.google2Fa.uri,
        //         twoFaStatus: "enabled"
        //     };  
        // }


        const newSecret = node2fa.generateSecret({
            name: config.NODE_TWOFA.NAME,
            account: userData.email
        });
        const decodedURI = decodeURIComponent(newSecret.uri);

        console.log("Decoded URI:", decodedURI);
        if (!decodedURI.startsWith('otpauth://totp/')) {
            throw new Error("Invalid URI format.");
        }

        const GenORcode = await QRCode.toDataURL(decodedURI);

        if (GenORcode) {
             result = {
                secret: userData.google2Fa.secret,
                imageUrl: GenORcode,
                uri: userData.google2Fa.uri,
                twoFaStatus: "enabled"
            };
            console.log("Result:", result);
        }


        // result = {
        //     secret: userData.google2Fa.secret,
        //     imageUrl: userData.google2Fa.uri,
        //     uri: userData.google2Fa.uri,
        //     twoFaStatus: "enabled"
        // }
    } else {
        // let newSecret = node2fa.generateSecret({ 'name': config.NODE_TWOFA.NAME, 'account': userData.email })
        // console.log("newSecretgenerateSecret node2fa",newSecret);
        // const GenORcode = await QRCode.toDataURL(newSecret.uri)
        // if(GenORcode){
        //     result = {
        //         secret: newSecret.secret,
        //         imageUrl:GenORcode, 
        //         uri: newSecret.uri,
        //         twoFaStatus: "disabled"
        //     };  
        // }

        const newSecret = node2fa.generateSecret({
            name: config.NODE_TWOFA.NAME,
            account: userData.email
        });
        const decodedURI = decodeURIComponent(newSecret.uri);

        // console.log("Decoded URI:", decodedURI);
        // if (!decodedURI.startsWith('otpauth://totp/')) {
        //     throw new Error("Invalid URI format.");
        // }        console.log("Decoded URI:", decodedURI);
        if (!decodedURI.startsWith('otpauth://totp/')) {
            throw new Error("Invalid URI format.");
        }

        const GenORcode = await QRCode.toDataURL(decodedURI);

        if (GenORcode) {
             result = {
                secret: newSecret.secret,
                imageUrl:GenORcode, 
                uri: newSecret.uri,
                twoFaStatus: "disabled"
            };
            console.log("Result:", result);
        }

        // QRCode.toDataURL(newSecret.uri, (err, imageUrl) => {
        //     if (err) {
        //         console.error("Error generating QR Code:", err);
        //     } else {
        //         result = {
        //             secret: newSecret.secret,
        //             imageUrl, // QR code as a data URL
        //             uri: newSecret.uri,
        //             twoFaStatus: "disabled"
        //         };
        //         console.log("Result:", result);
        //     }
        // });
        // result = {
        //     secret: newSecret.secret,
        //     imageUrl: newSecret.qr,
        //     uri: newSecret.uri,
        //     twoFaStatus: "disabled"
        // }
    }
    console.log("result Qr Node 2fa",result);
    return result;
}

export const defaultUserSetting = async (userData) => {
    if (!isEmpty(userData)) {
        try {
            let newSetting = new UserSetting({
                "userId": userData._id
            });

            let currencyData = await Currency.find({ "type": "crypto"})
            if (currencyData.length > 0) {
                newSetting.currencySymbol = currencyData[1].coin;
            }

            let languageData = await Language.findOne({ "isPrimary": true })
            if (languageData) {
                newSetting.languageId = languageData._id;
            }
            const newsettingSave = await newSetting.save();
            return true
        } 
        catch(err) {
            return false
        }
    }
}

/** 
 * Get User setting
 * METHOD : GET
 * URL: /api/userSetting
*/
export const getUserSetting = async (req, res) => {
    try{
    const data = await  UserSetting.findOne({ "userId": req.user.id }, { "_id": 0, "createdAt": 0, "updatedAt": 0, })
    if(data){
        return res.status(200).json(encodedata({ 'success': true, 'message': "FETCH_SUCCESS", result: data }))
    }else{
        return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))   
    }
}catch(e){
    return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))
}
    // UserSetting.findOne({ "userId": req.user.id }, { "_id": 0, "createdAt": 0, "updatedAt": 0, }, (err, data) => {
    //     if (err) {
    //         return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    //     }
    //     return res.status(200).json({ 'success': true, 'message': "FETCH_SUCCESS", result: data })
    // })
}

/**
 * Edit User Setting
 * METHOD : PUT
 * URL : /api/userSetting
 * BODY : languageId, theme, currencySymbol, timeZone(name,GMT), afterLogin(page,url)
 */
export const editUserSetting = async (req, res) => {
    let reqBody = req.body;
    // console.log('reqBodyreqBody----', reqBody, req.user);
    try{
    const UpdateUserSetting = await UserSetting.findOneAndUpdate(
        { "userId": req.user.id },
        {
            // "languageId": reqBody.languageId,
            "theme": reqBody.theme,
            "currencySymbol": reqBody.currencySymbol,
            // "timeZone": reqBody.timeZone,
            "afterLogin": reqBody.afterLogin,
        },
        {
            "fields": { "_id": 0, "createdAt": 0, "updatedAt": 0 },
            "new": true
        })
        // console.log('UpdateUserSetting-----', UpdateUserSetting);
    if (UpdateUserSetting) {
        return res.status(200).json(encodedata({ 'success': true, 'message': "EDIT_SETTING_SUCCESS", result: UpdateUserSetting }))
    }else{
        return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))
    }
}catch(e){
    return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))
}
}
    

/**
 * Edit User Notification
 * METHOD : PUT
 * URL : /api/editNotif
 * BODY : name, checked
 */
export const editNotif = async (req, res) => {
    try {
        let reqBody = req.body;
        let usrSetting = await UserSetting.findOne({ "userId": req.user.id }, { "createdAt": 0, "updatedAt": 0 })

        if (!usrSetting) {
            return res.status(400).json({ "success": false, 'message': "NO_DATA" })
        }

        if (reqBody.name in usrSetting) {
            usrSetting[reqBody.name] = reqBody.checked;

        }
        let updateData = await usrSetting.save();

        let result = {
            currencySymbol: updateData.currencySymbol,
            theme: updateData.theme,
            afterLogin: updateData.afterLogin,
            languageId: updateData.languageId,
            timeZone: updateData.timeZone,
            twoFA: updateData.twoFA,
            passwordChange: updateData.passwordChange,
            siteNotification: updateData.siteNotification,
            sellVacation: updateData.sellVacation,
            buyVacation: updateData.buyVacation,
        }
        let message;

        if (reqBody.name == 'twoFA') {
            message = reqBody.checked ? '2FA Alert Enabled Successfully' : '2FA Alert Disabled Successfully'
        } else if (reqBody.name == 'passwordChange') {
            message = reqBody.checked ? 'Login Password Alert Enabled Successfully' : 'Login Password Alert Disabled Successfully'
        }

        return res.status(200).json({ 'success': true, 'message': message, result })

    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/**
 * Check Forgot Password
 * METHOD : POST
 * URL : /api/forgotPassword
 * BODY : email, reCaptcha
*/
export const checkForgotPassword = async (req, res) => {
    try {
        console.log('usdghhhhhhhhhhhhhsssssssssssss--------1111111')

        let reqBody = req.body;

        // if(reqBody.email === ""){
        //     return res.status(400).json(encodedata({ "success": false, 'errors': { 'email': "Email is required" }  }));
        // }

        if (reqBody.type == 'mobile') {
            let checkDoc = await User.findOne({ "phoneCode": reqBody.phoneCode, "phoneNo": reqBody.phoneNo });
            let to = `+${reqBody.phoneCode}${reqBody.phoneNo}`;
            let { smsStatus } = await smsHelper.verifyOtp(to, reqBody.otp);
            if (!smsStatus) {
                return res.status(400).json(encodedata({ "success": false, errors: { otp: 'invalid OTP' } }));
            }
            let encryptToken = encryptString(checkDoc._id, true)
            if (!isEmpty(encryptToken)) {
                checkDoc.mailToken = encryptToken;
                await checkDoc.save();
            }
            if (smsStatus === true) {
                return res.status(200).json(encodedata({ "success": true, message: 'success', result: encryptToken }))
            }

        }
        if (reqBody.type == 'email') {
            console.log('usdghhhhhhhhhhhhhsssssssssssss--------')
            let userData = await User.findOne({ "email": reqBody.email });
            if (!userData) {
                return res.status(400).json(encodedata({ "success": false, 'errors': { 'email': "EMAIL_NOT_EXISTS" } }))
            }

            let recaptcha = await recaptchaFun.checkToken(reqBody.reCaptcha);
            if (recaptcha && recaptcha.status && recaptcha.status == false) {
            console.log('usdghhhhhhhhhhhhhsssssssssssss--------')

                return res.status(500).json(encodedata({ "success": false, 'message': "Invalid reCaptcha" }))
            }
            let encryptToken = encryptString(userData._id, true)
            let content = {
                'name': userData.firstName,
                'confirmMailUrl': `${config.FRONT_URL}/reset-password/${encryptToken}`
            }

            userData.mailToken = encryptToken;
            await userData.save();
            mailTemplateLang({
                'userId': userData._id,
                'identifier': 'User_forgot',
                'toEmail': userData.email,
                content
            })

            return res.status(200).json(encodedata({ 'success': true, "message": "Confirmation Link Sent to Your Mail" }))
        }


    } catch (err) {
        console.log('usdghhhhhhhhhhhhhsssssssssssss--------')

        return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))
    }
}

/**
 * Reset Password
 * METHOD : POST
 * URL : /api/resetPassword
 * BODY : password, confirmPassword, authToken
*/
export const resetPassword = async (req, res) => {
    try {
        let reqBody = req.body;
        let userId = decryptString(reqBody.authToken, true)
        let userData = await User.findOne({ "_id": userId });
        if (!userData) {
            return res.status(500).json(encodedata({ "success": false, 'message': "NOT_FOUND" }))
        }

        if (!(userData.mailToken == reqBody.authToken)) {
            return res.status(400).json(encodedata({ "success": false, 'message': "Your link was expiry" }))
        }

        userData.password = reqBody.password;
        userData.mailToken = '';
        await userData.save();

        return res.status(200).json(encodedata({ 'success': true, "message": "Updated successfully" }))
    }
    catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'message': "SOMETHING_WRONG" }))
    }
}

/** 
 * User Upgrade
 * METHOD : POST
 * URL : /api/upgradeUser
 * BODY : upgradeType(basic,advanced,pro)
*/
export const upgradeUser = async (req, res) => {
    try {
        let reqBody = req.body;
        let userData = await User.findOne({ '_id': req.user.id });
        if (!userData) {
            return res.status(400).json({ 'success': false, 'message': "NO_DATA" })
        }

        let usrKyc = await UserKyc.findOne({ 'userId': req.user.id }, { "idProof": 1, "addressProof": 1 })

        if (!usrKyc) {
            return res.status(400).json({ 'success': false, 'message': "NO_DATA" })
        }

        if (usrKyc && usrKyc.idProof.status == 'approved' && usrKyc.addressProof.status == 'approved') {

            if (userData.type == 'not_activate' && ['advanced', 'pro'].includes(reqBody.upgradeType)) {
                return res.status(400).json({ 'success': false, 'message': "You should first verify the BASIC suer account" })
            } else if (userData.type == 'basic' && ['pro'].includes(reqBody.upgradeType)) {
                return res.status(400).json({ 'success': false, 'message': "You should first verify the Basic and the Advanced user account" })
            } else if (['basic_processing', 'advanced_processing', 'pro_processing'].includes(userData.type)) {
                return res.status(400).json({ 'success': false, 'message': "Your request are procesing" })
            } else if (userData.type == 'not_activate' && reqBody.upgradeType == 'basic') {
                userData.type = 'basic_processing';
                let updateDoc = await userData.save();

                let result = userProfileDetail(updateDoc)
                return res.status(200).json({ 'success': true, 'message': 'Successfully submitted', result })
            } else if (userData.type == 'basic' && reqBody.upgradeType == 'advanced') {
                userData.type = 'advanced_processing';
                let updateDoc = await userData.save();

                let result = userProfileDetail(updateDoc)
                return res.status(200).json({ 'success': true, 'message': 'Successfully submitted', result })
            } else if (userData.type == 'advanced' && reqBody.upgradeType == 'pro') {
                userData.type = 'pro_processing';
                let updateDoc = await userData.save();

                let result = userProfileDetail(updateDoc)
                return res.status(200).json({ 'success': true, 'message': 'Successfully submitted', result })
            }
        }

        return res.status(400).json({ 'success': false, 'message': 'Please verify the kyc' })

    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/**
 * Change New Phone
 * METHOD : POST
 * URL : /api/phoneChange
 * BODY : newPhoneCode, newPhoneNo
*/
export const changeNewPhone = async (req, res) => {
    try {
        let
            reqBody = req.body,
            smsOtp = Math.floor(100000 + Math.random() * 900000);

        // let numValidation = await numverify.validation(reqBody.newPhoneCode + reqBody.newPhoneNo);
        // if (!numValidation.valid) {
        //     return res.status(400).json({ "success": false, 'errors': { 'newPhoneNo': "Incorrect format" } })
        // }

        let checkUser = await User.findOne({ "phoneCode": reqBody.newPhoneCode, "phoneNo": reqBody.newPhoneNo })
        if (checkUser) {
            if (checkUser._id.toString() != req.user.id) {
                return res.status(400).json({ "success": false, 'errors': { 'newPhoneNo': "Phone number already exists" } })
            }
            if (checkUser._id.toString() == req.user.id) {
                return res.status(400).json({ "success": false, 'errors': { 'newPhoneNo': "Matched your previous mobile number" } })
            }
        }

        let siteSetting = await SiteSetting.findOne({}, { 'siteName': 1 });
        if (!siteSetting) {
            return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
        }

        let smsContent = {
            to: `+${reqBody.newPhoneCode}${reqBody.newPhoneNo}`,
            body: `${firstCapitalize(siteSetting.siteName)}Verification Code: ${smsOtp}`
            // body: `${firstCapitalize(siteSetting.siteName)}Verification Code: 11111`
        }
        const ot = `+${reqBody.newPhoneCode}${reqBody.newPhoneNo}`
        await User.updateOne(
            {
                "_id": req.user.id
            },
            {
                "newPhone": {
                    "phoneCode": reqBody.newPhoneCode,
                    "phoneNo": reqBody.newPhoneNo,
                },
                // "otp": smsOtp,
                // "otptime": new Date()
            }
        )
        let { smsStatus,message } = await smsHelper.sentOtp(ot);
        if(message === "Max send attempts reached"){
            return res.status(400).json({ "success": false, errors: { phoneNo: "Max send attempts reached" } })
        }
      
        else if(message === "Too many requests") {
            return res.status(400).json({ "success": false, errors: { phoneNo: "Too many requests" } })
        }
        else if(!smsStatus) {
            return res.status(400).json({ "success": false, errors: { phoneNo: "Invalid mobile number" } })
        }

       
        return res.status(200).json({ "success": true, "message": "OTP sent successfully, It is only valid for 10 minutes" })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/**
 * Verify New Phone
 * METHOD : PUT
 * URL : /api/phoneChange
 * BODY : newPhoneCode, newPhoneNo, otp
*/
export const verifyNewPhone = async (req, res) => {
    try {
        let reqBody = req.body, otpTime = new Date(new Date().getTime() - 600000); //2 min
        let userData = await User.findOne({ "_id": req.user.id });
         var phoneCode = userData.newPhone.phoneCode;
       var phoneNo = userData.newPhone.phoneNo;
        const ot = `+${phoneCode}${phoneNo}`
        const otp = reqBody.otp;
        let { smsStatus } = await smsHelper.verifyOtp(ot , otp);
        if(smsStatus){
            userData.phoneCode = userData.newPhone.phoneCode;
        userData.phoneNo = userData.newPhone.phoneNo;
        userData.newPhone.phoneCode = '';
        userData.newPhone.phoneNo = '';
        userData.otp = '';
        userData.phoneStatus = 'verified';
            var responseData = {
                    'newPhoneCode':userData.newPhone.phoneCode,
                    'newPhoneNo':userData.newPhone.phoneNo
            }
        let updateUserData = await userData.save();
            return res.status(200).json({ 'success': true, 'message': "Mobile number verified", 'result': responseData })
        }
        else{
            return res.status(400).json({ "success": false, 'errors': { 'otp': "Invalid OTP" } })
        }

        // if (userData.otptime <= otpTime) {
        //     return res.status(400).json({ "success": false, 'errors': { 'otp': "Expiry OTP" } })
        // }

        // if (userData.otp != reqBody.otp) {
        //     return res.status(400).json({ "success": false, 'errors': { 'otp': "Invalid OTP" } })
        // }

        // if (userData.newPhone.phoneCode == '' || userData.newPhone.phoneNo == '') {
        //     return res.status(400).json({ "success": false, 'errors': { 'otp': "Invalid new phone" } })
        // }

        // if (userData.newPhone.phoneCode != reqBody.newPhoneCode || userData.newPhone.phoneNo != reqBody.newPhoneNo) {
        //     return res.status(400).json({ "success": false, 'errors': { 'newPhoneNo': "Phone number is invalid" } })
        // }

        // let checkUser = await User.findOne({ "phoneCode": userData.newPhone.phoneCode, "phoneNo": userData.newPhone.phoneNo, "_id": { "$ne": req.user.id } })
        // if (checkUser) {
        //     return res.status(401).json({ "success": false, 'message': "Phone number already exists" })
        // }


        // userData.phoneCode = userData.newPhone.phoneCode;
        // userData.phoneNo = userData.newPhone.phoneNo;
        // userData.newPhone.phoneCode = '';
        // userData.newPhone.phoneNo = '';
        // userData.otp = '';
        // userData.phoneStatus = 'verified';

        // let updateUserData = await userData.save();

        // let responseData = {
        //     'phoneCode': updateUserData.phoneCode,
        //     'phoneNo': updateUserData.phoneNo,
        //     'phoneStatus': updateUserData.phoneStatus,
        // }
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}


/**
 * Get User List
 * METHOD : Get
 * URL : /adminapi/user
*/
export const getUserList = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['email', 'status' , 'phoneNo']);

        let count = await User.countDocuments(filter)
        let data = await User.find(filter, {
            '_id': 1,
            'userId': 1,
            'email': 1,
            'phoneCode': 1,
            'phoneNo': 1,
            'google2Fa.secret': 1,
            'emailStatus': 1,
            'phoneStatus': 1,
            'binSubAcctId': 1,
            'binSubAcctEmail': 1,
            'status': 1,
            'createdAt': 1,
        }).sort({ '_id': -1 }).skip(pagination.skip).limit(pagination.limit).populate({
            path: 'wallet',
            select: {
                'assets.address': 1,
                'assets.coin': 1,
                'assets.derivativeBal': 1,
                'assets.destTag': 1,
                'assets.spotBal': 1,
                'assets._id': 1,
                'assets.p2pBal': 1,
                'userId': 1,
                '_id': 0
            },
        })

        let result = {
            count,
            data
        }
        // console.log('result-----', result)
        return res.status(200).json(encodedata({ 'success': true, "messages": "success", result }))
    } catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'message': "error on server" }))
    }
}

/**
 * Get Balance List
 * METHOD : Get
 * URL : /adminapi/getUserBalanceList
*/
export const getUserBalanceList = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['currencySymbol']);
        let count = await Assets.countDocuments(filter);

        let data = await Assets.find(filter, {
            'currencySymbol': 1,
            "spotwallet": 1,
            "derivativeWallet": 1,
            'userId': 1,
            'createdAt': 1,

        }).skip(pagination.skip).limit(pagination.limit)


        let result = {
            count: count,
            data
        }


        return res.status(200).json({ "success": true, "messages": "success", result })

    } catch (err) {
        res.status(500).json({ "success": false, 'message': "error on server" })

    }

}

/**
 * Change Email
 * METHOD : POST
 * URL : /api/emailChange
 * BODY : newEmail
*/
export const editEmail = async (req, res) => {
    try {
        let reqBody = req.body;
        let Details = await User.findOne({_id:req.user.id})
        if(!Details.email){
            let checkUser = await User.findOne({ "email": reqBody.newEmail })
            // let checkUser = await User.findOne({ "email": reqBody.newEmail, "_id": { "$ne": req.user.id } })
            if (checkUser) {
                return res.status(400).json({ "success": false, 'errors': { 'newEmail': "Email already exists" } })
            }
            let encryptToken = encryptString(req.user.id, true)
            let userData = await User.findOneAndUpdate(
                {
                    "_id": req.user.id
                },
                {
                    "email": reqBody.newEmail,
                    "mailToken": encryptToken
                },
                {
                    "new": true
                }
            )
            let content = {
                'email': reqBody.newEmail,
                'confirmMailUrl': `${config.FRONT_URL}/email-verification/${encryptToken}`,
                'date': Details.createdAt
            };
            mailTemplateLang({
                'userId': req.user.id,
                'identifier': 'activate_register_user',
                'toEmail': reqBody.newEmail,
                content
            })
            return res.status(200).json({ "success": true, "message": "Verification link sent to your email address." })
        }
        else{
            let checkUser = await User.findOne({ "email": reqBody.newEmail })
            // let checkUser = await User.findOne({ "email": reqBody.newEmail, "_id": { "$ne": req.user.id } })
            if (checkUser) {
                return res.status(400).json({ "success": false, 'errors': { 'newEmail': "Email already exists" } })
            }
    
            let encryptToken = encryptString(req.user.id, true)
            let userData = await User.findOneAndUpdate(
                {
                    "_id": req.user.id
                },
                {
                    "newEmail": reqBody.newEmail,
                    "newEmailToken": encryptToken
                },
                {
                    "new": true
                }
            )
            let content = {
                'confirmMailUrl': `${config.FRONT_URL}/verify-old-email/${encryptToken}`,
                'date': new Date()
            };
            mailTemplateLang({
                'userId': userData._id,
                'identifier': 'change_register_email',
                'toEmail': userData.email,
                content
            })
    
            return res.status(200).json({ "success": true, "message": "Verification link sent to your old email address." })
        }
        
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "Error on server" })
    }
}

/**
 * Sent Verification Link to New Email
 * METHOD : PUT
 * URL : /api/emailChange
 * BODY : token
*/
export const sentVerifLink = async (req, res) => {
    try {
        let reqBody = req.body;
        let userId = decryptString(reqBody.token, true)

        let userData = await User.findOne({ "_id": userId })

        if (userData.newEmailToken != reqBody.token) {
            return res.status(400).json({ "success": false, 'message': "Invalid Link" })
        }

        let encryptToken = encryptString(userData._id, true)
        userData.newEmailToken = encryptToken;
        await userData.save();


        let content = {
            'confirmMailUrl': `${config.FRONT_URL}/verify-new-email/${encryptToken}`,
            'date': new Date()
        };

        mailTemplateLang({
            'userId': userData._id,
            'identifier': 'verify_new_email',
            'toEmail': userData.newEmail,
            content
        })
        return res.status(200).json({ "success": true, "message": "Verification link sent to your new email address." })

    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "Error on server" })
    }
}

/**
 * Verify New Email
 * METHOD : PATCH
 * URL : /api/emailChange
 * BODY : token
*/
export const verifyNewEmail = async (req, res) => {
    try {
        let reqBody = req.body;
        let userId = decryptString(reqBody.token, true);
        let checkUser = await User.findOne({ "_id": userId })

        if (!checkUser) {
            return res.status(500).json({ "success": false, 'message': "Invalid link" })
        }

        let checkEmail = await User.findOne({ "email": checkUser.newEmail, "_id": { "$ne": checkUser._id } })
        if (checkEmail) {
            return res.status(400).json({ "success": false, 'message': "Email already exists" })
        }

        await User.updateOne(
            {
                "_id": checkUser._id
            },
            {
                "$set": {
                    "email": checkUser.newEmail,
                    "newEmail": '',
                    "newEmailToken": ''
                }
            },
        )

        return res.status(200).json({ "success": true, "message": "Change email address successfully" })

    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "Error on server" })
    }
}


/**
 * Update Status
 * METHOD : Post
 * URL : /api/user-update
 * BODY : token
*/

export const UpdateStatue = async (req, res) => {
    try {
        let FindUser = await User.findOne({ _id: req.body.id })
        if (!isEmpty(FindUser)) {
            if (FindUser.status === 'unverified') {
                let Update = await User.findOneAndUpdate({ _id: FindUser._id }, { $set: { status: 'verified' } })
                if (!isEmpty(Update)) {
                    return res.status(200).json({ status: true, message: ' verified user' })
                } else {
                    return res.status(400).json({ status: false, message: ' Failed' })
                }
            } else if (FindUser.status === 'verified') {
                let Update = await User.findOneAndUpdate({ _id: FindUser._id }, { $set: { status: 'unverified' } })
                if (!isEmpty(Update)) {
                    return res.status(200).json({ status: true, message: ' unverified user' })
                } else {
                    return res.status(400).json({ status: false, message: ' Failed' })
                }
            } else {
                return res.status(400).json({ status: false, message: 'user Not Found' })
            }
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: 'something went wrong' })
    }

}


/**
 * Disable 2FA
 * METHOD : Post
 * URL : /api/disable-2fa
 * BODY : token
*/

export const Disable2FA = async (req, res) => {
    try {
        let reqBody = req.body
        let checkUser = await User.findOne({ _id: reqBody.id })
        if (!isEmpty(checkUser)) {
            if (!isEmpty(checkUser.google2Fa.secret)) {
                let Disable = {
                    secret: '',
                    uri: ''
                }
                let Data = await User.findOneAndUpdate({ _id: checkUser._id }, { $set: { google2Fa: Disable } });
                if (!isEmpty(Data)) {
                    return res.status(200).json({ status: true, message: '2FA Disabled' })
                } else {
                    return res.status(400).json({ status: false, message: 'Disabl Failed' })
                }

            }
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: 'something went wrong' })
    }

}



export const AddFavorite = async (req, res) => {

    try {
        let reqBody = req.body
        let checkItem = await UserSetting.findOne({ userId: req.user.id, favorite: reqBody.item })
        if (!isEmpty(checkItem)) {
            let removeItem = await UserSetting.findOneAndUpdate(
                { userId: req.user.id },
                {
                    $pull: { favorite: reqBody.item }
                })

            if (!isEmpty(removeItem) && (reqBody.type != 'remove')) {
                let addItem = await UserSetting.findOneAndUpdate(
                    { userId: req.user.id },
                    {
                        $push: { favorite: reqBody.item }
                    })
            }
            return res.status(200).json({ 'success': true, message: 'Favorite Added' })
        } else {
            let PushItem = await UserSetting.findOneAndUpdate(
                { userId: req.user.id },
                {
                    $push: { favorite: reqBody.item }
                })
            if (!isEmpty(PushItem)) {
                return res.status(200).json({ 'success': true, message: 'Favorite Added' })
            } else {
                return res.status(400).json({ 'success': false, message: 'Not Found' })
            }
        }
    } catch (err) {
        return res.status(500).json({ 'success': false, message: 'Something wrong' })
    }
}

export const getFavorit = async (req, res) => {
    let FetchData = await UserSetting.findOne({ userId: req.user.id })
    if (!isEmpty(FetchData)) {
        return res.status(200).json({ 'success': true, result: FetchData.favorite })
    }
}
export const hideBtn = async (req, res) => {
    console.log('req.user----', req)
    let FetchData = await User.findOne({ _id: req.user.id })
    if (FetchData) {
        let data = {
            status: FetchData.editProfile
        }
        return res.status(200).json(encodedata({ 'success': true, result: data }))
    }
}

export const getAllTrade = async (req, res) => {
    try {
        let spotComplete = await SpotTrade.find({ userId: req.user.id, status: 'completed' })
        let TotalDerivatives = await PerpetualOrder.find({ userId: req.user.id })
        // let p2pOpenOrder = await P2pPost.aggregate([
        //     {
        //         $match: {
        //             $or: [{ buyUserId: req.user.id }, { sellUserId: req.user.id }]
        //         }
        //     },
        //     { $match: { status: 'open' } }
        // ])
        let p2pOpenOrder = await P2pPost.find({ userId: req.user.id, status: 'open' })
        let p2pCompleteOrder = await P2pOrder.aggregate([
            {
                $match: {
                    $or: [{ buyUserId: req.user.id }, { sellUserId: req.user.id }]
                }
            },
            { $match: { status: 'completed' } }
        ])
        let data = {
            spotCompleted: spotComplete.length,
            TotalDerivative: TotalDerivatives.length,
            p2pOpenOrder: p2pOpenOrder.length,
            p2pCompleteOrder: p2pCompleteOrder.length,
        }
        if (!isEmpty(spotComplete)) {
            return res.status(200).json({ 'success': true, result: data })
        } else {
            return res.status(400).json({ 'success': false, message: 'Not found' })
        }
    } catch (err) {
        return res.status(500).json({ 'success': false, message: 'error on server' })
    }
}

export const checkEmail = async(req,res)=>{
    try{
        var detail=await User.findOne({_id:req.user.id})
        return res.status(200).json({ 'success': true, result: detail })
    }catch(err){
        return res.status(500).json({ 'success': false, message: 'error on server' })
    }
  
} 