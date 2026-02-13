import { createContext, useContext, useState, type ReactNode } from 'react';

interface LayoutContextType {
    isEntryDialogOpen: boolean;
    openEntryDialog: () => void;
    closeEntryDialog: () => void;
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const openEntryDialog = () => setIsEntryDialogOpen(true);
    const closeEntryDialog = () => setIsEntryDialogOpen(false);
    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

    return (
        <LayoutContext.Provider value={{
            isEntryDialogOpen, openEntryDialog, closeEntryDialog,
            isSidebarCollapsed, toggleSidebar
        }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within LayoutProvider');
    }
    return context;
}
