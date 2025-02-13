import isEmpty from '../lib/isEmpty';

/** 
 * Update Ste Setails
 * METHOD : get
 * URL : /adminapi/updateSiteDetails
 * BODY twiterLink,linkedInLink,address,fbLink,supportMail,contactNo
*/
export const siteSettingsValid = (req, res, next) => {

    let errors = {}, reqBody = req.body;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

    if (isEmpty(reqBody.twiterLink)) {
        errors.twiterLink = "twiterLink field is required";
    }
    if (isEmpty(reqBody.linkedInLink)) {
        errors.linkedInLink = "linkedInLink field is required";
    }
    if (isEmpty(reqBody.fbLink)) {
        errors.fbLink = "fbLink field is required";
    }
    if (isEmpty(reqBody.address)) {
        errors.address = "address field is required";
    }
    if (isEmpty(reqBody.supportMail)) {
        errors.supportMail = "supportMail field is required";
    } else if (!(emailRegex.test(reqBody.supportMail))) {
        errors.supportMail = "Email is invalid";
    }
    if (isEmpty(reqBody.contactNo)) {
        errors.contactNo = "contactNo field is required";
    }
    if (isEmpty(reqBody.siteName)) {
        errors.siteName = "siteName field is required";
    }
    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}


export const updateMailValid = (req, res, next) => {

    try {
        let errors = {}, reqBody = req.body;
        let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;
        if (reqBody.type == 'sendinBlue') {
            if (isEmpty(reqBody.fromMail)) {
                errors.mail = "Mail field is required";
            } 
            if (isEmpty(reqBody.name)) {
                errors.name = "name field is required";
            }
            if (isEmpty(reqBody.api)) {
                errors.api = "api field is required";
            }
            if (!isEmpty(errors)) {
                return res.status(400).json({ status: false, errors: errors })
            }
        }
        if (reqBody.type == 'mailIntegrage') {
            if (isEmpty(reqBody.fromMail)) {
                errors.fromMail = "fromMail field is required";
            } else if (!(emailRegex.test(reqBody.fromMail))) {
                errors.fromMail = "Email is invalid";
            }
            if (isEmpty(reqBody.host)) {
                errors.host = "host field is required";
            }
            if (isEmpty(reqBody.port)) {
                errors.port = "port field is required";
            }
            if (isEmpty(reqBody.secure)) {
                errors.secure = "address field is required";
            }
            if (isEmpty(reqBody.user)) {
                errors.user = "supportMail field is required";
            } else if (!(emailRegex.test(reqBody.user))) {
                errors.user = "Email is invalid";
            }
            if (isEmpty(reqBody.pass)) {
                errors.pass = "Password field is required";
            }
            if (!isEmpty(errors)) {
                return res.status(400).json({ status: false, errors: errors })
            }
        }
        return next();
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Something Wrong' })
    }
}