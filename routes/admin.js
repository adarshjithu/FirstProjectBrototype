const express = require('express');
const app = express.Router()
app.get('/',(req,res)=>{
    res.send("this is admin")
})
module.exports= app;








