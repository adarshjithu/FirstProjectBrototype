const express = require('express');
const app = express.Router();
const {verifyLogin}= require("../middlewares/middleware");
const { upload} = require('../config')
const {profileAddressControler, profileAddressPostControler, deleteAddress, editAddress, editAddressPost, accountDetails, accountDetailsPost, profileChangeImage, profileIconControler}= require("../Controler/profileControler")



app.get('/address',verifyLogin,profileAddressControler);
app.post('/address',profileAddressPostControler);
app.get("/delete-address",deleteAddress);
app.get("/edit-address",editAddress);
app.post("/edit-address",editAddressPost);
app.get('/account-details',accountDetails);
app.post('/account-details',accountDetailsPost);
app.post("/change-image",upload.single('image'),profileChangeImage);
app.get("/profile-icon",profileIconControler)
module.exports = app;