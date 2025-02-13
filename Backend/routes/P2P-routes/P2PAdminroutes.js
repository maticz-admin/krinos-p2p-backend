import express from 'express';
import passport from 'passport';

const router = express();
import * as p2padmincontroller from "../../controllers/P2PCONTROLLER/p2pAdmincontroller";
import { decodedata, reqQueryDecodedata } from '../../lib/cryptoJS';
const passportAuth = passport.authenticate("adminAuth", { session: false });


router.route("/add-offertag").post(passportAuth , p2padmincontroller.Addoffertag);
router.route("/edit-offertag").post(passportAuth , p2padmincontroller.Editoffertag);
router.route("/get-offertag").get(passportAuth , p2padmincontroller.Getalloffertag);

router.route("/get-offer-history").get(reqQueryDecodedata, passportAuth , p2padmincontroller.getofferhistory);
router.route("/get-trade-history").get(reqQueryDecodedata, passportAuth , p2padmincontroller.gettradehistory);

router.route("/get-paymenttypes").get(passportAuth , p2padmincontroller.getpaymenttypes);
router.route("/add-paymenttypes").post(passportAuth , p2padmincontroller.addpaymenttypes);
router.route("/edit-paymenttypes").post(passportAuth , p2padmincontroller.editpaymenttypes);

router.route("/getownerwallet").get(passportAuth , p2padmincontroller.GetWallet);
router.route("/updatewallet").post(decodedata, passportAuth , p2padmincontroller.updatewallet);

export default router;
