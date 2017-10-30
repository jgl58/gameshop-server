var knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./mydb.db"
    },
    useNullAsDefault: true
});
var comments = require('./comments.js')


exports.getGames = function(pet,resp){
    var arrayLinks = new Array()
    knex.select().from('games').then(function(data){
        data.forEach(function(element) {
            arrayLinks.push({
                "linkGame": "/games/"+element.games_id
            })
        }, this);
        resp.status(200).send({
            "games": data,
            "links": arrayLinks
        }) 
    }) 
    
}
exports.existsGame = function(id, callback){
    
    knex('games').where('games_id',id).count('games_id as c').then(function(query){
        //console.log(0)
         if(query[0].c==0){
             callback(false)
        }else{
            callback(true)
        }
     })
    
}

function exists(id, callback){
    knex('games').where('games_id',id).count('games_id as c').then(function(query){
       //console.log(0)
        if(query[0].c==0){
            callback(false)
       }else{
           callback(true)
       }
    })
}

exports.getGameById = function(pet,resp){
    var id = parseInt(pet.params.id); 
    if(isNaN(id)){
        resp.status(400);
        resp.send("La id del juego tiene que ser numerica");
    }else{    
        exists(id,function(exists){
            if(exists==true){
                knex('games').select().where('games_id',id)
                .then(function(data){
                    comments.getComments(id, function(c){
                        resp.status(200).json({
                            "game": data,
                            "comments": c,
                            "_links": {
                                "self": "/games/"+id,
                                "buyGame": "/games/"+id+"/orders",
                                "createComment": "/games/"+id+"/comments"
                            }
                        })
                    })
                })
            }else{  
                resp.status(404).send({userMessage:"El item no se ha encontrado",devMessage:""}); 
            }
        })
        
           
    }
}

exports.getGamesByCategory = function(pet,resp){
    var id = parseInt(pet.params.id);
    var arrayLinks = new Array()
    if(isNaN(id)){
        resp.status(400);
        resp.send("La id tiene que ser numerica");
    }else{
        exists(id,function(exists){
            if(exists==true){
                knex('games').select().where('categories_id',id)
                .then(function(data){
                    data.forEach(function(element) {
                        arrayLinks.push({
                            "linkGame": "/games/"+element.games_id
                        })
                    }, this);
                    resp.status(200).send({
                        "games": data,
                        "links": arrayLinks
                    }) 
                })
            }else{  
                resp.status(404).send({userMessage:"El item no se ha encontrado",devMessage:""}); 
            }
        })

             
    }
}