const asyncHandler = require("express-async-handler");
const AddressCollection = require("../models/addressModel");
const AccountCollection = require('../models/accountModel');


//profile address
const profileAddressControler = asyncHandler(async (req, res) => {
     try {
          const address = await AddressCollection.find({ user: req.session.user._id }).lean();
          res.render("profile/address", { home: true, address });
     } catch (error) {
          throw new Error(error.message);
     }
});
//address post

const profileAddressPostControler = asyncHandler(async (req, res) => {
     try {
          const address = req.body;
          address.user = req.session.user._id;
          const addressObj = await AddressCollection.findOne({ addresstype: req.body.addresstype });
          if (addressObj) {
               res.render("profile/address", { home: true, error: true });
          } else {
               await AddressCollection.create(address);
               res.redirect("/profile/address");
          }
     } catch (error) {
          throw new Error(error.message);
     }
});

//delete address

const deleteAddress = asyncHandler(async (req, res) => {
     try {
          await AddressCollection.findOneAndDelete({ user: req.session.user._id, _id: req.query.id });
          res.redirect("/profile/address");
     } catch (error) {
          throw new Error(error.message);
     }
});

//edit address

const editAddress = asyncHandler(async (req, res) => {
     try {
          const address = await AddressCollection.findOne({ _id: req.query.id }).lean();

          var type;
          if (address.addresstype == "home") {
               type = { home: true };
          }
          if (address.addresstype == "work") {
               type = { work: true };
          }
          if (address.addresstype == "address-1") {
               type = { address1: true };
          }
          if (address.addresstype == "address-2") {
               type = { address2: true };
          }

          res.render("profile/edit-address", { home: true, address, type });
     } catch (error) {
          throw new Error(error.message);
     }
});

//edit address post controler

const editAddressPost = asyncHandler(async (req, res) => {
   try{

      await AddressCollection.findOneAndUpdate({user:req.session.user._id,_id:req.query.id},req.body);
      res.redirect("/profile/address")
        
        console.log(req.query.id)
        console.log(req.body);
   }
   catch(error){
      throw new Error(error.message)
   }
});

//account details
const accountDetails = asyncHandler(async(req,res)=>{
   const account = await AccountCollection.findOne({user:req.session.user._id}).lean();
  
   res.render("profile/account-details",{home:true,account})
   

})

//account details post

const accountDetailsPost = asyncHandler(async(req,res)=>{
   

   const account = req.body;
   account.user=req.session.user._id;
   const accountFind = await AccountCollection.findOne({user:req.session.user._id}).lean();
   if(accountFind){
      console.log('account find')
      await AccountCollection.findOneAndUpdate({user:req.session.user._id},account);
       res.redirect("/profile/account-details")
   }
   else{
          console.log('accountnot found')
      await AccountCollection.create(account);
      res.redirect("/profile/account-details")
   }

})

//profile change image

const profileChangeImage = asyncHandler(async(req,res)=>{
   await AccountCollection.updateOne({user:req.session.user._id},{$set:{image:req.file.filename}})
   res.redirect('/profile/account-details')
})


//profile icon

const profileIconControler = asyncHandler(async(req,res)=>{
 
   const profile =await  AccountCollection.findOne({user:req.session.user._id})

   res.json({image:profile.image})
})





module.exports = { profileAddressControler, profileAddressPostControler, deleteAddress, editAddress,editAddressPost,accountDetails
,accountDetailsPost ,profileChangeImage,profileIconControler};
