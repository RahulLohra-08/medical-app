const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const { emit } = require("process");
// const { Socket } = require('socket.io');
app.use(cors());
let connectedUsers = [];

function connectUser(data) {
  let foundUser = connectedUsers.filter((user) => {
    return user.uid === data.uid;
  });
  if (foundUser && foundUser.length == 0) connectedUsers.push(data);
}

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    method: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;

app.get("/", (req, resp) => {
  resp.send("Server is running.");
});

//now socket connection

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  socket.emit("me", socket.id);
  socket.emit("userlistupdated", connectedUsers);
  console.log(connectedUsers)

  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.broadcast.emit("callended");
    socket.emit("userlistupdated", connectedUsers);
  });

  socket.on("login", (data) => {
    console.log('login data', data)
    data["socketid"] = socket.id;
    connectUser(data);
    socket.join(data.uid);
    console.log('connected user',connectedUsers);
    io.emit("userlistupdated", connectedUsers);
  }); 

  socket.on('send_message', (data)=>{
    
    console.log('send message', data, 'uid', data.uid, 'name', data.name);
    socket.broadcast.to(data.uid).emit('receive_message', {message: data, uid: data.uid, name: data.name });
    // socket.to(data.uid).emit('receive_message', {message: data.message, uid: data.uid, name: data.name });
  })

});

server.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
