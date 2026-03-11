CodeSync – Real-Time Collaborative Code Editor

A real-time collaborative code editor that allows multiple users to write and execute code together in the same workspace. Userswith assinged roles(editor,viewer,owner) can create coding apps, invite collaborators, and edit files simultaneously with instant synchronization.Every coding environment is sanboxed and secure.

🔗 Live Demo: https://code-sync-bice.vercel.app

Demo


https://github.com/user-attachments/assets/c522f29b-e0e5-4337-8015-825b68b3bcf0
<img width="1920" height="1036" alt="Screenshot (332)" src="https://github.com/user-attachments/assets/2c98b551-9c6e-4b24-8c8c-d4c6260ed6b3" />
<img width="1920" height="1034" alt="Screenshot (331)" src="https://github.com/user-attachments/assets/a0b850ac-d3d1-42b2-be3b-8198db84ee36" />
<img width="1920" height="1037" alt="Screenshot (330)" src="https://github.com/user-attachments/assets/8171f728-3729-4ea0-adcd-34805cc5d9d9" />
<img width="1920" height="1033" alt="Screenshot (329)" src="https://github.com/user-attachments/assets/aa8607d8-24ab-4950-998a-485c66d768cf" />


Key Features
Real-Time Collaboration

Multiple users can edit the same code file simultaneously with instant updates across all connected clients.

User Invitations

Invite collaborators to specific apps with role-based access.

Shared Code Editor

Collaborators can edit code together in a synchronized editor environment.

Code Execution

Run code directly inside the editor with user input and view output in the integrated console.

Multilanguage Support

Users can code in multiple languages inferred by the file extension.

App-Based Workspaces

Users can create multiple coding apps and manage files inside each workspace.

Collaborator Management

View collaborators, roles, and app ownership through a dedicated management panel.

Tech Stack
Frontend

Next.js

React

TailwindCSS

Codemirror (Editor)

Shadcn

Backend

Node.js

WebSockets / Real-time sync

Supabase

PostgreSQL

Infrastructure

Vercel deployment

Liveblocks (for real-time collaboration)

Docker (for sandboxed environment)

render (for backend deployment)

⚙️ How It Works

1.A user creates a new coding app.

2.The owner invites collaborators to the app.

3.Invited users accept the invitation.

4.Multiple users open the same workspace.

5.All code changes are synchronized instantly using real-time collaboration.

6.Users can run the code and see shared output.

