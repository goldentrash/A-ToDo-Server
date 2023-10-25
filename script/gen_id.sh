#! /bin/sh

# output path
CSV=./.artillery/id.csv

# truncate output
echo truncate $CSV
echo -n > $CSV

# gen IDs
echo generate from user1 to user$1
for i in $(seq 1 $1); do
  echo user$i >> $CSV
done
