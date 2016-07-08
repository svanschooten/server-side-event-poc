var express = require('express');
var prompt = require("prompt");
var app = express();

app.use(express.static('public'));

var id = Math.floor((Math.random() * 1000)) + 1;
var connections = [];

app.get('/stream', function (req, res) {
    if (req.headers.accept && req.headers.accept == 'text/event-stream') {
        var req_id = connections.length;
        res.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        console.log("connection opened: " + req_id + " (" + connections.length + " -> " + (connections.length + 1) + ")");
        connections.push(res);
        req.connection.on('close', function () {
            connections.splice(req_id, 1);
            console.log("connection closed: " + req_id + " (" + (connections.length + 1) + " -> " + connections.length + ")");
        });
    } else {
        res.status(404).send();
    }
});

function promptMessage() {
    prompt.get(['type', 'message'], function (err, result) {
        for (connectionIdx in connections) {
            if (connections.hasOwnProperty(connectionIdx)) {
                var res = connections[connectionIdx];
                res.write('id: ' + id + '\n');
                res.write('event: ' + result.type + '\n');
                res.write("data: " + result.message + '\n\n');
            }
        }
        id += 1;
        promptMessage();
    });
}

app.listen(3000, function () {
    console.log('Server listening on port 3000!');
    prompt.start();
    promptMessage();
});