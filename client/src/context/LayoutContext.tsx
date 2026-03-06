import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface LayoutContextType {
    isEntryDialogOpen: boolean;
    openEntryDialog: () => void;
    closeEntryDialog: () => void;
    selectedDepartmentId: string | null;
    setSelectedDepartmentId: (id: string | null) => void;
    refreshTrigger: number;
    triggerRefresh: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const openEntryDialog = () => setIsEntryDialogOpen(true);
    const closeEntryDialog = () => setIsEntryDialogOpen(false);
    const triggerRefresh = useCallback(() => setRefreshTrigger(prev => prev + 1), []);

    return (
        <LayoutContext.Provider value={{
            isEntryDialogOpen, openEntryDialog, closeEntryDialog,
            selectedDepartmentId, setSelectedDepartmentId,
            refreshTrigger, triggerRefresh
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
