import DeckStyles from "./DeckStyles";

export default function Slide2() {
  return (
    <section className="slide slide2">
      <DeckStyles />

      <div className="slide2-header">
        <span className="slide2-tag">Fechamento operacional da frota</span>

        <h1 className="slide2-title">O que vamos responder nesta apresentação</h1>

        <p className="slide2-description">
          A base foi atualizada e agora o fechamento volta a servir como uma
          conversa gerencial: não é só mostrar número, é entender onde o custo
          está pesando, quais veículos precisam de decisão e onde o processo
          precisa melhorar.
        </p>

        <p className="slide2-description secondary">
          A leitura foi organizada em cinco blocos: combustível, manutenção,
          venda de caminhões, troca de veículos e qualidade dos dados. A ideia
          é separar resultado real de ruído de lançamento e transformar a análise
          em decisão prática de frota.
        </p>
      </div>

      <div
        className="slide2-cards"
        style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
      >
        <div className="slide2-card">
          <div className="slide2-card-line dark" />
          <h2>Combustível</h2>
          <p>Quanto foi gasto, quanto foi abastecido e qual foi a eficiência validada.</p>
        </div>

        <div className="slide2-card">
          <div className="slide2-card-line red" />
          <h2>Manutenção</h2>
          <p>Quanto custou, qual parte veio de peças e quais meses pressionaram.</p>
        </div>

        <div className="slide2-card">
          <div className="slide2-card-line light" />
          <h2>Venda de caminhões</h2>
          <p>
            Quais veículos apresentam baixa utilização, custo elevado ou perfil
            que justifique análise de venda ou substituição planejada.
          </p>
        </div>

        <div className="slide2-card">
          <div className="slide2-card-line red" />
          <h2>Troca de veículos</h2>
          <p>
            Se faz sentido substituir cavalo + carreta por Truck em parte da
            operação do Rio de Janeiro, considerando peso e exceções operacionais.
          </p>
        </div>

        <div className="slide2-card">
          <div className="slide2-card-line dark" />
          <h2>Qualidade dos dados</h2>
          <p>
            Quais campos ainda geram ruído e precisam de padronização para dar
            mais segurança às decisões.
          </p>
        </div>
      </div>

      <footer className="slide2-footer">
        O objetivo do fechamento é transformar dados operacionais em decisão:
        onde agir, por qual motivo e com qual prioridade — incluindo venda,
        substituição e redimensionamento da frota.
      </footer>
    </section>
  );
}
