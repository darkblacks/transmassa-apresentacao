import DeckStyles from "./DeckStyles";
import { offenders } from "./SlideData";

export default function Slide5() {
  return (
    <section className="slide tm-slide">
      <DeckStyles />
      <img className="tm-logo-mini" src="/assets/logotransmassa.png" alt="Transmassa" />

      <span className="tm-eyebrow">04 • Ofensores</span>
      <h1 className="tm-title">10 caminhões para avaliar venda ou substituição</h1>
      <p className="tm-subtitle">
        O ranking considera caminhões que rodaram nos últimos três meses.
        A leitura não é “vender amanhã”, mas separar veículos que pedem análise
        de custo, utilização e manutenção recorrente.
      </p>

      <div className="tm-card" style={{ padding: 18, flex: 1, overflow: "hidden" }}>
        <table className="tm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Caminhão</th>
              <th>KM/mês</th>
              <th>KM/L</th>
              <th>Manutenção</th>
              <th>Custo/KM</th>
              <th>Motivo principal</th>
            </tr>
          </thead>
          <tbody>
            {offenders.map((item) => (
              <tr key={item.rank}>
                <td><span className="tm-rank">{item.rank}</span></td>
                <td><strong>{item.truck}</strong></td>
                <td>{item.kmMes}</td>
                <td>{item.kml}</td>
                <td>{item.manut}</td>
                <td><strong>{item.custoKm}</strong></td>
                <td>{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="tm-note">
        Recomendação: separar a decisão em dois grupos — veículos de baixa
        utilização para venda e veículos caros, porém produtivos, para substituição planejada.
      </p>
    </section>
  );
}
