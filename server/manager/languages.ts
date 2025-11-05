// server/manager/languages.ts

export type LanguageConfig = {
  id: string;
  runtime: string;
  version: string;
  dockerImage: string;
  execCmd: (file: string) => string;
};

export const LANGUAGES: Record<string, LanguageConfig> = {
  js: {
    id: "js",
    runtime: "JavaScript",
    version: "18.15.0",
    dockerImage: "node:18-alpine",
    execCmd: (file) => `node /app/${file}`,
  },
  ts: {
    id: "ts",
    runtime: "TypeScript",
    version: "5.0.3",
    dockerImage: "node:18-alpine",
    execCmd: (file) => `npx ts-node /app/${file}`,
  },
  py: {
    id: "py",
    runtime: "Python",
    version: "3.10",
    dockerImage: "python:3.10",
    execCmd: (file) => `python3 /app/${file}`,
  },
  java: {
    id: "java",
    runtime: "Java",
    version: "15.0.2",
    dockerImage: "openjdk:15",
    execCmd: (file) => {
     
      return `javac ${file}.java && java -cp ${file}`;
    },
    },
  html: {
    id: "html",
    runtime: "HTML",
    version: "5",
    dockerImage: "node:18-alpine",
    execCmd: (file) => `echo "Open /app/${file} in browser"`,
  },
  rs: {
    id: "rs",
    runtime: "Rust",
    version: "1.68.2",
    dockerImage: "rust:1.68",
    execCmd: (file) => `rustc /app/${file} && ./$(basename ${file} .rs)`,
  },
  sql: {
    id: "sql",
    runtime: "SQLite3",
    version: "3.36.0",
    dockerImage: "nouchka/sqlite3:latest",
    execCmd: (file) => `sqlite3 < /app/${file}`,
  },
  php: {
    id: "php",
    runtime: "PHP",
    version: "8.2",
    dockerImage: "php:8.2-cli",
    execCmd: (file) => `php /app/${file}`,
  },
  cpp: {
    id: "cpp",
    runtime: "C++",
    version: "10.2.0",
    dockerImage: "gcc:10.2",
    execCmd: (file) => `g++ ${file} -o /app/output && /app/output`,
  },
  c: {
    id: "c",
    runtime: "C",
    version: "10.2.0",
    dockerImage: "gcc:10.2",
    execCmd: (file) => `gcc ${file} -o /app/output && /app/output`,
  },
  go: {
    id: "go",
    runtime: "Go",
    version: "1.16.2",
    dockerImage: "golang:1.16",
    execCmd: (file) => `go run /app/${file}`,
  },
};
