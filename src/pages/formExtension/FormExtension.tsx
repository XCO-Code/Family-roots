import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Send, User, Calendar, FileText, ImageIcon,
  Users, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePersonsStore } from '../../shared/store/personsStore';
import { uploadImageByTree } from '../../shared/service/imageService';
import type { CreatePersonDto } from '../../shared/models/personModel';
import { createPersonSchema, type CreatePersonFormData } from '../../shared/schema/createPersonSchema';

const GENDER_OPTIONS = [
  { value: 'male' as const, label: 'Masculino', icon: '♂' },
  { value: 'female' as const, label: 'Femenino', icon: '♀' },
];

export default function Extension() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();

  const persons = usePersonsStore((s) => s.persons);
  const getAllPersons = usePersonsStore((s) => s.getAllPersons);
  const createPerson = usePersonsStore((s) => s.createPerson);
  const personsLoading = usePersonsStore((s) => s.loading);

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePersonFormData>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: { gender: 'male' },
  });

  const photoUrl = watch('photo_url');

  useEffect(() => {
    if (treeId) getAllPersons(treeId);
  }, [treeId]);

  const fatherOptions = persons.filter((p) => p.gender === 'male');
  const motherOptions = persons.filter((p) => p.gender === 'female');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !treeId) return;
    setUploadLoading(true);
    try {
      const url = await uploadImageByTree(treeId, file);
      setValue('photo_url', url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  const onSubmit = async (data: CreatePersonFormData) => {
    if (!treeId) return;
    setErrorMsg('');

    try {
      const dto: CreatePersonDto = {
        tree_id: treeId,
        name: data.name,
        gender: data.gender,
        ...(data.born && { born: data.born }),
        ...(data.died && { died: data.died }),
        ...(data.photo_url && { photo_url: data.photo_url }),
        ...(data.bio && { bio: data.bio }),
        ...(data.father_id && { father_id: data.father_id }),
        ...(data.mother_id && { mother_id: data.mother_id }),
      };

      await createPerson(dto);
      setStatus('success');
      setTimeout(() => navigate(`/tree-viewer/${treeId}`), 1200);
    } catch (err) {
      setStatus('error');
      setErrorMsg((err as Error).message ?? 'Error al crear la persona');
    }
  };

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-green-400" />
          </div>
          <h2 className="text-white font-semibold text-lg">¡Persona creada!</h2>
          <p className="text-white/40 text-sm">Redirigiendo al árbol...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Agregar persona al árbol</h1>
          <p className="text-white/35 text-sm mt-1.5">
            Completa los datos de la persona que deseas agregar.
          </p>
          {treeId && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          <Section icon={<User size={14} />} title="Datos básicos">

            <Field label="Nombre completo *" error={errors.name?.message}>
              <input
                {...register('name')}
                type="text"
                placeholder="Ej: María García Pérez"
                className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:bg-white/8 transition-all ${
                  errors.name
                    ? 'border-orange-500/50 focus:border-orange-500/50'
                    : 'border-white/10 focus:border-purple-500/50'
                }`}
              />
            </Field>

            <Field label="Género *">
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => field.onChange(g.value)}
                        className={`
                          py-2.5 rounded-xl text-sm font-medium border transition-all
                          ${field.value === g.value
                            ? g.value === 'male'
                              ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                              : 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/8'
                          }
                        `}
                      >
                        {g.icon} {g.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </Field>

          </Section>

          {/* ── Fechas ── */}
          <Section icon={<Calendar size={14} />} title="Fechas">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha de nacimiento">
                <input
                  {...register('born')}
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </Field>
              <Field label="Fecha de fallecimiento">
                <input
                  {...register('died')}
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </Field>
            </div>
          </Section>

          {/* ── Relaciones familiares ── */}
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
                <Field
                  label="Padre"
                  hint={fatherOptions.length === 0 ? 'No hay hombres en el árbol aún' : undefined}
                >
                  <select
                    {...register('father_id')}
                    disabled={fatherOptions.length === 0}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none disabled:opacity-30"
                  >
                    <option value="" className="bg-neutral-900">— Sin padre registrado —</option>
                    {fatherOptions.map((p) => (
                      <option key={p.id} value={p.id} className="bg-neutral-900">
                        {p.name}{p.born ? ` (n. ${p.born})` : ''}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Madre"
                  hint={motherOptions.length === 0 ? 'No hay mujeres en el árbol aún' : undefined}
                >
                  <select
                    {...register('mother_id')}
                    disabled={motherOptions.length === 0}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none disabled:opacity-30"
                  >
                    <option value="" className="bg-neutral-900">— Sin madre registrada —</option>
                    {motherOptions.map((p) => (
                      <option key={p.id} value={p.id} className="bg-neutral-900">
                        {p.name}{p.born ? ` (n. ${p.born})` : ''}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}
          </Section>

          {/* ── Info adicional ── */}
          <Section icon={<FileText size={14} />} title="Información adicional">

            <Field label="Foto">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <ImageIcon size={16} className="text-white/20" />
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <label className={`
                    flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer
                    border border-white/10 text-sm transition-all
                    ${uploadLoading
                      ? 'bg-white/5 text-white/30 pointer-events-none'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                    }
                  `}>
                    {uploadLoading ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <ImageIcon size={14} />
                        {photoUrl ? 'Cambiar foto' : 'Subir foto'}
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploadLoading}
                    />
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setValue('photo_url', '')}
                      className="text-xs text-red-400/50 hover:text-red-400 transition-colors text-left"
                    >
                      Quitar foto
                    </button>
                  )}
                </div>
              </div>
            </Field>

            <Field label="Biografía / notas" error={errors.bio?.message}>
              <textarea
                {...register('bio')}
                rows={3}
                placeholder="Breve descripción, anécdotas, lugar de origen..."
                className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all resize-none ${
                  errors.bio ? 'border-orange-500/50' : 'border-white/10'
                }`}
              />
            </Field>

          </Section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full flex items-center justify-center gap-2
              py-3 rounded-xl font-semibold text-sm
              bg-green-500/20 border border-green-500/35 text-green-300
              hover:bg-green-500/30 transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {isSubmitting ? (
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

function Section({ icon, title, children }: {
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

function Field({ label, hint, error, children }: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/40 font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-white/20">{hint}</p>}
      {error && <p className="text-xs text-orange-400">{error}</p>}
    </div>
  );
}