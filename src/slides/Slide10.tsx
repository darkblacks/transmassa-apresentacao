import {
  BadgeCheck,
  BarChart3,
  ClipboardCheck,
  DatabaseZap,
  Handshake,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";

const transmassaLogo = "/assets/logotransmassa.png";
const ecologLogo = "/assets/logo.png";

const closingPoints = [
  {
    icon: <BarChart3 size={22} />,
    title: "Fechamento mensal",
    text: "Criar uma rotina recorrente para acompanhar custos, KM, manifestos, produtividade e faturamento.",
  },
  {
    icon: <DatabaseZap size={22} />,
    title: "Dados mais confiáveis",
    text: "Reduzir inconsistências na origem para evitar retrabalho e melhorar a tomada de decisão.",
  },
  {
    icon: <Truck size={22} />,
    title: "Gestão da frota",
    text: "Comparar operação, custos e desempenho por mês, placa, serviço e tipo de frota.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Próxima evolução",
    text: "Iniciar um piloto controlado do Ecolog para validar ganhos no processo de abastecimento.",
  },
];

const nextSteps = [
  "Validar os indicadores apresentados no fechamento de Abril/2026.",
  "Selecionar 20 caminhões da frota própria para o piloto Ecolog.",
  "Rodar o piloto por 1 mês com coleta padronizada de abastecimentos.",
  "Comparar processo atual x processo digitalizado.",
  "Decidir expansão com base nos resultados do piloto.",
];

export default function Slide10() {
  return (
    <section className="slide slide10">
      <div className="slide10-hero">
        <div className="slide10-logos">
          <div className="slide10-logo-card">
            <img src={transmassaLogo} alt="Transmassa" />
          </div>

          <div className="slide10-divider" />

          <div className="slide10-logo-card ecolog">
            <img src={ecologLogo} alt="Ecolog" />
          </div>
        </div>

        <span className="slide10-tag">Encerramento</span>

        <h1 className="slide10-title">
          Obrigado.
          <br />
          Próximo passo: transformar análise em gestão.
        </h1>

        <p className="slide10-subtitle">
          O fechamento de frota mostrou que a Transmassa já possui dados
          operacionais relevantes. Agora, o desafio é transformar esses dados em
          uma rotina de controle mais confiável, padronizada e útil para a
          tomada de decisão.
        </p>
      </div>

      <div className="slide10-main-grid">
        <div className="slide10-card">
          <div className="slide10-section-header">
            <strong>O que este fechamento entregou</strong>
            <span>Resumo da visão construída para a frota</span>
          </div>

          <div className="slide10-points-grid">
            {closingPoints.map((item) => (
              <div className="slide10-point-card" key={item.title}>
                <div className="slide10-icon">{item.icon}</div>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="slide10-card highlight">
          <div className="slide10-section-header">
            <strong>Próximos passos sugeridos</strong>
            <span>Plano prático para evoluir após a apresentação</span>
          </div>

          <div className="slide10-steps">
            {nextSteps.map((item, index) => (
              <div className="slide10-step" key={item}>
                <div className="slide10-step-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="slide10-bottom-grid">
        <div className="slide10-message-card">
          <Handshake size={30} />

          <div>
            <strong>Mensagem final</strong>
            <p>
              A proposta não é apenas criar mais um relatório, mas construir uma
              rotina de gestão onde a frota seja acompanhada pelo equilíbrio
              entre movimentação, custo, produtividade e potencial de
              faturamento.
            </p>
          </div>
        </div>

        <div className="slide10-message-card action">
          <ClipboardCheck size={30} />

          <div>
            <strong>Recomendação</strong>
            <p>
              Começar com um piloto pequeno, medir o resultado e expandir de
              forma segura. Assim, a evolução acontece com controle, evidência e
              menor risco operacional.
            </p>
          </div>
        </div>
      </div>

      <footer className="slide10-footer">
        <div>
          <BadgeCheck size={18} />
          <span>Fechamento Frota Transmassa · Abril/2026</span>
        </div>

        <div>
          <Route size={18} />
          <span>Controle · Dados · Gestão · Evolução</span>
        </div>
      </footer>
    </section>
  );
}