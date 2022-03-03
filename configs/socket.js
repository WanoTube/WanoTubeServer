const socketIo = require("socket.io")

let io;

const corsOptions = {
  cors: {
    origin: "http://localhost:" + 8080,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
}

async function connectSocket(server) {
  io = await socketIo(server, corsOptions);

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