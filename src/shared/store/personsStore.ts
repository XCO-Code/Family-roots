import { create } from 'zustand';
import * as personsService from '../service/personsService';
import type { Person, CreatePersonDto, UpdatePersonDto } from '../models/personModel';

interface PersonsStore {
  persons: Person[];
  selectedPerson: Person | null;
  loading: boolean;
  error: string | null;

  getAllPersons: (tree_id: string) => Promise<void>;
  getPersonById: (id: string) => Promise<void>;
  createPerson: (dto: CreatePersonDto) => Promise<void>;
  updatePerson: (id: string, dto: UpdatePersonDto) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  setSelected: (person: Person | null) => void;
  clearPersons: () => void;
  clearError: () => void;
}

export const usePersonsStore = create<PersonsStore>((set) => ({
  persons:        [],
  selectedPerson: null,
  loading:        false,
  error:          null,

  getAllPersons: async (tree_id) => {
    set({ loading: true, error: null });
    try {
      const persons = await personsService.getAllPersons(tree_id);
      set({ persons, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  getPersonById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selectedPerson = await personsService.getPersonById(id);
      set({ selectedPerson, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createPerson: async (dto) => {
    set({ loading: true, error: null });
    try {
      const newPerson = await personsService.createPerson(dto);
      set((state) => ({ persons: [...state.persons, newPerson], loading: false }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updatePerson: async (id, dto) => {
    set({ loading: true, error: null });
    try {
      const updated = await personsService.updatePerson(id, dto);
      set((state) => ({
        loading: false,
        persons: state.persons.map((p) => (p.id === id ? updated : p)),
        selectedPerson: state.selectedPerson?.id === id ? updated : state.selectedPerson,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deletePerson: async (id) => {
    set({ loading: true, error: null });
    try {
      await personsService.deletePerson(id);
      set((state) => ({
        loading: false,
        persons: state.persons.filter((p) => p.id !== id),
        selectedPerson: state.selectedPerson?.id === id ? null : state.selectedPerson,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setSelected: (person) => set({ selectedPerson: person }),

  clearPersons: () => set({ persons: [], selectedPerson: null }),

  clearError: () => set({ error: null }),
}));
