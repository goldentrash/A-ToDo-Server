-- create DB
DROP DATABASE IF EXISTS a_todo;

CREATE DATABASE a_todo CHARACTER
SET
  utf8;

-- move to a_todo
USE a_todo;

-- create table todo
DROP TABLE IF EXISTS todo;

CREATE TABLE
  todo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(100) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    registerd_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

-- create table doing
DROP TABLE IF EXISTS doing;

CREATE TABLE
  doing (
    id INT PRIMARY KEY,
    memo VARCHAR(200) NOT NULL DEFAULT "",
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES todo (id)
  );

-- create table done
DROP TABLE IF EXISTS done;

CREATE TABLE
  done (
    id INT PRIMARY KEY,
    finished_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES doing (id)
  );
