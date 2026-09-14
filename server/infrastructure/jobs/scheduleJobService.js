const path = require('path');
const IORedis = require('ioredis');
const { Queue, Worker, QueueEvents } = require('bullmq');

const QUEUE_NAME = 'schedule-generation';

class ScheduleJobService {
  constructor({ socketService }) {
    this.socketService = socketService;
    this.queue = null;
    this.worker = null;
    this.events = null;
    this.connection = null;
  }

  get enabled() {
    return Boolean(process.env.REDIS_URL) && process.env.SCHEDULE_QUEUE_DISABLED !== 'true';
  }

  async init() {
    if (!this.enabled || this.queue) return;
    this.connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
    this.queue = new Queue(QUEUE_NAME, { connection: this.connection });
    this.worker = new Worker(
      QUEUE_NAME,
      path.join(__dirname, 'scheduleProcessor.js'),
      {
        connection: this.connection,
        concurrency: Math.max(1, Number(process.env.SCHEDULE_WORKER_CONCURRENCY) || 1),
        useWorkerThreads: true,
      }
    );
    this.events = new QueueEvents(QUEUE_NAME, { connection: this.connection });
    this.events.on('completed', ({ jobId, returnvalue }) => {
      this.socketService.broadcast('schedule-job:completed', { jobId, result: returnvalue });
    });
    this.events.on('failed', ({ jobId, failedReason }) => {
      this.socketService.broadcast('schedule-job:failed', { jobId, message: failedReason });
    });
    this.worker.on('error', error => console.error('[schedule-worker]', error));
    await Promise.all([this.queue.waitUntilReady(), this.worker.waitUntilReady(), this.events.waitUntilReady()]);
    console.log('[queue] Schedule worker ready');
  }

  async add(data, requestedBy) {
    if (!this.queue) await this.init();
    const job = await this.queue.add('generate', { ...data, requestedBy }, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: { age: 3600, count: 1000 },
      removeOnFail: { age: 86400, count: 1000 },
    });
    return { jobId: job.id, status: 'queued' };
  }

  async get(jobId) {
    if (!this.queue) await this.init();
    const job = await this.queue.getJob(jobId);
    if (!job) return null;
    const state = await job.getState();
    return {
      jobId: job.id,
      status: state,
      progress: job.progress,
      result: state === 'completed' ? job.returnvalue : undefined,
      error: state === 'failed' ? job.failedReason : undefined,
    };
  }
}

module.exports = ScheduleJobService;
