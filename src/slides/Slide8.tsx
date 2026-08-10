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

import DeckStyles from "./DeckStyles";
import { deckInfo } from "./SlideData";

const closingPoints = [
  {
    icon: <BarChart3 size={22} />,
    title: "Fechamento mensal",
    text: "Criar uma rotina recorrente para acompanhar combustível, KM, manutenção e ofensores.",
  },
  {
    icon: <DatabaseZap size={22} />,
    title: "Dados mais confiáveis",
    text: "Reduzir inconsistências na origem para evitar retrabalho e decisões distorcidas.",
  },
  {
    icon: <Truck size={22} />,
    title: "Gestão da frota",
    text: "Comparar custo, utilização e desempenho por mês, placa e tipo de veículo.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Próxima evolução",
    text: "Transformar o fechamento em rotina de processo, com responsáveis e validações claras.",
  },
];

const nextSteps = [
  "Validar os indicadores apresentados neste fechamento.",
  "Criar rotina de conferência mensal das bases antes da apresentação.",
  "Selecionar caminhões ofensores para análise de venda, substituição ou plano de manutenção.",
  "Padronizar cadastro de frota, hodômetro, motorista e fechamento de OS.",
  "Acompanhar a evolução mês a mês com foco em custo por KM e qualidade do dado.",
];

export default function Slide8() {
  return (
    <section className="slide slide10 tm-red-slide">
      <DeckStyles />
      <div className="slide10-hero">
        <div className="slide10-logos">
          <div className="slide10-logo-card">
            <img src="/assets/logotransmassa.png" alt="Transmassa" />
          </div>
        </div>

        <span className="slide10-tag">Encerramento</span>

        <h1 className="slide10-title">
          Obrigado.
          <br />
          Próximo passo: transformar análise em gestão.
        </h1>

        <p className="slide10-subtitle">
          O fechamento mostrou que a Transmassa já possui dados operacionais
          relevantes. Agora, o desafio é transformar esses dados em uma rotina
          de controle mais confiável, padronizada e útil para decisão.
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
              A proposta não é apenas criar mais um relatório, mas construir
              uma rotina de gestão onde a frota seja acompanhada pelo equilíbrio
              entre movimentação, custo e confiabilidade do dado.
            </p>
          </div>
        </div>

        <div className="slide10-message-card action">
          <ClipboardCheck size={30} />
          <div>
            <strong>Recomendação</strong>
            <p>
              Começar pela qualidade da base e pelos ofensores. Assim, a evolução
              acontece com evidência, prioridade e menor risco operacional.
            </p>
          </div>
        </div>
      </div>

      <footer className="slide10-footer">
        <div>
          <BadgeCheck size={18} />
          <span>Fechamento Frota Transmassa · {deckInfo.period}</span>
        </div>

        <div>
          <Route size={18} />
          <span>Controle · Dados · Gestão · Evolução</span>
        </div>
      </footer>
    </section>
  );
}
