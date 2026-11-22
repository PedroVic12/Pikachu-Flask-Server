#include <string.h>

#include "pool.h"
#include "types.h"

static void *worker_loop(void *arg) {
  ThreadPool *pool = (ThreadPool *)arg;
  while (1) {
    pthread_mutex_lock(&pool->mutex);
    while (pool->count == 0 && !pool->shutdown) {
      pthread_cond_wait(&pool->not_empty, &pool->mutex);
    }
    if (pool->shutdown && pool->count == 0) {
      pthread_mutex_unlock(&pool->mutex);
      return NULL;
    }
    i32 client_fd = pool->queue[pool->head];
    pool->head = (pool->head + 1) % POOL_QUEUE_CAPACITY;
    pool->count--;
    pthread_mutex_unlock(&pool->mutex);
    pool->task_fn(client_fd);
  }
}

i32 pool_init(ThreadPool *pool, size_t num_workers, PoolTaskFn task_fn) {
  if (num_workers == 0 || num_workers > POOL_MAX_WORKERS || task_fn == NULL) {
    return -1;
  }
  memset(pool, 0, sizeof(*pool));
  pool->num_workers = num_workers;
  pool->task_fn = task_fn;
  pthread_mutex_init(&pool->mutex, NULL);
  pthread_cond_init(&pool->not_empty, NULL);
  for (size_t i = 0; i < num_workers; i++) {
    if (pthread_create(&pool->workers[i], NULL, worker_loop, pool) != 0) {
      pool->num_workers = i;
      pool_destroy(pool);
      return -1;
    }
  }
  return 0;
}

i32 pool_enqueue(ThreadPool *pool, i32 client_fd) {
  pthread_mutex_lock(&pool->mutex);
  if (pool->shutdown || pool->count == POOL_QUEUE_CAPACITY) {
    pthread_mutex_unlock(&pool->mutex);
    return -1;
  }
  pool->queue[pool->tail] = client_fd;
  pool->tail = (pool->tail + 1) % POOL_QUEUE_CAPACITY;
  pool->count++;
  pthread_cond_signal(&pool->not_empty);
  pthread_mutex_unlock(&pool->mutex);
  return 0;
}

void pool_destroy(ThreadPool *pool) {
  pthread_mutex_lock(&pool->mutex);
  pool->shutdown = 1;
  pthread_cond_broadcast(&pool->not_empty);
  pthread_mutex_unlock(&pool->mutex);
  for (size_t i = 0; i < pool->num_workers; i++) {
    pthread_join(pool->workers[i], NULL);
  }
  pthread_mutex_destroy(&pool->mutex);
  pthread_cond_destroy(&pool->not_empty);
}
