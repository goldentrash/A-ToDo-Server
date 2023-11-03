#! /bin/sh

echo pull latest server image:
docker pull goldentrash/a-todo-server:latest
echo

echo stop current container:
docker stop a-todo
# docker wait a-todo
echo

echo run latest server image:
docker run --detach --publish 3000:3000 --user node --rm \
  --mount type=bind,source="$(pwd)"/logs,destination=/app/logs \
  --name a-todo goldentrash/a-todo-server
echo
