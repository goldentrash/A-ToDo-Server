# A-ToDo-Server

지금 하는 일에 집중할 수 있는 todo App

# REST API

## get todo list

todo 목록 요청

### request

```http
GET /todos
```

### response

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

## add new todo

todo 등록

### request

```http
POST /todos
```

| parameter | type | 의미   | data type           |
| --------- | ---- | ------ | ------------------- |
| content   | body | 내용   | string (100자 미만) |
| deadline  | body | 마감일 | datetime            |

### response

```json
{
  "message": "todo Created"
}
```

## get doing list

doing 목록 요청

### request

```http
GET /doings
```

### response

```json
{
  "message": "Query Accepted",
  "data": [
    {
      "id": 1,
      "content": "to do what",
      "memo": "",
      "deadline": "2000-01-10T15:00:00.000Z"
    }
  ]
}
```

## start todo

todo 시작, doing 생성

### request

```http
POST /doings
```

| parameter | type | 의미             | data type    |
| --------- | ---- | ---------------- | ------------ |
| id        | body | 시작할 todo의 id | number (int) |

### response

```json
{
  "message": "doing Created"
}
```

## update memo

memo 수정

### request

```http
PUT /doings/:id/memos
```

| parameter | type | 의미              | data type           |
| --------- | ---- | ----------------- | ------------------- |
| id        | path | 종료할 doing의 id | number (int)        |
| memo      | body | 메모              | string (200자 미만) |

### response

```json
{
  "message": "memo Updated"
}
```

## finish doing

doing 종료, done 생성

### request

```http
POST /dones
```

| parameter | type | 의미              | data type    |
| --------- | ---- | ----------------- | ------------ |
| id        | body | 종료할 doing의 id | number (int) |

### response

```json
{
  "message": "done Created"
}
```
