#include <errno.h>
#include <netinet/in.h>
#include <pthread.h>
#include <signal.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <unistd.h>

#include "db.h"
#include "http.h"
#include "json.h"
#include "pool.h"
#include "types.h"

#define DB_PATH "users.db"

#define PORT 8080
#define RECV_TIMEOUT_SEC 5
#define POOL_WORKERS 8

static volatile sig_atomic_t running = 1;

typedef struct {
  i32 fd;
  struct sockaddr_storage address;
  socklen_t address_length;
} ClientSocket;

i32 create_socket(void);
void bind_socket(i32 server_file_descriptor,
                 const struct sockaddr *socket_address,
                 socklen_t address_length);
void listen_socket(i32 server_file_descriptor, i32 backlog);
void close_socket(i32 file_descriptor);
i32 send_response(i32 client_file_descriptor, const void *buffer,
                  size_t total_bytes);
ClientSocket accept_client(i32 server_file_descriptor);
static void handle_connection(i32 client_fd);
static void send_json_error(i32 client_fd, i32 status, const char *status_text,
                            const char *msg);
static void process_client(i32 client_fd);

static void handle_sigint(i32 sig) {
  (void)sig;
  running = 0;
}

i32 main(void) {
  signal(SIGPIPE, SIG_IGN);
  struct sigaction sa = {0};
  sa.sa_handler = handle_sigint;
  sigemptyset(&sa.sa_mask);
  sa.sa_flags = 0;
  sigaction(SIGINT, &sa, NULL);
  i32 option = 1;
  struct sockaddr_in server_address;
  memset(&server_address, 0, sizeof(server_address));
  server_address.sin_family = AF_INET;
  server_address.sin_addr.s_addr = INADDR_ANY;
  server_address.sin_port = htons(PORT);
  sqlite3 *db;

  i32 server_fd = create_socket();
  if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &option, sizeof(option)) <
      0) {
    perror("Erro no setsockopt");
    exit(EXIT_FAILURE);
  }
  bind_socket(server_fd, (struct sockaddr *)&server_address,
              sizeof(server_address));
  listen_socket(server_fd, SOMAXCONN);

  if (db_open(DB_PATH, &db) < 0 || db_init(db) < 0) {
    db_close(db);
    close_socket(server_fd);
    exit(EXIT_FAILURE);
  }
  db_close(db);
  printf("Listening to connections on port %d\n",
         ntohs(server_address.sin_port));

  ThreadPool pool;
  if (pool_init(&pool, POOL_WORKERS, handle_connection) < 0) {
    close_socket(server_fd);
    exit(EXIT_FAILURE);
  }

  while (running) {
    ClientSocket client = accept_client(server_fd);
    if (client.fd == -1) {
      if (!running)
        break;
      continue;
    }

    if (pool_enqueue(&pool, client.fd) < 0) {
      send_json_error(client.fd, 503, "Service Unavailable", "Server busy");
      close_socket(client.fd);
    }
  }

  close_socket(server_fd);
  pool_destroy(&pool);

  return 0;
}

i32 create_socket(void) {
  i32 server_fd = socket(AF_INET, SOCK_STREAM, 0);
  if (server_fd == -1) {
    perror("Error while creating socket");
    exit(EXIT_FAILURE);
  }
  return server_fd;
}

void bind_socket(i32 server_file_descriptor,
                 const struct sockaddr *socket_address,
                 socklen_t address_length) {
  if (bind(server_file_descriptor, socket_address, address_length) < 0) {
    perror("Error while binding");
    exit(EXIT_FAILURE);
  }
}

void listen_socket(i32 server_file_descriptor, i32 backlog) {
  if (listen(server_file_descriptor, backlog) == -1) {
    perror("Error while listening to connections");
    exit(EXIT_FAILURE);
  }
}

void close_socket(i32 file_descriptor) {
  if (close(file_descriptor) == -1) {
    perror("Error while closing connection");
    exit(EXIT_FAILURE);
  }
}

i32 send_response(i32 client_file_descriptor, const void *buffer,
                  size_t total_bytes) {
  const u8 *ptr = (const u8 *)buffer;
  size_t bytes_remaining = total_bytes;

  while (bytes_remaining > 0) {
    ssize_t bytes_sent = send(client_file_descriptor, ptr, bytes_remaining, 0);

    if (bytes_sent == -1) {
      if (errno == EINTR)
        continue;
      if (errno == EPIPE || errno == ECONNRESET)
        return -1;
      perror("Error while sending data");
      return -1;
    }

    bytes_remaining -= (size_t)bytes_sent;
    ptr += bytes_sent;
  }

  return 0;
}

ClientSocket accept_client(i32 server_file_descriptor) {
  ClientSocket client;
  client.address_length = sizeof(client.address);

  client.fd = accept(server_file_descriptor, (struct sockaddr *)&client.address,
                     &client.address_length);

  if (client.fd == -1) {
    if (errno != EINTR) {
      perror("Error while accepting connection");
    }
    return client;
  }
  return client;
}

