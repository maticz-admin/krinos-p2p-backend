// import package
import CryptoJS from 'crypto-js';

// import lib
import config from '../config';
import isEmpty from './isEmpty';

export const encryptJs = (encryptValue) => {
  try {
    encryptValue = JSON.stringify(encryptValue);
    let key = CryptoJS.enc.Latin1.parse('1234567812345678');
    let iv = CryptoJS.enc.Latin1.parse('1234567812345678');

    let encrypted = CryptoJS.AES.encrypt(encryptValue, key, {
      iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding
    });
    return encrypted.toString();
  }
  catch (err) {
    return ''
  }
}

export const decryptJs = (decryptValue) => {
  try {
    let key = CryptoJS.enc.Latin1.parse('1234567812345678');
    let iv = CryptoJS.enc.Latin1.parse('1234567812345678');
    let bytes = CryptoJS.AES.decrypt(decryptValue, key, {
      iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
    });
    let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData
  }
  catch (err) {
    return ''
  }
}

export const replaceSpecialCharacter = (value, type) => {
  try {
    let textValue = value;
    if (!isEmpty(textValue)) {
      if (type == 'encrypt') {
        // textValue = textValue.toString().replace('+', 'xMl3Jk').replace('/', 'Por21Ld').replace('=', 'Ml32');
        textValue = textValue.toString().replace(/\+/g, 'xMl3Jk').replace(/\//g, 'Por21Ld').replace(/\=/g, 'Ml32');
      } else if (type == 'decrypt') {
        // textValue = textValue.replace('xMl3Jk', '+').replace('Por21Ld', '/').replace('Ml32', '=');
        textValue = textValue.replace(/\xMl3Jk/g, '+').replace(/\Por21Ld/g, '/').replace(/\Ml32/g, "=");
      }
    }
    return textValue
  } catch (err) {
    return ''
  }
}

export const encryptString = (encryptValue, isSpecialCharacters = false) => {
  try {
    encryptValue = encryptValue.toString()
    let ciphertext = CryptoJS.AES.encrypt(encryptValue, config.cryptoSecretKey).toString();
    if (isSpecialCharacters) {
      return replaceSpecialCharacter(ciphertext, 'encrypt')
    }
    return ciphertext
  }
  catch (err) {
    return ''
  }
}

export const decryptString = (decryptValue, isSpecialCharacters = false) => {
  try {
    if (isSpecialCharacters) {
      decryptValue = replaceSpecialCharacter(decryptValue, 'decrypt')
    }

    let bytes = CryptoJS.AES.decrypt(decryptValue.toString(), config.cryptoSecretKey);
    let originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText
  }
  catch (err) {
    return ''
  }
}

export const encryptObject = (encryptValue) => {
  try {
    let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(encryptValue), config.cryptoSecretKey).toString();
    return ciphertext
  }
  catch (err) {
    return ''
  }
}

export const decryptObject = (decryptValue) => {
  try {
    let bytes = CryptoJS.AES.decrypt(decryptValue, config.cryptoSecretKey);
    let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData
  }
  catch (err) {
    return ''
  }
}

export const encodedata = (data) => {
  let encrpteddata = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    config.cryptoSecretKey
  ).toString();
  // console.log('data--------', data);

  return encrpteddata;
};

//Decrypt the Hash dat into Formdata etc


export const decodedata = (req, res, next) => {
  try {
    const contentType = req?.headers?.['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');

    // 🔐 Helper to safely decrypt
    const safeDecrypt = (encrypted) => {
      if (!encrypted || typeof encrypted !== 'string') return null;
      try {
        const bytes = CryptoJS.AES.decrypt(encrypted, config.cryptoSecretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || null;
      } catch (err) {
        console.error('Decryption error:', err);
        return null;
      }
    };

    // 🔄 Handle multipart/form-data
    if (isMultipart) {
      for (const key of Object.keys(req.body)) {
        const decryptedData = safeDecrypt(req.body[key]);
        if (!decryptedData) {
          return res.status(400).json({
            Status: false,
            msg: `Decryption failed or empty for ${key}`,
            success: 'error',
          });
        }

        try {
          req.body[key] = JSON.parse(decryptedData);
        } catch (err) {
          console.warn(`JSON parse error for ${key}, using raw string.`);
          req.body[key] = decryptedData;
        }
      }
      return next();
    }

    // 🔄 Handle JSON body with encrypted 'encode' field
    if (req.body && req.body.encode) {
      const decryptedData = safeDecrypt(req.body.encode);
      if (!decryptedData) {
        return res.status(400).json({
          Status: false,
          msg: 'Decryption failed for body.encode',
          success: 'error',
        });
      }

      try {
        req.body = JSON.parse(decryptedData);
      } catch (err) {
        console.warn('JSON parse error in body.decode, using raw string.');
        req.body = decryptedData;
      }
      return next();
    }

    // 🔄 Handle query params with encrypted 'encode'
    if (req.query && (req.query.encode || Object.keys(req.query).length)) {
      const encrypted = req.query.encode || req.query;
      const decryptedData = safeDecrypt(encrypted);
      if (!decryptedData) {
        return res.status(400).json({
          Status: false,
          msg: 'Decryption failed for query.encode',
          success: 'error',
        });
      }

      try {
        req.query = JSON.parse(decryptedData);
      } catch (err) {
        console.warn('JSON parse error in query.decode, using raw string.');
        req.query = decryptedData;
      }
      return next();
    }

    // 🧯 If nothing matched
    return res.status(400).json({
      Status: false,
      msg: 'No encrypted data found in request',
      success: 'error',
    });

  } catch (err) {
    console.error('Unhandled decryption error:', err);
    return res.status(500).json({
      Status: false,
      msg: 'Authentication Failed',
      success: 'error',
    });
  }
};

export const reqBodyDecodata = (req, res) => {
  try {
    const reqBody = req.body;
    if (reqBody) {

      let decryptedData = CryptoJS.AES.decrypt(reqBody?.encode, config.cryptoSecretKey).toString(CryptoJS.enc.Utf8);

      console.log('reqBodyreqBody------', decryptedData);

      if (decryptedData) {
        try {
          req.body = JSON.parse(decryptedData);
        } catch (err) {
          console.log("Error parsing JSON for req.body:", err);
          req.body = decryptedData; // Fallback to decrypted string
        }
        return next();
      } else {
        return res.status(200).json({
          Status: false,
          msg: "Authentication Failed",
          success: "error",
        });
      }
    }
  } catch (error) {

  }

}
export const reqQueryDecodedata = (req, res, next) => {
  try {
    const reqQuery = req.query;
    console.log('reqQuery------', reqQuery);
    if (reqQuery) {

      let decryptedData = CryptoJS.AES.decrypt(reqQuery.encode, config.cryptoSecretKey).toString(CryptoJS.enc.Utf8);

      console.log('decryptedData---', decryptedData);

      if (decryptedData) {
        try {
          req.query = JSON.parse(decryptedData);

        } catch (err) {
          console.log("Error parsing JSON for req.query:", err);
          req.query = decryptedData;
        }
        return next();
      } else {
        return res.status(200).json({
          Status: false,
          msg: "Authentication Failed",
          success: "error",
        });
      }
    }
  } catch (err) {
    console.log("errrrrrrrrrr-----", err);
    return res.status(500).json({
      Status: false,
      msg: "Authentication Failed",
      success: "error",
    });
  }
};