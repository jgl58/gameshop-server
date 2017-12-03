var app = require('./../server.js');
var supertest = require('supertest');
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuaWNrIjoiam9uYXkiLCJwYXNzIjoicGFzcyIsImlkVXNlciI6MSwiaWRQZWRpZG8iOiI1YTgzMDlmNC1jNTQwLTQ3ODYtODFmZS1kOTk1OGVkNWEyNjQiLCJleHAiOjE1MDg4MzkzMTEyNTR9.YQBVjPrL43Zx-tMFsV57GRhsudkAvQLvI4WlcvGCn3o"
const user = "jonay"
const pass = "pass"

describe('PRUEBAS API', function(){

    describe('PRUEBAS GAMES y COMMENTS',function(){
        it('GET /games', function(done){
            supertest(app)
                .get('/games')
                .expect(200,done)
                
        });
        it('GET /games/:id existe', function(done){
            supertest(app)
                .get('/games/1')
                .expect(200,done)
                
        });
        it('GET /games/:id no existe', function(done){
            supertest(app)
                .get('/games/1000')
                .expect(404,done)
                
        });
        it('GET /games/categories/:id existe', function(done){
            supertest(app)
                .get('/games/categories/1')
                .expect(200,done)
                
        });
        it('GET /games/categories/:id no existe', function(done){
            supertest(app)
                .get('/games/categories/1000')
                .expect(404,done)
                
        });
        it('POST /games/:id/comments', function(done){
            supertest(app)
                .post('/games/1/comments')
                .send({"message":"hola"})
                .send({"token": token})
                .expect(201,done)
                
        });
        it('POST /games/:id/comments sin token', function(done){
            supertest(app)
                .post('/games/1/comments')
                .send({"message":"hola"})
                .expect(401,done)
                
        });
        
        it('PUT /games/:id/comments/:id', function(done){
            supertest(app)
                .put('/games/1/comments/1')
                .send({"token": token})
                .send({'newMessage': "Hola de nuevo"})
                .expect(204)
                done()
     
        });
        it('PUT /games/:id/comments/:id sin token', function(done){
            supertest(app)
                .put('/games/1/comments/1')
                .send({'newMessage': "Hola de nuevo"})
                .expect(401,done)
                
     
        });

        it('DELETE /games/:id/comments/:id', function(done){
            supertest(app)
                .del('/games/1/comments/1')
                .send({"token": token})
                .expect(204)
                done()
                
        });

        it('DELETE /games/:id/comments/:id sin token', function(done){
            supertest(app)
                .del('/games/1/comments/1')
                .expect(401,done)
                
                
        });
    })

    describe('PRUEBAS LOGIN y REGISTER', function(){
        it('POST /login OK', function(done){
            supertest(app)
                .post('/login')
                .send({"nick": "jonay"})
                .send({"pass":"pass"})
                .expect("Authorization",'Bearer'+ token)
                .expect(201)
                done()
        });

        it('POST /login NOT OK', function(done){
            supertest(app)
                .post('/login')
                .send({"nick": "jsdgsfdg"})
                .send({"pass":"sdfgsdfgs"})
                .expect(401)
                done()
        });

        it('POST /register OK', function(done){
            supertest(app)
                .post('/register')
                .send({"nick": "nuevo"})
                .send({"pass":"nuevo"})
                .expect(201)
                done()
        });


        it('POST /register NO OK', function(done){
            supertest(app)
                .post('/register')
                .send({"nick": "jonay"})
                .send({"pass":"prueba"})
                .expect(401)
                .end(done)
                
        });
    })

    describe('PRUEBAS USERS',function(){
        it('PUT /users/:id OK', function(done){
            supertest(app)
                .put('/users/1')
                .send({"token": token})
                .send({"newData":{
                    "nick": "jonay",
                    "pass": "password",
                    "name": "New Name",
                    "lastname": "New Lastname"
                }})
                .expect(204)
                done()
                
        });

        it('PUT /users/:id NO OK', function(done){
            supertest(app)
                .put('/users/1')
                .send({"newData":{
                    "nick": "jonay",
                    "pass": "password",
                    "name": "New Name",
                    "lastname": "New Lastname"
                }})
                .expect(401)
                done()       
        });

    
    })

    describe('PRUEBAS PEDIDOS',function(){
        it('POST /games/:idGame/orders OK', function(done){
            supertest(app)
                .post('/games/1/orders')
                .send({'token':token})
                .expect(201,done)   
        });

        it('POST /games/:idGame/orders NO OK', function(done){
            supertest(app)
                .post('/games/1/orders')
                .expect(401,done)   
        });

        it('GET /users/:id/orders OK', function(done){
            supertest(app)
                .get('/users/1/orders')
                .set('Authorization',token)
                .expect(200,done)   
        });

        it('GET /users/:id/orders NO OK', function(done){
            supertest(app)
                .get('/users/1/orders')
                .expect(401,done)   
        });

        it('PUT /users/:id/orders/:idOrder OK', function(done){
            supertest(app)
                .put('/users/1/orders/2')
                .send({'token':token})
                .expect(204)   
                done()
        });

        it('DELETE /users/:id/orders/:idOrder OK', function(done){
            supertest(app)
                .delete('/users/1/orders/2')
                .send({'token':token})
                .expect(204)   
                done()
        });
    })
    
   
});