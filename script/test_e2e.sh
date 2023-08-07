#! /bin/sh

# run server
yarn build:dist && node ./bin/www &
PID=$!

# run test
yarn newman run \
  -e test/local.postman_environment.json \
  -d test/variables.json \
  "test/functionality test.postman_collection.json"
TEST_RET=$?

# exit server
kill -9 $PID

exit $TEST_RET
