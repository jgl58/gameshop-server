var bp = require('body-parser');
var jwt = require('jwt-simple');
var secret = '123456'
var users = require('./users.js');


exports.login = function(pet, res, next){
    var id = parseInt(pet.params.id)
    var token = pet.headers.authorization;
   //console.log("Token: "+token)
    if(!token){
        res.status(401).send({userMessage: "Se necesita token", devMessage: ""})
    }else{
        var data = jwt.decode(token, secret);
        //console.log(data.idUser + "   "+id)
        if(data.idUser != id){
            res.status(401).send({userMessage: "Necesitas iniciar sesion", devMessage: ""})
        }else{
            next();
        }
    }
}

exports.loginWithBody = function(req,res,next){
    var token = req.headers.authorization;
   //console.log("Token: "+token)
    
    var idGame = req.params.idGame;

    if(!token){
        //devolver error autentificacion
        res.status(401).send({userMessage: "Necesitas iniciar sesion", devMessage: ""})
    }else{
        var cookies = jwt.decode(token, secret);
       // console.log(idGame)
        if(isNaN(idGame)){
            res.status(401).send({userMessage: "La id debe ser numerica", devMessage: ""})
        }else{
            next();
        }
    }

}

exports.loginUsers = function(req,res,next){
    var token = req.headers.authorization;
    //console.log("Token: "+token)
    
    var idGame = req.params.idGame;

    if(!token){
        //devolver error autentificacion
        res.status(401).send({userMessage: "Necesitas iniciar sesion", devMessage: ""})
    }else{ 
        next();     
    }

}

exports.loguear = function(pet,res){
    
    var nick = pet.body.nick;
    var pass = pet.body.pass;
   // console.log(pet.body.nick)
     users.correctLog(nick,pass, function(exists){
         if(exists){
             users.getUserByNick(nick, function(data){
                 var payload = {
                     nick: nick,
                     pass: pass,
                     idUser: data.users_id
                 } 
                 var token = jwt.encode(payload,secret);
                 console.log(token)
                 res.setHeader('Authorization','Bearer',token);
                 res.status(201).send({
                    "token": token,
                    "_links": {
                        "user_id": data.users_id
                    }
                 })
             })
         }else{
             
             res.status(401).send({userMessage: "El usuario no existe", devMessage:"",
                 _links:{
                     register: "localhost:3000/register"
                 }
             });
         }
     })
 }

