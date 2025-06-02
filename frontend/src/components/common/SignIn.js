import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen w-full flex items-center md:items-start justify-center relative overflow-hidden bg-neutral-100 dark:bg-black">
      {/* Mobile background */}
      <img src="/pipeline-bg.jpg" alt="Pipeline background mobile" className="absolute inset-0 w-full h-full object-cover z-0 block md:hidden" />
      {/* Desktop background */}
      <img src="/pipeline-bg2.jpeg" alt="Pipeline background desktop" className="absolute inset-0 w-full h-full object-cover z-0 hidden md:block" />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />
      {/* Card */}
      <div className="relative z-20 w-full max-w-[400px] md:w-1/4 mx-auto p-8 flex flex-col gap-6 rounded-xl border border-neutral-200 dark:border-white/20 shadow-lg bg-gray-700/70 backdrop-blur-md mt-0 md:mt-24">
        <h2 className="text-2xl font-heading font-bold text-center text-white mb-2">Sign In</h2>
        {error && (
          <div className="p-2 text-sm text-error bg-error/10 rounded-md text-center mb-2 font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <Input
            id="username"
            name="username"
            type="text"
            required
            placeholder="Username or Email"
            value={formData.username}
            onChange={handleChange}
            className="w-11/12 mx-auto px-4 py-3 mb-4 bg-white/90 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-accent rounded-lg shadow-sm text-base transition-all"
            autoComplete="username"
          />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-11/12 mx-auto px-4 py-3 mb-6 bg-white/90 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-accent rounded-lg shadow-sm text-base transition-all"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            className="bg-accent hover:bg-accent-dark text-white font-semibold text-sm py-2 px-4 rounded shadow w-auto mx-auto mt-2"
          >
            Log in
          </Button>
        </form>
        <div className="flex flex-col gap-2 mt-2">
          <RouterLink
            to="/forgot-password"
            className="text-sm text-accent hover:underline text-center font-medium"
          >
            Forgot password?
          </RouterLink>
          <RouterLink
            to="/signup"
            className="text-sm text-accent hover:underline text-center font-medium"
          >
            Click here to create an account
          </RouterLink>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 