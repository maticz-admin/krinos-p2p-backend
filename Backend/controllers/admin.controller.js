// import package
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
// import modal
import Admin from '../models/Admin';
import LoginHistory from '../models/LoginHistory';
import User from '../models/User';

// import cofig
import config from '../config/index';

// import lib
import { comparePassword, generatePassword } from '../lib/bcrypt';
import isEmpty from 'is-empty'
import { paginationQuery, filterSearchQuery } from '../lib/adminHelpers';
import { encryptString, decryptString, encodedata } from '../lib/cryptoJS';


//template
import { mailTemplateLang } from './emailTemplate.controller';

//2fa
import node2fa from 'node-2fa';

// const ObjectId = mongoose.Types.ObjectId;

/**
 * Add New Admin
 * URL : /adminapi/admin
 * METHOD: POST
 * BODY : name, email, password ,restriction(path, isWriteAccess)
 * 
 * 
*/


export const creatAdmin = async (req, res) => {
    try {
        let reqBody = req.body
        let checkUser = await Admin.findOne({ "email": reqBody.email })
        let adminCheck = await Admin.findOne({'_id' : req.user.id })
        if (adminCheck.role === 'admin') {
            return res.status(400).json({ status: false, message: 'super Admin Only created' })
        }
        if (!isEmpty(checkUser)) {
            return res.status(400).json({ "success": false, 'errors': { 'email': "Email is not exists" } })
        }

        let { passwordStatus, hash } = await generatePassword(reqBody.password);

        if (!passwordStatus) {
            return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
        }
        let newAdmin = new Admin({
            name: reqBody.name,
            email: reqBody.email,
            password: hash,
            role: reqBody.role
        })
        let creatAdmin = await newAdmin.save()
        if (!isEmpty(creatAdmin)) {
            return res.status(200).json({ 'success': true, message: 'Admin created sucessfully' })
        } else {
            return res.status(400).json({ 'success': false, message: 'Failed' })
        }
    } catch (err) {
        return res.status(500).json({ staus: false, message: 'something went wrong' })
    }

}


/**
 * Edit Admin
 * URL : /adminapi/admin
 * METHOD: POST
 * BODY : adminId, name, email, restriction(path, isWriteAccess)
*/
export const editAdmin = async (req, res) => {
    try {
        let reqBody = req.body;
        let getPath = reqBody.restriction
        reqBody.email = reqBody.email.toLowerCase();
        let checkUser = await Admin.findOne({ '_id': reqBody.adminId });
        let checkAdmin = await Admin.findOne({ _id: req.user.id });

        if (!checkUser) {
            return res.status(400).json({ "success": false, 'errors': { 'email': "Email is not exists" } })
        }
        if (checkAdmin.role === 'admin') {
            return res.status(400).json({ status: false, message: 'super Admin Only update' })
        }


        let updateData = await Admin.findOneAndUpdate(
            { "_id": reqBody.adminId },
            {
                "$set": {
                    'name': reqBody.name,
                    'email': reqBody.email,
                    'restriction': getPath
                }
            },
            { "new": true }
        )
        if (!isEmpty(updateData)) {
            return res.status(200).json({ "success": true, message: "Updated successfully" })

        } else {
            return res.status(400).json({ status: false, message: 'update failed' })
        }

    } catch (err) {
        return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    }
}

/**
 * Admin List
 * URL : /adminapi/admin
 * METHOD: GET
*/
export const getAdmin = async (req, res) => {
    try{
    const adminData = await Admin.find({ role: 'admin' }, { 'name': 1, "email": 1, 'restriction': 1 })
        if (adminData){
            return res.status(200).json({ "success": true, 'result': adminData })
        }else{
            return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
        }
    }catch(e){
        return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    }
    // Admin.find({ role: 'admin' }, { 'name': 1, "email": 1, 'restriction': 1 }, (err, adminData) => {
    //     if (err) {
    //         return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    //     }
    //     return res.status(200).json({ "success": true, 'result': adminData })
    // })
}

