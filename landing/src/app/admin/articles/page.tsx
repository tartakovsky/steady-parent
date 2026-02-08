"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ValidationBadge } from "@/components/admin/validation-badge";

interface ArticleRow {
  id: number;
  slug: string;
  categorySlug: string;
  title: string;
  wordCount: number;
  ctaCount: number;
  linkCount: number;
  internalLinkCount: number;
  imageCount: number;
  faqQuestionCount: number;
  isRegistered: boolean;
  validationErrors: string[];
  validationWarnings: string[];
}

const columns: ColumnDef<ArticleRow>[] = [
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Slug <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/articles/${row.original.slug}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.slug}
      </Link>
    ),
  },
  {
    accessorKey: "categorySlug",
    header: "Category",
    cell: ({ getValue }) => (
      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <ValidationBadge
        errors={row.original.validationErrors.length}
        warnings={row.original.validationWarnings.length}
      />
    ),
    sortingFn: (a, b) => {
      const aScore = a.original.validationErrors.length * 100 + a.original.validationWarnings.length;
      const bScore = b.original.validationErrors.length * 100 + b.original.validationWarnings.length;
      return aScore - bScore;
    },
  },
  {
    accessorKey: "wordCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Words <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ getValue }) => getValue<number>().toLocaleString(),
  },
  {
    accessorKey: "ctaCount",
    header: "CTAs",
  },
  {
    accessorKey: "linkCount",
    header: "Links",
  },
  {
    accessorKey: "imageCount",
    header: "Images",
  },
  {
    accessorKey: "faqQuestionCount",
    header: "FAQ Qs",
  },
  {
    accessorKey: "isRegistered",
    header: "Reg",
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      ),
  },
];

export default function ArticlesPage() {
  const [data, setData] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json() as Promise<ArticleRow[]>)
      .then((rows) => {
        setData(rows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return <p className="text-muted-foreground">Loading articles...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Articles ({data.length})</h1>
        <Input
          placeholder="Filter articles..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
