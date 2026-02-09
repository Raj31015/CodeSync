// server/index.ts
import http from "http";
import { Server } from "socket.io";

const server = http.createServer((req, res) => {
  // 👇 THIS is what Render needs
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
});

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", socket => {
  console.log("Client connected:", socket.id);

  import("./sockets/codeRunner").then(({ handleCodeRun }) =>
    handleCodeRun(socket)
  );
});

const PORT = Number(process.env.PORT) || 4000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP + Socket server running on ${PORT}`);
});
