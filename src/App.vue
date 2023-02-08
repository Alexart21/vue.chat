<template>
<div class="container">
  <h1>Vue 3 && Mysql chat used setInterval</h1>
  <div class="chat-window" ref="chat">
    <template v-if="allMsgs.length">
      <div v-for="msg in allMsgs" :key="msg.id">
        <small class="small">{{ formatTime(msg.created_at) }}</small>&nbsp;
        <b class="name" :style="{ color: msg.color }">{{ msg.name }} : </b
        ><span>{{ msg.msg }}</span>
      </div>
    </template>
  </div>
  <form ref="chatForm" action="" @submit.prevent="formSend">
    <div v-if="nameStatus" :style="{ color: nameChecked ? '#222' : 'red' }">
      {{ nameStatus }}
    </div>
    <input
      class="name-inp"
      :style="{ color: color }"
      type="text"
      name="name"
      v-model="name"
      placeholder="имя"
      @input="checkName"
    />
    &nbsp;
    <input type="color" v-model="color" @input="setColor" />
    <button @click="sendName" class="btn btn-primary">Установить</button>
    <br />
    <small>отправка кнопкой или Ctrl + Enter</small>
    <div class="msg-block">
      <textarea
        @keydown.enter.ctrl="formSend"
        class="msg-inp"
        type="text"
        name="msg"
        v-model="msg"
        placeholder="текст"
        rows="2"
      >
      </textarea>
      <button type="submit" :disabled="disabled" class="msg-send">
        <mdicon name="send" width="40" height="40" class="send-icon" />
      </button>
    </div>
    <!-- <button @click="update()" type="button" class="btn btn-success">
      update
    </button> -->
    <button @click="clear" type="button" class="btn btn-warning">
      Очистить чат
    </button>
    <input type="checkbox" v-model="soundCheck" />Звук
    <input type="checkbox" v-model="fullDate" />Показывать дату
  </form>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      name: "",
      msg: "",
      color: "",
      names: [],
      lastId: 0,
      soundCheck: true,
      fullDate: false,
      snd: new Audio(
        "data:audio/mpeg;base64,//uQxAAAEvGLIVT0AAuBtax3P2QCIAAIAGWUC+HkqfLeTs0zTQg7wL4BGCfQQ3A1BYDjCA4BoHgpWlFh2Lu+QLnkCgpRYu+4uL2QDQPDIT0FBQyRQUpwbh+fo7i4uLvoKA3BufBAoYlehAoKClOKChiIlbigokli4u8O4u73oh7v/6PcIKChlC6J//1vcEChhYNAaGU7u717u78PoZRYdnkALgvHkClOe/ARmPZVAwGIyHA4FQkCQJBAMAHAEzABwATHDWRgjAHQYFwJEe8X1jOkkG4y04RCJQANqNrMDJKMgDIMDRFDAxXiDAy/CIAwrhVUWkuBgVCABqvXuBybuyBzvSGtzQraTgYJkCgaaxbgYrAVAaNjqAZCANLHNWvS4GC0E4GQARAAgNQMHYCwspBusxOtr/DbAs2Q4tCcxlxZZ5qpw//nS+WTcwPjkEQ/qf/m9y4aLD4xY0FCM/1vr/+DY2I0QIoLjKBoVwKACAwIAAAUBGWCCBZIDYgy509qN0uj/1/Pc3uTBLf/LAI423K5bICDMzK72SSB0piCDVSm//uSxAoDzHSZNbzGADAAADSAAAAEJz44gRLSUSRJEVS0SgAhJcOjJdZkxJsZJBqIqloyMjISTExMTExPVtWTkSRJMXWjISls2t81WrfqtqMBoOCJ4Kgqs6Ij3/8t/g1///ywcLVMQU1FMy45OC40VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjRVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7ksQ5A8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC40VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5LEOQPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
      ),
      allMsgs: [],
      disabled: false,
      nameStatus: "Введите имя и нажмите установить",
      nameChecked: false,
      success: true,
    };
  },
  methods: {
    formatTime(str) {
      let short = str.substring(11, 16);
      let long = str.substring(0, 16);
      return this.fullDate ? long : short;
    },
    setColor() {
      localStorage.setItem("nameColor", this.color);
    },
    checkName() {
      if (this.name.length < 3) {
        this.nameChecked = false;
        this.nameStatus = "Хотя бы 3 символа";
        return;
      }
      if (this.names.length) {
        if (this.names.includes(this.name.toLowerCase())) {
          this.nameChecked = false;
          this.nameStatus = "Это имя уже используется.Выберите другое";
        } else {
          this.nameChecked = true;
          this.nameStatus = 'Имя свободно. Жмите "Установить"';
        }
      } else {
        // никого еще нет в чате
        this.nameChecked = true;
        this.nameStatus = 'Имя свободно. Жмите "Установить"';
      }
    },
    sendName() {
      this.checkName();
      if (this.nameChecked) {
        localStorage.setItem("nickName", this.name);
        this.setColor();
        this.nameStatus = "Имя установлено";
      }
    },
    clear() {
      this.allMsgs = [];
    },
    scrollToBottom() {
      // console.log(this.$refs.chat.clientHeight);
      this.$refs.chat.scrollTop = 10000000000;
    },
    async all() {
      let url = "/vchat/all";
      await fetch(url)
        .then((response) => response.json())
        .then((result) => {
          if (result.success && result.msgs.length) {
            this.lastId = result.lastId;
            this.allMsgs.push(...result.msgs);
            this.allMsgs.reverse();
            setTimeout(this.scrollToBottom, 300);
            let thisName = this.name.toLowerCase();
            this.allMsgs.map((item) => {
              // создаем массив с уже используемыми именами в нижнем регистре
              let itemName = item.name.toLowerCase();
              if (!this.names.includes(itemName) && itemName !== thisName) {
                this.names.push(itemName);
              }
            });
          }
        })
        .catch((error) => console.log("error", error));
    },
    async formSend() {
      if (!this.name || !this.msg) return;
      if (!this.nameChecked) {
        this.nameStatus = "Установите имя";
        return;
      }
      this.disabled = true;
      let url = "/vchat/store";
      let formData = new FormData();
      formData.append("name", this.name);
      formData.append("msg", this.msg);
      formData.append("color", this.color);
      formData.append("_token", this.csrf);
      await fetch(url, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success && result.id) {
            this.update();
            this.msg = "";
          }
        })
        .catch((error) => console.log("error", error));
      this.disabled = false;
    },
    async update() {
      let url = "/vchat/update?id=" + this.lastId;
      await fetch(url)
        .then((response) => response.json())
        .then((result) => {
          if (result.success && result.msgs.length) {
            this.lastId = result.lastId;
            this.allMsgs.push(...result.msgs);
            let thisName = this.name.toLowerCase();
            this.allMsgs.map((item) => {
              // создаем массив с уже используемыми именами в нижнем регистре
              let itemName = item.name.toLowerCase();
              if (!this.names.includes(itemName) && itemName !== thisName) {
                this.names.push(itemName);
              }
            });
            this.scrollToBottom();
            if (this.soundCheck) {
              this.snd.play();
            }
          }
        })
        .catch((error) => console.log("error", error));
    },
    tick() {
      setInterval(() => this.update(), 5000);
    },
    initName() {
      this.name = localStorage.getItem("nickName") ?? "";
    },
    initColor() {
      this.color = localStorage.getItem("nameColor") ?? "#000000";
    },
  },
  computed: {
    ...mapGetters(["csrf"]),
  },
  mounted() {
    this.initName();
    this.initColor();
    this.all();
    this.scrollToBottom();
    this.tick();
  },
};
</script>
<style scoped>
.chat-window {
  width: 600px;
  height: 400px;
  padding: 1em 1em 3em 1em;
  border: 1px solid #222;
  overflow-y: scroll;
}
.name-inp,
.msg-inp {
  padding: 0.5em;
  border: 1px solid #222;
}

.name-inp {
  width: 12em;
}

.msg-inp {
  width: 600px;
  padding: 0 3em 0 0.5em;
}

.small {
  color: rgba(0, 0, 0, 0.3);
}

button {
  margin: 0.5em;
}

.msg-block {
  position: relative;
}


.msg-send {
  position: absolute;
  left: 540px;
  top: 0;
  background-color: transparent !important;
  border: none !important;
}

.send-icon {
  color: blueviolet;
}
</style>