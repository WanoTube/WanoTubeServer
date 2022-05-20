const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const http = require('http')
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const seedData = require("./seeders")
require('dotenv').config();

const { connectToMongoDb } = require('./configs/database');
const { connectSocket } = require('./configs/socket');
const {
  errorHandler,
  notFoundErrorHandler,
} = require("./middlewares/errorHandler");
const swaggerOptions = require("./swagger/swaggerOptions");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

//use third-party middlewares
function useMiddleware(app) {
  const specs = swaggerJsDoc(swaggerOptions);
  app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

  app.use(fileUpload())
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use(cookieParser());
}

async function bootstrap() {
  await connectToMongoDb();
  await connectSocket(server);

  useMiddleware(app);

  //init routes
  const apiVersion = process.env.API_VERSION || 'v1';
  const routes = require(`./routes`);
  app.use(`/${apiVersion}`, routes);

  //handle errors
  app.use(notFoundErrorHandler);
  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
  });
}
bootstrap();

