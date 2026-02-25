import { useEffect, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
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
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  ArrowLeft,
  Plus,
  User,
  X,
  Save,
  Trash2,
  Heart,
  HeartOff,
  ChevronDown,
  ChevronUp,
  Calendar,
  UserCircle,
} from 'lucide-react';

import { useTreesStore }    from '../../shared/store/treesStore';
import { usePersonsStore }  from '../../shared/store/personsStore';
import { usePartnersStore } from '../../shared/store/partnersStore';
import type { Person, CreatePersonDto, UpdatePersonDto, Gender } from '../../shared/models/personModel';

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
    1: 'from-teal-500/20 to-teal-600/10 border-teal-500/40',
    2: 'from-sky-500/20 to-sky-600/10 border-sky-500/40',
    3: 'from-violet-500/20 to-violet-600/10 border-violet-500/40',
    4: 'from-rose-500/20 to-rose-600/10 border-rose-500/40',
  };
  const accentColors: Record<number, string> = {
    0: 'bg-amber-500',
    1: 'bg-teal-500',
    2: 'bg-sky-500',
    3: 'bg-violet-500',
    4: 'bg-rose-500',
  };

  const gen = Math.min(generation ?? 0, 4);
  const colorClass = generationColors[gen];
  const accentClass = accentColors[gen];
  const isMale = person.gender === 'male';
  const isFemale = person.gender === 'female';

  return (
    <div
      onClick={() => onSelect(person)}
      className={`
        relative w-48 cursor-pointer select-none
        rounded-2xl border bg-linear-to-b backdrop-blur-sm
        transition-all duration-200
        ${colorClass}
        ${isSelected ? 'ring-2 ring-white/40 scale-105 shadow-2xl shadow-black/50' : 'hover:scale-102 hover:shadow-xl shadow-black/30'}
      `}
      style={{ boxShadow: isSelected ? '0 0 30px rgba(255,255,255,0.08)' : undefined }}
    >
      {/* Accent bar top */}
      <div className={`${accentClass} h-1 w-full rounded-t-2xl`} />

      {/* Handles */}
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none', top: -2 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none', bottom: -2 }} />

      <div className="p-3">
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${isMale ? 'bg-sky-500/20 text-sky-300' : isFemale ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-500/20 text-slate-300'}
          `}>
            {person.photo_url ? (
              <img
                src={person.photo_url}
                alt={person.name}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <User size={18} />
            )}
          </div>

          {/* Name + gender */}
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">
              {person.name}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {isMale ? '♂ Hombre' : isFemale ? '♀ Mujer' : '⚧ Otro'}
            </p>
          </div>
        </div>

        {/* Dates */}
        {(person.born || person.died) && (
          <div className="flex items-center gap-1.5 text-white/50 text-xs mt-1">
            <Calendar size={10} className="shrink-0" />
            <span>
              {person.born ?? '?'}
              {person.died ? ` — ${person.died}` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export const nodeTypes = { person: PersonNode };

function buildGraphElements(
  persons: Person[],
  partners: import('../../shared/models/partnerModel').Partner[],
  selectedId: string | null,
  onSelect: (p: Person) => void,
): { nodes: Node[]; edges: Edge[] } {
  // Calcular generación de cada persona (BFS desde raíces)
  const generationMap = new Map<string, number>();
  const childrenOf = new Map<string, string[]>();

  persons.forEach((p) => {
    if (p.father_id) {
      childrenOf.set(p.father_id, [...(childrenOf.get(p.father_id) ?? []), p.id]);
    }
    if (p.mother_id) {
      childrenOf.set(p.mother_id, [...(childrenOf.get(p.mother_id) ?? []), p.id]);
    }
  });

  // Raíces = personas sin padre ni madre en el árbol
  const personIds = new Set(persons.map((p) => p.id));
  const roots = persons.filter(
    (p) =>
      (!p.father_id || !personIds.has(p.father_id)) &&
      (!p.mother_id || !personIds.has(p.mother_id)),
  );

  const queue: Array<{ id: string; gen: number }> = roots.map((r) => ({ id: r.id, gen: 0 }));
  while (queue.length) {
    const { id, gen } = queue.shift()!;
    if (generationMap.has(id)) continue;
    generationMap.set(id, gen);
    (childrenOf.get(id) ?? []).forEach((childId) => queue.push({ id: childId, gen: gen + 1 }));
  }
  // personas que no se alcanzaron por BFS
  persons.forEach((p) => { if (!generationMap.has(p.id)) generationMap.set(p.id, 0); });

  // Agrupar por generación para calcular posición X
  const genGroups = new Map<number, string[]>();
  generationMap.forEach((gen, id) => {
    genGroups.set(gen, [...(genGroups.get(gen) ?? []), id]);
  });

  const NODE_W = 192 + 40; // node width + gap
  const NODE_H = 200;      // vertical spacing

  const nodes: Node[] = persons.map((p) => {
    const gen = generationMap.get(p.id) ?? 0;
    const group = genGroups.get(gen) ?? [p.id];
    const idx = group.indexOf(p.id);
    const total = group.length;
    const x = (idx - (total - 1) / 2) * NODE_W;
    const y = gen * NODE_H;

    return {
      id: p.id,
      type: 'person',
      position: { x, y },
      data: {
        person: p,
        isSelected: selectedId === p.id,
        onSelect,
        generation: gen,
      } satisfies PersonNodeData,
    };
  });

  const edges: Edge[] = [];

  // Padre → hijo  /  Madre → hijo
  persons.forEach((p) => {
    if (p.father_id && personIds.has(p.father_id)) {
      edges.push({
        id: `f-${p.father_id}-${p.id}`,
        source: p.father_id,
        target: p.id,
        type: 'smoothstep',
        style: { stroke: '#38bdf8', strokeWidth: 1.5, opacity: 0.6 },
        animated: false,
      });
    }
    if (p.mother_id && personIds.has(p.mother_id)) {
      edges.push({
        id: `m-${p.mother_id}-${p.id}`,
        source: p.mother_id,
        target: p.id,
        type: 'smoothstep',
        style: { stroke: '#f472b6', strokeWidth: 1.5, opacity: 0.6 },
        animated: false,
      });
    }
  });

  // Parejas (línea horizontal punteada)
  const drawn = new Set<string>();
  partners.forEach((pt) => {
    const key = [pt.person_id, pt.partner_id].sort().join('-');
    if (drawn.has(key)) return;
    if (!personIds.has(pt.person_id) || !personIds.has(pt.partner_id)) return;
    drawn.add(key);
    edges.push({
      id: `p-${key}`,
      source: pt.person_id,
      target: pt.partner_id,
      type: 'straight',
      style: { stroke: '#a78bfa', strokeWidth: 1.5, strokeDasharray: '5 4', opacity: 0.5 },
    });
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
  onRemovePartner: (partnerRecordId: string) => Promise<void>;
  loading: boolean;
}

function Sidebar({
  mode, persons, partners, selectedPerson, treeId,
  onClose, onCreateOpen, onSubmit, onDeletePerson,
  onAddPartner, onRemovePartner, loading,
}: SidebarProps) {
  const [form, setForm] = useState<Partial<CreatePersonDto>>({});
  const [newPartnerId, setNewPartnerId] = useState('');
  const [showPartners, setShowPartners] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync form when selection or mode changes
  useEffect(() => {
    if (mode === 'edit' && selectedPerson) {
      setForm({
        name: selectedPerson.name,
        gender: selectedPerson.gender,
        born: selectedPerson.born ?? '',
        died: selectedPerson.died ?? '',
        photo_url: selectedPerson.photo_url ?? '',
        bio: selectedPerson.bio ?? '',
        father_id: selectedPerson.father_id ?? '',
        mother_id: selectedPerson.mother_id ?? '',
      });
    } else if (mode === 'create') {
      setForm({ tree_id: treeId, gender: 'male' });
    }
    setConfirmDelete(false);
  }, [mode, selectedPerson, treeId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '' && v !== undefined),
    );
    await onSubmit(cleaned as unknown as CreatePersonDto);
  };

  const personPartners = partners.filter(
    (pt) => selectedPerson && (pt.person_id === selectedPerson.id || pt.partner_id === selectedPerson.id),
  );

  const availableForPartner = persons.filter(
    (p) =>
      p.id !== selectedPerson?.id &&
      !personPartners.some(
        (pt) => pt.person_id === p.id || pt.partner_id === p.id,
      ),
  );

  // ── Campo genérico ─────────────────────────────────────────────────────────
  const Field = ({
    label, field, type = 'text', placeholder = '',
  }: {
    label: string;
    field: keyof CreatePersonDto;
    type?: string;
    placeholder?: string;
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-white/40 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form[field] as string) ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
        className="
          bg-white/5 border border-white/10 rounded-xl px-3 py-2
          text-sm text-white placeholder-white/20
          focus:outline-none focus:border-teal-400/60 focus:bg-white/8
          transition-all duration-150
        "
      />
    </div>
  );

  if (mode === 'idle') {
    return (
      <aside className="w-72 bg-[#0f1117] border-l border-white/5 flex flex-col">
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
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl
              bg-teal-500/20 border border-teal-500/30 text-teal-300
              hover:bg-teal-500/30 transition-all text-sm font-medium
            "
          >
            <Plus size={15} />
            Nueva persona
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-[#0f1117] border-l border-white/5 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {mode === 'create' ? 'Nueva persona' : 'Editar persona'}
          </h3>
          {mode === 'edit' && selectedPerson && (
            <p className="text-xs text-white/30 mt-0.5 truncate max-w-45">
              {selectedPerson.name}
            </p>
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
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

          {/* Avatar preview + photo url */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
              {form.photo_url ? (
                <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={22} className="text-white/20" />
              )}
            </div>
            <Field label="Foto (URL)" field="photo_url" placeholder="https://..." />
          </div>

          <Field label="Nombre completo *" field="name" placeholder="Ej: María García" />

          {/* Gender selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-white/40 uppercase tracking-widest">Género</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['male', 'female', 'other'] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, gender: g }))}
                  className={`
                    py-2 rounded-xl text-xs font-medium transition-all border
                    ${form.gender === g
                      ? g === 'male'   ? 'bg-sky-500/25  border-sky-400/50  text-sky-300'
                      : g === 'female' ? 'bg-rose-500/25 border-rose-400/50 text-rose-300'
                      :                  'bg-slate-500/25 border-slate-400/50 text-slate-300'
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/8'
                    }
                  `}
                >
                  {g === 'male' ? '♂ H' : g === 'female' ? '♀ M' : '⚧ O'}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nacimiento" field="born" type="date" />
            <Field label="Fallecimiento" field="died" type="date" />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-white/40 uppercase tracking-widest">Biografía</label>
            <textarea
              rows={2}
              placeholder="Breve descripción..."
              value={form.bio ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="
                bg-white/5 border border-white/10 rounded-xl px-3 py-2
                text-sm text-white placeholder-white/20 resize-none
                focus:outline-none focus:border-teal-400/60 transition-all
              "
            />
          </div>

          {/* Parents */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-white/40 uppercase tracking-widest">Padres</label>
            <div className="flex flex-col gap-1.5">
              {(['father_id', 'mother_id'] as const).map((field) => {
                const label    = field === 'father_id' ? '♂ Padre' : '♀ Madre';
                const filterGender: Gender = field === 'father_id' ? 'female' : 'male';
                const options  = persons.filter(
                  (p) => p.id !== selectedPerson?.id && p.gender !== filterGender,
                );
                return (
                  <select
                    key={field}
                    value={(form[field] as string) ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value || undefined }))}
                    className="
                      bg-white/5 border border-white/10 rounded-xl px-3 py-2
                      text-sm text-white focus:outline-none focus:border-teal-400/60
                      transition-all appearance-none
                    "
                  >
                    <option value="">{label} — ninguno</option>
                    {options.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.name?.trim()}
            className="
              flex items-center justify-center gap-2
              bg-teal-500/20 border border-teal-500/40 text-teal-300
              hover:bg-teal-500/30 disabled:opacity-40 disabled:cursor-not-allowed
              rounded-xl py-2.5 text-sm font-semibold transition-all
            "
          >
            <Save size={14} />
            {loading ? 'Guardando...' : mode === 'create' ? 'Crear persona' : 'Guardar cambios'}
          </button>
        </form>

        {/* Partners section — solo en modo edit */}
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
                  {/* Lista de parejas */}
                  {personPartners.length === 0 ? (
                    <p className="text-white/25 text-xs text-center py-2">Sin parejas registradas</p>
                  ) : (
                    personPartners.map((pt) => {
                      const partnerId   = pt.person_id === selectedPerson.id ? pt.partner_id : pt.person_id;
                      const partnerData = persons.find((p) => p.id === partnerId);
                      return (
                        <div
                          key={pt.id}
                          className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 border border-white/8"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Heart size={11} className="text-rose-400 shrink-0" />
                            <span className="text-sm text-white/70 truncate">
                              {partnerData?.name ?? partnerId}
                            </span>
                          </div>
                          <button
                            onClick={() => onRemovePartner(pt.id)}
                            className="text-white/20 hover:text-red-400 transition-colors shrink-0 ml-2"
                          >
                            <HeartOff size={13} />
                          </button>
                        </div>
                      );
                    })
                  )}

                  {/* Agregar pareja */}
                  {availableForPartner.length > 0 && (
                    <div className="flex gap-2 mt-1">
                      <select
                        value={newPartnerId}
                        onChange={(e) => setNewPartnerId(e.target.value)}
                        className="
                          flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2
                          text-xs text-white focus:outline-none focus:border-teal-400/60 transition-all
                        "
                      >
                        <option value="">Seleccionar...</option>
                        {availableForPartner.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!newPartnerId}
                        onClick={async () => {
                          if (newPartnerId) {
                            await onAddPartner(newPartnerId);
                            setNewPartnerId('');
                          }
                        }}
                        className="
                          px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30
                          text-rose-300 hover:bg-rose-500/30 disabled:opacity-40
                          disabled:cursor-not-allowed transition-all text-xs
                        "
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
                  className="
                    w-full flex items-center justify-center gap-2
                    text-red-400/60 hover:text-red-400 text-xs
                    py-2 rounded-xl hover:bg-red-500/10 transition-all border border-transparent
                    hover:border-red-500/20
                  "
                >
                  <Trash2 size={13} />
                  Eliminar persona
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-red-400/80 text-center">¿Confirmar eliminación?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePerson(selectedPerson.id)}
                      className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs hover:bg-red-500/30 transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal TreeEditor
// ─────────────────────────────────────────────────────────────────────────────
export { PersonNode, buildGraphElements };

export default function TreeEditor() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();

  // ── Stores ─────────────────────────────────────────────────────────────────
  const tree = useTreesStore((s) => s.selectedTree);
  const getTreeById = useTreesStore((s) => s.getTreeById);

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

  // ── React Flow state ───────────────────────────────────────────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // ── Sidebar mode ───────────────────────────────────────────────────────────
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('idle');

  // ── Redirect si no hay treeId ──────────────────────────────────────────────
  useEffect(() => {
    if (!treeId) navigate('/dashboard');
  }, [treeId, navigate]);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!treeId) return;
    getTreeById(treeId);
    getAllPersons(treeId);
  }, [treeId]);

  // ── Cargar partners cuando cambian las personas ────────────────────────────
  useEffect(() => {
    persons.forEach((p) => getAllPartners(p.id));
  }, [persons.length]);

  // ── Rebuild graph cuando cambian persons, partners o selección ─────────────
  const handleSelectNode = useCallback((person: Person) => {
    setSelectedPerson(person);
    setSidebarMode('edit');
  }, [setSelectedPerson]);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraphElements(
      persons,
      partners,
      selectedPerson?.id ?? null,
      handleSelectNode,
    );
    setNodes(n);
    setEdges(e);
  }, [persons, partners, selectedPerson?.id, handleSelectNode]);

  // ── Handlers ───────────────────────────────────────────────────────────────
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
    await getAllPartners(selectedPerson.id);
  };

  const handleRemovePartner = async (partnerRecordId: string) => {
    await deletePartner(partnerRecordId);
    if (selectedPerson) await getAllPartners(selectedPerson.id);
  };

  const openCreate = () => {
    setSelectedPerson(null);
    setSidebarMode('create');
  };

  const closeSidebar = () => {
    setSelectedPerson(null);
    setSidebarMode('idle');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-screen bg-[#0a0c10] flex flex-col overflow-hidden">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="
        h-14 shrink-0 flex items-center justify-between
        px-5 bg-[#0f1117] border-b border-white/5
      ">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="
              flex items-center gap-2 text-white/40 hover:text-white/80
              transition-colors text-sm
            "
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400" />
            <h1 className="text-white font-semibold text-sm">
              {tree?.name ?? 'Cargando...'}
            </h1>
            {tree?.description && (
              <span className="text-white/30 text-xs hidden md:block">
                — {tree.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white/25 text-xs">
            {persons.length} {persons.length === 1 ? 'persona' : 'personas'}
          </span>
          <button
            onClick={openCreate}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-xl
              bg-teal-500/15 border border-teal-500/25 text-teal-300
              hover:bg-teal-500/25 transition-all text-xs font-medium
            "
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>
      </nav>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* React Flow canvas */}
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
              <button
                onClick={openCreate}
                className="
                  flex items-center gap-2 px-5 py-2.5 rounded-xl
                  bg-teal-500/20 border border-teal-500/30 text-teal-300
                  hover:bg-teal-500/30 transition-all text-sm font-medium
                "
              >
                <Plus size={15} />
                Agregar primera persona
              </button>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              onlyRenderVisibleElements
              minZoom={0.2}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
              style={{ background: 'transparent' }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1}
                color="rgba(255,255,255,0.04)"
              />
              <Controls
                style={{
                  background: 'rgba(15,17,23,0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                }}
              />
              <MiniMap
                style={{
                  background: 'rgba(15,17,23,0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                }}
                nodeColor={() => 'rgba(45,212,191,0.4)'}
                maskColor="rgba(0,0,0,0.4)"
              />

              {/* Leyenda de colores de conexión */}
              <Panel position="bottom-left">
                <div className="
                  bg-[#0f1117]/90 border border-white/8 rounded-xl px-3 py-2
                  flex flex-col gap-1 text-xs
                ">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-px bg-sky-400 opacity-70" />
                    <span className="text-white/40">Línea paterna</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-px bg-pink-400 opacity-70" />
                    <span className="text-white/40">Línea materna</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 border-t border-dashed border-violet-400 opacity-70" />
                    <span className="text-white/40">Pareja</span>
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar
          mode={sidebarMode}
          persons={persons}
          partners={partners}
          selectedPerson={selectedPerson}
          treeId={treeId ?? ''}
          onClose={closeSidebar}
          onCreateOpen={openCreate}
          onSubmit={handleFormSubmit}
          onDeletePerson={handleDeletePerson}
          onAddPartner={handleAddPartner}
          onRemovePartner={handleRemovePartner}
          loading={personsLoading}
        />
      </div>
    </div>
  );
}