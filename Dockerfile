FROM node

WORKDIR /app

COPY package.json /app

RUN yarn install

RUN apt-get -y update
RUN apt-get install -y ffmpeg

COPY . /app

EXPOSE 8080

CMD ["yarn", "dev"]