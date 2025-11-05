"use client"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
export type Collaboration={
    collabId:string,
    username:string,
    realname:string,
    apps: { id: string; name: string; role: string }[];
}
export const columns: ColumnDef<Collaboration>[] = [
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
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "realname",
    header: "Full name",
  },
  {
    id: "apps",
    header: "Apps",
    cell: ({ row }) => {
      const apps = row.original.apps || [];

      if (apps.length === 0) return <span className="text-gray-400">—</span>;

      return (
        <div className="flex flex-col gap-4">
          {apps.map((app: any) => (
            <div key={app.id} className="flex items-center text-center justify-between gap-2">
              <div className="font-medium">
                {app.name}</div>
              <Badge className={cn(
                "text-white ",
                app.role === "owner"
                  ? "bg-green-500"
                  : app.role === "editor"
                  ? "bg-yellow-500"
                  : app.role === "viewer"
                  ? "bg-blue-500"
                  : "bg-gray-400"
              )}>
                {app.role}
              </Badge>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const collaboration = row.original
      return (
        <DropdownMenu >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-blue-900/80 border-none ">
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];