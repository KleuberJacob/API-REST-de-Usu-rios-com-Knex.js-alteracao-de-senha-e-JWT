const express = require("express")
const app = express();
const router = express.Router()
const HomeController = require("../controllers/HomeController")
const UserController = require('../controllers/UserController')
const User = require("../models/User")
const adminAuth = require('../middleware/AdminAuth')

router.get('/', HomeController.index);
router.post('/user/create', UserController.createUser)
router.get('/users', adminAuth, UserController.allUsers)
router.get('/user/:id', adminAuth, UserController.findUser)
router.put('/user/update', adminAuth, UserController.editUser)
router.delete('/user/delete/:id', adminAuth, UserController.deleteUser)
router.post('/recoverpassword', UserController.recoveryPassword)
router.post('/changepassword', UserController.changePassword)
router.post('/login', UserController.login)

module.exports = router;