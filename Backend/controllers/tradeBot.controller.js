
// import model
import {
    SpotPair,
    SpotTrade,
    User
} from '../models';

// import lib
import isEmpty from '../lib/isEmpty';

/** 
 * Add Trade Bot For Open Order
 * URL : /adminapi/openOrderBot
 * METHOD : POST
 * BODY : pairId, side, startPrice, endPrice, startQuantity, endQuantity, count
*/
export const openOrderBot = async (req, res) => {
    try {
        let reqBody = req.body;
        reqBody.startQuantity = parseFloat(reqBody.startQuantity)
        reqBody.endQuantity = parseFloat(reqBody.endQuantity)
        reqBody.startPrice = parseFloat(reqBody.startPrice)
        reqBody.endPrice = parseFloat(reqBody.endPrice)

        let pairData = await SpotPair.findOne({ "_id": reqBody.pairId });

        if (!pairData) {
            return res.status(400).json({ 'status': false, 'errors': { "pairId": "Invalid Pair" } });
        }

        if (reqBody.startQuantity < pairData.minQuantity) {
            return res.status(400).json({ 'status': false, 'errors': { 'startQuantity': "Quantity of contract must not be lesser than " + pairData.minQuantity } });
        } else if (reqBody.endQuantity < pairData.maxQuantity) {
            return res.status(400).json({ 'status': false, 'errors': { 'endQuantity': "Quantity of contract must not be lesser than " + pairData.maxQuantity } });
        }

        let minPrice = pairData.markPrice - (pairData.markPrice * (pairData.minPricePercentage / 100)),
            maxPrice = pairData.markPrice + (pairData.markPrice * (pairData.maxPricePercentage / 100));


        if (reqBody.startPrice < minPrice) {
            return res.status(400).json({ 'status': false, 'errors': { 'startPrice': "Price of contract must not be lesser than " + minPrice } });
        } else if (reqBody.endPrice < maxPrice) {
            return res.status(400).json({ 'status': false, 'errors': { 'endPrice': "Price of contract must not be lesser than " + maxPrice } });
        }

        // let userData = await User.findOne({})


    } catch (err) {
    }
}

export const placeBotOrder = (pairData, startCnt = 0, endCnt = 0) => {
    try {
        if (isEmpty(pairData)) {
            return true
        } else if (startCnt <= endCnt) {
            return true
        }

        const newSpotTrade = new SpotOrder({
            userId: req.user.id,
            pairId: spotPairData._id,
            firstCurrencyId: spotPairData.firstCurrencyId,
            firstCurrency: spotPairData.firstCurrencySymbol,
            secondCurrencyId: spotPairData.secondCurrencyId,
            secondCurrency: spotPairData.secondCurrencySymbol,
            quantity: reqBody.quantity,
            price: reqBody.price,
            orderValue: reqBody.price * reqBody.quantity,
            pairName: `${spotPairData.firstCurrencySymbol}${spotPairData.secondCurrencySymbol}`,
            beforeBalance: balance,
            afterBalance: updateUserAsset.spotwallet,
            orderType: reqBody.orderType,
            orderDate: new Date(),
            buyorsell: reqBody.buyorsell,
            status: 'open',
        });

    } catch (err) {

    }
}