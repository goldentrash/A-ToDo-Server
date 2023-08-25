#! /bin/sh

# set DB
echo
echo seed DB:
yarn knex seed:run --specific=e2e_test.js

# build server
echo
echo build server:
yarn build:dist

# run server
echo
echo run server:
node ./bin/www &
PID=$!

# run test
echo
echo run API tests:
yarn newman run \
  --environment postman/test.postman_environment.json \
  "postman/functionality test.postman_collection.json"
TEST_RET=$?

# exit server
echo
echo shut down server:
kill -TERM $PID

exit $TEST_RET
