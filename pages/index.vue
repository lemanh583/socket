<template>
  <div>
    <div v-if="!flag">
      <h1>Tên của bạn là {{ nameUser }}</h1>
    </div>
    <div v-if="flag">
      <form @submit.prevent="getNameUserForm">
        <label for="">Nhập tên</label><br />
        <input v-model="nameUser" type="text" />
        <button type="submit">Gửi</button>
      </form>
    </div>
    <div v-if="!flag">
      <a-row>
        <a-col :span="12">
          <h1>Danh sách user</h1>
          <a-row>
            <a-col :span="12">
              <a-row v-for="(item, index) in data" :key="index">
                <a-col :span="12">
                  <h3>{{ item.name }}</h3>
                </a-col>
                <a-col :span="12">
                  <button @click="joinRoomUser(item)">Nhắn tin</button>
                </a-col>
              </a-row>
            </a-col>
            <a-col :span="12" v-if="showChat">
              <div><h1>{{this.user.name}}</h1></div>
              <div class="message">
                <div v-for="(item, index) in listMessageUser" :key="index">
                  <div style="display: flex">
                    <h3>{{item.user.name}}: </h3>
                    <h3>{{item.message}}</h3>
                  </div>  
                </div>
              </div>
              <div>{{messChangeInput}}</div>
              <form @submit.prevent="adminSendMessageToUser">
                <label for="">Nhập tin nhắn</label><br />
                <input  v-model="messageToUser"  type="text"  @focus="effectChange" @blur="setEffectChangeEmpty"/>
                <button type="submit">Gửi</button>
              </form>
            </a-col>
          </a-row>
        </a-col>
        <a-col :span="12">
          <h1>Danh sách admin</h1>

           <a-col :span="12">
              <a-row v-for="(item, index) in dataListAdmin" :key="index+'v'">
                <a-col :span="12">
                  <h3>{{ item.name }}</h3>
                </a-col>
                <a-col :span="12">
                  <button>Nhắn tin</button>
                </a-col>
              </a-row>
            </a-col>

          <!-- <a-row v-for="(item, index) in dataListAdmin" :key="index + 'a'">
            <a-col :span="24"> {{ item }}</a-col>
          </a-row> -->
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: null,
      nameUser: '',
      flag: true,
      dataListAdmin: null,
      messageToUser: '',
      showChat: false,
      user: null,
      admin: null,
      listMessage: [],
      listMessageUser: [],
      messChangeInput: 'Tesst'
    }
  },
  beforeMount() {
    this.socket = this.$nuxtSocket({
      channel: '/',
    })

    this.socket.emit('checkCookie', { cookie: document.cookie })
    this.socket.on('returnCheckCookieAdmin', (data) => {
      if (data.data) {
        this.nameUser = data.data.name
        this.admin = data.data
        this.flag = false
        
      }
    })

    this.socket.on('getListUser', (data) => {
      this.data = data.listUser
      console.log('user')
      // console.log(data)
    })

    this.socket.on('getListAdmin', (data) => {
      console.log('admin')
      // console.log(data)
      this.dataListAdmin = data.listAdmin
    })

    this.socket.emit("setListMessage")

    this.socket.on('setCookie', (data) => {
      document.cookie = `idAdmin=${data.id}`
      this.admin = data
    })

    this.socket.on("getListMessage", data => {
      console.log(data)
      this.listMessage = data
    })

    this.socket.on('getMessage', (data) => {
      this.listMessage = data.arrMessage
      this.listMessageUser = data.arrMessage.filter(value => value.idRoom === this.user.id)
    })

    this.socket.on("getEffectChangeInput", data => {
      this.messChangeInput = data.message
    })

    this.socket.on("getMesssageAdmin", data => {
      // console.log(data.arrMessage)
      this.listMessage = data.arrMessage
      this.listMessageUser = data.arrMessage.filter(value => value.idRoom === this.user.id)
    })


  },
  methods: {
    getNameUserForm() {
      this.socket.emit('setNameUser', { name: this.nameUser })
      this.flag = false
    },
    adminSendMessageToUser() {
      this.socket.emit("adminSendMessageToUser", {admin: this.admin, user: this.user, message: this.messageToUser})
      this.messageToUser = ''
    },
    joinRoomUser(data){
      // console.log(data.id)
      this.showChat = true
      this.user =  data
      this.listMessageUser = this.listMessage.filter(value => value.idRoom === this.user.id)
      this.socket.emit("joinRoomUser", data)
    },
    effectChange(e){
      
      this.socket.emit("setEffectChangeInput", {admin: this.admin})
     
    },
    setEffectChangeEmpty(){
      this.socket.emit("setEffectChangeInputEmpty")
    }
  },
}
</script>
<style>
.message {
  width: 100%;
  height: 60vh;
  border: 1px solid black;
  overflow: auto;
}
</style>
