import type { Socket } from "socket.io";
import {
  runCodeSandboxed,
  sendStdin,
  cleanupProcess,
} from "../manager/sandboxManager";

export function handleCodeRun(socket: Socket) {
  socket.on("run_code", async ({ language, code }) => {
    try {
      await runCodeSandboxed(socket, { language, code });
    } catch (err: any) {
      socket.emit("output", `❌ ${err.message}\n`);
    }
  });

  socket.on("stdin", (input: string) => {
    sendStdin(socket, input);
  });

  socket.on("disconnect", () => {
    cleanupProcess(socket.id);
  });
}
