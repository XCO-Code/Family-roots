import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import { useTreesStore } from '../../shared/store/treesStore';
import { LogOut, Plus, Trees, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const trees = useTreesStore((s) => s.trees);
  const getTreesByUserId = useTreesStore((s) => s.getTreesByUserId);
  const reset = useAuthStore((state) => state.reset)

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      getTreesByUserId(user.id);
    }
  }, [user, navigate, getTreesByUserId]);

  const handleLogout = () => {
    logout();
    reset()
    navigate('/');

  };

  return (
    <main className="min-h-screen bg-[#0a0c10] text-white">

      {/* Navbar */}
      <header className="border-b border-white/5 bg-[#0f1117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#1a1d24] border border-purple-500/30 flex items-center justify-center">
              <img src="/favicon/web-app-manifest-512x512.png" alt="" className='p-1' />
            </div>
            <span className="text-sm font-semibold text-white/40 tracking-widest uppercase hidden sm:block">Family Roots</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/25 hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                bg-orange-500/10 border border-orange-500/20 text-orange-400
                hover:bg-orange-500/20 hover:border-orange-400/40 transition-all
              "
            >
              <LogOut size={13} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Page header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Mis árboles</h1>
          <p className="text-sm text-white/35">
            {trees.length === 0
              ? 'Aún no has creado ningún árbol genealógico'
              : `${trees.length} ${trees.length === 1 ? 'árbol' : 'árboles'} genealógico${trees.length === 1 ? '' : 's'}`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-5 h-fit">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Acciones rápidas</h3>
            <div className="flex flex-col gap-2">
              <Link
                to="/create-tree"
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                  bg-green-500/15 border border-green-500/25 text-green-300
                  hover:bg-green-500/25 transition-all
                "
              >
                <Plus size={15} />
                Nuevo árbol
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {trees.length === 0 ? (
              <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-10 sm:p-14 flex flex-col items-center justify-center text-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                  <Trees size={26} className="text-white/20" />
                </div>
                <div>
                  <p className="text-white/50 text-sm font-medium mb-1">Sin árboles todavía</p>
                  <p className="text-white/25 text-xs">Crea tu primer árbol genealógico para comenzar</p>
                </div>
                <Link
                  to="/create-tree"
                  className="
                    inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    bg-green-500/20 border border-green-500/30 text-green-300
                    hover:bg-green-500/30 transition-all
                  "
                >
                  <Plus size={15} />
                  Crear primer árbol
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trees.map((tree) => (
                  <div
                    key={tree.id}
                    onClick={() => navigate(`/tree-editor/${tree.id}`)}
                    className="
                      group bg-[#1a1d24] border border-white/5 rounded-xl p-4
                      hover:border-purple-500/30 hover:bg-[#1e2130]
                      cursor-pointer transition-all
                    "
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500/70 shrink-0" />
                          <h3 className="text-sm font-semibold text-white truncate">{tree.name}</h3>
                        </div>
                        <p className="text-xs text-white/30 line-clamp-2">
                          {tree.description || 'Sin descripción'}
                        </p>
                      </div>
                      <ChevronRight size={15} className="text-white/15 group-hover:text-purple-400/60 transition-colors shrink-0 mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}