import {Server} from "socket.io";
import http from "http";
import express from "express";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req ,res) => res.redirect("/"));

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", socket => {
    socket["nickname"] = "unknown";
    socket.on("join_room", (roomName, nickname) => {
        socket.join(roomName);
        socket["nickname"] = nickname;
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    })

    socket.on("newMessage", (msg, room, done) => {
        socket.to(room).emit("newMessage", `${socket.nickname} : ${msg}`);
        done();
    });
})

const handleListen = () => console.log(`Listening on http://localhost`);
server.listen(80, handleListen);
