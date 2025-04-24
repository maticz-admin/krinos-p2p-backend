// import package
import twilio from 'twilio';

// import lib
import config from '../config';
import { User } from '../models';

export const sentSms = async ({ to, body = '' }) => {
    const client = twilio(
        config.smsGateway.TWILIO_ACCOUT_SID,
        config.smsGateway.TWILIO_AUTH_TOKEN,
    )

    try {
        await client.messages.create({
            from: config.smsGateway.TWILIO_PHONE_NUMBER,
            to,
            body
        })
        return {
            'smsStatus': true
        }
    }
    catch (err) {
        return {
            'smsStatus': false
        }
    }
}

export const sentOtp = async (to, body) => {
    console.log('totototototo-----', to, body, config.smsGateway);

    try {

        const accountSid = config.smsGateway.TWILIO_ACCOUT_SID;
        const authToken = config.smsGateway.TWILIO_AUTH_TOKEN;

        const client = require('twilio')(accountSid, authToken);

        const fromNumber = config.smsGateway.TWILIO_PHONE_NUMBER;
        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to,
        });
        return { smsStatus: true };
    } catch (err) {
        // Log the entire error for more details
        console.log('smsStatus-----', err);

        // Check if the error has a more detailed message
        const errorMessage = err.message || 'An error occurred while sending OTP.';
        return { smsStatus: false, message: errorMessage };
    }
};

// try {
//     // const client = twilio(
//     //     config.smsGateway.TWILIO_ACCOUT_SID,
//     //     config.smsGateway.TWILIO_AUTH_TOKEN,
//     // )
//     client.verify.v2.services
//     .create({friendlyName: 'Toss V Toss Verify Service'})
//     .then(service =>{
// // create otp
//   client.verify.services(config.smsGateway.TWILIO_SERVICE_SID).verifications.create({ to: to, channel: "sms" })   })

//     return { smsStatus: true };
// } catch (err) {
//     return { smsStatus: false, "message":err.Error };
// }





// export const verifyOtp = async (to, otp) => {
//     try {
//         console.log('tooooooooooo', to, 'otpppppppppp---', otp);

//         // Initialize Twilio client
//         const client = twilio(
//             config.smsGateway.TWILIO_ACCOUT_SID,
//             config.smsGateway.TWILIO_AUTH_TOKEN
//         );

//         // Ensure that "to" is a phone number, not an email.
//         if (!to || !otp) {
//             return { smsStatus: false, message: "Phone number or OTP is missing." };
//         }

//         // Call Twilio's Verify API with the proper service SID
//         // const verificationCheck = await client.verify.v2
//         //     .services(config.smsGateway.TWILIO_ACCOUT_SID) // Use the correct Service SID here
//         //     .verificationChecks.create({
//         //         code: otp,  // OTP that the user entered
//         //         to: to,     // The phone number to verify (in E.164 format)
//         //     });
//         let verificationCheck = await client.verify.services(config.smsGateway.TWILIO_SERVICE_SID).verificationChecks.create({ to: to, code: otp });

//         if (verification_check && verification_check.valid) {
//             return { smsStatus: true };
//         }
//         console.log('verificationCheck----', verificationCheck);

//         // Check if the verification was successful
//         if (verificationCheck && verificationCheck.valid) {
//             return { smsStatus: true };
//         }

//         // Return false if verification failed
//         return { smsStatus: false, message: "Invalid OTP." };

//     } catch (err) {
//         console.log('errrr----', err);

//         // Error handling
//         return { smsStatus: false, message: err.message || "An error occurred while verifying OTP." };
//     }
// };




export const verifyOtp = async (checkDoc, otp, type) => {
    try {
        console.log('checkDoc.id---', checkDoc.id, checkDoc._id, otp);

        // Check for the case when the type is 'registerMobile' and no checkDoc is found
        if (checkDoc == '' || !checkDoc && type === 'registerMobile') {
            console.log("OTP is valid for registerMobile");
            return { smsStatus: true };
        }

        // Verify OTP, ensuring it was generated in the last 10 minutes
        const user = await User.findOne({
            _id: checkDoc?._id, // Use optional chaining to ensure it doesn't throw an error
            otp: otp,
            otptime: { $gte: new Date(new Date().getTime() - 600000) } // Check if OTP is within the last 10 minutes
        });

        // If user is found and OTP is valid
        if (user) {
            console.log("OTP is valid");
            return { smsStatus: true };
        } else {
            console.log("OTP is invalid or expired");
            return { smsStatus: false, message: "OTP is invalid or has expired." };
        }

    } catch (err) {
        console.log("Error verifying OTP: ", err);
        return { smsStatus: false, message: err.message || "An error occurred during OTP verification" };
    }
};
