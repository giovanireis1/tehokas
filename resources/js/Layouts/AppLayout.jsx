import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import CookieBanner from '@/Components/CookieBanner';

export default function AppLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    });

    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <div className="h-full bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 font-sans antialiased min-h-screen flex flex-col">
            <div className="flex h-screen overflow-hidden relative">
                
                {/* Sidebar */}
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* Conteúdo Principal */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200 min-w-0">
                    
                    {/* TopBar */}
                    <TopBar header={header} user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

                    <main className="p-6 flex-1 flex flex-col min-h-0">
                        {children}
                    </main>
                </div>
            </div>

            {/* Cookie Banner */}
            <CookieBanner user={user} />
        </div>
    );
}