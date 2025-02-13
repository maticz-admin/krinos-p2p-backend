// import package
import mongoose from 'mongoose';
import lodash from 'lodash'

// import config
import config from '../config';

// import model
import {
    SpotPair,
    PerpetualPair,
    SiteSetting,
    PriceConversion,
    P2pPair,
    Faq,
    Cms
} from '../models';
import { encodedata } from '../lib/cryptoJS';


// const ObjectId = mongoose.Types.ObjectId;
const { ObjectId } = require('mongoose').Types;


/** 
 * Get Site Setting
 * URL: /adminapi/getSiteSetting
 * METHOD : GET
*/
export const getPairDropdown = async (req, res) => {
    try {
        let spotPair = await SpotPair.find({ "status": "active" }, {
            "firstCurrencySymbol": 1,
            "secondCurrencySymbol": 1,
            "markPrice": 1
        })
        if (spotPair && spotPair.length > 0) {
            return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': spotPair })
        }
        return res.status(400).json({'success': false, 'message': "No record"})
    } catch (err) {
        return res.status(500).json({'success': false, 'message': "Something went wrong"})
    }
}

/** 
 * Get Site Setting
 * URL: /api/getSocialMedia
 * METHOD : GET
*/
export const getSocialMedia = async (req, res) => {
    try {
        let settingData = await SiteSetting.findOne({}, {
            "facebookLink": 1,
            "linkedinLink": 1,
            "twitterUrl": 1,
            "telegramlink":1,
            "youtubelink":1,
            "redditlink":1,
            "discordlink":1,
            "mediumlink":1
        })
        if (settingData) {
            return res.status(200).json(encodedata({ 'success': true, 'message': "Fetch success", 'result': settingData }))
        }
        return res.status(200).json(encodedata({ 'success': false, 'message': "No record" }))
    } catch (err) {
        return res.status(500).json(encodedata({ 'success': false, 'message': "Something went wrong" }))
    }
}

/** 
 * Get Market Trend
 * URL: /api/getCmsData
 * METHOD : GET
*/
export const getCmsData = async (req, res) => {
    try {
        let cmsData = await Cms.find();
        console.log('cmsData----', cmsData);
        return res.status(200).json(encodedata({ 'success': true, 'message': "Fetch success", 'result': cmsData }))
    } catch (err) {
        return res.status(500).json(encodedata({ 'success': false, 'message': "Something went wrong" }))
    }
}

/** 
 * Get Market Trend
 * URL: /api/getMarketTrend
 * METHOD : GET
*/
export const getMarketTrend = async (req, res) => {
    try {
        let siteSettingData = await SiteSetting.findOne({}, { 'marketTrend': 1 })
        if (!siteSettingData) {
            return res.status(400).json({ 'success': false, 'message': "There is no setting" })
        }

        let spotPairData = await SpotPair.aggregate([
            { "$match": { "_id": { "$in": siteSettingData.marketTrend } } },
            {
                "$lookup": {
                    "from": 'currency',
                    "localField": "firstCurrencyId",
                    "foreignField": "_id",
                    "as": "firstCurrencyInfo"
                }
            },
            { "$unwind": "$firstCurrencyInfo" },
            {
                "$project": {
                    "firstCurrencySymbol": 1,
                    "secondCurrencySymbol": 1,
                    'firstCurrencyName': "$firstCurrencyInfo.currencyName",
                    "firstCurrencyImage": { "$concat": [config.SERVER_URL, config.IMAGE.CURRENCY_URL_PATH, "$firstCurrencyInfo.image"] },
                    "markPrice": 1,
                    "change": 1,
                    "secondFloatDigit": 1
                }
            }
        ])

        if (spotPairData && spotPairData.length > 0) {
            return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': spotPairData })
        }
        return res.status(400).json({ 'success': false, 'message': "No record" })
    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
    }
}

/** 
 * Get Pair Data
 * URL: /api/pairData
 * METHOD : GET
 * QUERY : firstCurrencySymbol, secondCurrencySymbol
*/
export const getPairData = async (req, res) => {
    const reqQuery = req.query;
    SpotPair.findOne({
        'firstCurrencySymbol': reqQuery.firstCurrencySymbol,
        'secondCurrencySymbol': reqQuery.secondCurrencySymbol
    }, {
        "markPrice": 1
    }, (err, data) => {
        if (err) {
            return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
        }

        return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': data })
    })
}

/** 
 * Get Price Conversion
 * URL : /api/priceConversion
 * METHOD : GET
*/
export const getPriceCNV = async(req, res) => {
  const data =  await PriceConversion.find({}, { "_id": 0, "baseSymbol": 1, "convertSymbol": 1, "convertPrice": 1 })
  if(data){
    return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': data })
  }else{
    return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
  }

//   , (err, data) => {
//         if (err) {
//             return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
//         }
//         return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': data })
//     })
}

/** 
 * Get History Filter
 * URL : /api/historyFilter
 * METHOD : GET
*/
export const historyFilter = async (req, res) => {
    try {
        let p2pFilter = {
            coinList: [],
            payment: []
        };

        let spotFilter = {
            pairList: [],
            orderTypes: [{
                'label': 'Limit',
                'value': 'limit'
            }, {
                'label': 'Market',
                'value': 'market'
            }]
        }

        let derivativeFilter = {
            pairList: [],
            orderTypes: [{
                'label': 'Limit',
                'value': 'limit'
            }, {
                'label': 'Market',
                'value': 'market'
            }]
        }

        let p2pPairData = await P2pPair.find({ 'status': 'active' });
        if (p2pPairData && p2pPairData.length > 0) {
            p2pFilter['coinList'] = lodash.chain(p2pPairData).map('firstCoin').uniq().value();
            p2pFilter['payment'] = lodash.chain(p2pPairData).map('payment').flatten().uniq().value();
        }


        let spotPair = await SpotPair.find({ "status": "active" }, {
            "firstCurrencySymbol": 1,
            "secondCurrencySymbol": 1,
        })
        if (spotPair && spotPair.length > 0) {
            spotFilter['pairList'] = spotPair
        }


        let derivativePair = await PerpetualPair.find({ "status": "active" }, {
            "firstCurrencySymbol": 1,
            "secondCurrencySymbol": 1,
        })
        if (derivativePair && derivativePair.length > 0) {
            derivativeFilter['pairList'] = derivativePair
        }

        let result = {
            p2pFilter,
            spotFilter,
            derivativeFilter
        }
        return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': result })
    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': "Error on server" })
    }
}

/** 
 * Get Market Trend
 * URL: /api/getFaqTrend
 * METHOD : GET
*/
export const getFaqTrend = async (req, res) => {
    try {
        let siteSettingData = await SiteSetting.findOne({}, { 'faqTrend': 1 })
        if (!siteSettingData) {
            return res.status(400).json({ 'success': false, 'message': "There is no setting" })
        }

        let doc = await Faq.find({
            "_id": { "$in": siteSettingData.faqTrend },
            'status': 'active'
        }, {
            "question": 1,
            "answer": 1
        })

        return res.status(200).json({ 'success': true, 'message': "Fetch success", 'result': doc })
    } catch (err) {
        return res.status(500).json({ 'success': false, 'message': "Something went wrong" })
    }
}