import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import './Footer.css';

export function Footer() {
  return (
    <footer className="glass-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="footer-logo-icon">
              <BookOpen size={18} />
            </div>
            <span>Chidi Okonkwo</span>
          </Link>
          <p className="footer-bio">
            Crafting digital volumes on attention, craft, identity, and the quiet revolutions that shape modern life.
          </p>
          <div className="footer-badge">
            <ShieldCheck size={15} /> Instant EPUB & PDF Delivery
          </div>
        </div>

        <div className="footer-nav-col">
          <h4>Explore Catalog</h4>
          <ul>
            <li><Link to="/books">All Books</Link></li>
            <li><Link to="/books?category=technology">Technology & Craft</Link></li>
            <li><Link to="/books?category=leadership">Leadership</Link></li>
            <li><Link to="/about">Meet the Author</Link></li>
          </ul>
        </div>

        <div className="footer-nav-col">
          <h4>Reader Account</h4>
          <ul>
            <li><Link to="/dashboard/library">My Library</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Create Account</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4>Stay Informed</h4>
          <p>Receive new essay releases, book launches, and subscriber-only excerpts.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <div className="newsletter-input-wrapper">
              <Mail size={16} className="mail-icon" />
              <input type="email" placeholder="Enter your email address" aria-label="Email" />
              <button type="submit" aria-label="Subscribe">
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <p className="footer-copy">
          © {new Date().getFullYear()} Chidi Okonkwo. All rights reserved.
        </p>
        <div className="footer-legal">
          <Link to="/about">Privacy</Link>
          <span>•</span>
          <Link to="/about">Terms of Service</Link>
          <span>•</span>
          <Link to="/about">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
