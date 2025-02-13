// import lib
import isEmpty from '../lib/isEmpty'

export const TemplateValid = (req,res,next) =>{
    try{
        
        let error = {}
        if(isEmpty(req.body.title)){
            error.title='PageName Required'
        }
        if(isEmpty(req.body.content)){
            error.content='Content Required'
        }
        if(!isEmpty(error)){
            return res.status(400).json({status:false , error:error})
        }
        return next()
    }catch(err){
        return res.status(500).json({status:false , message:'content is wrong Page Name is Required'})
    }
}

