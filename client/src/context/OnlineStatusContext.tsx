import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface OnlineStatusContextType {
    isOnline: boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextType>({ isOnline: true });

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <OnlineStatusContext.Provider value={{ isOnline }}>
            {children}
        </OnlineStatusContext.Provider>
    );
}

export const useOnlineStatus = () => useContext(OnlineStatusContext);
