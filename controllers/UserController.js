const knex = require('../database/connection')
const User = require('../models/User')
const PasswordToken = require('../models/PasswordToken')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

class UserController {

    async allUsers(req, res){
        let users = await User.findAllUsers()
        res.json(users)
    }

    async findUser(req, res){
        let id = req.params.id      
        
        let user = await User.findUserByID(id)
        
        if(user == undefined){
            res.status(404)
            res.json({error: "Usuario nao encontrado!"})
        }else{            
            res.json(user)
        }
    }

    async createUser(req, res) {
        let {name, email, password} = req.body

        if(name == undefined || name == '' || name == ' ' || name.length < 3) {
            res.status(400)
            res.json({error: 'Nome invalido'})
            return //O return 'e necessario, pois quando trabalhamos com controlers para que o processo seja 
            //encerrado(nenhum codigo abaixo seja mais executado) devemos utiliza-lo
        }
        if(email == undefined || email == '' || email == ' ' || email.length < 6) {
            res.status(400)
            res.json({error: 'Email invalido'})
            return
        }
        if(password == undefined || password == '' || password == ' ' || password.length < 8) {
            res.status(400)
            res.json({error: 'Senha invalida'})
            return
        }

        let emailExist = await User.findEmail(email)

        if(emailExist){
            res.status(406)
            res.json({message: 'Esse e-mail ja existe!'})
        }

        await User.newUser(name, email, password)

        res.status = 200
        res.json({message: 'Usuario Criado!'})
    }

    async editUser(req, res){
        let {id, name, email, role} = req.body

        let result = await User.updateUser(id, name, email, role)

        if(result != undefined){
            if(result.status){
                res.status(200)
                res.send('Atualizado com sucesso!')
            }else{
                res.status(406)
                res.send(result.error)
            }
        }else{
            res.status(406)
            res.send('Ocorreu um erro no servidor!')
        }
    }

    async deleteUser(req, res){
        let id = req.params.id

        let result = await User.deleteUser(id)

        if(result.status){
            res.status(200)
            res.send("Usuario excluido com sucesso!")
        }else{
            res.status(406)
            res.send(result.error)
        }
    }

    async recoveryPassword(req, res){
        let email = req.body.email //Pegando email no corpo da requisicao para ser utilizado na funcao

        let result = await PasswordToken.create(email)

        if(result.status){//Se o status retornado da funcao for true
            res.status(200)
            res.res('' + result.token)//Passando o token dentro de um json, pois o .send nao trabalha com inteiros
        }else{
            res.status(406)
            res.send(result.error)
        }
    }

    async changePassword(req, res){        
        let {token, password} = req.body        

        let isTokenValid = await PasswordToken.validate(token)
        
        if(isTokenValid.status){
            await User.changePassword(password, isTokenValid.token.user_id, isTokenValid.token.token)
            res.status(200)
            res.send('Senha alterada!')
        }else{
            res.status(406)
            res.send('Token invalido!')
        }
    }

    async login(req, res){
        let {email, password} = req.body

        let user = await User.findUserByEmail(email)

        if(user != undefined){

            let result = await bcrypt.compare(password, user.password)
            if(result){
                let token = jwt.sign({email: user.email, role: user.role}, process.env.jwt_Secret)//Autenticacao JWT
                res.status(200)
                res.json({token: token})
            }else{
                res.status(406)
                res.send('Senha incorreta!')
            }
        }else{
            res.json({status: false})
        }
    }
}

module.exports = new UserController()