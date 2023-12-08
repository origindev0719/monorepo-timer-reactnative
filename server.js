const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // Assuming you have a `db.json` file
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

// SSE endpoint
server.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // This is just an example. You would replace this with your actual logic for calculating the elapsed time.
  setInterval(() => {
    const syncStatus = calculateSyncStatus(); // Your logic here
    const lastSync = calculateLastSync(); // Your logic here
    res.write(`data: ${JSON.stringify({ syncStatus, lastSync })}\n\n`);
  }, 1000);
});

server.listen(4000, () => {
  console.log('JSON Server is running');
});