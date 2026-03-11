# CodeSync – Real-Time Collaborative Code Editor

CodeSync is a real-time collaborative coding platform that allows multiple users to write and execute code together in the same workspace.

Users with assigned roles (**owner, editor, viewer**) can create coding apps, invite collaborators, and edit files simultaneously with instant synchronization. Each coding environment runs inside a secure sandbox to safely execute user code.

🔗 **Live Demo:** https://code-sync-bice.vercel.app


---

## Demo

https://github.com/user-attachments/assets/c522f29b-e0e5-4337-8015-825b68b3bcf0

<img width="1920" height="1036" alt="Dashboard" src="https://github.com/user-attachments/assets/2c98b551-9c6e-4b24-8c8c-d4c6260ed6b3" />

<img width="1920" height="1034" alt="Invite Collaborators" src="https://github.com/user-attachments/assets/a0b850ac-d3d1-42b2-be3b-8198db84ee36" />

<img width="1920" height="1037" alt="Collaborative Editor" src="https://github.com/user-attachments/assets/8171f728-3729-4ea0-adcd-34805cc5d9d9" />

<img width="1920" height="1033" alt="Run Code Output" src="https://github.com/user-attachments/assets/aa8607d8-24ab-4950-998a-485c66d768cf" />


---

## Key Features

### Real-Time Collaboration
Multiple users can edit the same code file simultaneously with instant synchronization across connected clients.

### Role-Based Access
Each workspace supports **owner, editor, and viewer** roles for controlled collaboration.

### User Invitations
Invite collaborators to specific apps and manage access permissions.

### Shared Code Editor
Collaborators work together in a synchronized editor powered by CodeMirror.

### Code Execution
Run code directly inside the editor with support for user input and view results in the integrated output console.

### Multilanguage Support
Programming language is inferred automatically from the file extension.

### App-Based Workspaces
Create multiple coding environments and manage files within each project.

### Collaborator Management
View all collaborators, their roles, and associated apps from a dedicated management panel.


---

## Tech Stack

### Frontend
- Next.js
- React
- TailwindCSS
- CodeMirror
- Shadcn UI

### Backend
- Node.js
- WebSockets (real-time sync)
- Supabase
- PostgreSQL

### Infrastructure
- Vercel (frontend deployment)
- Render (backend deployment)
- Liveblocks (real-time collaboration)
- Docker (sandboxed code execution)


---

## How It Works

1. A user creates a new coding app.
2. The app owner invites collaborators.
3. Invited users accept the invitation.
4. Multiple users open the same workspace.
5. Code changes sync instantly across all clients.
6. Users can run the code and view shared output.


---

##  Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/Raj31015/CodeSync.git
cd CodeSync
