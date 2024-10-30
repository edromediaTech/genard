<template>
  <v-container>
    <v-row>
      <v-col>
        <v-list dense>
           <v-list-item>
          <!-- <v-list-item
            v-for="userId in onlineUsers"
            :key="userId"
            @click="openChat(userId)"
          > -->
            <v-list-item-content>{{ localStorage.userId }}</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col>
        <v-btn color="primary" @click="openChat(null)">Groupe</v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="isChatOpen" persistent max-width="600">
      <v-card>
        <v-card-title>
          <span v-if="selectedUser">Chat avec {{ selectedUser }}</span>
          <span v-else>Chat de Groupe</span>
        </v-card-title>
        <v-card-text class="chat-container">
          <div class="chat-messages">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="{
                'my-message': msg.startsWith(userLabel),
                'other-message': !msg.startsWith(userLabel),
              }"
            >
              {{ msg }}
            </div>
          </div>
          <v-text-field
            v-model="message"
            label="Tapez un message"
            outlined
            rounded
            dense
            class="message-input"
            @keyup.enter="sendMessage"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="sendMessage">Envoyer</v-btn>
          <v-btn color="grey" @click="closeChat">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {io} from 'socket.io-client';
import { mapGetters, mapActions } from "vuex";
export default {
  data() {
    return {
      socket: null,
      onlineUsers: [],
      isChatOpen: false,
      selectedUser: null,
      messages: [],
      message: '',
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    
    userLabel() {
      console.log(this.user.prenom  )
      return this.user.prenom;
     
    },
  },
  async mounted() {
     this.socket = io('https://backmbe.onrender.com');

   await this.socket.emit('register', localStorage.userId);

   await this.socket.on('updateUserList', (users) => {
      this.onlineUsers = users.filter(
        (user) => user._id !== localStorage.userId
      );
    });
console.log("on", this.onlineUsers)
    this.socket.on('receiveGroupMessage', (msg) => {
      if (!this.selectedUser) this.messages.push(msg);
    });

    this.socket.on('receivePrivateMessage', (msg) => {
      if (this.selectedUser) this.messages.push(msg);
    });
  },

  methods: {
    ...mapActions("auth", ["sendLoginRequest"]),
    openChat(userId) {
      this.selectedUser = localStorage.prenom;
      this.isChatOpen = true;
      this.messages = [];
    },

    closeChat() {
      this.isChatOpen = false;
      this.selectedUser = null;
      this.message = '';
    },

    sendMessage() {
        if (!this.message) return;
     // const msg = `${this.$auth.user.name}: ${this.message}`;
      const msg = localStorage.prenom +':'+ this.message;
      this.messages.push(msg);
      if (this.selectedUser) {
        this.socket.emit('privateMessage', {
          recipientId: this.selectedUser,
          message: msg,
        });
      } else {
        this.socket.emit('groupMessage', msg);
      }
      this.message = '';
    },
  },
};
</script>

<style scoped>
/* Styles pour embellir le chat */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;

  padding: 10px;
  border-radius: 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.my-message,
.other-message {
  max-width: 70%;
  padding: 8px 12px;
  margin: 5px 0;
  border-radius: 20px;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.my-message {
  align-self: flex-end;
  background-color: #3f51b5;
  color: white;
  margin-left: auto;
}

.other-message {
  align-self: flex-start;
  background-color: #e0e0e0;
  color: #333;
  margin-right: auto;
}

.message-input {
  margin-top: 10px;
}

.v-card-text {
  display: flex;
  flex-direction: column;
}

.v-card-title {
  font-weight: bold;
}
</style>
