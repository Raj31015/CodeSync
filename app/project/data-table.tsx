"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
  type SortingState,
} from "@tanstack/react-table"
import {cn} from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  showOwnerColumn:boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showOwnerColumn
}: DataTableProps<TData, TValue>) {
  
  const [sorting, setSorting] = React.useState<SortingState>([]) // ✅ proper typing
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    owner: showOwnerColumn, // only visible if showOwnerColumn is true
  })
  const filteredColumns = showOwnerColumn
  ? columns
  : columns.filter(
      (col) => !("accessorKey" in col && col.accessorKey === "username")
    );
  const table = useReactTable({
    data,
    columns:filteredColumns,
    state: { sorting,columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // ✅ enables sorting
  })

  return (
  <div
    className={
      "overflow-hidden rounded-xl border border-none bg-transparent "
  
    }
  >
    <Table className="text-sm text-gray-200">
      <TableHeader className="border-b border-gray-500" >
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="font-semibold text-gray-300">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-gray-400"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

}
