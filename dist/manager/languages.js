"use strict";
// server/manager/languages.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.LANGUAGES = void 0;
exports.LANGUAGES = {
    js: {
        id: "js",
        runtime: "JavaScript",
        version: "18",
        file: "main.js",
        run: (f) => `node ${f}`,
    },
    ts: {
        id: "ts",
        runtime: "TypeScript",
        version: "5",
        file: "main.ts",
        run: (f) => `npx ts-node ${f}`,
    },
    py: {
        id: "py",
        runtime: "Python",
        version: "3.10",
        file: "main.py",
        run: (f) => `python3 ${f}`,
    },
    c: {
        id: "c",
        runtime: "C",
        version: "gcc",
        file: "main.c",
        compile: (f) => `gcc ${f} -o main`,
        run: () => `./main`,
    },
    cpp: {
        id: "cpp",
        runtime: "C++",
        version: "g++",
        file: "main.cpp",
        compile: (f) => `g++ ${f} -o main`,
        run: () => `./main`,
    },
    java: {
        id: "java",
        runtime: "Java",
        version: "17",
        file: "Main.java",
        compile: (f) => `javac ${f}`,
        run: () => `java Main`,
    },
    go: {
        id: "go",
        runtime: "Go",
        version: "1.20",
        file: "main.go",
        run: (f) => `go run ${f}`,
    },
};
