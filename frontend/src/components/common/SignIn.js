import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock } from 'lucide-react';

const SignIn = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login/', {
        username: formData.username,
        password: formData.password
      });
      await login(response.data.token, response.data.username, response.data.first_name);
      navigate('/');
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid username or password');
        } else if (err.response.status === 400) {
          setError(err.response.data.detail || 'Please provide both username and password');
        } else {
          setError('An error occurred. Please try again.');
        }
      } else if (err.request) {
        setError('Unable to connect to the server. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url('/static/pipeline-bg.jpg')` }}>
      <div className="absolute inset-0 bg-black/50 z-0" />
      {/* Left: Logo and Quote */}
      <div className="flex flex-col items-center justify-start flex-1 z-10 px-4 md:px-0 md:pl-12 mb-4 md:mb-0">
        <img src="/PIPE-Logo.png" alt="PIPE Logo" className="h-80 md:h-80 lg:h-80 w-auto object-contain mb-[-4rem]" />
        <span className="text-center text-base md:text-lg lg:text-lg text-zinc-200 italic font-medium w-full whitespace-nowrap">"Streamline the report. Elevate the result."</span>
      </div>
      {/* Right: Sign In Card */}
      <div className="flex flex-col items-center justify-center flex-1 z-10 px-4 md:px-0 md:pr-16">
        <div className="relative w-full max-w-md p-8 space-y-8 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
            <p className="mt-2 text-white/80">Sign in to your account</p>
          </div>
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  className="pl-10 w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="pl-10 w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-black/90 text-white font-semibold"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 