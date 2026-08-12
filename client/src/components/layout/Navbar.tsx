import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, BookOpen, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cartApi } from '../../services/api';
import { Button } from '../ui/Button';
import './Navbar.css';

export function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      cartApi
        .get()
        .then((res) => {
          const items = res.data.data.cart?.items || [];
          setCartCount(items.length);
        })
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <header className="glass-navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          <div className="logo-icon-wrapper">
            <BookOpen size={20} className="logo-icon" />
          </div>
          <span className="logo-text">Chidi Okonkwo</span>
        </Link>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/books" onClick={() => setOpen(false)}>
            Books Gallery
          </NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>
            About
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard/library" onClick={() => setOpen(false)}>
              My Library
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setOpen(false)} className="admin-nav-link">
              <ShieldCheck size={16} /> Admin Portal
            </NavLink>
          )}
        </nav>

        <div className="navbar-actions">
          <Link to="/cart" className="glass-cart-btn" aria-label="Cart">
            <ShoppingCart size={19} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="navbar-user-glass">
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="glass-avatar-btn admin-avatar-btn"
                  title="Admin Dashboard"
                >
                  <div className="avatar-circle admin-circle">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="user-name-label">{user?.name} (Admin)</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard/library"
                  className="glass-avatar-btn"
                  title={user?.name || 'My Library'}
                >
                  <div className="avatar-circle">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                  </div>
                  <span className="user-name-label">{user?.name}</span>
                </Link>
              )}
              <button
                className="glass-logout-btn"
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          <button
            className="navbar-toggle"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
