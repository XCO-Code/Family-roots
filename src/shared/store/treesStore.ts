import { create } from 'zustand';
import * as treesService from '../service/treesService';
import type { Tree, TreeDto } from '../models/treeModel';

interface TreesStore {
  trees: Tree[];
  selectedTree: Tree | null;
  loading: boolean;
  error: string | null;

  getAllTrees: () => Promise<void>;
  getTreeById: (id: string) => Promise<void>;
  createTree: (dto: TreeDto) => Promise<void>;
  updateTree: (id: string, dto: TreeDto) => Promise<void>;
  deleteTree: (id: string) => Promise<void>;
  setSelected: (tree: Tree | null) => void;
  clearError: () => void;
}

export const useTreesStore = create<TreesStore>((set) => ({
  trees:        [],
  selectedTree: null,
  loading:      false,
  error:        null,

  getAllTrees: async () => {
    set({ loading: true, error: null });
    try {
      const trees = await treesService.getAllTrees();
      set({ trees, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  getTreeById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selectedTree = await treesService.getTreeById(id);
      set({ selectedTree, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createTree: async (dto) => {
    set({ loading: true, error: null });
    try {
      const newTree = await treesService.createTree(dto);
      set((state) => ({ trees: [newTree, ...state.trees], loading: false }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateTree: async (id, dto) => {
    set({ loading: true, error: null });
    try {
      const updated = await treesService.updateTree(id, dto);
      set((state) => ({
        loading: false,
        trees: state.trees.map((t) => (t.id === id ? updated : t)),
        selectedTree: state.selectedTree?.id === id ? updated : state.selectedTree,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteTree: async (id) => {
    set({ loading: true, error: null });
    try {
      await treesService.deleteTree(id);
      set((state) => ({
        loading: false,
        trees: state.trees.filter((t) => t.id !== id),
        selectedTree: state.selectedTree?.id === id ? null : state.selectedTree,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setSelected: (tree) => set({ selectedTree: tree }),

  clearError: () => set({ error: null }),
}));
