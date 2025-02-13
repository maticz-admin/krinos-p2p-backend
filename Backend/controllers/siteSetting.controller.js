// import package
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path'
import fs from 'fs';
// import model
import {
  SiteSetting
} from '../models';

//import lib
import imageFilter from '../lib/imageFilter';
import isEmpty from '../lib/isEmpty'
import { set, get } from '../controllers/redis.controller'
// import config
import config from '../config';
import { encodedata } from '../lib/cryptoJS';

/** 
 * Multer Image Uploade 
*/
const settingStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.IMAGE.SETTINGS_URL_PATH);
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(null, 'siteSettings-' + Date.now() + path.extname(file.originalname));
  }
});

let settingsUpload = multer({
  storage: settingStorage,
  fileFilter: imageFilter,
  // limits: { fileSize: config.IMAGE.CURRENCY_SIZE }
}).fields([
  { name: 'emailLogo', maxCount: 1 },
])



export const uploadSiteDetails = (req, res, next) => {

  settingsUpload(req, res, function (err) {

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
 * Get Site Setting
 * URL: /adminapi/getSiteSetting
 * METHOD : GET
*/
export const getSiteSetting = async (req, res) => {
  try{
 const data = await SiteSetting.findOne({}, {
    "_id": 0,
    "marketTrend": 1,
    "userDashboard": 1,
    "facebookLink": 1,
    "twitterUrl": 1,
    "linkedinLink": 1,
    "telegramlink":1,
    "youtubelink":1,
    "discordlink":1,
    "redditlink":1,
    "mediumlink":1,
    "siteName": 1,
    "address": 1,
    "address1": 1,
    "address2": 1,
    "contactNo": 1,
    "supportMail": 1,
    "emailLogo": 1,
    "telegramLink": 1,
    "blogLink": 1,
    "youtubeLink": 1,
    "faqTrend": 1,
     
  })
    if (data) {
      return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': data })
    }else{
      return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
    }
    
  
}catch(err){
  return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
}
}


/** 
 * Get Site Setting
 * URL: /adminapi/getApiLimit
 * METHOD : GET
*/
export const getApiLimit = async (req, res) => {
  try{
  const SiteSetting = await SiteSetting.findOne({}, {
    "ApiLimit":1
  })
    if (SiteSetting) {
      return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': SiteSetting })
    }else {
      return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
    }
  }catch(err){
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
}


/** 
 * Get Site Setting
 * URL: /adminapi/updateSiteSetting
 * METHOD : PUT
 * BODY : marketTrend
*/
export const updateSiteSetting = async (req, res) => {
  try {
    let siteSettingData = await SiteSetting.findOne();
    if (!siteSettingData) {
      return res.status(400).json({ 'success': false, 'message': "No record" })
    }
    let reqBody = req.body;

    siteSettingData.marketTrend = reqBody.marketTrend ? reqBody.marketTrend : siteSettingData.marketTrend;

    let updateData = await siteSettingData.save();

    let result = {
      'marketTrend': updateData.marketTrend
    }
    return res.status(200).json(encodedata({ 'success': true, 'message': "Fetch success", 'result': result }))
  } catch (err) {
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
}

/** 
 * Get Site Setting
 * URL: /adminapi/updateLimit
 * METHOD : PUT
 * BODY : marketTrend
*/
export const updateLimit = async (req, res) => {
  try {
    let siteSettingData = await SiteSetting.findOne({});
    if (!siteSettingData) {
      return res.status(400).json({ 'success': false, 'message': "No record" })
    }
    let reqBody = req.body;
    siteSettingData.ApiLimit = reqBody.ApiLimit ? reqBody.ApiLimit : siteSettingData.ApiLimit;

    let updateData = await siteSettingData.save();

    let result = {
      'ApiLimit': updateData.ApiLimit
    }
    return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': result })
  } catch (err) {
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
}


export const updateSiteDetails = async (req, res) => {
  try {

    const reqBody = req.body
    const reqFile = req.files
    console.log('reqBody----', reqBody)
    let siteSettingData = await SiteSetting.findOne({});

    siteSettingData.facebookLink = reqBody.fbLink;
    siteSettingData.twitterUrl = reqBody.twiterLink;
    siteSettingData.linkedinLink = reqBody.linkedInLink;
    siteSettingData.siteName = reqBody.siteName;
    siteSettingData.address = reqBody.address;
    siteSettingData.address1 = reqBody.address1;
    siteSettingData.address2 = reqBody.address2;
    siteSettingData.contactNo = reqBody.contactNo;
    siteSettingData.supportMail = reqBody.supportMail;
    siteSettingData.emailLogo = isEmpty(reqFile) ? siteSettingData.emailLogo : reqFile.emailLogo[0].filename;

    await siteSettingData.save();

    return res.status(200).json({ 'success': true, 'message': "updated success", })

  } catch (err) {
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })

  }
}

/**
 * Display the currency in user dashboard
 * URL : /adminapi/updateUsrDash
 * METHOD : PUT
 * BODY : currencyList (currencyId,colorCode)
*/
export const updateUsrDash = async (req, res) => {
  try {
    let reqBody = req.body;
    let siteSettingData = await SiteSetting.findOne();
    if (!isEmpty(reqBody.currencyId) && isEmpty(reqBody.colorCode)) {
      return res.status(400).json({ 'status': false, 'message': 'Currency and Color coder is required' })
    }
    if (!siteSettingData) {
      return res.status(400).json({ 'success': false, 'message': "No record" })
    }
    siteSettingData.userDashboard = reqBody.currencyList;

    let updateData = await siteSettingData.save();

    let result = {
      'userDashboard': updateData.userDashboard
    }
    return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': result })
  } catch (err) {
    return res.status(500).json({ 'success': false, 'message': "Currency and Color coder is required" })
  }
}

/**
 * Update Social Media
 * URL : /adminapi/updateSocialMedia
 * METHOD : PUT
 * BODY : facebookLink, twitterLink, linkedinLink, telegramLink, blogLink, youtubeLink
*/
export const updateSocialMedia = async (req, res) => {
  try {
    const reqBody = req.body
    let siteSettingData = await SiteSetting.findOne({});

    siteSettingData.facebookLink = reqBody.fbLink;
    siteSettingData.twitterUrl = reqBody.twitterLink;
    siteSettingData.linkedinLink = reqBody.linkedInLink;
    siteSettingData.telegramLink = reqBody.telegramLink;
    siteSettingData.blogLink = reqBody.blogLink;
    siteSettingData.youtubeLink = reqBody.youtubeLink;
    await siteSettingData.save();
    return res.status(200).json(encodedata({ 'success': true, 'message': "updated success" }))
  } catch (err) {
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
}

/** 
 * Update Faq Trend
 * URL : /adminapi/updateFaqTrend
 * METHOD : PUT
 * BODY : faqTrend
*/
export const updateFaqTrend = async (req, res) => {
  try {
    let siteSettingData = await SiteSetting.findOne();
    if (!siteSettingData) {
      return res.status(400).json({ 'success': false, 'message': "No record" })
    }

    let reqBody = req.body;

    siteSettingData.faqTrend = reqBody.faqTrend ? reqBody.faqTrend : siteSettingData.faqTrend;
    let updateData = await siteSettingData.save();
    let result = {
      'faqTrend': updateData.faqTrend
    }
    return res.status(200).json(encodedata({ 'success': true, 'message': "Updated successfully", 'result': result }))
  } catch (err) {
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
}

/**
 * Update Codig mail
 * URL : /adminapi/updatemailintegrate
 * METHOD : post
 * BODY : host, port, user, pass, true/false
*/
export const updateMailIntegrate = async (req, res) => {
  try {
    let reqBody = req.body;
    if (reqBody.type == 'sendinBlue') {
      let payload = {
        "name": reqBody.name,
        "email": reqBody.fromMail,
        "apiKey": reqBody.api,
        "mailType": reqBody.mailType

      }
      await set('SMTP', JSON.stringify(payload))
      fs.writeFileSync(__dirname + '/../config/sendinBlue.json', JSON.stringify(payload), 'utf8');
      return res.status(200).json({ 'success': true, 'message': "Update successfully" })
    }
    if (reqBody.type == 'mailIntegrage') {
      let payload = {
        "fromMail": reqBody.fromMail,
        "nodemailer": {
          "host": reqBody.host,
          "port": parseInt(reqBody.port),
          "secure": reqBody.secure == "true" ? true : false,
          "auth": {
            "user": reqBody.user,
            "pass": reqBody.pass
          }
        }
      }
      fs.writeFileSync(__dirname + '/../config/smtpConfig.json', JSON.stringify(payload), 'utf8');
      return res.status(200).json(encodedata({ 'success': true, 'message': "Update successfully" }))
    }
  } catch (err) {
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
}

export const getMailIntegrate = async (req, res) => {
  try {
    const mailIntegrage = fs.readFileSync(__dirname + '/../config/smtpConfig.json', 'utf8')
    const sendinBlue = fs.readFileSync(__dirname + '/../config/sendinBlue.json', 'utf8')
    await set('SMTP', sendinBlue)
    let result = {
      mailIntegrage: JSON.parse(mailIntegrage),
      sendinBlue: JSON.parse(sendinBlue)
    }
    return res.status(200).json({ 'success': true, 'message': "Update successfully", "result": result })
  } catch (err) {
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
}

export const setRedis = async () => {
  const sendinBlue = fs.readFileSync(__dirname + '/../config/sendinBlue.json', 'utf8')
  await set('SMTP', sendinBlue)
  let data = await get('SMTP')
}
setRedis()
