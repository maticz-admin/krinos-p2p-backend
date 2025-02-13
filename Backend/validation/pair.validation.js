// import package
import mongoose from 'mongoose';

// import lib
import isEmpty from '../lib/isEmpty';

/** 
 * Add Spot Trade Pair
 * METHOD : POST
 * URL : /adminapi/spotPair
 * BODY : firstCurrencyId, firstFloatDigit, secondCurrencyId, secondFloatDigit, minPricePercentage, maxPricePercentage, maxQuantity, minQuantity, maker_rebate, taker_fees, markupPercentage, botstatus
*/
export const addSpotPairValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.firstCurrencyId)) {
        errors.firstCurrencyId = "baseCurrency field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.firstCurrencyId)) {
        errors.firstCurrencyId = "Invalid basecurrency";
    }

    if (isEmpty(reqBody.firstFloatDigit)) {
        errors.firstFloatDigit = "baseCurrency floatDigit field is required";
    } else if (isNaN(reqBody.firstFloatDigit)) {
        errors.firstFloatDigit = "Allows only numeric";
    } else if (reqBody.firstFloatDigit <= 0) {
        errors.firstFloatDigit = "invalid value";
    }

    if (isEmpty(reqBody.secondCurrencyId)) {
        errors.secondCurrencyId = "quoteCurrency field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.secondCurrencyId)) {
        errors.secondCurrencyId = "Invalid quoteCurrency";
    } else if (reqBody.firstCurrencyId == reqBody.secondCurrencyId) {
        errors.secondCurrencyId = "Currency pair not be same";
    }

    if (isEmpty(reqBody.secondFloatDigit)) {
        errors.secondFloatDigit = "quoteCurrency floatDigit field is required";
    } else if (isNaN(reqBody.secondFloatDigit)) {
        errors.secondFloatDigit = "Allows only numeric";
    }
    else if (reqBody.secondFloatDigit <= 0) {
        errors.secondFloatDigit = "invalid value";
    }
    if (isEmpty(reqBody.markPrice)) {
        errors.markPrice = "markPrice field is required";
    } else if (isNaN(reqBody.taker_fees)) {
        errors.markPrice = "Allows only numeric";
    }
    else if (reqBody.markPrice <= 0) {
        errors.markPrice = "invalid value";
    }

    if (isEmpty(reqBody.minPricePercentage)) {
        errors.minPricePercentage = "minPricePercentage field is required";
    } else if (isNaN(reqBody.minPricePercentage)) {
        errors.minPricePercentage = "Allows only numeric";
    } else if (reqBody.minPricePercentage <= 0) {
        errors.minPricePercentage = "invalid value";
    }


    if (isEmpty(reqBody.maxPricePercentage)) {
        errors.maxPricePercentage = "maxPricePercentage field is required";
    } else if (isNaN(reqBody.maxPricePercentage)) {
        errors.maxPricePercentage = "Allows only numeric";
    } else if (reqBody.maxPricePercentage <= 0) {
        errors.maxPricePercentage = "invalid value";
    } else if (reqBody.maxPricePercentage < reqBody.minPricePercentage) {
        errors.maxPricePercentage = "Amount is less then Minimum Amount";
    }

    if (isEmpty(reqBody.maxQuantity)) {
        errors.maxQuantity = "maxQuantity field is required";
    } else if (isNaN(reqBody.maxQuantity)) {
        errors.maxQuantity = "Allows only numeric";
    } else if (reqBody.maxQuantity <= 0) {
        errors.maxQuantity = "invalid value";
    } else if (parseFloat(reqBody.maxQuantity) < parseFloat(reqBody.minQuantity)) {
        errors.maxQuantity = "Quantity is less then Minimum quantity";
    }

    if (isEmpty(reqBody.minQuantity)) {
        errors.minQuantity = "minQuantity field is required";
    } else if (isNaN(reqBody.minQuantity)) {
        errors.minQuantity = "Allows only numeric";
    } else if (reqBody.minQuantity <= 0) {
        errors.minQuantity = "invalid value";
    }

    if (isEmpty(reqBody.maker_rebate)) {
        errors.maker_rebate = "maker_rebate field is required";
    } else if (isNaN(reqBody.maker_rebate)) {
        errors.maker_rebate = "Allows only numeric";
    } else if (reqBody.maker_rebate <= 0) {
        errors.maker_rebate = "invalid value";
    }


    if (isEmpty(reqBody.taker_fees)) {
        errors.taker_fees = "taker_fees field is required";
    } else if (isNaN(reqBody.taker_fees)) {
        errors.taker_fees = "Allows only numeric";
    } else if (reqBody.taker_fees <= 0) {
        errors.taker_fees = "invalid value";
    }



    if (isEmpty(reqBody.botstatus)) {
        errors.botstatus = "botstatus field is required";
    } else if (!['off', 'binance'.includes(reqBody.botstatus)]) {
        errors.botstatus = "Invalid bot status";
    }

    if (reqBody.botstatus == 'binance') {
        if (isEmpty(reqBody.markupPercentage)) {
            errors.markupPercentage = "markupPercentage field is required";
        } else if (isNaN(reqBody.markupPercentage)) {
            errors.markupPercentage = "Allows only numeric";
        } else if (reqBody.markupPercentage <= 0) {
            errors.markupPercentage = "invalid value";
        }

    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/** 
 * Edit Spot Trade Pair
 * METHOD : POST
 * URL : /adminapi/spotPair
 * BODY : pairId, firstCurrencyId, firstFloatDigit, secondCurrencyId, secondFloatDigit, minPricePercentage, maxPricePercentage, maxQuantity, minQuantity, maker_rebate, taker_fees, markupPercentage, botstatus
*/
export const editSpotPairValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.pairId)) {
        errors.pairId = "pairId field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.pairId)) {
        errors.pairId = "Invalid pairId";
    }

    if (isEmpty(reqBody.firstCurrencyId)) {
        errors.firstCurrencyId = "baseCurrency field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.firstCurrencyId)) {
        errors.firstCurrencyId = "Invalid basecurrency";
    }

    if (isEmpty(reqBody.firstFloatDigit)) {
        errors.firstFloatDigit = "baseCurrency floatDigit field is required";
    } else if (isNaN(reqBody.firstFloatDigit)) {
        errors.firstFloatDigit = "Allows only numeric";
    } else if (reqBody.firstFloatDigit <= 0) {
        errors.firstFloatDigit = "invalid value";
    }

    if (isEmpty(reqBody.secondCurrencyId)) {
        errors.secondCurrencyId = "quoteCurrency field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.secondCurrencyId)) {
        errors.secondCurrencyId = "Invalid quoteCurrency";
    } else if (reqBody.firstCurrencyId == reqBody.secondCurrencyId) {
        errors.secondCurrencyId = "Currency pair not be same";
    }

    if (isEmpty(reqBody.secondFloatDigit)) {
        errors.secondFloatDigit = "quoteCurrency floatDigit field is required";
    } else if (isNaN(reqBody.secondFloatDigit)) {
        errors.secondFloatDigit = "Allows only numeric";
    } else if (reqBody.secondFloatDigit <= 0) {
        errors.secondFloatDigit = "invalid value";
    }

    if (isEmpty(reqBody.minPricePercentage)) {
        errors.minPricePercentage = "minPricePercentage field is required";
    } else if (isNaN(reqBody.minPricePercentage)) {
        errors.minPricePercentage = "Allows only numeric";
    } else if (reqBody.minPricePercentage <= 0) {
        errors.minPricePercentage = "invalid value";
    }


    if (isEmpty(reqBody.maxPricePercentage)) {
        errors.maxPricePercentage = "maxPricePercentage field is required";
    } else if (isNaN(reqBody.maxPricePercentage)) {
        errors.maxPricePercentage = "Allows only numeric";
    } else if (reqBody.maxPricePercentage <= 0) {
        errors.maxPricePercentage = "invalid value";
    } else if (reqBody.maxPricePercentage < reqBody.minPricePercentage) {
        errors.maxPricePercentage = "Amount is less then Minimum Amount";
    }

    if (isEmpty(reqBody.markPrice)) {
        errors.markPrice = "markPrice field is required";
    } else if (isNaN(reqBody.taker_fees)) {
        errors.markPrice = "Allows only numeric";
    } else if (reqBody.markPrice <= 0) {
        errors.markPrice = "invalid value";
    }

    if (isEmpty(reqBody.maxQuantity)) {
        errors.maxQuantity = "maxQuantity field is required";
    } else if (isNaN(reqBody.maxQuantity)) {
        errors.maxQuantity = "Allows only numeric";
    } else if (reqBody.maxQuantity <= 0) {
        errors.maxQuantity = "invalid value";
    } else if (parseFloat(reqBody.maxQuantity) < parseFloat(reqBody.minQuantity)) {
        errors.maxQuantity = "Quantity is less then Minimum quantity";
    }


    if (isEmpty(reqBody.minQuantity)) {
        errors.minQuantity = "minQuantity field is required";
    } else if (isNaN(reqBody.minQuantity)) {
        errors.minQuantity = "Allows only numeric";
    } else if (reqBody.minQuantity <= 0) {
        errors.minQuantity = "invalid value";
    }


    if (isEmpty(reqBody.maker_rebate)) {
        errors.maker_rebate = "maker_rebate field is required";
    } else if (isNaN(reqBody.maker_rebate)) {
        errors.maker_rebate = "Allows only numeric";
    } else if (reqBody.maker_rebate <= 0) {
        errors.maker_rebate = "invalid value";
    }



    if (isEmpty(reqBody.taker_fees)) {
        errors.taker_fees = "taker_fees field is required";
    } else if (isNaN(reqBody.taker_fees)) {
        errors.taker_fees = "Allows only numeric";
    } else if (reqBody.taker_fees <= 0) {
        errors.taker_fees = "invalid value";
    }


    if (isEmpty(reqBody.botstatus)) {
        errors.botstatus = "botstatus field is required";
    } else if (!['off', 'binance'.includes(reqBody.botstatus)]) {
        errors.botstatus = "Invalid bot status";
    }

    if (reqBody.botstatus == 'binance') {
        if (isEmpty(reqBody.markupPercentage)) {
            errors.markupPercentage = "markupPercentage field is required";
        } else if (isNaN(reqBody.markupPercentage)) {
            errors.markupPercentage = "Allows only numeric";
        } else if (reqBody.markupPercentage <= 0) {
            errors.markupPercentage = "invalid value";
        }

    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}