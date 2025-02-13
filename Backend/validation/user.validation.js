// import package
import mongoose from 'mongoose';

// import helpers
import isEmpty, { isBoolean } from '../lib/isEmpty';
import { encodedata , decodedata} from '../lib/cryptoJS'

/** 
 * Create New User Validataion
 * URL: /api/register
 * METHOD : POST
 * BODY : email, phoneCode, phoneNo, formType, password, confirmPassword, reCaptcha, isTerms
*/
export const registerValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    let passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}(?!\S)/g;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

    if (isEmpty(reqBody.formType)) {
        errors.formType = "Form Type field is required";
    } else if (!['email', 'mobile'].includes(reqBody.formType)) {
        errors.formType = "Form Type field is required";
    }

    if (reqBody.formType == 'email') {
        if (isEmpty(reqBody.email)) {
            errors.email = "Email field is required";
        } else if (!(emailRegex.test(reqBody.email))) {
            errors.email = "Email is invalid";
        }
    }

    if (reqBody.formType == 'mobile') {
        if (isEmpty(reqBody.phoneCode)) {
            errors.phoneCode = "Required"
        }

        if (isEmpty(reqBody.phoneNo)) {
            errors.phoneNo = "Required"
        }
    }

    if (isEmpty(reqBody.password)) {
        errors.password = "Password field is required";
    } else if (!(passwordRegex.test(reqBody.password))) {
        errors.password = "Password should contain atleast one uppercase, atleast one lowercase, atleast one number, atleast one special character and minimum 6 and maximum 18";
    } else if (reqBody.password.length > 18) {
        errors.password = "Password should contain atleast one uppercase, atleast one lowercase, atleast one number, atleast one special character and minimum 6 and maximum 18"
    }

    if (isEmpty(reqBody.confirmPassword)) {
        errors.confirmPassword = "Confirm password field is required";
    }
    if (!isEmpty(reqBody.password) && !isEmpty(reqBody.confirmPassword) && reqBody.password != reqBody.confirmPassword) {
        errors.confirmPassword = "Passwords must match";
    }

    if (isEmpty(reqBody.reCaptcha)) {
        errors.reCaptcha = "ReCAPTCHA field is required";
    }

    // if (!(reqBody.isTerms == true)) {
    //     errors.isTerms = "Terms field is required";
    // }


    if (!isEmpty(errors)) {
        return res.status(400).json(encodedata({ "errors": errors }))
    }

    return next();
}

/**
 * User Login
 * METHOD : POST
 * URL : /api/login 
 * BODY : email, phoneCode, phoneNo, formType, password, isTerms, loginHistory
*/
export const loginValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

    if (isEmpty(reqBody.formType)) {
        errors.formType = "Form Type field is required";
    } else if (!['email', 'mobile'].includes(reqBody.formType)) {
        errors.formType = "Form Type field is required";
    }

    if (reqBody.formType == 'email') {
        if (isEmpty(reqBody.email)) {
            errors.email = "EMAIL_REQUIRED";
        } else if (!(emailRegex.test(reqBody.email))) {
            errors.email = "EMAIL_INVALID";
        }
    }

    if (reqBody.formType == 'mobile') {
        if (isEmpty(reqBody.phoneCode)) {
            errors.phoneCode = "Required"
        }

        if (isEmpty(reqBody.phoneNo)) {
            errors.phoneNo = "Required"
        }
    }

    if (isEmpty(reqBody.password)) {
        errors.password = "PASSWORD_REQUIRED";
    }

    // if (!(reqBody.isTerms == true)) {
    //     errors.isTerms = "TERMS_REQUIRED";
    // }

    if (!isEmpty(errors)) {
        return res.status(400).json(encodedata({ "errors": errors }))
    }

    return next();
}

