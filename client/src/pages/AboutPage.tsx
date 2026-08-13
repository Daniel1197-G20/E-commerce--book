import { Link } from 'react-router-dom';
import { Feather, BookOpen, Compass, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import './AboutPage.css';

export function AboutPage() {
  return (
    <main className="about-page">
      <div className="container">
        <header className="about-header">
          <div className="about-eyebrow">
            <Feather size={14} /> The Author & Publisher
          </div>
          <h1>Chidi Okonkwo</h1>
          <p className="lead">
            Author, software craftsman, and advocate for deliberate focus in a distracted world.
          </p>
        </header>

        <div className="about-content-layout">
          <section className="about-main-prose">
            <p>
              Chidi Okonkwo writes about attention, the architectural discipline of building enduring software, and the quiet revolutions that shape culture and identity across modern West African cities.
            </p>
            <p>
              Having spent more than a decade designing distributed systems, leading engineering teams, and mentoring craftspeople, his essays and books combine rigorous analytical models with deep narrative storytelling.
            </p>

            <div className="about-quote-box">
              <blockquote>
                “Good books should be worth keeping. They should repay rereading, offering clearer thinking and durable wisdom rather than brief novelty.”
              </blockquote>
            </div>

            <h2>Publishing Philosophy</h2>
            <p>
              Every title under this imprint is conceived as a durable digital artifact. We reject intrusive DRM, disposable short-form noise, and locked ecosystems. When you acquire a volume, you own it permanently across web canvas, EPUB, and PDF.
            </p>

            <div className="about-principles-grid">
              <div className="principle-card">
                <Compass size={20} className="principle-icon" />
                <h3>Deliberate Depth</h3>
                <p>Long-form exploration that respects your intellect, free from hype and manufactured urgency.</p>
              </div>
              <div className="principle-card">
                <ShieldCheck size={20} className="principle-icon" />
                <h3>Open & DRM-Free</h3>
                <p>True ownership with multi-device reading freedom and instant digital downloads.</p>
              </div>
              <div className="principle-card">
                <BookOpen size={20} className="principle-icon" />
                <h3>Typography First</h3>
                <p>Meticulously typeset digital editions designed for effortless, eye-strain-free reading.</p>
              </div>
            </div>
          </section>

          <aside className="about-sidebar">
            <div className="about-card author-meta-card">
              <div className="author-monogram">CO</div>
              <h3>Chidi Okonkwo</h3>
              <span className="author-role">Author & Independent Publisher</span>
              
              <div className="author-details-list">
                <div className="detail-row">
                  <span className="label">Focus</span>
                  <span className="val">Craft, Attention, Identity</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location</span>
                  <span className="val">Lagos / Global</span>
                </div>
                <div className="detail-row">
                  <span className="label">Publications</span>
                  <span className="val">7 Digital Volumes</span>
                </div>
              </div>

              <Link to="/books" style={{ width: '100%' }}>
                <Button variant="primary" size="md" style={{ width: '100%' }}>
                  Explore Publications <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="about-card contact-card">
              <Mail size={22} className="contact-icon" />
              <h3>Direct Correspondence</h3>
              <p>For inquiries, speaking, or reader discussions, send a note to:</p>
              <a href="mailto:chidi@okonkwo.press" className="contact-email">
                chidi@okonkwo.press
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
