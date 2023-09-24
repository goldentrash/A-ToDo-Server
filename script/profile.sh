#! /bin/sh

CSV=./user_id.csv
PROFILER=$1

# read .env
export $(grep --invert-match '^#' .env | xargs --delimiter='\n')

# set up DB
echo set up DB:
yarn knex seed:run --specific=profile.js
echo

# generate User IDs
echo generate User IDs:
for i in $(seq 1 $NUM_OF_VUSER); do
  echo user$i >> $CSV
done
echo

# profile application
echo run and monitor server:
NODE_ENV=production clinic $PROFILER \
  --on-port "artillery run ./artilleryrc.yaml" \
  -- node --trace-deprecation --abort-on-uncaught-exception --require=ts-node/register ./app.ts
echo

# clean up
echo clean up:
rm $CSV
echo
