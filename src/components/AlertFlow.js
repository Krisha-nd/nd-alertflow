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
    downstreamNodes.add(startNodeId);

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
      setNodes([]);
      setEdges([]);
      setHighlightedNodeIds(new Set());
      setHighlightedEdgeIds(new Set());
      setSelectedNode(null);
      return;
    }

    const flow = alert.flow;
    const nodeMap = Object.fromEntries(flow.map((n) => [n.nodeNumber, n]));

    const newNodes = [];
    const newEdges = [];
    let yCounter = 0;

    const addNode = (step, x, y, customColor = null) => {
      const isHighlighted = highlightedNodeIds.has(step.nodeNumber);

      let topColor = "#D3D3D3";
      const greenTypes = ["Source"];
      const pinkTypes = ["Queue"];
      const orangeTypes = [
        "Frontend Service",
        "Ingestion",
        "Analytics",
        "Backend Service 1",
        "Backend Service II",
        "Notification Service",
      ];

      if (step.node === "Alert Name") topColor = "#ff9999";
      else if (step.node === "ALB") topColor = "#99ccff";
      else if (greenTypes.includes(step.node)) topColor = "#d1e189";
      else if (pinkTypes.includes(step.node)) topColor = "#ffc0cb";
      else if (orangeTypes.includes(step.node)) topColor = "#f8b878";

      if (customColor) {
        topColor = customColor;
      }

      const label = step.node === "Internal-ALB" ? (
        <div
          className="node-box"
          style={{
            borderColor: isHighlighted ? "#555555" : "#999999",
            boxShadow: isHighlighted
              ? "0 0 12px 3px rgba(85, 85, 85, 0.8)"
              : "none",
            transform: isHighlighted ? "scale(1.1)" : "scale(1)",
            animation: isHighlighted ? "pulseGlowGray 2s infinite" : "none",
            userSelect: "none",
          }}
          title={step.name || "nd-production-internal-alb"}
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
            Internal-ALB
          </div>
          <div className="node-bottom" style={{ padding: "4px" }}>
            nd-production-internal-alb
          </div>
        </div>
      ) : step.node === "SES" || step.node === "Webhook" ? (
        <div
          className="node-box"
          style={{
            borderColor: isHighlighted ? "#555555" : "#999999",
            boxShadow: isHighlighted
              ? "0 0 12px 3px rgba(85, 85, 85, 0.8)"
              : "none",
            transform: isHighlighted ? "scale(1.1)" : "scale(1)",
            animation: isHighlighted ? "pulseGlowGray 2s infinite" : "none",
            backgroundColor: topColor,
            borderRadius: 12,
            padding: "12px 0",
            color: "#000",
            fontWeight: "bold",
            textAlign: "center",
            userSelect: "none",
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={step.name || ""}
        >
          {step.node}
        </div>
      ) : (
        <div
          className="node-box"
          style={{
            borderColor: isHighlighted ? "#555555" : "#999999",
            boxShadow: isHighlighted
              ? "0 0 12px 3px rgba(85, 85, 85, 0.8)"
              : "none",
            transform: isHighlighted ? "scale(1.1)" : "scale(1)",
            animation: isHighlighted ? "pulseGlowGray 2s infinite" : "none",
            userSelect: "none",
          }}
          title={step.name}
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

    const createEdge = (id, source, target, label = null) => {
      const isHighlighted = highlightedEdgeIds.has(id);
      return {
        id,
        source,
        target,
        type: "step",
        animated: isHighlighted,
        markerEnd: {
          type: "arrowclosed",
          color: isHighlighted ? "#555555" : "#999999",
        },
        label,
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: "#fff", color: "#000", fontSize: 18 },
        style: {
          strokeWidth: isHighlighted ? 4 : 2,
          stroke: isHighlighted ? "#555555" : "#999999",
          filter: isHighlighted ? "drop-shadow(0 0 4px #555555)" : "none",
        },
      };
    };

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
              createEdge(
                `e${prev.nodeNumber}-${step.nodeNumber}`,
                prev.nodeNumber,
                step.nodeNumber
              )
            );
        }
        yCounter++;
      }
    };

    const buildLinearEndNodes = () => {
      const node10 = nodeMap["10"];
      if (node10) {
        const y10 = yCounter * (70 + VERTICAL_SPACING);
        addNode(node10, START_X, y10);
        newEdges.push(createEdge("e9.5-10", "9.5", "10"));
        yCounter++;
      }

      const node11 = nodeMap["11"];
      if (node11) {
        const y11 = yCounter * (70 + VERTICAL_SPACING);
        addNode(node11, START_X, y11);
        newEdges.push(createEdge("e10-11", "10", "11"));
        yCounter++;
      }

      const q121 = nodeMap["12.1"];
      const q122 = nodeMap["12.2"];
      if (q121 && q122) {
        const y12 = yCounter * (70 + VERTICAL_SPACING);
        addNode(q121, START_X - HORIZONTAL_OFFSET, y12);
        addNode(q122, START_X + HORIZONTAL_OFFSET, y12);
        newEdges.push(
          createEdge("e11-12.1", "11", "12.1"),
          createEdge("e11-12.2", "11", "12.2")
        );

        const notif131 = nodeMap["13.1"];
        const notif132 = nodeMap["13.2"];
        const y13 = (yCounter + 1) * (70 + VERTICAL_SPACING);
        addNode(notif131, START_X - HORIZONTAL_OFFSET, y13);
        addNode(notif132, START_X + HORIZONTAL_OFFSET, y13);
        newEdges.push(
          createEdge("e12.1-13.1", "12.1", "13.1"),
          createEdge("e12.2-13.2", "12.2", "13.2")
        );

        // Add SES node after 13.1
        const sesNode = { nodeNumber: "14.1", node: "SES", name: "" };
        const ySes = (yCounter + 2) * (70 + VERTICAL_SPACING);
        addNode(sesNode, START_X - HORIZONTAL_OFFSET, ySes, "#C4E0C4"); // Custom color if desired
        newEdges.push(createEdge("e13.1-14.1", "13.1", "14.1"));

        // Add Webhook node after 13.2
        const webhookNode = { nodeNumber: "14.2", node: "Webhook", name: "" };
        const yWebhook = (yCounter + 2) * (70 + VERTICAL_SPACING);
        addNode(webhookNode, START_X + HORIZONTAL_OFFSET, yWebhook, "#A9D0A9"); // Custom color if desired
        newEdges.push(createEdge("e13.2-14.2", "13.2", "14.2"));
      }
    };

    buildLinearStartNodes();

    const branchNodes = flow.filter((n) =>
      n.nodeNumber.startsWith("5.") || n.nodeNumber === "5"
    );

    if (branchNodes.length === 0) {
      for (let i = 5; i <= 8; i++) {
        const step = nodeMap[i.toString()];
        if (!step) continue;
        const y = yCounter * (70 + VERTICAL_SPACING);
        addNode(step, START_X, y);
        const prev = nodeMap[(i - 1).toString()];
        if (prev)
          newEdges.push(
            createEdge(
              `e${prev.nodeNumber}-${step.nodeNumber}`,
              prev.nodeNumber,
              step.nodeNumber
            )
          );
        yCounter++;
      }

      const internalAlbNode = {
        nodeNumber: "9.5",
        node: "Internal-ALB",
        name: "nd-production-internal-alb",
      };
      const yInternalAlb = yCounter * (70 + VERTICAL_SPACING);
      addNode(internalAlbNode, START_X, yInternalAlb, "#99ccff");
      newEdges.push(createEdge("e8-9.5", "8", "9.5"));
      yCounter++;

      const node9 = nodeMap["9"];
      if (node9) {
        const y9 = yCounter * (70 + VERTICAL_SPACING);
        addNode(node9, START_X, y9);
        newEdges.push(createEdge("e9.5-9", "9.5", "9"));
        yCounter++;
      }
    } else {
      const branches = branchNodes
        .map((n) => n.nodeNumber)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

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

        newEdges.push(
          createEdge(`e4-${branchNodeNumber}`, "4", branchNodeNumber, label)
        );
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
          const fromNodeNumber = branchNodeNumber.replace(
            /^5/,
            (parseInt(level) - 1).toString()
          );
          newEdges.push(
            createEdge(
              `e${fromNodeNumber}-${nextNodeNumber}`,
              fromNodeNumber,
              nextNodeNumber
            )
          );
        });
      });

      const internalAlbNode = {
        nodeNumber: "9.5",
        node: "Internal-ALB",
        name: "nd-production-internal-alb",
      };
      const yInternalAlb = (yCounter + 4) * (70 + VERTICAL_SPACING);
      addNode(internalAlbNode, START_X, yInternalAlb, "#99ccff");
      branches.forEach((branchNodeNumber) => {
        const lastBranchNode = branchNodeNumber.replace(/^5/, "8");
        newEdges.push(createEdge(`e${lastBranchNode}-9.5`, lastBranchNode, "9.5"));
      });

      const backend9 = nodeMap["9"];
      if (backend9) {
        const y = (yCounter + 5) * (70 + VERTICAL_SPACING);
        addNode(backend9, START_X, y);
        newEdges.push(createEdge("e9.5-9", "9.5", "9"));
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
    if (!nodeData) return;
    const showDetail = [
      "Frontend Service",
      "Ingestion",
      "Analytics",
      "Backend Service 1",
      "Backend Service II",
      "Notification Service",
    ];
    if (showDetail.includes(nodeData.node)) {
      setSelectedNode(nodeData);
    } else {
      setSelectedNode(null);
    }
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
