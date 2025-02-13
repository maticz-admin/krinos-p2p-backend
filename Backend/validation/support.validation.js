import isEmpty from '../lib/isEmpty';

/** 
 * Create New Ticket
 * URL: /api/ticket
 * METHOD : POST
 * BODY : categoryId, message
 * FILE : file (optional)
*/

export const createNewTicket = (req, res, next) => {
    let errors = {}, reqBody = req.body, reqFile = req.files;
    // return
    console.log('reqBody------', reqBody);
    let allowedExtension = ['jpeg', 'jpg', 'png', 'pdf', 'mp4'];
    let allowedFileExtension = ['pdf', 'odt', 'doc'];

    if (isEmpty(reqBody.categoryId)) {
        errors.categoryId = "category field is required";
    }

    if (isEmpty(reqBody.message)) {
        errors.message = "message field is required";
    }



    // if (!isEmpty(reqFile.file && reqFile.file[0])) {
    // //     errors.file = "Image field is required";
    // // }else{
    //     let type = reqFile.file[0].mimetype.split('/')[1]
    //  if(!allowedExtension.includes(type)){
    //     errors.file = "Please Choose with the known file types jpg, jpeg, png, pdf, or mp4.";
    //  }
    // }

    if (!isEmpty(errors)) {
        return res.status(400).json({ 'status': false, 'errors': errors });
    }

    return next();
}

/** 
 * User Reply Message
 * URL: /api/ticket
 * METHOD : PUT
 * BODY : ticketId, receiverId, message
 * FILE : file (optional)
*/
export const usrReplyMsg = (req, res, next) => {

    try {
        let errors = {}, reqBody = req.body, reqFile = req.files;

        let allowedExtension = ['jpeg', 'jpg', 'png', 'pdf', 'mp4'];
        // let allowedFileExtension = ['pdf', 'odt', 'doc'];

        if (isEmpty(reqFile) && isEmpty(reqBody.message)) {
            errors.message = "message field is required";
        }
        if (!isEmpty(reqFile)) {
            if (!isEmpty(reqFile.file && reqFile.file[0])) {
                //     errors.file = "Image field is required";
                // }else{
                let type = reqFile.file[0].mimetype.split('/')[1]
                if (!allowedExtension.includes(type)) {
                    errors.file = "Please Choose with the known file types jpg, jpeg, png, pdf, or mp4.";
                }
            }
        }


        if (!isEmpty(errors)) {
            return res.status(400).json({ 'status': false, 'errors': errors });
        }

        return next();
    } catch (err) {
        return res.status(500).json({ status: false, message: 'catch err' })
    }
}



export const SupportUpdateValid = (req, res, next) => {
    try {
        let error = {};
        let reqBody = req.body
        if (isEmpty(reqBody.categoryName)) {
            error.categoryName = 'Category Name is Required'
        }
        if (!isEmpty(error)) {
            return res.status(400).json({ status: false, errors: error })
        }
        return next()
    } catch (err) {
        return res.status(500).json({ status: false, message: 'catch err' })
    }
}

export const MessgaeValid = (req, res, next) => {
    try {
        let error = {};
        let reqBody = req.body
        if (isEmpty(reqBody.message)) {
            error.message = 'Message is Empty'
        }
        if (!isEmpty(error)) {
            return res.status(400).json({ status: false, errors: error })
        }
        return next()
    } catch (err) {
        return res.status(500).json({ status: false, message: 'catch err' })
    }
}
