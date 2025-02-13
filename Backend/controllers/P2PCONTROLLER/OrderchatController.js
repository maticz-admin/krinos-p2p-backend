var fs = require('fs');

import Orderchat from "../../models/Chat_schema";
import { User } from "../../models";
import MessageNotification from "../../models/messagenotification";
import { socketEmitOne } from "../../config/socketIO";
import { encodedata } from "../../lib/cryptoJS";


export const createroom = async(roomid , creater , spender , orderid) => {
    try{
        var check = await Orderchat.findOne({
            'ordercreator' : creater,
            'spender' : spender,
            'orderid' : orderid,
        })
        if(check){
            return result;
        }
        else{
            var newdata = new Orderchat({
                'ordercreator' : creater,
                'spender' : spender,
                'message' : [],
                'roomid' : roomid,
                'orderid' : orderid,
                'orderstarttime' : Date.now().toString() 
            });
            var result = await newdata.save();
            return result;
        }
    }
    catch(e){
        return {}
    }
}

export const sendmessage = async(roomid , message , file) => {
    try{
        if(file){
            var img = Date.now()?.toString();
            var path = 'public/chat_images/'+img+'.webp';
            message.image = '/chat_images/'+img+'.webp';
            fs.createWriteStream(path).write(file);
        }
        
        var finddata = {
            'roomid' : roomid
        }
        var updatedata = {
            $push : {'message' : message}
        }
        var userdata = await User.findOne({"userId" : message?.to});
        var anotheruserdata = await User.findOne({"userId" : message?.from})
        let notify = {
            userId : userdata?.id,//message?.to,
            roomid : roomid,
            title : "Received Message",
            description : `You have one messsage from ${anotheruserdata?.firstName + " " + anotheruserdata?.lastName} !`,
            
        }
        await Newmessagenotification(notify);
        var result = await Orderchat.findOneAndUpdate(finddata , updatedata , {new : true});
        return result;
    }
    catch(e){
        return {};
    }
}

export const lefttrade = async(roomid , message) => {
    try{
        var finddata = {
            'roomid' : roomid
        }
        var updatedata = {
            $push : {'message' : message},
            $set : {'chatstatus' : "Inactive"}
        }
        var result = await Orderchat.findOneAndUpdate(finddata , updatedata , {new : true});
        return result;
    }
    catch(e){
        return {};
    }
}

export const userstatus = async(userid) => {
    try{
        const result = await User.findOne({"userId" : userid});
        return result;
    }
    catch(e){
        return {};
    }
}


//message notification
export const Newmessagenotification = async(datas)=>{
    try{
        let newnotify = new MessageNotification(datas);
        let res = await newnotify.save();
        let data = await FetchUnReadmessage(newnotify.userId)
        socketEmitOne('messagenotice', data, newnotify.userId)
    }
    catch(e){
        console.log("error in Newmessagenotification",e);
    }
}

const FetchUnReadmessage = async (id) => {
    try {

        let NoticeData = await MessageNotification.find({ userId: id}).sort({ createdAt: -1 }); //select({ 'description': 1, 'createdAt': 1 })
        if (!isEmpty(NoticeData)) {
            return NoticeData
        } else {
            return []
        }
    } catch (err) { 
        return []
    }
}

export const getmessagenotification = async(req , res) =>{
    try{
        // console.log('req?.user?.id------', req?.user)
        let NoticeData = await MessageNotification.find({ userId: req?.user?.id}).sort({ createdAt: -1 });
       console.log('NoticeData-----', NoticeData)
        return res.status(200).json(encodedata({type : "success" , data : NoticeData}));
    }
    catch(e){
        return res.status(500).json(encodedata({type : "error" , data : []}));
    }
}

export const markasreadeone = async(req , res) => {
    try{
        let result = await MessageNotification.findOneAndUpdate({_id : req?.body?.id} , {$set:{isRead : true}})
        return res.json({type : "success" , data : result});
    }
    catch(e){
        return res.json({type : "error" , data : {}});
    }
}

export const markasreadeall = async(req , res) => {
    try{
        let result = await MessageNotification.updateMany({userId: req?.user?.id , isRead : false , }, {$set:{isRead : true}})
        return res.json({type : "success" , data : result});
    }
    catch(e){
        return res.json({type : "error" , data : {}});
    }
}

export const getunreadmessagenotification = async(req , res) => {
    try{
        let NoticeData = await MessageNotification.find({ userId: req?.user?.id , isRead : false}).sort({ createdAt: -1 });
        return res.json(encodedata({type : "success" , data : NoticeData}));
    }
    catch(e){
        return res.json(encodedata({type : "error" , data : []}));
    }
}

