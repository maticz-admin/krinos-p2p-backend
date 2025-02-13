// import package
import mongoose from 'mongoose';

// import lib
import isEmpty, { isBoolean } from '../lib/isEmpty';

/** 
* Add Currency
* URL : /adminapi/currency
* METHOD : POST
* BODY : name, symbol, coin, image, contractAddress, minABI, contractDecimal, decimal, tokenType, bankName, accountNo, holderName, bankcode, country, withdrawFee, minimumWithdraw, depositType, fundLimit, fundFee, fundInterval
*/
export const addValid = (req, res, next) => {
    let errors = {}, reqBody = req.body, reqFile = req.files;
    console.log('errors-----', errors, reqBody, reqFile)
    return false;
    const regex = new RegExp(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);
    if (isEmpty(reqBody.name)) {
        errors.name = "Name field is required";
    }

    if (isEmpty(reqBody.coin)) {
        errors.coin = "Coin field is required";
    }

    if (isEmpty(reqBody.symbol)) {
        errors.symbol = "Symbol field is required";
    }
    if(reqBody?.depositType == "coin_payment"){
        if (isEmpty(reqBody.coinpaymentsymbol)) {
            errors.coinpaymentsymbol = "Coinpayment Symbol field is required";
        }
    }
    

    if (isEmpty(reqFile.image)) {
        errors.image = "REQUIRED";
    }

    if (isEmpty(reqBody.commisionfee)) {
        errors.commisionfee = "Commisionfee field is required";
    } else if (reqBody.commisionfee <= 0) {
        errors.commisionfee = "Please Enter Valid Commisionfee";
    } else if (!isEmpty(reqBody.commisionfee) && isNaN(reqBody.commisionfee)) {
        errors.commisionfee = "ALLOW_NUMERIC";
    } else if (parseInt(reqBody.commisionfee) < 0) {
        errors.commisionfee = "Invalid value";
    }

    if (isEmpty(reqBody.withdrawFee)) {
        errors.withdrawFee = "Withdrawfee field is required";
    } else if (reqBody.withdrawFee <= 0) {
        errors.withdrawFee = "Please Enter Valid WithdrawFee";
    } else if (!isEmpty(reqBody.withdrawFee) && isNaN(reqBody.withdrawFee)) {
        errors.withdrawFee = "ALLOW_NUMERIC";
    } else if (parseInt(reqBody.withdrawFee) < 0) {
        errors.withdrawFee = "Invalid value";
    }


    if (isEmpty(reqBody.minimumWithdraw)) {
        errors.minimumWithdraw = "Minimum withdraw field is required";
    } else if (reqBody.minimumWithdraw <= 0) {
        errors.minimumWithdraw = "Please Enter Valid MinimumWithdraw";
    } else if (!isEmpty(reqBody.minimumWithdraw) && isNaN(reqBody.minimumWithdraw)) {
        errors.minimumWithdraw = "ALLOW_NUMERIC";
    } else if (parseInt(reqBody.minimumWithdraw) < 0) {
        errors.minimumWithdraw = "Invalid value";
    }

    if (isEmpty(reqBody.depositStatus)) {
        errors.depositStatus = "REQUIRED";
    } else if (!['On', 'Off'].includes(reqBody.depositStatus)) {
        errors.depositStatus = "INVALID_TYPE";
    }

    if (isEmpty(reqBody.withdrawStatus)) {
        errors.withdrawStatus = "REQUIRED";
    } else if (!['On', 'Off'].includes(reqBody.withdrawStatus)) {
        errors.withdrawStatus = "INVALID_TYPE";
    }

    if (isEmpty(reqBody.type)) {
        errors.type = "REQUIRED";
    } else if (!['crypto', 'token', 'fiat','preferedcurrency'].includes(reqBody.type)) {
        errors.type = "INVALID_TYPE";
    }

    if (isEmpty(reqBody.depositType)) {
        errors.depositType = "REQUIRED";
    } else if (!['local', 'coin_payment', 'binance'].includes(reqBody.depositType)) {
        errors.depositType = "INVALID_TYPE";
    }
    if(reqBody.depositType == "local"){
        if(isEmpty(reqBody?.api)){
            // errors.api = "Api field is required";
        }
        else if (!regex.test(reqBody?.api)){
            errors.api = "Invalid api url"
        }
        if(isEmpty(reqBody?.key)){
            // errors.key = "Key field is required";
        }
    }
    if (isEmpty(reqBody.decimals) || reqBody.decimals == 0) {
        errors.decimals = "Decimals field is required";
    } else if (isNaN(reqBody.decimals)) {
        errors.decimals = "ALLOW_NUMERIC";
    } else if (parseInt(reqBody.decimals) < 0) {
        errors.decimals = "Invalid value";
    }
    if (reqBody.type == 'token') {
        if (isEmpty(reqBody.contractAddress)) {
            errors.contractAddress = "REQUIRED";
        }
        if (isEmpty(reqBody.minABI)) {
            errors.minABI = "Min ABI field is required";
        }
        
        if (isEmpty(reqBody.tokenType)) {
            errors.tokenType = "REQUIRED";
        } else if (!['erc20', 'trc20', 'bep20'].includes(reqBody.tokenType)) {
            errors.tokenType = "INVALID_TYPE";
        }

    } else if (reqBody.type == 'fiat' && reqBody.payment == 'bank') {
        if (isEmpty(reqBody.bankName)) {
            errors.bankName = "Bank name field is required";
        }
        if (isEmpty(reqBody.accountNo)) {
            errors.accountNo = "Account number field is required";
        }
        if (isEmpty(reqBody.holderName)) {
            errors.holderName = "Holder name field is required";
        }
        if (isEmpty(reqBody.bankcode)) {
            errors.bankcode = "IBN code field is required";
        }
        if (isEmpty(reqBody.country)) {
            errors.country = "Country field is required";
        }
    } else if (reqBody.type == 'fiat' && reqBody.payment == 'upi') {
        if (isEmpty(reqBody.upiInputValue)) {
            errors.upiInputValue = "UPI field is required";
        }
    }
    console.log('errors------', errors)
    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/** 
* Update Currency
* URL : /adminapi/currency
* METHOD : PUT
* BODY : currencyId, name, symbol, coin, image, contractAddress, minABI, contractDecimal, decimal, tokenType, bankName, accountNo, holderName, bankcode, country, withdrawFee, minimumWithdraw, depositType, status, fundLimit, fundFee, fundInterval
*/
export const editValid = (req, res, next) => {
    let errors = {}, reqBody = req.body, reqFile = req.files;
    const regex = new RegExp(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);

    if (isEmpty(reqBody.currencyId)) {
        errors.currencyId = "CurrencyId field is required";
    } else if (!(mongoose.Types.ObjectId.isValid(reqBody.currencyId))) {
        errors.currencyId = "CurrencyId is invalid";
    }

    if (isEmpty(reqBody.name)) {
        errors.name = "Name field is required";
    }
    if(reqBody?.depositType == "coin_payment"){
        if (isEmpty(reqBody.coinpaymentsymbol)) {
            errors.coinpaymentsymbol = "Coinpayment Symbol field is required";
        }
    }
    

    if (isEmpty(reqBody.coin)) {
        errors.coin = "Coin field is required";
    }

    if (isEmpty(reqBody.symbol)) {
        errors.symbol = "Symbol field is required";
    }

    if (isEmpty(reqBody.withdrawFee)) {
        errors.withdrawFee = "Withdrawfee field is required";
    }  else if (reqBody.withdrawFee <= 0) {
        errors.withdrawFee = "Please Enter Valid WithdrawFee";
    } else if (!isEmpty(reqBody.withdrawFee) && isNaN(reqBody.withdrawFee)) {
        errors.withdrawFee = "ALLOW_NUMERIC";
    } else if (parseInt(reqBody.withdrawFee) < 0) {
        errors.withdrawFee = "Invalid value";
    }


    if (isEmpty(reqBody.minimumWithdraw)) {
        errors.minimumWithdraw = "Minimum withdraw field is required";
    }  else if (reqBody.minimumWithdraw <= 0) {
        errors.minimumWithdraw = "Please Enter Valid MinimumWithdraw";
    }  else if (!isEmpty(reqBody.minimumWithdraw) && isNaN(reqBody.minimumWithdraw)) {
        errors.minimumWithdraw = "ALLOW_NUMERIC";
    } else if (parseInt(reqBody.minimumWithdraw) < 0) {
        errors.minimumWithdraw = "Invalid value";
    }

    if (isEmpty(reqBody.depositStatus)) {
        errors.depositStatus = "REQUIRED";
    } else if (!['On', 'Off'].includes(reqBody.depositStatus)) {
        errors.depositStatus = "INVALID_TYPE";
    }

    if (isEmpty(reqBody.withdrawStatus)) {
        errors.withdrawStatus = "REQUIRED";
    } else if (!['On', 'Off'].includes(reqBody.withdrawStatus)) {
        errors.withdrawStatus = "INVALID_TYPE";
    }

    if (isEmpty(reqBody.type)) {
        errors.type = "REQUIRED";
    } else if (!['crypto', 'token', 'fiat' , 'preferedcurrency'].includes(reqBody.type)) {
        errors.type = "INVALID_TYPE";
    }

    if (isEmpty(reqBody.status)) {
        errors.status = "Invalid";
    } else if (!['active', 'Inactive'].includes(reqBody.status)) {
        errors.status = "Invalid";
    }

    if (isEmpty(reqBody.commisionfee)) {
        errors.commisionfee = "Commisionfee field is required";
    } else if (reqBody.commisionfee <= 0) {
        errors.commisionfee = "Please Enter Valid Commisionfee";
    } else if (!isEmpty(reqBody.commisionfee) && isNaN(reqBody.commisionfee)) {
        errors.commisionfee = "ALLOW_NUMERIC";
    } else if (parseInt(reqBody.commisionfee) < 0) {
        errors.commisionfee = "Invalid value";
    }

    if (isEmpty(reqBody.decimal) || reqBody.decimal == 0) {
        errors.decimal = "Decimal field is required";
    } else if (isNaN(reqBody.decimal)) {
        errors.decimal = "ALLOW_NUMERIC";
    } else if (parseInt(reqBody.decimal) < 0) {
        errors.decimal = "Invalid value";
    }

    if(reqBody.depositType == "local"){
        if(isEmpty(reqBody?.api)){
            // errors.api = "REQUIRED";
        }
        else if (!regex.test(reqBody?.api)){
            errors.api = "Invalid api url"
        }
        if(isEmpty(reqBody?.key)){
            // errors.key = "REQUIRED";
        }
    }

    // if (isEmpty(reqBody.fundLimit)) {
    //     errors.fundLimit = "Fund limit field is required";
    // } else if (isNaN(reqBody.fundLimit)) {
    //     errors.fundLimit = "ALLOW_NUMERIC";
    // } else if (reqBody.fundLimit <= 0) {
    //     errors.fundLimit = "Only allow positive numberic value";
    // }

    // if (isEmpty(reqBody.fundInterval)) {
    //     errors.fundInterval = "Fund interval field is required";
    // } else if (isNaN(reqBody.fundInterval)) {
    //     errors.fundInterval = "ALLOW_NUMERIC";
    // } else if (reqBody.fundInterval <= 0) {
    //     errors.fundInterval = "Only allow positive numberic value";
    // }

    // if (isEmpty(reqBody.fundFee)) {
    //     errors.fundFee = "Fund fee field is required";
    // } else if (isNaN(reqBody.fundFee)) {
    //     errors.fundFee = "ALLOW_NUMERIC";
    // } else if (reqBody.fundFee <= 0) {
    //     errors.fundFee = "Only allow positive numberic value";
    // }

    if (reqBody.type == 'token') {
        if (isEmpty(reqBody.contractAddress)) {
            errors.contractAddress = "REQUIRED";
        }

        if (isEmpty(reqBody.minABI)) {
            errors.minABI = "Min ABI field is required";
        }

        if (isEmpty(reqBody.contractDecimal)) {
            errors.contractDecimal = "Contract Decimal field is required";
        } else if (isNaN(reqBody.contractDecimal)) {
            errors.contractDecimal = "ALLOW_NUMERIC";
        }

        if (isEmpty(reqBody.tokenType)) {
            errors.tokenType = "REQUIRED";
        } else if (!['erc20', 'trc20', 'bep20'].includes(reqBody.tokenType)) {
            errors.tokenType = "INVALID_TYPE";
        }

    } else if (reqBody.type == 'fiat') {
        if (isEmpty(reqBody.bankName)) {
            errors.bankName = "Bank name field is required";
        }

        if (isEmpty(reqBody.accountNo)) {
            errors.accountNo = "Account number field is required";
        }

        if (isEmpty(reqBody.holderName)) {
            errors.holderName = "Holder name field is required";
        }

        if (isEmpty(reqBody.bankcode)) {
            errors.bankcode = "IBN code field is required";
        }

        if (isEmpty(reqBody.country)) {
            errors.country = "Country field is required";
        }
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}