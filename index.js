const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// const cors = require('cors')
app.set("view engine", "ejs");
app.set("views", "./views");
// app.use(cors())

let arrUser = [];

io.on("connection", (socket) => {
  // console.log(socket.id)
  
  socket.on("setName", (data) => {
    socket.userName = data;
    arrUser.push({name: data.name, idSocket: socket.id});
    io.emit("getListUser", { listUser: arrUser });
    // console.log(socket.userName)
  });

  socket.on("setNameAdmin",data => {
      socket.userName = data
      io.emit("getListUser", { listUser: arrUser });
  })

  socket.on("joinRoomUser", data => {
      socket.join(data.idSocketUser)
  })

  socket.on("userSendMessage", (data) => {
    console.log(data)
    io.in(socket.id).emit("getMessage", {id:'user', room: socket.id  ,name: socket.userName.name, message: data.message });
  });

  socket.on("adminSendMess", data => {
    io.in(data.idSocketUser).emit("getMessage", {room: data.idSocketUser, name: socket.userName.name, message: data.message });
  })

  socket.on("setMessageAll", data => {
    io.emit("getMessageAll",{name: socket.userName.name, mess: data.messAll})
  })

  socket.on("disconnect", () => {
    let arrUserRemove = [];
    arrUser = arrUser.filter((val) => val.name !== socket.userName.name);
    io.emit("getListUser", { listUser: arrUser });
  });
});

server.listen(5000);

