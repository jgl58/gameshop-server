var bp = require('body-parser');
var jwt = require('jwt-simple');

exports.login = function(pet, res, next){
    var id = parseInt(pet.params.id)
    var token = pet.headers.token;
    console.log("Token: "+token)
    var secret = '123456'

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
    var secret = '123456'
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