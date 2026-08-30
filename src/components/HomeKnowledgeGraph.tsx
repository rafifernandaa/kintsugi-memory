import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Concept } from '../types';
import {
  Tag,
  Share2,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  X,
} from 'lucide-react';
import { playGoldenKintsugiChime } from '../lib/audio';

interface HomeKnowledgeGraphProps {
  concepts: Concept[];
  onStartReview: (concept: Concept) => void;
  onNavigateToTab: (tab: 'garden' | 'retrieve' | 'oracle') => void;
}

interface TagGraphNode extends d3.SimulationNodeDatum {
  id: string;
  concept: Concept;
  title: string;
  category: string;
  tags: string[];
  retention: number;
  stability: number;
  kintsugiRepairs: number;
  radius: number;
  sharedTagLinksCount: number;
}

interface TagGraphLink extends d3.SimulationLinkDatum<TagGraphNode> {
  source: string | TagGraphNode;
  target: string | TagGraphNode;
  sharedTags: string[];
  weight: number;
}

export const HomeKnowledgeGraph: React.FC<HomeKnowledgeGraphProps> = ({
  concepts,
  onStartReview,
  onNavigateToTab,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [selectedNode, setSelectedNode] = useState<TagGraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TagGraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<TagGraphLink | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Zoom transform tracker for zoom controls
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // 1. Extract all unique tags with usage frequency
  const allTagsWithCounts = useMemo(() => {
    const counts: { [tag: string]: number } = {};
    concepts.forEach((c) => {
      (c.tags || []).forEach((t) => {
        const norm = t.trim().toLowerCase();
        if (norm) {
          counts[norm] = (counts[norm] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [concepts]);

  // 2. Build Tag-Based Nodes & Links
  const { graphNodes, graphLinks, totalTagBridges } = useMemo(() => {
    if (!concepts || concepts.length === 0) {
      return { graphNodes: [], graphLinks: [], totalTagBridges: 0 };
    }

    // Create node objects
    const nodeMap: { [id: string]: TagGraphNode } = {};
    const rawNodes: TagGraphNode[] = concepts.map((c) => {
      const tags = (c.tags || []).map((t) => t.trim().toLowerCase());
      const node: TagGraphNode = {
        id: c.id,
        concept: c,
        title: c.title,
        category: c.category || 'General',
        tags: tags,
        retention: c.currentRetention,
        stability: c.stability || 1,
        kintsugiRepairs: c.kintsugiRepairs || 0,
        radius: Math.max(18, Math.min(30, 16 + (c.kintsugiRepairs || 0) * 3 + (c.stability || 1) * 1.2)),
        sharedTagLinksCount: 0,
      };
      nodeMap[c.id] = node;
      return node;
    });

    // Compute pairwise links based on shared tags
    const rawLinks: TagGraphLink[] = [];

    for (let i = 0; i < rawNodes.length; i++) {
      for (let j = i + 1; j < rawNodes.length; j++) {
        const nodeA = rawNodes[i];
        const nodeB = rawNodes[j];

        // Find intersection of tags
        const shared = nodeA.tags.filter((t) => nodeB.tags.includes(t));

        if (shared.length > 0) {
          rawLinks.push({
            source: nodeA.id,
            target: nodeB.id,
            sharedTags: shared,
            weight: shared.length,
          });
          nodeA.sharedTagLinksCount += 1;
          nodeB.sharedTagLinksCount += 1;
        } else {
          // Fallback: If same category, add a subtle thematic connector so isolated nodes stay attached
          const sameCategory =
            nodeA.category.toLowerCase() === nodeB.category.toLowerCase() &&
            nodeA.category.length > 0;
          if (sameCategory) {
            rawLinks.push({
              source: nodeA.id,
              target: nodeB.id,
              sharedTags: [`category:${nodeA.category.toLowerCase()}`],
              weight: 0.5,
            });
            nodeA.sharedTagLinksCount += 1;
            nodeB.sharedTagLinksCount += 1;
          }
        }
      }
    }

    return {
      graphNodes: rawNodes,
      graphLinks: rawLinks,
      totalTagBridges: rawLinks.filter((l) => !l.sharedTags[0]?.startsWith('category:')).length,
    };
  }, [concepts]);

  // 3. Render D3 Graph
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || graphNodes.length === 0) return;

    const width = containerRef.current.clientWidth || 500;
    const height = isExpanded ? 640 : 340;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    const defs = svg.append('defs');

    // Gradient for Gold Tag Bridges
    const goldGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-home-gold-link')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    goldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#BF9A2A').attr('stop-opacity', '0.9');
    goldGrad.append('stop').attr('offset', '50%').attr('stop-color', '#D4AF37').attr('stop-opacity', '1');
    goldGrad.append('stop').attr('offset', '100%').attr('stop-color', '#8F6A00').attr('stop-opacity', '0.9');

    // Gradient for Standard Tag Bridge
    const standardGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-home-standard-link')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    standardGrad.append('stop').attr('offset', '0%').attr('stop-color', '#152659').attr('stop-opacity', '0.7');
    standardGrad.append('stop').attr('offset', '100%').attr('stop-color', '#8F6A00').attr('stop-opacity', '0.8');

    // Gold Glow Filter
    const filter = defs
      .append('filter')
      .attr('id', 'd3-home-gold-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    const g = svg.append('g').attr('class', 'home-knowledge-main-group');

    // Zoom behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    // Prepare simulation nodes & links copies
    const simNodes: TagGraphNode[] = graphNodes.map((d) => ({ ...d }));
    const simLinks: TagGraphLink[] = graphLinks.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation<TagGraphNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<TagGraphNode, TagGraphLink>(simLinks)
          .id((d) => d.id)
          .distance((d) => (isExpanded ? 110 : 75) / Math.max(0.6, d.weight))
          .strength((d) => Math.min(1.0, d.weight * 0.7))
      )
      .force('charge', d3.forceManyBody().strength(isExpanded ? -240 : -160))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.85))
      .force(
        'collide',
        d3.forceCollide<TagGraphNode>().radius((d) => d.radius + (isExpanded ? 16 : 10)).iterations(3)
      );

    // Links Layer
    const linkGroup = g.append('g').attr('class', 'links-layer');

    const link = linkGroup
      .selectAll<SVGLineElement, TagGraphLink>('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        const isCatOnly = d.sharedTags[0]?.startsWith('category:');
        if (isCatOnly) return '#DDD7C8';
        if (d.weight >= 2) return 'url(#d3-home-gold-link)';
        return 'url(#d3-home-standard-link)';
      })
      .attr('stroke-width', (d) => {
        const isCatOnly = d.sharedTags[0]?.startsWith('category:');
        if (isCatOnly) return 1;
        return Math.max(1.5, Math.min(4.5, d.weight * 1.8));
      })
      .attr('stroke-opacity', (d) => {
        const isCatOnly = d.sharedTags[0]?.startsWith('category:');
        return isCatOnly ? 0.35 : 0.75;
      })
      .attr('stroke-dasharray', (d) => (d.sharedTags[0]?.startsWith('category:') ? '3 3' : 'none'))
      .attr('filter', (d) => (d.weight >= 2 ? 'url(#d3-home-gold-glow)' : 'none'))
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredLink(d);
        d3.select(event.currentTarget).attr('stroke-width', (d as any).weight * 2.5 + 3).attr('stroke-opacity', 1);
      })
      .on('mouseleave', (event, d) => {
        setHoveredLink(null);
        d3.select(event.currentTarget)
          .attr('stroke-width', (d as any).sharedTags[0]?.startsWith('category:') ? 1 : Math.max(1.5, (d as any).weight * 1.8))
          .attr('stroke-opacity', (d as any).sharedTags[0]?.startsWith('category:') ? 0.35 : 0.75);
      });

    // Nodes Layer
    const nodeGroup = g.append('g').attr('class', 'nodes-layer');

    const node = nodeGroup
      .selectAll<SVGGElement, TagGraphNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-item cursor-pointer')
      .call(
        d3
          .drag<SVGGElement, TagGraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Kintsugi Gold Halo or Forgetting Cliff Warning Ring
    node
      .filter((d) => d.kintsugiRepairs > 0 || d.retention < 0.7)
      .append('circle')
      .attr('r', (d) => d.radius + 4)
      .attr('fill', 'none')
      .attr('stroke', (d) => (d.retention < 0.7 ? '#E2847A' : '#BF9A2A'))
      .attr('stroke-width', (d) => (d.retention < 0.7 ? 1.8 : 2.2))
      .attr('stroke-dasharray', (d) => (d.retention < 0.7 ? '3 2' : 'none'))
      .attr('stroke-opacity', 0.8)
      .attr('filter', (d) => (d.kintsugiRepairs > 0 ? 'url(#d3-home-gold-glow)' : 'none'))
      .attr('class', 'pointer-events-none');

    // Main Ceramic Bubble Circle
    node
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (d.retention < 0.7) return '#FDF2F0';
        if (d.kintsugiRepairs >= 2) return '#FAF8F2';
        if (d.retention >= 0.85) return '#FFFFFF';
        return '#FAF8F2';
      })
      .attr('stroke', (d) => {
        if (d.retention < 0.7) return '#993B2B';
        if (d.kintsugiRepairs > 0) return '#BF9A2A';
        return '#DDD7C8';
      })
      .attr('stroke-width', (d) => (d.kintsugiRepairs > 0 ? 2.2 : 1.5))
      .attr('class', 'transition-colors pointer-events-none');

    // Gold Kintsugi Seam Inside Repaired Nodes
    node
      .filter((d) => d.kintsugiRepairs > 0)
      .append('path')
      .attr('d', (d) => {
        const r = d.radius;
        return `M ${-r * 0.5} ${-r * 0.3} Q 0 0 ${r * 0.2} ${r * 0.4} T ${r * 0.6} ${r * 0.6}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#BF9A2A')
      .attr('stroke-width', 1.8)
      .attr('stroke-linecap', 'round')
      .attr('filter', 'url(#d3-home-gold-glow)')
      .attr('class', 'pointer-events-none');

    // Retention % Inside Node
    node
      .append('text')
      .text((d) => `${Math.round(d.retention * 100)}%`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', (d) => Math.max(9, Math.min(12, d.radius * 0.55)))
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('fill', (d) => {
        if (d.retention < 0.7) return '#993B2B';
        if (d.kintsugiRepairs > 0) return '#8F6A00';
        return '#2B2827';
      })
      .attr('class', 'pointer-events-none select-none');

    // Concept Title Below Node
    node
      .append('text')
      .text((d) => (d.title.length > 16 ? d.title.substring(0, 14) + '…' : d.title))
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 12)
      .attr('font-size', '10px')
      .attr('font-family', 'serif')
      .attr('font-weight', '600')
      .attr('fill', '#2B2827')
      .attr('class', 'pointer-events-none select-none');

    // Interactivity: Click & Hover with Feedback-Loop Protection
    let activeHoverId: string | null = null;

    node
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        if (d.kintsugiRepairs > 0) {
          playGoldenKintsugiChime();
        }
      })
      .on('mouseenter', (event, d) => {
        if (activeHoverId === d.id) return;
        activeHoverId = d.id;
        setHoveredNode(d);

        // Find all connected node IDs via shared tags
        const neighborIds = new Set<string>();
        neighborIds.add(d.id);

        link.each(function (l) {
          const srcId = typeof l.source === 'string' ? l.source : (l.source as TagGraphNode).id;
          const tgtId = typeof l.target === 'string' ? l.target : (l.target as TagGraphNode).id;
          if (srcId === d.id) neighborIds.add(tgtId);
          if (tgtId === d.id) neighborIds.add(srcId);
        });

        // Dim unconnected nodes & links smoothly
        node.interrupt().transition().duration(150).style('opacity', (n) => (neighborIds.has(n.id) ? 1 : 0.25));
        link
          .interrupt()
          .transition()
          .duration(150)
          .style('opacity', (l) => {
            const srcId = typeof l.source === 'string' ? l.source : (l.source as TagGraphNode).id;
            const tgtId = typeof l.target === 'string' ? l.target : (l.target as TagGraphNode).id;
            return srcId === d.id || tgtId === d.id ? 1 : 0.08;
          })
          .attr('stroke-width', (l) => {
            const srcId = typeof l.source === 'string' ? l.source : (l.source as TagGraphNode).id;
            const tgtId = typeof l.target === 'string' ? l.target : (l.target as TagGraphNode).id;
            return srcId === d.id || tgtId === d.id ? 3.5 : 1;
          });
      })
      .on('mouseleave', (event) => {
        if (event.relatedTarget && (event.currentTarget as Element).contains(event.relatedTarget as Node)) {
          return;
        }
        activeHoverId = null;
        setHoveredNode(null);
        node.interrupt().transition().duration(150).style('opacity', 1);
        link
          .interrupt()
          .transition()
          .duration(150)
          .style('opacity', (l) => (l.sharedTags[0]?.startsWith('category:') ? 0.35 : 0.75))
          .attr('stroke-width', (d) => {
            const isCatOnly = d.sharedTags[0]?.startsWith('category:');
            return isCatOnly ? 1 : Math.max(1.5, Math.min(4.5, d.weight * 1.8));
          });
      });

    // Click outside to deselect
    svg.on('click', () => {
      setSelectedNode(null);
    });

    // Simulation Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as TagGraphNode).x || 0)
        .attr('y1', (d) => (d.source as TagGraphNode).y || 0)
        .attr('x2', (d) => (d.target as TagGraphNode).x || 0)
        .attr('y2', (d) => (d.target as TagGraphNode).y || 0);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphNodes, graphLinks, isExpanded]);

  // Apply Tag Filter highlights
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    if (!activeTagFilter && !searchQuery.trim()) {
      svg.selectAll('.node-item').style('opacity', 1);
      svg.selectAll('line').style('opacity', (d: any) => (d?.sharedTags?.[0]?.startsWith('category:') ? 0.35 : 0.75));
      return;
    }

    const term = activeTagFilter || searchQuery.trim().toLowerCase();

    // Match nodes with this tag or matching title
    svg.selectAll<SVGGElement, TagGraphNode>('.node-item').style('opacity', (d) => {
      const matchTag = (d.tags || []).some((t) => t.includes(term));
      const matchTitle = d.title.toLowerCase().includes(term);
      const matchCat = d.category.toLowerCase().includes(term);
      return matchTag || matchTitle || matchCat ? 1 : 0.2;
    });

    svg.selectAll<SVGLineElement, TagGraphLink>('line').style('opacity', (d) => {
      const hasSharedTag = (d.sharedTags || []).some((t) => t.includes(term));
      return hasSharedTag ? 1 : 0.08;
    });
  }, [activeTagFilter, searchQuery]);

  // Zoom control helpers
  const handleZoom = (scaleFactor: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, scaleFactor);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div className="space-y-3">
      {/* Top Controls & Tag Quick-Filter Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Tag Filter Chips Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin max-w-full">
            <span className="text-[10px] font-mono text-[#736D6B] uppercase font-bold flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3 text-[#BF9A2A]" /> Filter Tags:
            </span>

            <button
              onClick={() => setActiveTagFilter(null)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono shrink-0 transition-all font-semibold ${
                activeTagFilter === null
                  ? 'bg-[#152659] text-white shadow-xs'
                  : 'bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8]'
              }`}
            >
              All ({concepts.length})
            </button>

            {allTagsWithCounts.slice(0, 8).map(({ tag, count }) => {
              const isSelected = activeTagFilter === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(isSelected ? null : tag)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono shrink-0 transition-all border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#BF9A2A] text-[#2B2827] font-bold border-[#BF9A2A] shadow-xs'
                      : 'bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border-[#DDD7C8] hover:border-[#BF9A2A]'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className="text-[9px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Canvas Actions: Zoom, Reset, Fullscreen */}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <button
              onClick={() => handleZoom(1.2)}
              className="p-1 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] border border-[#DDD7C8] text-xs transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              className="p-1 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] border border-[#DDD7C8] text-xs transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] border border-[#DDD7C8] text-xs transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="px-2 py-1 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors shadow-xs"
              title={isExpanded ? 'Collapse Graph' : 'Expand Full Graph'}
            >
              {isExpanded ? <Minimize2 className="w-3 h-3 text-[#BF9A2A]" /> : <Maximize2 className="w-3 h-3 text-[#BF9A2A]" />}
              <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main D3 Knowledge Graph Canvas Area */}
      <div
        ref={containerRef}
        className={`bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl relative overflow-hidden transition-all shadow-inner ${
          isExpanded ? 'h-[640px]' : 'h-[340px]'
        }`}
      >
        <svg ref={svgRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

        {/* Floating Shared Tag Bridge Info Badge on Hover */}
        {hoveredLink && (
          <div className="absolute top-3 left-3 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#BF9A2A]/50 rounded-xl px-3 py-1.5 text-xs font-mono shadow-md animate-in fade-in flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-[#BF9A2A]" />
            <span className="text-[#2B2827] font-bold">
              Shared Tags ({hoveredLink.sharedTags.filter((t) => !t.startsWith('category:')).length}):
            </span>
            <div className="flex items-center gap-1">
              {hoveredLink.sharedTags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-[#BF9A2A]/15 text-[#8F6A00] font-bold text-[10px] border border-[#BF9A2A]/30"
                >
                  #{t.replace('category:', 'cluster:')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Floating Controls Overlay: Active Tag Pill indicator */}
        {activeTagFilter && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#BF9A2A] rounded-xl px-2.5 py-1 text-xs font-mono shadow-sm">
            <span className="text-[#736D6B]">Highlighting:</span>
            <span className="font-bold text-[#8F6A00]">#{activeTagFilter}</span>
            <button
              onClick={() => setActiveTagFilter(null)}
              className="p-0.5 hover:bg-black/10 rounded-full text-[#993B2B] ml-1"
              title="Clear Tag Filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Bottom Left Stats */}
        <div className="absolute bottom-2.5 left-3 z-20 text-[10px] font-mono text-[#736D6B] bg-[#FFFFFF]/90 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-[#DDD7C8]/80 shadow-xs flex items-center gap-2">
          <span>{graphNodes.length} Concepts</span>
          <span>•</span>
          <span className="text-[#8F6A00] font-semibold">{totalTagBridges} Shared-Tag Bridges</span>
          <span>•</span>
          <span>Drag to pin</span>
        </div>
      </div>

      {/* Selected Node Details Card / Inspector Drawer */}
      {selectedNode && (
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#BF9A2A]/60 shadow-md space-y-3 relative overflow-hidden animate-in fade-in">
          {/* Subtle gold seam background flourish */}
          <div className="absolute top-0 right-0 w-32 h-full pointer-events-none opacity-30">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M 90 10 Q 50 40 30 90" stroke="#BF9A2A" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FAF8F2] text-[#5A5553] border border-[#DDD7C8] font-bold">
                  {selectedNode.category}
                </span>
                {selectedNode.kintsugiRepairs > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/40 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3 text-[#8F6A00]" /> {selectedNode.kintsugiRepairs}x Kintsugi Mended
                  </span>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#152659]/10 text-[#152659] border border-[#152659]/20 font-bold">
                  {selectedNode.sharedTagLinksCount} Connected Bridges
                </span>
              </div>
              <h4 className="text-base font-serif font-bold text-[#2B2827] leading-snug">
                {selectedNode.title}
              </h4>
              <p className="text-xs text-[#5A5553] leading-relaxed line-clamp-2">
                {selectedNode.concept.summary}
              </p>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg text-[#736D6B] hover:text-[#2B2827] hover:bg-[#FAF8F2] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tags list on selected node */}
          {selectedNode.tags && selectedNode.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-[#736D6B] font-semibold">Tags:</span>
              {selectedNode.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors font-medium border ${
                    activeTagFilter === tag
                      ? 'bg-[#BF9A2A] text-[#2B2827] font-bold border-[#BF9A2A]'
                      : 'bg-[#FAF8F2] text-[#5A5553] hover:text-[#2B2827] border-[#DDD7C8]'
                  }`}
                  title={`Filter knowledge map by #${tag}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Connected Concepts via Shared Tags */}
          {(() => {
            const connectedLinks = graphLinks.filter((l) => {
              const srcId = typeof l.source === 'string' ? l.source : (l.source as TagGraphNode).id;
              const tgtId = typeof l.target === 'string' ? l.target : (l.target as TagGraphNode).id;
              return srcId === selectedNode.id || tgtId === selectedNode.id;
            });

            if (connectedLinks.length === 0) return null;

            return (
              <div className="space-y-1.5 pt-2 border-t border-[#DDD7C8]">
                <div className="text-[10px] font-mono uppercase text-[#736D6B] font-semibold flex items-center justify-between">
                  <span>Linked Concepts via Shared Tags</span>
                  <span className="text-[#8F6A00]">{connectedLinks.length} Connections</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                  {connectedLinks.map((l, i) => {
                    const otherId =
                      (typeof l.source === 'string' ? l.source : (l.source as TagGraphNode).id) === selectedNode.id
                        ? (typeof l.target === 'string' ? l.target : (l.target as TagGraphNode).id)
                        : (typeof l.source === 'string' ? l.source : (l.source as TagGraphNode).id);
                    const other = graphNodes.find((n) => n.id === otherId);
                    if (!other) return null;

                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedNode(other)}
                        className="p-2 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] hover:border-[#BF9A2A] cursor-pointer transition-all flex items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="truncate space-y-0.5 min-w-0 flex-1">
                          <div className="text-xs font-serif font-bold text-[#2B2827] truncate">
                            {other.title}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-mono text-[#8F6A00] truncate">
                            {l.sharedTags.filter((t) => !t.startsWith('category:')).map((t) => `#${t}`).join(', ') || 'Shared Domain'}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#2B2827] shrink-0 whitespace-nowrap">
                          {Math.round(other.retention * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => onStartReview(selectedNode.concept)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-[#BF9A2A]" />
              <span>Start Socratic Recall</span>
            </button>

            <button
              onClick={() => onNavigateToTab('garden')}
              className="py-2 px-3 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#2B2827] border border-[#DDD7C8] text-xs font-mono font-semibold flex items-center gap-1 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#8F6A00]" />
              <span className="hidden sm:inline">Memory Garden</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
