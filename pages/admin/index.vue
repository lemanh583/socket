<template>
    <div>
  <div>admin</div>

     <h1>{{data}}</h1> 
  </div>
</template>
<script>
export default {
  data() {
    return {
        data: null
    }
  },
  mounted() {
    this.socket = this.$nuxtSocket({
      channel: '/',
    })

    this.socket.on("getListUser", data => {
        this.data = data.listUser
        console.log(data)
    })

  },
}
</script>
