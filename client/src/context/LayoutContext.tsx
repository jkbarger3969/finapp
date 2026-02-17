import { createContext, useContext, useState, type ReactNode } from 'react';

interface LayoutContextType {
    isEntryDialogOpen: boolean;
    openEntryDialog: () => void;
    closeEntryDialog: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

    const openEntryDialog = () => setIsEntryDialogOpen(true);
    const closeEntryDialog = () => setIsEntryDialogOpen(false);

    return (
        <LayoutContext.Provider value={{
            isEntryDialogOpen, openEntryDialog, closeEntryDialog
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
