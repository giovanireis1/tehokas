import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: 'sgiovanireis@gmail.com',
        password: '12345678',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout title="Login - Tehokas Engine">
            {/* Header / Logo */}
            <div className="text-center mb-8">
                <h1 className="font-bold text-3xl text-red-500 tracking-wider">
                    TEHOKAS<span className="text-white">.IO</span>
                </h1>
                <p className="text-sm text-slate-400 mt-2">Acesse a plataforma de automação e workflows</p>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-medium">
                    {status}
                </div>
            )}

            {errors && Object.keys(errors).length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {Object.values(errors)[0]}
                </div>
            )}

            {/* Formulário */}
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail Corporativo</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition"
                        placeholder="sgiovanireis@gmail.com"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-medium text-slate-300">Senha</label>
                        <a href="#" className="text-xs text-red-400 hover:underline">Esqueceu?</a>
                    </div>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition"
                        placeholder="••••••••"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-red-600 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="remember" className="ml-2 text-xs text-slate-400 cursor-pointer">
                        Lembrar neste dispositivo
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded-xl text-sm transition shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50"
                >
                    {processing ? 'Acessando...' : 'Entrar na Plataforma'}
                </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
                Credenciais de Teste: <strong className="text-slate-400">sgiovanireis@gmail.com</strong> / <strong className="text-slate-400">12345678</strong>
            </div>
        </GuestLayout>
    );
}