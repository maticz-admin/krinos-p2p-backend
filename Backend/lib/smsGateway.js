// import package
import twilio from 'twilio';

// import lib
import config from '../config';

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

export const sentOtp = async (to) => {
    console.log('totototototo-----', to, config.smsGateway.TWILIO_SERVICE_SID);

    try {
        // Initialize Twilio client
        const client = twilio(
            config.smsGateway.TWILIO_ACCOUT_SID,
            config.smsGateway.TWILIO_AUTH_TOKEN
        );

        // Check if the phone number is in the correct format
        if (!to || !/^(\+\d{1,3}[- ]?)?\d{10}$/.test(to)) {
            throw new Error('Invalid phone number format. Please use E.164 format.');
        }

        // Log client verification request for debugging
        console.log('Attempting to send OTP to:', to);

        // Send the OTP request
        const verificationResponse = await client.verify.services(config.smsGateway.TWILIO_SERVICE_SID)
            .verifications.create({ to: to, channel: 'sms' });

        // Log response to ensure it's successful
        console.log('Verification response:', verificationResponse);

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

export const verifyOtp = async (to, otp) => {
    try {
        const client = twilio(
            config.smsGateway.TWILIO_ACCOUT_SID,
            config.smsGateway.TWILIO_AUTH_TOKEN,
        )
        let verification_check = await client.verify.services(config.smsGateway.TWILIO_SERVICE_SID).verificationChecks.create({ to: to, code: otp });
        if (verification_check && verification_check.valid) {
            return { smsStatus: true };
        }
        return {
            smsStatus: false
        }
    } catch (err) {
        return { smsStatus: false , "message":err.Error};
    }
};