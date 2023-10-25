# syntax=docker/dockerfile:1

FROM node:18

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY ./ ./

EXPOSE 3000
ENTRYPOINT ["./bin/www"]
