
// import package
import axios from 'axios';

// import lib
import config from '../lib/config';

export const sendEmailTemplate = async (identifier, toEmail, content) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${config.API.adminService}/api/mailTemplate`,
            data: {
                identifier,
                email: toEmail,
                contentData: content
            }
        });

    }
    catch (err) {
    }
}