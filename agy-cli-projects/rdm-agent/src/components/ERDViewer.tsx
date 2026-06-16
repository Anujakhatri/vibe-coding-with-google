import React, { useMemo } from 'react';
import { Database, Key, Link as LinkIcon } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: string;
}

interface Table {
  name: string;
  columns: Column[];
}

export const ERDViewer: React.FC<{ json: string }> = ({ json }) => {
  let parsed: { tables: Table[] } | null = null;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return <div className="p-4 text-red-400">Failed to parse ERD JSON</div>;
  }

  if (!parsed || !parsed.tables || parsed.tables.length === 0) {
    return <div className="p-4 text-gray-400">No tables found to render ERD.</div>;
  }

  // Layout Constants
  const TABLE_WIDTH = 250;
  const HEADER_HEIGHT = 40;
  const ROW_HEIGHT = 28;
  const SPACING_X = 350;
  const SPACING_Y = 350;
  const COLS = 3;

  const { nodes, edges, canvasWidth, canvasHeight } = useMemo(() => {
    // 1. Calculate positions for each table
    const nodesMap = new Map<string, { x: number; y: number; width: number; height: number; data: Table }>();
    
    parsed.tables.forEach((table, index) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      
      const x = 50 + col * SPACING_X;
      const y = 50 + row * SPACING_Y;
      const height = HEADER_HEIGHT + (table.columns.length * ROW_HEIGHT) + 10;
      
      nodesMap.set(table.name, { x, y, width: TABLE_WIDTH, height, data: table });
    });

    // 2. Generate edges based on foreign keys
    const edgeList: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    
    parsed.tables.forEach((table) => {
      table.columns.forEach((col) => {
        if (col.isForeign && col.references) {
          const [refTableName] = col.references.split('.');
          const sourceNode = nodesMap.get(table.name);
          const targetNode = nodesMap.get(refTableName);
          
          if (sourceNode && targetNode) {
            // Simple center-to-center line logic (you could enhance this for bezier curves)
            const x1 = sourceNode.x + sourceNode.width / 2;
            const y1 = sourceNode.y + sourceNode.height / 2;
            const x2 = targetNode.x + targetNode.width / 2;
            const y2 = targetNode.y + targetNode.height / 2;
            
            edgeList.push({
              id: `${table.name}-${refTableName}`,
              x1, y1, x2, y2
            });
          }
        }
      });
    });

    // 3. Determine total canvas size
    let maxX = 0;
    let maxY = 0;
    nodesMap.forEach(node => {
      if (node.x + node.width > maxX) maxX = node.x + node.width;
      if (node.y + node.height > maxY) maxY = node.y + node.height;
    });

    return { 
      nodes: Array.from(nodesMap.values()), 
      edges: edgeList,
      canvasWidth: Math.max(maxX + 100, 800),
      canvasHeight: Math.max(maxY + 100, 600)
    };
  }, [parsed]);

  return (
    <div className="w-full h-full min-h-[500px] border border-border rounded-xl overflow-auto bg-[#0a0f1a] relative">
      <svg 
        width={canvasWidth} 
        height={canvasHeight} 
        className="absolute top-0 left-0"
        style={{ minWidth: '100%', minHeight: '100%' }}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#1e293b" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Render Edges */}
        {edges.map(edge => (
          <path
            key={edge.id}
            d={`M ${edge.x1} ${edge.y1} Q ${(edge.x1 + edge.x2) / 2} ${edge.y1}, ${(edge.x1 + edge.x2) / 2} ${(edge.y1 + edge.y2) / 2} T ${edge.x2} ${edge.y2}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        ))}

        {/* Render Nodes (Foreign Objects) */}
        {nodes.map(node => (
          <foreignObject 
            key={node.data.name} 
            x={node.x} 
            y={node.y} 
            width={node.width} 
            height={node.height}
          >
            <div 
              className="bg-surface border border-border rounded-xl shadow-xl overflow-hidden h-full flex flex-col"
              style={{ width: '100%', height: '100%' }}
            >
              <div className="bg-primary/20 p-2 border-b border-border flex items-center gap-2 h-[40px] shrink-0">
                <Database className="w-4 h-4 text-primary" />
                <span className="font-bold text-gray-200 text-sm truncate">{node.data.name}</span>
              </div>
              
              <div className="flex flex-col flex-1 bg-background">
                {node.data.columns.map((col, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 h-[28px] border-b border-border/50 last:border-0 text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      {col.isPrimary && <Key className="w-3 h-3 text-yellow-500 shrink-0" />}
                      {col.isForeign && <LinkIcon className="w-3 h-3 text-blue-400 shrink-0" />}
                      <span className={col.isPrimary ? "font-bold text-yellow-500" : (col.isForeign ? "text-blue-400" : "text-gray-300")}>
                        {col.name}
                      </span>
                    </div>
                    <span className="text-gray-500 font-mono text-[10px] uppercase tracking-wider shrink-0 ml-2">{col.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </foreignObject>
        ))}
      </svg>
    </div>
  );
};
