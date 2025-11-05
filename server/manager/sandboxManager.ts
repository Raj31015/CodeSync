import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import fs from "fs/promises";
import path from "path";
import { LANGUAGES } from "./languages";
import type { Socket } from "socket.io";

type RunRequest = {
  language: string;
  code: string;
  input?: string;
};

const activeProcesses = new Map<string, ChildProcessWithoutNullStreams>();

export async function runCodeSandboxed(socket: Socket, { language, code, input = "" }: RunRequest) {
  const lang = LANGUAGES[language];
  if (!lang) throw new Error(`Unsupported language: ${language}`);

  const tempDir = path.join(process.cwd(), "temp", socket.id);
  

const fileName =
  language === "java"
    ? `${code.match(/\bpublic\s+class\s+([A-Za-z_]\w*)/i)?.[1] || "Main"}`
    : `main.${language}`;

  const filePath = path.join(tempDir, fileName);
  const container = `sandbox_${socket.id}`;

  await fs.mkdir(tempDir, { recursive: true });
  await fs.writeFile(filePath, code);

  const limits = {
    memory: "256m",
    cpu: "0.5",
    timeout: 30000,
  };

  const dockerCmd = [
    "docker",
    "run",
    "--rm",
    "--name",
    container,
    "--cpus", limits.cpu,
    "--memory", limits.memory,
    "--network", "none",
    "-i",
    "-v", `${tempDir}:/app`,
    "-w", "/app",
    lang.dockerImage,
    "sh",
    "-c",
    lang.execCmd(fileName),
  ];

  // Spawn process
  const proc: ChildProcessWithoutNullStreams = spawn(dockerCmd[0], dockerCmd.slice(1));
  activeProcesses.set(socket.id, proc);

  // Timeout kill
  const killTimer = setTimeout(() => {
    proc.kill("SIGKILL");
    socket.emit("output", "\n⚠️ Execution timed out (30s limit)\n");
  }, limits.timeout);

  // Streaming stdout/stderr
  proc.stdout.on("data", (data) => socket.emit("output", data.toString()));
  proc.stderr.on("data", (data) => socket.emit("output", data.toString()));

  // Close
  proc.on("close", async (code) => {
    clearTimeout(killTimer);
    socket.emit("done", `Exited with code ${code}`);
    await fs.rm(tempDir, { recursive: true, force: true });
    activeProcesses.delete(socket.id);
  });

  // Initial stdin

}

// Function to send live stdin
export function sendStdin(socket: Socket, data: string) {
  const proc = activeProcesses.get(socket.id);
  if (proc && !proc.killed && proc.stdin.writable) {
    proc.stdin.write(data + "\n");
  } else {
    socket.emit("output", "⚠️ No active process to send input to.\n");
  }
}

// Cleanup on disconnect
export function cleanupProcess(socketId: string) {
  const proc = activeProcesses.get(socketId);
  if (proc) proc.kill("SIGKILL");
  activeProcesses.delete(socketId);
}
