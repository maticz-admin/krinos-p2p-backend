import multer from "multer";
import path from "path"
// import model
import {
    Anouncement
} from '../models'

// import lib
import { nowDateInUTC } from '../lib/dateHelper'
// import config
import config from "../config";
// import lib
import imageFilter from "../lib/imageFilter";
import { paginationQuery, filterSearchQuery } from '../lib/adminHelpers'
import isEmpty from "../lib/isEmpty"

const anouncementStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.IMAGE.ACCOUMENT_PATH);
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
      cb(null, "accoumnet-" + Date.now() + path.extname(file.originalname));
    },
  });
  
  let anouncementupload = multer({
    storage: anouncementStorage,
    onError: function (err, next) {
      next(err);
    },
    fileFilter: imageFilter,
    //limits: { fileSize: config.IMAGE.CURRENCY_SIZE },
  }).fields([{ name: "image", maxCount: 1 }]);
  
  export const Anouncementupload = (req, res, next) => {
    anouncementupload(req, res, function (err) {
      if (!isEmpty(req.validationError)) {
        return res.status(400).json({
          success: false,
          errors: {
            [req.validationError.fieldname]: req.validationError.messages,
          },
        });
      } else if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ success: false, errors: { [err.field]: "TOO_LARGE" } });
      } else if (err) {
        return res
          .status(500)
          .json({ success: false, message: "SOMETHING_WRONG" });
      }
      return next();
    });
  };


/** 
 * Add Announcement
 * METHOD : POST
 * URL : /adminapi/anouncement
 * BODY : content, endDateTime
*/
export const anouncementAdd = async (req, res) => {
    let reqBody = req.body;
    let reqFile = req.files
    let newDoc = new Anouncement({
        'content': reqBody.content,
        'endDateTime': reqBody.endDateTime,
        'image':reqFile.image[0].filename
    })
    newDoc.save((err, data) => {
        if (err) {
            return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
        }
        return res.status(200).json({ 'success': true, 'message': "Successfully added" })
    })
}

/** 
 * Add Announcement
 * METHOD : POST
 * URL : /adminapi/anouncement
 * BODY : content, endDateTime
*/
export const anouncementEdit = async (req, res) => {
  try {


    let reqBody = req.body;
    let reqFile = req.files
    let newDoc = await Anouncement.findOne({ _id: req.body._id })
    newDoc.content = reqBody.content
    newDoc.endDateTime = reqBody.endDateTime
    newDoc.image = reqFile.image ? reqFile.image[0].filename : newDoc.image
    await newDoc.save((err, data) => {
      if (err) {
        return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
      }
      return res.status(200).json({ 'success': true, 'message': "Successfully Edited" })
    })
  } catch (err) {
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
}

/** 
 * Add Announcement
 * METHOD : POST
 * URL : /adminapi/anouncement
 * BODY : content, endDateTime
*/
export const anouncementdelete = async (req, res) => {
  try{
    let id = req.query._id
    let newDoc = await Anouncement.findOneAndDelete({_id:id})
    if(newDoc){
      return res.status(200).json({ 'success': true, 'message': "Successfully Deleted" })
    }
  }catch(err){
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
  
}


/** 
 * Launchpad List
 * URL : /adminapi/anouncement
 * METHOD : GET
*/
export const  getanouncement= async (req, res) => {
  try {
      let pagination = paginationQuery(req.query);
      let filter = filterSearchQuery(req.query, ['industry', 'website']);

      let count = await Anouncement.countDocuments(filter);
      let data = await Anouncement.find({}).skip(pagination.skip).limit(pagination.limit)

      let result = {
          count,
          data,
          imageUrl: `${config.SERVER_URL}${config.IMAGE.ACCOUMENT_URL_PATH}`
      }
      return res.status(200).json({ 'success': true, 'message': 'FETCH_SUCCESS', 'result': result })
  } catch (err) {
      return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
}

/** 
 * Get All Announcement
 * METHOD: GET
 * URL: /api/announcement
*/
export const getAnnouncement = async (req, res) => {
  try{
    let dateTime = nowDateInUTC();
   const data = await Anouncement.find({ 'endDateTime': { "$gt": dateTime } }, { 'content': 1 }, { 'sort': { '_id': -1 }, "limit": 1 })
    if(data){
      return res.status(200).json({ 'success': true, 'message': "Successfully added", 'result': data })
    }else{
      return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
    }
  }catch(e){
return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
    // let dateTime = nowDateInUTC();
    // Anouncement.find({ 'endDateTime': { "$gt": dateTime } }, { 'content': 1 }, { 'sort': { '_id': -1 }, "limit": 1 }, (err, data) => {
    //     if (err) {
    //         return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
    //     }
    //     return res.status(200).json({ 'success': true, 'message': "Successfully added", 'result': data })
    // })
}

/** 
 * Get All Announcement
 * METHOD: GET
 * URL: /api/getannouncement
*/

export const getAnnouncementContent = async (req, res) => {
  try{
    let dateTime = nowDateInUTC();
    const data = await  Anouncement.find({})
    if(data){
      return res.status(200).json({ 'success': true, 'message': "Successfully added", 'result': data }) 
    }else{
      return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
    }
  }catch(e){
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }
    // Anouncement.find({}, (err, data) => {
    //     if (err) {
    //         return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
    //     }
    //     return res.status(200).json({ 'success': true, 'message': "Successfully added", 'result': data })
    // })
}