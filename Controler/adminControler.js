const { createAdmin } = require("../middlewares/middleware")
const asyncHandler = require("express-async-handler");
const UserCollection = require("../models/userModel");
const Admin = require("../models/adminModel")
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}))
const productCollection = require("../models/productModel");
const categoryCollection = require("../models/categoryModel");
const orderCollection = require("../models/orderModel")

const adminHome =asyncHandler(async (req,res)=>{
    try{

    var ADMIN;
    if(req.session.admin){   
         }
    else{
        ADMIN=null;
    }
    // createAdmin('adarsh','adarshjithu10@gmail.com','123');

    //totalSales
    const total = await orderCollection.aggregate([{$group:{
        _id:null,
        total:{$sum:'$total'},
        productCount:{$sum:'$productsCount'}
    }}])
    //total sales productcount total revenue
    const totalSales = total[0].total;
    const productsCount = total[0].productCount;
    const totalRevenue = Math.floor((total[0].total*30)/100);
    //total users
    const users = await UserCollection.find({});
    const userCount = users.length;
    
    //total items sold
    
    const allOrders = await orderCollection.find({});
    let dt = new Date().toDateString();
    
    res.render("admin/home",{admin:req.session.admin.name,totalSales,productsCount,totalRevenue,userCount})
}
catch(error){
    console.log(error.message);
   
    var err = new Error();
    error.statusCode = 400;
    next(err)
}
})
//admin login page

const adminLogin =asyncHandler( (req,res)=>{
    try{

        if(req.session.admin){
           res.redirect("/admin") 
    
        }
        else{
    
            res.render("admin/login")
        }
    }
    catch(error){
        console.log(error.message);
        
        var err = new Error();
        error.statusCode = 400;
        next(err)
    }
})
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
        console.log(error.message);
     
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }


})

//admin view products

const adminViewProducts = asyncHandler(async(req,res)=>{
    try{
        await productCollection.updateMany({quantity:0},{$set:{
            status:'Out Of Stock'
       }})
        await productCollection.updateMany({quantity:{$gt:0,$lt:6}},{$set:{
            status:'Low Of Stock'
       }})
        await productCollection.updateMany({quantity:{$gt:5}},{$set:{
            status:'Published'
       }})
           


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
        console.log(error.message);
      
        var err = new Error();
        error.statusCode = 500;
        next(err)
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
        console.log(error.message);
      
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }
    

})
//admin view products

const adminAddProduct =asyncHandler(async(req,res)=>{
    try{

        const category = await categoryCollection.find({}).lean()
       
    
        res.render('admin/add-product',{category})
    }
    catch(error){
        console.log(error.message);
        
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }
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
        console.log(error.message);
        
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }
    

    
    console.log(req.body)
   
})


///admin delete product 

const adminDeleteProduct =asyncHandler( async(req,res)=>{
    try{

        console.log(req.params.id)
        await productCollection.findOneAndDelete({_id:req.params.id});
        res.redirect("/admin/view_products")
    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }


})

//view product category

const adminViewProductCategoryVise = asyncHandler( async(req,res)=>{
    try{
        if(req.query.id=='Listed'){
            const Products = await productCollection.find({unlist:true}).lean();
        
                res.render("admin/viewProducts",{admin:req.session.admin,Products})
            
        
           }
           else if(req.query.id=='Unlisted'){
            const Products = await productCollection.find({unlist:false}).lean();
        
            res.render("admin/viewProducts",{admin:req.session.admin,Products})
        
           }
           else{
        
               const Products = await productCollection.find({status:req.query.id}).lean();
               
                   res.render("admin/viewProducts",{admin:req.session.admin,Products})
           }
        
    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }
   
    

})


//edit product
const adminEditProduct =asyncHandler(async (req,res)=>{

    try{

        const products = await productCollection.findById({_id:req.query.id}).lean()
         res.render("admin/edit-product",{products})
    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }
})

//edit product post 
const adminEditProductPost = asyncHandler(async(req,res)=>{
    try{

        
            const products = await productCollection.findByIdAndUpdate({_id:req.query.id},req.body)
            res.redirect('/admin/view_products')
    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }
   
    
})

//change image

