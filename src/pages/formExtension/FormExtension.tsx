// src/pages/Extension/Extension.tsx
//
// Ruta esperada: /extension/:treeId
// Al enviar: crea la persona directamente en Supabase
//            y redirige a /tree-viewer/:treeId

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  User,
  Calendar,
  FileText,
  ImageIcon,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { usePersonsStore } from '../../shared/store/personsStore';
import type { CreatePersonDto, Gender } from '../../shared/models/personModel';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const GENDER_OPTIONS: { value: Gender; label: string; icon: string }[] = [
  { value: 'male',   label: 'Masculino', icon: '♂' },
  { value: 'female', label: 'Femenino',  icon: '♀' },
  { value: 'other',  label: 'Otro',      icon: '⚧' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
export default function Extension() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();

  // ── Store ──────────────────────────────────────────────────────────────────
  const persons = usePersonsStore((s) => s.persons);
  const getAllPersons = usePersonsStore((s) => s.getAllPersons);
  const createPerson = usePersonsStore((s) => s.createPerson);
  const personsLoading = usePersonsStore((s) => s.loading);

  // ── Estado del formulario ──────────────────────────────────────────────────
  const [form, setForm] = useState<Omit<CreatePersonDto, 'tree_id'>>({
    name: '',
    gender: 'male',
    born: '',
    died: '',
    photo_url: '',
    bio: '',
    father_id: '',
    mother_id: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // ── Cargar personas del árbol para los selects ─────────────────────────────
  useEffect(() => {
    if (treeId) getAllPersons(treeId);
  }, [treeId]);

  // ── Opciones de padre (hombres del árbol) y madre (mujeres) ───────────────
  const fatherOptions = persons.filter((p) => p.gender === 'male'   || p.gender === 'other');
  const motherOptions = persons.filter((p) => p.gender === 'female' || p.gender === 'other');

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treeId) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      // Limpiar campos vacíos para no enviar strings vacíos a Supabase
      const dto: CreatePersonDto = {
        tree_id: treeId,
        name: form.name,
        gender: form.gender,
        ...(form.born      && { born: form.born }),
        ...(form.died      && { died: form.died }),
        ...(form.photo_url && { photo_url: form.photo_url }),
        ...(form.bio       && { bio: form.bio }),
        ...(form.father_id && { father_id: form.father_id }),
        ...(form.mother_id && { mother_id: form.mother_id }),
      };

      await createPerson(dto);
      setStatus('success');

      // Redirigir al tree-viewer tras 1.2 s para que el usuario vea el éxito
      setTimeout(() => navigate(`/tree-viewer/${treeId}`), 1200);
    } catch (err) {
      setStatus('error');
      setErrorMsg((err as Error).message ?? 'Error al crear la persona');
    }
  };

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <main className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-teal-400" />
          </div>
          <h2 className="text-white font-semibold text-lg">¡Persona creada!</h2>
          <p className="text-white/40 text-sm">Redirigiendo al árbol...</p>
        </div>
      </main>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-start py-10 px-4">

      {/* ── Contenedor ──────────────────────────────────────────────────────── */}
      <div className="w-full max-w-xl">

        {/* Back */}
        <button
          onClick={() => navigate(`/tree-viewer/${treeId}`)}
          className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} />
          Volver al árbol
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Agregar persona al árbol</h1>
          <p className="text-white/35 text-sm mt-1.5">
            Completa los datos de la persona que deseas agregar.
          </p>
          {treeId && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="text-white/40 text-xs font-mono">{treeId}</span>
            </div>
          )}
        </div>

        {/* Error banner */}
        {status === 'error' && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Sección: Datos básicos ──────────────────────────────────────── */}
          <Section icon={<User size={14} />} title="Datos básicos">

            {/* Nombre */}
            <Field label="Nombre completo *">
              <input
                type="text"
                placeholder="Ej: María García Pérez"
                value={form.name}
                onChange={set('name')}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-400/60 focus:bg-white/8 transition-all"
              />
            </Field>

            {/* Género */}
            <Field label="Género *">
              <div className="grid grid-cols-3 gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, gender: g.value }))}
                    className={`
                      py-2.5 rounded-xl text-sm font-medium border transition-all
                      ${form.gender === g.value
                        ? g.value === 'male'
                          ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                          : g.value === 'female'
                          ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                          : 'bg-slate-500/20 border-slate-400/50 text-slate-300'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/8'
                      }
                    `}
                  >
                    {g.icon} {g.label}
                  </button>
                ))}
              </div>
            </Field>

          </Section>

          {/* ── Sección: Fechas ─────────────────────────────────────────────── */}
          <Section icon={<Calendar size={14} />} title="Fechas">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha de nacimiento">
                <input
                  type="date"
                  value={form.born ?? ''}
                  onChange={set('born')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400/60 transition-all"
                />
              </Field>
              <Field label="Fecha de fallecimiento">
                <input
                  type="date"
                  value={form.died ?? ''}
                  onChange={set('died')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400/60 transition-all"
                />
              </Field>
            </div>
          </Section>

          {/* ── Sección: Relaciones familiares ──────────────────────────────── */}
          <Section icon={<Users size={14} />} title="Relaciones familiares">
            {personsLoading ? (
              <div className="flex items-center gap-2 text-white/30 text-sm py-2">
                <Loader2 size={14} className="animate-spin" />
                Cargando personas del árbol...
              </div>
            ) : persons.length === 0 ? (
              <p className="text-white/25 text-xs py-2">
                No hay personas en este árbol aún — esta será la primera.
              </p>
            ) : (
              <>
                {/* Padre */}
                <Field
                  label="Padre"
                  hint={fatherOptions.length === 0 ? 'No hay hombres en el árbol aún' : undefined}
                >
                  <select
                    value={form.father_id ?? ''}
                    onChange={set('father_id')}
                    disabled={fatherOptions.length === 0}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400/60 transition-all appearance-none disabled:opacity-30"
                  >
                    <option value="">— Sin padre registrado —</option>
                    {fatherOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.born ? ` (n. ${p.born})` : ''}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Madre */}
                <Field
                  label="Madre"
                  hint={motherOptions.length === 0 ? 'No hay mujeres en el árbol aún' : undefined}
                >
                  <select
                    value={form.mother_id ?? ''}
                    onChange={set('mother_id')}
                    disabled={motherOptions.length === 0}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400/60 transition-all appearance-none disabled:opacity-30"
                  >
                    <option value="">— Sin madre registrada —</option>
                    {motherOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.born ? ` (n. ${p.born})` : ''}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}
          </Section>

          {/* ── Sección: Info adicional ──────────────────────────────────────── */}
          <Section icon={<FileText size={14} />} title="Información adicional">

            <Field label="URL de foto">
              <div className="flex gap-3 items-start">
                {/* Preview */}
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                  {form.photo_url ? (
                    <img
                      src={form.photo_url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <ImageIcon size={16} className="text-white/20" />
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.photo_url ?? ''}
                  onChange={set('photo_url')}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-400/60 transition-all"
                />
              </div>
            </Field>

            <Field label="Biografía / notas">
              <textarea
                rows={3}
                placeholder="Breve descripción, anécdotas, lugar de origen..."
                value={form.bio ?? ''}
                onChange={set('bio')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-400/60 transition-all resize-none"
              />
            </Field>

          </Section>

          {/* ── Submit ──────────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={status === 'loading' || !form.name.trim()}
            className="
              w-full flex items-center justify-center gap-2
              py-3 rounded-xl font-semibold text-sm
              bg-teal-500/20 border border-teal-500/35 text-teal-300
              hover:bg-teal-500/30 transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creando persona...
              </>
            ) : (
              <>
                <Send size={16} />
                Agregar al árbol
              </>
            )}
          </button>

        </form>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes de UI
// ─────────────────────────────────────────────────────────────────────────────
function Section({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-widest">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/40 font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-white/20">{hint}</p>}
    </div>
  );
}