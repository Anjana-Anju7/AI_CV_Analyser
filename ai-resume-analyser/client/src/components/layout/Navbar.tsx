import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FileText, History, LogOut, BookOpen } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
          <FileText className="w-5 h-5" />
          ResumeAI
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/analyse"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Analyse
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-1 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <History className="w-4 h-4" />
              History
            </Link>
            <Link
              to="/jds"
              className="flex items-center gap-1 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Job Library
            </Link>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
