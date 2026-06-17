import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const err = params.get('error');

    if (err || !accessToken || !refreshToken) {
      setError(true);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Temporarily set tokens so the /me request can authenticate
    useAuth.setState({ accessToken, refreshToken });

    authService
      .me()
      .then((user) => {
        loginWithOAuth(accessToken, refreshToken, user);
        navigate('/analyse', { replace: true });
      })
      .catch(() => {
        setError(true);
        setTimeout(() => navigate('/login'), 3000);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Google sign-in failed</p>
          <p className="text-sm text-gray-500 mt-1">Redirecting you back to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
        <p className="text-sm text-gray-500 mt-3">Completing sign-in…</p>
      </div>
    </div>
  );
}
