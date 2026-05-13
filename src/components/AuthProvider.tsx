'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const STORAGE_KEY = 'megaphone_auth';
const PASSWORD = 'ipai';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (password: string): boolean => {
    if (password === PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4A847] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function LoginScreen({ onLogin }: { onLogin: (password: string) => boolean }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center px-4">
      <div className={`w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img
            src="https://www.inceptionpoint.ai/wp-content/uploads/2025/08/cropped-Inception-Point-Logo-FINAL-RGB.png"
            alt="Inception Point AI"
            className="h-16 w-auto brightness-150"
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-xl font-semibold text-white/90 mb-1">
          Megaphone Analytics
        </h1>
        <p className="text-center text-sm text-white/40 mb-8">
          Enter password to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className={`w-full px-4 py-3 bg-[#12121f] border rounded-lg text-white placeholder-white/30 outline-none transition-colors ${
                error
                  ? 'border-red-500/60'
                  : 'border-[#1e1e35] focus:border-[#D4A847]/60'
              }`}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">Incorrect password</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#D4A847] hover:bg-[#c49a3f] text-[#0a0a1a] font-semibold rounded-lg transition-colors"
          >
            Enter
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-16 text-xs text-white/20">
        © 2026 Inception Point AI
      </p>
    </div>
  );
}
