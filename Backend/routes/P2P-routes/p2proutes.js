import express from 'express';
import passport from 'passport';
import * as p2pcontroller from '../../controllers/P2PCONTROLLER/p2pcontroller';
import * as orderctrl from '../../controllers/P2PCONTROLLER/OrderchatController';
import * as apiKeyCtrl from "../../controllers/apiManage.controller" //'../controllers/apiManage.controller';
import * as usercontroller from '../../controllers/USERCONTROLLER/usercontroller'

import { decodedata, encodedata, reqQueryDecodedata } from "../../lib/cryptoJS"

const router = express();
const passportAuth = passport.authenticate("usersAuth", { session: false });

router.route("/create-p2p-orders").post(decodedata, apiKeyCtrl.authorization, p2pcontroller.CreateP2Porder);
router.route("/filter-p2p-orders").post(decodedata, p2pcontroller.Filterp2porderhooks);//
router.route("/get-coinlist").get(p2pcontroller.Getcoinlist); //
router.route("/get-preferedcurrency").get(p2pcontroller.Getpreferedcurrency); //
router.route("/get-offettag").get(p2pcontroller.Getalloffertag); //

//trade chat 
router.route("/getsingletradechat").get(reqQueryDecodedata, p2pcontroller.Getsingletradechat);//
router.route("/updateofferviews").post(apiKeyCtrl.authorization, p2pcontroller?.Updateofferviews);
router.route("/getsingleuser").get(reqQueryDecodedata, apiKeyCtrl.authorizationEncrypt, p2pcontroller.Getsingleuser);//
router.route("/cancel-trade").post(apiKeyCtrl.authorization, p2pcontroller.canceltrade);

router.route("/Placeorder").post(apiKeyCtrl.authorization, p2pcontroller.Placeorder);
router.route("/adduser-review").post(decodedata, apiKeyCtrl.authorization, p2pcontroller.adduserreview);
router.route("/createroom").post(apiKeyCtrl.authorization, p2pcontroller.createroom);
router.route("/user-offer").get(p2pcontroller.useroffer);//
router.route("/get-singlesaledetail").get(reqQueryDecodedata, p2pcontroller.singlesaledetail); //
router.route("/update-order-status").post(decodedata, apiKeyCtrl.authorization, p2pcontroller.orderstatus);

router.route("/get-currency-data").get(p2pcontroller.getcurrencydata);
router.route("/assetupdate").post(apiKeyCtrl.authorization, p2pcontroller.Adminassetupdate);

router.route("/update-user-status").post(decodedata, p2pcontroller.updateuseronlinestatus);

router.route("/get-cms").get(reqQueryDecodedata, p2pcontroller.Getcms); //
router.route("/get-faq").get(p2pcontroller.Getfaq); //
router.route("/get-sitesettings").get(p2pcontroller.getsitesettings); //
router.route("/get-tradehistory").get(reqQueryDecodedata, p2pcontroller.gettradehistory); //

router.route("/get-your-request").get(reqQueryDecodedata, p2pcontroller.getspenderhistory);//
router.route("/get-user-balance").get(apiKeyCtrl.authorization, p2pcontroller.gettotaluserbalance);
router.route("/get-trade-speed").get(p2pcontroller.gettradespeed);//
router.route("/update-profile-pic").post(apiKeyCtrl.authorization, p2pcontroller.updateuserprofilepicUpload, p2pcontroller.updateuserprofilepic);
router.route("/cancel-offer").post(apiKeyCtrl.authorization, p2pcontroller?.canceloffer);
router.route("/get-paymenttypes").get( p2pcontroller.getpaymentmethod);//
router.route("/create-addresss").post(p2pcontroller.createcryptoaddress);
router.route("/get-message-notification").get(apiKeyCtrl.authorizationEncrypt, orderctrl.getmessagenotification); //
router.route("/markus_readone").post(apiKeyCtrl.authorization, orderctrl.markasreadeone);
router.route("/markas-readall").post(apiKeyCtrl.authorization, orderctrl.markasreadeall);
router.route("/getunreadmessagenotification").get(apiKeyCtrl.authorization, orderctrl.getunreadmessagenotification);

//token check deposit
router.route("/check-deposit").post(apiKeyCtrl.authorization, p2pcontroller.Checkdeposit);


router.route("/get-userp2pcreate-orders").get(reqQueryDecodedata, usercontroller.Getuserp2pcreateorder);
router.route("/get-userp2pviewoffer").get(reqQueryDecodedata, usercontroller.Getuserp2pviewoffer)

export default router;                                                                                                                                                                                                                                                                                                                                            