import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTreesStore } from '../../shared/store/treesStore';

export default function CreateTree() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createTree = useTreesStore((s) => s.createTree);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const tree = await createTree({ name, description: description || undefined });
      navigate(`/tree-editor/${tree.id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <main className="min-h-screen bg-[#111318] text-white flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-[#1a1d24] rounded-2xl border border-[#207d98]/20">
        <h1 className="text-2xl font-bold text-[#2bacc8] mb-4">Crear nuevo árbol</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            Nombre
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 p-2 rounded bg-[#111318] border border-[#207d98]/20"
            />
          </label>
          <label className="flex flex-col text-sm">
            Descripción (opcional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 p-2 rounded bg-[#111318] border border-[#207d98]/20"
            />
          </label>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2bacc8] hover:bg-[#207d98] text-[#111318] font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Crear árbol
          </button>
        </form>
      </div>
    </main>
  );
}
