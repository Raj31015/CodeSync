// features/run/api/useCodeRunner.ts
import { useMutation } from "@tanstack/react-query";

export interface RunCodeProps {
  language: string;
  version: string;
  code: string;
  stdin?:string
}

export function CodeRunner() {
  return useMutation({
    mutationFn: async ({ language, version, code,stdin }:RunCodeProps) => {
      console.log("▶️ Running code with:", { language, version, code,stdin });

      const res = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          version,
          code,
          stdin
        }),
      });

      const data = await res.json();
      console.log("📦 Response from /api/run:", data);

      if (!res.ok) {
        console.error("❌ Server error:", data);
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    },
  });
}
