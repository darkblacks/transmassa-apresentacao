export default function Slide2() {
  return (
    <section className="slide slide2">
      <div className="slide2-header">
        <span className="slide2-tag">
          Fechamento operacional da frota
        </span>

        <h1 className="slide2-title">
          A importância do fechamento mensal
        </h1>

        <p className="slide2-description">
          Com a evolução do projeto, identificamos a necessidade de acompanhar
          a operação da frota de forma mais clara e recorrente.
        </p>

        <p className="slide2-description secondary">
          A análise mensal permite entender o comportamento da operação,
          acompanhar os custos, visualizar a produtividade dos veículos e apoiar
          tomadas de decisão voltadas para redução de custos e melhoria do
          faturamento.
        </p>

        <p className="slide2-description secondary">
          A partir disso, passamos a consolidar as principais informações
          operacionais da frota para análise e acompanhamento dos resultados ao
          longo dos meses.
        </p>
      </div>

      <div className="slide2-cards">
                <div className="slide2-card">
          <div className="slide2-card-line dark" />

          <h2>Combustível</h2>

          <p>
            Controle de consumo, KM rodado e custo operacional da frota.
          </p>
        </div>
        <div className="slide2-card">
          <div className="slide2-card-line red" />

          <h2>Manutenção</h2>

          <p>
            Acompanhamento de custos e impacto operacional dos veículos.
          </p>
        </div>



         <div className="slide2-card">
          <div className="slide2-card-line light" />

          <h2>Custos auxiliares</h2>

          <p>
            Custos relacionados ao DRE
          </p>
        </div>
        <div className="slide2-card">
          <div className="slide2-card-line light" />

          <h2>Manifestos</h2>

          <p>
            Visão das viagens, movimentação operacional e produtividade.
          </p>
        </div>

      </div>

      <footer className="slide2-footer">
        O objetivo do fechamento mensal é transformar informações operacionais
        em apoio para decisões da frota.
      </footer>
    </section>
  );
}