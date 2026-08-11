import './AboutPage.css';

export function AboutPage() {
  return (
    <main className="about-page">
      <div className="container">
        <header className="about-header">
          <p className="eyebrow">The Author</p>
          <h1>Chidi Okonkwo</h1>
          <p className="lead">
            Writer, software craftsman, and advocate for focused work in a distracted age.
          </p>
        </header>

        <section className="about-body">
          <p>
            Chidi Okonkwo writes about attention, the craft of building software, and the quiet stories that shape identity across West African cities. His books combine practical frameworks with narrative depth — for readers who care about how they work and how they live.
          </p>
          <p>
            He has spent over a decade building products and mentoring engineers. His writing has been shared among product teams, design studios, and independent readers looking for books that respect their time and intelligence.
          </p>
          <h2>Philosophy</h2>
          <p>
            Good books should be worth keeping. They should repay rereading. They should leave the reader with clearer thinking and a few durable habits — not just a temporary feeling of productivity.
          </p>
        </section>
      </div>
    </main>
  );
}
