import { WebhookHandler } from "@liveblocks/node";
import {createClient} from "@supabase/supabase-js"
import * as Y from "yjs"
// Add your signing key from a project's webhooks dashboard
const webhookHandler = new WebhookHandler(process.env.WEBHOOK_SECRET!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function POST(request: Request) {
  

  const rawBody=await request.text()
  const headers=request.headers
   console.log("🔐 Incoming webhook...");
    console.log("Headers:", Object.fromEntries(headers));
    console.log("Raw body:", rawBody);

 

  // Verify if this is a real webhook request
  let event;
  try {
    event = webhookHandler.verifyRequest({
      headers:headers,
      rawBody:rawBody
    });
  } catch (err) {
    console.error(err);
    return new Response("Could not verify webhook call", { status: 400 });
  }
  if (event.type === "ydocUpdated") {
    const { roomId } = event.data;
     const url = `https://api.liveblocks.io/v2/rooms/${roomId}/ydoc`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.API_SECRET}` },
    });

    if (!response.ok) {
      return new Response("Problem accessing Liveblocks REST APIs", {
        status: 500,
      });
    }

    // Your JSON Yjs document data as a string
    const yDocData = await response.text();
    console.log(yDocData)
    let parsed =JSON.parse(yDocData)
    const updatedContent=parsed["content"]??""
    console.log(updatedContent)
    console.log(roomId)
    const {  error } = await supabase
      .from("files")
      .update({ content:updatedContent})
      .eq("fileId",roomId)
    console.log("running")
    if (error) {
      return new Response("Problem inserting data into database", {
        status: 500,
      });
    }
  }
  // Update database
  // ...

  return new Response(null, { status: 200 });
}
export async function GET() {
  return new Response("Webhook up ✅", { status: 200 });
}