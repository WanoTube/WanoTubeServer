const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const http = require('http')
require('dotenv').config()

const { connectToMongoDb } = require('./configs/database');
const { connectSocket } = require('./configs/socket');
const routes = require('./routes/index.route');
const {
  errorHandler,
  notFoundErrorHandler,
} = require("./middlewares/error_handler")

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

async function initServer() {
  await connectToMongoDb();
  await connectSocket(server);

  server.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
  });
}
initServer()

//use third-party middlewares
function useMiddleware(app) {
  app.use(fileUpload())
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use(cookieParser());
}
useMiddleware(app)

//init routes
app.use("/", routes)

//handle errors
app.use(notFoundErrorHandler)
app.use(errorHandler)