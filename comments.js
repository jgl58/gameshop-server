var knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./mydb.db"
    }
});
var bp = require('body-parser');
var jwt = require('jwt-simple');
var games = require('./games.js')

exports.createComment = function(req,res){
    var token = req.body.token;
    var mensaje = req.body.message;
   
    var secret = '123456'
    var idGame = req.params.idGame;
    var cookies = jwt.decode(token, secret);
    console.log(cookies)
    games.existsGame(idGame, function(existe){
        if(existe == true){       
            knex('comments').insert({
                message: mensaje,
                game_id: idGame,
                user_id: cookies.idUser
            }).then(function(id){
                res.status(201).send({
                    _links: {
                        game: "/games/"+idGame,
                        _self: "/games/"+idGame+'/comments/'+id
                    }
                });
                
            }).catch(function(error){
                res.status(400).send({userMessage: "Comentario ya añadido", devMessage: ""})
            })          

        }else{
            res.status(404).send({userMessage: "El juego no existe", devMessage:""})
        }
    }) 
}

exports.getComments = function(id,callback){    
    knex('comments').select().where('game_id',id)
    .then(function(data){
        callback(data)
    })  
}