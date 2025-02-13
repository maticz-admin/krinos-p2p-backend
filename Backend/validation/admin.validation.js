// import package
import mongoose from 'mongoose';

// import helpers
import isEmpty from '../lib/isEmpty';


/**
 * Admin Login
 * URL : /admin/login
 * METHOD: POST
 * BODY : email, password
*/
export const loginValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;


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
 * Email Verification
 * METHOD : POST
 * URL : /api/confirm-mail 
 * BODY : userId
*/
export const confirmMailValidation = (req, res, next) => {
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
 * Forgot Password
 * URL : /adminapi/forgotPassword
 * METHOD: POST
 * BODY : email
*/
export const forgotPwdValidation = (req, res, next) => {
    let
        errors = {},
        reqBody = req.body;

    if (isEmpty(reqBody.email)) {
        errors.email = "Email field is required";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

/**
 * Reset Password
 * METHOD : PUT
 * URL : /api/resetPassword
 * BODY : password, confirmPassword, oldPassword
*/
export const resetPasswordValidation = (req, res, next) => {
    let
        errors = {},
        reqBody = req.body,
        passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}(?!\S)/g;


    if (isEmpty(reqBody.oldPassword)) {
        errors.oldPassword = "Old Password field is required";
    }

    if (isEmpty(reqBody.password)) {
        errors.password = "Password field is required";
    } else if (!(passwordRegex.test(reqBody.password))) {
        errors.password = "Password should contain atleast one uppercase, atleast one lowercase, atleast one number, atleast one special character and minimum 6 and maximum 18";
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
 * Reset Password Without Login
 * METHOD : POST
 * URL : /api/resetPassword
 * BODY : password, confirmPassword, authToken
*/
export const resetPwdValidation = (req, res, next) => {
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
 * Update User Details
 * URL: /adminapi/updateUser
 * METHOD : PUT
 * BODY : email, phoneNo, phoneCode, userId
*/
export const updateUserValidation = (req, res, next) => {
    let
        errors = {},
        reqBody = req.body;

    let mobileRegex = /^\d+$/;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;


    if (isEmpty(reqBody.email)) {
        errors.email = "Email field is required";
    } else if (!(emailRegex.test(reqBody.email))) {
        errors.email = "Email is invalid";
    }

    if (isEmpty(reqBody.phoneCode)) {
        errors.phoneCode = "Phone code field is required";
    }

    if (isEmpty(reqBody.phoneNo)) {
        errors.phoneNo = "Phone number field is required";
    } else if (!(mobileRegex.test(reqBody.phoneNo))) {
        errors.phoneNo = "Phone number is invalid";
    }


    if (isEmpty(reqBody.userId)) {
        errors.userId = "userId field is required";
    } else if (!(mongoose.Types.ObjectId.isValid(reqBody.bankId))) {
        errors.phoneNo = "userId is invalid";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}



export const update2faValid = (req, res, next) => {
    let errors = {};
    let reqBody = req.body;

    if (isEmpty(reqBody.code)) {
        errors.code = "CODE IS REQUIRED";
    } else if (isNaN(reqBody.code) || reqBody.code.length > 6) {
        errors.code = "INVALID_CODE";
    }
    if (isEmpty(reqBody.Password)) {
        errors.Password = "PASSWORD IS REQUIRED";
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



export const SubAdminValid = (req, res, next) => {
    try {
        let errors = {};
        let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

        let reqBody = req.body;

        if (isEmpty(reqBody.name)) {
            errors.name = 'Required'
        }

        if (isEmpty(reqBody.email)) {
            errors.email = 'Required'
        } else if (!emailRegex.test(reqBody.email)) {
            errors.email = 'invalid Email'
        }

        if (isEmpty(reqBody.role)) {
            errors.role = 'Required'
        }

        if (isEmpty(reqBody.password)) {
            errors.password = 'Required'
        }


        if (!isEmpty(errors)) {
            return res.status(400).json({ status: false, errors: errors })
        }
        return next();

    } catch (err) {
        return res.status(500).json({ status: false, message: 'something went wrong' })
    }

}



export const updateAdminValid = (req, res, next) => {
    try {
        let errors = {};
        let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

        let reqBody = req.body;

        if (isEmpty(reqBody.name)) {
            errors.name = 'Required'
        }

        // if (isEmpty(reqBody.restriction)) {
        //     errors.restriction = 'Required'
        // }

        if (isEmpty(reqBody.email)) {
            errors.email = 'Required'
        } else if (!emailRegex.test(reqBody.email)) {
            errors.email = 'invalid Email'
        }
        if (!isEmpty(errors)) {
            return res.status(400).json({ status: false, errors: errors })
        }
        return next();

    } catch (err) {
        return res.status(500).json({ status: false, message: 'something went wrong' })
    }

}

export const passwordValid = (req, res, next) => {
    try {
        let errors = {},
            passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}(?!\S)/g;

        let reqBody = req.body;

        if (isEmpty(reqBody.otp)) {
            errors.otp = 'OTP Required'
        }

        if (isEmpty(reqBody.oldPassword)) {
            errors.oldPassword = 'Required'
        }
        // else if (reqBody.oldPassword.length < 6) {
        //     errors.oldPassword = 'minimum 6 and maximum 18'
        // } else if (reqBody.oldPassword.length > 18) {
        //     errors.oldPassword = 'minimum 6 and maximum 18'
        // }
        if (isEmpty(reqBody.newPassword)) {
            errors.newPassword = 'Required'
        } else if (reqBody.newPassword.length < 6) {
            errors.newPassword = 'minimum 6 and maximum 18'
        } else if (reqBody.newPassword.length > 18) {
            errors.newPassword = 'minimum 6 and maximum 18'
        } else if (!(passwordRegex.test(reqBody.newPassword))) {
            errors.newPassword = "Password should contain atleast one uppercase, atleast one lowercase, atleast one number, atleast one special character";
        }
        if (isEmpty(reqBody.confirmPassword)) {
            errors.confirmPassword = 'Required'
        } else if (reqBody.confirmPassword.length < 6) {
            errors.confirmPassword = 'minimum 6 and maximum 18'
        } else if (reqBody.confirmPassword.length > 18) {
            errors.confirmPassword = 'minimum 6 and maximum 18'
        } else if (reqBody.newPassword != reqBody.confirmPassword) {
            errors.confirmPassword = 'incorrect password'
        }

        if (!isEmpty(errors)) {
            return res.status(400).json({ status: false, errors: errors })
        }
        return next();

    } catch (err) {
        return res.status(500).json({ status: false, message: 'something went wrong' })
    }

}