
import { clerkClient } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return Response.json({ message: 'Missing query' }, { status: 400 });
  }

  try {

    const result = await (await clerkClient()).users.getUserList({
      query,
      limit: 10,
    });

    const users = result.data.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
    }));

    return Response.json(users);
  } catch (error) {
    console.error('Clerk error:', error);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
