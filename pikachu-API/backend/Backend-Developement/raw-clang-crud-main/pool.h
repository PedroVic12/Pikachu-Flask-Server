#ifndef POOL_H
#define POOL_H

#include <pthread.h>
#include <stddef.h>

#include "types.h"

#define POOL_QUEUE_CAPACITY 128
#define POOL_MAX_WORKERS 16

typedef void (*PoolTaskFn)(i32 client_fd);

typedef struct {
  i32 queue[POOL_QUEUE_CAPACITY];
  size_t head;
  size_t tail;
  size_t count;
  pthread_t workers[POOL_MAX_WORKERS];
  size_t num_workers;
  pthread_mutex_t mutex;
  pthread_cond_t not_empty;
  i32 shutdown; // 0 = active, 1 = shutting down
  PoolTaskFn task_fn;
} ThreadPool;

i32 pool_init(ThreadPool *pool, size_t num_workers, PoolTaskFn task_fn);
i32 pool_enqueue(ThreadPool *pool, i32 client_fd);
void pool_destroy(ThreadPool *pool);

#endif
