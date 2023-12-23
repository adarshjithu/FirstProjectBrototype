const asyncHandler = require('express-async-handler');

const mongoose = require('mongoose');
 

const connection =asyncHandler(async()=>{
    try{

      await   mongoose.connect(process.env.DBCONNECTION_STRING).then(()=>{
             console.log("database connected")
        })
    
    }
    catch(error){ 
        
        throw new Error("Mongodb Connection Error "+error)
    }



})






module.exports = connection;