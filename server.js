const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.use('/peerjs', peerServer)
const expressHandlebars = require('express-handlebars')
app.set("view engine", "handlebars");
app.set("views", "./views");
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main',
}))
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.redirect(`/${makeid(20)}`)
})

app.get('/:roomId', (req, res) => {
    let id = `<script>const id="${req.params.roomId}"</script>`
    res.render('index', { id: id })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)
        socket.on('disconnect', () => {
          socket.to(roomId).emit('user-disconnected', userId)
        })
      })
})
const PORT = process.env.PORT || 3000;
server.listen(PORT)