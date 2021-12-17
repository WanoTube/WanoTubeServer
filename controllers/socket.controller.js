// Controller agrees to implement the function called "respond"
module.exports.respond = function(socket_io){
    // this function expects a socket_io connection as argument

    console.log('a user connected');
    socket_io.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket_io.on('hi', (msg) => {
        console.log('message: ' + msg);
    });
    socket_io.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });
}