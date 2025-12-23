import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const bgImage = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-0 md:p-6 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-900/50 backdrop-blur-xl md:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/10">
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-16 relative overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 z-0">
            <img src={bgImage} alt="Gaming" className="w-full h-full object-cover opacity-20 hover:opacity-30 transition-opacity duration-700"/>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-2xl">🎮</div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase italic">DadGaming<span className="text-indigo-500">Hub</span></span>
            </div>
            <h1 className="text-7xl font-black text-white leading-[0.9] mb-8 tracking-tighter uppercase italic">ZOCKEN <br/>IST KEIN <br/><span className="text-indigo-500">ALTER.</span></h1>
            <p className="text-slate-300 text-xl max-w-sm leading-relaxed mb-10 font-medium">Finde deinen neuen Squad. <br/><span className="text-slate-500 text-lg">Exklusiv für Väter, die wissen, dass das echte Spiel erst beginnt, wenn die Kids im Bett sind.</span></p>
          </div>
          <div className="relative z-10 flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-300 backdrop-blur-md">#NoToxic</span>
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-300 backdrop-blur-md">#DadLife</span>
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-300 backdrop-blur-md">#LateNightGaming</span>
          </div>
        </div>

        <div className="lg:col-span-5 p-8 md:p-16 bg-white flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic mb-2">Login</h2>
              <div className="h-2 w-16 bg-indigo-600 rounded-full"></div>
            </div>
            {error && (<div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-xl mb-8 text-sm font-bold shadow-sm">{error}</div>)}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">E-Mail Adresse</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all text-slate-900 font-medium" placeholder="name@beispiel.de" required/>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Passwort</label>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] font-bold text-indigo-600 uppercase hover:text-slate-900 transition-colors">Vergessen?</button>
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all text-slate-900 font-medium" placeholder="••••••••" required/>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 mt-4">{loading ? 'Verbindung wird aufgebaut...' : 'Mission starten'}</button>
            </form>
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Noch kein Profil?</p>
              <button onClick={() => navigate('/register')} className="w-full py-4 border-2 border-slate-900 rounded-2xl font-black text-slate-900 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">Jetzt beitreten</button>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 hidden md:block">
        <p className="text-slate-500 text-[9px] uppercase tracking-[0.4em] font-bold opacity-50">DadGamingHub // © 2025</p>
      </div>
    </div>
  );
}
