import { create } from 'zustand';
import { Project } from '../types';
import { getLocalProjects } from './projectService';

interface ProjectState {
    projects: Project[];
    currentProject: Project | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setProjects: (projects: Project[]) => void;
    setCurrentProject: (project: Project | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    // Logic Helpers
    updateProjectLocally: (project: Project) => void;
    removeProjectLocally: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: getLocalProjects(),
    currentProject: null,
    isLoading: false,
    error: null,

    setProjects: (projects) => set({
        projects: Array.isArray(projects) ? projects.filter((p): p is Project => Boolean(p && typeof p === 'object' && p.id)) : [],
        error: null
    }),
    setCurrentProject: (currentProject) => set({ currentProject }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    updateProjectLocally: (updated) => set((state) => {
        if (!updated || !updated.id) return state;
        const currentList = Array.isArray(state.projects)
            ? state.projects.filter((p): p is Project => Boolean(p && typeof p === 'object' && p.id))
            : [];
        const exists = currentList.some(p => p.id === updated.id);
        const newProjects = exists
            ? currentList.map(p => p.id === updated.id ? updated : p)
            : [updated, ...currentList];
        return {
            projects: newProjects,
            currentProject: state.currentProject?.id === updated.id ? updated : state.currentProject
        };
    }),

    removeProjectLocally: (id) => set((state) => {
        const currentList = Array.isArray(state.projects)
            ? state.projects.filter((p): p is Project => Boolean(p && typeof p === 'object' && p.id))
            : [];
        return {
            projects: currentList.filter(p => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject
        };
    })
}));
