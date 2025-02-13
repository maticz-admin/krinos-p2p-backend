import isEmpty from '../lib/isEmpty'

export const newsValid = (req, res, next) => {
    let errors = {}, reqBody = req.body;
    if (isEmpty(reqBody.subscribedId)) {
        errors.email = 'Email field is required'
    }
    if (isEmpty(reqBody.message)) {
        errors.message = 'content field is required'
    }
    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}
