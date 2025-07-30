// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const mailerController = require('../controllers/mailer');
// const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');


// // router.post('/signup', authController.signup);
// // router.post('/login', authController.login);
// // router.patch('/toggle-permission/:id', authController.togglePermission);
// // router.get('/admin/users', authenticateToken, authorizeAdmin, authController.getAllUsers);
// // router.post('/admin/allow-creation', authenticateToken, authorizeAdmin, authController.allowCreation);
// // router.post('/admin/delete-user', authenticateToken, authorizeAdmin, authController.deleteUser);

// router.post('/admin/send-code', mailerController.sendCode);
// router.get('/admin/send-code', (req, res) => {
//     console.log("send api is ok");
//     res.send("GET /admin/send-code reached and API is OK");
// });

// router.post('/admin/verify-code', mailerController.verifyCode);
// router.post('/admin/reset-password', mailerController.resetPassword);




// router.get('/', (req, res) => {
//     res.status(200).json({ message: 'Welcome to the authentication API' });
// });
// module.exports = router;



