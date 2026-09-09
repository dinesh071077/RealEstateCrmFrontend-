import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Building2, AlertCircle, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const result = await login(data.email, data.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-surface p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-primary-200 dark:border-primary-800/50">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sign in to your CRM account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-100 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className={`input-field ${errors.email ? 'border-red-300 dark:border-red-500 ring-1 ring-red-300 dark:ring-red-500' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className={`input-field ${errors.password ? 'border-red-300 dark:border-red-500 ring-1 ring-red-300 dark:ring-red-500' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-md transition-all"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Demo Credentials:</h3>
            <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400 space-y-2 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Admin:</span>
                <span>admin@realestate.com / Admin@123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Sales:</span>
                <span>sales@realestate.com / Sales@123</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
