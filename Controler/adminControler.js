const { createAdmin } = require("../middlewares/middleware")
const asyncHandler = require("express-async-handler");
const UserCollection = require("../models/userModel");
const Admin = require("../models/adminModel")
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}))

const adminHome = (req,res)=>{
    var ADMIN;
    if(req.session.admin){
        
        
        
       
      
    }
    else{
        ADMIN=null;
    }
    // createAdmin('adarsh','adarshjithu10@gmail.com','123');
    res.render("admin/home",{admin:req.session.admin.name})
}
//admin login page

const adminLogin = (req,res)=>{
    if(req.session.admin){
       res.redirect("/admin") 

    }
    else{

        res.render("admin/login")
    }
}
//admin post login

const adminLoginPost = asyncHandler(async (req,res)=>{
         try{

             const admin = await Admin.findOne({email:req.body.email});
             if(admin&&await admin.isPasswordMatched(req.body.password)){
                req.session.admin=admin;

                req.session.admin.name=req.session.admin.name.charAt(0).toUpperCase()+req.session.admin.name.slice(1)
                res.redirect("/admin")
             }  
             else{
                res.redirect("/admin/login",{home:true})
             }
         }
         catch(error){
            throw new Error(error.message)

         }

  

    
})

//admin logout

const adminLogout = (req,res)=>{
    req.session.admin=null;
    res.redirect("/admin")
}

//admin customer

const adminCustomers = asyncHandler(async(req,res)=>{

    try{
        const customers = await UserCollection.find().lean()
       

        res.render("admin/customers",{admin:req.session.admin.name,customers})
    }
    catch(error){
        throw new Error(error.message)
    }


})

//admin view products

const adminViewProducts = (req,res)=>{
    res.render("admin/viewProducts",{admin:req.session.admin.name})
}

//blockuser

const adminBlockUser =asyncHandler(async(req,res)=>{

    try{
       const data =   await UserCollection.findOne({_id:req.params.id});
          if(data.isActive){
           
           let user = await UserCollection.findOneAndUpdate({_id:req.params.id},{isActive:false})
           
          }
          else{
            let user = await UserCollection.findOneAndUpdate({_id:req.params.id},{isActive:true})
          }
          res.redirect("/admin/customers")
              }
    catch(error){
        throw new Error(error.message)
    }
    

})

module.exports = {adminHome,adminLogin,adminLoginPost,adminLogout,adminCustomers,adminViewProducts,adminBlockUser};