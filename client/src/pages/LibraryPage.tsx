import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { libraryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GlassGalleryShowcase } from '../components/gallery/GlassGalleryShowcase';
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

  return (
    <main className="library-page">
      <div className="container">
        <GlassGalleryShowcase
          items={library}
          title="My Digital Library"
          subtitle="Explore, read, and manage your purchased volumes in an interactive glassmorphism gallery."
          isLibraryMode={true}
          isLoading={loading}
        />
      </div>
    </main>
  );
}
