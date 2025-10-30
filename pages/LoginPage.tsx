import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const LoginPage: React.FC = () => {
  const { login, createAndLogin } = useAppContext();
  const [idInput, setIdInput] = useState('');

  const handleLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (idInput.trim()) {
      login(idInput.trim());
    }
  };

  const handleCreate = async () => {
    await createAndLogin();
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">CricketPro</h1>
        <p className="text-lg text-text-secondary mb-8">Live Overlay System</p>

        <div className="bg-secondary p-8 rounded-lg shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Welcome!</h2>
          
          <button
            onClick={handleCreate}
            className="w-full bg-highlight text-primary font-bold py-3 px-6 rounded-lg hover:bg-teal-300 transition-all shadow-lg text-lg mb-6"
          >
            ⚡ Create New Scorebook
          </button>
          
          <div className="flex items-center my-4">
            <hr className="flex-grow border-accent"/>
            <span className="mx-4 text-text-secondary font-semibold">OR</span>
            <hr className="flex-grow border-accent"/>
          </div>

          <form onSubmit={handleLoad} className="space-y-4">
            <p className="text-text-secondary text-sm">Have an ID? Load your existing scorebook here.</p>
            <input 
              type="text" 
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              placeholder="Enter Scorebook ID" 
              className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight font-mono" 
              required 
            />
            <button 
              type="submit" 
              className="w-full bg-secondary border-2 border-highlight text-highlight font-bold py-3 px-6 rounded-lg hover:bg-highlight hover:text-primary transition-colors"
            >
              Load Scorebook
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
