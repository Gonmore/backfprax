import express from 'express'
import passport from '../../passport-config.js'
import { generateToken, authenticateJWT, verifyToken } from '../middlewares/authenticate.midlleware.js'
import authController from '../controllers/authController.js' 

const router = express.Router()

function valida_http(req, res){
    
} 

// 🔐 AUTENTICACIÓN SOCIAL - Google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

// Ruta de callback de Google
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session:false }),
    (req, res) => {
        const token = generateToken(req.user);
        if (req.headers['user-agent'].includes('Mozilla')) {
            res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'strict' });
            res.redirect(process.env.FRONTEND_URL || 'http://localhost:3001/dashboard');
        } else {
            res.json({ token, user: req.user });
        }
        }
);

// 🔐 AUTENTICACIÓN SOCIAL - Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Ruta de callback de Facebook
router.get('/facebook/callback', 
    passport.authenticate('facebook', { failureRedirect: '/login', session:false }),
    (req, res) => {
        const token = generateToken(req.user);
        if (req.headers['user-agent'].includes('Mozilla')) {
            res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'strict' });
            res.redirect(process.env.FRONTEND_URL || 'http://localhost:3001/dashboard');
        } else {
            res.json({ token, user: req.user });
        }
    }
);

// Ruta para la página de inicio de sesión
router.get('/login', (req, res) => {

    res.send(`
        <h1>Login Page</h1>
        <p>Choose your login provider:</p>
        <ul>
            <li><a href="/auth/google">Login with Google</a></li>
            <li><a href="/auth/facebook">Login with Facebook</a></li>
        </ul>

        <h2>Or login/register locally:</h2>

        <h3>Login</h3>
        <form action="/login" method="post">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required><br><br>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required><br><br>

            <button type="submit">Login</button>
        </form>

        <h3>Register</h3>
        <form action="/api/users/" method="post">
            <label for="username">Username:</label>
            <input type="text" id="username_reg" name="username" required><br><br>

            <label for="password">Password:</label>
            <input type="password" id="password_reg" name="password" required><br><br>

            <button type="submit">Register</button>
        </form>
    `);
});

router.post('/login', authController.login)
router.post('/register', authController.register)


// Ruta para la página de dashboard (protected)
router.get('/dashboard', verifyToken,(req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.send('<h1>Dashboard</h1><p>You are logged in!</p> <a href="/logout">Logout');
    })
});

// app.js
// Ruta para cerrar sesión
router.get('/logout', verifyToken, (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/'); 
    //res.json({ message: 'Cierre de sesión exitoso' });
});

export default router