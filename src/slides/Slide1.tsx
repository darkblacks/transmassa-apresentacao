import DeckStyles from "./DeckStyles";
import { deckInfo } from "./SlideData";

export default function Slide1() {
  return (
    <section className="slide slide1">
      <DeckStyles />
      <div className="slide1-bg-glow slide1-bg-glow-one" />
      <div className="slide1-bg-glow slide1-bg-glow-two" />

      <div className="slide1-month-badge">
        Mês atual: <strong>{deckInfo.month}</strong>
      </div>

      <main className="slide1-layout">
        <div className="slide1-content">
          <p className="slide1-eyebrow">Transmassa 2026</p>

          <h1 className="slide1-title">
            Fechamento de <br />
            Frota Mensal
          </h1>

          <p className="slide1-subtitle">
            Apresentação dos dados operacionais da frota Transmassa.
          </p>

          <div className="slide1-divider" />

          <p className="slide1-footer-text">
            Consolidação de indicadores de KM, combustível, manutenção,
            custos gerenciais, ofensores e qualidade dos dados da frota.
          </p>
        </div>

        <aside className="slide1-brand-area">
          <div className="slide1-logo-card">
            <img
              src="/assets/logotransmassa.png"
              alt="Logo Transmassa"
              className="slide1-logo"
            />
          </div>

          <p className="slide1-brand-caption">Fechamento mensal de frota</p>
        </aside>
      </main>

      <footer className="slide1-footer">
        <span>Fechamento mensal</span>
        <span>Dados de {deckInfo.period}</span>
      </footer>
    </section>
  );
}
