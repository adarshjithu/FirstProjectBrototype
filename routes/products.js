const express = require("express");

const {productsearchControler, productCategory, allProducts, subImageControler, addSubImage,  } = require("../Controler/productControler");
const { upload } = require("../config");
const { verifyAdmin } = require("../middlewares/middleware");
const app = express.Router(); 

app.post("/search",productsearchControler);
app.get('/category',productCategory);
app.get("/allproducts",allProducts);
app.post("/subimage",upload.array('image',4),subImageControler);
app.get("/addSubImage",addSubImage);





module.exports= app;