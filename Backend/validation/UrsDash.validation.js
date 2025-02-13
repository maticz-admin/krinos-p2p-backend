const isEmpty = require('is-empty')

export const UrsUpdateValida = (req, res, next) => {
    try {
        let errors = {}
        let reqBody = req.body

        for (var i = 0; i < reqBody.currencyList.length; i++) {
            if (isEmpty(reqBody.currencyList[i].currencyId)) {
                errors.currency = 'currency Required'

            }
            if (isEmpty(reqBody.currencyList[i].colorCode)) {
                errors.colorCode = 'color code Required'
            }
        }
      

        if (!isEmpty(errors)) {
            return res.status(400).json({ status: false, errors: errors })
        }
        return next()
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Something went Wrong' })
    }
}