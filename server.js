//Cargamos el módulo express
var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb.db');
var bp = require('body-parser');
var jwt = require('jwt-simple');
var moment = require('moment');
var uuid = require('uuid/v4')
var app = express();
var secret = '123456'

app.use(bp.json());
app.use(bp.urlencoded({
    extended: true
}));
var knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./mydb.db"
    }
});
var games = require('./games.js')
var users = require('./users.js')
var pedidos = require('./pedidos.js')
var auth = require('./auth.js')
//GAMES
app.get('/games', function(pet, resp){
    games.getGames(function(data){
        resp.status(200).send(data) 
    })
   
});

app.get('/games/:id',function(pet,resp){
    var id = parseInt(pet.params.id); 
    if(isNaN(id)){
        resp.status(400);
        resp.send("La id tiene que ser numerica");
    }else{
        games.getGameById(id, function(data){
            if(data == "Error"){
                resp.status(404).send({userMessage:"El item no se ha encontrado",devMessage:""});
            }else{
                resp.status(200).json(data)
            } 
        })   
    }
});
/*
app.get('/games/:id/comments',function(pet,resp){
    var id = parseInt(pet.params.id); 
    if(isNaN(id)){
        resp.status(400);
        resp.send("La id tiene que ser numerica");
    }else{
        knex('comments').select().where('game_id',id)
        .then(function(query){
            resp.status(200).json(query)
        })
        .catch((error) => {
            resp.status(404).send({userMessage:"El item no se ha encontrado",devMessage:""});
        });
    }
});*/

//CATEGORIES
app.get('/categories',function(pet,resp){

    knex('categories').select('categories_id','type')
    .then(function(query){
        resp.status(200).json(query)
    })
    .catch((error) => {
        resp.status(404).send({userMessage:"El item no se ha encontrado",devMessage:""});
    });
    
});

app.get('/games/categories/:id',function(pet,resp){
    var id = parseInt(pet.params.id);
    if(isNaN(id)){
        resp.status(400);
        resp.send("La id tiene que ser numerica");
    }else{
        games.getGamesByCategory(id,function(data){
            if(data == "Error"){
                resp.status(404).send({userMessage:"El item no se ha encontrado",devMessage:""});
            }else{
                resp.status(200).json(data)
            }
        })
    }
});

