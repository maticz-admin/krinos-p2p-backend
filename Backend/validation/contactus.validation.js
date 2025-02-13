// import package
import mongoose from 'mongoose';

// import helpers
import isEmpty, { isBoolean } from '../lib/isEmpty';


/** 
 * Contact Us
 * METHOD : POST
 * URL : /api/contactus
 * BODY : name, email, subject, message
*/
export const newContactValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

    if (isEmpty(reqBody.name)) {
        errors.name = "Name field is required";
    }

    if (isEmpty(reqBody.email)) {
        errors.email = "Email field is required";
    } else if (!(emailRegex.test(reqBody.email))) {
        errors.email = "Email is invalid";
    }

    if (isEmpty(reqBody.subject)) {
        errors.subject = "Subject field is required";
    }

    if (isEmpty(reqBody.message)) {
        errors.message = "Message field is required";
    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}

export const AdminRly = (req,res,next) => {
    try{
        let errors = {} 
        let reqBody = req.body
        if(isEmpty(reqBody.rly)){
            errors.rly = 'Required'
        }
        if(!isEmpty(errors)){
            return res.status(400).json({status:false , errors:errors})
        }
        return next()
    }catch(err){}
  
}