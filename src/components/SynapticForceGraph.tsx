import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Concept } from '../types';
import { Sparkles, AlertTriangle, Zap, Maximize2, RotateCcw, Info, ArrowRight, Share2, Layers, Search, Filter } from 'lucide-react';
import { playGoldenKintsugiChime } from '../lib/audio';

interface SynapticForceGraphProps {
  concepts: Concept[];
  onSelectConcept: (concept: Concept) => void;
  onInspectOracle: (concept: Concept) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  concept: Concept;
  title: string;
  subject: string;
  retention: number;
  stability: number;
  difficulty: number;
  kintsugiRepairs: number;
  radius: number;
  connectionCount: number;
  densityScore: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
  sharedMechanisms: string[];
  type: 'thematic' | 'kintsugi_bridge' | 'mechanic_overlap';
}

export const SynapticForceGraph: React.FC<SynapticForceGraphProps> = ({
  concepts,
  onSelectConcept,
  onInspectOracle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [densityThreshold, setDensityThreshold] = useState<number>(0.2);
  const [chargeStrength, setChargeStrength] = useState<number>(-280);
  const [linkDistance, setLinkDistance] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Calculate thematic graph links and connection density matrix
  const { nodes, links, densityStats } = useMemo(() => {
    if (!concepts || concepts.length === 0) {
      return { nodes: [], links: [], densityStats: { maxDegree: 0, avgDensity: 0, hubs: [] } };
    }

    // Generate graph nodes
    const nodeMap: { [id: string]: GraphNode } = {};
    const rawNodes: GraphNode[] = concepts.map((c) => {
      const node: GraphNode = {
        id: c.id,
        concept: c,
        title: c.title,
        subject: c.category || 'General Knowledge',
        retention: c.currentRetention,
        stability: c.stability || 1,
        difficulty: c.difficulty || 5,
        kintsugiRepairs: c.kintsugiRepairs || 0,
        radius: Math.max(22, Math.min(38, 20 + (c.stability || 1) * 2.5 + (c.kintsugiRepairs || 0) * 3)),
        connectionCount: 0,
        densityScore: 0,
      };
      nodeMap[c.id] = node;
      return node;
    });

    // Calculate semantic & mechanic links between all pairs
    const rawLinks: GraphLink[] = [];
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const a = concepts[i];
        const b = concepts[j];

        // 1. Shared mechanisms overlap
        const aMechs = (a.keyMechanisms || []).map((m) => m.toLowerCase());
        const bMechs = (b.keyMechanisms || []).map((m) => m.toLowerCase());
        const shared = aMechs.filter((m) =>
          bMechs.some((bm) => bm.includes(m) || m.includes(bm) || bm.split(' ').some((w) => w.length > 3 && m.includes(w)))
        );

        // 2. Thematic word affinity across summaries/titles
        const aWords = (a.title + ' ' + a.summary).toLowerCase().split(/\W+/).filter((w) => w.length > 4);
        const bWords = (b.title + ' ' + b.summary).toLowerCase().split(/\W+/).filter((w) => w.length > 4);
        const commonWords = aWords.filter((w) => bWords.includes(w));
        const wordSimilarity = Math.min(1, commonWords.length / Math.max(1, Math.min(aWords.length, bWords.length)));

        // 3. Subject match bonus
        const sameSubject = (a.category || '').toLowerCase() === (b.category || '').toLowerCase() && (a.category || '').length > 0;

        // Total weight (0 to 1)
        let weight = (shared.length * 0.35) + (wordSimilarity * 0.45) + (sameSubject ? 0.2 : 0);

        if (weight < 0.15 && (shared.length > 0 || sameSubject)) {
          weight = 0.25;
        }

        const isKintsugiBridge = (a.kintsugiRepairs > 0 && b.kintsugiRepairs > 0);
        if (isKintsugiBridge) {
          weight = Math.min(1, weight + 0.2);
        }

        if (weight >= densityThreshold) {
          rawLinks.push({
            source: a.id,
            target: b.id,
            weight,
            sharedMechanisms: shared.length > 0 ? shared : commonWords.slice(0, 2),
            type: isKintsugiBridge ? 'kintsugi_bridge' : shared.length > 0 ? 'mechanic_overlap' : 'thematic',
          });
        }
      }
    }

    // Tally connection degrees
    rawLinks.forEach((link) => {
      const srcId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
      const tgtId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
      if (nodeMap[srcId]) nodeMap[srcId].connectionCount += 1;
      if (nodeMap[tgtId]) nodeMap[tgtId].connectionCount += 1;
    });

    const maxDegree = Math.max(1, ...rawNodes.map((n) => n.connectionCount));
    rawNodes.forEach((n) => {
      n.densityScore = Math.round((n.connectionCount / maxDegree) * 100);
      n.radius = Math.max(22, Math.min(42, 22 + (n.connectionCount * 3.5) + (n.kintsugiRepairs * 2.5)));
    });

    const hubs = [...rawNodes].sort((a, b) => b.connectionCount - a.connectionCount).slice(0, 3);
    const avgDensity = Math.round(rawNodes.reduce((acc, n) => acc + n.densityScore, 0) / Math.max(1, rawNodes.length));

    return {
      nodes: rawNodes,
      links: rawLinks,
      densityStats: { maxDegree, avgDensity, hubs },
    };
  }, [concepts, densityThreshold]);

  // 2. D3 Simulation & Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 560;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    const defs = svg.append('defs');

    // 1. Kintsugi Gold Gradient for Links
    const goldGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-kintsugi-gold-link')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    goldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#BF9A2A');
    goldGrad.append('stop').attr('offset', '50%').attr('stop-color', '#D4AF37');
    goldGrad.append('stop').attr('offset', '100%').attr('stop-color', '#8F6A00');

    // 2. Standard Synaptic Bridge Gradient
    const standardGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-standard-link')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    standardGrad.append('stop').attr('offset', '0%').attr('stop-color', '#DDD7C8').attr('stop-opacity', '0.6');
    standardGrad.append('stop').attr('offset', '100%').attr('stop-color', '#736D6B').attr('stop-opacity', '0.8');

    // 3. Bloom Glow Filter
    const filter = defs
      .append('filter')
      .attr('id', 'd3-gold-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    // 4. Rose Cliff Glow Filter
    const roseFilter = defs
      .append('filter')
      .attr('id', 'd3-rose-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    roseFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    roseFilter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    const g = svg.append('g').attr('class', 'main-graph-group');

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    const simulationNodes: GraphNode[] = nodes.map((d) => ({ ...d }));
    const simulationLinks: GraphLink[] = links.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation<GraphNode>(simulationNodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(simulationLinks)
          .id((d) => d.id)
          .distance((d) => linkDistance / Math.max(0.5, d.weight))
          .strength((d) => d.weight * 0.9)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.8))
      .force(
        'collide',
        d3.forceCollide<GraphNode>().radius((d) => d.radius + 18).iterations(3)
      );

    const linkGroup = g.append('g').attr('class', 'links-layer');

    const link = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(simulationLinks)
      .enter()
      .append('line')
      .attr('stroke', (d) =>
        d.type === 'kintsugi_bridge' ? 'url(#d3-kintsugi-gold-link)' : 'url(#d3-standard-link)'
      )
      .attr('stroke-width', (d) =>
        d.type === 'kintsugi_bridge' ? Math.max(2, d.weight * 4) : Math.max(1, d.weight * 2.5)
      )
      .attr('stroke-opacity', (d) => (d.type === 'kintsugi_bridge' ? 0.9 : 0.5))
      .attr('stroke-dasharray', (d) => (d.type === 'kintsugi_bridge' ? 'none' : '4 3'))
      .attr('filter', (d) => (d.type === 'kintsugi_bridge' ? 'url(#d3-gold-glow)' : 'none'));

    const nodeGroup = g.append('g').attr('class', 'nodes-layer');

    const node = nodeGroup
      .selectAll<SVGGElement, GraphNode>('g')
      .data(simulationNodes)
      .enter()
      .append('g')
      .attr('class', 'node-element cursor-pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
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

    // Outer Glow Rings
    node
      .filter((d) => d.kintsugiRepairs > 0 || d.retention < 0.7)
      .append('circle')
      .attr('r', (d) => d.radius + 6)
      .attr('fill', 'none')
      .attr('stroke', (d) => (d.retention < 0.7 ? '#E2847A' : '#BF9A2A'))
      .attr('stroke-width', (d) => (d.retention < 0.7 ? 2 : 2.5))
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d) => (d.retention < 0.7 ? '4 2' : 'none'))
      .attr('filter', (d) => (d.retention < 0.7 ? 'url(#d3-rose-glow)' : 'url(#d3-gold-glow)'));

    // Main Ceramic Vessel Body Circle
    node
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (d.retention < 0.7) return '#FDF2F0';
        if (d.kintsugiRepairs >= 3) return '#152659';
        if (d.kintsugiRepairs > 0) return '#FAF8F2';
        return '#FFFFFF';
      })
      .attr('stroke', (d) => {
        if (d.retention < 0.7) return '#993B2B';
        if (d.kintsugiRepairs > 0) return '#BF9A2A';
        return '#DDD7C8';
      })
      .attr('stroke-width', (d) => (d.kintsugiRepairs > 0 ? 2.5 : 1.8));

    // Kintsugi Gold Seam paths inside the node circle for repaired concepts
    node
      .filter((d) => d.kintsugiRepairs > 0)
      .append('path')
      .attr('d', (d) => {
        const r = d.radius;
        return `M ${-r * 0.6} ${-r * 0.3} Q 0 0 ${r * 0.2} ${r * 0.4} T ${r * 0.7} ${r * 0.7}`;
      })
      .attr('fill', 'none')
      .attr('stroke', (d) => d.kintsugiRepairs >= 3 ? '#F2E3B6' : '#BF9A2A')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('filter', 'url(#d3-gold-glow)');

    // Node Retention Percentage
    node
      .append('text')
      .text((d) => `${Math.round(d.retention * 100)}%`)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('font-size', (d) => Math.max(10, Math.min(14, d.radius * 0.45)))
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('fill', (d) => {
        if (d.retention < 0.7) return '#993B2B';
        if (d.kintsugiRepairs >= 3) return '#FFFFFF';
        if (d.kintsugiRepairs > 0) return '#8F6A00';
        return '#2B2827';
      });

    // Node Subtitle: Stability (Days)
    node
      .append('text')
      .text((d) => `S: ${d.stability}d`)
      .attr('text-anchor', 'middle')
      .attr('dy', '1.1em')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('fill', (d) => d.kintsugiRepairs >= 3 ? '#CBD5F2' : '#736D6B');

    // Title Label Under Node Bubble
    node
      .append('text')
      .text((d) => (d.title.length > 20 ? d.title.substring(0, 18) + '…' : d.title))
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 15)
      .attr('font-size', '11px')
      .attr('font-family', 'serif')
      .attr('font-weight', '600')
      .attr('fill', '#2B2827')
      .attr('class', 'node-title-label pointer-events-none drop-shadow-sm');

    // Node Interactivity: Click & Hover
    node
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        if (d.kintsugiRepairs > 0) {
          playGoldenKintsugiChime();
        }
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);

        const neighborIds = new Set<string>();
        neighborIds.add(d.id);

        link.each(function (l) {
          const srcId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
          const tgtId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          if (srcId === d.id) neighborIds.add(tgtId);
          if (tgtId === d.id) neighborIds.add(srcId);
        });

        node.transition().duration(200).style('opacity', (n) => (neighborIds.has(n.id) ? 1 : 0.2));
        link
          .transition()
          .duration(200)
          .style('opacity', (l) => {
            const srcId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
            const tgtId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
            return srcId === d.id || tgtId === d.id ? 1 : 0.08;
          })
          .attr('stroke-width', (l) => {
            const srcId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
            const tgtId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
            return srcId === d.id || tgtId === d.id ? 4 : 1;
          });
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        node.transition().duration(200).style('opacity', 1);
        link
          .transition()
          .duration(200)
          .style('opacity', (l) => (l.type === 'kintsugi_bridge' ? 0.9 : 0.5))
          .attr('stroke-width', (d) =>
            d.type === 'kintsugi_bridge' ? Math.max(2, d.weight * 4) : Math.max(1, d.weight * 2.5)
          );
      });

    svg.on('click', () => {
      setSelectedNode(null);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x || 0)
        .attr('y1', (d) => (d.source as GraphNode).y || 0)
        .attr('x2', (d) => (d.target as GraphNode).x || 0)
        .attr('y2', (d) => (d.target as GraphNode).y || 0);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, chargeStrength, linkDistance]);

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div className="space-y-4">
      {/* Top D3 Controls & Network Metrics Bar */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#BF9A2A]/15 border border-[#BF9A2A]/30 flex items-center justify-center text-[#8F6A00]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#8F6A00]" /> D3.js Force-Directed Engine
              </span>
              <span className="text-xs text-[#736D6B] font-mono">
                {nodes.length} Nodes • {links.length} Synaptic Bridges
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-[#2B2827]">
              Synaptic Topology & Connection Density
            </h3>
          </div>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] text-xs font-mono flex items-center gap-2">
            <span className="text-[#736D6B]">Avg Density:</span>
            <span className="text-[#8F6A00] font-bold">{densityStats.avgDensity}%</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] text-xs font-mono flex items-center gap-2">
            <span className="text-[#736D6B]">Max Degree:</span>
            <span className="text-[#8F6A00] font-bold">{densityStats.maxDegree} links</span>
          </div>

          <button
            onClick={handleResetZoom}
            className="px-3 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] text-xs font-mono flex items-center gap-1.5 transition-colors border border-[#DDD7C8] font-medium shadow-sm"
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset View
          </button>
        </div>
      </div>

      {/* Main Interactive Stage & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Canvas Container */}
        <div
          ref={containerRef}
          className="lg:col-span-3 bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-2 relative overflow-hidden shadow-sm min-h-[560px]"
        >
          {/* D3 SVG Element */}
          <svg ref={svgRef} className="w-full h-full block relative z-10" />

          {/* Floating Canvas Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#DDD7C8] rounded-xl p-3 text-[11px] space-y-1.5 shadow-md">
            <div className="font-mono uppercase text-[10px] text-[#736D6B] font-bold tracking-wider">
              Topology Map Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FAF8F2] border-2 border-[#BF9A2A] inline-block" />
              <span className="text-[#5A5553]">Kintsugi Mended Node (Gold)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FDF2F0] border border-[#993B2B] inline-block" />
              <span className="text-[#5A5553]">Forgetting Cliff (&lt;70% Recall)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-gradient-to-r from-[#BF9A2A] to-[#8F6A00] inline-block" />
              <span className="text-[#5A5553]">Dual-Kintsugi Lacquer Bridge</span>
            </div>
            <div className="text-[10px] text-[#736D6B] italic pt-1">
              • Drag nodes to pin physics • Scroll to Zoom & Pan
            </div>
          </div>

          {/* Interactive Dynamic Physics Sliders floating top-right */}
          <div className="absolute top-4 right-4 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#DDD7C8] rounded-xl p-3 text-xs space-y-2.5 shadow-md max-w-[210px]">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#736D6B]">
              <span className="flex items-center gap-1 font-medium">
                <Filter className="w-3 h-3 text-[#8F6A00]" /> Affinity Threshold
              </span>
              <span className="text-[#8F6A00] font-bold">{Math.round(densityThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.05"
              value={densityThreshold}
              onChange={(e) => setDensityThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#FAF8F2] rounded-lg appearance-none cursor-pointer accent-[#8F6A00]"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-[#736D6B] pt-1">
              <span className="font-medium">Repulsion Force</span>
              <span className="text-[#2B2827] font-bold">{Math.abs(chargeStrength)}</span>
            </div>
            <input
              type="range"
              min="-600"
              max="-120"
              step="30"
              value={chargeStrength}
              onChange={(e) => setChargeStrength(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#FAF8F2] rounded-lg appearance-none cursor-pointer accent-[#8F6A00]"
            />
          </div>
        </div>

        {/* Right Details Panel: Selected Node Inspector & Central Hubs */}
        <div className="space-y-4">
          {/* Selected or Hovered Concept Inspector Card */}
          {selectedNode || hoveredNode ? (
            (() => {
              const active = selectedNode || hoveredNode!;
              const connectedLinks = links.filter((l) => {
                const srcId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
                const tgtId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
                return srcId === active.id || tgtId === active.id;
              });

              return (
                <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-5 shadow-md space-y-4 relative overflow-hidden ring-1 ring-[#BF9A2A]/30">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FAF8F2] text-[#5A5553] border border-[#DDD7C8] font-medium">
                        {active.subject}
                      </span>
                      {active.kintsugiRepairs > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#BF9A2A]/15 text-[#8F6A00] border border-[#BF9A2A]/30 flex items-center gap-1 font-bold">
                          <Sparkles className="w-3 h-3 text-[#8F6A00]" /> {active.kintsugiRepairs}x Kintsugi
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-serif font-bold text-[#2B2827] leading-snug">
                      {active.title}
                    </h4>
                    <p className="text-xs text-[#5A5553] leading-relaxed">
                      {active.concept.summary}
                    </p>
                  </div>

                  {/* FSRS Telemetry Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-[#FAF8F2] p-2.5 rounded-xl border border-[#DDD7C8] text-center font-mono">
                    <div>
                      <div className="text-sm font-bold text-[#8F6A00]">
                        {Math.round(active.retention * 100)}%
                      </div>
                      <div className="text-[9px] text-[#736D6B] uppercase font-medium">Retention</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#2B2827]">{active.stability}d</div>
                      <div className="text-[9px] text-[#736D6B] uppercase font-medium">Stability</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#8F6A00]">{active.densityScore}%</div>
                      <div className="text-[9px] text-[#736D6B] uppercase font-medium">Density</div>
                    </div>
                  </div>

                  {/* Connected Synaptic Neighbors */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-[#736D6B] flex items-center justify-between font-semibold">
                      <span>Thematic Neighbors ({connectedLinks.length})</span>
                      <span className="text-[#8F6A00]">Top Synapses</span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {connectedLinks.map((l, i) => {
                        const otherNodeId =
                          (typeof l.source === 'string' ? l.source : (l.source as GraphNode).id) === active.id
                            ? (typeof l.target === 'string' ? l.target : (l.target as GraphNode).id)
                            : (typeof l.source === 'string' ? l.source : (l.source as GraphNode).id);
                        const otherNode = nodes.find((n) => n.id === otherNodeId);

                        return (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-[#FAF8F2] border border-[#DDD7C8] flex items-center justify-between text-xs hover:border-[#BF9A2A]/50 transition-colors gap-2"
                          >
                            <span className="text-[#2B2827] truncate min-w-0 flex-1 font-serif">
                              {otherNode?.title}
                            </span>
                            <span className="text-[10px] font-mono text-[#8F6A00] font-bold shrink-0 whitespace-nowrap">
                              {Math.round(l.weight * 100)}% match
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions: Start Socratic Review / Inspect Oracle */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => onSelectConcept(active.concept)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#BF9A2A]" /> Mend Concept (Active Recall)
                    </button>
                    <button
                      onClick={() => onInspectOracle(active.concept)}
                      className="w-full py-2 px-3 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border border-[#DDD7C8] font-medium shadow-sm whitespace-nowrap"
                    >
                      Inspect Decay Curve →
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-5 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#BF9A2A]/15 border border-[#BF9A2A]/30 flex items-center justify-center text-[#8F6A00] mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-serif font-bold text-[#2B2827]">
                Interactive Force Explorer
              </h4>
              <p className="text-xs text-[#5A5553] leading-relaxed">
                Click any vessel node to inspect its thematic affinities, failure invariants, and repair status.
              </p>
            </div>
          )}

          {/* Top Network Centrality Hubs Card */}
          <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono text-[#736D6B] uppercase tracking-wider font-semibold">
              <Layers className="w-3.5 h-3.5 text-[#8F6A00]" />
              <span className="whitespace-nowrap">Highest Connection Density</span>
            </div>
            <div className="space-y-2">
              {densityStats.hubs.map((hub, idx) => (
                <div
                  key={hub.id}
                  onClick={() => setSelectedNode(hub)}
                  className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] hover:border-[#BF9A2A] cursor-pointer transition-all flex items-center justify-between gap-2 shadow-sm"
                >
                  <div className="space-y-0.5 truncate min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-mono text-[#8F6A00] font-bold shrink-0 whitespace-nowrap">#{idx + 1}</span>
                      <span className="text-xs font-serif font-bold text-[#2B2827] truncate min-w-0 flex-1">
                        {hub.title}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[#736D6B] truncate">
                      {hub.connectionCount} connections • S: {hub.stability}d
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#8F6A00] whitespace-nowrap">
                      {hub.densityScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