/**
 * Admin Login
 * URL : /adminapi/login
 * METHOD: POST
 * BODY : email, password
*/
export const adminLogin = async (req, res) => {
    try {
        let reqBody = req.body;

        reqBody.email = reqBody.email.toLowerCase();
        let isLoginHistory = !isEmpty(req.body.loginHistory)
        let checkUser = await Admin.findOne({ "email": reqBody.email });
        if (!checkUser) {
            return res.status(404).json({ "success": false, 'errors': { 'email': "Email not found" } })
        }
        let { passwordStatus } = await comparePassword(reqBody.password, checkUser.password);
        if (!passwordStatus) {
            if (isLoginHistory){
                loginHistory({ ...req.body.loginHistory, ...{ "status": "Failed", "reason": "Password Incorrect", "userId": checkUser._id } })
            }
            return res.status(200).json(encodedata({
            "success": false, 
            'errors': { "password": "Invalid credentials" } 
        }))
        }



        if (checkUser.google2Fa && !isEmpty(checkUser.google2Fa.secret)) {
            if (isEmpty(reqBody.twoFACode)) {
                return res.status(200).json(encodedata({ 'success': true, 'status': 'TWO_FA', 'message': "Need 2FA code" }))
            } else {
                let check2Fa = node2fa.verifyToken(checkUser.google2Fa.secret, reqBody.twoFACode)
                if (!(check2Fa && check2Fa.delta == 0)) {
                    if (isLoginHistory) {
                        loginHistory({ ...req.body.loginHistory, ...{ "status": "Failed", "reason": "Invalid 2FA code", "userId": checkUser._id } })
                    }
                    return res.status(400).json(encodedata({ 'success': false, 'message': "Invalid 2FA code" }))
                }
            }
        }

        let payloadData = {
            "_id": checkUser._id,
            "restriction": checkUser.restriction,
            "role": checkUser.role
        }
        let token = new Admin().generateJWT(payloadData);
        if (isLoginHistory) {
            loginHistory({ ...reqBody.loginHistory, ...{ "status": 'Success', "reason": "success", "userId": checkUser._id } })
        }


        return res.status(200).json(encodedata({ 'success': true, 'message': "Login successfully", token }))
    }
    catch (err) {
        return res.status(500).json(encodedata({ "success": false, 'message': "Error on server" }))
    }
}


const loginHistory = ({
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
        region,
        broswername,
        ismobile,
        os,
        status,
        reason,
        userId,
        createdDate: new Date()

    }

    const Data = new LoginHistory({
        countryName: countryName,
        countryCode: countryCode,
        ipaddress: ipaddress,
        regionName: region, // regionName
        broswername: broswername,
        ismobile: ismobile,
        os: os,
        status: status,
        reason: reason,
        userId: userId
    })
    const saveData = Data.save();
    //     Admin.update({ '_id': userId }, {
    //         '$push': {
    //             'loginhistory': data,
    //         },
    //     }, (err, data) => {
    //     })

}
//  Get LoginHistory 
//  URL : /adminapi/profile
//  METHOD: GET
export const LoginhistoryPag = async (req, res) => {
    try {
        const queryData = req.query.export;
        if (queryData == 'true') {
            let pagination = paginationQuery(req.query);
            let filter = filterSearchQuery(req.query, ['countryName', 'regionName', 'broswername', 'status']);

            let count = await LoginHistory.countDocuments(filter);
            let data = await LoginHistory.find(filter, {
                "_id": 0,
                "countryCode": 1,
                "countryName": 1,
                "regionName": 1,
                "ipaddress": 1,
                "broswername": 1,
                "ismobile": 1,
                "os": 1,
                "status": 1,
                "reason": 1,
                "createdDate": 1,
                "_id": 0
            }).sort({ "createdDate": -1 }).skip(pagination.skip).limit(pagination.limit);
            let result = {
                count,
                data
            }
            return res.status(200).json({ 'success': true, 'message': 'FETCH_SUCCESS', result })
        }
        if (queryData == 'false') {
            let downloadData = await LoginHistory.find({}).select(
                {
                    "_id": 0,
                    "countryCode": 1,
                    "countryName": 1,
                    "regionName": 1,
                    "ipaddress": 1,
                    "broswername": 1,
                    "ismobile": 1,
                    "os": 1,
                    "status": 1,
                    "reason": 1,
                    "createdDate": 1
                }).sort({ "createdDate": -1 })


            let result = {
                downloadData
            }
            return res.status(200).json({ 'success': true, 'message': 'FETCH_SUCCESS', result })
        }
    }

    catch (err) {
        return res.status(500).json({ 'success': true, 'message': 'SOMETHING_WRONG' })
    }
}

/**
 * Get Profile
 * URL : /adminapi/profile
 * METHOD: GET
*/
export const getProfile = async (req, res) => {
    try {
        let profileData = await Admin.findOne({ _id: req.user.id }).select({ name: 1, email: 1, role: 1 })
        if (!isEmpty(profileData)) {
            return res.status(200).json(encodedata({ status: true, result: profileData }))
        } 
        
        res.status(400).json(encodedata({ status: false, message: 'Failed' }))
        

    } catch (err) {
        return res.status(500).json(encodedata({ status: false, message: 'something worng' }))
    }

}

