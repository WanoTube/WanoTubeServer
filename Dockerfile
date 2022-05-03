FROM node

WORKDIR /app

COPY package.json /app

RUN yarn install

RUN apk update
RUN apk add
RUN apk add ffmpeg

COPY . /app

EXPOSE 8080

CMD ["yarn", "dev"]