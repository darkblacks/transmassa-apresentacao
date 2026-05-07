import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Camera,
  ClipboardCheck,
  Fuel,
  Gauge,
  Route,
  Smartphone,
  Truck,
} from "lucide-react";

const truckImage = "/assets/caminhao-ecolog.png";
const ecologLogo = "/assets/logo.png";

const pilotSteps = [
  {
    icon: <Truck size={20} />,
    title: "20 caminhões",
    text: "Selecionar veículos da frota própria para o piloto inicial.",
  },
  {
    icon: <CalendarDays size={20} />,
    title: "1 mês de operação",
    text: "Rodar o teste por um ciclo mensal completo de abastecimentos.",
  },
  {
    icon: <Smartphone size={20} />,
    title: "Lançamento pelo app",
    text: "Motoristas registram abastecimentos com dados padronizados.",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Fechamento comparativo",
    text: "Comparar controle atual x dados coletados pelo Ecolog.",
  },
];

const benefits = [
  {
    icon: <Camera size={20} />,
    title: "Comprovante e hodômetro",
    text: "Registro visual da nota e do hodômetro para reduzir dúvidas no fechamento.",
  },
  {
    icon: <Fuel size={20} />,
    title: "Controle de combustível",
    text: "Litros, valor, tipo de combustível, posto e placa registrados no mesmo fluxo.",
  },
  {
    icon: <Gauge size={20} />,
    title: "Validação de KM",
    text: "Melhor leitura de consumo, R$/L, R$/KM e comportamento por veículo.",
  },
  {
    icon: <ClipboardCheck size={20} />,
    title: "Menos retrabalho",
    text: "Redução de planilhas manuais, ajustes posteriores e inconsistências de lançamento.",
  },
];

const pilotKpis = [
  "Aderência dos motoristas ao uso do app",
  "Quantidade de abastecimentos registrados",
  "Abastecimentos com foto da nota e hodômetro",
  "Divergências encontradas no fechamento",
  "Tempo gasto para consolidar os dados",
  "Qualidade dos dados por placa/mês",
];

export default function Slide9() {
  return (
    <section className="slide slide9">
      <div className="slide9-hero">
        <div className="slide9-hero-content">
          <div className="slide9-logo-box">
            <img src={ecologLogo} alt="Ecolog" />
          </div>

          <span className="slide9-tag">Proposta de implantação</span>

          <h1 className="slide9-title">
            Piloto Ecolog na frota Transmassa
          </h1>

          <p className="slide9-subtitle">
            Implementar um piloto de <strong>1 mês</strong> com{" "}
            <strong>20 caminhões da frota própria</strong>, focado no controle
            de abastecimentos, coleta padronizada de dados e melhoria da
            confiabilidade do fechamento mensal.
          </p>

          <div className="slide9-hero-actions">
            <div>
              <strong>Escopo inicial</strong>
              <span>Abastecimento · Hodômetro · Nota · Placa · Motorista</span>
            </div>

            <div>
              <strong>Objetivo</strong>
              <span>Medir se o app reduz retrabalho e melhora a gestão</span>
            </div>
          </div>
        </div>

        <div className="slide9-hero-image">
          <img src={truckImage} alt="Caminhão Ecolog" />
        </div>
      </div>

      <div className="slide9-main-grid">
        <div className="slide9-card">
          <div className="slide9-section-header">
            <strong>Como seria o piloto</strong>
            <span>Teste controlado antes de expandir para toda a frota</span>
          </div>

          <div className="slide9-pilot-grid">
            {pilotSteps.map((item) => (
              <div className="slide9-pilot-item" key={item.title}>
                <div className="slide9-icon">{item.icon}</div>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="slide9-card highlight">
          <div className="slide9-section-header">
            <strong>Por que começar pelo abastecimento?</strong>
            <span>É uma das maiores dores do fechamento de frota</span>
          </div>

          <p className="slide9-text">
            O abastecimento impacta diretamente os principais indicadores da
            operação: consumo, custo por litro, custo por KM, variação de
            hodômetro e análise por placa. Começar por esse processo permite
            validar rapidamente se a coleta digital melhora a qualidade do dado
            antes de expandir para manutenção, manifestos e outros custos.
          </p>

          <div className="slide9-callout">
            <BadgeCheck size={22} />
            <span>
              O piloto não exige mudar toda a operação de uma vez. A ideia é
              testar com uma amostra controlada, medir resultado e decidir a
              expansão com base em evidências.
            </span>
          </div>
        </div>
      </div>

      <div className="slide9-benefits-grid">
        {benefits.map((item) => (
          <div className="slide9-benefit-card" key={item.title}>
            <div className="slide9-icon soft">{item.icon}</div>

            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="slide9-bottom-grid">
        <div className="slide9-card">
          <div className="slide9-section-header">
            <strong>Indicadores para avaliar o piloto</strong>
            <span>O que será medido ao final do primeiro mês</span>
          </div>

          <div className="slide9-kpi-list">
            {pilotKpis.map((item) => (
              <div className="slide9-kpi-item" key={item}>
                <ClipboardCheck size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="slide9-card result">
          <div className="slide9-section-header">
            <strong>Resultado esperado</strong>
            <span>Fechamento mais rápido, rastreável e confiável</span>
          </div>

          <div className="slide9-result-content">
            <Route size={28} />

            <p>
              Ao final do piloto, a Transmassa terá uma comparação prática entre
              o processo atual e o processo digitalizado, permitindo avaliar se o
              Ecolog facilita a gestão, melhora a qualidade dos dados e reduz o
              esforço manual do fechamento mensal.
            </p>
          </div>
        </div>
      </div>

      <footer className="slide9-footer-note">
        Proposta: iniciar pequeno, medir resultado e expandir somente após
        comprovar ganho operacional no controle de abastecimentos.
      </footer>
    </section>
  );
}