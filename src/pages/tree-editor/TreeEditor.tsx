import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  ArrowLeft, Plus, User, X, Save, Trash2, Heart, HeartOff,
  ChevronDown, ChevronUp, Calendar, UserCircle, Share2, Presentation,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTreesStore } from '../../shared/store/treesStore';
import { usePersonsStore } from '../../shared/store/personsStore';
import { usePartnersStore } from '../../shared/store/partnersStore';
import { uploadImageByTree } from '../../shared/service/imageService';
import type { Person, CreatePersonDto, UpdatePersonDto, Gender } from '../../shared/models/personModel';
import { ExtensionQR } from '../../shared/components/ExtesionQr';
import { createPersonSchema, type CreatePersonFormData } from '../../shared/schema/createPersonSchema';


function SidebarField({ label, children, error }: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-white/40 uppercase tracking-widest">{label}</label>
      {children}
      {error && <p className="text-xs text-orange-400">{error}</p>}
    </div>
  );
}


type PersonNodeData = {
  person: Person;
  isSelected: boolean;
  onSelect: (p: Person) => void;
  generation: number;
};

function PersonNode({ data }: NodeProps) {
  const d = data as PersonNodeData;
  const { person, isSelected, onSelect, generation } = d;

  const generationColors: Record<number, string> = {
    0: 'from-amber-500/20 to-amber-600/10 border-amber-500/40',
    1: 'from-purple-500/20 to-purple-600/10 border-purple-500/40',
    2: 'from-sky-500/20 to-sky-600/10 border-sky-500/40',
    3: 'from-violet-500/20 to-violet-600/10 border-violet-500/40',
    4: 'from-rose-500/20 to-rose-600/10 border-rose-500/40',
  };
  const accentColors: Record<number, string> = {
    0: 'bg-amber-500', 1: 'bg-purple-500', 2: 'bg-sky-500',
    3: 'bg-violet-500', 4: 'bg-rose-500',
  };

  const gen = Math.min(generation ?? 0, 4);
  const isMale = person.gender === 'male';
  const isFemale = person.gender === 'female';

  return (
    <div
      onClick={() => onSelect(person)}
      className={`
        relative w-48 cursor-pointer select-none rounded-2xl border bg-linear-to-b backdrop-blur-sm
        transition-all duration-200 ${generationColors[gen]}
        ${isSelected ? 'ring-2 ring-white/40 scale-105 shadow-2xl shadow-black/50' : 'hover:scale-102 hover:shadow-xl shadow-black/30'}
      `}
      style={{ boxShadow: isSelected ? '0 0 30px rgba(255,255,255,0.08)' : undefined }}
    >
      <div className={`${accentColors[gen]} h-1 w-full`} />
      <Handle type="target" position={Position.Top} id="father" style={{ left: '25%', background: 'transparent', border: 'none' }} />
      <Handle type="target" position={Position.Top} id="mother" style={{ left: '75%', background: 'transparent', border: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none', bottom: -2 }} />

      <div className="p-3">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMale ? 'bg-sky-500/20 text-sky-300' : isFemale ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-500/20 text-slate-300'}`}>
            {person.photo_url
              ? <img src={person.photo_url} alt={person.name} className="w-full h-full rounded-xl object-cover" />
              : <User size={18} />
            }
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">{person.name}</p>
            <p className="text-white/40 text-xs mt-0.5">{isMale ? '♂ Hombre' : '♀ Mujer'}</p>
          </div>
        </div>
        {(person.born || person.died) && (
          <div className="flex items-center gap-1.5 text-white/50 text-xs mt-1">
            <Calendar size={10} className="shrink-0" />
            <span>{person.born ?? '?'}{person.died ? ` — ${person.died}` : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const nodeTypes = { person: PersonNode };

const NODE_W = 230;
const NODE_H = 180;

function buildGraphElements(
  persons: Person[],
  selectedId: string | null,
  onSelect: (p: Person) => void,
): { nodes: Node[]; edges: Edge[] } {
  if (persons.length === 0) return { nodes: [], edges: [] };

  const personIds = new Set(persons.map((p) => p.id));
  const layoutParent = new Map<string, string>();
  const childrenOf = new Map<string, string[]>();

  persons.forEach((p) => {
    const mainParentId = p.father_id && personIds.has(p.father_id)
      ? p.father_id
      : p.mother_id && personIds.has(p.mother_id) ? p.mother_id : null;
    if (mainParentId) {
      layoutParent.set(p.id, mainParentId);
      childrenOf.set(mainParentId, [...(childrenOf.get(mainParentId) ?? []), p.id]);
    }
  });

  const generationMap = new Map<string, number>();
  const roots = persons.filter((p) => !layoutParent.has(p.id));
  const queue: Array<{ id: string; gen: number }> = roots.map((r) => ({ id: r.id, gen: 0 }));
  while (queue.length) {
    const { id, gen } = queue.shift()!;
    if (generationMap.has(id)) continue;
    generationMap.set(id, gen);
    (childrenOf.get(id) ?? []).forEach((cid) => queue.push({ id: cid, gen: gen + 1 }));
  }
  persons.forEach((p) => { if (!generationMap.has(p.id)) generationMap.set(p.id, 0); });

  const subtreeWidth = new Map<string, number>();
  const maxGen = Math.max(...Array.from(generationMap.values()), 0);
  for (let g = maxGen; g >= 0; g--) {
    persons.filter((p) => generationMap.get(p.id) === g).forEach((p) => {
      const kids = childrenOf.get(p.id) ?? [];
      subtreeWidth.set(p.id, kids.length === 0
        ? NODE_W
        : Math.max(NODE_W, kids.reduce((sum, kid) => sum + (subtreeWidth.get(kid) ?? NODE_W), 0)));
    });
  }

  const positionMap = new Map<string, { x: number; y: number }>();
  function assignX(id: string, leftBound: number): void {
    const width = subtreeWidth.get(id) ?? NODE_W;
    positionMap.set(id, { x: leftBound + width / 2 - NODE_W / 2, y: (generationMap.get(id) ?? 0) * NODE_H });
    let cursor = leftBound;
    (childrenOf.get(id) ?? []).forEach((kid) => {
      const kidWidth = subtreeWidth.get(kid) ?? NODE_W;
      assignX(kid, cursor);
      cursor += kidWidth;
    });
  }

  let rootCursor = 0;
  roots.forEach((r) => {
    assignX(r.id, rootCursor);
    rootCursor += (subtreeWidth.get(r.id) ?? NODE_W) + NODE_W * 0.5;
  });

  const nodes: Node[] = persons.map((p) => ({
    id: p.id,
    type: 'person',
    position: positionMap.get(p.id) ?? { x: 0, y: 0 },
    data: { person: p, isSelected: selectedId === p.id, onSelect, generation: generationMap.get(p.id) ?? 0 } satisfies PersonNodeData,
  }));

  const edges: Edge[] = [];
  persons.forEach((p) => {
    if (p.father_id && personIds.has(p.father_id))
      edges.push({ id: `e-f-${p.father_id}-${p.id}`, source: p.father_id, target: p.id, targetHandle: 'father', type: 'smoothstep', style: { stroke: '#38bdf8', strokeWidth: 2, opacity: 0.6 } });
    if (p.mother_id && personIds.has(p.mother_id))
      edges.push({ id: `e-m-${p.mother_id}-${p.id}`, source: p.mother_id, target: p.id, targetHandle: 'mother', type: 'smoothstep', style: { stroke: '#fb7185', strokeWidth: 2, opacity: 0.6 } });
  });

  return { nodes, edges };
}


type SidebarMode = 'idle' | 'create' | 'edit';

interface SidebarProps {
  mode: SidebarMode;
  persons: Person[];
  partners: import('../../shared/models/partnerModel').Partner[];
  selectedPerson: Person | null;
  treeId: string;
  onClose: () => void;
  onCreateOpen: () => void;
  onSubmit: (data: CreatePersonDto | UpdatePersonDto) => Promise<void>;
  onDeletePerson: (id: string) => Promise<void>;
  onAddPartner: (partnerId: string) => Promise<void>;
  onRemovePartner: (partnerRecordId: string, partnerId?: string) => Promise<void>;
  loading: boolean;
}

function Sidebar({
  mode, persons, partners, selectedPerson, treeId,
  onClose, onCreateOpen, onSubmit, onDeletePerson,
  onAddPartner, onRemovePartner, loading,
}: SidebarProps) {
  const [newPartnerId, setNewPartnerId] = useState('');
  const [showPartners, setShowPartners] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePersonFormData>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: { gender: 'male' },
  });

  const photoUrl = watch('photo_url');

  // Sync form when selection or mode changes
  useEffect(() => {
    if (mode === 'edit' && selectedPerson) {
      reset({
        name: selectedPerson.name,
        gender: selectedPerson.gender as 'male' | 'female',
        born: selectedPerson.born ?? '',
        died: selectedPerson.died ?? '',
        photo_url: selectedPerson.photo_url ?? '',
        bio: selectedPerson.bio ?? '',
        father_id: selectedPerson.father_id ?? '',
        mother_id: selectedPerson.mother_id ?? '',
      });
    } else if (mode === 'create') {
      reset({ gender: 'male' });
    }
    setConfirmDelete(false);
  }, [mode, selectedPerson, treeId, reset]);

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

  const onFormSubmit = async (data: CreatePersonFormData) => {
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    await onSubmit(cleaned as unknown as CreatePersonDto);
  };

  const personPartners = partners.filter(
    (pt) => selectedPerson && (pt.person_id === selectedPerson.id || pt.partner_id === selectedPerson.id),
  );
  const partnerIds = new Set(
    personPartners.map((pt) => pt.person_id === selectedPerson?.id ? pt.partner_id : pt.person_id),
  );
  const availableForPartner = persons.filter((p) => p.id !== selectedPerson?.id && !partnerIds.has(p.id));

  if (mode === 'idle') {
    return (
      <aside className="hidden md:flex w-72 bg-[#0f1117] border-r border-white/5 flex-col">
        <div className="p-5 flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <UserCircle size={32} className="text-white/20" />
          </div>
          <div>
            <p className="text-white/50 text-sm">Selecciona una persona</p>
            <p className="text-white/25 text-xs mt-1">o crea una nueva para empezar</p>
          </div>
          <button
            onClick={onCreateOpen}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 transition-all text-sm font-medium"
          >
            <Plus size={15} />
            Nueva persona
          </button>
        </div>
      </aside>
    );
  }

  return (
    <>
      <div className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm" onClick={onClose} />

      <aside className="
        md:w-72 md:relative md:flex md:flex-col md:bg-[#0f1117] md:border-r md:border-white/5 md:overflow-hidden
        fixed bottom-0 left-0 right-0 z-30 md:z-auto
        bg-[#0f1117] border-t border-white/10
        flex flex-col max-h-[80vh] md:max-h-none
      ">
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {mode === 'create' ? 'Nueva persona' : 'Editar persona'}
            </h3>
            {mode === 'edit' && selectedPerson && (
              <p className="text-xs text-white/30 mt-0.5 truncate max-w-45">{selectedPerson.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-white/50" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <form onSubmit={handleSubmit(onFormSubmit)} className="p-5 flex flex-col gap-4">

            {/* Avatar + foto */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                {photoUrl
                  ? <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  : <User size={22} className="text-white/20" />
                }
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <label className="text-xs font-medium text-white/40 uppercase tracking-widest">Foto</label>
                <label className={`
                  flex items-center justify-center gap-2 px-3 py-2 rounded-xl cursor-pointer
                  border border-white/10 text-xs transition-all
                  ${uploadLoading ? 'bg-white/5 text-white/30 pointer-events-none' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'}
                `}>
                  {uploadLoading ? (
                    <>
                      <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <User size={12} />
                      {photoUrl ? 'Cambiar foto' : 'Subir foto'}
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploadLoading} />
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

            {/* Nombre */}
            <SidebarField label="Nombre completo *" error={errors.name?.message}>
              <input
                {...register('name')}
                type="text"
                placeholder="Ej: María García"
                className={`bg-white/5 border rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:bg-white/8 transition-all ${
                  errors.name ? 'border-orange-500/50' : 'border-white/10 focus:border-purple-500/50'
                }`}
              />
            </SidebarField>

            {/* Género */}
            <SidebarField label="Género">
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => field.onChange(g)}
                        className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                          field.value === g
                            ? g === 'male' ? 'bg-sky-500/25 border-sky-400/50 text-sky-300' : 'bg-rose-500/25 border-rose-400/50 text-rose-300'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/8'
                        }`}
                      >
                        {g === 'male' ? '♂ Hombre' : '♀ Mujer'}
                      </button>
                    ))}
                  </div>
                )}
              />
            </SidebarField>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3">
              <SidebarField label="Nacimiento">
                <input
                  {...register('born')}
                  type="date"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </SidebarField>
              <SidebarField label="Fallecimiento">
                <input
                  {...register('died')}
                  type="date"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </SidebarField>
            </div>

            {/* Bio */}
            <SidebarField label="Biografía" error={errors.bio?.message}>
              <textarea
                {...register('bio')}
                rows={2}
                placeholder="Breve descripción..."
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </SidebarField>

            {/* Padres */}
            <SidebarField label="Padres">
              <div className="flex flex-col gap-1.5">
                {(['father_id', 'mother_id'] as const).map((f) => {
                  const filterGender: Gender = f === 'father_id' ? 'female' : 'male';
                  const options = persons.filter((p) => p.id !== selectedPerson?.id && p.gender !== filterGender);
                  return (
                    <select
                      key={f}
                      {...register(f)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none"
                    >
                      <option value="" className="bg-neutral-900">{f === 'father_id' ? '♂ Padre' : '♀ Madre'} — ninguno</option>
                      {options.map((p) => (
                        <option key={p.id} value={p.id} className="bg-neutral-900">{p.name}</option>
                      ))}
                    </select>
                  );
                })}
              </div>
            </SidebarField>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl py-2.5 text-sm font-semibold transition-all"
            >
              <Save size={14} />
              {loading ? 'Guardando...' : mode === 'create' ? 'Crear persona' : 'Guardar cambios'}
            </button>
          </form>

          {/* Partners — solo en edit */}
          {mode === 'edit' && selectedPerson && (
            <div className="px-5 pb-5">
              <div className="border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPartners((v) => !v)}
                  className="flex items-center justify-between w-full text-xs font-medium text-white/40 uppercase tracking-widest mb-3"
                >
                  <span className="flex items-center gap-1.5">
                    <Heart size={11} />
                    Parejas ({personPartners.length})
                  </span>
                  {showPartners ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {showPartners && (
                  <div className="flex flex-col gap-2">
                    {personPartners.length === 0 ? (
                      <p className="text-white/25 text-xs text-center py-2">Sin parejas registradas</p>
                    ) : (
                      personPartners.map((pt) => {
                        const partnerId = pt.person_id === selectedPerson.id ? pt.partner_id : pt.person_id;
                        const partnerData = persons.find((p) => p.id === partnerId);
                        return (
                          <div key={pt.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 border border-white/8">
                            <div className="flex items-center gap-2 min-w-0">
                              <Heart size={11} className="text-rose-400 shrink-0" />
                              <span className="text-sm text-white/70 truncate">{partnerData?.name ?? partnerId}</span>
                            </div>
                            <button
                              onClick={() => onRemovePartner(pt.id, pt.person_id === selectedPerson.id ? pt.partner_id : pt.person_id)}
                              className="text-white/20 hover:text-red-400 transition-colors shrink-0 ml-2"
                            >
                              <HeartOff size={13} />
                            </button>
                          </div>
                        );
                      })
                    )}

                    {availableForPartner.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        <select
                          value={newPartnerId}
                          onChange={(e) => setNewPartnerId(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
                        >
                          <option value="" className="bg-neutral-900">Seleccionar...</option>
                          {availableForPartner.map((p) => (
                            <option key={p.id} value={p.id} className="bg-neutral-900">{p.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!newPartnerId}
                          onClick={async () => { if (newPartnerId) { await onAddPartner(newPartnerId); setNewPartnerId(''); } }}
                          className="px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delete */}
              <div className="border-t border-white/5 pt-4 mt-4">
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-center gap-2 text-red-400/60 hover:text-red-400 text-xs py-2 rounded-xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 size={13} />
                    Eliminar persona
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-red-400/80 text-center">¿Confirmar eliminación?</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-all">Cancelar</button>
                      <button type="button" onClick={() => onDeletePerson(selectedPerson.id)} className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs hover:bg-red-500/30 transition-all">Eliminar</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export { PersonNode, buildGraphElements };


export default function TreeEditor() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);

  const tree = useTreesStore((s) => s.selectedTree);
  const getTreeById = useTreesStore((s) => s.getTreeById);
  const restTree = useTreesStore((s) => s.reset);

  const persons = usePersonsStore((s) => s.persons);
  const selectedPerson = usePersonsStore((s) => s.selectedPerson);
  const personsLoading = usePersonsStore((s) => s.loading);
  const getAllPersons = usePersonsStore((s) => s.getAllPersons);
  const createPerson = usePersonsStore((s) => s.createPerson);
  const updatePerson = usePersonsStore((s) => s.updatePerson);
  const deletePerson = usePersonsStore((s) => s.deletePerson);
  const setSelectedPerson = usePersonsStore((s) => s.setSelected);

  const partners = usePartnersStore((s) => s.partners);
  const getAllPartners = usePartnersStore((s) => s.getAllPartners);
  const createPartner = usePartnersStore((s) => s.createPartner);
  const deletePartner = usePartnersStore((s) => s.deletePartner);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('idle');

  useEffect(() => { if (!treeId) navigate('/dashboard'); }, [treeId, navigate]);
  useEffect(() => { if (!treeId) return; getTreeById(treeId); getAllPersons(treeId); }, [treeId]);

  const personIdsKey = persons.map((p) => p.id).join(',');
  useEffect(() => {
    if (persons.length === 0) return;
    persons.forEach((p) => getAllPartners(p.id));
  }, [personIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectNode = useCallback((person: Person) => {
    setSelectedPerson(person);
    setSidebarMode('edit');
  }, [setSelectedPerson]);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraphElements(persons, selectedPerson?.id ?? null, handleSelectNode);
    setNodes(n);
    setEdges(e);
  }, [persons, partners, selectedPerson?.id, handleSelectNode]);

  const handleConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const handleFormSubmit = async (data: CreatePersonDto | UpdatePersonDto) => {
    if (!treeId) return;
    if (sidebarMode === 'create') {
      const newP = await createPerson({ ...(data as CreatePersonDto), tree_id: treeId });
      setSelectedPerson(newP);
      setSidebarMode('edit');
    } else if (sidebarMode === 'edit' && selectedPerson) {
      await updatePerson(selectedPerson.id, data as UpdatePersonDto);
    }
  };

  const handleDeletePerson = async (id: string) => {
    await deletePerson(id);
    setSelectedPerson(null);
    setSidebarMode('idle');
  };

  const handleAddPartner = async (partnerId: string) => {
    if (!selectedPerson) return;
    await createPartner({ person_id: selectedPerson.id, partner_id: partnerId });
    await Promise.all([getAllPartners(selectedPerson.id), getAllPartners(partnerId)]);
  };

  const handleRemovePartner = async (partnerRecordId: string, partnerId?: string) => {
    await deletePartner(partnerRecordId);
    if (selectedPerson) await getAllPartners(selectedPerson.id);
    if (partnerId) await getAllPartners(partnerId);
  };

  const openCreate = () => { setSelectedPerson(null); setSidebarMode('create'); };
  const closeSidebar = () => { setSelectedPerson(null); setSidebarMode('idle'); };

  return (
    <div className="w-full h-screen bg-[#0a0c10] flex flex-col overflow-hidden">

      <nav className="h-14 shrink-0 flex items-center justify-between px-3 md:px-5 bg-[#0f1117] border-b border-white/5">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <button onClick={() => { restTree(); navigate('/dashboard'); }} className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm shrink-0">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="w-px h-4 bg-white/10 shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <h1 className="text-white font-semibold text-sm truncate max-w-[120px] sm:max-w-xs">{tree?.name ?? 'Cargando...'}</h1>
            {tree?.description && <span className="text-white/30 text-xs hidden md:block truncate">— {tree.description}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          <span className="text-white/25 text-xs hidden sm:inline">{persons.length} {persons.length === 1 ? 'persona' : 'personas'}</span>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-xl bg-green-500/15 border border-green-500/25 text-green-300 hover:bg-green-500/25 transition-all text-xs font-medium">
            <Plus size={13} /><span className="hidden sm:inline">Agregar</span>
          </button>
          <button onClick={() => setShowQRModal(true)} className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-xl bg-green-500/15 border border-green-500/25 text-green-300 hover:bg-green-500/25 transition-all text-xs font-medium">
            <Share2 size={14} /><span className="hidden sm:inline">Extender</span>
          </button>
          <button onClick={() => window.open(`${window.location.origin}/tree-viewer/${treeId}`)} className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-xl bg-green-500/15 border border-green-500/25 text-green-300 hover:bg-green-500/25 transition-all text-xs font-medium">
            <Presentation size={13} /><span className="hidden md:inline">Modo presentacion</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          mode={sidebarMode} persons={persons} partners={partners}
          selectedPerson={selectedPerson} treeId={treeId ?? ''}
          onClose={closeSidebar} onCreateOpen={openCreate}
          onSubmit={handleFormSubmit} onDeletePerson={handleDeletePerson}
          onAddPartner={handleAddPartner} onRemovePartner={handleRemovePartner}
          loading={personsLoading}
        />

        <div className="flex-1 relative">
          {persons.length === 0 && !personsLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <User size={36} className="text-white/15" />
              </div>
              <div>
                <p className="text-white/40 text-base font-medium">El árbol está vacío</p>
                <p className="text-white/20 text-sm mt-1">Agrega la primera persona para comenzar</p>
              </div>
              <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 transition-all text-sm font-medium">
                <Plus size={15} />Agregar primera persona
              </button>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes} edges={edges}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onConnect={handleConnect} nodeTypes={nodeTypes}
              fitView fitViewOptions={{ padding: 0.3 }}
              onlyRenderVisibleElements minZoom={0.2} maxZoom={2}
              proOptions={{ hideAttribution: true }} style={{ background: 'transparent' }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.04)" />
              <Controls style={{ background: 'rgba(15,17,23,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} />
              <MiniMap
                className="hidden md:block"
                style={{ background: 'rgba(15,17,23,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                nodeColor={() => 'rgba(168,85,247,0.4)'} maskColor="rgba(0,0,0,0.4)"
              />
            </ReactFlow>
          )}
        </div>
      </div>

      {showQRModal && treeId && <ExtensionQR treeId={treeId} onClose={() => setShowQRModal(false)} />}
    </div>
  );
}