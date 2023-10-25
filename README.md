# A-ToDo-Server

지금 하는 일에 집중할 수 있는 todo App

## REST API

### get todo list

- 대기 중인 todo 목록을 요청

#### request

```http
GET /todos
```

#### response

```json
{
  "message": "Query Accepted",
  "data": {
    [
      {
        "id": 1,
        "content": "to do what",
        "deadline": "2000-01-10T15:00:00.000Z"
      }
    ]
  }
}
```

### add new todo

- 새 todo 등록

#### request

```http
POST /todos
```

| parameter | 의미         | type                |
| --------- | ------------ | ------------------- |
| content   | 할 일의 내용 | string (100자 미만) |
| deadline  | 마감일       | datetime            |

#### response

```json
{
  "message": "todo Created"
}
```

### get doing list

- 진행 중인 doing 목록을 요청

#### request

```http
GET /doings
```

#### response

```json
{
  "message": "Query Accepted",
  "data": [
    {
      "id": 1,
      "content": "to do what",
      "deadline": "2000-01-10T15:00:00.000Z"
    }
  ]
}
```

### start todo

- todo 시작, doing 생성

#### request

```http
POST /doings
```

| parameter | 의미             | type         |
| --------- | ---------------- | ------------ |
| id        | 시작할 todo의 id | number (int) |

#### response

```json
{
  "message": "doing Created"
}
```

### finish doing

- doing 종료, done 생성

#### request

```http
POST /dones
```

| parameter | 의미              | type                |
| --------- | ----------------- | ------------------- |
| id        | 종료할 doing의 id | number (int)        |
| memo      | 완료 메모         | string (200자 미만) |

#### response

```json
{
  "message": "done Created"
}
```
