#include <stdio.h>

#include "db.h"
#include "types.h"

i32 db_open(const char *path, sqlite3 **db) {
  char *err_msg = NULL;
  if (sqlite3_open(path, db) != SQLITE_OK) {
    fprintf(stderr, "Error opening database: %s\n",
            *db ? sqlite3_errmsg(*db) : "out of memory");
    db_close(*db);
    *db = NULL;
    return -1;
  }
  sqlite3_busy_timeout(*db, 5000);
  if (sqlite3_exec(*db, "PRAGMA journal_mode=WAL;", NULL, NULL, &err_msg) !=
      SQLITE_OK) {
    fprintf(stderr, "Error while initializing WAL mode: %s\n",
            err_msg ? err_msg : sqlite3_errmsg(*db));
    sqlite3_free(err_msg);
    db_close(*db);
    *db = NULL;
    return -1;
  }
  return 0;
}

void db_close(sqlite3 *db) {
  if (db != NULL) {
    sqlite3_close(db);
  }
}

i32 db_init(sqlite3 *db) {
  char *err_msg = NULL;
  const char *sql = "CREATE TABLE IF NOT EXISTS users ("
                    "id INTEGER PRIMARY KEY AUTOINCREMENT,"
                    "name TEXT NOT NULL,"
                    "email TEXT NOT NULL UNIQUE"
                    ");";

  if (sqlite3_exec(db, sql, NULL, NULL, &err_msg) != SQLITE_OK) {
    fprintf(stderr, "Error while creating tables: %s\n", err_msg);
    sqlite3_free(err_msg);
    return -1;
  }
  return 0;
}

i32 db_create_user(sqlite3 *db, const char *name, const char *email,
                   User *out_user) {
  const char *sql = "INSERT INTO users (name, email) VALUES (?, ?);";
  sqlite3_stmt *stmt = NULL;
  if (sqlite3_prepare_v2(db, sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
  sqlite3_bind_text(stmt, 1, name, -1, SQLITE_STATIC);
  sqlite3_bind_text(stmt, 2, email, -1, SQLITE_STATIC);
  if (sqlite3_step(stmt) != SQLITE_DONE) {
    fprintf(stderr, "Error while binding query: %s\n",sqlite3_errmsg(db));
    sqlite3_finalize(stmt);
    return -1;
  }

  out_user->id = sqlite3_last_insert_rowid(db);
  snprintf(out_user->name, sizeof(out_user->name), "%s", name);
  snprintf(out_user->email, sizeof(out_user->email), "%s", email);

  sqlite3_finalize(stmt);
  return 0;
}

static void read_user_row(sqlite3_stmt *stmt, User *out_user) {
  out_user->id = sqlite3_column_int64(stmt, 0);
  const unsigned char *name = sqlite3_column_text(stmt, 1);
  const unsigned char *email = sqlite3_column_text(stmt, 2);
  snprintf(out_user->name, sizeof(out_user->name), "%s",
           name ? (const char *)name : "");
  snprintf(out_user->email, sizeof(out_user->email), "%s",
           email ? (const char *)email : "");
}

i32 db_get_user(sqlite3 *db, i64 id, User *out_user) {
  const char *sql = "SELECT id, name, email FROM users WHERE id = ?;";
  sqlite3_stmt *stmt = NULL;
  if (sqlite3_prepare_v2(db, sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
  sqlite3_bind_int64(stmt, 1, id);
  i32 rc = sqlite3_step(stmt);
  if (rc == SQLITE_ROW) {
    read_user_row(stmt, out_user);
    sqlite3_finalize(stmt);
    return 0;
  } else if (rc == SQLITE_DONE) {
    sqlite3_finalize(stmt);
    return 1;
  } else {
    sqlite3_finalize(stmt);
    return -1;
  }
}

i32 db_list_users(sqlite3 *db, User *out_users, size_t max_users, size_t *out_count) {
  const char *sql = "SELECT id, name, email FROM users ORDER BY id;";
  sqlite3_stmt *stmt = NULL;
  *out_count = 0;
  int rc = SQLITE_DONE;
  if (sqlite3_prepare_v2(db, sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
  while (*out_count < max_users && (rc = sqlite3_step(stmt)) == SQLITE_ROW) {
    read_user_row(stmt, &out_users[*out_count]);
    (*out_count)++;
  }
  if (*out_count < max_users && rc != SQLITE_DONE) {
    sqlite3_finalize(stmt);
    return -1;
  }
  sqlite3_finalize(stmt);
  return 0;
}

i32 db_update_user(sqlite3 *db, i64 id, const char *name, const char *email, User *out_user) {
  const char *sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
  sqlite3_stmt *stmt = NULL;
  if (sqlite3_prepare_v2(db, sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
  sqlite3_bind_text(stmt, 1, name, -1, SQLITE_STATIC);
  sqlite3_bind_text(stmt, 2, email, -1, SQLITE_STATIC);
  sqlite3_bind_int64(stmt, 3, id);
  if (sqlite3_step(stmt) != SQLITE_DONE) {
    sqlite3_finalize(stmt);
    return -1;
  }
  if (sqlite3_changes(db) == 0) {
    sqlite3_finalize(stmt);
    return 1;
  }
  if (out_user != NULL) {
    out_user->id = id;
    snprintf(out_user->name, sizeof(out_user->name), "%s", name);
    snprintf(out_user->email, sizeof(out_user->email), "%s", email);
  }
  sqlite3_finalize(stmt);
  return 0;
}

i32 db_delete_user(sqlite3 *db, i64 id) {
  const char* sql = "DELETE FROM users WHERE id = ?;";
  sqlite3_stmt *stmt = NULL;
  if (sqlite3_prepare_v2(db, sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
  sqlite3_bind_int64(stmt, 1, id);
  if (sqlite3_step(stmt) != SQLITE_DONE) {
    sqlite3_finalize(stmt);
    return -1;
  }
  if (sqlite3_changes(db) == 0) {
    sqlite3_finalize(stmt);
    return 1;
  }
  sqlite3_finalize(stmt);
  return 0;
}