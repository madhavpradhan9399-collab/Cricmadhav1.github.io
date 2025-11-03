
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const LoginPage: React.FC = () => {
  const { signIn, signUp, signInWithGoogle, isFirebaseConfigured, initializationError } = useAppContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      const friendlyMessage = err.message
        .replace('Firebase: ', '')
        .replace(/ \(auth\/.*\)\.$/, '');
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
      setError(null);
      setIsLoading(true);
      try {
          await signInWithGoogle();
      } catch (err: any) {
         const friendlyMessage = err.message
            .replace('Firebase: ', '')
            .replace(/ \(auth\/.*\)\.$/, '');
         setError(friendlyMessage);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">CricketPro</h1>
        <p className="text-lg text-text-secondary mb-8">Live Overlay System</p>

        <div className="bg-secondary p-8 rounded-lg shadow-2xl">
          {initializationError && (
            <div className="bg-yellow-900 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg relative mb-6 text-left" role="alert">
              <strong className="font-bold">Loading Error!</strong>
              <p className="text-sm mt-1">{initializationError}</p>
            </div>
          )}

          {!isFirebaseConfigured && (
            <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative mb-6 text-left" role="alert">
              <strong className="font-bold">Configuration Needed!</strong>
              <p className="text-sm mt-1">Firebase is not set up correctly. Please update the <strong>firebase.ts</strong> file with your project credentials to enable authentication and data persistence.</p>
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-6">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
          
          {error && (
             <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative mb-6 text-left text-sm" role="alert">
                {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address" 
              className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight font-mono" 
              required 
            />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight font-mono" 
              required 
            />
            <button 
              type="submit" 
              disabled={isLoading || !isFirebaseConfigured}
              className="w-full bg-highlight text-primary font-bold py-3 px-6 rounded-lg hover:bg-teal-300 transition-all shadow-lg text-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-accent"/>
            <span className="mx-4 text-text-secondary font-semibold">OR</span>
            <hr className="flex-grow border-accent"/>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading || !isFirebaseConfigured}
            className="w-full bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A653" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
            Sign in with Google
          </button>
          
          <p className="mt-8 text-sm text-text-secondary">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="font-semibold text-highlight hover:text-teal-300 ml-1">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;