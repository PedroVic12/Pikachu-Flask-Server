#ifndef JSON_H
#define JSON_H

#include <stddef.h>

#include "types.h"
#include "db.h"

i32 parse_user_json(const char *body, char *name, size_t name_sz, char *email, size_t email_sz);
i32 user_to_json(const User *u, char *buf, size_t buf_sz);
i32 users_to_json(const User *u, size_t count, char *buf, size_t buf_sz);

#endif