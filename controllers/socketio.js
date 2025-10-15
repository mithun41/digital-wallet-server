const app = ('../api');

const {Server} = require('socket.io')

const liveChat = () => {
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173/',
            methods: ['GET', 'POST']
        }
    })
    io.on('connection', (socket) => {
        console.log(`connection ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`user disconnected ${socket.id}`);
        })
    })
}

module.exports = liveChat