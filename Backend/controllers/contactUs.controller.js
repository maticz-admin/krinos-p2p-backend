// import model
import ContactUs from '../models/contactus';


// lib 
import {
    paginationQuery,
    filterQuery,
    filterProofQuery,
    filterSearchQuery
} from '../lib/adminHelpers';
import isEmpty from '../lib/isEmpty'
import { mailTemplateLang } from './emailTemplate.controller';
import { encodedata } from '../lib/cryptoJS';

/** 
 * Contact Us
 * METHOD : POST
 * URL : /api/contactus
 * BODY : name, email, subject, message
*/
export const newContact = async(req, res) => {
    try{
    let reqBody = req.body;

    let newDoc = new ContactUs({
        'name': reqBody.name,
        'email': reqBody.email,
        'subject': reqBody.subject,
        'usrMsg': reqBody.message
    })

    const SaveContact = await newDoc.save();
    if (SaveContact) {
        return res.status(200).json({ 'success': true, 'message': 'Your Message submitted successfully' })
    }else{
        return res.status(500).json({ 'success': false, 'message': "Error on server" })
    }
}catch(err){
    return res.status(500).json({ 'success': false, 'message': "Error on server" })
}
}


export const getContact = async (req, res) => {

    try {
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['email',]);
        // let count = await Currency.countDocuments(filter);
        const contactData = await ContactUs.find().sort({ "created_date": -1 });
        let result = {
            data: contactData
        }
        return res.status(200).json(encodedata({ result: result }))
    } catch (err) {
        return res.status(500).json(encodedata({ result: {data: []} }))
    }

}


export const adminMsg = async (req, res) => {
    try {
        let reqBody = req.body
        let Data = {
            adminMsg: reqBody.rly,
            softDelete: true
        }
        let checkUser = await ContactUs.findOneAndUpdate(
            { _id: reqBody.id},
            { $set: Data },
            { new: true }
        )
        if (!isEmpty(checkUser)) {
            let content = {
                'AdminMsg': checkUser.adminMsg,
                'date': new Date(),
            };

            mailTemplateLang({
                'identifier': 'CONTACT_US',
                'toEmail': checkUser.email,
                content
            })
            return res.status(200).json(encodedata({ status: true, message: 'Reply Email send Successfully' }))
        } else {
            return res.status(400).json(encodedata({ status: false, message: 'Reply failed' }))
        }
    } catch (err) {
        return res.status(500).json(encodedata({ status: false, message: 'Something wrong' }))
    }
}