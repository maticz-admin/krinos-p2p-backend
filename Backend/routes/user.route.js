//  import packages
import express from 'express';
import passport from 'passport';
// import controllers
import * as userCtrl from '../controllers/user.controller';
import * as currencyCtrl from '../controllers/currency.controller'
import * as languageCtrl from '../controllers/language.controller';
import * as userKycCtrl from '../controllers/userKyc.controller';
import * as usrRefCtrl from '../controllers/userReference.controller';
import * as walletCtrl from '../controllers/wallet.controller';
import * as dashboardCtrl from '../controllers/dashboard.controller';
import * as spotTradeCtrl from '../controllers/spotTrade.controller';
import * as apiKeyCtrl from '../controllers/apiManage.controller';
import * as commonCtrl from '../controllers/common.controller';
import * as cmsCtrl from '../controllers/cms.controller';
import * as faqCtrl from '../controllers/faq.controller';
import * as anouncementCtrl from '../controllers/anouncement.controller';
import * as supportCtrl from '../controllers/support.controller';
import * as p2pCtrl from '../controllers/p2p.controller';
import * as newsLetterCtrl from '../controllers/newsLetter.controller'
import * as contactCtrl from '../controllers/contactUs.controller'
import * as webhookCtrl from '../controllers/webhook.controller';
import * as NotificationCtrl from '../controllers/notification.controller';


// import coin controllers
import * as coinpaymentCtrl from '../controllers/coin/coinpaymentGateway';

// import validation
import * as userValid from '../validation/user.validation';
import * as userKycValid from '../validation/userKyc.validation';
import * as walletValid from '../validation/wallet.validation';
import * as apiKeyVaild from '../validation/apiKey.validation'
import * as supportValid from "../validation/support.validation"
import * as p2pValid from '../validation/p2p.validation';
import * as contactUsValid from '../validation/contactus.validation'

import { decodedata } from '../lib/cryptoJS'

const router = express();
const passportAuth = passport.authenticate("usersAuth", { session: false });

// User
router.route('/register').post(decodedata,userValid.registerValidate, userCtrl.createNewUser);//
router.route('/login').post(decodedata,userValid.loginValidate, userCtrl.userLogin);//
router.route('/resend-otp').post(decodedata, userCtrl.resendOTP);
router.route('/confirm-mail').post(userValid.confirmMailValidate, userCtrl.confirmMail);
router.route('/check-deposit').get(apiKeyCtrl.authorization, userCtrl.checkDeposit)//
router.route('/hide-btn').get(apiKeyCtrl.authorizationEncrypt, userCtrl.hideBtn)
router.route('/userProfile')
    .get(apiKeyCtrl.authorizationEncrypt, userCtrl.getUserProfile)//
    .put(apiKeyCtrl.authorization, userCtrl.uploadProfile, userValid.editProfileValidate, userCtrl.editUserProfile);//
router.route('/changePassword').post(apiKeyCtrl.authorization, userValid.changePwdValidate, userCtrl.changePassword);//
router.route('/upgradeUser').post(apiKeyCtrl.authorization, userCtrl.upgradeUser)
router.route('/security/2fa')
    .get(apiKeyCtrl.authorization, userCtrl.get2faCode)
    .put(apiKeyCtrl.authorization, userValid.update2faValid, userCtrl.update2faCode)
    .patch(apiKeyCtrl.authorization, userValid.update2faValid, userCtrl.diabled2faCode);
router.route('/bankdetail')
    .post(apiKeyCtrl.authorization, userValid.editBankValidate, userCtrl.updateBankDetail)
    .put(apiKeyCtrl.authorization, userValid.deleteBankValidate, userCtrl.deleteBankDetail)
    .patch(apiKeyCtrl.authorization, userValid.deleteBankValidate, userCtrl.setPrimaryBank)
    .get(apiKeyCtrl.authorization, userCtrl.getBankDetail);
router.route('/userSetting')
    .get(decodedata, apiKeyCtrl.authorization, userCtrl.getUserSetting)//
    .put(decodedata, apiKeyCtrl.authorization, userValid.editSettingValid, userCtrl.editUserSetting);
router.route('/editNotif').put(apiKeyCtrl.authorization, userValid.editNotifValid, userCtrl.editNotif)
router.route('/forgotPassword').post(userValid.checkForgotPwdValidate, userCtrl.checkForgotPassword);

router.route('/resetPassword').post(userValid.resetPwdValidate, userCtrl.resetPassword);
router.route('/phoneChange') //
    .post(apiKeyCtrl.authorization, userValid.newPhoneValidate, userCtrl.changeNewPhone)
    .put(apiKeyCtrl.authorization, userValid.editPhoneValidate, userCtrl.verifyNewPhone);
router.route('/emailChange') //
    .post(apiKeyCtrl.authorization, userValid.editEmailValidate, userCtrl.editEmail)//
    .put(userValid.tokenValidate, userCtrl.sentVerifLink)//
    .patch(userValid.tokenValidate, userCtrl.verifyNewEmail);//