/**
 * Email Verification
 * METHOD : POST
 * URL : /api/confirm-mail 
 * BODY : userId
*/
export const confirmMailValidate = (req, res, next) => {
    let
        errors = {},
        reqBody = req.body;

    if (isEmpty(reqBody.userId)) {
        errors.userId = "UserId field is required";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Edit User Profile
 * METHOD : PUT
 * URL : /api/userProfile
 * BODY : firstName,lastName,blockNo,address,country,state,city,postalCode
*/
export const editProfileValidate = (req, res, next) => {
    let
        errors = {},
        reqBody = req.body;

    if (isEmpty(reqBody.firstName)) {
        errors.firstName = "REQUIRED";
    }

    if (isEmpty(reqBody.lastName)) {
        errors.lastName = "REQUIRED";
    }

    // if (isEmpty(reqBody.blockNo)) {
    //     errors.blockNo = "REQUIRED";
    // }

    if (isEmpty(reqBody.address)) {
        errors.address = "REQUIRED";
    }

    if (isEmpty(reqBody.country)) {
        errors.country = "REQUIRED";
    }

    // if (isEmpty(reqBody.state)) {
    //     errors.state = "REQUIRED";
    // }

    if (isEmpty(reqBody.city)) {
        errors.city = "REQUIRED";
    }

    if (isEmpty(reqBody.postalCode)) {
        errors.postalCode = "REQUIRED";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Update Bank Detail
 * METHOD : POST
 * URL : /api/bankdetail
 * BODY : bankId, bankName,accountNo,holderName,bankcode,country,city,bankAddress,currencyId,currencySymbol
 */
export const editBankValidate = (req, res, next) => {
    let
        errors = {},
        reqBody = req.body;
    // let patt = /^([0-9]{11})|([0-9]{2}-[0-9]{3}-[0-9]{6})$/;


    // if(patt){
    //     errors.accountNo = "Enter Valid Account No";

    // }
    if (isEmpty(reqBody.bankName)) {
        errors.bankName = "REQUIRED";
    }

    if (isEmpty(reqBody.accountNo)) {
        errors.accountNo = "REQUIRED";
    }

    if (isEmpty(reqBody.holderName)) {
        errors.holderName = "REQUIRED";
    }

    if (isEmpty(reqBody.bankcode)) {
        errors.bankcode = "REQUIRED";
    }

    if (isEmpty(reqBody.country)) {
        errors.country = "REQUIRED";
    }

    if (isEmpty(reqBody.city)) {
        errors.city = "REQUIRED";
    }

    if (isEmpty(reqBody.bankAddress)) {
        errors.bankAddress = "REQUIRED";
    }

    if (isEmpty(reqBody.currencyId)) {
        errors.currencyId = "REQUIRED";
    }

    if (isEmpty(reqBody.currencyId)) {
        errors.currencyId = "REQUIRED";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.currencyId)) {
        errors.currencyId = "Invalid Currency";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Delete Bank Detail
 * METHOD : PUT
 * URL : /api/bankdetail
 * BODY : bankId
*/
export const deleteBankValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.bankId)) {
        errors.bankId = "REQUIRED";
    } else if (!mongoose.Types.ObjectId.isValid(reqBody.bankId)) {
        errors.bankId = "Invalid bank id";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Change New Password
 * METHOD : POST
 * URL : /api/changePassword
 * BODY : password, confirmPassword, oldPassword
*/
export const changePwdValidate = (req, res, next) => {
    let errors = {};
    let reqBody = req.body;
    let passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}(?!\S)/;


    if (isEmpty(reqBody.oldPassword)) {
        errors.oldPassword = "CURRENT_PASSWORD_REQUIRED";
    }else if (!(passwordRegex.test(reqBody.oldPassword))) {
        errors.oldPassword = "invalid password";
    }

    if (isEmpty(reqBody.password)) {
        errors.password = "PASSWORD_REQUIRED";
    } 
    else if (!(passwordRegex.test(reqBody.password))) {
        errors.password = "invalid password";
    }

    if (isEmpty(reqBody.confirmPassword)) {
        errors.confirmPassword = "CONFIRM_PASSWORD_REQUIRED";
    } else if (!isEmpty(reqBody.password) && !isEmpty(reqBody.confirmPassword) && reqBody.password != reqBody.confirmPassword) {
        errors.confirmPassword = "CONFIRM_PASSWORD_MISMATCH";
    } else if (!(passwordRegex.test(reqBody.confirmPassword))) {
        errors.confirmPassword = "invalid password";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Update 2FA Code
 * METHOD : PUT
 * URL : /api/security/2fa
 * BODY : code, secret, uri
 */
export const update2faValid = (req, res, next) => {
    let errors = {};
    let reqBody = req.body;

    if (isEmpty(reqBody.code)) {
        errors.code = "REQUIRED";
    } else if (isNaN(reqBody.code) || reqBody.code.length > 6) {
        errors.code = "INVALID_CODE";
    }

    if (isEmpty(reqBody.secret)) {
        errors.secret = "REQUIRED";
    }

    if (isEmpty(reqBody.uri)) {
        errors.uri = "REQUIRED";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Edit User Setting
 * METHOD : PUT
 * URL : /api/userSetting
 * BODY : languageId, theme, currencySymbol, timeZone(name,GMT), afterLogin(page,url)
 */
export const editSettingValid = (req, res, next) => {
    let errors = {};
    let reqBody = req.body;

    // if (isEmpty(reqBody.languageId)) {
    //     errors.languageId = "REQUIRED";
    // }

    if (isEmpty(reqBody.theme)) {
        errors.theme = "REQUIRED";
    }

    // if (isEmpty(reqBody.currencySymbol)) {
    //     errors.currencySymbol = "REQUIRED";
    // }

    // if (reqBody.timeZone && (isEmpty(reqBody.timeZone.name) || isEmpty(reqBody.timeZone.GMT))) {
    //     errors.timeZone = "REQUIRED"
    // } else if (!reqBody.timeZone) {
    //     errors.timeZone = "REQUIRED"
    // }

    if (reqBody.afterLogin && (isEmpty(reqBody.afterLogin.page) || isEmpty(reqBody.afterLogin.url))) {
        errors.afterLogin = "REQUIRED"
    } else if (!reqBody.afterLogin) {
        errors.afterLogin = "REQUIRED"
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Edit User Notification
 * METHOD : PUT
 * URL : /api/editNotif
 * BODY : name, checked
 */
export const editNotifValid = (req, res, next) => {
    let errors = {};
    let reqBody = req.body;

    if (isEmpty(reqBody.name)) {
        errors.name = "REQUIRED";
    }

    if (isEmpty(reqBody.checked)) {
        errors.checked = "REQUIRED";
    } else if (!isBoolean(reqBody.checked)) {
        errors.checked = "INVALID_VALUE";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
* Check Forgot Password
* METHOD : POST
* URL : /api/forgotPassword
* BODY : email
*/
export const checkForgotPwdValidate = (req, res, next) => {


    let errors = {},
        reqBody = req.body;
    if (reqBody.type == 'email') {
        if (isEmpty(reqBody.email)) {
            errors.email = "Required";
        }
        if (!isEmpty(errors)) {
            return res.status(400).json({ "errors": errors })
        }
    }

    if (reqBody.type == 'mobile') {
        if (isEmpty(reqBody.otp)) {
            errors.otp = 'Required'
        }
        if (isEmpty(reqBody.phoneCode)) {
            errors.phone = 'Required'
        }
        if (isEmpty(reqBody.phoneNo)) {
            errors.phone = 'Required'
        }
        if (!isEmpty(errors)) {
            return res.status(400).json({ "errors": errors })
        }
    }


    return next();
}

/**
 * Reset Password Without Login
 * METHOD : POST
 * URL : /api/resetPassword
 * BODY : password, confirmPassword, authToken
*/
export const resetPwdValidate = (req, res, next) => {
    let
        errors = {},
        reqBody = req.body,
        passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}(?!\S)/g;


    if (isEmpty(reqBody.authToken)) {
        errors.authToken = "authToken field is required";
    }

    if (isEmpty(reqBody.password)) {
        errors.password = "Password field is required";
    } else if (!(passwordRegex.test(reqBody.password))) {
        errors.password = "Password should contain atleast one uppercase, atleast one lowercase, atleast one number, atleast one special character and minimum 6 and maximum 18";
    } else if (reqBody.password.length > 18) {
        errors.password = "Password should contain atleast one uppercase, atleast one lowercase, atleast one number, atleast one special character and minimum 6 and maximum 18"
    }

    if (isEmpty(reqBody.confirmPassword)) {
        errors.confirmPassword = "Confirm password field is required";
    } else if (!isEmpty(reqBody.password) && !isEmpty(reqBody.confirmPassword) && reqBody.password != reqBody.confirmPassword) {
        errors.confirmPassword = "Passwords must match";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Check New Phone
 * METHOD : POST
 * URL : /api/phoneChange
 * BODY : newPhoneCode, newPhoneNo
*/
export const newPhoneValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    let mobileRegex = /^\d+$/;

    if (isEmpty(reqBody.newPhoneCode)) {
        errors.newPhoneCode = "Phone code field is required";
    }

    if (isEmpty(reqBody.newPhoneNo)) {
        errors.newPhoneNo = "Phone number field is required";
    } else if (!(mobileRegex.test(reqBody.newPhoneNo))) {
        errors.newPhoneNo = "Phone number is invalid";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json(encodedata({ "errors": errors }))
    }

    return next();
}

/**
 * Verify New Phone
 * METHOD : PUT
 * URL : /api/phoneChange
 * BODY : otp
*/
export const editPhoneValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    let mobileRegex = /^\d+$/;

    if (isEmpty(reqBody.newPhoneCode)) {
        errors.newPhoneCode = "Phone code field is required";
    }

    if (isEmpty(reqBody.newPhoneNo)) {
        errors.newPhoneNo = "Phone number field is required";
    } else if (!(mobileRegex.test(reqBody.newPhoneNo))) {
        errors.newPhoneNo = "Phone number is invalid";
    }

    if (isEmpty(reqBody.otp)) {
        errors.otp = "OTP Field is Required";
    } else if (reqBody.otp.toString().length != 6) {
        errors.otp = "Invalid OTP";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json(encodedata({ "errors": errors }))
    }

    return next();
}

/**
 * Edit Email
 * METHOD : PUT
 * URL : /api/emailChange
 * BODY : newEmail
*/
export const editEmailValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;


    if (isEmpty(reqBody.newEmail)) {
        errors.newEmail = "Email field is required";
    } else if (!(emailRegex.test(reqBody.newEmail))) {
        errors.newEmail = "Email is invalid";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Verify the old email(Edit Email)
 * METHOD : PUT
 * URL : /api/emailChange
 * BODY : token
*/
export const tokenValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body;

    if (isEmpty(reqBody.token)) {
        errors.token = "token field is required";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}
/**
 * Add Newsletter
 * METHOD : POST
 * URL : /api/add-newsletter 
 * BODY : email
*/
export const newsletterValid = (req, res, next) => {
    let
        errors = {},
        emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/,
        reqBody = req.body;

    if (isEmpty(reqBody.email)) {
        errors.email = "Email field is required";
    } else if (!(emailRegex.test(reqBody.email))) {
        errors.email = "Email is invalid";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Sent OTP
 * METHOD : POST
 * URL : /api/sentOtp
 * BODY : phoneCode, phoneNo
*/
export const sentOtp = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    let mobileRegex = /^\d+$/;

    if (isEmpty(reqBody.phoneCode)) {
        errors.phoneCode = "Phone code field is required";
    }

    if (isEmpty(reqBody.phoneNo)) {
        errors.phoneNo = "Phone number field is required";
    } else if (!(mobileRegex.test(reqBody.phoneNo))) {
        errors.phoneNo = "Phone number is invalid";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}