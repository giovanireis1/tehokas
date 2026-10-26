import { useState, useEffect } from 'react';

export default function CookieBanner({ user }) {
    const [showCookieBanner, setShowCookieBanner] = useState(false);

    useEffect(() => {
        if (user && !localStorage.getItem(`tehokas_cookies_accepted_${user.id}`)) {
            setShowCookieBanner(true);
        }
    }, [user]);

    const handleConsent = (type) => {
        if (user) {
            localStorage.setItem(`tehokas_cookies_accepted_${user.id}`, type);
        }
        setShowCookieBanner(false);
    };

    if (!showCookieBanner) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 z-50 bg-slate-900/95 text-white dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div className="text-xs">
                    <strong className="block text-sm font-semibold mb-0.5">Política de Cache & Privacidade de Dados</strong>
                    <p className="text-slate-300">Utilizamos armazenamento local para manter sua sessão rápida e segura no motor de automação.</p>
                </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
                <button onClick={() => handleConsent('essential_only')} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-700">
                    Apenas Essenciais
                </button>
                <button onClick={() => handleConsent('accepted')} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-red-500/30">
                    Aceitar Todos
                </button>
            </div>
        </div>
    );
}