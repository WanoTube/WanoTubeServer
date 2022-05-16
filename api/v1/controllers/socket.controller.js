module.exports.onSocketConnected = function (socket_io) {

	console.log('a user connected: ', socket_io.id);
	socket_io.on('disconnect', () => {
		console.log('user disconnected: ', socket_io.id);
	});
}