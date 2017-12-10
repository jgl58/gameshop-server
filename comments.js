var knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./mydb.db"
    },
    useNullAsDefault: true
});
var bp = require('body-parser');
var jwt = require('jwt-simple');
var games = require('./games.js')

exports.createComment = function(pet,res){
    var token = pet.headers.authorization;
    var mensaje = pet.body.message;
    console.log(mensaje)
    var secret = '123456'
    var idGame = pet.params.idGame;
    var cookies = jwt.decode(token, secret);
    //console.log(cookies)
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
    knex('comments').select('comments.*','users.nick').where('game_id',id).innerJoin('users', 'users.users_id', '=', 'comments.user_id').orderBy('comments_id','desc')
    .then(function(data){
        callback(data)
    })  
}

exports.updateComment = function(req, res){
    var idGame = parseInt(req.params.idGame)
    var idComment = parseInt(req.params.idComment)
    var newMessage = req.body.newMessage
    console.log(newMessage)
    if(isNaN(idGame) && isNaN(idComment)){
        res.status(401).send({userMessage: "Las ids del juego y del comentario tienen que ser numericas", devMessage: ""})
    }else{             
        knex('comments')
        .where('comments_id', idComment)
        .update({message: newMessage})
        .then(function(count){
            //console.log(count)
            res.sendStatus(204)
        }).catch(function(err){
            res.status(404).send({userMessage: "El Comment no existe", devMessage:""})
        });      
    }
    
}

exports.deleteComment = function(req, res){
    var idGame = parseInt(req.params.idGame)
    var idComment = parseInt(req.params.idComment)
        
    if(isNaN(idGame) && isNaN(idComment)){
        res.status(401).send({userMessage: "Las ids del juego y del comment tienen que ser numericas", devMessage: ""})
    }else{             
        knex('comments')
        .where('comments_id', idComment)
        .del()
        .then(function(count){
            //console.log(count)
            res.sendStatus(204)
        }).catch(function(err){
            res.status(404).send({userMessage: "El comentario no existe", devMessage:""})
        });      
    }
}
