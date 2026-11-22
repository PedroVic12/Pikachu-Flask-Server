#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <errno.h>

#include "http.h"

i32 build_http_response(
    char *buffer, 
    size_t buffer_size, 
    i32 status_code, 
    const char *status_text, 
    const char *content_type, 
    const char *body
)   {
    const char *safe_body = body ? body : "";
    size_t body_len = strlen(safe_body);
    i32 written = snprintf(buffer, buffer_size, 
        "HTTP/1.1 %d %s\r\n"
        "Content-Type: %s\r\n"
        "Content-Length: %zu\r\n"
        "Connection: close\r\n"
        "\r\n"
        "%s",
        status_code,
        status_text,
        content_type,
        body_len,
        safe_body
    );
    if (written < 0 || (size_t)written >= buffer_size) {
        return -1;
    }
    return written;
}

i32 send_http_response(
    i32 client_file_descriptor, 
    i32 status_code, 
    const char *status_text, 
    const char *content_type, 
    const char *body
)   {
    char buffer[MAX_BODY_LEN * 2];
    i32 len = build_http_response(
        buffer, 
        sizeof(buffer), 
        status_code, 
        status_text, 
        content_type, 
        body
    );
    if (len < 0) return -1;
    return send_response(client_file_descriptor, buffer, (size_t)len);
}

static ssize_t recv_chunk(i32 client_fd, char *dest, size_t max_bytes) {
    while (1) {
        ssize_t n = recv(client_fd, dest, max_bytes, 0);
        if (n < 0) {
            if (errno == EINTR) continue;
            return -1;
        }
        if (n == 0) return -1;
        return n;
    }
}

static i32 parse_http_headers(const char *buffer, const char *header_end, HttpRequest *req) {
    if (sscanf(buffer, "%7s %255s", req->method, req->path) != 2) return -1;

    const char *cl_ptr = strstr(buffer, "Content-Length:");
    if (cl_ptr != NULL && cl_ptr < header_end) {
        req->content_length = strtoul(cl_ptr + 15, NULL, 10);
        if (req->content_length >= MAX_BODY_LEN) return -1;
    }
    return 0;
}

i32 read_http_request(i32 client_file_descriptor, HttpRequest *req) {
    memset(req, 0, sizeof(*req));
    char buffer[8192];
    size_t total_read = 0;
    char *header_end = NULL;

    while (total_read < sizeof(buffer) - 1) {
        ssize_t n = recv_chunk(client_file_descriptor, buffer + total_read, sizeof(buffer) - 1 - total_read);
        if (n < 0) return -1;

        total_read += (size_t)n;
        buffer[total_read] = '\0';
        header_end = strstr(buffer, "\r\n\r\n");
        if (header_end != NULL) break;
    }
    if (header_end == NULL) return -1;

    if (parse_http_headers(buffer, header_end, req) < 0) return -1;

    char *body_start = header_end + 4;
    size_t body_read = total_read - (size_t)(body_start - buffer);

    while (body_read < req->content_length) {
        if (total_read >= sizeof(buffer) - 1) return -1;

        ssize_t n = recv_chunk(client_file_descriptor, buffer + total_read, sizeof(buffer) - 1 - total_read);
        if (n < 0) return -1;

        total_read += (size_t)n;
        body_read += (size_t)n;
    }

    if (req->content_length > 0) {
        memcpy(req->body, body_start, req->content_length);
        req->body[req->content_length] = '\0';
    }
    return 0;
}



/* typedef struct {
    char method[MAX_METHOD_LEN];
    char path[256];
    size_t content_length;
    char body[4096];
} HttpRequest; */