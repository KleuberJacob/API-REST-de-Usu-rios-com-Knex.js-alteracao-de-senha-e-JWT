const knex = require('../database/connection')
const User = require('./User')

class PasswordToken{//Model responsavel por gerenciar tabela criada no DB para recuperacao de senha

    async create(email){
        let user = await User.findUserByEmail(email)//Utilizando funcao criada para verificar existencia de email no DB

        if(user != undefined){

            try {
                let token = Date.now()//Armazenando o token criado em uma var para que possa ser enviada no return

                await knex.insert({//Caso email exista armazeno dados no DB criado
                    user_id: user.id,
                    used: 0,
                    token: token
                }).table('password_tokens')

                return {status: true, token: token}//O return significa quais os dados serao passados da funcao para
                //o controller ,manipular
            } catch (error) {
                console.log(error)
                return {status: false, error: error}
            }            

        }else{
            return {status: false, error: 'O email informado nao existe no banco de dados!'}
        }        
    }

    async validate(token){        
        try {

            let result = await knex.select().where({token: token}).table('password_tokens')

            if(result.length > 0){                
                let tk = result[0]

                if(tk.used){//Se campo used estiver true(retornamos status = false) (0=false / 1=true)
                    return {status: false}
                }else{
                    return {status: true, token: tk}
                }
                                
            }else{
                return {status: false}   
            }
        } catch (error) {
            console.log(error)
            return {status: false, error: error}
        }        
    }

    async setUsed(token){
        await knex.update({used: 1}).where({token:token}).table('password_tokens')
    }
}

module.exports = new PasswordToken()