const app = require('./src/app');
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`
🚀 OLIVA Backend Running
📡 Port: ${port}
🌍 Environment: ${process.env.NODE_ENV}
    `);
});

module.exports = app;