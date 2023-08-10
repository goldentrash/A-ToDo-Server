#! /bin/sh

# Exit local mysql before running this script
# $ sudo service mysql stop

# At the end of this script, run the commands below
# $ mysql --protocol=tcp --user=root < a_todo.sql
# $ run the docker stats app db

# Then do the performance test!

# After the performance test, exit the test containers
# $ docker stop app db

docker run --detach --network="host" --rm \
  --memory="1g" --cpus=1 \
  --env MYSQL_ALLOW_EMPTY_PASSWORD=true \
  --name db mysql

docker run --detach --network="host" --rm \
  --memory="1g" --cpus=1 \
  --name app goldentrash/a-todo-server
