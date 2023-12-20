const { otpAuthMiddleware, generateOTP } = require("../middlewares/middleware");

var otpNumber;
//landin controler
const landingControler = (req,res)=>{
    res.render("user/landing")

}


//signupControler

const signupControler = (req,res)=>{
    res.render("user/signup")
}
//loginControler
const loginControler = (req,res)=>{
    res.render("user/login")
}

//loginpost controler

const loginPostControler =(req,res)=>{
          
    res.redirect("/user_home")
}
//homeControler
const homeControler = (req,res)=>{
    res.render("user/home")
}
//contactControler
const contactControler = (req,res)=>{
    res.render("user/contact")
}

//aboutControler
const aboutControler = (req,res)=>{
    res.render("user/about")
}
//siguppostcontroler
const signupPostControler =  (req,res)=>{

    console.log(req.body)
    req.session.user= req.body;


   res.redirect("/user_otp")


}

//otp controler
const otpControler = (req,res)=>{

    req.session.otp= generateOTP(req.session.user.email)

    



    res.render("user/otp",{ph:req.session.user.email})

}
//otp post controler
const otpPostControler = (req,res)=>{

    console.log(req.body.otp,req.session.otp)



    if(req.body.otp==req.session.otp){
        res.redirect("/user_home")
    }
    else{
        
    
        res.redirect("/user_signup")
    }


}    


module.exports = {landingControler,signupControler,loginControler
    ,homeControler,contactControler,aboutControler,signupPostControler,otpControler,otpPostControler,
loginPostControler}