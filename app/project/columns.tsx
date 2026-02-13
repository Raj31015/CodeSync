"use client"
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table"
import {useRouter} from "next/navigation"
import {format} from "date-fns"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateInvitation } from "@/features/invitations/api/useCreateInvitation";
import { useCreateJoinRequest } from "@/features/join-requests/api/useCreateJoinRequest";

export type App={
    appId:string,
    name:string,
    createdAt:string | Date,
    updatedAt:string | Date,
    updatedBy:string,
    username?:string
}


export const columns:ColumnDef<App>[] = [
      {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({table})=>(
      <div className="ml-6">
        App
      </div>
    ),
    cell:({row})=>{
        const router=useRouter()
        return (
            <Button   onClick={() => router.push(`/project/${row.original.appId}`)} className="hover:text-blue-700">
                {row.original.name}
            </Button>
        )

        
    }
  },
  {
    accessorKey:"username",
    header:"Owner"
  },
  {
    accessorKey: "createdAt",
    header: ({column})=>{
        return(
               <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date of creation
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        )
    },
    cell:({row})=>{
        const date=new Date(row.original.createdAt)
        return format(date,"PPP p")
    },
   
  },
  {
    accessorKey: "updatedAt",
   header: ({column})=>{
        return(
               <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        )
    },
    cell:({row})=>{
        const date=new Date(row.original.updatedAt)
        return format(date,"PPP p")
    },
    enableSorting:true
  
  },
  {
    accessorKey:"updatedBy",
    header:"Updated by"
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const router = useRouter()
      const app = row.original
      const [inviteOpen, setInviteOpen] = useState(false);
      const [requestOpen, setRequestOpen] = useState(false);
      const [toUserId, setToUserId] = useState("");
      const [inviteMessage, setInviteMessage] = useState("");

      const createInvitation = useCreateInvitation();
      const createJoinRequest = useCreateJoinRequest();

      const handleSendInvite = () => {
        if (!toUserId) return;
        createInvitation.mutate(
          {
            toUserId,
            projectId: app.appId,
            message: inviteMessage || undefined,
          },
          {
            onSuccess: () => {
              setInviteOpen(false);
              setToUserId("");
              setInviteMessage("");
            },
          }
        );
      };

      const handleSendJoinRequest = () => {
        createJoinRequest.mutate(
          { projectId: app.appId },
          {
            onSuccess: () => {
              setRequestOpen(false);
            },
          }
        );
      };

      return (
        <>
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-blue-900/80 border-none ">
              <DropdownMenuItem
                onClick={() => router.push(`/project/${row.original.appId}`)}
              >
                Open app
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/collaborators`)}
              >
                Manage collaborators
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setInviteOpen(true)}>
                Invite user…
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRequestOpen(true)}>
                Request access to this app
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite user to app</DialogTitle>
                <DialogDescription>
                  Send an invitation to collaborate on “{app.name}”.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Input
                  placeholder="Enter user ID to invite"
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                />
                <Input
                  placeholder="Optional message"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInvite}
                  disabled={!toUserId || createInvitation.isPending}
                >
                  Send invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request access</DialogTitle>
                <DialogDescription>
                  Send a request to join “{app.name}”. The owner will see it in their Inbox.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRequestOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendJoinRequest}
                  disabled={createJoinRequest.isPending}
                >
                  Send request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )
    },
  },
];