import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trees } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTreesStore } from '../../shared/store/treesStore';
import { useAuthStore } from '../../shared/store/authStore';
import { createTreeSchema, type CreateTreeFormData } from './schema/createTreeSchema';

export default function CreateTree() {
  const createTree = useTreesStore((s) => s.createTree);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateTreeFormData>({
    resolver: zodResolver(createTreeSchema),
  });

  const onSubmit = async (data: CreateTreeFormData) => {
    const tree = await createTree({ ...data, user_id: user?.id! });
    navigate(`/tree-editor/${tree.id}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0c10] text-white flex flex-col">

      {/* Navbar */}
      <header className="border-b border-white/5 bg-[#0f1117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-xs text-white/30">Nuevo árbol</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#1a1d24] border border-green-500/25 flex items-center justify-center">
              <Trees size={18} className="text-green-400/70" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Crear árbol genealógico</h1>
              <p className="text-xs text-white/30">Dale un nombre a tu nuevo árbol</p>
            </div>
          </div>

          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6">

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-widest">
                  Nombre *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Ej: Familia García"
                  className={`w-full px-3 py-2.5 rounded-xl text-sm bg-[#111318] border text-white placeholder-white/20 focus:outline-none focus:ring-1 transition-all ${
                    errors.name
                      ? 'border-orange-500/50 focus:border-orange-500/50 focus:ring-orange-500/15'
                      : 'border-white/8 focus:border-purple-500/50 focus:ring-purple-500/15'
                  }`}
                />
                {errors.name && <p className="text-xs text-orange-400">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-widest">
                  Descripción <span className="normal-case text-white/20">(opcional)</span>
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Breve descripción del árbol..."
                  rows={3}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm resize-none bg-[#111318] border text-white placeholder-white/20 focus:outline-none focus:ring-1 transition-all ${
                    errors.description
                      ? 'border-orange-500/50 focus:border-orange-500/50 focus:ring-orange-500/15'
                      : 'border-white/8 focus:border-purple-500/50 focus:ring-purple-500/15'
                  }`}
                />
                {errors.description && <p className="text-xs text-orange-400">{errors.description.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full py-2.5 rounded-xl text-sm font-semibold mt-1
                  bg-green-500/20 border border-green-500/30 text-green-300
                  hover:bg-green-500/30 hover:border-green-400/50
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all
                "
              >
                Crear árbol
              </button>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
}