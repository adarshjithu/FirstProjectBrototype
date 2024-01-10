const express = require('express');
const {adminHome, adminLogin, adminLoginPost, adminLogout, adminCustomers, adminViewProducts, adminBlockUser, adminAddProduct, adminAddProductPost, adminDeleteProduct, adminViewProductCategoryVise, adminEditProduct, adminEditProductPost, changeImage, adminAddCategory, adminAddCategoryPost, adminViewCategory, deleteCategory, editCategory, editCategoryPost, editCategoryImage} = require('../Controler/adminControler');
const { verifyAdmin, adminValidationLoginRules, adminLoginValidationRes } = require('../middlewares/middleware');
const { upload } = require('../config');
const app = express.Router();
app.get('/',verifyAdmin,adminHome); 
app.get('/login',adminLogin); 
app.post('/login',
// adminValidationLoginRules,adminLoginValidationRes,
adminLoginPost);
app.get("/logout",adminLogout);  
app.get("/customers",verifyAdmin,adminCustomers);
app.get("/view_products",verifyAdmin,adminViewProducts);
app.get("/block_user/:id",adminBlockUser);
app.get('/add-product',adminAddProduct); 
app.post('/add-product',upload.single('image'),adminAddProductPost);
app.get("/delete-product/:id",adminDeleteProduct);
app.get('/view-product-category-vise/:status',adminViewProductCategoryVise);
app.get("/edit-product",adminEditProduct);
app.post("/edit-product",adminEditProductPost);
app.post('/change-image',upload.single('image'),changeImage);
app.get("/add-category",adminAddCategory)
app.post("/add-category",upload.single('image'),adminAddCategoryPost);
app.get("/view-category",adminViewCategory);
app.get('/delete-category/:id',deleteCategory);  
app.get('/edit-category',editCategory);
app.post('/edit-category',editCategoryPost);
app.post("/edit-category-image",upload.single('image'),editCategoryImage);
app.get("/check",(req,res)=>{
    res.render("admin/index")
})


  




module.exports= app;
  







