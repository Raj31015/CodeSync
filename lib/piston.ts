// lib/piston.ts
export async function runPistonCode({
  language,
  version = "*",
  code,
  stdin
}: {
  language: string;
  version?: string;
  code: string;
  stdin?: string;
}) {
  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language,
      version,
      files: [{ content: code }],
      stdin
    
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Piston API error: ${err}`);
  }

  return response.json();
}
