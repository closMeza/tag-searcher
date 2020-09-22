require('dotenv').config();
const express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
const ejs = require('ejs');

//Default setup for sever

var model_id;

// Allows us to perfrom api calls 
app.use(cors());

// Allows us to gather url parameters
app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket)=> {
    console.log("connected")
    socket.on('pic', (msg) => {
        model_id = msg;
        console.log(model_id);
        var tok = process.env.TOKEN;
        var sec = process.env.SECRET;
    
        var auth = tok + ':' + sec;
        auth = Buffer.from(auth).toString('base64');
    
        const headers = {
            'Authorization':'Basic ' + auth,
            'Content-Type': 'application/json'
        }
        const body={
            query: `query{model(id:"${model_id}"){assets{floorplans(formats:"png", flags:photogramy){filename url width height resolution origin{x y}}}}}`
        }

        fetch("https://api.matterport.com/api/models/graph", {
            method:'POST',
            headers:headers,
            body: JSON.stringify(body)
        })
        /*fetch(`http://api.matterport.com/api/models/graph?query={model(id:"${model_id}"){assets{floorplans(formats:"png", flags:photogramy){filename url width height resolution origin{x y}}}}}`, {
            method:'GET',
            headers:headers,
        })*/
        .then(res => res.text())
        .then(data => {
            data = JSON.parse(data);
            console.log(data);
            var floorplans = data['data']['model']['assets']['floorplans'];

            var src;
            for(var i =0; i < floorplans.length; i++)
            {
                
                if(floorplans[i]['filename'] == "render/vr_colorplan_000.png")
                {
                    src = floorplans[i];
                    break;
                }
            }
            socket.emit('pic', src);
        })
        .catch(error => console.error(error));
    })
})

http.listen(PORT, ()=> { 
    console.log(`Server Listening on port ${PORT}`);
})