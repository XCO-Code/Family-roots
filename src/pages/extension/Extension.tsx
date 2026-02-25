import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';

export default function Extension() {
  const navigate = useNavigate();
  const [treeId, setTreeId] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to extension store/service
    console.log('Requesting access to tree:', { treeId, name, bio });
    alert('Solicitud enviada al administrador del árbol');
    setTreeId('');
    setName('');
    setBio('');
  };

  return (
    <main className="min-h-screen bg-[#111318] flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-2xl bg-[#1a1d24] border border-[#207d98]/20 rounded-2xl p-9">

        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#2bacc8] hover:text-[#207d98] transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-[#2bacc8] mb-2">Solicitar acceso a un árbol</h1>
        <p className="text-[#207d98] mb-8">Completa este formulario para solicitar acceso a un árbol genealógico existente</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#207d98] uppercase tracking-wider">
              ID del árbol genealógico
            </label>
            <input
              type="text"
              placeholder="Ej: tree-123456"
              value={treeId}
              onChange={e => setTreeId(e.target.value)}
              required
              className="px-3 py-2.5 rounded-lg text-sm bg-[#111318] border border-[#207d98]/30 text-[#2bacc8] placeholder-[#15516a] focus:outline-none focus:border-[#2bacc8] focus:ring-1 focus:ring-[#2bacc8]/20 transition-all"
            />
            <p className="text-xs text-[#207d98]">Solicita este ID al administrador del árbol</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#207d98] uppercase tracking-wider">
              Tu nombre completo
            </label>
            <input
              type="text"
              placeholder="Juan Pérez García"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="px-3 py-2.5 rounded-lg text-sm bg-[#111318] border border-[#207d98]/30 text-[#2bacc8] placeholder-[#15516a] focus:outline-none focus:border-[#2bacc8] focus:ring-1 focus:ring-[#2bacc8]/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#207d98] uppercase tracking-wider">
              Relación familiar (opcional)
            </label>
            <textarea
              placeholder="Ej: Soy el hijo de María García, bisnieto de..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              className="px-3 py-2.5 rounded-lg text-sm bg-[#111318] border border-[#207d98]/30 text-[#2bacc8] placeholder-[#15516a] focus:outline-none focus:border-[#2bacc8] focus:ring-1 focus:ring-[#2bacc8]/20 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#2bacc8] hover:bg-[#207d98] text-[#111318] font-medium rounded-lg transition-colors mt-4 flex items-center justify-center gap-2"
          >
            <Send size={18} />
            Enviar solicitud
          </button>

        </form>
      </div>
    </main>
  );
}
