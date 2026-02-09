import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { LANGUAGES } from "./languages";
import type { Socket } from "socket.io";

import { ChildProcessWithoutNullStreams } from "child_process";

export async function runCodeSandboxed(
  socket: Socket,
  { language, code }: { language: string; code: string }
) {
  const lang = LANGUAGES[language];
  if (!lang) throw new Error("Unsupported language");

  const tempDir = path.join(process.cwd(), "temp", socket.id);
  await fs.mkdir(tempDir, { recursive: true });

  const filePath = path.join(tempDir, lang.file);
  await fs.writeFile(filePath, code);

  // Build sandboxed shell command
  const commands: string[] = [];

  if (lang.compile) commands.push(lang.compile(lang.file));
if (language === "js" || language === "javascript") {
  commands.push(`node --max-old-space-size=256 ${(lang.file)}`);
} else {
  commands.push(lang.run(lang.file));
}

  const sandboxCmd = `      
    ${commands.join(" && ")}
  `;
  const shell = process.platform === "win32" ? "cmd" : "sh";
const args =
  process.platform === "win32"
    ? ["/c", commands.join(" && ")]
    : ["-c", sandboxCmd];
console.log("==== SANDBOX CMD START ====");
console.log(sandboxCmd);
console.log("==== SANDBOX CMD END ====");

const proc = spawn(shell, args, { cwd: tempDir });

 
  activeProcesses.set(socket.id, proc);

  const killTimer = setTimeout(() => {
    proc.kill("SIGKILL");
    socket.emit("output", "\n⚠️ Time limit exceeded\n");
  }, 30000);

  proc.stdout.on("data", (d) => socket.emit("output", d.toString()));
  proc.stderr.on("data", (d) => socket.emit("output", d.toString()));

  proc.on("close", async (code) => {
    clearTimeout(killTimer);
    socket.emit("execution_done", `Exited with code ${code}`);
    await fs.rm(tempDir, { recursive: true, force: true });
    activeProcesses.delete(socket.id);
  });
}

const activeProcesses = new Map<string, ChildProcessWithoutNullStreams>();

export function sendStdin(socket: Socket, data: string) {
  const proc = activeProcesses.get(socket.id);
  if (proc && !proc.killed && proc.stdin.writable) {
    proc.stdin.write(data + "\n");
  }
}

export function cleanupProcess(socketId: string) {
  const proc = activeProcesses.get(socketId);
  if (proc) proc.kill("SIGKILL");
  activeProcesses.delete(socketId);
}