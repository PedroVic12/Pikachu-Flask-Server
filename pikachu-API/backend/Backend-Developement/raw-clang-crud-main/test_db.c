#include <assert.h>
#include <stdio.h>
#include <string.h>

#include "db.h"

int main(void) {
  const char *db_path = "/tmp/raw_crud_test.db";
  remove(db_path);

  sqlite3 *db = NULL;
  assert(db_open(db_path, &db) == 0);
  assert(db != NULL);
  assert(db_init(db) == 0);

  // Create
  User u1 = {0};
  assert(db_create_user(db, "Alice", "alice@example.com", &u1) == 0);
  assert(u1.id == 1);
  assert(strcmp(u1.name, "Alice") == 0);
  assert(strcmp(u1.email, "alice@example.com") == 0);

  User u2 = {0};
  assert(db_create_user(db, "Bob", "bob@example.com", &u2) == 0);
  assert(u2.id == 2);

  // Duplicate email should fail
  User dup = {0};
  assert(db_create_user(db, "Alice2", "alice@example.com", &dup) == -1);

  // Get existing and non-existing
  User fetched = {0};
  assert(db_get_user(db, u1.id, &fetched) == 0);
  assert(strcmp(fetched.name, "Alice") == 0);
  assert(db_get_user(db, 999, &fetched) == 1);

  // List
  User users[10];
  size_t count = 0;
  assert(db_list_users(db, users, 10, &count) == 0);
  assert(count == 2);
  assert(strcmp(users[0].name, "Alice") == 0);
  assert(strcmp(users[1].name, "Bob") == 0);

  // Update existing and non-existing
  User updated = {0};
  assert(db_update_user(db, u1.id, "Alice Silva", "alice.silva@example.com", &updated) == 0);
  assert(updated.id == u1.id);
  assert(strcmp(updated.name, "Alice Silva") == 0);
  assert(db_update_user(db, 999, "Nobody", "no@example.com", &updated) == 1);

  // Delete existing and non-existing
  assert(db_delete_user(db, u2.id) == 0);
  assert(db_delete_user(db, u2.id) == 1);
  assert(db_get_user(db, u2.id, &fetched) == 1);

  db_close(db);
  remove(db_path);
  printf("All DB tests passed!\n");
  return 0;
}
