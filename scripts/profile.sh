#! /bin/sh

# read .env
export $(grep --invert-match '^#' .env | xargs --delimiter='\n')

# set up DB
echo set up DB:
yarn knex seed:run --specific=profile.ts
echo

# profile application
echo profile application:
NODE_ENV=production clinic $1 \
  --on-port "artillery run ./artilleryrc.yaml" \
  -- node --trace-deprecation --abort-on-uncaught-exception --require=ts-node/register ./app.ts
echo
