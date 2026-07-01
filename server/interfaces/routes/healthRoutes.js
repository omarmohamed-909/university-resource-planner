const { Router } = require('express');
const mongoose = require('mongoose');

function healthRoutes() {
  const router = Router();

  router.get('/', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    res.json({
      status: dbState === 1 ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      db: stateMap[dbState] || 'unknown'
    });
  });

  return router;
}

module.exports = healthRoutes;
