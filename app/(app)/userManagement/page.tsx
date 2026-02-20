"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  username: string;
  profile_pic: string;
  created_at: string;
};

export default function UserTable() {
  const [data, setData] = useState<User[]>([]);
  const [sorting, setSorting] = useState<any>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  /* =========================
     FETCH USERS
  ========================= */
  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setData(data || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================
     DELETE USER
  ========================= */
  const handleDelete = async (id: string) => {
    await supabase.from("profiles").delete().eq("id", id);
    fetchUsers();
  };

  /* =========================
     SAVE USERNAME
  ========================= */
  const handleSave = async () => {
    if (!editingId) return;

    await supabase
      .from("profiles")
      .update({ username: editName })
      .eq("id", editingId);

    setEditingId(null);
    setEditName("");
    fetchUsers();
  };

  /* =========================
     COLUMNS (MEMOIZED)
  ========================= */
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;

        if (isEditing) {
          return (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-black px-2 py-1 rounded w-full"
            />
          );
        }

        return row.original.username;
      },
    },
    {
      accessorKey: "profile_pic",
      header: "Profile",
      cell: ({ row }) => (
        <img
          src={row.original.profile_pic || "/defaultpp.png"}
          className="w-10 h-10 rounded-full"
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;

        return (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-500 px-3 py-1 rounded text-sm hover:bg-green-400"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditName("");
                  }}
                  className="bg-gray-500 px-3 py-1 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditingId(row.original.id);
                    setEditName(row.original.username);
                  }}
                  className="bg-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(row.original.id)}
                  className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-400"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ], [editingId, editName]);

  /* =========================
     TABLE CONFIG
  ========================= */
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-6 bg-emerald-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* SEARCH */}
      <input
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search username..."
        className="p-2 rounded text-black mb-4"
      />

      <div className="overflow-x-auto bg-white/10 rounded-xl">
        <table className="w-full">
          <thead className="bg-white/20">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="p-3 text-left cursor-pointer"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-white/10">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="p-4 text-center text-emerald-300">
            No users found.
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <button
            className="bg-white/10 px-3 py-1 rounded disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="bg-white/10 px-3 py-1 rounded disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>

        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>

        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="p-2 rounded bg-white/10 text-white"
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size} className="text-black">
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}