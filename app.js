require('dotenv').config();
const express = require('express')
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;
const hbs = require('hbs');
const Register = require('./src/models/register')
require('./src/db/conn')
const bcrypt = require("bcrypt")
const cookieParser = require('cookie-parser')
const auth = require('./src/middlewares/auth')



//Middlewares -- Must have
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser());


// view engine path  
const template_path = path.join(__dirname , './templates/views')
const partials_path = path.join(__dirname , './templates/partials')

// setting up view engine
app.set('view engine',"hbs");
app.set("views" , template_path)
hbs.registerPartials(partials_path)


//Routes defining

app.get('/home',auth ,(req,res)=>{
    try{
        res.render('home')
    }catch(e){
        res.send('You are not authorized to access this page..Login in / Signup first')
    }
})

app.get('/register' ,(req,res)=>{
    res.render('register')

})
app.post('/register' ,async(req,res)=>{
    try{
        const pass = req.body.password;
        const cpass = req.body.confirmPassword;
        if(pass === cpass){
            const registerEmployee = new Register({
                firstname : req.body.firstname,
                    lastname : req.body.lastname,
                    email : req.body.email,
                    phone : req.body.phone,
                    password :pass,
                    confirmPassword :cpass,
            })
            const token = await registerEmployee.generateAuthToken();

            const registered =await  registerEmployee.save();
            res.status(201).render('login');
        }
   

    }catch(e){
        res.render('userAlreadyExists');
        // console.log(e.message);
    }
})


app.get('/logout',auth,async(req,res)=>{
try{

    // This is how we logout from one device
    // req.user.tokens = req.user.tokens.filter((elem)=>{
    //     return elem.token!==req.token;
    // })



    // This is how we logout from all devices
    req.user.tokens=[];

    res.clearCookie("jwt");
    console.log("Logout Successfull");
    await req.user.save();
    res.render('login');
}catch(e){
    res.send(e.message);
}
})
app.get('/' ,(req,res)=>{
    res.render('login')
})


app.post("/" , async(req,res)=>{
    try{
    const email = req.body.email;
    const password = req.body.password;
            const useremail= await Register.findOne({email:email})
            const isMatch = await bcrypt.compare(password, useremail.password);

            const token = await useremail.generateAuthToken();
            res.cookie("jwt" , token , {
                expires:new Date(Date.now() +600000),
                httpOnly : true,
                // secure:true,
            })
           
            if(isMatch){
                    res.render('home')
                    // console.log(useremail)
              
            }
            else{
                res.send('Invalid creditentials')
            }
    }catch(err){
res.render('login')
    }
})



app.listen(port , ()=>{
    console.log(`listening to ${port}`)
})