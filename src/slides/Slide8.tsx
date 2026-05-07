import {
  Database,
  FileCheck2,
  Workflow,
  LockKeyhole,
  Brain,
  Target,
  Smartphone,
} from "lucide-react";

const pyramidItems = [
  {
    level: "01",
    title: "Dados",
    text: "Registros brutos da operação: abastecimentos, manifestos, períodos, hodômetros, manutenção e custos.",
  },
  {
    level: "02",
    title: "Informação",
    text: "Dados organizados por placa, mês, motorista, serviço, KM, custo e faturamento.",
  },
  {
    level: "03",
    title: "Conhecimento",
    text: "Leitura gerencial: quais veículos custam mais, quais movimentam mais e onde existem desvios.",
  },
  {
    level: "04",
    title: "Sabedoria",
    text: "Tomada de decisão: reduzir custos, melhorar processos, corrigir falhas e aumentar eficiência.",
  },
];

const solutionItems = [
  {
    icon: <Workflow size={22} />,
    title: "Padronização de processos",
    text: "Definir regras claras para lançamento de manifestos, abastecimentos, hodômetros, manutenção e tipos de serviço.",
  },
  {
    icon: <FileCheck2 size={22} />,
    title: "Validação na origem",
    text: "Evitar que dados inconsistentes sejam lançados, como hodômetro menor, KM zero indevido ou motivo sem preenchimento.",
  },
  {
    icon: <LockKeyhole size={22} />,
    title: "Sistemas com travas inteligentes",
    text: "Usar ferramentas que obriguem o preenchimento correto e impeçam erros operacionais antes que cheguem ao fechamento.",
  },
  {
    icon: <Target size={22} />,
    title: "Indicadores mensais recorrentes",
    text: "Criar rotina de fechamento para acompanhar custos, produtividade, faturamento e qualidade dos dados mês a mês.",
  },
];

export default function Slide8() {
  return (
    <section className="slide slide8">
      <header className="slide8-header">
        <div>
          <span className="slide8-tag">Plano de evolução</span>

          <h1 className="slide8-title">
            Transformar dados operacionais em decisão gerencial
          </h1>

          <p className="slide8-subtitle">
            O fechamento mostrou que a empresa já possui muitos registros da
            operação. O próximo passo é melhorar a forma como esses dados são
            coletados, validados e transformados em informação confiável.
          </p>
        </div>

        <div className="slide8-header-card">
          <Database size={26} />
          <strong>Problema central</strong>
          <p>
            Hoje, parte do esforço analítico é gasto corrigindo, interpretando e
            ajustando dados que poderiam nascer mais organizados na operação.
          </p>
        </div>
      </header>

      <div className="slide8-main-grid">
        <div className="slide8-pyramid-card">
          <div className="slide8-section-header">
            <strong>Pirâmide DICS</strong>
            <span>Dados → Informação → Conhecimento → Sabedoria</span>
          </div>

          <div className="slide8-pyramid">
            {pyramidItems.map((item) => (
              <div className="slide8-pyramid-item" key={item.level}>
                <div className="slide8-pyramid-level">{item.level}</div>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="slide8-solution-card">
          <div className="slide8-section-header">
            <strong>Soluções possíveis</strong>
            <span>Como reduzir retrabalho e aumentar confiabilidade</span>
          </div>

          <div className="slide8-solutions">
            {solutionItems.map((item) => (
              <div className="slide8-solution-item" key={item.title}>
                <div className="slide8-solution-icon">{item.icon}</div>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="slide8-bottom-grid">
        <div className="slide8-critical-box">
          <Brain size={24} />

          <div>
            <strong>Leitura gerencial</strong>
            <p>
              Não basta ter dados. Para que a frota seja gerida com precisão, é
              necessário garantir que o dado nasça correto, siga um padrão e
              possa ser usado sem depender de correções manuais constantes.
            </p>
          </div>
        </div>

        <div className="slide8-next-box">
          <Smartphone size={24} />

          <div>
            <strong>Gancho para a próxima etapa</strong>
            <p>
              Uma das primeiras soluções práticas é evoluir o processo de
              abastecimento por meio de um aplicativo com campos obrigatórios,
              validações, fotos e padronização da coleta de dados.
            </p>
          </div>
        </div>
      </div>

      <footer className="slide8-footer-note">
        O objetivo não é apenas criar relatórios melhores, mas construir uma
        operação onde cada lançamento já contribua para uma decisão mais segura.
      </footer>
    </section>
  );
}