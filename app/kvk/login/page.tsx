'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('Officer');

  useEffect(() => {
    const user = localStorage.getItem('kvk_user');
    if (user) {
      router.push('/kvk');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('kvk_user', JSON.stringify({ role, loggedIn: true }));
      router.push('/kvk');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md z-10 border-t-8 border-green-600">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-100 p-4 rounded-full mb-4 shadow-inner">
            <Leaf size={48} className="text-green-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">KisaanSaathi</h1>
          <p className="text-sm font-semibold text-green-700 tracking-wider uppercase mt-1">
            KVK {role} Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Role Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['Officer', 'Admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                  role === r ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                placeholder="Username / KVK ID"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3.5 rounded-lg shadow-lg transform transition active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Access Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          Restricted Government Access • v2.5.0
        </p>
      </div>
    </div>
  );
}