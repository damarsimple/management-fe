import React from 'react'

import create from "zustand";

interface ModalStore {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    children: React.ReactNode;
    setChildren: (children: React.ReactNode) => void;
    openWithChildren: (children: React.ReactNode) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false, children: null }),
    children: null,
    setChildren: (children) => set({ children }),
    openWithChildren: (children) => set({ isOpen: true, children }),
}));


export default function ModalUI() {
    const { openWithChildren } = useModalStore();
    return (
        <div>ModalUI</div>
    )
}
