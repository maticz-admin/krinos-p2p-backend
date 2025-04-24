// import lib
import { decodedata, encodedata } from '../lib/cryptoJS'
import isEmpty from '../lib/isEmpty'


export const FaqCatUpdateValid = (req,res,next) =>{
    try{
        let error = {}
        let reqBody = req.body
        if(isEmpty(reqBody.name)){
            error.name='Name is Required'
        }
        if(!isEmpty(error)){
            return res.status(400).json(encodedata({status:false , error:error}))
        }
        return next()
    }catch(err){
        return res.status(500).json(encodedata({status:false , message:'Something went wrong'}))
    }
   
}

export const FaqUpdateValid = (req,res,next) =>{
    try{


        let error = {}
        let reqBody = req.body
        
        if(isEmpty(reqBody.question)){
            error.question='question is Required'
        }
        if(isEmpty(reqBody.categoryId)){
            error.category='category Required'
        }

          
        if(isEmpty(reqBody.answer)){
            error.answer='answer is Required'
        }

        if(!isEmpty(error)){
            return res.status(400).json(encodedata({status:false , error:error}))
        }
        return next()
    }catch(err){
        return res.status(500).json(encodedata({status:false , message:'Something went wrong'}))
    }
   
}



export const FaqAddValid = (req, res, next) => {
    try {
        let errors = {};
        let reqBody = req.body;

        if (isEmpty(reqBody.name)) {
            errors.name = 'Name is required';
        }

        if (!isEmpty(errors)) {
            return res.status(400).json(encodedata({
                status: false,
                error: errors,
                success: 'error'
            }));
        }

        return next();
    } catch (err) {
        console.log('Validation Error:', err);
        return res.status(500).json(encodedata({
            status: false,
            message: 'Something went wrong',
            success: 'error'
        }));
    }
};
