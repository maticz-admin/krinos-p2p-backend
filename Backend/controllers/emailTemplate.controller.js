// import package

// import modal
import { EmailTemplate, Language, UserSetting, SiteSetting } from '../models';

// import config
import config from '../config';

// import lib
import { sendEmail } from '../lib/emailGateway';
import {
    paginationQuery,
    filterQuery,
    filterProofQuery,
    filterSearchQuery
} from '../lib/adminHelpers';
import isEmpty from '../lib/isEmpty';
import { encodedata } from '../lib/cryptoJS';

/** 
 * Sent Email
 * URL: /api/getEmailId
 * METHOD : GET
 * BODY : identifier, Subject (object)userId
*/

export const getEmailId = async (req, res) => {
    try {
        // let reqBody = req.body;
        // let getUserData = await Admin.findOne({ "_id": reqBody.id })
        let userid = req.query.cmsId;
        let getUserData = await EmailTemplate.findOne({ "_id": userid })
        //await getUserData.save();
        return res.status(200).json({ 'success': true, "messages": "success", result: getUserData })
    }
    catch (err) {
        return res.status(500).json({ "success": false, 'errors': { 'messages': "Error on server" } })
    }
}

/** 
 * Mail Template with language
*/
export const mailTemplateLang = async ({
    userId,
    identifier,
    toEmail,
    content
}) => {
    try {

        // let settingData = await UserSetting.findOne({ "userId": userId }).populate('languageId');
        // if (settingData && settingData.languageId) {
        //     mailTemplate(identifier, toEmail, content, settingData.languageId.code)
        // } else {
        //     let getLang = await Language.findOne({ "isPrimary": true })
        //     mailTemplate(identifier, toEmail, content, getLang.code)
        // }
        await mailTemplate(identifier, toEmail, content, 'en')
    } catch (err) {
    }
}

