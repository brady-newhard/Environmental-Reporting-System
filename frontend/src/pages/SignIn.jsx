import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url('/staticfiles/pipeline-bg.jpg')` }}>
      <div className="flex flex-col items-center z-20 mt-8 mb-4">
        <img src="/staticfiles/PIPE-Logo.png" alt="PIPE Logo" className="h-20 w-auto object-contain mb-2" />
        <span className="text-center text-sm text-zinc-200 italic font-medium">"Streamline the report. Elevate the result."</span>
      </div>
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative w-full max-w-md p-8 space-y-8 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-card-foreground">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="pl-10 w-full"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="pl-10 w-full"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignIn; 