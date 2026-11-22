# raw-crud

CRUD HTTP server in C built from scratch using POSIX sockets, `pthread`, and SQLite.

## Build

```sh
make              # Build with ASan + UBSan (./server)
make server_tsan  # Build with ThreadSanitizer (./server_tsan)
make clean        # Remove binaries
```

## Run

```sh
./server
```

Listens on port `8080`.

## Endpoints

- `POST /users` — create user (`{"name":"...","email":"..."}`) → `201 Created` / `400 Bad Request`
- `GET /users` — list users → `200 OK`
- `GET /users/:id` — get user by ID → `200 OK` / `404 Not Found`
- `PUT /users/:id` — update user → `200 OK` / `400 Bad Request` / `404 Not Found`
- `DELETE /users/:id` — delete user → `200 OK` / `404 Not Found`

## Progress

- [x] Phase 1: Basic TCP server (`socket`, `bind`, `listen`, `accept`, `SO_REUSEADDR`, `SIGPIPE`)
- [x] Phase 2: Manual HTTP/1.1 parser (`read_http_request`, `Content-Length`, `build_http_response`, `send_http_response`)
- [x] Phase 3: Concurrency with `pthread`
- [x] Phase 4: SQLite persistence
- [x] Phase 5: CRUD routing and JSON
- [x] Phase 6: Robustness and cleanup
- [x] Phase 7: Thread pool (`pool.h` / `pool.c`)
