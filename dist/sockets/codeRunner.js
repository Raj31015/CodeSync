"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCodeRun = handleCodeRun;
const sandboxManager_1 = require("../manager/sandboxManager");
function handleCodeRun(socket) {
    socket.on("run_code", async ({ language, code }) => {
        try {
            socket.emit("execution_start");
            await (0, sandboxManager_1.runCodeSandboxed)(socket, { language, code });
        }
        catch (err) {
            socket.emit("output", `❌ ${err.message}\n`);
        }
    });
    socket.on("stdin", (input) => {
        (0, sandboxManager_1.sendStdin)(socket, input);
    });
    socket.on("disconnect", () => {
        (0, sandboxManager_1.cleanupProcess)(socket.id);
    });
}
