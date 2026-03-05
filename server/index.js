const app = require('./src/app');
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`
🚀 OLIVA Backend Running
📡 Port: ${port}
🌍 Environment: ${process.env.NODE_ENV}
    `);
});

server.on('error', (err) => {
    console.error('❌ Server startup error:', err);
});


module.exports = app;