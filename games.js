var knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./mydb.db"
    }
});


exports.getGames = function(pet,resp){
    knex.select().from('games').then(function(data){
        resp.status(200).send(data) 
    }) 
    
}
exports.existsGame = function(id, callback){
    
    knex('games').where('games_id',id).then(function(query){
        callback(true)
    }).catch((error) => {
        callback(false)
    })
    
}

exports.getGameById = function(pet,resp){
    var id = parseInt(pet.params.id); 
    if(isNaN(id)){
        resp.status(400);
        resp.send("La id tiene que ser numerica");
    }else{    
        knex('games').select().where('games_id',id)
        .then(function(data){
            resp.status(200).json(data)
        }).catch((error) => {
            resp.status(404).send({userMessage:"El item no se ha encontrado",devMessage:""});
        });
           
    }
}

exports.getGamesByCategory = function(pet,resp){
    var id = parseInt(pet.params.id);
    if(isNaN(id)){
        resp.status(400);
        resp.send("La id tiene que ser numerica");
    }else{
            knex('games').select().where('categories_id',id)
            .then(function(data){
                resp.status(200).json(data)
            })
            .catch((error) => {
                resp.status(404).send({userMessage:"El item no se ha encontrado",devMessage:""});
            });  
    }
}