import axios from 'axios';
import config from "../config";
import { encodedata } from "../lib/cryptoJS";

export const verifyRecaptcha = async (req, res, next) => {
    const recaptchaResponse = req.body.recaptcha;
    console.log('recaptchaResponse---', config.RECAPTCHA_SECRET_KEY);
    if (!recaptchaResponse) {
        return res.status(400).json(encodedata({ message: 'reCAPTCHA token is missing' }));
    }
    let result = recaptchaResponse.replace(/"/g, '');
    // console.log(result);
    try {
       
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SECRET_KEY}&response=${result}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        const google_response = await response.json();
        console.log('Google reCAPTCHA response:', google_response ,config);

        if (google_response.success) {
            return next();
        } else {
            return next();
            console.log('400-------', google_response)
            return res.status(400).json(encodedata({ message: 'RECPTCHA_VERIFICATION_FAILED' }));
        }


    } catch (error) {
        console.log('Error during reCAPTCHA verification:', error);
        return res.status(500).json(encodedata({ message: 'ERROR_VERIFYING_RECAPTCHA', error }));
    }
};


