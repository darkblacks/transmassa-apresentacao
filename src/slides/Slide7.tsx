import { AlertTriangle, Database, Download, FileSearch, Gauge, ShieldAlert } from "lucide-react";

const inconsistentRows = [
  {
    mes: "2026-01",
    placa: "PPH2G83",
    inicio: "2026-01-02 12:02",
    fim: "2026-01-09 16:21",
    hodInicio: "887926",
    hodFim: "1",
    kmPeriodo: "-887925",
    observacao: "Revisar: hodômetro menor",
  },
  {
    mes: "2026-03",
    placa: "PPH2G83",
    inicio: "2026-03-12 18:52",
    fim: "2026-03-16 04:59",
    hodInicio: "1",
    hodFim: "907981",
    kmPeriodo: "907980",
    observacao: "Revisar: hodômetro inconsistente",
  },
  {
    mes: "2026-03",
    placa: "FDZ2272",
    inicio: "2026-03-13 04:03",
    fim: "2026-03-18 01:38",
    hodInicio: "1455345",
    hodFim: "1454463",
    kmPeriodo: "-882",
    observacao: "Revisar: hodômetro menor",
  },
];

const criticalPoints = [
  {
    icon: <Gauge size={20} />,
    title: "KM não disponível no manifesto",
    text: "Os manifestos não trazem o KM da viagem de forma direta. Para viabilizar a análise, foi necessário criar uma lógica complementar de cálculo e alocação de KM.",
  },
  {
    icon: <AlertTriangle size={20} />,
    title: "Inconsistências de hodômetro",
    text: "Foram encontrados períodos com hodômetro menor no final do que no início, além de saltos incompatíveis com a operação. Isso compromete a leitura real da rodagem.",
  },
  {
    icon: <FileSearch size={20} />,
    title: 'Ocorrências de "Revisar: KM zero"',
    text: "Também houve registros em que o veículo apresentou duas movimentações sem qualquer variação de KM, o que é operacionalmente improvável e precisa de revisão.",
  },
  {
    icon: <Database size={20} />,
    title: "Dependência de tratamento manual",
    text: "Para consolidar a visão gerencial, foi necessário tratar exceções, padronizar campos, cruzar relatórios e validar linhas manualmente antes da análise.",
  },
];

export default function Slide7() {
  return (
    <section className="slide slide7">
      <header className="slide7-header">
        <div className="slide7-header-content">
          <span className="slide7-tag">Diagnóstico crítico dos dados</span>

          <h1 className="slide7-title">
            O principal desafio não foi o painel.
            <br />
            Foi a qualidade da informação.
          </h1>

          <p className="slide7-subtitle">
            Para construir a análise gerencial da frota, utilizamos relatórios
            fornecidos pelo operacional da empresa, incluindo informações
            extraídas do <strong>ESL</strong>. Porém, ao longo do levantamento,
            ficou evidente que a operação ainda possui fragilidades relevantes
            na estrutura e na consistência dos dados.
          </p>
        </div>

        <div className="slide7-alert-box">
          <div className="slide7-alert-icon">
            <ShieldAlert size={28} />
          </div>

          <div>
            <strong>Leitura executiva</strong>
            <p>
              Antes de discutir performance, faturamento ou custo, foi
              necessário primeiro validar se os dados representavam a operação
              de forma confiável.
            </p>
          </div>
        </div>
      </header>

      <div className="slide7-main-grid">
        <div className="slide7-left">
          <div className="slide7-section-card">
            <div className="slide7-section-header">
              <strong>Principais problemas encontrados</strong>
              <span>
                Pontos críticos identificados no processo de consolidação
              </span>
            </div>

            <div className="slide7-critical-list">
              {criticalPoints.map((item) => (
                <div className="slide7-critical-item" key={item.title}>
                  <div className="slide7-critical-icon">{item.icon}</div>

                  <div className="slide7-critical-text">
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="slide7-section-card">
            <div className="slide7-section-header">
              <strong>Impacto direto na análise</strong>
              <span>O que isso exigiu da construção do fechamento</span>
            </div>

            <div className="slide7-impact-grid">
              <div className="slide7-impact-card">
                <strong>1. Cálculo complementar de KM</strong>
                <p>
                  Como o manifesto não informa a quilometragem da viagem, foi
                  necessário montar uma regra específica para estimar e alocar o
                  KM por serviço.
                </p>
              </div>

              <div className="slide7-impact-card">
                <strong>2. Tratamento de exceções</strong>
                <p>
                  Diversos registros precisaram ser analisados fora do fluxo
                  padrão, especialmente períodos com hodômetros inconsistentes
                  ou sem evolução de rodagem.
                </p>
              </div>

              <div className="slide7-impact-card">
                <strong>3. Cruzamento entre relatórios</strong>
                <p>
                  A leitura final só foi possível após cruzar manutenção,
                  combustível, manifestos, períodos e dados operacionais do ESL.
                </p>
              </div>

              <div className="slide7-impact-card">
                <strong>4. Risco gerencial</strong>
                <p>
                  Quando o dado nasce inconsistente, a tomada de decisão pode
                  apontar conclusões erradas sobre custo, produtividade e
                  faturamento da frota.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="slide7-right">
          <div className="slide7-section-card highlight">
            <div className="slide7-section-header">
              <strong>Exemplos reais de inconsistência</strong>
              <span>
                Recortes encontrados na construção da base de períodos
              </span>
            </div>

            <div className="slide7-table-wrap">
              <table className="slide7-table">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Placa</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Hod. início</th>
                    <th>Hod. fim</th>
                    <th>KM período</th>
                    <th>Observação</th>
                  </tr>
                </thead>

                <tbody>
                  {inconsistentRows.map((row, index) => (
                    <tr key={`${row.placa}-${index}`}>
                      <td>{row.mes}</td>
                      <td>{row.placa}</td>
                      <td>{row.inicio}</td>
                      <td>{row.fim}</td>
                      <td>{row.hodInicio}</td>
                      <td>{row.hodFim}</td>
                      <td>{row.kmPeriodo}</td>
                      <td>{row.observacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="slide7-warning-note">
              <strong>Crítica importante:</strong> situações como essas mostram
              que parte relevante do esforço não foi analítico, e sim de
              saneamento e interpretação dos dados. Isso reduz velocidade,
              aumenta retrabalho e compromete a confiabilidade da leitura
              gerencial.
            </div>
          </div>

          <div className="slide7-section-card">
            <div className="slide7-section-header">
              <strong>Consulta detalhada da base</strong>
              <span>
                Se necessário, os arquivos podem ser baixados para auditoria e
                conferência
              </span>
            </div>

            <div className="slide7-downloads">
              <a
                className="slide7-download-button"
                href="/data/Base_Consolidada_Placa_Mes_Transmassa_Cavalos_2026.xlsx"
                download
              >
                <Download size={16} />
                Baixar base consolidada
              </a>

            </div>

            <p className="slide7-download-note">
              Recomendação: usar estes arquivos para aprofundar a leitura das
              inconsistências, dos tratamentos aplicados e das limitações da
              operação atual.
            </p>
          </div>
        </div>
      </div>

      <footer className="slide7-footer-note">
        Em resumo: o fechamento mensal mostrou que a empresa já possui dados
        operacionais relevantes, mas ainda precisa evoluir fortemente em
        padronização, qualidade de lançamento e governança da informação.
      </footer>
    </section>
  );
}