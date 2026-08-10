import DeckStyles from "./DeckStyles";
import { processPlan } from "./SlideData";

export default function Slide7() {
  return (
    <section className="slide tm-slide">
      <DeckStyles />
      <img className="tm-logo-mini" src="/assets/logotransmassa.png" alt="Transmassa" />

      <span className="tm-eyebrow">07 • Processos</span>
      <h1 className="tm-title">Retomar o trabalho de processos é o próximo ganho</h1>
      <p className="tm-subtitle">
        O dashboard mostra o resultado. O processo garante que o próximo
        fechamento venha melhor, com menos correção manual e mais confiança para decidir.
      </p>

      <div className="tm-process-grid">
        {processPlan.map((item) => (
          <div className="tm-process" key={item.step}>
            <span className="num">{item.step}</span>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      <p className="tm-note">
        O fechamento mensal precisa virar uma rotina: baixar, validar, corrigir
        a origem do problema e só depois apresentar os indicadores finais.
      </p>
    </section>
  );
}
