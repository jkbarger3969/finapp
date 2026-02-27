import { createContext, useContext, useState, type ReactNode } from 'react';

interface LayoutContextType {
    isEntryDialogOpen: boolean;
    openEntryDialog: () => void;
    closeEntryDialog: () => void;
    selectedDepartmentId: string | null;
    setSelectedDepartmentId: (id: string | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

    const openEntryDialog = () => setIsEntryDialogOpen(true);
    const closeEntryDialog = () => setIsEntryDialogOpen(false);

    return (
        <LayoutContext.Provider value={{
            isEntryDialogOpen, openEntryDialog, closeEntryDialog,
            selectedDepartmentId, setSelectedDepartmentId
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
