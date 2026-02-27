import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../../shared/store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    if (!error) {
      navigate('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0c10] flex items-center justify-center font-sans">
      <div className="w-full max-w-sm bg-[#1a1d24] border border-[#207d98]/20 rounded-2xl p-9">

        <div className="w-11 h-11 rounded-xl bg-[#07141d] border border-[#207d98]/30 flex items-center justify-center mb-7">
          <LogIn size={20} className="text-[#2bacc8]" />
        </div>

        <h1 className="text-xl font-semibold text-[#2bacc8] mb-1">Iniciar sesión</h1>
        <p className="text-sm text-[#207d98] mb-8">Bienvenido de nuevo</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#207d98] uppercase tracking-wider">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#207d98] pointer-events-none" />
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm bg-[#111318] border border-[#207d98]/30 text-[#2bacc8] placeholder-[#15516a] focus:outline-none focus:border-[#2bacc8] focus:ring-1 focus:ring-[#2bacc8]/20 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-[#207d98] uppercase tracking-wider">
                Contraseña
              </label>

            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#207d98] pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm bg-[#111318] border border-[#207d98]/30 text-[#2bacc8] placeholder-[#15516a] focus:outline-none focus:border-[#2bacc8] focus:ring-1 focus:ring-[#2bacc8]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#207d98] hover:text-[#2bacc8] transition-colors cursor-pointer"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-2.5 rounded-lg text-sm font-semibold bg-[#207d98] hover:bg-[#2bacc8] text-[#07141d] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
          >
            <LogIn size={15} />
            {loading ? 'Iniciando...' : 'Entrar'}
          </button>

          <p className="text-center text-xs text-[#207d98]/60 mt-1">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[#2bacc8] font-medium cursor-pointer hover:underline">
              Regístrate
            </Link>
          </p>

        </form>
      </div>
    </main>
  );
}