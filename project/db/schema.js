const mongoose=require('mongoose')

const logSchema=new mongoose.Schema({
    username:{
        type:String,
        required:[true,'name is required']
    },
    password:{
        type:String,
        required:[true,'password is required']
    },
    secretkey:{
        type:String,
       
    }
     
     

})

const LogInfo=mongoose.model('LogInfo',logSchema)
module.exports=LogInfo