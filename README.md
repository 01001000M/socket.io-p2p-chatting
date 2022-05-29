
# socket.io-p2p-chatting-app
![screenshot](https://drive.google.com/uc?export=view&id=1rPxhR5Cy48qcPyuNbScBObFyqP-cXy4-)

#### first of all (I'm not an ui guy), so in that project I focused on backend and security more than ui, don't blame me ;->


## installation

so simple :
1 ```npm install```
2 ``` npm start ```

the server is running ,now go to your browser ant type ``http://<yourip>:9999``

replace ``<yourip>`` with your local/public ip or if you're on the same machine replace it with ``localhost``

## file structure:


```
*----- /models [controllers.js]
*			
/ -[ server.js , .env ,package.json ]
* 
*----- /views [sign.ejs ,login.ejs ,home.ejs]
*
*----- /public [*.css , client.js , juqery-3.6.0.js]
```
## quick tour

the main framworks I used in that project are:
1- jsonwebtoken .aka (jwt)
2- bcrypt (one way hashing mechanism library)

the hole magic is happening in (controller.js && server.js && client.js) so:
#### /models/controller.js

that's where the middleware functions made ..
in that file you will find three functions:

1- signup
		which handle the signup process (daaa[0]) 
		that middleware checks an user/pass req.body if exist in the db
		 ,in that case inside ( variable called 'users_info' ) if not exist then 
		 hash the bassword with ```bcrypt``` and stores them .
	
>*note: that users_info have two predefined users [auser,buser] feel free to remove them

```js
exports.signUp  =  async (req,res,next)=>{

try

{

	if(req.body.user  in  users_info){
		res.json({signed:false,message:'user exists ,please choose 	another one ..'});
		return

	}

	const  hashedPassword  =  await  bcrypt.hash(req.body.pass,10);

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
```
2-login
		 which handle the login process (daaa[1]) 
		 if the requested user/pass are invalid then 
		 returns json with no token encrypted with a secret stored in the ```.env``` file ,and message to display on the client side	
	if the requested user/pass are valid then response with (jwt token)
	, then the client will take the token and ```stores it as a cookie ```

```js
exports.logIn  =  async(req,res,next)=>{
if(req.body.user  &&  req.body.pass){

try{
	if(!(req.body.user  in  users_info)){
		res.json({newToken:null});
		return
	}
	
	const  user  =  users_info[req.body.user];
	const  samePassword  =  await  bcrypt.compareSync(req.body.pass,user.pass);

	if(samePassword){

		let  newToken  =  jwt.sign({
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
```

3- verifyToken
	that middleware verifies token (daaa[2]) `` I'm kiddie hah? ;-> ``
	it's function is so simple , it takes the token that sended from the user
	and verify it with the SECRET key that stored in ``/.env``.
	if the token is valid then the server will redirect you to your home page,
	if not you will see the normal login/signup root page
	
	it's also forbidden you from access the /home url if you don't
	have a valid token ..

```js
exports.verifyToken  =  function(token){

result  = {}

const  user  =  jwt.verify(token,process.env.SECRET,(err,user)=>{
	if(err){
		return  result
	}
	result  =  user
	})
	return  result
}
```


--
## server.js

normal express routes and boring things , what we interested in is socket.io right? yup let's jump to that part after ```//sockets configuration``` comment.

[conn , reqMessages, resMessages, newMessage ,message] those are the socket events I defined  

1-``conn``: when the client get his home page he will emit a 'conn' event 
to the server with his username wich he will join as a socket ROOM.

2-``reqMessages,resMessages`` : when the client toggle to new user tab he will send ``reqMessage``event to server which will response with all messages between that user and the requested user with the event ``resMessages ``.

3-``newMessage,message``:  when the user sends a message to another user the message will go throw the server by ``newMessage``event then the server will send it to the targeted user with the event ``message``.


 ## client.js

it's so simple to put it a README ..
just open the file and the comments will help you 

## contact?
hamzaw1.contact@gmail.com

enjoy ;-)


[a](javascript:alert())
