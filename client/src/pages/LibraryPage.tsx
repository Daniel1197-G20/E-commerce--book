import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { libraryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import type { LibraryItem } from '../types';
import './LibraryPage.css';

export function LibraryPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    libraryApi
      .get()
      .then((res) => setLibrary(res.data.data.library || []))
      .catch(() => setLibrary([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  if (loading) return <main className="container" style={{ padding: '3rem 0' }}><p>Loading library…</p></main>;

  return (
    <main className="library-page">
      <div className="container">
        <h1>My Library</h1>
        <p className="subtitle">Books you’ve purchased and can read anytime.</p>

        {library.length === 0 ? (
          <div className="empty">
            <p>You haven’t purchased any books yet.</p>
            <Link to="/books"><Button variant="primary">Browse books</Button></Link>
          </div>
        ) : (
          <div className="library-grid">
            {library.map((item) => (
              <article key={item.id} className="library-card">
                <div className="library-cover">
                  {item.book.coverImage ? (
                    <img src={item.book.coverImage} alt="" />
                  ) : (
                    <div className="placeholder">{item.book.title.charAt(0)}</div>
                  )}
                </div>
                <div className="library-body">
                  <h3>{item.book.title}</h3>
                  <p className="author">{item.book.author}</p>
                  <p className="date">
                    Purchased {new Date(item.purchasedAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                  <div className="library-actions">
                    <Link to={`/reader/${item.book.id}`}>
                      <Button variant="accent" size="sm">Read now</Button>
                    </Link>
                    <a
                      href={libraryApi.downloadUrl(item.book.id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="sm">Download</Button>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
