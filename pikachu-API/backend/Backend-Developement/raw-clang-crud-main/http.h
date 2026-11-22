#ifndef HTTP_H
#define HTTP_H

#include <stddef.h>
#include "types.h"

#define MAX_METHOD_LEN 8
#define MAX_PATH_LEN 256
#define MAX_BODY_LEN 4096 

typedef struct {
    char method[MAX_METHOD_LEN];
    char path[256];
    size_t content_length;
    char body[4096];
} HttpRequest;

i32 read_http_request(i32 client_file_descriptor, HttpRequest *req);
i32 build_http_response(
    char *buffer, 
    size_t buffer_size, 
    i32 status_code, 
    const char *status_text, 
    const char *content_type, 
    const char *body
);
i32 send_http_response(
    i32 client_file_descriptor, 
    i32 status_code, 
    const char *status_text, 
    const char *content_type, 
    const char *body
);
i32 send_response(
    i32 client_file_descriptor, 
    const void *buffer, 
    size_t total_bytes
);

#endif