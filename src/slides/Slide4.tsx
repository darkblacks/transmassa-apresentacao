import DeckStyles from "./DeckStyles";
import { maintenanceKpis, maintenanceMonths } from "./SlideData";

export default function Slide4() {
  return (
    <section className="slide tm-slide">
      <DeckStyles />
      <img className="tm-logo-mini" src="/assets/logotransmassa.png" alt="Transmassa" />

      <span className="tm-eyebrow">03 • Manutenção</span>
      <h1 className="tm-title">Manutenção está concentrada em peças e meses de pressão</h1>
      <p className="tm-subtitle">
        O ponto gerencial não é só olhar o total: precisamos entender quanto
        vem de peça, quanto vem de mão de obra e quais meses explicam a curva.
      </p>

      <div className="tm-kpi-grid">
        {maintenanceKpis.map((item) => (
          <div className="tm-kpi" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.hint}</small>
          </div>
        ))}
      </div>

      <div className="tm-two-col">
        <div className="tm-chart-card">
          <h2 className="tm-mini-title">Evolução mensal da manutenção</h2>
          <p>Março foi o maior mês de manutenção, seguido por julho e fevereiro.</p>

          <div className="tm-bars">
            {maintenanceMonths.map((m) => (
              <div className="tm-bar-row" key={m.month}>
                <span>{m.month}</span>
                <div className="tm-bar-track">
                  <div className="tm-bar-fill" style={{ width: `${m.value}%` }} />
                </div>
                <strong>{m.total}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="tm-card">
          <h2 className="tm-mini-title">Leitura executiva</h2>
          <p>
            Como peças representam aproximadamente 59% do custo, o plano de
            melhoria precisa olhar recorrência de componentes, negociação de
            itens e reincidência por placa.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 26 }}>
            <div className="tm-share-card">
              <span style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>PEÇAS</span>
              <strong style={{ display: "block", color: "#f59e0b", fontSize: 46, lineHeight: 1, marginTop: 12 }}>59,3%</strong>
            </div>
            <div className="tm-share-card">
              <span style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>MÃO DE OBRA</span>
              <strong style={{ display: "block", color: "#22c55e", fontSize: 46, lineHeight: 1, marginTop: 12 }}>40,7%</strong>
            </div>
          </div>

          <div className="tm-note" style={{ marginTop: 24 }}>
            A decisão correta não é cortar manutenção, mas priorizar prevenção
            e atacar reincidência.
          </div>
        </div>
      </div>
    </section>
  );
}
