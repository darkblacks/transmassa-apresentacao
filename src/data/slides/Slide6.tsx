import DeckStyles from "./DeckStyles";
import { dataProblems } from "./SlideData";

export default function Slide6() {
  return (
    <section className="slide tm-slide">
      <DeckStyles />
      <img className="tm-logo-mini" src="/assets/logotransmassa.png" alt="Transmassa" />

      <span className="tm-eyebrow">06 • Qualidade dos dados</span>
      <h1 className="tm-title">A base permite gestão, mas ainda existe poluição nos dados</h1>
      <p className="tm-subtitle">
        A parte financeira está consistente o suficiente para apresentar custo.
        A maior atenção está nos campos que sustentam eficiência, produtividade
        e comparação justa entre veículos.
      </p>

      <div className="tm-problem-grid">
        {dataProblems.map((item) => (
          <div className="tm-problem" key={item.title}>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      <p className="tm-note">
        Mensagem para a apresentação: quando o dado está contaminado, não devemos
        esconder o problema. Devemos mostrar o tratamento adotado e transformar
        isso em plano de processo.
      </p>
    </section>
  );
}