static i32 parse_user_id(const char *path, i64 *out_id) {
  if (strncmp(path, "/users/", 7) != 0)
    return -1;
  const char *id_str = path + 7;
  if (*id_str == '\0')
    return -1;

  char *end = NULL;
  errno = 0;
  long long val = strtoll(id_str, &end, 10);
  if (errno != 0 || end == id_str || *end != '\0' || val <= 0)
    return -1;

  *out_id = (i64)val;
  return 0;
}

static void send_json_error(i32 client_fd, i32 status, const char *status_text,
                            const char *msg) {
  char body[256];
  snprintf(body, sizeof(body), "{\"error\":\"%s\"}", msg);
  send_http_response(client_fd, status, status_text, "application/json", body);
}

static void send_user_response(i32 client_fd, i32 status,
                               const char *status_text, const User *u) {
  char body[512];
  if (user_to_json(u, body, sizeof(body)) < 0) {
    send_json_error(client_fd, 500, "Internal Server Error",
                    "Failed to serialize user");
    return;
  }
  send_http_response(client_fd, status, status_text, "application/json", body);
}

static void route_request(i32 client_fd, sqlite3 *db, const HttpRequest *req) {
  i64 id = 0;

  if (strcmp(req->method, "POST") == 0 && strcmp(req->path, "/users") == 0) {
    char name[MAX_NAME_LEN];
    char email[MAX_EMAIL_LEN];
    if (parse_user_json(req->body, name, sizeof(name), email, sizeof(email)) <
        0) {
      send_json_error(client_fd, 400, "Bad Request",
                      "Invalid JSON or missing fields");
      return;
    }
    User created = {0};
    if (db_create_user(db, name, email, &created) < 0) {
      send_json_error(client_fd, 400, "Bad Request", "Could not create user");
      return;
    }
    send_user_response(client_fd, 201, "Created", &created);
    return;
  }

  if (strcmp(req->method, "GET") == 0 && strcmp(req->path, "/users") == 0) {
    User users[64];
    size_t count = 0;
    if (db_list_users(db, users, 64, &count) < 0) {
      send_json_error(client_fd, 500, "Internal Server Error",
                      "Database error");
      return;
    }
    char body[4096];
    if (users_to_json(users, count, body, sizeof(body)) < 0) {
      send_json_error(client_fd, 500, "Internal Server Error",
                      "Response too large");
      return;
    }
    send_http_response(client_fd, 200, "OK", "application/json", body);
    return;
  }

  if (parse_user_id(req->path, &id) == 0) {
    if (strcmp(req->method, "GET") == 0) {
      User user = {0};
      i32 rc = db_get_user(db, id, &user);
      if (rc == 0)
        send_user_response(client_fd, 200, "OK", &user);
      else if (rc == 1)
        send_json_error(client_fd, 404, "Not Found", "User not found");
      else
        send_json_error(client_fd, 500, "Internal Server Error",
                        "Database error");
      return;
    }

    if (strcmp(req->method, "PUT") == 0) {
      char name[MAX_NAME_LEN];
      char email[MAX_EMAIL_LEN];
      if (parse_user_json(req->body, name, sizeof(name), email, sizeof(email)) <
          0) {
        send_json_error(client_fd, 400, "Bad Request",
                        "Invalid JSON or missing fields");
        return;
      }
      User updated = {0};
      i32 rc = db_update_user(db, id, name, email, &updated);
      if (rc == 0)
        send_user_response(client_fd, 200, "OK", &updated);
      else if (rc == 1)
        send_json_error(client_fd, 404, "Not Found", "User not found");
      else
        send_json_error(client_fd, 500, "Internal Server Error",
                        "Database error");
      return;
    }

    if (strcmp(req->method, "DELETE") == 0) {
      i32 rc = db_delete_user(db, id);
      if (rc == 0)
        send_http_response(client_fd, 200, "OK", "application/json",
                           "{\"deleted\":true}");
      else if (rc == 1)
        send_json_error(client_fd, 404, "Not Found", "User not found");
      else
        send_json_error(client_fd, 500, "Internal Server Error",
                        "Database error");
      return;
    }
  }

  send_json_error(client_fd, 404, "Not Found", "Route not found");
}

static void process_client(i32 client_fd) {
  struct timeval tv = {.tv_sec = RECV_TIMEOUT_SEC, .tv_usec = 0};
  if (setsockopt(client_fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv)) < 0) {
    perror("setsockopt SO_RCVTIMEO");
  }

  HttpRequest req;
  if (read_http_request(client_fd, &req) < 0) {
    send_json_error(client_fd, 400, "Bad Request", "Malformed HTTP request");
    return;
  }

  sqlite3 *db = NULL;
  if (db_open(DB_PATH, &db) < 0) {
    send_json_error(client_fd, 500, "Internal Server Error",
                    "Database connection failed");
    return;
  }

  route_request(client_fd, db, &req);
  db_close(db);
}

static void handle_connection(i32 client_fd) {
  process_client(client_fd);
  close_socket(client_fd);
}
