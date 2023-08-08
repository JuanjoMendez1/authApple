const express = require('express');
const app = express();
const fs = require('fs');
const config = fs.readFileSync('./config/config.json');
const AppleAuth = require('apple-auth');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

let auth = new AppleAuth(config, fs.readFileSync('./config/AuthKey.p8').toString(), 'text');

app.get("/", (req, res) => {
    console.log( Date().toString() + "GET /");
    res.send(`<a href="${auth.loginURL()}">Sign in with Apple</a>`);
});

app.get('/token', (req, res) => {
    res.send(auth._tokenGenerator.generate());
});

app.post('/auth', bodyParser(), async (req, res) => {
    console.log("entro")
    try {
        console.log( Date().toString() + "GET /auth");
        const response = await auth.accessToken(req.body.code);
        const idToken = jwt.decode(response.id_token);

        const user = {};
        user.id = idToken.sub;

        if (idToken.email) user.email = idToken.email;
        if (req.body.user) {
            const { name } = JSON.parse(req.body.user);
            user.name = name;
        }

        res.json(user);
    } catch (ex) {
        console.error(ex);
        res.send("An error occurred!");
    }
});

app.get('/try', async (req, res) => {
    console.log("Si hizo la conexión");
})

app.get('/refresh', async (req, res) => {
    try {
        console.log( Date().toString() + "GET /refresh");
        const accessToken = await auth.refreshToken(req.query.refreshToken);
        res.json(accessToken);
    } catch (ex) {
        console.error(ex);
        res.send("An error occurred!");
    }
});

app.listen(3002, () => {
    console.log("Listening on https://mendezj.site/");
})


// const express = require('express');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');

// const app = express();
// app.use(express.json());  // para poder parsear el cuerpo JSON

// // Apple publica sus claves públicas aquí:
// const APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys";

// app.post('/validate-apple-token', async (req, res) => {
//     const token = req.body.token;

//     try {
//         const appleKeysResponse = await axios.get(APPLE_KEYS_URL);
//         const keys = appleKeysResponse.data.keys;
//         let appleKey;

//         for (let key of keys) {
//             try {
//                 appleKey = key;
//                 jwt.verify(token, getPublicKey(appleKey), {
//                     algorithms: appleKey.alg,
//                     issuer: 'https://appleid.apple.com',
//                     audience: 'io.digybot.appuat',  // tu Apple Client ID
//                 });

//                 // Si no hay errores en la verificación, el token es válido
//                 return res.status(200).send("Token válido");
//             } catch (error) {
//                 // Ignora el error y prueba con la siguiente clave
//             }
//         }

//         res.status(401).send("Token inválido");
//     } catch (err) {
//         res.status(500).send("Error al validar el token");
//     }
// });

// function getPublicKey(key) {
//     return `-----BEGIN PUBLIC KEY-----\n${key.n}\n-----END PUBLIC KEY-----`;
// }

// app.listen(3000, () => {
//     console.log('Servidor escuchando en el puerto 3000');
// });


