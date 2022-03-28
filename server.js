require('dotenv').config();
const express = require('express');
const { is } = require('express/lib/request');
const res = require('express/lib/response');
const { url } = require('inspector');
const jwt = require('jsonwebtoken');
const path = require('path');
const bcrypt = require('bcrypt');
const con = require('./db-config');
const message = require('./error-message');

const app = express();


app.set('view engine', 'ejs');

//?----------- Static Folder -----------?
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//?------------ Data ---------------?
const user = [
    { 'user_id': 1, 'user_username': 'admin', 'user_password': '1111', 'user_role': 1 },
    { 'user_id': 2, 'user_username': 'user2', 'user_password': '2222', 'user_role': 2 },
    { 'user_id': 3, 'user_username': 'user3', 'user_password': '3333', 'user_role': 2 },
]

const data = [
    { 'id': 1, 'title': 'First', 'detail': 'aaa', 'user_id': 2 },
    { 'id': 2, 'title': 'Second', 'detail': 'bbb', 'user_id': 2 },
    { 'id': 3, 'title': 'Third', 'detail': 'ccc', 'user_id': 3 },
    { 'id': 4, 'title': 'Fourth', 'detail': 'ddd', 'user_id': 3 },
]

// ==================== Middleware ==============
function checkUser(req, res, next) {
    let token = req.headers['authorization'] || req.headers['x-access-token'];
    if (token == undefined || token == null) {
        // no token
        res.status(400).send('No token');
    }
    else {
        // token found
        if (req.headers.authorization) {
            const tokenString = token.split(' ');
            if (tokenString[0] == 'Bearer') {
                token = tokenString[1];
            }
        }
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.status(400).send('Incorrect token');
            }
            else {
                req.decoded = decoded;
                // back to the service
                next();
            }
        });
    }
}

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

// app.post("/login", (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;

//     console.log(req.body);

//     if (username == 'boraprae' && password == '1234') {
//         const payload = { user: username };
//         //Encode
//         const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1d' });
//         res.send({ url: '/blogs', token: token });
//     } else {
//         res.status(400).send("Login Failed");
//     }
// });

app.post('/login', (req, res) => {
    setTimeout(() => {
        const { username, password } = req.body;
        const result = user.filter((value) => {
            return value.user_username == username && value.user_password == password;
        });
        // res.json(result);

        if (result.length == 1) {
            const payload = { user: username, user_id: result[0].user_id };
            const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1d' });
            res.json({ url: '/blogs', token: token });
            // res.send('/blogs');
        }
        else {
            res.status(400).send('Wrong username or password');
        }
    }, 3000);
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
});

//*------------- Mobile API ------------*
app.get('/mobile/blog', (_req, res) => {
    res.json(data);
});

app.post('/mobile/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT user_id, user_password, user_role FROM user WHERE user_username = ?';

    con.query(sql, [username], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(process.env.SERVER_ERROR_MESSAGE);
        }
        if (result.length != 1) {
            console.log(message.SERVER_WRONG_USERNAME_ERROR_MESSAGE);
            return res.status(500).send(message.SERVER_WRONG_USERNAME_ERROR_MESSAGE);
        }
        //!inactive user, role = 0
        if (result.user_role == 0) {
            console.log(message.DISABLE_USER_ERROR_MESSAGE);
            return res.status(400).send(message.DISABLE_USER_ERROR_MESSAGE);
        }
        //!verify password
        bcrypt.compare(password, result[0].user_password, (err, same) => {
            if (err) {
                console.log(err);
                return res.status(500).send(message.SERVER_ERROR_MESSAGE);
            }
            //?Wrong password
            if(!same){
                return res.status(400).send(message.SERVER_WRONG_PASSWORD_ERROR_MESSAGE);
            }
            //?Correct password
            const payload = {'user_username': username, 'user_id': result[0].user_id, 'user_role': result[0].user_role};
            const token = jwt.sign(payload, process.env.JWT_KEY, {expiresIn: '1d'});
            res.json({token: token});
        });
    });
    // if (result.length == 1) {
    //     const payload = { user: username, user_id: result[0].user_id };
    //     const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1d' });
    //     res.json({ url: '/blogs', token: token });
    //     // res.send('/blogs');
    // }
    // else {
    //     res.status(400).send('Wrong username or password');
    // }
});

app.get('/mobile/blogs', checkUser, (req, res) => {
    // get userID from token
    const result = req.decoded;
    const userID = result.user_id;
    // filter blog posts for this user
    const posts = data.filter((value) => {
        return value.user_id == userID;
    });
    res.json(posts);
});

//*----------- Utils -------------------*
app.get('/password/:password', (req, res) => {
    const raw = req.params.password;
    bcrypt.hash(raw, 10, (err, pass) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Server error');
        }
        res.send(pass);
    });
});

//*------------ Starts Server ----------*
const PORT = 7000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});