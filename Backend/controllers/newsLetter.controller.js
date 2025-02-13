// import package

// import modal
import {
    NewsLetter
} from '../models';

// import controller
import { mailTemplateLang } from './emailTemplate.controller';

// import lib
import isEmpty from '../lib/isEmpty';
import { encodedata } from '../lib/cryptoJS';

/**
 * Add Newsletter
 * METHOD : POST
 * URL : /api/newsSubscribe 
 * BODY : email
*/
export const newSubscribe = async (req, res) => {
    try {
        let reqBody = req.body;
        let checkDoc = await NewsLetter.findOne({ 'email': reqBody.email })
        if (checkDoc) {
            return res.status(400).json({ 'status': false, 'message':  'Email already Subscribed'  })
        }else if(reqBody.email==""||reqBody.email==null ||reqBody.email==undefined){
            return res.status(400).json({ 'status': false, 'message':  'Email must not be empty'})
        }
        let newDoc = new NewsLetter({
            'email': reqBody.email
        })

        await newDoc.save();

        return res.status(200).json({ 'status': true, 'message': 'Newsletter Subscribe Successfully' })
    } catch (err) {
        return res.status(500).json({ 'status': false, 'message': 'Error on server' })
    }
}

/**
 * Get All Subscribe User
 * METHOD : GET
 * URL : /adminapi/subscriber-all
 * BODY : email
*/
export const allSubscriber = async (req, res) => {
    try{
        const data = await NewsLetter.find({}, { 'email': 1 })
        if(data){
            return res.status(200).json(encodedata({ 'status': true, 'message': 'FETCH', 'result': data }))
        }else{
            return res.status(500).json({ 'status': false, 'message': 'Error on server' })   
        }
    }catch(e){
        return res.status(500).json({ 'status': false, 'message': 'Error on server' }) 
    }
    // NewsLetter.find({}, { 'email': 1 }).exec((err, data) => {
    //     if (err) {
    //         return res.status(500).json({ 'status': false, 'message': 'Error on server' })
    //     }
    //     return res.status(200).json({ 'status': true, 'message': 'FETCH', 'result': data })
    // })
}

/**
 * Send news letter for subscriber
 * METHOD : POST
 * URL : /adminapi/subscriber/sendNews
 * BODY : subscribedId, message
*/
export const sendNews = async (req, res) => {
    try {
        let reqBody = req.body;

        const subscriber = await NewsLetter.find({ '_id': { "$in": reqBody.subscribedId } }).distinct('email');
        if (subscriber && subscriber.length > 0) {
            for (let item of subscriber) {
                let datetime = new Date();
                var result = reqBody.message;
                var message = result.replace(/<\/?p[^>]*>/g, "");
                let content = {
                    'message': message,
                    // 'date': datetime.getFullYear() + '/' + (datetime.getMonth() + 1) + '/' + datetime.getDate()
                }
                await mailTemplateLang({
                    'identifier': 'newsletter_send',
                    'toEmail': item,
                    content
                })
            }
        }
        return res.status(200).json(encodedata({ 'status': true, 'message': "Sent newsletter mails successfully. Refreshing data..." }))
    } catch (err) {
        return res.status(500).json({ 'status': false, 'message': 'Error on server' })
    }
}