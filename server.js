const { v4: uuidv4 } = require('uuid');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
const cors = require('cors')
// const { request } = require('http');
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use(cors())
// io.use(cookieParser())
let arrUser = []
let arrAdmin = []
let arrUserOnline = []
let arrAdminOnline = []
let arrMessage = []
let id = null

io.on('connection', socket => {
  // console.log(socket.handshake.headers.origin)
  // if(socket.handshake.headers.origin === "http://localhost:3001"){
  //     socket.join("roomAdmin")
  //     io.to("roomAdmin").emit("getListUser", {  test: 'test' });
  // }
  //check cookie


  socket.on("checkCookie", data => {
    const cookieUser = cookie.parse(data.cookie)
    // console.log(cookieUser)
    const checkUser = (data) => {
      if(data.idUser){
        for(let i = 0 ; i < arrUser.length; i++){
          if(arrUser[i].id === data.idUser){
            arrUser[i].idSocket = socket.id
            arrUserOnline.push(arrUser[i])
            socket.join('web123')
            socket.join(arrUser[i].id)
            // io.to("roomAdmin").emit("getListUser", { test: "test usercookie"});
            return arrUser[i]
          }
        }
      }
    }  
    
    const checkAdmin = (data) => {
      if(data.idAdmin ){
        for(let i = 0 ; i < arrAdmin.length ; i++){
          if(arrAdmin[i].id === data.idAdmin){
            arrAdmin[i].idSocket = socket.id
            arrAdminOnline.push(arrAdmin[i])
            socket.join('roomAdmin')
            socket.join('web123')
            // io.emit("getListUser", { test: "test admincookie"});
            return arrAdmin[i]
          }
        }
       
      }
    }
   
    if(socket.handshake.headers.origin !== "http://localhost:3001"){
      let userCheck = checkUser(cookieUser)
      socket.emit("returnCheckCookie", {data: userCheck})
    }
    let adminCheck = checkAdmin(cookieUser)
   
    let arrTest = new Set(arrUserOnline)

    io.emit("getListUser", { listUser: [...arrTest]});
    io.emit('getListAdmin', {listAdmin: [...new Set (arrAdminOnline)]})
    socket.emit("returnCheckCookieAdmin", {data: adminCheck})
  })

  socket.on("setNameUser", data => {
    let user = null
    if(socket.handshake.headers.origin === "http://localhost:3001"){
      user = { id: uuidv4(),idSocket: socket.id, name: data.name}
      arrAdmin.push(user)
      arrAdminOnline.push(user)
      socket.join("roomAdmin")
      socket.join('web123')
      io.emit('getListAdmin', {listAdmin: arrAdminOnline})
      io.to('roomAdmin').emit("getListMessage", arrMessage)
    }
    else{
      user = {idweb: 'web123',id: uuidv4(), idSocket: socket.id, name: data.name}
      arrUser.push(user)
      arrUserOnline.push(user)  
      socket.join('web123')
      socket.join(user.id)    
    }
    socket.emit("setCookie", user) 
    io.emit("getListUser", {listUser: arrUserOnline});
  })


  //--------------------------------------------------------------

  socket.on("userSendMessage", data => {
    console.log(data.user)
    arrMessage.push({idRoom: data.user.id, user: data.user, message: data.message})
    io.to('roomAdmin').emit("getMessage",{idRoom: 'roomAdmin', user: data.user, message: data.message, arrMessage})
    io.to(data.user.id).emit("getMessage", {idRoom: data.user.id, user: data.user, message: data.message, arrMessage})
    
  })

  // socket.on("joinRoomUser", data => {
  //   socket.join(data.id)
  // })

  socket.on("adminSendMessageToUser", data => {
    // console.log(data)
    arrMessage.push({idRoom: data.user.id, user: data.admin, message: data.message})
    io.to(data.user.id).emit('getMesssageAdmin', {idRoom: data.user.id, user: data.admin, message: data.message, arrMessage})
    io.to('roomAdmin').emit('getMesssageAdmin', {idRoom: 'roomAdmin', user: data.admin, message: data.message, arrMessage})
    
  })


  socket.on('setListMessage', () => {
    // io.to('roomAdmin').emit("getListMessage", arrMessage)
    socket.emit("getListMessage", arrMessage)
  })

  socket.on("joinRoomUser", data => {
    console.log('idadmin' + socket.id)
    console.log('iduser' + data.id)
    socket.leave(id)
    socket.join(data.id)
    id = data.id
    console.log(socket.adapter.rooms)
  })

  socket.on('setEffectChangeInput', data => {
    socket.broadcast.to(id).emit('getEffectChangeInput', {message: `${data.admin.name} đang trả lời`})
  })

  socket.on("setEffectChangeInputEmpty", () => {
    socket.broadcast.emit('getEffectChangeInput', {message: ``})
  })

  socket.on("disconnect", () => {
    arrUserOnline = arrUserOnline.filter((val) => val.idSocket !== socket.id);
    arrAdminOnline = arrAdminOnline.filter((val) => val.idSocket !== socket.id);
    let arrTest = new Set(arrUserOnline)
    io.emit("getListUser", {  listUser: [...arrTest] });
    io.emit('getListAdmin', {listAdmin: [...new Set (arrAdminOnline)]})
    // listUser: arrUserOnline,
  });


})

server.listen(5000);