const changeImage = asyncHandler(async(req,res)=>{

    try{

        let changeProduct =await productCollection.findByIdAndUpdate({_id:req.query.id},{image:req.file.filename})
         if(changeProduct){
            res.redirect("/admin/view_products")
         }
    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }

})

//add category

const adminAddCategory =asyncHandler(async(req,res)=>{
    try{
        res.render("admin/add-category")
    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 400;
        next(err)
    }
        
})

//add category post
const adminAddCategoryPost = asyncHandler(async(req,res)=>{
    try{

        
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
    }
    catch(error){
        console.log(error.message)
    }
    
}) 


//admin view category
 const adminViewCategory =asyncHandler(async(req,res)=>{
    try{

        
            const data =await  categoryCollection.aggregate([{$lookup:{
                from:'products',
                localField:'category',
                foreignField:'category',
                as:'cat'
            }},{$addFields: {
                stock: { $size: '$cat' }
              }},{$sort:{addedAt:1}}])
           
            res.render("admin/view-category",{data})
    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 400;
        next(err)
    }
 })


 //deletecategory

 const deleteCategory = asyncHandler(async(req,res)=>{
    try{
        await categoryCollection.findOneAndDelete({_id:req.params.id});
        res.redirect("/admin/view-category")

    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 400;
        next(err)
    }
 })

 //edit-category

 const editCategory = asyncHandler(async(req,res)=>{
    try{

        const category =await categoryCollection.findById({_id:req.query.id}).lean();
   
       res.render('admin/edit-category',{category})
    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 400;
        next(err)
    }
 })

 //editCategory post

 const editCategoryPost = asyncHandler(async(req,res)=>{
    try{

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
       
    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }
 })

 //edit-category image

const editCategoryImage = asyncHandler(async(req,res)=>{
    try{

        const result = await categoryCollection.findOneAndUpdate({_id:req.query.id},{image:req.file.filename});
        if(result ){
            res.redirect("/admin/view-category")
        }
    }
    catch(error){
        console.log(error.message);
       
        var err = new Error();
        error.statusCode = 500;
        next(err)
    }
   
})
//cateogory chart

const categoryChartControler = asyncHandler(async(req,res)=>{
console.log('called');
const orders = await orderCollection.find({});
  const products = orders.map((e)=>{
    return e.products
  })
  const category = []
   products.forEach((e)=>{
    e.forEach((ele)=>{
       category.push(ele.product.category)
    })
  })

 
  var fr = category.map((e)=>{
    return -1;
  })

for(i=0;i<category.length;i++){
    let count = 1;
    for(j=i+1;j<category.length;j++){
        if(i!=j){
            if(category[i]==category[j]){
                fr[j]=0;
                count++;
            }
        }
    }

    if(fr[i]!==0){
        fr[i]=count;
    }
}

const categories = [];
const totalSales = []
fr.forEach((e,i)=>{
    if(e!==0){
          categories.push(category[i])
          totalSales.push(e);
    }
})

console.log(categories,totalSales)
res.json({categoryDetails:categories,sales:totalSales})


})


//change saleschart

const ChangeSalesChart = asyncHandler(async(req,res)=>{
    const dt = new Date().toDateString();
   

    if(req.query.id=='Daily'){
        console.log(req.query.id)
        var total;
        var category;
        var productCount;
        var userCount;
        category = ['Total','Profit'];

    
     //creating today
     
    //finding totalOrders in a day

    const orders =await  orderCollection.aggregate([{$match:{
        orderedAt:dt,
    }},{
        $group:{
            _id:null,
            totalSales:{$sum:'$total'},
            productCount:{$sum:'$productsCount'}
        }
    }
])
let profit = Math.floor(orders[0].totalSales*30/100);
 total = [orders[0].totalSales,profit]

 const user = await UserCollection.find({signupAt:dt})

 var users = 1
    console.log(total)
    res.json({total:total,category:category,Profit:profit,users:users})
}
})
module.exports = {adminHome,adminLogin,adminLoginPost,adminLogout,adminCustomers,adminViewProducts,adminBlockUser
,adminAddProduct,adminAddProductPost,adminDeleteProduct,adminViewProductCategoryVise,adminEditProduct
,adminEditProductPost,changeImage,adminAddCategory,adminAddCategoryPost,adminViewCategory,
deleteCategory,editCategory,editCategoryPost,editCategoryImage,categoryChartControler,
ChangeSalesChart};