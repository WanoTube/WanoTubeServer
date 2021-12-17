// Controller agrees to implement the function called "respond"
module.exports.onSocketConnected = function(socket_io){
    // this function expects a socket_io connection as argument

    console.log('a user connected: ', socket_io.id);
    socket_io.on('disconnect', () => {
        console.log('user disconnected: ', socket_io.id);
    });
}