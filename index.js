const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const express = require("express");
const Message = require("./models/message");

const app = express();

app.use(cors());
app.use(express.json);

const server = http.createServer(app);

const connections = [];

server.listen(3001, async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://admin:SjBdf2jbaEmTXmUw@cluster0.h2jsh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }
    );
  } catch (e) {
    console.log("failed");
  }
});

app.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const messages = new Message({ message });
    await messages.save();
    res.status(200).send();
  } catch (e) {
    res.status(500).send();
  }
});

const io = socketIo(server, {
  cors: "*",
});

io.on("connection", (socket) => {
  if (connections.length < 2) {
    connections.push(socket.id);

    socket.on("message", (data) => {
      const messageSocket = { id: socket.id, mes: data };
      io.emit("message", messageSocket);
    });

    socket.on("starttyping", () => {
      socket.broadcast.emit("starttyping");
    });
    socket.on("endtyping", () => {
      socket.broadcast.emit("endtyping");
    });
  } else {
    const data = socket.id;
    io.emit("overflow", data);
    socket.disconnect();
  }

  socket.on("disconnect", (socket) => {
    connections.splice(connections.indexOf(socket.id), 1);
  });
});
