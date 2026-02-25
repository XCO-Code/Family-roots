import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FamilyTree from '@balkangraph/familytree.js';
import { useTreesStore } from '../../shared/store/treesStore';

export default function TreeViewer() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const tree = useTreesStore((s) => s.selectedTree);
  const getTreeById = useTreesStore((s) => s.getTreeById);

  useEffect(() => {
    if (treeId) {
      getTreeById(treeId);
    }
  }, [treeId, getTreeById]);

  useEffect(() => {
    if (containerRef.current && tree) {
      new FamilyTree(containerRef.current, {
        template: 'default',
        nodeBinding: {
          field_0: 'name',
          field_1: 'title',
          field_2: 'phone',
          field_3: 'email',
          img_0: 'photo',
        },
        nodes: [],
      });

      // TODO: Load actual tree data
    }
  }, [tree]);

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
        <h2 className="text-2xl font-bold text-[#2bacc8] mt-3">{tree?.name || 'Árbol genealógico'}</h2>
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
