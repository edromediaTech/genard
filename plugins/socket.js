import {io} from 'socket.io-client';

// Initialiser la connexion Socket.IO
const socket = io('http://localhost:3000'); // L'URL de ton serveur backend

export default ({ app }, inject) => {
  // Injecter la socket dans l'application Nuxt.js
  inject('socket', socket);
};