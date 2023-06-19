# A-ToDo-Server

지금 하는 일에 집중할 수 있는 todo App

## REST API

### get todo list

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
