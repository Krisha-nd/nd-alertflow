import React, { useEffect, useState } from "react";
import {
  useNodesState,
  useEdgesState,
  ReactFlow,
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import alertData from "../data/alert.json";
import DetailPanel from "./DetailPanel";
import "../styles/AlertFlow.css";

const NODE_WIDTH = 200;
const VERTICAL_SPACING = 100;
const HORIZONTAL_OFFSET = 250;
const START_X = 300;

const AlertFlow = ({ selectedAlertId }) => {
  const alert = alertData.alerts.find((a) => a.id === selectedAlertId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState(new Set());
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);

  const findDownstream = (startNodeId, allEdges) => {
    const downstreamNodes = new Set();
    const downstreamEdges = new Set();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const current = queue.shift();
      allEdges.forEach((edge) => {
        if (edge.source === current) {
          downstreamEdges.add(edge.id);
          if (!downstreamNodes.has(edge.target)) {
            downstreamNodes.add(edge.target);
            queue.push(edge.target);
          }
        }
      });
    }
    return { downstreamNodes, downstreamEdges };
  };

  useEffect(() => {
    if (!alert) {
      resetFlow();
      return;
    }

    const flow = alert.flow;
    const nodeMap = Object.fromEntries(flow.map((n) => [n.nodeNumber, n]));
    const newNodes = [];
    const newEdges = [];
    let yCounter = 0;

    const addNode = (step, x, y, customColor = null) => {
      const isHighlighted = highlightedNodeIds.has(step.nodeNumber);
      const topColor = getNodeColor(step.node, customColor, isHighlighted);

      const label = createNodeLabel(step, topColor, isHighlighted);
      newNodes.push({
        id: step.nodeNumber,
        data: { label },
        position: { x, y },
        style: {
          width: isHighlighted ? NODE_WIDTH * 1.2 : NODE_WIDTH,
          backgroundColor: "#F2EFE5",
          borderRadius: 12,
          border: `3px solid ${isHighlighted ? "#555555" : "#999999"}`,
          userSelect: "none",
          padding: "0px",
          transition: "all 0.3s ease",
          boxSizing: "border-box",
          overflow: "hidden",
        },
        draggable: false,
        connectable: false,
      });
    };

    const createEdge = (id, source, target, label = null) => ({
      id,
      source,
      target,
      type: "step",
      animated: highlightedEdgeIds.has(id),
      markerEnd: {
        type: "arrowclosed",
        color: highlightedEdgeIds.has(id) ? "#555555" : "#999999",
      },
      label,
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: "#fff", color: "#000", fontSize: 18 },
      style: {
        strokeWidth: highlightedEdgeIds.has(id) ? 4 : 2,
        stroke: highlightedEdgeIds.has(id) ? "#555555" : "#999999",
        filter: highlightedEdgeIds.has(id)
          ? "drop-shadow(0 0 4px #555555)"
          : "none",
      },
    });

    const buildLinearStartNodes = () => {
      for (let i = 1; i <= 4; i++) {
        const step = nodeMap[i.toString()];
        if (!step) continue;
        const y = yCounter * (70 + VERTICAL_SPACING);
        addNode(step, START_X, y);
        if (i > 1) {
          const prev = nodeMap[(i - 1).toString()];
          if (prev)
            newEdges.push(
              createEdge(`e${prev.nodeNumber}-${step.nodeNumber}`, prev.nodeNumber, step.nodeNumber)
            );
        }
        yCounter++;
      }
    };

    const buildLinearEndNodes = () => {
      const endNodes = ["10", "11"];
      endNodes.forEach((nodeNum) => {
        const node = nodeMap[nodeNum];
        if (node) {
          const y = yCounter * (70 + VERTICAL_SPACING);
          addNode(node, START_X, y);
          if (nodeNum === "10")
            newEdges.push(createEdge("e9-10", "9", "10"));
          if (nodeNum === "11")
            newEdges.push(createEdge("e10-11", "10", "11"));
          yCounter++;
        }
      });

      const q121 = nodeMap["12.1"];
      const q122 = nodeMap["12.2"];
      if (q121 && q122) {
        const y12 = yCounter * (70 + VERTICAL_SPACING);
        addNode(q121, START_X - HORIZONTAL_OFFSET, y12);
        addNode(q122, START_X + HORIZONTAL_OFFSET, y12);
        newEdges.push(createEdge("e11-12.1", "11", "12.1"));
        newEdges.push(createEdge("e11-12.2", "11", "12.2"));

        const node12_3 = {
          nodeNumber: "12.3",
          node: "Queue",
          name: "video-request-queue-production",
          uploadToService: "tc-videorequest",
        };
        const y12_3 = yCounter * (70 + VERTICAL_SPACING);
        addNode(node12_3, START_X, y12_3);
        newEdges.push(createEdge("e11-12.3", "11", "12.3"));

        const notif131 = nodeMap["13.1"];
        const notif132 = nodeMap["13.2"];
        const y13 = (yCounter + 1) * (70 + VERTICAL_SPACING);
        addNode(notif131, START_X - HORIZONTAL_OFFSET, y13);
        addNode(notif132, START_X + HORIZONTAL_OFFSET, y13);
        newEdges.push(createEdge("e12.1-13.1", "12.1", "13.1"));
        newEdges.push(createEdge("e12.2-13.2", "12.2", "13.2"));

        const node13_3 = {
          nodeNumber: "13.3",
          node: "Backend Service III",
          name: "tc-videorequest",
        };
        const y13_3 = (yCounter + 1) * (70 + VERTICAL_SPACING);
        addNode(node13_3, START_X, y13_3, "#f8b878");
        newEdges.push(createEdge("e12.3-13.3", "12.3", "13.3"));

        const sesNode = { nodeNumber: "14.1", node: "SES", name: "" };
        const ySes = (yCounter + 2) * (70 + VERTICAL_SPACING);
        addNode(sesNode, START_X - HORIZONTAL_OFFSET, ySes, "#C4E0C4");
        newEdges.push(createEdge("e13.1-14.1", "13.1", "14.1"));

        const webhookNode = { nodeNumber: "14.2", node: "Webhook", name: "" };
        const yWebhook = (yCounter + 2) * (70 + VERTICAL_SPACING);
        addNode(webhookNode, START_X + HORIZONTAL_OFFSET, yWebhook, "#C4E0C4");
        newEdges.push(createEdge("e13.2-14.2", "13.2", "14.2"));
      }
    };

    buildLinearStartNodes();

    const branchNodes = flow.filter(
      (n) => n.nodeNumber.startsWith("5.") || n.nodeNumber === "5"
    );

    if (branchNodes.length === 0) {
      // No branches scenario
      for (let i = 5; i <= 8; i++) {
        const step = nodeMap[i.toString()];
        if (!step) continue;
        const y = yCounter * (70 + VERTICAL_SPACING);
        addNode(step, START_X, y);
        const prev = nodeMap[(i - 1).toString()];
        if (prev)
          newEdges.push(
            createEdge(`e${prev.nodeNumber}-${step.nodeNumber}`, prev.nodeNumber, step.nodeNumber)
          );
        yCounter++;
      }
      // Insert internal ALB as node 8.5 after 8
      const internalAlbNode = {
        nodeNumber: "8.5",
        node: "Internal-ALB",
        name: "nd-production-internal-alb",
      };
      const y8_5 = yCounter * (70 + VERTICAL_SPACING);
      addNode(internalAlbNode, START_X, y8_5, "#99ccff");
      newEdges.push(createEdge("e8-8.5", "8", "8.5"));
      yCounter++;

      // Then connect node 8.5 to 9
      const node9 = nodeMap["9"];
      if (node9) {
        const y9 = yCounter * (70 + VERTICAL_SPACING);
        addNode(node9, START_X, y9);
        newEdges.push(createEdge("e8.5-9", "8.5", "9"));
        yCounter++;
      }
    } else {
      // Branch nodes scenario
      const branches = branchNodes
        .map((n) => n.nodeNumber)
        .sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true })
        );

      const branchCount = branches.length;
      const totalBranchWidth = (branchCount - 1) * HORIZONTAL_OFFSET * 1.5;
      const startXOffset = START_X - totalBranchWidth / 2;

      branches.forEach((branchNodeNumber, index) => {
        const step = nodeMap[branchNodeNumber];
        if (!step) return;
        const x = startXOffset + index * HORIZONTAL_OFFSET * 1.5;
        const y = yCounter * (70 + VERTICAL_SPACING);
        addNode(step, x, y);

        let label = null;
        if (
          [1, 9, 42].includes(Number(alert.id)) &&
          step?.name?.includes("lla-queue-production")
        ) {
          label = "is LLA enabled : True";
        }

        newEdges.push(createEdge(`e4-${branchNodeNumber}`, "4", branchNodeNumber, label));
      });

      const levels = ["6", "7", "8"];
      levels.forEach((level, levelIdx) => {
        branches.forEach((branchNodeNumber, index) => {
          const nextNodeNumber = branchNodeNumber.replace(/^5/, level);
          const step = nodeMap[nextNodeNumber];
          if (!step) return;
          const x = startXOffset + index * HORIZONTAL_OFFSET * 1.5;
          const y = (yCounter + 1 + levelIdx) * (70 + VERTICAL_SPACING);
          addNode(step, x, y);
          const fromNodeNumber = branchNodeNumber.replace(/^5/, (parseInt(level) - 1).toString());
          newEdges.push(createEdge(`e${fromNodeNumber}-${nextNodeNumber}`, fromNodeNumber, nextNodeNumber));
        });
      });

      // Add internal ALB as node 8.5 below node 8 branches
      const y8_5 = (yCounter + 4) * (70 + VERTICAL_SPACING);
      addNode(
        {
          nodeNumber: "8.5",
          node: "Internal-ALB",
          name: "nd-production-internal-alb",
        },
        START_X,
        y8_5,
        "#99ccff"
      );

      // Connect each branch 8.x (where level is 8) to 8.5
      branches.forEach((branchNodeNumber) => {
        const lastBranchNode = branchNodeNumber.replace(/^5/, "8");
        newEdges.push(createEdge(`e${lastBranchNode}-8.5`, lastBranchNode, "8.5"));
      });

      // Connect node 8.5 to node 9
      const backend9 = nodeMap["9"];
      if (backend9) {
        const y9 = (yCounter + 5) * (70 + VERTICAL_SPACING);
        addNode(backend9, START_X, y9);
        newEdges.push(createEdge("e8.5-9", "8.5", "9"));
      }

      yCounter += 6;
    }

    buildLinearEndNodes();

    setNodes(newNodes);
    setEdges(newEdges);
  }, [alert, highlightedNodeIds, highlightedEdgeIds]);

  const onEdgeClick = (_, edge) => {
    if (!edges.length) return;
    const { downstreamNodes, downstreamEdges } = findDownstream(edge.source, edges);
    setHighlightedNodeIds(downstreamNodes);
    setHighlightedEdgeIds(downstreamEdges);
  };

  const onPaneClick = () => {
    setHighlightedNodeIds(new Set());
    setHighlightedEdgeIds(new Set());
    setSelectedNode(null);
  };

  const handleNodeClick = (_, node) => {
    const nodeData = alert.flow.find((n) => n.nodeNumber === node.id);
    if (!nodeData) {
      console.log("Node data not found for:", node.id);
      setSelectedNode(null);
      return;
    }

    const showDetail = [
      "Frontend Service",
      "Ingestion",
      "Analytics",
      "Backend Service 1",
      "Backend Service II",
      "Notification Service",
      "Backend Service III",
    ];

    if (showDetail.includes(nodeData.node)) {
      setSelectedNode(nodeData);
    } else {
      setSelectedNode(null);
    }
  };

  const resetFlow = () => {
    setNodes([]);
    setEdges([]);
    setHighlightedNodeIds(new Set());
    setHighlightedEdgeIds(new Set());
    setSelectedNode(null);
  };

  const getNodeColor = (nodeType, customColor, isHighlighted) => {
    if (customColor) return customColor;

    const colors = {
      "Alert Name": "#ff9999",
      ALB: "#99ccff",
      Source: "#d1e189",
      Queue: "#ffc0cb",
      "Frontend Service": "#f8b878",
      Ingestion: "#f8b878",
      Analytics: "#f8b878",
      "Backend Service 1": "#f8b878",
      "Backend Service II": "#f8b878",
      "Notification Service": "#f8b878",
    };

    return colors[nodeType] || "#D3D3D3";
  };

  const createNodeLabel = (step, topColor, isHighlighted) => {
    return (
      <div
        className="node-box"
        style={{
          borderColor: isHighlighted ? "#555555" : "#999999",
          boxShadow: isHighlighted ? "0 0 12px 3px rgba(85, 85, 85, 0.8)" : "none",
          transform: isHighlighted ? "scale(1.1)" : "scale(1)",
          animation: isHighlighted ? "pulseGlowGray 2s infinite" : "none",
          userSelect: "none",
        }}
        title={step.name || ""}
      >
        <div
          className="node-top"
          style={{
            backgroundColor: topColor,
            borderBottom: "1px solid #999",
            padding: "4px",
            fontWeight: "bold",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            color: "#000",
          }}
        >
          {step.node}
        </div>
        <div className="node-bottom" style={{ padding: "4px" }}>
          {step.name}
        </div>
      </div>
    );
  };

  return (
    <div className="alert-flow-container" style={{ height: "700px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.5}
        maxZoom={2}
        panOnScroll
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
      <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
};

export default AlertFlow;

