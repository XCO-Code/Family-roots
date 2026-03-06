import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../../shared/store/authStore';
import { loginSchema, type LoginFormData } from './schema/loginSchema';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const errors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData;
        if (!errors[field]) errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    await login(result.data);
    if (!error) {
      navigate('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0c10] flex items-center justify-center font-sans px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1a1d24] border border-purple-500/30 flex items-center justify-center">
            <img src="/favicon/web-app-manifest-192x192.png" alt="" className='p-1' />
          </div>
          <span className="text-sm font-semibold text-white/40 tracking-widest uppercase">Family Roots</span>
        </div>

        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-7">

          <h1 className="text-2xl font-bold text-white mb-1">Iniciar sesión</h1>
          <p className="text-sm text-white/35 mb-7">Bienvenido de nuevo</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/40 uppercase tracking-widest">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-[#111318] border text-white placeholder-white/20 focus:outline-none focus:ring-1 transition-all ${
                    fieldErrors.email
                      ? 'border-orange-500/50 focus:border-orange-500/50 focus:ring-orange-500/15'
                      : 'border-white/8 focus:border-purple-500/50 focus:ring-purple-500/15'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-orange-400">{fieldErrors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/40 uppercase tracking-widest">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl text-sm bg-[#111318] border text-white placeholder-white/20 focus:outline-none focus:ring-1 transition-all ${
                    fieldErrors.password
                      ? 'border-orange-500/50 focus:border-orange-500/50 focus:ring-orange-500/15'
                      : 'border-white/8 focus:border-purple-500/50 focus:ring-purple-500/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-orange-400">{fieldErrors.password}</p>
              )}
            </div>

            {error && (
              <p className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full mt-1 py-2.5 rounded-xl text-sm font-semibold
                bg-green-500/20 border border-green-500/30 text-green-300
                hover:bg-green-500/30 hover:border-green-400/50
                flex items-center justify-center gap-2
                transition-all disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              <LogIn size={15} />
              {loading ? 'Iniciando...' : 'Entrar'}
            </button>

            <p className="text-center text-xs text-white/30 mt-1">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Regístrate
              </Link>
            </p>

          </form>
        </div>
      </div>
    </main>
  );
}