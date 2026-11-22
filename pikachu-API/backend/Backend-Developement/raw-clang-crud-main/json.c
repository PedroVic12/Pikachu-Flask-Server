#include <cjson/cJSON.h>
#include <stdio.h>
#include <string.h>

#include "json.h"
#include "types.h"

static i32 extract_json_string(const cJSON *root, const char *key, char *out, size_t out_sz) {
    const cJSON *item = cJSON_GetObjectItemCaseSensitive(root, key);
    if (!cJSON_IsString(item) || item->valuestring == NULL ||
        item->valuestring[0] == '\0' || strlen(item->valuestring) >= out_sz) {
        return -1;
    }
    snprintf(out, out_sz, "%s", item->valuestring);
    return 0;
}

i32 parse_user_json(const char *body, char *name, size_t name_sz, char *email, size_t email_sz) {
    cJSON *root = cJSON_Parse(body);
    if (root == NULL) return -1;

    i32 ok = extract_json_string(root, "name", name, name_sz) == 0 &&
             extract_json_string(root, "email", email, email_sz) == 0;

    cJSON_Delete(root);
    return ok ? 0 : -1;
}

i32 user_to_json(const User *u, char *buf, size_t buf_sz) {
    i32 written = snprintf(
        buf,
        buf_sz,
        "{\"id\":%lld,\"name\":\"%s\",\"email\":\"%s\"}",
        (long long)u->id,
        u->name,
        u->email
    );
    if (written < 0 || (size_t)written >= buf_sz) return -1;
    return written;
}

i32 users_to_json(const User *u, size_t count, char *buf, size_t buf_sz) {
    if (buf_sz < 3) return -1;
    size_t offset = 0;
    buf[offset++] = '[';
    for (size_t i = 0; i < count; i++) {
        if (i > 0) {
            if (offset + 1 >= buf_sz) return -1;
            buf[offset++] = ',';
        }
        i32 w = user_to_json(&u[i], buf + offset, buf_sz - offset);
        if (w < 0) return -1;
        else offset += (size_t)w;
    }
    if (offset + 2 > buf_sz) return -1;
    buf[offset++] = ']';
    buf[offset] = '\0';
    return (i32)offset;
}