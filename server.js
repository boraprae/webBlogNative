require('dotenv').config();
const express = require('express');
const { is } = require('express/lib/request');
const res = require('express/lib/response');
const { url } = require('inspector');
const jwt = require('jsonwebtoken');
const app = express();
const path = require('path');


app.set('view engine', 'ejs');

//?----------- Static Folder -----------?
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//?------------ Data ---------------?
var data =
    [{ id: 0, title: 'First', detail: 'aaa' },
    { id: 1, title: 'Second', detail: 'bbb' },
    { id: 2, title: 'Third', detail: 'ccc' },
    ];

app.get("/", (req, res) => {
    const message = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    res.render('index', { message: message });
    // res.sendFile(path.join(__dirname, "views/blog.ejs"))
});

app.get('/blogs', (_req, res) => {
    res.render('blog', { data: data });
});

app.get('/getBlog', (_req, res) => {
    res.json(data);
});

//*------------- Mobile API ------------*
app.get('/mobile/blog', (_req, res) => {
    res.json(data);
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log(req.body);

    if (username == 'boraprae' && password == '1234') {
        const payload = { user: username };
        //Encode
        const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1d' });
        res.send({ url: '/blogs', token: token });
    } else {
        res.status(400).send("Login Failed");
    }
});

app.post("/editData", (req, res) => {
    const id = req.body.ID;
    const title = req.body.newTitle;
    const detail = req.body.newDetail;

    console.log(req.body);

    data[id] = { "id": id, "title": title, "detail": detail };
    console.log(data);
    res.send("Success KA");
});

app.delete("/post", (req, res) => {

    let token = req.headers['authorization'] || req.headers['x-access-token'];

    if (token == undefined || token == null) {
        res.status(400).send('No token');
    } else {
        //token found
        if (req.headers.authorization) {
            const splitToken = token.split(' ');
            if (splitToken[0] == 'Bearer') {
                token = splitToken[1];
            }
        }
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.status(400).send('Incorrect token');
            }
            else {
                //delete the post in DB
               // res.send(decoded.user);
            }
        });
    }
});
//*------------ End of API -------------*

//*----------- Test JWT ----------------*
app.get('/jwt', (_req, res) => {
    const username = 'boraprae';
    const payload = { user: username };
    //private key = passwordIsPasswordAjanGoSaid
    //Encode
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1d' });
    res.send(token);
});

app.post('/jwtDecode', (req, res) => {
    ///jwtDecode/:token
    //Decode
    //const token = req.params.token;
    //const token = req.headers['x-access-token'];
    //const token = req.headers['authorization'];
    let token = req.headers['authorization'] || req.headers['x-access-token'];

    if (token == undefined || token == null) {
        res.status(400).send('No token');
    } else {
        //token found
        if (req.headers.authorization) {
            const splitToken = token.split(' ');
            if (splitToken[0] == 'Bearer') {
                token = splitToken[1];
            }
        }
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.status(400).send('Incorrect token');
            }
            else {
                res.send(decoded);
            }
        });
    }
    // return res.send(splitToken[1]);
    // if (token == undefined || token == null) {
    //     res.status(400).send('No token');
    // } else {
    //     jwt.verify(token, 'passwordIsPasswordAjanGoSaid', (err, decoded) => {
    //         if (err) {
    //             res.status(400).send('Incorrect token');
    //         } else {
    //             res.send(decoded);
    //         }
    //     });
    // }
});

//*------------ Starts Server ----------*
const PORT = 7000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});