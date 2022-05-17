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
    })
}

function trackUploadS3Progress(progress, channelId) {
  io.to(channelId).emit("Upload to S3", progress);
}

function notifyUploadCompleted(channelId, videoId) {
  io.to(channelId).emit("upload-completed", videoId);
}

function trackVideoProcessingProgress(channelId, videoId, progress) {
  io.to(channelId).emit("track-processing-progress", { videoId, progress });
}

function notifyProcessCompleted(channelId, videoId) {
  io.to(channelId).emit("process-completed", { videoId });
}

function trackVideoRecognitionProgress(channelId, videoId, progress) {
  io.to(channelId).emit("track-recognition-progress", { videoId, progress });
}

function notifyRrecognizedCompleted(channelId, videoId) {
  io.to(channelId).emit("recognized-completed", { videoId })
}

module.exports = {
  connectSocket,
  trackUploadS3Progress,
  notifyUploadCompleted,
  trackVideoProcessingProgress,
  notifyProcessCompleted,
  trackVideoRecognitionProgress,
  notifyRrecognizedCompleted
}