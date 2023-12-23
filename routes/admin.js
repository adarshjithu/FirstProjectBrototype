const express = require('express');
const {adminHome, adminLogin, adminLoginPost, adminLogout, adminCustomers, adminViewProducts, adminBlockUser} = require('../Controler/adminControler');
const { verifyAdmin, adminValidationLoginRules, adminLoginValidationRes } = require('../middlewares/middleware');
const app = express.Router();
app.get('/',verifyAdmin,adminHome); 
app.get('/login',adminLogin);
app.post('/login',
// adminValidationLoginRules,adminLoginValidationRes,
adminLoginPost);
app.get("/logout",adminLogout);  
app.get("/customers",verifyAdmin,adminCustomers);
app.get("/view_products",verifyAdmin,adminViewProducts);
app.get("/block_user/:id",adminBlockUser)






module.exports= app;
  







