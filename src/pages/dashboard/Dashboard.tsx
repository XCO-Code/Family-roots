import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import { useTreesStore } from '../../shared/store/treesStore';
import { LogOut, Plus, Trees } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const trees = useTreesStore((s) => s.trees);
  const getAllTrees = useTreesStore((s) => s.getAllTrees);

  // TO DO: cambiar por el componentes para proteger la rama.
  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      getAllTrees();
    }
  }, [user, navigate, getAllTrees]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <main className="min-h-screen bg-[#0a0c10] text-white">
      <div className="max-w-6xl mx-auto p-6">
        
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-[#2bacc8] mb-1">Dashboard</h1>
            <p className="text-[#207d98]">Bienvenido, {user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2">
            <div className="bg-[#1a1d24] border border-[#207d98]/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
              <Trees size={24} className="text-[#2bacc8]" />
              </div>

              {trees.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#207d98] mb-4">Aún no tienes árboles genealógicos</p>
                  <Link
                    to="/create-tree"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#2bacc8] hover:bg-[#207d98] text-[#111318] font-medium rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    Crear primer árbol
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trees.map((tree) => (
                    <div
                      key={tree.id}
                      className="bg-[#111318] border border-[#207d98]/30 rounded-lg p-4 hover:border-[#2bacc8] transition-colors cursor-pointer"
                      onClick={() => navigate(`/tree-editor/${tree.id}`)}
                    >
                      <h3 className="text-lg font-semibold text-[#2bacc8] mb-2">{tree.name}</h3>
                      <p className="text-sm text-[#207d98]">{tree.description || 'Sin descripción'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1a1d24] border border-[#207d98]/20 rounded-2xl p-8 h-fit">
            <h3 className="text-lg font-semibold text-[#2bacc8] mb-4">Acciones rápidas</h3>
            <div className="flex flex-col gap-3">
              <Link
                to="/create-tree"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2bacc8] hover:bg-[#207d98] text-[#111318] font-medium rounded-lg transition-colors"
              >
                <Plus size={18} />
                Nuevo árbol
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
