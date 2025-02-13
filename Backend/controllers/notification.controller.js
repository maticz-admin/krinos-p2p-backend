
// import modal
import {
    Notification
} from '../models';

// import config
import { socketEmitOne, socketEmitAll } from '../config/socketIO';

//lib
import isEmpty from 'is-empty'
import { encodedata } from '../lib/cryptoJS';
/** 
 * Create Notification
 * userId, currencyId, transactionId, trxId, currencySymbol, amount, paymentType,status
*/
export const newNotification = async (doc) => {
    try {
        let newDoc = new Notification(doc)
        await newDoc.save();
        let data = await FetchUnReadNotice(newDoc.userId)
        socketEmitOne('notice', data, newDoc.userId)
        return true
    } catch (err) {
        return false
    }
}

export const NewNotification = async (req,res) => {
    try {
        let newDoc = new Notification(doc)
        await newDoc.save();
        let data = await FetchUnReadNotice(newDoc.userId)
        socketEmitOne('notice', data, newDoc.userId)
        return true
    } catch (err) {
        return false
    }
}



/** 
 * Get Notification
 * userId,Title , description,isRead
*/

export const getNotification = async (req, res) => {

    try {
        console.log('req.user.id----', req.user.id)
        let allNotify = await Notification.find({ userId: req.user.id }).select({ 'description': 1, 'createdAt': 1,'isRead':1}).sort({ createdAt: -1 })
        console.log('allNotify------', allNotify)
        if (!isEmpty(allNotify)) {
            return res.status(200).json(encodedata({ 'success': true, result: allNotify }))
        } else {
            return res.status(400).json(encodedata(({ 'success': false, message: 'Not Found' })))
        }
    } catch (err) {
        return res.status(500).json(encodedata({ 'success': false, message: 'something went wrong' }))
    }
}

const FetchUnReadNotice = async (id) => {
    try {

        let NoticeData = await Notification.find({ userId: id, isRead: false }).select({ 'description': 1, 'createdAt': 1 }).sort({ createdAt: -1 })
        if (!isEmpty(NoticeData)) {
            return NoticeData
        } else {
            return []
        }
    } catch (err) {
        return []
     }
}

export const unReadNotice = async (req, res) => {
    try {
        let unReadData = await FetchUnReadNotice(req.user.id)
        if (!isEmpty(unReadData)) {
            return res.status(200).json({ 'success': true, result: unReadData })
        } else {
            return res.status(400).json({ 'success': false, message: 'Not Found' })
        }
    } catch (err) {
        return res.status(500).json({ 'success': false, message: 'something went wrong' })
    }
}

/** 
 * read Notification
 * userId
*/

export const readNotification = async (req, res) => {

    try {
        // let checkUser = await Notification.find({ userId: req.user.id, isRead: false })
        // if (!isEmpty(checkUser)) {
        let array = []
        let Data = {
            isRead: true
        }
        let updateNotify = await Notification.updateMany({ userId: req.user.id, isRead: false }, { $set: Data }, { new: true })
        if (!isEmpty(updateNotify)) {
            let allNotify = await Notification.find({ userId: req.user.id }).select({ 'description': 1, 'createdAt': 1,'isRead':1}).sort({ createdAt: -1 })
            socketEmitOne('notice', array, req.user.id)
            socketEmitOne('read',allNotify,req.user.id)
            return res.status(200).json({ 'success': true })
        } else {
            return res.status(400).json({ 'success': false, message: 'Error' })
        }
        // }

    } catch (err) {
        return res.status(500).json({ 'success': false, message: 'something went wrong' })
    }
}

export const readsingelNotification = async ( req,res)=>{
    try {
        let Data = {
            isRead: true
        }
        let updateNotify = await Notification.updateMany({ userId: req.user.id, isRead: false, _id:req.body.id }, { $set: Data }, { new: true })
        if (!isEmpty(updateNotify)) {
            let allNotify = await Notification.find({ userId: req.user.id }).select({ 'description': 1, 'createdAt': 1,'isRead':1}).sort({ createdAt: -1 })
            let array  = await Notification.find({ userId: req.user.id ,isRead:false}).select({ 'description': 1, 'createdAt': 1,}).sort({ createdAt: -1 })
            socketEmitOne('read',allNotify,req.user.id)
            socketEmitOne('notice', array, req.user.id)
            return res.status(200).json(encodedata({ 'success': true }))
        } else {
            return res.status(400).json(encodedata({ 'success': false, message: 'Error' }))
        }
    } catch (err) {
        return res.status(500).json(encodedata({ 'success': false, message: 'something went wrong' }))
    }
}