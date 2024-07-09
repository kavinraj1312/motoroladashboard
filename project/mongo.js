const mongoose=require('mongoose')


const connectDb=async(url)=>{
    try {
        mongoose.connect(url)
        console.log("connected successfully")
        
    } catch (error) {
        console.log(error)

        
    }
   
}
module.exports=connectDb