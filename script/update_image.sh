#! /bin/sh

docker pull goldentrash/a-todo-server:latest
docker stop a-todo
docker wait a-todo
docker run --detach --publish 3000:3000 --rm \
  --name a-todo goldentrash/a-todo-server
