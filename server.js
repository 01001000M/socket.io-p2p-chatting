const express = require('express')
,{Server} = require('socket.io')
,http = require('http')
,cookie_parser = require('cookie-parser') 
,io_cookie_parser = require('cookie')
,body_parser = require("body-parser")
,app = express()
,server = http.createServer(app)
,io = new Server(server)

require('dotenv').config()

,jwt = require("jsonwebtoken")
,bcrypt = require("bcrypt")

,{logIn,signUp,verifyToken} = require("./models/controllers")

app.use(cookie_parser()
        ,express.static(__dirname+"/public")
        ,body_parser({extended:false})
        )

app.set("view engine","ejs")

const PORT = process.env.PORT
const SECRET = process.env.SECRET

// storing the data into the next var [users_info]
// consider it as mongodb ,mysql ..etc  :->

users_info ={
    "a_user": {
    "pass": '$2b$10$mAkF5L1gxPPO25tUNT6al.eP3twkhBDnfR/WxnHYbT4VW822oCENW',
    "connections": {}
  },
  "b_user": {
    "pass": '$2b$10$mAkF5L1gxPPO25tUNT6al.eP3twkhBDnfR/WxnHYbT4VW822oCENW',
    "connections": {}
  }
}

app.get('/',(req,res)=>{
    const if_true_html = "home",
        if_false_html = "index";

    if(!req.cookies.access_token){
        res.render(if_false_html)
        return
    }

    let validToken = verifyToken(req.cookies.access_token);
    
    if(!validToken || !(validToken.user in users_info)){
        res.render(if_false_html);
        return
    }
    res.render(if_true_html,{
        user:validToken.user,
        users: Object.keys(users_info)
    })
})

app.get('/signup',(req,res)=>{
    res.render("signup")
});

app.get('/login',(req,res)=>{
    res.render("login")
})

app.get('/home',(req,res)=>{

    const if_true_html = "home",
        if_false_html = "not_allowed";

    if(!req.cookies.access_token){
        res.render(if_false_html)
        return
    }

    let validToken = verifyToken(req.cookies.access_token);
    if(!validToken || !(validToken.user in users_info)){
        res.render(if_false_html);
        return
    }

   
    res.render(if_true_html,{
        user:validToken.user,
        users: Object.keys(users_info)
    })
})

app.post("/signup",signUp)
app.post("/login",logIn)


/////sockets configuration

io.on('connection',(socket)=>{
    var username = ''
    socket.on("conn",data=>{
        username = data.userID
        socket.join(username)
    })

    socket.on("reqMessages",data=>{
        let history = []
        try{
            let messages = users_info[username].connections[data.target].messages;
            history = messages
            socket.emit("resMessages",history);
        }catch(err){
            socket.emit("resMessages",history);
        }
    })

    socket.on("newMessage",data=>{
        //initilizing functions ..
            socket.to(data.target).emit("message",data)

            //initilize funciton for checking the user exists in the
            //users_info[sender].connections obj if not, add it [the user];

            function check_user_exists(db,sender,target,swap=false){
                if(swap){
                    [sender,target] = [target,sender]
                }

                var obj = db[sender].connections
                if(!(target in obj)){
                    obj[target] = {
                        messages:[]
                    }
                }
            }

            //initilize function to push messages into [users_info]
            function push_meesage(db,sender,target,message){
                var connections = db[sender].connections

                //for sender
                check_user_exists(users_info,username,target)
                
                let direction = "sent"
                connections[target].messages.push({
                        sender:sender,
                        message:message,
                        direction:direction
                    })

                //for reciever
                check_user_exists(users_info,username,target,swap=true);

                connections = db[target].connections
                
                direction = "recieved";
                connections[sender].messages.push({
                        sender:sender,
                        message:message,
                        direction:direction
                    })
                return
            }
        

        //pushing message to [sender] && [reciever] connection messages
        push_meesage(users_info ,username ,data.target ,data.message ,"sent")
    }) 
})

server.listen(PORT,()=>{
    console.log(`listening on port [${PORT}]`)
})