'use client';

import { useState } from 'react';
import NonlogedHeader from '../components/NonlogedHeader';
import Footer from '../components/Footer';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface FormData {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
}

const apiEndpoint = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function LoginPage() {
  const t = useTranslations('login');
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!formData.username.trim()) newErrors.username = t('usernameRequired');
    if (!formData.password) newErrors.password = t('passwordRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${apiEndpoint}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include', // Essential for cookies
      });

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData.message);
        return;
      }

      // Successful login
      router.push('/home');
      router.refresh(); // Force middleware rerun
      
    } catch (error) {
      setSubmitError("server error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (): void => {
    alert(t('forgotRedirect'));
  };

  return (
    <div className="w-full">
      <NonlogedHeader />
      <div className="min-h-[calc(100vh-170px)] bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm">{t('title')}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-4 border border-gray-200">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                {t('username')}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-md text-sm ${
                  errors.username ? 'border-red-400' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-gray-500`}
                disabled={isLoading}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-md text-sm ${
                  errors.password ? 'border-red-400' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-gray-500`}
                disabled={isLoading}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-600 hover:underline"
                disabled={isLoading}
              >
                {t('forgot')}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gray-800 text-white text-sm font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400"
            >
              {isLoading ? t('loading') : t('submit')}
            </button>

            {submitError && (
              <p className="text-red-500 text-sm text-center mt-2">{t('invalid')}</p>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
