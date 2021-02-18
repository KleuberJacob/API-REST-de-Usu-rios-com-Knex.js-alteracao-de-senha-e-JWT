const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = function(req, res, next){
    const authToken = req.headers['authorization']

    if(authToken != undefined){

        const bearer = authToken.split(' ')
        let token = bearer[1]

        try {
            let decode = jwt.verify(token, process.env.jwt_Secret)//Comparando token recebido no 
            //header da requisicao com o secret(variavel de ambiente)       
            
            if(decode.role == 1){
                console.log(decode)
                next()//Dando continuidade ao fluxo da aplicacao  
            }else{
                res.status(403)
                res.send('Voce nao possui permissao de acesso!')
                return
            }
                      
        } catch (error) {
            res.status(403)
            res.send('Voce nao e um usuario autenticado!')
            return
        }
        
    }else{
        res.status(403)
        res.send('Voce nao e um usuario autenticado!')
        return
    }
}

