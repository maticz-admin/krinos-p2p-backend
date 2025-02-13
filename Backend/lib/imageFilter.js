const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF)$/)) {
        req.validationError = {
            'fieldname': file.fieldname,
            'messages': 'INVALID_IMAGE'
        }
        req.fileValidationError = 'INVALID_IMAGE';
        return cb(new Error('INVALID_IMAGE'), false);
    }
    cb(null, true);
};
export const pdfFilter = (req, file, cb) => {

    if (!file.originalname.match(/\.(pdf|PDF)$/)) {
        req.validationError = {
            'fieldname': file.fieldname,
            'messages': 'INVALID_DOC'
        }
        req.fileValidationError = 'INVALID_DOC';
        return cb(new Error('INVALID_DOC'), false);
    }
    cb(null, true);
}

export const imgFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.validationError = {
            'fieldname': file.fieldname,
            'messages': 'INVALID_IMAGE'
        }
        req.fileValidationError = 'INVALID_IMAGE';
        return cb(new Error('INVALID_IMAGE'), false);
    }
    cb(null, true);
};

export default imageFilter;