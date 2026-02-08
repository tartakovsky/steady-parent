"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRouter } from "next/navigation";

interface ArticleRow {
  slug: string;
  categorySlug: string;
  title: string;
  links: { anchor: string; url: string }[];
}

// Category → color mapping for visual grouping
const categoryColors: Record<string, string> = {
  tantrums: "#ef4444",
  aggression: "#f97316",
  sleep: "#6366f1",
  siblings: "#8b5cf6",
  anxiety: "#eab308",
  discipline: "#14b8a6",
  "staying-calm": "#06b6d4",
  "breaking-the-cycle": "#ec4899",
  "big-feelings": "#f43f5e",
  "potty-training": "#84cc16",
  eating: "#22c55e",
  screens: "#64748b",
  "social-skills": "#0ea5e9",
  "body-safety": "#d946ef",
  "new-parent": "#a855f7",
  teens: "#78716c",
  transitions: "#fb923c",
  "spirited-kids": "#f472b6",
  "parenting-approach": "#2dd4bf",
  "parenting-science": "#818cf8",
  tools: "#94a3b8",
};

function buildGraph(articles: ArticleRow[]): { nodes: Node[]; edges: Edge[] } {
  const slugSet = new Set(articles.map((a) => a.slug));

  // Count incoming links for sizing
  const inDegree = new Map<string, number>();
  for (const a of articles) {
    for (const link of a.links) {
      if (link.url.startsWith("/blog/")) {
        const targetSlug = link.url.replace(/\/$/, "").split("/").pop();
        if (targetSlug && slugSet.has(targetSlug)) {
          inDegree.set(targetSlug, (inDegree.get(targetSlug) ?? 0) + 1);
        }
      }
    }
  }

  // Arrange in a grid by category
  const catGroups = new Map<string, ArticleRow[]>();
  for (const a of articles) {
    const group = catGroups.get(a.categorySlug) ?? [];
    group.push(a);
    catGroups.set(a.categorySlug, group);
  }

  const nodes: Node[] = [];
  let catIdx = 0;
  for (const [cat, group] of catGroups) {
    const col = catIdx % 5;
    const row = Math.floor(catIdx / 5);
    for (let i = 0; i < group.length; i++) {
      const a = group[i]!;
      const degree = inDegree.get(a.slug) ?? 0;
      const size = 30 + degree * 8;
      nodes.push({
        id: a.slug,
        position: {
          x: col * 300 + (i % 3) * 120,
          y: row * 400 + Math.floor(i / 3) * 100,
        },
        data: {
          label: a.slug.replace(/-/g, " ").slice(0, 25),
        },
        style: {
          background: categoryColors[cat] ?? "#94a3b8",
          color: "white",
          borderRadius: "8px",
          fontSize: "10px",
          padding: "4px 8px",
          width: size + 60,
          border: "none",
        },
      });
    }
    catIdx++;
  }

  const edges: Edge[] = [];
  for (const a of articles) {
    for (const link of a.links) {
      if (link.url.startsWith("/blog/")) {
        const targetSlug = link.url.replace(/\/$/, "").split("/").pop();
        if (targetSlug && slugSet.has(targetSlug) && targetSlug !== a.slug) {
          edges.push({
            id: `${a.slug}->${targetSlug}`,
            source: a.slug,
            target: targetSlug,
            style: { stroke: "#94a3b8", strokeWidth: 1 },
            animated: false,
          });
        }
      }
    }
  }

  return { nodes, edges };
}

export default function LinksPage() {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json() as Promise<ArticleRow[]>)
      .then((rows) => {
        setArticles(rows);
        const graph = buildGraph(rows);
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setNodes, setEdges]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      router.push(`/admin/articles/${node.id}`);
    },
    [router],
  );

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (articles.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Link Graph</h1>
        <p className="text-muted-foreground">
          No articles deployed yet. Run a sync first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Link Graph</h1>
        <p className="text-sm text-muted-foreground">
          {nodes.length} nodes, {edges.length} edges. Click a node to view
          article details.
        </p>
      </div>
      <div className="h-[calc(100vh-12rem)] rounded-lg border">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
