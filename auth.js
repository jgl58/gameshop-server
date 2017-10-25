var bp = require('body-parser');
var jwt = require('jwt-simple');
var secret = '123456'
var users = require('./users.js');


exports.login = function(pet, res, next){
    var id = parseInt(pet.params.id)
    var token = pet.headers.token;
    console.log("Token: "+token)
    if(!token){
        res.status(401).send({userMessage: "Se necesita token", devMessage: ""})
    }else{
        var data = jwt.decode(token, secret);
        if(data.idUser != id){
            res.status(401).send({userMessage: "Necesitas iniciar sesion", devMessage: ""})
        }else{
            next();
        }
    }
}

exports.comprar = function(req,res,next){
    var token = req.body.token;
    console.log("Token: "+token)
    
    var idGame = req.params.idGame;

    if(!token){
        //devolver error autentificacion
        res.status(401).send({userMessage: "Necesitas iniciar sesion", devMessage: ""})
    }else{
        var cookies = jwt.decode(token, secret);
        console.log(cookies)
        if(isNaN(idGame)){
            res.status(401).send({userMessage: "La id debe ser numerica", devMessage: ""})
        }else{
            next();
        }
    }

}

exports.loguear = function(pet,res){
    var data = JSON.parse(pet.body.data);   
    var nick = data.nick;
    var pass = data.pass;
   

     users.existsUser(nick, function(exists){
         if(exists){
             users.getUserByNick(nick, function(data){
                 var payload = {
                     nick: nick,
                     pass: pass,
                     idUser: data.users_id
                 } 
                 var token = jwt.encode(payload,secret);
                 console.log("Token: "+token);
                 res.setHeader('Authorization','Bearer',token);
                 res.send("OK").status(200)
             })
         }else{
             res.status(401).send({userMessage: "El usuario no existe", devMessage:"",
                 _links:{
                     register: {
                         href: "localhost:3000/register"
                     }
                 }
             });
         }
     })
 }