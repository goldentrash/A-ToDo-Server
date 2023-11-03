# syntax=docker/dockerfile:1

FROM node:18-alpine

# make workspace
WORKDIR /app
RUN chown node:node /app

# install program
COPY package.json yarn.lock ./
RUN yarn install --production
COPY dist .env ./

EXPOSE 3000
ENTRYPOINT ["node", "./app.js"]
