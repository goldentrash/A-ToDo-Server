#! /bin/sh

# set DB
echo
echo seed DB:
yarn knex seed:run --specific=e2e_test.js

# build server
echo
echo build server:
yarn build:dist

# profiling
echo
echo run and monitor server:
TIMESTAMP=$(date +%Y%m%d%H%M)
DEBUG=a-todo:error clinic doctor --on-port \
  'artillery run --output ./.artillery/'${TIMESTAMP}'report.json ./load_test.yaml' \
  -- node ./bin/www
artillery report --output ./.artillery/${TIMESTAMP}report.html ./.artillery/${TIMESTAMP}report.json

# view result
echo
echo view results:
open ./.artillery/report.html
