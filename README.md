# WatchOutServer

A server handling audio recognition using ACR Cloud and Amazon S3 service.
A whole MEVN stack web application:

- MongoDB and Mongoose
- Express.js
- VueJS
- Node.js

Our front-end repository: https://github.com/nguyendacthienngan/WatchOutWeb

Installation steps:

    npm install

Project Structure:

      ├── controllers    
      │   │   audio-recoginition.controller.js
      │   │   comments.controller.js
      │   │   likes.controller.js
      │   │   new-videos.controller.js
      │   │   socket.controller.js
      │   │   users.controller.js
      │   │   video-info.controller.js
      │   │   videos.controller.js
      ├── middlewares
      │   │   verifyToken.middleware.js
      ├── models
      │   │   account.js
      │   │   comment.js
      │   │   index.js
      │   │   like.js
      │   │   user.js
      │   │   video.js
      ├── routes
      │   │   auth.route.js
      │   │   comments.route.js
      │   │   index.route.js
      │   │   likes.route.js
      │   │   users.route.js
      │   │   videos.route.js
      ├── utils
      │   │   api-routes.js
      │   │   aws-s3-handlers.js
      │   │   http-status.js
      │   │   image-handlers.js
      │   │   ideos-handlers.js
      ├── validations
      │   │   auth.js      
      .gitignore
      README.md
      app.js
      package-lock.json
      package.json
