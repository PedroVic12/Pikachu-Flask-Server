CC = gcc 
CFLAGS = -Wall -Wextra -pthread -I/opt/homebrew/include
LDFLAGS = -L/opt/homebrew/lib -lsqlite3 -lcjson

SRCS = server.c http.c db.c json.c pool.c
HDRS = http.h db.h json.h types.h pool.h

server: $(SRCS) $(HDRS)
	$(CC) $(CFLAGS) -fsanitize=address,undefined $(SRCS) $(LDFLAGS) -o server

server_tsan: $(SRCS) $(HDRS)
	$(CC) $(CFLAGS) -fsanitize=thread $(SRCS) $(LDFLAGS) -o server_tsan

test_db: test_db.c db.c db.h types.h
	$(CC) $(CFLAGS) -fsanitize=address,undefined test_db.c db.c $(LDFLAGS) -o test_db

clean: 
	rm -f server server_tsan test_db

.PHONY: clean
