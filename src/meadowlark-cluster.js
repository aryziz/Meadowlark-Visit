const cluster = require('cluster');
require('dotenv').config()

function startWorker() {
    const worker = cluster.fork();
    console.log(`CLUSTER: Worker ${worker.id} started`);
}

if (cluster.isMaster) {
    require('os').cpus().forEach(startWorker);
    // log disconnected workers
    cluster.on('disconnect', worker => console.log(`CLUSTER: Worker ${worker.id} disconnected from the cluster.`));

    // when a worker dies, create a worker to replace
    cluster.on('exit', (worker, code, signal) => {
        console.log(`CLUSTER: Worker ${worker.id} died with exit` +
            `code ${code} (${signal})`
        );
        startWorker();
    });
} else {
    const port = process.env.PORT || 3000;
    require('./meadowlark.js')(port);
}