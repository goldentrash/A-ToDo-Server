#! /bin/sh

# check payload
echo
echo check payload:
mkdir --parents ./.artillery
SEED='./.artillery/id.csv'
if [ ! -f $SEED ]; then
  echo ${SEED} is required \(use script/gen_id.sh\)
  exit 1
fi

# set DB
echo
echo seed DB:
yarn knex seed:run --specific=test.js

# build server
echo
echo build server:
yarn build:dist

# profiling
echo
echo run and monitor server:
TIMESTAMP=$(date +%Y%m%d%H%M)
DEBUG=a-todo:error clinic $1 --on-port \
  'artillery run --output ./.artillery/'${TIMESTAMP}'report.json ./load_test.yaml' \
  -- node ./bin/www
artillery report --output ./.artillery/${TIMESTAMP}report.html ./.artillery/${TIMESTAMP}report.json

# view result
echo
echo view results:
open ./.artillery/${TIMESTAMP}report.html
