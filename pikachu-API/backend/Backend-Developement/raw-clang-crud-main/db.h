#ifndef DB_H
#define DB_H

#define MAX_NAME_LEN 128
#define MAX_EMAIL_LEN 128

#include <sqlite3.h>
#include <stddef.h>

#include "types.h"

typedef struct {
  i64 id;
  char name[MAX_NAME_LEN];
  char email[MAX_EMAIL_LEN];
} User;

i32 db_open(const char *path, sqlite3 **db);
void db_close(sqlite3 *db);
i32 db_init(sqlite3 *db);
i32 db_create_user(sqlite3 *db, const char *name, const char *email,
                   User *out_user);
i32 db_get_user(sqlite3 *db, i64 id, User *out_user);
i32 db_list_users(sqlite3 *db, User *out_users, size_t max_users,
                  size_t *out_count);
i32 db_update_user(sqlite3 *db, i64 id, const char *name, const char *email,
                   User *out_user);
i32 db_delete_user(sqlite3 *db, i64 id);

#endif
