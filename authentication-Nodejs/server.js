const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const mongodb = require('mongodb');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require("dotenv").config();
var randomStr = require("randomstring");



const dbname = "loginPortal";
const port = process.env.port || 3000;
const url = "mongodb://localhost:27017";
const atlasUrl = 'mongodb+srv://divya-user:19KPcvfGpHnHYYiN@cluster0.xiulw.mongodb.net/loginPortal?retryWrites=true&w=majority';
//19KPcvfGpHnHYYiN


//configuring
const app = express();

//middleware
app.use(cors());
app.use(bodyParser.json());

//Api which displays all users
app.get('/users', async (req, res) => {
    let connection;
    try {
        connection = await mongodb.connect(atlasUrl);
        let db = connection.db(dbname);
        let userDta = await db.collection('users').find().toArray();
        res.json(userDta);
        connection.close();
    }
    catch (err) {
        if (connection) {
            await connection.close();
            console.log(err);
            res.status(500).json(err);
        }
    }
})

// Adds new user
app.post('/register', async (req, res) => {
    let connection;
    try {
        connection = await mongodb.connect(atlasUrl);
        let db = connection.db(dbname);
        req.body.randomPassword = "";
        let userData = await db.collection('users').findOne({ email: req.body.email });
        if (userData) {
            res.status(400).json({ message: 'user already exists' });
        }
        else {

            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password, salt);
            req.body.password = hash;
            userData = await db.collection('users').insertOne(req.body);
            res.status(200).json({ message: 'user registered successfully' });
            await connection.close();
        }
    }

    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})

//Login
app.post('/login', async (req, res) => {
    let connection;
    try {
        connection = await mongodb.connect(atlasUrl);
        let db = connection.db(dbname);
        let userEmail = await db.collection('users').findOne({ email: req.body.email });
        if (userEmail) {
            let isValid = await bcrypt.compare(req.body.password, userEmail.password);
            if (isValid) {
                let token = jwt.sign({ userId: userEmail._id }, 'key', { expiresIn: "1h" });
                res.status(200).json({
                    status: 200,
                    message: "login success",
                    token,
                });
            }
            else {
                res.status(403).json({ message: 'Invalid password' });
            }
        }
        else {
            res.status(401).json({ message: 'email not registered' });
        }

    }
    catch (err) {
        if (connection) {

            console.log(err);
            res.status(500).json(err);
        }
    }

})

app.post('/sendMail', async (req, res) => {
    let connection = await mongodb.connect(atlasUrl);
    let db = connection.db(dbname);
    let userEmail = await db.collection('users').findOne({ email: req.body.email });
    if (userEmail) {
        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.userEmail,
                pass: process.env.userPassword
            }
        });

        let randomPassCode = randomStr.generate(10);
        await db.collection('users').updateOne({ email: req.body.email }, { $set: { randomPassword: randomPassCode } });

        let mailDetails = {
            from: 'vinpram5@gmail.com',
            to: req.body.email,
            subject: 'Reset Password !!!',
            html: `<h3>Password Reset Code: ${randomPassCode}</h3><p><a href="https://divya-resetpasscode.netlify.app/">Click to reset password</a></p>`
        };

        mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
                res.status(404).json(err);
            } else {
                res.status(200).json({ message: 'Email sent successfully' });
            }
        });
    }
    else {
        res.status(401).json({ message: 'user does not exist' })
    }
})

app.post('/updatePassword', async (req, res) => {

    try {
        let connection = await mongodb.connect(atlasUrl);
        let db = connection.db(dbname);
        let userEmail = await db.collection('users').findOne({ email: req.body.email });
        if (userEmail) {
           
            if (userEmail.randomPassword == req.body.randomStr) {
                let hashedPwd = await bcrypt.hash(req.body.password, 10);
                await db.collection('users').updateOne({ email: req.body.email }, { $set: { password: hashedPwd } });
                await db.collection('users').updateOne({ email: req.body.email }, { $set: { randomPassword: '' } });
                res.status(200).json({
                    message: "Password changed successfully",
                });
            }
            else {
                res.status(400).json({
                    message: "Reset passcode doesnt match",
                });
            }
        }
        else {
            res.status(403).json({ message: 'user does not exist' })
        }
    }
    catch (err) {
        res.status(404).json(err);
    }

})

// Listens to port 3000
app.listen(3000, () => {
    console.log('Listening to port 3000');
})