/** 
 * Sent Email
 * URL: /api/mailTemplate
 * METHOD : POST
 * BODY : identifier, email, contentData (object)
*/
export const mailTemplate = async (identifier, toEmail, content, langCode = '') => {
    try {
        // if (isEmpty(langCode)) {
        //     let getLang = await Language.findOne({ "isPrimary": true })
        //     if (!getLang) {
        //         return false
        //     }

        //     langCode = getLang.code;
        // }
        let siteSettingsData = await SiteSetting.findOne({});
        let emailTemplateData = await EmailTemplate.findOne({ "identifier": identifier });
        if (!emailTemplateData) {
            // return res.status(400).json({ "success": false, 'messages': "Not found" })
            return false
        }

        let logo = config.SERVER_URL + "Logo-small.png";
        let mailContent = {};
        mailContent['subject'] = emailTemplateData.subject;
        mailContent['template'] = emailTemplateData.content
            .replace('##SITE_URL##', config.FRONT_URL)
            .replace('##EMAIL_LOGO##', config.SERVER_URL + '/settings/' + siteSettingsData.emailLogo)
            .replace(/##SUPPORT_MAIL##/g, siteSettingsData.supportMail)
            .replace('##TWITER_LINK##', siteSettingsData.twitterUrl)
            .replace('##LINKEDIN_LINK##', siteSettingsData.linkedinLink)
            .replace('##FB_LINK##', siteSettingsData.facebookLink)
            .replace(/##SITE_NAME##/g, siteSettingsData.siteName)
            .replace('##CONTACT_NO##', siteSettingsData.contactNo)
            .replace('##ADDRESS##', siteSettingsData.address)
            .replace('##ADDRESS1##', siteSettingsData.address1)
            .replace('##ADDRESS2##', siteSettingsData.address2)

            .replace('##TWITER_LOGO##', config.SERVER_URL + '/emailimages/twiter.png')
            .replace('##FB_LOGO##', config.SERVER_URL + '/emailimages/facbook.png')
            .replace('##LINKED_IN_LOGO##', config.SERVER_URL + '/emailimages/telegaram.png');

        switch (identifier) {

            case "activate_register_user":
                /** 
                 * ##templateInfo_name## --> email
                 * ##templateInfo_url## --> confirmMailUrl
                 * ##templateInfo_appName##  --> siteName
                 * ##DATE## --> date
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", content.email)
                    .replace("##templateInfo_url##", content.confirmMailUrl)
                    .replace("##templateInfo_appName##", config.SITE_NAME)
                    .replace("##templateInfo_logo##", logo)
                    .replace("##DATE##", content.date);

                break;

            case "User_forgot":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##templateInfo_url##", content.confirmMailUrl);

                break;

            case "change_register_email":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##templateInfo_url##", content.confirmMailUrl);

                break;

            case "Change_Password":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)

                break;

            case "verify_new_email":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##templateInfo_url##", content.confirmMailUrl);

                break;

            case "Login_confirmation":
                /** 
                 * ##BROWSER## --> broswername
                 * ##IP## --> ipaddress
                 * ##COUNTRY## --> countryName
                 * ##DATE## --> date
                 * ##CODE## --> code
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##BROWSER##", content.broswername)
                    .replace("##IP##", content.ipaddress)
                    .replace("##COUNTRY##", content.countryName)
                    .replace("##DATE##", content.date)
                    .replace("##CODE##", content.code)
                break;

            case "withdraw_request":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##withdraw_Approve##", content.withdrawApprove)
                    .replace("##cancel_Withdraw##", content.cancelWithdraw);
                break;
            case "withdraw_request_fiat":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##templateInfo_url##", content.confirmMailUrl);
                break;
            case "Login_notification":
                /** 
                 * ##BROWSER## --> broswername
                 * ##IP## --> ipaddress
                 * ##COUNTRY## --> countryName
                 * ##DATE## --> date
                 * ##CODE## --> code
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##BROWSER##", content.broswername)
                    .replace("##IP##", content.ipaddress)
                    .replace("##COUNTRY##", content.countryName)
                    .replace("##DATE##", content.date)

                break;

            case "User_deposit":
                /** 
                 * ##AMOUNT## --> amount
                 * ##CURRENCY## --> currency
                 * ##TXID## --> transactionId
                 * ##DATE## --> date
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##AMOUNT##", content.amount)
                    .replace("##CURRENCY##", content.currency)
                    .replace("##TXID##", content.transactionId)
                    .replace("##DATE##", content.date)
                break;

            case "Withdraw_notification":
                /** 
                 * ##AMOUNT## --> amount
                 * ##CURRENCY## --> currency
                 * ##TXID## --> transactionId
                 * ##DATE## --> date
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##AMOUNT##", content.amount)
                    .replace("##CURRENCY##", content.currency)
                    .replace("##TXID##", content.transactionId)
                    .replace("##message##", content.message)
                    .replace("##DATE##", content.date)
                break;

            case "newsletter_send":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("#AdminReplay#", content.message);
                break;
            case "CONTACT_US":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##rly##", content.AdminMsg);
                break;
            case "SEND_OTP":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##OTP##", content.OTP);
                break;
            case "CHANGE_2FA":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##STATUS##", content.status);
                break;
            case "KYC_APPROVE":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##rly##", content.notice);
                break;
            case "KYC_REJECT":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##rly##", content.notice);
                break;
            case "new_support_ticket_user":
                 /** 
                 * ##message##
                */
               mailContent['template'] = mailContent['template']
               .replace("##ID##", content.ticketId);
               break;
            case "support_ticket_reply":
               /** 
                 * ##message##
                */ 
               mailContent['template'] = mailContent['template']
               .replace("##TICKETID##", content.ticketId)
               .replace("##DATE##", content.date)
               .replace("##MESSAGE##", content.message);
               break;             
        }
        sendEmail(toEmail, mailContent)
        return true
        // return res.status(200).json({ "success": true, 'messages': "Mail sent successfully" })
    }
    catch (err) {
        // return res.status(500).json({ "success": false, 'messages': "Error on server" })
        return true
    }
}

/** 
 * Add Email Template
 * URL: /adminapi/emailTemplate
 * METHOD : POST
 * BODY : identifier, subject, content, langCode
*/
export const addEmailTemplate = async (req, res) => {
    try {
        let reqBody = req.body;
        let checkTemplate = await EmailTemplate.findOne({ 'identifier': reqBody.identifier, 'langCode': reqBody.langCode })
        if (checkTemplate) {
            return res.status(400).json({ 'success': false, 'errors': { 'langCode': 'Identifier and Language code already exists' } });
        }

        let checkLang = await Language.findOne({ "code": reqBody.langCode })
        if (!checkLang) {
            return res.status(400).json({ 'success': false, 'errors': { 'code': 'There is no Language code' } });
        }

        const newTemplate = new EmailTemplate({
            identifier: reqBody.identifier,
            subject: reqBody.subject,
            content: reqBody.content,
            langCode: reqBody.langCode
        });

        await newTemplate.save();
        return res.status(200).json({ 'success': true, 'message': 'Template added successfully.' })

    } catch (err) {
        return res.status(409).json({ 'success': false, 'message': 'Something went wrong.' })
    }
}

/** 
 * Update Email Template
 * URL: /adminapi/emailTemplate
 * METHOD : PUT
 * BODY : id, identifier, subject, content, langCode, status
*/
export const editEmailTemplate = async (req, res) => {
    try {
        let reqBody = req.body;
        let checkTemplate = await EmailTemplate.findOne({
            'identifier': reqBody.identifier,
            // 'langCode': reqBody.langCode,
            "_id": { "$ne": reqBody.id }
        })
        if (checkTemplate) {
            return res.status(400).json({ 'success': false, 'errors': { 'langCode': 'Identifier and Language code already exists' } });
        }

        // let checkLang = await Language.findOne({ "code": reqBody.langCode })
        // if (!checkLang) {
        //     return res.status(400).json({ 'success': false, 'errors': { 'code': 'There is no Language code' } });
        // }

        let templateData = await EmailTemplate.findOne({ "_id": reqBody.id })
        templateData.subject = reqBody.subject;
        templateData.content = reqBody.content;
        // templateData.langCode = reqBody.langCode;
        // templateData.status = reqBody.status;

        await templateData.save();

        return res.status(200).json(encodedata({ 'success': true, 'message': 'Template updated successfully.' }))

    } catch (err) {
        return res.status(409).json({ 'success': false, 'message': 'Something went wrong.' })
    }
}

/** 
 * Get Email Template
 * URL: /adminapi/emailTemplate
 * METHOD : GET
 * BODY : identifier, subject, content, langCode, status
*/
export const emailTemplateList = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let filter = filterSearchQuery(req.query, ['identifier', 'subject', 'langCode', 'status']);
        let count = await EmailTemplate.countDocuments(filter);
        let data = await EmailTemplate.find(filter, {
            "_id": 1,
            "identifier": 1,
            "subject": 1,
            "content": 1,
            "langCode": 1,
            "status": 1,
        }).skip(pagination.skip).limit(pagination.limit);

        let result = {
            count,
            data
        }
        return res.status(200).json(encodedata({ 'success': true, 'message': 'Fetched successfully.', result }))
    } catch (err) {
        return res.status(500).json(encodedata({ 'success': true, 'message': 'Something went wrong.' }))
    }
}