/**
 * Update Profile
 * URL : /adminapi/profile
 * METHOD: PUT
 * BODY : name
*/
export const editProfile = async (req, res) => {
    try {
        let reqBody = req.body;
        if (isEmpty(reqBody.name)) {
            return res.status(400).json(encodedata({ status: false, message: 'Name is Required' }))
        }
        let update = await Admin.findOneAndUpdate({ _id: req.user.id }, { $set: { name: reqBody.name } }, { new: true })
        if (!isEmpty(update)) {
            return res.status(200).json(encodedata({ status: true, message: 'updated successfully' }))
        } else {
            return res.status(400).json(encodedata({ status: false, message: 'failed' }))
        }
    } catch (err) {
        return res.status(500).json(encodedata({ status: false, message: 'something wrong' }))
    }

}

/**
 * Forgot Password
 * URL : /adminapi/forgotPassword
 * METHOD: POST
 * BODY : email
*/
export const forgotPassword = async (req, res) => {
    try{
    let reqBody = req.body;
const adminData = await Admin.findOne({"email": reqBody.email})
if(!adminData){
    return res.status(400).json({ "success": false, 'errors': { 'email': "Email is not exists" } })
}else{
    let encryptToken = encrypt(adminData._id)

    let content = {
        'name': adminData.firstName,
        'confirmMailUrl': `${config.FRONT_URL}/admin/changepassword/${encryptToken}`
    }

    // mailTemplate('User_forgot', adminData.email, content)
    return res.status(200).json({ 'success': true, "messages": "Confirm your mail" })  
}
    // Admin.findOne(
    //     {
    //         "email": reqBody.email
    //     },
    //     (err, adminData) => {
    //         if (err) {
    //             return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    //         }
    //         if (!adminData) {
    //             return res.status(400).json({ "success": false, 'errors': { 'email': "Email is not exists" } })
    //         }
    //         let encryptToken = encrypt(adminData._id)

    //         let content = {
    //             'name': adminData.firstName,
    //             'confirmMailUrl': `${config.FRONT_URL}/admin/changepassword/${encryptToken}`
    //         }

    //         // mailTemplate('User_forgot', adminData.email, content)
    //         return res.status(200).json({ 'success': true, "messages": "Confirm your mail" })
    //     }
    // )
    }catch(e){
        return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    }
}



export const changePassword = async (req, res) => {
    try {
        let reqBody = req.body
        let otpTime = new Date(new Date().getTime() - 120000); //2 min
        let checkUser = await Admin.findOne({ _id: req.user.id })
        let { passwordStatus } = await comparePassword(reqBody.oldPassword, checkUser.password);
        if (!passwordStatus) {
            return res.status(400).json(encodedata({ status: false, 'errors': { oldPassword: 'incorrect password' } }))
        }
        if (checkUser.otpTime <= otpTime) {
            return res.status(400).json(encodedata({ status: false, 'errors': { 'otp': "invalid OTP" } }))
        }

        if (checkUser.otp != reqBody.otp) {
            return res.status(400).json(encodedata({ status: false, 'errors': { 'otp': "invalid OTP" } }))
        }

        let { hash } = generatePassword(reqBody.newPassword)
        let Data = {
            password: hash,
        }
        let changePassword = await Admin.findOneAndUpdate({ _id: checkUser._id }, { $set: Data }, { new: true })
        if (!isEmpty(changePassword)) {
            return res.status(200).json(encodedata({ 'success': true, message: 'Password Updated' }))
        } else {
            return res.status(400).json(encodedata({ 'success': false, message: 'Failed' }))
        }

    } catch (err) {
        return res.status(500).json(encodedata({ status: false, message: 'something worng' }))
    }
}


/**
 * creat 2FA Code
*/
export const generateTwoFa = (userData) => {
    let result = {}
    if (userData && userData.google2Fa.secret != "") {

        result = {
            secret: userData.google2Fa.secret,
            imageUrl: config.NODE_TWOFA.QR_IMAGE + userData.google2Fa.uri,
            uri: userData.google2Fa.uri,
            twoFaStatus: "enabled"
        }

    } else {
        let newSecret = node2fa.generateSecret({ 'name': config.NODE_TWOFA.NAME, 'account': userData.email })
        result = {
            secret: newSecret.secret,
            imageUrl: newSecret.qr,
            uri: newSecret.uri,
            twoFaStatus: "disabled"
        }
    }
    return result;
}

