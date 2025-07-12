import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Get the page the user was trying to access, or default to "/"
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

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
      navigate(from, { replace: true }); // Redirect to the page the user wanted
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
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: 'url(/pipeline-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      
      {/* Desktop Layout: Logo/Slogan on left, Sign-in on right */}
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          
          {/* Left Side - Logo and Slogan (Desktop) / Centered (Mobile) */}
          <div className="text-center lg:text-left lg:w-1/2 lg:pr-12 mb-8 lg:mb-0 lg:pl-12 lg:-mt-32">
            <div className="relative">
              <img
                className="mx-auto lg:mx-0 h-48 lg:h-72 w-auto"
                src="/PIPE-Logo.png"
                alt="PIPE Logo"
              />
              <p className="text-white/90 text-sm lg:text-base italic font-light absolute bottom-8 left-1/2 lg:left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Streamlining Reports. Elevating Results.
              </p>
            </div>
          </div>
          
          {/* Right Side - Sign-in Form */}
          <div className="lg:w-1/2 lg:pl-12">
            <div className="max-w-md mx-auto lg:mx-0 space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
                <p className="mt-2 text-white/80">Sign in to your account</p>
              </div>
              
              {error && (
                <div className="p-3 text-sm text-red-200 bg-red-900/30 border border-red-500/30 rounded-md">
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
                      className="pl-10 pr-10 w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                    />
                    <button
                      type="button"
                      onClick={handleClickShowPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
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
      </div>
    </div>
  );
};

export default SignIn; 