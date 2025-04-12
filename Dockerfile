# Use the official Node.js image as a parent image
FROM node:23-slim

WORKDIR /usr/app


COPY package*.json ./


RUN npm install


COPY . .


RUN npm run build


EXPOSE 3000


CMD ["npm", "run", "start:prod"]
