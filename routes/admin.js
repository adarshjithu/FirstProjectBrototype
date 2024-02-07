const express = require('express');
const {adminHome, adminLogin, adminLoginPost, adminLogout, adminCustomers, adminViewProducts, adminBlockUser, adminAddProduct, adminAddProductPost, adminDeleteProduct, adminViewProductCategoryVise, adminEditProduct, adminEditProductPost, changeImage, adminAddCategory, adminAddCategoryPost, adminViewCategory, deleteCategory, editCategory, editCategoryPost, editCategoryImage, categoryChartControler, ChangeSalesChart} = require('../Controler/adminControler');
const { verifyAdmin, adminValidationLoginRules, adminLoginValidationRes } = require('../middlewares/middleware');
const { upload } = require('../config');
const app = express.Router();
app.get('/',verifyAdmin,adminHome); 
app.get('/login',adminLogin); 
app.post('/login',
// adminValidationLoginRules,adminLoginValidationRes,
adminLoginPost);
app.get("/logout",verifyAdmin,adminLogout);  
app.get("/customers",verifyAdmin,verifyAdmin,adminCustomers);
app.get("/view_products",verifyAdmin,verifyAdmin,adminViewProducts);
app.get("/block_user/:id",verifyAdmin,adminBlockUser);
app.get('/add-product',verifyAdmin,adminAddProduct); 
app.post('/add-product',upload.single('image'),adminAddProductPost);
app.get("/delete-product/:id",verifyAdmin,adminDeleteProduct);
app.get('/view-product-category-vise',verifyAdmin,adminViewProductCategoryVise);
app.get("/edit-product",verifyAdmin,adminEditProduct);
app.post("/edit-product",verifyAdmin,adminEditProductPost);
app.post('/change-image',upload.single('image'),changeImage);
app.get("/add-category",verifyAdmin,adminAddCategory)
app.post("/add-category",upload.single('image'),adminAddCategoryPost);
app.get("/view-category",verifyAdmin,adminViewCategory);
app.get('/delete-category/:id',verifyAdmin,deleteCategory);  
app.get('/edit-category',verifyAdmin,editCategory);
app.post('/edit-category',verifyAdmin,editCategoryPost);
app.post("/edit-category-image",upload.single('image'),editCategoryImage);
app.get("/check",(req,res)=>{
    res.render("admin/index") 
})

app.get('/category-chart',categoryChartControler);
app.get("/changeSalesChart",ChangeSalesChart)


  




module.exports= app;
  







