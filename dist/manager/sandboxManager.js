"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCodeSandboxed = runCodeSandboxed;
exports.sendStdin = sendStdin;
exports.cleanupProcess = cleanupProcess;
const child_process_1 = require("child_process");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const languages_1 = require("./languages");
async function runCodeSandboxed(socket, { language, code }) {
    const lang = languages_1.LANGUAGES[language];
    if (!lang)
        throw new Error("Unsupported language");
    const tempDir = path_1.default.join(process.cwd(), "temp", socket.id);
    await promises_1.default.mkdir(tempDir, { recursive: true });
    const filePath = path_1.default.join(tempDir, lang.file);
    await promises_1.default.writeFile(filePath, code);
    // Build sandboxed shell command
    const commands = [];
    if (lang.compile)
        commands.push(lang.compile(lang.file));
    commands.push(lang.run(lang.file));
    const sandboxCmd = `
    ulimit -t 2
    ulimit -v 262144
    ${commands.join(" && ")}
  `;
    const proc = (0, child_process_1.spawn)("sh", ["-c", sandboxCmd], {
        cwd: tempDir,
    });
    activeProcesses.set(socket.id, proc);
    const killTimer = setTimeout(() => {
        proc.kill("SIGKILL");
        socket.emit("output", "\n⚠️ Time limit exceeded\n");
    }, 30000);
    proc.stdout.on("data", (d) => socket.emit("output", d.toString()));
    proc.stderr.on("data", (d) => socket.emit("output", d.toString()));
    proc.on("close", async (code) => {
        clearTimeout(killTimer);
        socket.emit("done", `Exited with code ${code}`);
        await promises_1.default.rm(tempDir, { recursive: true, force: true });
        activeProcesses.delete(socket.id);
    });
}
const activeProcesses = new Map();
function sendStdin(socket, data) {
    const proc = activeProcesses.get(socket.id);
    if (proc && !proc.killed && proc.stdin.writable) {
        proc.stdin.write(data + "\n");
    }
}
function cleanupProcess(socketId) {
    const proc = activeProcesses.get(socketId);
    if (proc)
        proc.kill("SIGKILL");
    activeProcesses.delete(socketId);
}
