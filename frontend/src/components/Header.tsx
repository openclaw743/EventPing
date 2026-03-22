import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Button } from './Button'

export function Header() {
  const { user, login, logout } = useAuth()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">
          EventPing
        </Link>

        <nav className="flex items-center gap-4">
          {user && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`
              }
            >
              Dashboard
            </NavLink>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                  {user.name[0]}
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={login}>
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
