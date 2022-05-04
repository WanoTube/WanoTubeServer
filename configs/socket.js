const socketIo = require("socket.io")

const { SOCKET_URL } = process.env;

let io;

const socketOptions = {
  cors: {
    origin: SOCKET_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
}

async function connectSocket(server) {
  io = await socketIo(server, socketOptions);

  console.log("Connect to socket io");
  io.on("connection", function (socket) {
    socket.emit("user_connected");

    console.log("a user connected: ", socket.id);
    socket.on("disconnect", function () {
      console.log("user disconnected: ", socket.id);
    })
  })
}

function trackProgress(progress, message) {
  io.emit(message, progress);
}

module.exports = { connectSocket, trackProgress }