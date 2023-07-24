-- create DB
DROP DATABASE IF EXISTS a_todo;

CREATE DATABASE a_todo CHARACTER
SET
  utf8;

-- move to a_todo
USE a_todo;

-- create tables
CREATE TABLE
  user (
    id VARCHAR(10) PRIMARY KEY,
    salt CHAR(5) NOT NULL,
    hashed_password CHAR(20) NOT NULL, -- hash 길이 확인 필요
    registerd_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ) ENGINE = InnoDB;

CREATE TABLE
  task (
    id INT AUTO_INCREMENT PRIMARY KEY,
    progress ENUM ('todo', 'doing', 'done') NOT NULL,
    user_id VARCHAR(10) NOT NULL,
    for_unique_doing_per_user VARCHAR(10) GENERATED ALWAYS AS (
      CASE
        WHEN progress = 'doing' THEN user_id
      END
    ) VIRTUAL UNIQUE,
    content VARCHAR(100) NOT NULL,
    memo VARCHAR(200) NOT NULL DEFAULT "",
    deadline DATE NOT NULL, -- must match DB timezon
    days_until_deadline INT GENERATED ALWAYS AS (DATEDIFF (deadline, DATE (NOW ()))) VIRTUAL,
    registerd_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id),
    CHECK (
      progress = 'todo'
      OR started_at IS NOT NULL
    ),
    CHECK (
      progress <> 'done'
      OR finished_at IS NOT NULL
    )
  ) ENGINE = InnoDB;
