import { create } from 'zustand';
import * as partnersService from '../service/partnersService';
import type { Partner, CreatePartnerDto, UpdatePartnerDto } from '../models/partnerModel';

interface PartnersStore {
  partners: Partner[];
  selectedPartner: Partner | null;
  loading: boolean;
  error: string | null;

  getAllPartners: (person_id: string) => Promise<void>;
  getPartnerById: (id: string) => Promise<void>;
  createPartner: (dto: CreatePartnerDto) => Promise<void>;
  updatePartner: (id: string, dto: UpdatePartnerDto) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  setSelected: (partner: Partner | null) => void;
  clearPartners: () => void;
  clearError: () => void;
}

export const usePartnersStore = create<PartnersStore>((set) => ({
  partners: [],
  selectedPartner: null,
  loading: false,
  error: null,

  getAllPartners: async (person_id) => {
    try {
      const fresh = await partnersService.getAllPartners(person_id);
      set((state) => {
        const others = state.partners.filter(
          (p) => p.person_id !== person_id && p.partner_id !== person_id,
        );
        const merged = [...others, ...fresh];
        const unique = Array.from(new Map(merged.map((p) => [p.id, p])).values());
        return { partners: unique };
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  getPartnerById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selectedPartner = await partnersService.getPartnerById(id);
      set({ selectedPartner, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createPartner: async (dto) => {
    set({ loading: true, error: null });
    try {
      const newPartner = await partnersService.createPartner(dto);
      set((state) => ({
        loading: false,
        partners: state.partners.some((p) => p.id === newPartner.id)
          ? state.partners
          : [...state.partners, newPartner],
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updatePartner: async (id, dto) => {
    set({ loading: true, error: null });
    try {
      const updated = await partnersService.updatePartner(id, dto);
      set((state) => ({
        loading: false,
        partners: state.partners.map((p) => (p.id === id ? updated : p)),
        selectedPartner: state.selectedPartner?.id === id ? updated : state.selectedPartner,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deletePartner: async (id) => {
    set({ loading: true, error: null });
    try {
      await partnersService.deletePartner(id);
      set((state) => ({
        loading: false,
        partners: state.partners.filter((p) => p.id !== id),
        selectedPartner: state.selectedPartner?.id === id ? null : state.selectedPartner,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setSelected: (partner) => set({ selectedPartner: partner }),
  clearPartners: () => set({ partners: [], selectedPartner: null }),
  clearError: () => set({ error: null }),
}));