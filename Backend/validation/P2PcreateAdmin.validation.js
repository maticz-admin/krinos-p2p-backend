const Validator = require("validator");
const isEmpty = require("is-empty");

export const AddOffertagValidation = (data)=>{
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : "";
    data.description = !isEmpty(data.description) ? data.description : "";
    if (Validator.isEmpty(data.name)) {
        errors.name = "Name field is required";
    }
    if (Validator.isEmpty(data.description)) {
        errors.description = "Description field is required";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
}

export const paymenttypesvalidation = (data)=>{
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : "";
    // data.description = !isEmpty(data.description) ? data.description : "";
    if (Validator.isEmpty(data.name)) {
        errors.name = "Name field is required";
    }
    // if (Validator.isEmpty(data.description)) {
    //     errors.description = "Description field is required";
    // }
    return {
        errors,
        isValid: isEmpty(errors)
    };
}