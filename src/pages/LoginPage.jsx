import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { isAuthenticated, isLoading: authLoading, signIn, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Redirect if already authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    if (!email.trim()) {
      setFormError('Vui lòng nhập email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Email không hợp lệ');
      return false;
    }
    if (!password) {
      setFormError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setFormError(error.message);
      }
    } catch (err) {
      setFormError('Đã xảy ra lỗi không mong muốn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = formError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl shadow-blue-500/30 mb-4">
            <TrendingUp size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Phương Lê Store</h1>
          <p className="text-gray-500 mt-2">Đăng nhập để quản lý cửa hàng</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {displayError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                <AlertCircle size={20} className="flex-shrink-0" />
                <p className="text-sm font-medium">{displayError}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError('');
                  }}
                  placeholder="email@example.com"
                  className="
                    w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl
                    text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                  "
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormError('');
                  }}
                  placeholder="••••••••"
                  className="
                    w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl
                    text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                  "
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full py-4 px-6 rounded-xl font-semibold text-white
                bg-gradient-to-r from-blue-500 to-cyan-600
                hover:from-blue-600 hover:to-cyan-700
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 transform active:scale-[0.98]
                shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
              "
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2026 Phương Lê Store. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
