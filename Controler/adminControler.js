const { createAdmin } = require("../middlewares/middleware")
const asyncHandler = require("express-async-handler");
const UserCollection = require("../models/userModel");
const Admin = require("../models/adminModel")
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}))
const productCollection = require("../models/productModel");
const categoryCollection = require("../models/categoryModel")

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
                res.render("admin/login",{error:true})
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

const adminViewProducts = asyncHandler(async(req,res)=>{
    try{

        const products = await productCollection.find({}).sort({addedAt:-1}).lean();
        const Products=products.map((e)=>{
               if(e.status=='Published'){
                e.isPublished=true
               }
               if(e.status=='Out of stock'){
                e.isOutOfStock=true
               }
               if(e.status=='Low of stock'){
                e.isLowOfStock=true
               }
               if(e.status=='Published'){
                e.isPublished=true
               }
               if(e.status=='Draft'){
                e.isDraft=true
               }

               return e
         })


        

        if(products){

            res.render("admin/viewProducts",{admin:req.session.admin.name,Products})
        }

    }
    catch(error){
        throw new Error(error.message)
    }


})

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
//admin view products

const adminAddProduct =asyncHandler(async(req,res)=>{
    const category = await categoryCollection.find({}).lean()
   

    res.render('admin/add-product',{category})
}
)
//admin addproduct post
const adminAddProductPost =asyncHandler(async(req,res)=>{
    try{
        let filename 
        if(req.file.filename){
            filename=req.file.filename
        }
        else{
            filename=''
        }

        const productsObj={
            name:req.body.name,
            price:req.body.price,
            description:req.body.description,
            discount:req.body.discount,
            status:req.body.status,
            quantity:req.body.quantity,
            category:req.body.category,
            image:filename
        }
    
        let products =await productCollection.create(productsObj)
        if(products){
            res.redirect("/admin/add-product")
        }

    }
    catch(error){
        throw new Error(error.message)
    }
    

    
    console.log(req.body)
   
})


///admin delete product 

const adminDeleteProduct =async(req,res)=>{
  console.log(req.params.id)
  await productCollection.findOneAndDelete({_id:req.params.id});
  res.redirect("/admin/view_products")


}

//view product category

const adminViewProductCategoryVise = async(req,res)=>{

   
    const Products = await productCollection.find({status:req.params.status}).lean();
    
    if(Products){
        res.render("admin/viewProducts",{admin:req.session.admin,Products})
    }

}


//edit product
const adminEditProduct =asyncHandler(async (req,res)=>{
  const product = await productCollection.findById({_id:req.query.id}).lean()
 


   res.render("admin/edit-product",{product})
})

//edit product post 
const adminEditProductPost = asyncHandler(async(req,res)=>{
   
    

    const products = await productCollection.findByIdAndUpdate({_id:req.query.id},req.body)
    res.redirect('/admin/view_products')
})

//change image

const changeImage = asyncHandler(async(req,res)=>{
    let changeProduct =await productCollection.findByIdAndUpdate({_id:req.query.id},{image:req.file.filename})
     if(changeProduct){
        res.redirect("/admin/view_products")
     }

})

//add category

const adminAddCategory =asyncHandler(async(req,res)=>{
    res.render("admin/add-category")
})

//add category post
const adminAddCategoryPost = asyncHandler(async(req,res)=>{
    

    const categoryObj = {
        image:req.file.filename,
        category:req.body.category,
        description:req.body.description
    }
    const cat= await categoryCollection.findOne({category:req.body.category});
    if(cat){
          res.render("admin/add-category",{error:true})
    }
    else{

        const data = await categoryCollection.create(categoryObj);
        if(data){
            res.redirect("/admin/view-category")
        }
    }
}) 


//admin view category
 const adminViewCategory =asyncHandler(async(req,res)=>{

    const data =await  categoryCollection.aggregate([{$lookup:{
        from:'products',
        localField:'category',
        foreignField:'category',
        as:'cat'
    }},{$addFields: {
        stock: { $size: '$cat' }
      }},{$sort:{addedAt:1}}])
   
    res.render("admin/view-category",{data})
 })


 //deletecategory

 const deleteCategory = asyncHandler(async(req,res)=>{
           await categoryCollection.findOneAndDelete({_id:req.params.id});
           res.redirect("/admin/view-category")
 })

 //edit-category

 const editCategory = asyncHandler(async(req,res)=>{
     const category =await categoryCollection.findById({_id:req.query.id}).lean();

    res.render('admin/edit-category',{category})
 })

 //editCategory post

 const editCategoryPost = asyncHandler(async(req,res)=>{
    console.log(req.body.category)
    const cat= await categoryCollection.findOne({category:req.body.category});
    if(cat){
        const category =await categoryCollection.findById({_id:req.query.id}).lean();

        res.render('admin/edit-category',{category,error:true})
    }
    else{

        let updatedCategory =await categoryCollection.findOneAndUpdate({_id:req.query.id},req.body);
        if(updatedCategory){
           res.redirect('/admin/view-category')
        }
     
    }
   
 })

 //edit-category image

const editCategoryImage = asyncHandler(async(req,res)=>{
    const result = await categoryCollection.findOneAndUpdate({_id:req.query.id},{image:req.file.filename});
    if(result ){
        res.redirect("/admin/view-category")
    }
   
})

module.exports = {adminHome,adminLogin,adminLoginPost,adminLogout,adminCustomers,adminViewProducts,adminBlockUser
,adminAddProduct,adminAddProductPost,adminDeleteProduct,adminViewProductCategoryVise,adminEditProduct
,adminEditProductPost,changeImage,adminAddCategory,adminAddCategoryPost,adminViewCategory,
deleteCategory,editCategory,editCategoryPost,editCategoryImage};