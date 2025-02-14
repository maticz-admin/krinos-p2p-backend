// import package
import multer from 'multer';
import path from 'path';

// import model
import { Cms } from '../models'

// import config
import config from '../config';

//import lib
import isEmpty from '../lib/isEmpty'
import imageFilter from '../lib/imageFilter';
import { encodedata } from '../lib/cryptoJS';

/** 
 * Get Cms List
 * URL : /adminapi/cms
 * METHOD : GET
*/
export const getCmsList = async (req, res) => {
  try{
      const data = await  Cms.find({}, { '_id': 1, 'identifier': 1, 'title': 1, 'content': 1, 'image': 1, 'status': 1 })
  if(data){
    return res.status(200).json({ 'success': true, 'message': 'Fetch successfully', 'result': data })
  }else{
    return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
  }
}catch(e){
  return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
}
    // Cms.find({}, { '_id': 1, 'identifier': 1, 'title': 1, 'content': 1, 'image': 1, 'status': 1 }, (err, data) => {
    //     if (err) {
    //         return res.status(500).json({ 'success': false, 'message': 'Something went wrong' })
    //     }
    //     return res.status(200).json({ 'success': true, 'message': 'Fetch successfully', 'result': data })
    // })
}

/** 
 * Multer Image Uploade 
*/
const cmsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.IMAGE.CMS_PATH);
  },
  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(null, 'cms-' + Date.now() + path.extname(file.originalname));
  }
});

let cmsUploag = multer({

  storage: cmsStorage,
  onError: function (err, next) {
    next(err);
  },
  fileFilter: imageFilter,
  limits: { fileSize: config.IMAGE.CURRENCY_SIZE }
}).fields([
  { name: 'image', maxCount: 1 },
])

export const uploadImage = (req, res, next) => {

  cmsUploag(req, res, function (err) {
    if (!isEmpty(req.validationError)) {
      return res.status(400).json({ "success": false, 'message': req.validationError.messages  })
    }
    else if (err instanceof multer.MulterError) {
      return res.status(400).json({ "success": false, 'message': "TOO_LARGE" })
    }
    else if (err) {
      return res.status(500).json({ "success": false, 'message': "SOMETHING_WRONG" })
    }
    return next();
  })
}

/** 
 * Update Cms List
 * URL : /adminapi/cms
 * METHOD : PUT
 * BODY : id, identifier, title, content
*/
export const updateCms = async (req, res) => {
    try {
        let reqBody = req.body, reqFile = req.files;
        let checkCmsData = await Cms.findOne({ "_id": reqBody.id });
        if (!checkCmsData) {
            return res.status(400).json({ 'status': false, 'message': 'There is no cms' });
        }
        let image = [];
        if(reqFile && reqFile.image && reqFile.image[0] && reqFile.image[0].filename){
            image = reqFile && reqFile.image && reqFile.image[0] && reqFile.image[0].filename
        }
        checkCmsData.identifier = reqBody.identifier;
        checkCmsData.image = image;
        checkCmsData.title = reqBody.title;
        checkCmsData.content = reqBody.content;
        await checkCmsData.save();
        return res.status(200).json({ 'status': true, 'message': 'Cms updated successfully' });
    } catch (err) {
        return res.status(500).json({ 'status': false, 'message': 'Page name or content is required' });
    }
}

/** 
 * Get CMS Page
 * URL : /api/cms/{{}}
 * METHOD : GET
 * PARAMS : identifier
*/
export const getCMSPage = async(req, res) => {
  try{
    
  const data = await Cms.findOne({ "identifier": req.params.identifier }, {
        "_id": 0,
        "title": 1,
        "content": 1
    })
        if (data) {
          return res.status(200).json(encodedata({ 'status': true, 'message': 'FETCH_SUCCESS', 'result': data }));
        }
        else{
          return res.status(500).json(encodedata({ 'status': false, 'message': 'Something went wrong' }));
        }
  }catch(err){
    return res.status(500).json(encodedata({ 'status': false, 'message': 'Something went wrong' }));
  }
}

/** 
 * Get CMS Page
 * URL : /api/fetch-cms
 * METHOD : GET
*/
export const getAllCMSPage = async (req, res) => {
    try {
        let lang = req.body.lang
        if (!isEmpty(lang)) {
            let fetchCms = await Cms.find({ language: lang })
            if (!isEmpty(fetchCms)) {
                return res.status(200).json(encodedata({ 'success': true, result: fetchCms }))
            } else {
                return res.status(400).json(encodedata({ 'success': false, message: 'Not found' }))
            }
        } else {
            let fetchCms = await Cms.find({ language: 'en' })
            if (!isEmpty(fetchCms)) {
                return res.status(200).json(encodedata({ 'success': true, result: fetchCms }))
            } else {
                return res.status(400).json(encodedata({ 'success': false, message: 'Not found' }))
            }
        }
    } catch (err) {
        return res.status(500).json(encodedata({ 'success': false, message: 'error on server' }))
    }
}