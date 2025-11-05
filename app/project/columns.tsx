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
import {useRouter} from "next/navigation"
import {format} from "date-fns"
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