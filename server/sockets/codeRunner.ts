import type { Socket } from "socket.io";
import { runCodeSandboxed, sendStdin, cleanupProcess } from "../manager/sandboxManager";

export function handleCodeRun(socket: Socket) {
  socket.on("run_code", async ({ language, version, code, stdin }) => {
    await runCodeSandboxed(socket, { language, code, input: stdin });
  });

  socket.on("stdin", (input: string) => {
    sendStdin(socket, input);
  });

  socket.on("disconnect", () => {
    cleanupProcess(socket.id);
  });
}