//LOGIN
app.post('/login',function(pet,res){
   var data = JSON.parse(pet.body.data);   
   
   var nick = data.nick;
    var pass = data.pass;

    users.existsUser(nick, function(exists){
        if(exists){
            users.getUserByNick(nick, function(data){
                var payload = {
                    nick: nick,
                    pass: pass,
                    idUser: data.users_id,
                    exp: moment().add(7, 'days').valueOf()
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
})



app.post('/register',function(req,res){
    var nick = req.body.nickname;
    var pass = req.body.password;

    users.existsUser(nick, function(exists){
        console.log(exists)
        if(!exists){
            console.log("Usuario insertado");
            var data = {
                nick: nick,
                pass: pass
            }
            users.insertUser(data, function(user){
                res.send(user)
            })
            
        }else{
            console.log("Ese usuario ya existe");
            res.status(401).send({userMessage: "Usuario existente, prueba con otro nick", devMessage: ""})
        }
    })

    
})

//PEDIDOS
/*
app.get('/users/:id/orders',function(pet, res){
    var id = parseInt(pet.params.id);
    var games;
    var totalPrice=0;
    var count;
    if(isNaN(id)){
        res.status(401).send({userMessage: "Usuario existente, prueba con otro nick", devMessage: ""})
    }else{
        knex.select().from('games').join('orders','orders.game_id','=','games.games_id')
        .where('orders.user_id',id)
        .then(function(g){
            games = g;
            knex.count('game_id as c').from('orders')
            .where('user_id',id)
            .then(function(total){
                count = total[0].c;
                
                for(i=0;i<count;i++){
                    totalPrice += games[i].price
                }

                res.status(200);
                res.send({
                    games: games,
                    count: count,
                    totalPrice: totalPrice
                })
            })
    
            
        })

        
        
    }
})*/


app.post('/games/:idGame/linPed',function(req,res){
    var token = req.body.token;
    console.log("Token: "+token)
    var secret = '123456'
    var idGame = req.params.idGame;
    var cookies = jwt.decode(token, secret);
        
    games.existsGame(idGame, function(existe){
        if(existe == true){
            var idPedido = uuid()
            pedidos.createPedido(idGame, cookies.idUser, idPedido,function(data){
                if(data == 201){
                    res.status(201).send({
                    _links: {
                        lista_pedidos: "/users/"+cookies.idUser+"/listaPedidos",
                        _self: "/pedidos/"+idPedido
                    }
                    });
                }
                if(data == 400){
                    res.status(400).send({userMessage: "Juego ya añadido", devMessage: ""})
                }
            })            

        }else{
            res.status(404).send({userMessage: "El juego no existe", devMessage:""})
        }
    }) 
})

app.get('/users/:id/listaPedidos',auth.login,function(pet,res){
    var id = parseInt(pet.params.id)
    var token = pet.headers.token;
    console.log("Token: "+token)
    var secret = '123456'
    if(isNaN(id)){
        res.status(401).send({userMessage: "La id del usuario tiene que ser numerica", devMessage: ""})
    }else{
        pedidos.getPedidos(id,function(data){
            res.status(200).send(data)
        })
    }      
})

app.put('/users/:id/orders/:idOrder/pay',function(req, res){
    var id = parseInt(req.params.id)
    var idPed = parseInt(req.params.idOrder)
    var token = req.headers.token;
    console.log("Token: "+token)
    var secret = '123456'

    if(!token){
        res.status(401).send({userMessage: "Necesitas iniciar sesion", devMessage: ""})
    }else{
        var data = jwt.decode(token, secret);
        if(data.idUser != id){
            res.status(401).send({userMessage: "Necesitas iniciar sesion", devMessage: ""})
        }else{
            if(isNaN(id) && isNaN(idPed)){
                res.status(401).send({userMessage: "Las ids del usuario y del pedido tienen que ser numericas", devMessage: ""})
            }else{
                console.log("HA PAGAR")
                //pedidos.pagarPedido(idPed)
                knex('orders')
                .update({processed: 1}).where('orders_id', idPed)
                res.status(204).send("PAGADO")      
            }
        }
    }   

})

//Este método delega en el server.listen "nativo" de Node
   
app.listen(process.env.PORT || 3000, function () {
    
    knex.schema.createTableIfNotExists('categories', function (table) {
        table.increments('categories_id');
        table.string('type');
    }).then(function () {
        console.log('Categories Table is Created!');  
    })
    
    
    knex.schema.createTableIfNotExists('users', function (table) {
        table.increments('users_id');
        table.string('nick');
        table.integer('pass');
        table.string('name');
        table.string('lastname');
    }).then(function () {
        console.log('Users Table is Created!');
        
    });

    knex.schema.createTableIfNotExists('games', function (table) {
        table.increments('games_id');
        table.string('title');
        table.integer('year');
        table.integer('price');
        table.integer('categories_id');
        table.foreign('categories_id').references('categories.categories_id');
        table.integer('valoration');
        
    }).then(function () {
        console.log('Games Table is Created!');
    });

    knex.schema.createTableIfNotExists('comments',function(table){
        table.increments('comments_id');
        table.string('message')
        table.integer('user_id');
        table.foreign('user_id').references('users.users_id');
        table.integer('game_id');
        table.foreign('game_id').references('games.games_id');
    }).then(function(){
        console.log('Comments Table is Created!');
    })
/*
    knex.schema.createTableIfNotExists('linorders',function(table){
        table.uuid('linorders_id').primary();
        table.integer('game_id');
        table.foreign('game_id').references('games.games_id');
    }).then(function(){
        console.log('LinOrders Table is Created!');
    })*/

    knex.schema.createTableIfNotExists('orders',function(table){
        table.uuid('orders_id');
        table.integer('game_id');
        table.foreign('game_id').references('games.games_id');
        table.timestamp('created_at');
        table.integer('processed');
        table.integer('user_id');
        table.foreign('user_id').references('users.users_id');
        table.primary(['orders_id','game_id','user_id']);
    }).then(function(){
        console.log('Orders Table is Created!');
    })


    knex('categories').count('categories_id as c').then(function(total){
        if(total[0].c == 0){
            console.log("Categorias insertadas");
            return knex('categories').insert([
                {type: "Deportes"},
                {type: "Guerra"},
                {type: "Aventuras"},
                {type: "Carreras"}
            ])
        }
    })
    knex('users').count('users_id as c').then(function(total){
        if(total[0].c == 0){
            console.log("Usuarios insertadas");
            return knex('users').insert([
                {users_id: 1, nick: "jonay", pass: "pass", name: "name", lastname: "lastname"}
            ])
        }
    })

    knex('games').count('games_id as c').then(function(total){
        if(total[0].c == 0){
            console.log("Juegos insertados");
            return knex('games').insert([
                {games_id:1, title:"FIFA 18", year:2017, price: 65, categories_id: 1},
                {games_id:2, title:"NBA 2K18", year:2017, price: 45, categories_id: 1},
                {games_id:3, title:"Call Of Duty: WWII", year:2017, price: 80, categories_id: 2},
                {games_id:4, title:"Counter Strike: Global Ofensive", year:2012, price: 15, categories_id: 2},
                {games_id:5, title:"The Legend Of Zelda: Breath Of The Wild", year:2017, price: 40, categories_id: 3}
            ]) 
        }
    })
    


   console.log("El servidor express está en el puerto 3000");
  
   
});