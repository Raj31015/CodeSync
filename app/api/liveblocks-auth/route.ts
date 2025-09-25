import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";
import {auth, currentUser} from "@clerk/nextjs/server"
/**
 * Authenticating your Liveblocks application
 * https://liveblocks.io/docs/authentication
 */

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  // Get the current user's unique id from your database
  const userId = (await auth()).userId;

  if (!userId) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }
  const user=await currentUser()

  // Create a session for the current user
  // userInfo is made available in Liveblocks presence hooks, e.g. useOthers
  const session = liveblocks.prepareSession(`user-${userId}`, {
    userInfo:{
      name:user?.firstName ?? "Anonymous",
      picture: user?.imageUrl || "https://www.clerk.dev/_clerk/images/default-profile.png",
      color:getRandomCursorColor()
    }
  });

  // Use a naming pattern to allow access to rooms with a wildcard
  session.allow(`*`, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { body, status } = await session.authorize();
  return new Response(body, { status });
}


const CURSOR_COLORS = [
  "#F08385",
  "#F0D885",
  "#85EED6",
  "#85BBF0",
  "#8594F0",
  "#85DBF0",
  "#87EE85",
  "#D583F0",
  "#FFD700", // gold
  "#90EE90", // light green
  "#FF69B4", // hot pink
  "#40E0D0", // turquoise
];

function getRandomCursorColor(): string {
  const index = Math.floor(Math.random() * CURSOR_COLORS.length);
  return CURSOR_COLORS[index];
}