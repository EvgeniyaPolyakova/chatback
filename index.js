const e = require("cors");
const http = require("http");
const socketIo = require("socket.io");

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
  } else {
    console.log("Чат переполнен!", socket.id);
    socket.disconnect();
  }

  socket.on("disconnect", (socket) => {
    connections.splice(connections.indexOf(socket.id), 1);
    console.log("Отключились");
  });
});
