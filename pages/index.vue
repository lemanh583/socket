<template>
  <div>
    <div v-if="!flag">
      <h1>Tên của bạn là {{ nameUser }}</h1>
    </div>
    <form v-if="flag" @submit.prevent="getNameUserForm">
      <label for="">Nhập tên</label><br />
      <input v-model="nameUser" type="text" />
      <button type="submit">Gửi</button>
    </form>
    <div v-if="!flag" style="margin-left: 20px;">
      <div v-if="listMessage.length !== 0" style="width: 400px; height: 70vh;border: 1px solid black;">
          <div v-for="(item, index) in listMessage" :key="index" >
            <div style="display: flex" :style="{justifyContent: item.idRoom === item.user.id ? 'start' : 'end'}">
              <h3>{{item.user.name}}:</h3>
              <h3>{{item.message}}</h3>
            </div>
          </div>
      </div>
      <form @submit.prevent="getMessageUser">
        <label for="">Nhập tin nhắn</label><br />
        <input v-model="message" type="text" />
        <button type="submit">Gửi</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nameUser: '',
      flag: true,
      message: '',
      user: null,
      listMessage: [],
    }
  },
  beforeMount() {
    // if(document.cookie !== ''){
    //   this.flag = true
    // }

    this.socket = this.$nuxtSocket({
      channel: '/',
    })
    this.socket.emit('checkCookie', { cookie: document.cookie })
    this.socket.on('returnCheckCookie', (data) => {
      if (data.data) {
        this.nameUser = data.data.name
        this.user = data.data
        this.flag = false
      }
    })

    this.socket.emit('setListMessage')

    this.socket.on('setCookie', (data) => {
      document.cookie = `idUser=${data.id}`
      this.user = data
    })

    this.socket.on('getMessage', (data) => {
      this.listMessage.push(data)
    })

    this.socket.on('getMesssageAdmin', (data) => {
      this.listMessage.push(data)
    })

    this.socket.on("getListMessage", data => {
      this.listMessage = data.filter(value => value.idRoom === this.user.id)
    })
  },
  mounted() {},
  methods: {
    getNameUserForm() {
      this.socket.emit('setNameUser', { name: this.nameUser })
      this.flag = false
    },
    getMessageUser() {
      this.socket.emit('userSendMessage', {
        user: this.user,
        message: this.message,
      })
      this.message = ''
    },
  },
}
</script>