/**
 * Get 2FA Code
 * METHOD : GET
 * URL : /adminapi/security
*/
export const get2faCode = async (req, res) => {
    try{
    const userData = await Admin.findOne({ "_id": req.user.id })
    if(userData){
        let result = generateTwoFa(userData)
        return res.status(200).json({ 'success': true, 'result': result })
    }else{
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}catch(e){
    return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
}
    // Admin.findOne(
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
 * METHOD : POST
 * URL : /adminapi/update2FA
 * BODY : Password, secret, code, uri
*/
export const UpdateTwoFA = async (req, res) => {
    try {
        let reqBody = req.body;
        let userData = await Admin.findOne({ "_id": req.user.id });
        let { passwordStatus } = await comparePassword(reqBody.Password, userData.password);
        if (!passwordStatus) {
            return res.status(400).json({ "success": false, 'errors': { "Password": "Password incorrect" } })
        }

        let check2Fa = await node2fa.verifyToken(reqBody.secret, reqBody.code)

        if (check2Fa && check2Fa.delta == 0) {
            let updateData = await Admin.findOneAndUpdate(
                { "_id": req.user.id },
                {
                    "google2Fa.secret": reqBody.secret,
                    "google2Fa.uri": reqBody.uri,
                },
                { "new": true }
            )

            let result = generateTwoFa(updateData)

            return res.status(200).json({ 'success': true, 'message': "2FA Enable Sucessfully", result })
        }

        return res.status(400).json({ 'success': false, 'errors': { 'code': "Invalid Code" } })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
}

/**
 * Disable 2FA Code
 * METHOD : POST
 * URL : /adminapi/disabled2FA
 * BODY : Password, secret, code
*/
export const diabled2faCode = async (req, res) => {
    try {
        let reqBody = req.body;
        if (reqBody.CheckValue == false) {
            return res.status(400).json({ 'success': false, 'errors': { 'CheckValue': "Please select backupcode" } });
        }
        let userData = await Admin.findOne({ "_id": req.user.id })

        let { passwordStatus } = await comparePassword(reqBody.Password, userData.password);
        if (!passwordStatus) {
            return res.status(400).json({ "success": false, 'errors': { "Password": "Password incorrect" } })
        }
        if (userData.google2Fa && userData.google2Fa.secret != reqBody.secret) {
            return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
        }
        let check2Fa = node2fa.verifyToken(reqBody.secret, reqBody.code)
        if (check2Fa && check2Fa.delta == 0) {
            userData.google2Fa.secret = '';
            userData.google2Fa.uri = '';
            let updateData = await userData.save();
            let result = generateTwoFa(updateData)
            return res.status(200).json({ 'success': true, 'message': "2FA Disable Sucessfully", result })
        }
        return res.status(400).json({ 'success': false, 'errors': { 'code': "Invalid Code" } })

    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "something wrong" })
    }
}

/**
 * generate OTP Code
*/

export const generateOTP = (req, res, next) => {

    try {

        function makeid(length) {
            var result = '';
            var characters = '0123456789342353456464575675685687568769769';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() *
                    charactersLength));
            }
            return req.OTP = result
        }
        makeid(5);

        next()
    } catch (err) {

        return res.status(500).json({ status: false, message: 'catch err' })
    }
}

/**
 * otp mail
 * METHOD : POST
 * URL : /adminapi/send-mail
*/

export const sendMail = async (req, res) => {

    try {
        const reqBody = req.body
        let OTP = req.OTP
        let Data = {
            otp: OTP,
            otpTime: new Date()
        }

        let checkUser = await Admin.findOneAndUpdate({ _id: req.user.id }, { $set: Data }, { new: true })
        console.log('checkUser-----', checkUser, OTP, Data)
        if (!isEmpty(checkUser)) {
            let content = {
                'OTP': checkUser.otp,
                'date': new Date(),
            };

            mailTemplateLang({
                'identifier': 'SEND_OTP',
                'toEmail': checkUser.email,
                content
            })
            if (!isEmpty(mailTemplateLang)) {
                return res.status(200).json(encodedata({ status: true, message: 'OTP successfully sent  to your email' }))
            } else {
                return res.status(400).json(encodedata({ status: false, message: 'Failed' }))
            }
        }
    } catch (err) {
        return res.status(500).json(encodedata({ status: false, message: 'something went wrong' }))
    }

}
