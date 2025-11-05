import { WebhookHandler } from "@liveblocks/node";
import { createClient } from "@supabase/supabase-js";

// ✅ Ensure this runs in Node (not Edge)
export const runtime = "nodejs";

// ✅ Safe init: don't call these unless env vars exist
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const API_SECRET = process.env.API_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ Initialize webhook handler & Supabase client only if available
const webhookHandler =
  WEBHOOK_SECRET ? new WebhookHandler(WEBHOOK_SECRET) : null;

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

export async function POST(request: Request) {
  if (!WEBHOOK_SECRET) {
    console.error("❌ WEBHOOK_SECRET not set");
    return new Response("Missing webhook secret", { status: 500 });
  }

  if (!supabase) {
    console.error("❌ Supabase not initialized");
    return new Response("Supabase not configured", { status: 500 });
  }

  const rawBody = await request.text();
  const headers = request.headers;

  console.log("🔐 Incoming webhook...");
  console.log("Headers:", Object.fromEntries(headers));
  console.log("Raw body:", rawBody);

  // ✅ Verify the webhook
  let event;
  try {
    event = webhookHandler!.verifyRequest({
      headers,
      rawBody,
    });
  } catch (err) {
    console.error("❌ Verification failed:", err);
    return new Response("Could not verify webhook call", { status: 400 });
  }

  // ✅ Handle the Liveblocks event
  if (event.type === "ydocUpdated") {
    const { roomId } = event.data;

    try {
      const response = await fetch(
        `https://api.liveblocks.io/v2/rooms/${roomId}/ydoc`,
        {
          headers: { Authorization: `Bearer ${API_SECRET}` },
        }
      );

      if (!response.ok) {
        console.error("❌ Failed to fetch Liveblocks room data");
        return new Response("Problem accessing Liveblocks REST API", {
          status: 500,
        });
      }

      const yDocData = await response.text();
      const parsed = JSON.parse(yDocData);
      const updatedContent = parsed["content"] ?? "";

      const { error } = await supabase
        .from("files")
        .update({ content: updatedContent })
        .eq("fileId", roomId);

      if (error) {
        console.error("❌ Supabase update failed:", error);
        return new Response("Problem inserting data into database", {
          status: 500,
        });
      }

      console.log("✅ File updated successfully:", roomId);
    } catch (err) {
      console.error("❌ Error during webhook handling:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}

export async function GET() {
  return new Response("Webhook up ✅", { status: 200 });
}
