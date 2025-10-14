import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:4000";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

export const connectSocket = (role, accountId) => {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit("join_room", { role, accountId });
  console.log(`Joined room: ${role}, ${accountId}`);
};
