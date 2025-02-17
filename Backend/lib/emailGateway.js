
// import lib
import config from '../config';
import smtpConfig from '../config/smtpConfig.json'
import SendinBlue from '../config/sendinBlue.json'
import { set, get } from '../controllers/redis.controller'
import nodemailer from 'nodemailer';
import { log } from 'async';

//import package
// const SibApiV3Sdk = require('sib-api-v3-sdk');
// let defaultClient = SibApiV3Sdk.ApiClient.instance;
// let apiKey = defaultClient.authentications['api-key'];
// apiKey.apiKey = SendinBlue.apiKey;
// let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
// let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();


// export const sendEmail = async (to, content) => {
   // try {
       // let Redis = await get('SMTP')
     //   let Type =  JSON.parse(Redis)
       //     const { subject, template } = content;
       //     sendSmtpEmail.subject = subject;
       //     sendSmtpEmail.htmlContent = template;
       //     sendSmtpEmail.sender = { "name": SendinBlue.name, email: SendinBlue.email };
       //     sendSmtpEmail.to = [{ "email": to, "name": to }];
       //     sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
       //     apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
       //     }, function (error) {
       //         return 
       //     });
  //  }
  //  catch (err) {
  //  }
//}

  // else if (Type.mailType == 'nodeMailer') {
  //     const { subject, template } = content;
  export const sendEmail = async (to, content) => {
    try{
      const { subject, template } = content;
       let transporter = nodemailer.createTransport(smtpConfig.nodemailer);
      let info = await transporter.sendMail({
           from: smtpConfig.fromMail,
           to,
           subject,
           html: template
       });
       console.log("info",info);
    }
    catch(E){
      console.log("Error in send Mail",E);
    }
   }

//export const sendEmail = async (to, content) => {
//    const { subject, template } = content;
//SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = SendinBlue.apiKey;
// SendinBlue.apiKey
//new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(
  //{
  //  'subject': subject,
  //  'sender' : {'email':SendinBlue.email, 'name': SendinBlue.name},
  //  'replyTo' : {'email': SendinBlue.email, 'name':SendinBlue.name},
  //  'to' : [{'name': to, 'email': to}],
  //  'htmlContent' : template,
  //  'params' : {'bodyMessage':'subject'}
 // }
//).then(function(data) {
//}, function(error) {
//  console.error(error);
//});
//}
