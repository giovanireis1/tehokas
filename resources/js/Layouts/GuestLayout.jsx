import { Head } from '@inertiajs/react';

export default function GuestLayout({ title, children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-100 font-sans antialiased selection:bg-red-500 selection:text-white">
            <Head title={title || 'Tehokas Engine'} />
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
                {children}
            </div>
        </div>
    );
}