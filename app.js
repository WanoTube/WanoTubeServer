const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const fileUpload = require('express-fileupload');
const http = require('http')

const mongoose = require('./models/index');
const routes = require('./routes/index.route');
const socketController = require('./controllers/socket.controller');

const app = express();
const server = http.createServer(app);
const PORT = 8000
// const PORT = process.env.PORT || 8080

// Only when local
const corsOptions = {
    origin: "http://localhost:"+ 8080,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
}

const io = require("socket.io")(server, {
  cors: corsOptions
});

app.use(fileUpload())
// app.use(cors(corsOptions));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(logger('dev'));
app.use(cookieParser());
app.use("/", routes)

io.on('connection', socketController.onSocketConnected);

app.set('socketio', io);

server.listen(PORT, () => {
  console.log('listening on *:8000');
});

// app.listen(PORT, () => console.log("listening on port " + PORT))
