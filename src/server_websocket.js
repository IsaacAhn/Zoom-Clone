import SocketIO from "socket.io";
import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req ,res) => res.redirect("/"));

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
const sockets = [];

function socketClose() {
    console.log("Disconnected from the Browser");
}

wss.on("connection", (socket) =>{
    sockets.push(socket);
    socket["nickname"] = "Anonymous";
    console.log("Connected to the Browser");
    socket.on("close", socketClose);
    socket.on("message", (msg) => {
        const message = JSON.parse(msg.toString('utf8'));
        switch(message.type){
            case "new_message":
                sockets.forEach(aSocket => { 
                    if(aSocket.nickname !== socket.nickname) 
                        aSocket.send(`${socket.nickname}: ${message.payload}`)
                 });
            case "nickname":
                socket["nickname"] = message.payload;
        }        
    });
});

const handleListen = () => console.log(`Listening on http://localhost`);
server.listen(80, handleListen);
