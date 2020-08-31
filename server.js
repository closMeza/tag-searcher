import 'dotenv/config.js';
import express from 'express';
import HTTP, { get } from 'http';
import path from 'path';
import cors from 'cors';
import ejs from 'ejs';
import socket from 'socket.io';
import fetch from 'node-fetch';

//Default setup for sever
const app = express();
const http = HTTP.createServer(app);
const __dirname = path.resolve();

var model_id;

// Allows us to perfrom api calls 
app.use(cors());

// Allows us to gather url parameters
app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 8080;

//populates index.html page
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname + '/index.html'));
    model_id = req.query.m;    
    
})

// populates showCase.js this is where we will pass data too and from client
app.get('/showCase.js', (req,res)=> {
    res.sendFile(path.join(__dirname + '/showCase.js'))
})
//populates styles.css
app.get('/styles.css', (req,res)=> {
    res.sendFile(path.join(__dirname +'/styles.css'))
})

var io = socket(http);
io.on('connection', (socket)=> {
    console.log("connected")
    socket.on('pic', (msg) => {
        console.log('message:' + msg);
        console.log(model_id)

        var tok = process.env.TOKEN;
        var sec = process.env.SECRET;
    
        var auth = tok + ':' + sec;
        auth = Buffer.from(auth).toString('base64');
    
        const headers = {
            'Authorization':'Basic ' + auth,
            'Content-Type': 'application/json'
        }
        
        const result = fetch(`http://api.matterport.com/api/models/graph?query={model(id:"${model_id}"){assets{floorplan(format:"png", flags:photogramy){url}}}}`, {
            method:'GET',
            headers:headers,
        })
        .then(res => res.text())
        .then(data => {
            data = JSON.parse(data);
            var src = data['data']['model']['assets']['floorplan']['url'];
            socket.emit('pic', src);
        })
        .catch(error => console.error(error));
    })
})



http.listen(PORT, ()=> { 
    console.log(`Server Listening on port ${PORT}`);
})