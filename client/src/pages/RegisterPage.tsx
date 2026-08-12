import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserCheck, ArrowRight } from 'lucide-react';
import './AuthPages.css';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError('You must accept the terms to create an account.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Left Side with Testimonial Card & Gradient */}
      <div className="left-side">
        <Link to="/" className="logo-branding">
          <div className="brand-icon">
            <BookOpen size={24} />
          </div>
          <span>Chidi Okonkwo</span>
        </Link>

        <div className="testimonial-card">
          <p>
            "A major impact this platform made was saving time and giving direct lifetime access to high quality technical & creative books."
          </p>
          <div className="profile">
            <div className="avatar-pic">
              <UserCheck size={28} />
            </div>
            <div>
              <strong>Tunde Adebayo</strong>
              <p className="subtitle">Senior Software Developer</p>
            </div>
          </div>
        </div>

        <div className="testimonial-footer">
          <h3>Join thousands of readers today</h3>
          <p>Build your digital library and download e-books seamlessly.</p>
        </div>
      </div>

      {/* Right Side with Signup Form */}
      <div className="right-side">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <p className="form-subtitle">Start reading and expanding your digital library.</p>

          {error && <div className="message error">{error}</div>}

          <div className="input-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <small>Password must be at least 8 characters long</small>
          </div>

          <div className="terms">
            <input
              type="checkbox"
              id="terms"
              checked={agree}
              onChange={() => setAgree(!agree)}
            />
            <label htmlFor="terms">
              By registering, you agree to our <a href="#">Privacy Policy</a> and <a href="#">Terms of Use</a>.
            </label>
          </div>

          <button type="submit" className="btn-signup" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={18} />
          </button>

          <p className="signin-link">
            Already have an account?{' '}
            <Link to="/login">
              <strong>Sign in</strong>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
