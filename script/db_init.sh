#! /bin/sh

# read .env
export $(grep --invert-match '^#' .env | xargs --delimiter '\n')

# init db
mysql --host=$DB_HOST --user=$DB_USER --password=$DB_PASSWORD < a_todo.sql
