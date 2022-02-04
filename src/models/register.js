const mongoose = require('mongoose');
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const employeeSchema = new mongoose.Schema({
    firstname :{
        type:String,
        require:true
    },
    lastname :{
        type:String,
        require:true
    },
    email :{
        type:String,
        require:true,
        unique:true
    },

    phone :{
        type:Number,
        require:true,
        unique:true
    },
   
    password :{
        type:String,
        require:true,
    },
    confirmpassword :{
        type:String,
        require:true,
    },
    tokens:[{
        token:{
            type:String,
            require:true
       }
    }]

})


//Generating jwt
employeeSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id} , process.env.SECRET_KEY);
        this.tokens= this.tokens.concat({token:token});
        await this.save();
        return token;

    }catch(e){
        console.log('The error is : ' +e.message)
    }
}




// This hashes up the password before saving it into the database
employeeSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        this.confirmpassword = undefined; 
    }
    next();
})



const Register = new mongoose.model("Register" , employeeSchema);
module.exports = Register;