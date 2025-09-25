// app/api/run/route.ts
import { runPistonCode } from "@/lib/piston";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { language, version, code,stdin } = body;

    const result = await runPistonCode({ language, version, code,stdin });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
