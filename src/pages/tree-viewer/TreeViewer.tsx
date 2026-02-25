import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Node as RFNode, type Edge as RFEdge, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTreesStore } from '../../shared/store/treesStore';
import { usePersonsStore } from '../../shared/store/personsStore';
import { usePartnersStore } from '../../shared/store/partnersStore';
import { buildGraphElements, nodeTypes } from '../tree-editor/TreeEditor';

export default function TreeViewer() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();

  const tree = useTreesStore((s) => s.selectedTree);
  const getTreeById = useTreesStore((s) => s.getTreeById);

  const persons = usePersonsStore((s) => s.persons);
  const getAllPersons = usePersonsStore((s) => s.getAllPersons);
  const setSelectedPerson = usePersonsStore((s) => s.setSelected);

  const partners = usePartnersStore((s) => s.partners);
  const getPartnersFor = usePartnersStore((s) => s.getAllPartners);

  useEffect(() => {
    if (treeId) {
      getTreeById(treeId);
      getAllPersons(treeId);
    }
  }, [treeId, getTreeById, getAllPersons]);

  useEffect(() => {
    // fetch partners for each person when list changes
    persons.forEach((p) => getPartnersFor(p.id));
  }, [persons, getPartnersFor]);

  // build react-flow graph when persons/partners change
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraphElements(
      persons,
      partners,
      null,
      (p) => {
        setSelectedPerson(p);
        navigate(`/tree-editor/${treeId}`);
      },
    );
    // cast results to RFNode/RFEdge generics
    setNodes(n as RFNode[]);
    setEdges(e as RFEdge[]);
    setNodes(n);
    setEdges(e);
  }, [persons, partners, navigate, treeId, setSelectedPerson]);

  const onConnect = (connection: Connection) => setEdges((eds) => addEdge(connection, eds));

  return (
    <div className="w-full h-screen bg-[#111318] flex flex-col">
      <div className="bg-[#1a1d24] border-b border-[#207d98]/20 p-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#2bacc8] hover:text-[#207d98] transition-colors"
        >
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2bacc8] mt-3">{tree?.name || 'Árbol genealógico'}</h2>
          {treeId && (
            <button
              onClick={() => navigate(`/tree-editor/${treeId}`)}
              className="px-3 py-1 bg-[#2bacc8] hover:bg-[#207d98] text-[#111318] rounded transition-colors text-sm"
            >
              Editar árbol
            </button>
          )}
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
    </div>
  );
}
