// import package
import fs from 'fs';

// import helpers
import isEmpty from '../lib/isEmpty';
import { removeKycReqFile } from '../lib/removeFile';

/** 
 * Update Id Proof
 * URL: /api/kyc/idproof
 * METHOD : PUT
 * BODY : type,proofNumber, frontImage, backImage, selfiImage
*/
export const idProofValidate = (req, res, next) => {

    try {
        let errors = {}, reqBody = req.body, reqFile = req.files;
        if (isEmpty(reqBody.type)) {
            errors.type = "REQUIRED";
        }

        if (isEmpty(reqBody.proofNumber)) {
            errors.proofNumber = "REQUIRED";
        }

        if (isEmpty(reqFile.frontImage)) {
            errors.frontImage = "REQUIRED";
        }

        if (!isEmpty(reqBody.type) && reqBody.type != 'passport') {
            if (isEmpty(reqFile.backImage)) {
                errors.backImage = "REQUIRED";
            }
        }

        if (isEmpty(reqFile.selfiImage)) {
            errors.selfiImage = "REQUIRED";
        }

        if (isEmpty(reqFile.panImage)) {
            errors.panImage = "REQUIRED";
        }

        if (!isEmpty(errors)) {
            removeKycReqFile(reqFile, 'id');
            return res.status(400).json({ "errors": errors })
        }
        return next();
    } catch (err) {
    }
}

/** 
 * Update Address Proof
 * URL: /api/kyc/addressproof
 * METHOD : PUT
 * BODY : type, frontImage
*/
export const addressProofValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body, reqFile = req.files;

    if (isEmpty(reqBody.type)) {
        errors.type = "REQUIRED";
    }

    if (isEmpty(reqFile.frontImage)) {
        errors.frontImage = "REQUIRED";
    }

    if (!isEmpty(errors)) {
        removeKycReqFile(reqFile, 'id');
        return res.status(400).json({ "errors": errors })
    }
    return next();
}

/** 
 * Reject User Kyc Doc's
 * URL: /api/kyc/addressproof
 * METHOD : PUT
 * BODY : userId, formType(idProof,addressProof), reason
*/
export const rejectKycValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body, reqFile = req.files;

    if (isEmpty(reqBody.reason)) {
        errors.reason = "REQUIRED";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }
    return next();
}

/** 
 * Update Kyc Detail
 * URL: /api/kyc
 * METHOD : PUT
 * BODY : firstName,lastName,address,country,state,city,postalCode,type,proofNumber,frontImage,backImage,selfiImage,typeAddress,frontImageAddress
*/
export const updateKycValidate = (req, res, next) => {
    let errors = {}, reqBody = req.body, reqFile = req.files;

    if (isEmpty(reqBody.firstName)) {
        errors.firstName = "REQUIRED";
    }

    if (isEmpty(reqBody.lastName)) {
        errors.lastName = "REQUIRED";
    }

    if (isEmpty(reqBody.address)) {
        errors.address = "REQUIRED";
    }

    if (isEmpty(reqBody.country)) {
        errors.country = "REQUIRED";
    }

    if (isEmpty(reqBody.city)) {
        errors.city = "REQUIRED";
    }

    if (isEmpty(reqBody.postalCode)) {
        errors.postalCode = "REQUIRED";
    }

    if (isEmpty(reqBody.type)) {
        errors.type = "REQUIRED";
    }

    if (isEmpty(reqBody.proofNumber)) {
        errors.proofNumber = "REQUIRED";
    }

    if (isEmpty(reqFile.frontImage)) {
        errors.frontImage = "REQUIRED";
    }

    if (!isEmpty(reqBody.type) && reqBody.type != 'passport') {
        if (isEmpty(reqFile.backImage)) {
            errors.backImage = "REQUIRED";
        }
    }

    if (isEmpty(reqFile.selfiImage)) {
        errors.selfiImage = "REQUIRED";
    }

    if (isEmpty(reqBody.typeAddress)) {
        errors.typeAddress = "REQUIRED";
    }

    if (isEmpty(reqFile.frontImageAddress)) {
        errors.frontImageAddress = "REQUIRED";
    }

    if (!isEmpty(errors)) {
        removeKycReqFile(reqFile, 'id');
        return res.status(400).json({ "errors": errors })
    }
    return next();
}