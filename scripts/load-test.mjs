const baseUrl = process.env.LOAD_TEST_URL || 'http://localhost:5000/api'
const token = process.env.LOAD_TEST_TOKEN
const concurrency = Math.max(1, Number(process.env.LOAD_TEST_CONCURRENCY) || 25)
const durationMs = Math.max(5000, Number(process.env.LOAD_TEST_DURATION_MS) || 30000)

if (!token) {
  console.error('LOAD_TEST_TOKEN is required (use an admin access token).')
  process.exit(1)
}

const paths = [
  '/stats/overview',
  '/users?page=1&limit=20&role=student',
  '/courses?page=1&limit=20',
  '/halls?page=1&limit=20',
  '/schedules?page=1&limit=20',
]
const latencies = []
const statuses = new Map()
const endsAt = Date.now() + durationMs

async function runner(workerId) {
  let index = workerId
  while (Date.now() < endsAt) {
    const started = performance.now()
    try {
      const response = await fetch(`${baseUrl}${paths[index % paths.length]}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      latencies.push(performance.now() - started)
      statuses.set(response.status, (statuses.get(response.status) || 0) + 1)
      await response.arrayBuffer()
    } catch {
      latencies.push(performance.now() - started)
      statuses.set('network-error', (statuses.get('network-error') || 0) + 1)
    }
    index += concurrency
  }
}

await Promise.all(Array.from({ length: concurrency }, (_, index) => runner(index)))
latencies.sort((a, b) => a - b)
const percentile = value => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * value))] || 0
const seconds = durationMs / 1000

console.log(JSON.stringify({
  requests: latencies.length,
  requestsPerSecond: Number((latencies.length / seconds).toFixed(1)),
  latencyMs: {
    p50: Number(percentile(0.50).toFixed(1)),
    p95: Number(percentile(0.95).toFixed(1)),
    p99: Number(percentile(0.99).toFixed(1)),
  },
  statuses: Object.fromEntries(statuses),
}, null, 2))
