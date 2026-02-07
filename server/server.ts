// server/index.ts (dev)
import { Server } from "socket.io";
import http from "http";

const server = http.createServer(); // no Next.js here
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", socket => {
  console.log("Client connected:", socket.id);
  import("./sockets/codeRunner").then(({ handleCodeRun }) => handleCodeRun(socket));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket server running on ${PORT}`);
});
