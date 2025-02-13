// import package
import mongoose from 'mongoose';

// import lib
import isEmpty from '../lib/isEmpty';

/** 
 * P2P Add Pair
 * URL : /adminapi/p2pPair
 * METHOD : POST
 * BODY : firstCoinId, secondCoinId, feePct, markPrice, fetchMarkPrice, markupPercentage, payment
*/
export const addPairValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    if (isEmpty(reqBody.firstCoinId)) {
        errors.firstCoinId = "Base currency field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.firstCoinId)) {
        errors.firstCoinId = "Invalid base currency";
    }

    if (isEmpty(reqBody.secondCoinId)) {
        errors.secondCoinId = "Quote currency field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.secondCoinId)) {
        errors.secondCoinId = "Invalid quote currency";
    } else if (reqBody.firstCoinId == reqBody.secondCoinId) {
        errors.secondCoinId = "Currency pair not be same";
    }

    if (isEmpty(reqBody.feePct)) {
        errors.feePct = "Fee field is required";
    } else if (isNaN(reqBody.feePct)) {
        errors.feePct = "Only allowed numeric values";
    } else if (parseFloat(reqBody.feePct) < 0) {
        errors.feePct = "Only allowed positive numeric values";
    } else if (parseFloat(reqBody.feePct) > 100) {
        errors.feePct = "Fee should be less than 100%";
    }

    if (reqBody.payment == '[]') {
        errors.payment = "Payment field is required";
    }


    if (isEmpty(reqBody.markPrice)) {
        errors.markPrice = "Mark Price field is required";
    } else if (isNaN(reqBody.markPrice)) {
        errors.markPrice = "Only allowed numeric values";
    } else if (parseFloat(reqBody.markPrice) < 0) {
        errors.markPrice = "Only allowed positive numeric values";
    }

    if (isEmpty(reqBody.fetchMarkPrice)) {
        errors.fetchMarkPrice = "Fetch mark price field is required";
    } else if (!['local', 'binance'.includes(reqBody.fetchMarkPrice)]) {
        errors.fetchMarkPrice = "Invalid fetch mark price";
    }

    if (['binance'].includes(reqBody.fetchMarkPrice)) {
        if (isEmpty(reqBody.markupPercentage)) {
            errors.markupPercentage = "Markup field is required";
        } else if (isNaN(reqBody.markupPercentage)) {
            errors.markupPercentage = "Allows only numeric";
        } else if (parseFloat(reqBody.markupPercentage) < 0) {
            errors.markupPercentage = "Only allowed positive numeric values";
        } else if (parseFloat(reqBody.markupPercentage) > 100) {
            errors.markupPercentage = "Markup should be less than 100%";
        }
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/** 
 * P2P Edit Pair
 * URL : /adminapi/p2pPair
 * METHOD : PUT
 * BODY : pairId, firstCoinId, secondCoinId, feePct, markPrice, fetchMarkPrice, markupPercentage
*/
export const editPairValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.pairId)) {
        errors.pairId = "pairId field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.pairId)) {
        errors.pairId = "Invalid pairId";
    }

    if (isEmpty(reqBody.firstCoinId)) {
        errors.firstCoinId = "Base currency field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.firstCoinId)) {
        errors.firstCoinId = "Invalid base currency";
    }

    if (isEmpty(reqBody.secondCoinId)) {
        errors.secondCoinId = "Quote currency field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.secondCoinId)) {
        errors.secondCoinId = "Invalid quote currency";
    } else if (reqBody.firstCoinId == reqBody.secondCoinId) {
        errors.secondCoinId = "Currency pair not be same";
    }

    if (isEmpty(reqBody.feePct)) {
        errors.feePct = "Fee field is required";
    } else if (isNaN(reqBody.feePct)) {
        errors.feePct = "Only allowed numeric values";
    } else if (parseFloat(reqBody.feePct) < 0) {
        errors.feePct = "Only allowed positive numeric values";
    } else if (parseFloat(reqBody.feePct) > 100) {
        errors.feePct = "Fee should be less than 100%";
    }

    if (reqBody.payment == '[]') {
        errors.payment = "Payment field is required";
    }

    if (['local'].includes(reqBody.fetchMarkPrice)) {
        if (isEmpty(reqBody.markPrice)) {
            errors.markPrice = "Mark Price field is required";
        } else if (isNaN(reqBody.markPrice)) {
            errors.markPrice = "Only allowed numeric values";
        } else if (parseFloat(reqBody.markPrice) <= 0) {
            errors.markPrice = "Only allowed positive numeric values";
        }
    }

    if (isEmpty(reqBody.fetchMarkPrice)) {
        errors.fetchMarkPrice = "Fetch mark price field is required";
    } else if (!['local', 'binance'.includes(reqBody.fetchMarkPrice)]) {
        errors.fetchMarkPrice = "Invalid fetch mark price";
    }

    if (['binance'].includes(reqBody.fetchMarkPrice)) {
        if (isEmpty(reqBody.markupPercentage)) {
            errors.markupPercentage = "Markup field is required";
        } else if (isNaN(reqBody.markupPercentage)) {
            errors.markupPercentage = "Allows only numeric";
        } else if (parseFloat(reqBody.markupPercentage) < 0) {
            errors.markupPercentage = "Only allowed positive numeric values";
        } else if (parseFloat(reqBody.markupPercentage) > 100) {
            errors.markupPercentage = "Markup should be less than 100%";
        }
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * P2P Order Place
 * URL : /api/p2p/orderPlace
 * METHOD : POST
 * BODY : id, payValue, receiveValue
*/
export const orderPlaceValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.id)) {
        errors.id = "id field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.id)) {
        errors.id = "Invalid id";
    }

    if (isEmpty(reqBody.payValue)) {
        errors.payValue = "To pay field is required";
    } else if (isNaN(reqBody.payValue)) {
        errors.payValue = "Only allowed numeric values";
    } else if (parseFloat(reqBody.payValue) < 0) {
        errors.payValue = "Only allowed positive numeric values";
    }

    if (isEmpty(reqBody.receiveValue)) {
        errors.receiveValue = "Receiver value field is required";
    } else if (isNaN(reqBody.receiveValue)) {
        errors.receiveValue = "Only allowed numeric values";
    } else if (parseFloat(reqBody.receiveValue) < 0) {
        errors.receiveValue = "Only allowed positive numeric values";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * P2P Post Ad
 * URL : /api/p2p/postOrder
 * METHOD : POST
 * BODY : firstCoinId, secondCoinId, price, quantity, side, minLimit, maxLimit, payBy, endDate
*/
export const postAdValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.firstCoinId)) {
        errors.firstCoin = "Coin field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.firstCoinId)) {
        errors.firstCoin = "Invalid coin";
    }

    if (isEmpty(reqBody.secondCoinId)) {
        errors.secondCoin = "Coin field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.secondCoinId)) {
        errors.secondCoin = "Invalid coin";
    }

    if (isEmpty(reqBody.price)) {
        errors.price = "Price field is required";
    } else if (isNaN(reqBody.price)) {
        errors.price = "Only allowed numeric values";
    } else if (parseFloat(reqBody.price) <= 0) {
        errors.price = "Only allowed positive numeric values";
    }

    if (isEmpty(reqBody.quantity)) {
        errors.quantity = "Quantity field is required";
    } else if (isNaN(reqBody.quantity)) {
        errors.quantity = "Only allowed numeric values";
    } else if (parseFloat(reqBody.quantity) <= 0) {
        errors.quantity = "Only allowed positive numeric values";
    }

    if (isEmpty(reqBody.side)) {
        errors.side = "REQUIRED";
    } else if (!['buy', 'sell'].includes(reqBody.side)) {
        errors.side = "INVALID SIDE";
    }

    if (isEmpty(reqBody.minLimit)) {
        errors.minLimit = "Min limit field is required";
    } else if (isNaN(reqBody.minLimit)) {
        errors.minLimit = "Only allowed numeric values";
    } else if (parseFloat(reqBody.minLimit) <= 0) {
        errors.minLimit = "Only allowed positive numeric values";
    }

    if (isEmpty(reqBody.maxLimit)) {
        errors.maxLimit = "Max limit field is required";
    } else if (isNaN(reqBody.maxLimit)) {
        errors.maxLimit = "Only allowed numeric values";
    } else if (parseFloat(reqBody.maxLimit) <= 0) {
        errors.maxLimit = "Only allowed positive numeric values";
    }

    if (isEmpty(reqBody.payBy)) {
        errors.payBy = "PayBy field is required";
    }

    if (isEmpty(reqBody.endDate)) {
        errors.endDate = "End Date field is required";
    } else if (new Date(reqBody.endDate) < new Date()) {
        errors.endDate = "Please Select date Greater than Current date";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * P2P Post Ad
 * URL : /api/p2p/postOrder
 * METHOD : POST
 * BODY : id, price, quantity, minLimit, maxLimit, payBy
*/
export const editPostValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.id)) {
        errors.id = "PostID field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.id)) {
        errors.id = "Invalid postId";
    }

    if (isEmpty(reqBody.price)) {
        errors.price = "Price field is required";
    } else if (isNaN(reqBody.price)) {
        errors.price = "Only allowed numeric values";
    } else if (parseFloat(reqBody.price) <= 0) {
        errors.price = "Only allowed positive numeric values";
    }

    if (isEmpty(reqBody.quantity)) {
        errors.quantity = "Quantity field is required";
    } else if (isNaN(reqBody.quantity)) {
        errors.quantity = "Only allowed numeric values";
    } else if (parseFloat(reqBody.quantity) <= 0) {
        errors.quantity = "Only allowed positive numeric values";
    }

    if (isEmpty(reqBody.minLimit)) {
        errors.minLimit = "Min limit field is required";
    } else if (isNaN(reqBody.minLimit)) {
        errors.minLimit = "Only allowed numeric values";
    } else if (parseFloat(reqBody.minLimit) <= 0) {
        errors.minLimit = "Only allowed positive numeric values";
    }

    if (isEmpty(reqBody.maxLimit)) {
        errors.maxLimit = "Max limit field is required";
    } else if (isNaN(reqBody.maxLimit)) {
        errors.maxLimit = "Only allowed numeric values";
    } else if (parseFloat(reqBody.maxLimit) <= 0) {
        errors.maxLimit = "Only allowed positive numeric values";
    }

    if (isEmpty(reqBody.payBy)) {
        errors.payBy = "PayBy field is required";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

export const messageValid = (req, res, next) => {
    try {
        let errors = {};
        let reqBody = req.body
        let reqFiles = req.files
        if ((isEmpty(reqBody.message)) && (isEmpty(reqFiles))) {
            errors.message = 'Message is Empty'
        }
        if (!isEmpty(errors)) {
            return res.status(400).json({ status: false, error: errors })
        }
        return next()
    } catch (err) {
        return res.status(500).json({ status: false, message: 'catch err' })
    }
}