import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { ExtensionQR } from '../../shared/components/ExtesionQr';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Node as RFNode, type Edge as RFEdge, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTreesStore } from '../../shared/store/treesStore';
import { usePersonsStore } from '../../shared/store/personsStore';
import { buildGraphElements, nodeTypes } from '../tree-editor/TreeEditor';

export default function TreeViewer() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);

  const tree = useTreesStore((s) => s.selectedTree);
  const getTreeById = useTreesStore((s) => s.getTreeById);

  const persons = usePersonsStore((s) => s.persons);
  const getAllPersons = usePersonsStore((s) => s.getAllPersons);
  const setSelectedPerson = usePersonsStore((s) => s.setSelected);

  useEffect(() => {
    if (treeId) {
      getTreeById(treeId);
      getAllPersons(treeId);
    }
  }, [treeId, getTreeById, getAllPersons]);

  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraphElements(
      persons,
      null,
      (p) => {
        setSelectedPerson(p);
      },
    );
    // cast results to RFNode/RFEdge generics
    setNodes(n as RFNode[]);
    setEdges(e as RFEdge[]);
  }, [persons, navigate, treeId, setSelectedPerson]);

  const onConnect = (connection: Connection) => setEdges((eds) => addEdge(connection, eds));

  return (
    <div className="w-full h-screen bg-[#111318] flex flex-col">
      <div className="bg-[#1a1d24] border-b border-white/5 p-3 md:p-4">

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg md:text-2xl font-bold text-white mt-1 md:mt-3 truncate min-w-0">
            {tree?.name || 'Árbol genealógico'}
          </h2>
          <div className="flex gap-2 shrink-0">
            {treeId && (
              <button
                onClick={() => setShowQRModal(true)}
                className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 rounded-xl transition-all text-sm flex items-center gap-2"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Extender</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.04)" />
          <Controls
            style={{
              background: 'rgba(15,17,23,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
            }}
          />
        </ReactFlow>
      </div>
      {showQRModal && treeId && (
        <ExtensionQR treeId={treeId} onClose={() => setShowQRModal(false)} />
      )}
    </div>
  );
}