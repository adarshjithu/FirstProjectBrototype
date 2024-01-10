const express = require('express');
const { addToCart, cartControler, deleteCartItem, changeQuantity, cartCount, checkoutControler, checkoutPostControler } = require('../Controler/cartControler');


const app = express.Router()
app.get('/addtocart',addToCart);
app.get('/view-cart',cartControler);
app.get("/deleteCart/:id",deleteCartItem);
app.get("/changeQuantity",changeQuantity)
app.get("/cartcount",cartCount)
app.get("/checkout",checkoutControler);
app.post('/checkout',checkoutPostControler)
module.exports=app;