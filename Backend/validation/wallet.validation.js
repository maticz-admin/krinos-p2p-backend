// import package
import mongoose from 'mongoose';

// import controller
import { isCryptoAddr } from '../controllers/coin.controller'
import {validatecryptoaddress} from '../config/coinvalidation'

// import lib
import isEmpty from '../lib/isEmpty';

/** 
 * User Withdraw
 * URL: /api/withdraw
 * METHOD : POST
 * BODY: currencyId, amount, bankId, twoFACode
*/
export const fiatWithdrawValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.currencyId)) {
        errors.currencyId = "REQUIRED";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.currencyId)) {
        errors.currencyId = "Invalid currency id";
    }

    if (isEmpty(reqBody.bankId)) {
        errors.bankId = "REQUIRED";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.bankId)) {
        errors.bankId = "INVALID_BANK_ACCOUNT";
    }

    if (isEmpty(reqBody.amount)) {
        errors.amount = "REQUIRED";
    } else if (isNaN(reqBody.amount)) {
        errors.amount = "ALLOW_NUMERIC";
    }

    if (isEmpty(reqBody.twoFACode)) {
        errors.twoFACode = "REQUIRED";
    } else if (isNaN(reqBody.twoFACode) || reqBody.twoFACode.length > 6) {
        errors.twoFACode = "INVALID_CODE";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/** 
 * Coin Withdraw
 * URL: /api/coinWithdraw
 * METHOD : POST
 * BODY: currencyId, destTag, amount, receiverAddress, twoFACode
*/
export const coinWithdrawValid = async (req, res, next) => {
    let errors = {}, reqBody = req.body;
    if (isEmpty(reqBody.currencyId)) {
        errors.currencyId = "REQUIRED";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.currencyId)) {
        errors.currencyId = "Invalid currency id";
    }
    let addressCheck  = await  validatecryptoaddress(reqBody.coin, reqBody.receiverAddress, reqBody.currencyId)
    if (isEmpty(reqBody.receiverAddress)) {
        errors.receiverAddress = "REQUIRED";
    } else if (!addressCheck) {
        errors.receiverAddress = `Invalid ${reqBody.coin} Address`;
    }

    if (reqBody.coin == 'XRP') {
        if (isEmpty(reqBody.destTag)) {
            errors.destTag = "REQUIRED";
        }
    }

    if (isEmpty(reqBody.amount)) {
        errors.amount = "REQUIRED";
    } else if (isNaN(reqBody.amount)) {
        errors.amount = "ALLOW_NUMERIC";
    }

    if (isEmpty(reqBody.twoFACode)) {
        errors.twoFACode = "REQUIRED";
    } else if (isNaN(reqBody.twoFACode) || reqBody.twoFACode.length > 6) {
        errors.twoFACode = "INVALID_CODE";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/** 
 * User Withdraw
 * URL: /api/fiatWithdraw
 * METHOD : PATCH
 * BODY: token
*/
export const tokenValid = (req, res, next) => {
    let api_key = req.header("x-api-key");
    let authorization = req.header('Authorization');
    if (api_key !== null && api_key !== undefined && authorization === undefined) {
        return next();
    }
    else {
        let errors = {}, reqBody = req.body;

        if (isEmpty(reqBody.token)) {
            errors.token = "REQUIRED";
        }

        if (!isEmpty(errors)) {
            return res.status(400).json({ "message": errors.token })
        }

        return next();
    }
}

/** 
 * Sent Deposit Request To Admin
 * URL: /api/fiatDeposit
 * METHOD : POST
 * BODY : userAssetId, amount, image
*/
export const depositReqtValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.userAssetId)) {
        errors.userAssetId = "User Asset field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.userAssetId)) {
        errors.userAssetId = "Invalid userAssetId";
    }

    if (isEmpty(reqBody.amount)) {
        errors.amount = "amount field is required";
    } else if (isNaN(reqBody.amount)) {
        errors.amount = "amount field is required";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }
    return next();
}

/** 
 * Admin Approved Fiat Deposit Request
 * URL: /adminapi/fiatDeposit/approve
 * METHOD : POST
 * BODY : transactionId, amount
*/
export const fiatDepositApproveValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.transactionId)) {
        errors.transactionId = "User Asset field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.transactionId)) {
        errors.transactionId = "Invalid transactionId";
    }

    if (isEmpty(reqBody.amount)) {
        errors.amount = "amount field is required";
    } else if (isNaN(reqBody.amount)) {
        errors.amount = "amount field is required";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }
    return next();
}

/** 
 * Fund Transfer
 * URL : /api/fundTransfer
 * METHOD : POST
 * BODY : currencyId, toUserEmail, amount, twoFACode
*/
export const fundTransferValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/

    if (isEmpty(reqBody.currencyId)) {
        errors.currencyId = "Currency field is required";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.currencyId)) {
        errors.currencyId = "Invalid currency";
    }

    if (isEmpty(reqBody.toUserEmail)) {
        errors.toUserEmail = "Email field is required";
    } else if (!(emailRegex.test(reqBody.toUserEmail))) {
        errors.toUserEmail = "Email is invalid";
    }

    if (isEmpty(reqBody.amount)) {
        errors.amount = "Amount field is required";
    } else if (isNaN(reqBody.amount)) {
        errors.amount = "Amount field is required";
    } else if (reqBody.amount <= 0) {
        errors.amount = "Only allow positive numberic value";
    }

    if (isEmpty(reqBody.twoFACode)) {
        errors.twoFACode = "Twor factor code field is required";
    } else if (isNaN(reqBody.twoFACode)) {
        errors.twoFACode = "Two factor code is invalid";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }
    return next();
}


/** 
 * Wallet Transfer
 * URL: /api/walletTransfer
 * METHOD : POST
 * BODY : fromType, toType, userAssetId, amount
*/
export const walletTransferValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.userAssetId)) {
        errors.userAssetId = "REQUIRED";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.userAssetId)) {
        errors.userAssetId = "REQUIRED";
    }

    if (isEmpty(reqBody.fromType)) {
        errors.fromType = "REQUIRED"
    } else if (!['spot', 'derivative', 'p2p'].includes(reqBody.fromType)) {
        errors.fromType = "INVALID_WALLET_TYPE"
    }

    if (isEmpty(reqBody.toType)) {
        errors.toType = "REQUIRED"
    } else if (!['spot', 'derivative', 'p2p'].includes(reqBody.toType)) {
        errors.toType = "INVALID_WALLET_TYPE"
    } else if (reqBody.fromType == reqBody.toType) {
        errors.toType = "WALLET_MIS_MATCH"
    }

    if (isEmpty(reqBody.amount)) {
        errors.amount = "amount field is required";
    } else if (isNaN(reqBody.amount)) {
        errors.amount = "amount field is required";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }
    return next();
}