router.route('/sentOTP').post(decodedata, userValid.sentOtp, userCtrl.checkMobile, userCtrl.sentOtp)//

// kyc
router.route('/kycdetail').get(apiKeyCtrl.authorizationEncrypt, userKycCtrl.getUserKycDetail);//
router.route('/kyc').put(apiKeyCtrl.authorization, userKycCtrl.uploadKyc, userKycValid.updateKycValidate, userKycCtrl.updateKyc);//
router.route('/kyc/idproof').put(apiKeyCtrl.authorization, userKycCtrl.IDKycUpload, userKycValid.idProofValidate, userKycCtrl.updateIdProof);//
router.route('/kyc/addressproof').put(apiKeyCtrl.authorization, userKycCtrl.uploadKyc, userKycValid.addressProofValidate, userKycCtrl.updateAddressProof);//

// User Reference 

router.route('/transList').get(apiKeyCtrl.authorization, usrRefCtrl.transList)
router.route('/referralHist').get(apiKeyCtrl.authorization, usrRefCtrl.referralHist);

//user setting
router.route('/add-fav').post(apiKeyCtrl.authorization, userCtrl.AddFavorite)
router.route('/get-fav').get(apiKeyCtrl.authorization, userCtrl.getFavorit)

// wallet
// router.route('/getAssetsDetails').get(passportAuth, walletCtrl.getAssetsDetails);
router.route('/getAssetsDetails').get(apiKeyCtrl.authorizationEncrypt, walletCtrl.getWallet);//
router.route('/getHideoZeroStatus').get(apiKeyCtrl.authorization,walletCtrl.getHideZeroStatus).put(apiKeyCtrl.authorization,walletCtrl.updateHideZeroStatus);//
router.route('/getbalance').get(apiKeyCtrl.authorization, walletCtrl.getbalance);

// auto withdraw
router.route('/WithdrawApprove').post(walletValid.tokenValid, walletCtrl.WithdrawApprove);
router.route('/WithdrawCancel').post(walletValid.tokenValid, walletCtrl.WithdrawCancel);

router.route('/getAsset/:currencyId').get(apiKeyCtrl.authorization, walletCtrl.getAssetByCurrency);
router.route('/fiatWithdraw')
    .post(apiKeyCtrl.authorization, walletValid.tokenValid, walletCtrl.decryptWallet, walletValid.fiatWithdrawValidate, walletCtrl.checkUserKyc, walletCtrl.withdrawFiatRequest)
    .patch(walletValid.tokenValid, walletCtrl.fiatRequestVerify);
router.route('/coinWithdraw')
    .post(apiKeyCtrl.authorization, walletValid.tokenValid, walletCtrl.decryptWallet, walletValid.coinWithdrawValid, walletCtrl.withdrawCoinRequest)
    .patch(walletValid.tokenValid, walletCtrl.coinRequestVerify);
router.route('/fiatDeposit').post(apiKeyCtrl.authorization, walletCtrl.uploadWalletDoc, walletValid.depositReqtValid, walletCtrl.checkUserKyc, walletCtrl.depositRequest);
router.route('/walletTransfer').post(apiKeyCtrl.authorization, walletValid.walletTransferValid, walletCtrl.walletTransfer);
router.route('/fundTransfer').post(apiKeyCtrl.authorization, walletValid.fundTransferValid, walletCtrl.fundTransfer);
router.route('/withdrawfee').post(apiKeyCtrl.authorization, walletCtrl.withdrawfee)

router.route('/history/transaction/:paymentType').get(apiKeyCtrl.authorization, walletCtrl.getTrnxHistory);

// Dashboard
router.route('/recentTransaction').get(apiKeyCtrl.authorization, dashboardCtrl.getRecentTransaction);//
router.route('/loginHistory').get(apiKeyCtrl.authorization, dashboardCtrl.getLoginHistory);//
router.route('/notificationHistory').get(apiKeyCtrl.authorization, dashboardCtrl.getNotificationHistory);
router.route('/getDashBal').get(apiKeyCtrl.authorization, dashboardCtrl.getDashBal);//
router
  .route("/gettradehistory_dash")
  .get(apiKeyCtrl.authorization, dashboardCtrl.gettradehistory_dash);
  
//Top gain list
router.route('/top-gain').get(spotTradeCtrl.topGainList)
//statistic
router.route('/Statistic').get(apiKeyCtrl.authorization, userCtrl.getAllTrade)

//Notification
router.route('/get-notification').get( apiKeyCtrl.authorization, NotificationCtrl.getNotification)//
router.route('/unread-notice').get(apiKeyCtrl.authorization, NotificationCtrl.unReadNotice)//
router.route('/read-notification').put(apiKeyCtrl.authorization, NotificationCtrl.readNotification)//
router.route('/readsingel-notification').put( apiKeyCtrl.authorization, NotificationCtrl.readsingelNotification)
router.route('/create-notification').post(apiKeyCtrl.authorization, NotificationCtrl.NewNotification)


