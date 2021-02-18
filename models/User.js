const knex = require('../database/connection')
const bcrypt = require('bcrypt')
const PasswordToken = require('./PasswordToken')

class User{

    async findAllUsers(){
        try {
            let result = await knex.select(['id', 'name','email','role']).table("users")
            return result
        } catch (err) {
            console.log(err)
            return []
        }
    }

    async findUserByID(id){
        try {
            let result = await knex.select(['id', 'name','email','role']).where({id: id}).table("users")
            
            if(result.length > 0){//Os dados armazenados no DB retornam dentro de um array
                return result[0]
            }else{
                return undefined
            }
        } catch (err) {
            console.log(err)
            return undefined
        }
    }

    async findUserByEmail(email){ //Funcao utilizada para recuperacao de senha
        try {
            let result = await knex.select(['id', 'name', 'password', 'email','role']).where({email: email}).table("users")
            
            if(result.length > 0){//Os dados armazenados no DB retornam dentro de um array
                return result[0]
            }else{
                return undefined
            }
        } catch (err) {
            console.log(err)
            return undefined
        }
    }

    async newUser(name, email, password){
        try {
            let hashSenha = await bcrypt.hash(password, 10) 

            await knex.insert({name, email, password: hashSenha, role: 0}).table("users")
        } catch(err) {
            console.log(err)
        }        
    }

    async findEmail(email){
        try {
            let result = await knex.select("*").from('users').where({email: email})

            if(result.length > 0){
                return true
            }else{
                return false
            }            
        } catch (err) {
            console.log(err)
        }        
    }

    async updateUser(id, name, email, role){
        
        let user = await this.findUserByID(id)

        if(user != undefined){

            let editUser = {}

            if(name != undefined){
                editUser.name = name
            }
            
            if(email != undefined){
                if(email != user.email){
                    let emailVerify = await this.findEmail(email)
                    if(emailVerify == false){
                        editUser.email = email                                           
                    }else{
                        return {status: false, error:"Esse e-mail ja esta cadastrado!"}
                    }
                }                
            }            

            if(role != undefined){
                editUser.role = role
            }

            try {
                await knex.update(editUser).where({id: id}).table('users')
                return {status: true}
            } catch (error) {
                return {status: false, message: error}                
            }            

        }else{
            return {status: false, error:"Usuario informado nao existe!"}
        }
    }

    async deleteUser(id){

        let user = await this.findUserByID(id)

        if(user != undefined){
            try {
                await knex.delete().where({id:id}).table('users')
                return {status: true}
            } catch (error) {
                return {status: false, message: error}
            }            
        }else{
            return {status: false, error:"Usuario nao encontrado!"}
        }
    }

    async changePassword(newPassword, id, token){        
            let novaSenha = await bcrypt.hash(newPassword, 10) 
            await knex.update({password: novaSenha}).where({id:id}).table("users") 
            await PasswordToken.setUsed(token)//Utilizando a funcao criada para alterar o status (used) do token   
    }

}

module.exports = new User()