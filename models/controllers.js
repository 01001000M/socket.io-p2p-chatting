const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require("dotenv").config();

exports.verifyToken = function(token){
    result = {}
    const user = jwt.verify(token,process.env.SECRET,(err,user)=>{
        if(err){
            return result
        }
        result = user
    })
    return result
}


exports.signUp = async (req,res,next)=>{
    
    try
    {
        if(req.body.user in users_info){
            res.json({signed:false,message:'user exists ,please choose another one ..'});
            return
        }

        const hashedPassword = await bcrypt.hash(req.body.pass,10);

        users_info[req.body.user] = {
            "pass": hashedPassword,
            "connections":{}
        };

        res.json({signed:true ,message:"user added successfully, please <a href='/login'>login</a> to take effect .."});

    }catch(err){
        console.log(err)
        res.json({signed:false,message:'could not sgin user ..',error:err});
    }
    console.log(users_info)
    next()
}

exports.logIn = async(req,res,next)=>{

    if(req.body.user && req.body.pass){
        try{

            if(!(req.body.user in users_info)){
                res.json({newToken:null});
                return
            }

            const user = users_info[req.body.user];
            const samePassword = await bcrypt.compareSync(req.body.pass,user.pass);
            
            if(samePassword){
                let newToken = jwt.sign({
                user:req.body.user,
                pass:req.body.pass
                },process.env.SECRET);
                res.json({newToken:newToken});
                return
            }else{
                res.json({newToken:null});
                return
            }

        //any error occurred will make the login proccess fail ..

        }catch(err){
            res.json({newToken:null});
        }
    }

    next()
    
}