// API Management
router.route('/key/manage/:keyId?')
    .get(apiKeyCtrl.authorization, apiKeyCtrl.keyList)
    .post(apiKeyCtrl.authorization, apiKeyVaild.newKeyVaild, apiKeyCtrl.newKey)
    .patch(apiKeyCtrl.authorization, apiKeyCtrl.changeStatus)
    .delete(apiKeyCtrl.authorization, apiKeyCtrl.removeKey)

// router.route('/demo').get(apiKeyCtrl,)

// Common
router.route('/getLanguage').get(languageCtrl.getLanguage);//
router.route('/getCurrency').get(currencyCtrl.getCurrency);//
router.route('/getSocialMedia').get(commonCtrl.getSocialMedia);//
router.route('/getMarketTrend').get(commonCtrl.getMarketTrend)
router.route('/getCmsData').get(commonCtrl.getCmsData)
router.route('/getFaqTrend').get(commonCtrl.getFaqTrend)
router.route('/getPairData').get(apiKeyCtrl.authorization, commonCtrl.getPairData)
router.route('/priceConversion').get(apiKeyCtrl.authorization, commonCtrl.getPriceCNV)//
router.route('/historyFilter').get(apiKeyCtrl.authorization, commonCtrl.historyFilter)
router.route('/contact').post(contactUsValid.newContactValid, contactCtrl.newContact)

// Announcement
router.route('/announcement').get(anouncementCtrl.getAnnouncement)
router.route('/getannouncement').get(anouncementCtrl.getAnnouncementContent)

// CMS 
router.route('/cms/:identifier').get(cmsCtrl.getCMSPage)
router.route('/fetch-cms').post(decodedata,cmsCtrl.getAllCMSPage)

// FAQ
router.route('/faq').get(faqCtrl.getFaqWithCategory);//

// Support Ticket
router.route('/getSptCat').get(apiKeyCtrl.authorization, supportCtrl.getSptCat);//

router.route('/ticket')
    .get(apiKeyCtrl.authorization, supportCtrl.userTicketList)//
    .post(apiKeyCtrl.authorization, supportCtrl.uploadAttachment, supportValid.createNewTicket, supportCtrl.createNewTicket)//
    .put(apiKeyCtrl.authorization, supportCtrl.uploadAttachment, supportValid.usrReplyMsg, supportCtrl.usrReplyMsg)//
    .patch(apiKeyCtrl.authorization, supportCtrl.closeTicket);//

// P2P
router.route('/p2p/allPairs').get(p2pCtrl.allPairs);
router.route('/p2p/detail').get(p2pCtrl.getDetail)
router.route('/p2p/allPostAd').get(p2pCtrl.allPostAd)
router.route('/p2p/pair').get(p2pCtrl.getPairList)
router.route('/p2p/postOrder')
    .post(apiKeyCtrl.authorization, p2pValid.postAdValid, p2pCtrl.postOrder)
    .put(apiKeyCtrl.authorization, p2pValid.editPostValid, p2pCtrl.editPost)
    .patch(apiKeyCtrl.authorization, p2pCtrl.cancelPost)
router.route('/p2p/postOrderList').get(apiKeyCtrl.authorization, p2pCtrl.postOrderList)
router.route('/p2p/orderPlace').post(apiKeyCtrl.authorization, p2pValid.orderPlaceValid, p2pCtrl.checkPost, p2pCtrl.orderPlace)
router.route('/p2p/orderDetail/:orderId').get(apiKeyCtrl.authorization, p2pCtrl.getOrderDetail)
router.route('/p2p/conversation').post(apiKeyCtrl.authorization, p2pCtrl.uploadAttach, p2pCtrl.usrConversation)
router.route("/p2p/cancelOrder/:orderId").delete(apiKeyCtrl.authorization, p2pCtrl.cancelOrder);
router.route("/p2p/transferPayment/:orderId").post(apiKeyCtrl.authorization, p2pCtrl.transferPayment);
router.route("/p2p/releaseAsset").post(apiKeyCtrl.authorization, p2pCtrl.releaseAsset);
router.route("/p2p/disputeOrder/:orderId").post(apiKeyCtrl.authorization, p2pCtrl.disputeOrder);
router.route("/p2p/orderHistory").get(apiKeyCtrl.authorization, p2pCtrl.orderHistory);
router.route("/p2p/orderHistoryDoc").get(apiKeyCtrl.authorization, p2pCtrl.orderHistoryDoc);

// News Letter
router.route("/newsLetter/subscribe").post(newsLetterCtrl.newSubscribe);//

// Webhook
router.route('/depositwebhook').post(coinpaymentCtrl.verifySign, coinpaymentCtrl.depositwebhook)
router.route('/getMySpotHistory').post(apiKeyCtrl.authorization, spotTradeCtrl.getMySpotHistory);
router.route('/getFilledOrderHistory').post(apiKeyCtrl.authorization, spotTradeCtrl.getFilledOrderHistory);
//chechemail
router.route('/checkEmail').post(apiKeyCtrl.authorization,userCtrl.checkEmail)//
export default router;