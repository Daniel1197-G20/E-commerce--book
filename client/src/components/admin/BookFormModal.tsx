import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { X, Upload, Check, FileText, Image as ImageIcon, BookOpen, Loader2 } from 'lucide-react';
import { adminApi, categoriesApi, booksApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { Book, Category } from '../../types';
import { Button } from '../ui/Button';
import './AdminModal.css';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookToEdit?: Book | null;
}

export function BookFormModal({ isOpen, onClose, onSuccess, bookToEdit }: BookFormModalProps) {
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingEbook, setUploadingEbook] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [format, setFormat] = useState('PDF');
  const [pageCount, setPageCount] = useState('');
  const [language, setLanguage] = useState('English');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [previewFile, setPreviewFile] = useState('');
  const [ebookFile, setEbookFile] = useState('');
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load categories
      categoriesApi
        .list()
        .then((res) => {
          setCategories(res.data.data.categories || []);
        })
        .catch((err) => console.error(err));

      if (bookToEdit) {
        setTitle(bookToEdit.title || '');
        setAuthor(bookToEdit.author || '');
        setPrice(bookToEdit.price ? bookToEdit.price.toString() : '0');
        setCurrency(bookToEdit.currency || 'NGN');
        setFormat(bookToEdit.format || 'PDF');
        setPageCount(bookToEdit.pageCount ? bookToEdit.pageCount.toString() : '');
        setLanguage(bookToEdit.language || 'English');
        setShortDescription(bookToEdit.shortDescription || '');
        setDescription(bookToEdit.description || '');
        setCoverImage(bookToEdit.coverImage || '');
        setPreviewFile(bookToEdit.previewFile || '');
        setEbookFile((bookToEdit as unknown as { ebookFile?: string }).ebookFile || '');
        setPublished(bookToEdit.published ?? true);
        setFeatured(bookToEdit.featured ?? false);
        setSelectedCategories(bookToEdit.categories ? bookToEdit.categories.map((c) => c.id) : []);
      } else {
        // Reset
        setTitle('');
        setAuthor('');
        setPrice('');
        setCurrency('NGN');
        setFormat('PDF');
        setPageCount('');
        setLanguage('English');
        setShortDescription('');
        setDescription('');
        setCoverImage('');
        setPreviewFile('');
        setEbookFile('');
        setPublished(true);
        setFeatured(false);
        setSelectedCategories([]);
      }
    }
  }, [isOpen, bookToEdit]);

  if (!isOpen) return null;

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    type: 'cover' | 'preview' | 'ebook',
    setLoadingState: (val: boolean) => void,
    setUrlState: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingState(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await adminApi.uploadFile(formData);
      const fileUrl = res.data.data.url;
      setUrlState(fileUrl);
      success(`${type.toUpperCase()} file uploaded successfully`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'File upload failed';
      error(msg);
    } finally {
      setLoadingState(false);
    }
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await categoriesApi.create({ name: newCategoryName.trim() });
      const newCat = res.data.data.category;
      setCategories([...categories, newCat]);
      setSelectedCategories([...selectedCategories, newCat.id]);
      setNewCategoryName('');
      setShowAddCat(false);
      success(`Category '${newCat.name}' created!`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create category';
      error(msg);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !price || !description.trim()) {
      error('Please fill in required fields (Title, Author, Price, Description)');
      return;
    }

    setLoading(true);
    const payload = {
      title: title.trim(),
      author: author.trim(),
      price: parseFloat(price),
      currency,
      format,
      pageCount: pageCount ? parseInt(pageCount, 10) : null,
      language,
      shortDescription: shortDescription.trim() || null,
      description: description.trim(),
      coverImage: coverImage.trim() || null,
      previewFile: previewFile.trim() || null,
      ebookFile: ebookFile.trim() || null,
      published,
      featured,
      categoryIds: selectedCategories,
    };

    try {
      if (bookToEdit) {
        await booksApi.update(bookToEdit.id, payload);
        success('Book updated successfully!');
      } else {
        await booksApi.create(payload);
        success('Book published & uploaded successfully!');
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to save book';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <BookOpen size={22} className="admin-modal-icon" />
            <h3>{bookToEdit ? 'Edit Book Details' : 'Upload & Add New Book'}</h3>
          </div>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body">
          {/* Top Basic Info */}
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="book-title">
                Book Title <span className="req">*</span>
              </label>
              <input
                id="book-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Masterclass in Systems Architecture"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="book-author">
                Author Name <span className="req">*</span>
              </label>
              <input
                id="book-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Chidi Okonkwo"
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label htmlFor="book-price">
                Price <span className="req">*</span>
              </label>
              <div className="price-input-wrapper">
                <input
                  id="book-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="8500"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="book-currency">Currency</label>
              <select
                id="book-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="book-format">Format</label>
              <select
                id="book-format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="PDF">PDF Document</option>
                <option value="EPUB">EPUB E-Book</option>
                <option value="AUDIO">Audiobook</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="book-pages">Page Count</label>
              <input
                id="book-pages"
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                placeholder="e.g. 248"
              />
            </div>
            <div className="form-group">
              <label htmlFor="book-lang">Language</label>
              <input
                id="book-lang"
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="form-group">
            <label htmlFor="book-short-desc">Short Summary / Tagline</label>
            <input
              id="book-short-desc"
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-sentence hook for the book cards"
            />
          </div>

          <div className="form-group">
            <label htmlFor="book-desc">
              Full Description & Synopsis <span className="req">*</span>
            </label>
            <textarea
              id="book-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed overview of what readers will gain from this ebook..."
              required
            />
          </div>

          {/* File Upload Section */}
          <div className="file-upload-section">
            <h4 className="section-subtitle">Book Media & File Attachments</h4>

            {/* Cover Image Upload */}
            <div className="upload-box">
              <div className="upload-box-header">
                <label>Cover Image (JPG / PNG)</label>
                <span className="upload-tip">Upload file or enter image URL</span>
              </div>
              <div className="upload-inputs">
                <div className="file-btn-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'cover', setUploadingCover, setCoverImage)}
                  />
                  <Button type="button" variant="secondary" size="sm" disabled={uploadingCover}>
                    {uploadingCover ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                    {uploadingCover ? 'Uploading...' : 'Browse Cover'}
                  </Button>
                </div>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="or paste image URL (/uploads/covers/... or https://...)"
                />
              </div>
              {coverImage && (
                <div className="image-preview">
                  <img src={coverImage} alt="Cover preview" onError={(e) => ((e.target as HTMLElement).style.display = 'none')} />
                  <span className="preview-label">Cover Preview</span>
                </div>
              )}
            </div>

            {/* Preview PDF Upload */}
            <div className="upload-box">
              <div className="upload-box-header">
                <label>Sample Preview File (PDF/EPUB)</label>
                <span className="upload-tip">Sample chapter for public preview</span>
              </div>
              <div className="upload-inputs">
                <div className="file-btn-wrapper">
                  <input
                    type="file"
                    accept=".pdf,.epub"
                    onChange={(e) => handleFileUpload(e, 'preview', setUploadingPreview, setPreviewFile)}
                  />
                  <Button type="button" variant="secondary" size="sm" disabled={uploadingPreview}>
                    {uploadingPreview ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                    {uploadingPreview ? 'Uploading...' : 'Browse Preview PDF'}
                  </Button>
                </div>
                <input
                  type="text"
                  value={previewFile}
                  onChange={(e) => setPreviewFile(e.target.value)}
                  placeholder="or paste sample PDF path (/uploads/previews/...)"
                />
              </div>
            </div>

            {/* Full E-book PDF Upload */}
            <div className="upload-box main-ebook-box">
              <div className="upload-box-header">
                <label>Full E-Book File (PDF/EPUB)</label>
                <span className="upload-tip">Secured file accessible only after purchase</span>
              </div>
              <div className="upload-inputs">
                <div className="file-btn-wrapper">
                  <input
                    type="file"
                    accept=".pdf,.epub"
                    onChange={(e) => handleFileUpload(e, 'ebook', setUploadingEbook, setEbookFile)}
                  />
                  <Button type="button" variant="secondary" size="sm" disabled={uploadingEbook}>
                    {uploadingEbook ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    {uploadingEbook ? 'Uploading...' : 'Browse Full Ebook'}
                  </Button>
                </div>
                <input
                  type="text"
                  value={ebookFile}
                  onChange={(e) => setEbookFile(e.target.value)}
                  placeholder="or paste ebook file path (/uploads/ebooks/...)"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="form-group">
            <div className="category-header">
              <label>Categories</label>
              {!showAddCat ? (
                <button type="button" className="add-cat-btn" onClick={() => setShowAddCat(true)}>
                  + Add New Category
                </button>
              ) : (
                <div className="inline-add-cat">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                  />
                  <button type="button" onClick={handleCreateCategory} className="save-cat-btn">
                    Save
                  </button>
                  <button type="button" onClick={() => setShowAddCat(false)} className="cancel-cat-btn">
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="category-pills-select">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-pill-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                    {isSelected && <Check size={14} style={{ marginLeft: '4px' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="toggles-grid">
            <label className="toggle-card">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <div className="toggle-info">
                <strong>Published on Store</strong>
                <span>Visible for readers to purchase and view</span>
              </div>
            </label>

            <label className="toggle-card">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <div className="toggle-info">
                <strong>Featured Book</strong>
                <span>Highlighted on the landing page hero & showcase</span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="admin-modal-footer">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Saving...
                </>
              ) : bookToEdit ? (
                'Save Changes'
              ) : (
                'Upload & Create Book'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
