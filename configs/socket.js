const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

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
  io.use((socket, next) => {
    const accessToken = socket.handshake.auth.token;
    if (!accessToken) return next(new Error("Not authorization"));
    try {
      const { channelId } = jwt.verify(accessToken.split(' ')[1], process.env.TOKEN_SECRET);
      socket.channelId = channelId;
      socket.join(channelId);
      next();
    }
    catch (err) {
      console.log(err)
      next(new Error("Not authorization"));
    }
  })
    .on("connection", function (socket) {
      socket.emit("user_connected");

      console.log("a user connected: ", socket.id);
      socket.on("disconnect", function () {
        console.log("user disconnected: ", socket.id);
      })
    });
}

function trackUploadS3Progress(progress, channelId) {
  io.to(channelId).emit("Upload to S3", progress);
}

function notifyUploadCompleted(channelId, videoId) {
  io.to(channelId).emit("upload-completed", videoId);
}

function notifyProcessCompleted(channelId, videoId, { thumbnailUrl }) {
  io.to(channelId).emit("process-completed", { videoId, thumbnailUrl });
}

function notifyRrecognizedCompleted(channelId, videoId, { recognizedMusic }) {
  io.to(channelId).emit("check-completed", { videoId, recognizedMusic })
}

module.exports = {
  connectSocket,
  trackUploadS3Progress,
  notifyUploadCompleted,
  notifyProcessCompleted,
  notifyRrecognizedCompleted
}