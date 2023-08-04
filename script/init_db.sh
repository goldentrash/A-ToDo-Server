#! /bin/sh

# read .env
export $(grep --invert-match '^#' .env | xargs --delimiter '\n')

# init db
mysql --host=$DB_HOST --user=root --password=$DB_ROOT_PASSWORD < a_todo.sql
