#! /bin/sh

# run server
yarn build:dist
node ./bin/www &
PID=$!

# run test
yarn newman run \
  --environment postman/test.postman_environment.json \
  "postman/functionality test.postman_collection.json"
TEST_RET=$?

# exit server
kill -TERM $PID

exit $TEST_RET
