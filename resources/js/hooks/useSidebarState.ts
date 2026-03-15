import { create } from 'zustand';

interface SidebarState {
    isOpen: boolean;
    isCollapsed: boolean;
    toggle: () => void;
    collapse: () => void;
    close: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isOpen: false,
    isCollapsed: typeof window !== 'undefined'
        ? localStorage.getItem('sidebar-collapsed') === 'true'
        : false,
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    collapse: () =>
        set((state) => {
            const next = !state.isCollapsed;
            localStorage.setItem('sidebar-collapsed', String(next));
            return { isCollapsed: next };
        }),
    close: () => set({ isOpen: false }),
}));
