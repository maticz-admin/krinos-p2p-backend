// import package\
import axios from 'axios';

// import config
import config from '../config';

// import model
import {
    PriceConversion,
    Currency
} from '../models';
;

// import controller
import * as binanceCtrl from './binance.controller'

// import lib
import isEmpty from '../lib/isEmpty';
import { replacePair } from '../lib/pairHelper';

import {
    paginationQuery,
    filterSearchQuery
} from '../lib/adminHelpers'


/** 
 * Price conversion in CRON
*/
export const priceCNV = async () => {
    try {
        let conversionList = await PriceConversion.find({});
        if (conversionList && conversionList.length > 0) {
            for (let item of conversionList) {
                if(item.fetchstatus == "binance"){
                    let binancePrice = await binanceCtrl.marketPrice();
                    if (!isEmpty(binancePrice) && binancePrice[item.baseSymbol + replacePair(item.convertSymbol)]) {
                        await PriceConversion.updateOne({
                            "_id": item._id
                        }, {
                            "$set": {
                                'convertPrice': binancePrice[item.baseSymbol + replacePair(item.convertSymbol)]
                            }
                        })
                    }
                }
                // else if(item.fetchstatus == "cryptocompare"){
                    else{

                    const apiResponse = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${item.baseSymbol}&tsyms=${item.convertSymbol}&api_key=992a1af046390a4cacad8c3ec775ced0291f843d3bdae43d2350f00ebf899fca`)
                    const apiResponseJson = await apiResponse.json();
                    if(apiResponseJson && apiResponseJson[item.convertSymbol]) {
                        var convertPrice = apiResponseJson[item.convertSymbol];

                        await PriceConversion.updateOne({
                            "_id": item._id
                        }, {
                            "$set": {
                                'convertPrice': convertPrice
                            }
                        })
                        // updateData.convertPrice = convertPrice;
                    }
                }
            }
        }
    } catch (err) {
    }
}


/** 
 * Add Price Conversion 
*/
export const addPriceCNV = async (currencyData) => {
    try {
        if (currencyData.type == 'fiat') {
            let currencyList = await Currency.find({
                "type": {
                    "$in": ['crypto', 'token']
                }
            });

            if (currencyList && currencyList.length > 0) {

                let binancePrice = await binanceCtrl.marketPrice();

                for (let item of currencyList) {
                    if (!['USDT'].includes(item.coin)) {
                        if (item.coin != currencyData.coin) {
                            let checkPrice = await PriceConversion.findOne({
                                'baseSymbol': item.coin,
                                'convertSymbol': currencyData.coin,
                            })

                            if (!checkPrice) {
                                let newDoc = new PriceConversion({
                                    'baseSymbol': item.coin,
                                    'convertSymbol': currencyData.coin,
                                    'convertPrice': !isEmpty(binancePrice) && binancePrice[item.coin + replacePair(currencyData.coin)] ? binancePrice[item.coin + replacePair(currencyData.coin)] : 1
                                })
                                await newDoc.save()
                            }
                        }
                    }
                }
            }
            return true
        } else if (['crypto', 'token'].includes(currencyData.type)) {
            await AddPriceconver()
            if (['USDT'].includes(currencyData.coin)) {
                return false
            }

            let currencyList = await Currency.find({
                "type": {
                    "$in": ['crypto','token']
                }
            });

            if (currencyList && currencyList.length > 0) {

                let binancePrice = await binanceCtrl.marketPrice();
                for (let item of currencyList) {
                    if (item.coin != currencyData.coin) {
                        let checkPrice = await PriceConversion.findOne({
                            'baseSymbol': currencyData.coin,
                            'convertSymbol': item.coin,
                        })

                        if (!checkPrice) {
                            let newDoc = new PriceConversion({
                                'baseSymbol': currencyData.coin,
                                'convertSymbol': item.coin,
                                'convertPrice': !isEmpty(binancePrice) && binancePrice[currencyData.coin + replacePair(item.coin)] ? binancePrice[currencyData.coin + replacePair(item.coin)] : 1
                            })
                            await newDoc.save()
                        }
                    }
                }
            }
            return true
        }
        return false
    } catch (err) {
        return false
    }
}
 export const AddPriceconver =async ()=>{
    try{
        let currencylist = await Currency.find({
            "type": {
            "$in": ['crypto','token']
        }})
        for(let currencyData of currencylist ){
            if (['crypto', 'token'].includes(currencyData.type)) {
                if (['USDT'].includes(currencyData.coin)) {
                    continue
                }
                let currencyList = await Currency.find({
                    "type": {
                        "$in": ['crypto','token']
                    }
                });
        
                if (currencyList && currencyList.length > 0) {
        
                    let binancePrice = await binanceCtrl.marketPrice();
                    
                    for (let item of currencyList) {
                        if (item.coin != currencyData.coin) {
                            let checkPrice = await PriceConversion.findOne({
                                'baseSymbol': currencyData.coin,
                                'convertSymbol': item.coin,
                            })
                            if (!checkPrice) {
                                let newDoc = new PriceConversion({
                                    'baseSymbol': currencyData.coin,
                                    'convertSymbol': item.coin,
                                    'convertPrice': !isEmpty(binancePrice) && binancePrice[currencyData.coin + replacePair(item.coin)] ? binancePrice[currencyData.coin + replacePair(item.coin)] : 1
                                })
                                await newDoc.save()
                            }
                        }
                    }
                }
               continue
            }
        }
 }catch(err){
 }
}
export const getPriceCNVlist = async (req, res) => {
    try {

        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['baseSymbol', 'convertSymbol']);
        let count = await PriceConversion.countDocuments(filter)
        let data = await PriceConversion.find(filter, {
            'baseSymbol': 1,
            'convertSymbol': 1,
            'convertPrice': 1,
            'fetchstatus':1
        }).skip(pagination.skip).limit(pagination.limit)

        let result = {
            count,
            data
        }
        return res.status(200).json({ 'success': true, "messages": "success", result })


    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "Error on server" })

    }
}


export const priceCNVUpdate = async (req, res) => {
    try {
        const reqBody = req.body;
        await PriceConversion.updateOne({
            "_id": reqBody.priceCNVId
        }, {
            "$set": {
                'convertPrice': reqBody.convertPrice,
                'fetchstatus': reqBody.fetchstatus
            }
        })
        return res.status(200).json({ 'message': 'Price updated successfully. Refreshing data...' })

    } catch (err) {
        return res.status(500).json({ "success": false, 'message': "Error on server" })

    }
}