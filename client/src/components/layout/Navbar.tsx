import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import './Navbar.css';

export function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          <BookOpen size={22} />
          <span>Chidi Okonkwo</span>
        </Link>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/books" onClick={() => setOpen(false)}>Books</NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard/library" onClick={() => setOpen(false)}>My Library</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink>
          )}
        </nav>

        <div className="navbar-actions">
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <ShoppingCart size={20} />
          </Link>
          {isAuthenticated ? (
            <div className="navbar-user">
              <Link to="/dashboard" className="icon-btn" aria-label={user?.name || 'Account'} title={user?.name || 'Account'}>
                <User size={20} />
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Sign up</Button>
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
