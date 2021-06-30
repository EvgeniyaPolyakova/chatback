const e = require("cors");
const http = require("http");
const socketIo = require("socket.io");
let fs = require("fs");

const server = http.createServer();

const connections = [];

server.listen(3001, () => {
  console.log("server started");
});

const io = socketIo(server, {
  cors: "*",
});

io.on("connection", (socket) => {
  if (connections.length < 2) {
    console.log("Успешно", socket.id);
    connections.push(socket.id);
    console.log(connections.length);

    socket.on("message", (data) => {
      const messageSocket = { id: socket.id, mes: data };
      io.emit("message", messageSocket);
    });

    socket.on("starttyping", () => {
      socket.broadcast.emit("starttyping");
    });
    socket.on("endttyping", () => {
      socket.broadcast.emit("endtyping");
    });
  } else {
    const data = socket.id
    io.emit("overflow", data);
    socket.disconnect();
  }

  socket.on("disconnect", (socket) => {
    connections.splice(connections.indexOf(socket.id), 1);
  });
});
