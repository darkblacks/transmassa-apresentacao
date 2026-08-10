export const colors = {
  bg: '#09090b',
  panel: 'rgba(20, 20, 24, .82)',
  panel2: 'rgba(30, 30, 34, .78)',
  red: '#e31b23',
  red2: '#ff3b3f',
  amber: '#f59e0b',
  green: '#22c55e',
  blue: '#60a5fa',
  text: '#f8fafc',
  muted: '#a1a1aa',
  line: 'rgba(255,255,255,.12)',
};

export const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const compactMoney = (v: number) =>
  v >= 1_000_000 ? `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi` :
  v >= 1_000 ? `R$ ${(v / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : money(v);
export const n0 = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
export const n2 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = (v: number) => `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export const monthly = [
  { mes: 'Jan', comb: 835029.08, litros: 138876.46, manut: 163726.79, kml: 3.48, combKm: 1.72 },
  { mes: 'Fev', comb: 881364.07, litros: 148132.55, manut: 294042.56, kml: 3.64, combKm: 1.62 },
  { mes: 'Mar', comb: 1167497.38, litros: 169914.45, manut: 430382.22, kml: 3.62, combKm: 1.90 },
  { mes: 'Abr', comb: 941078.10, litros: 131764.24, manut: 238345.02, kml: 3.68, combKm: 1.94 },
  { mes: 'Mai', comb: 915439.27, litros: 134849.22, manut: 258003.44, kml: 3.11, combKm: 2.18 },
  { mes: 'Jun', comb: 924028.70, litros: 138328.13, manut: 247383.32, kml: 3.86, combKm: 1.73 },
  { mes: 'Jul', comb: 891598.99, litros: 136008.86, manut: 320593.82, kml: 3.60, combKm: 1.82 },
  { mes: 'Ago*', comb: 107959.82, litros: 16183.23, manut: 10237.05, kml: 2.78, combKm: 2.40 },
];

export const offenders = [
  { rank: 1, truck: 'EZH6J29 — Cavalo LS', km: 1592, kml: 2.40, manut: 8053, custoKm: 4.68, motivo: 'Utilização muito baixa, R$ 1,77/km de manutenção e 17 dias em manutenção' },
  { rank: 2, truck: 'FPQ3187 — Truck', km: 4665, kml: 3.33, manut: 21839, custoKm: 3.59, motivo: 'R$ 1,56/km de manutenção e 12 OS; forte candidato a substituição' },
  { rank: 3, truck: 'FDB7941 — Cavalo LS', km: 4378, kml: 2.31, manut: 12410, custoKm: 4.31, motivo: '13 OS, nove dias em manutenção e custo elevado' },
  { rank: 4, truck: 'EVO9H70 — Cavalo', km: 3237, kml: 2.15, manut: 7715, custoKm: 4.05, motivo: 'Consumo ruim, utilização abaixo do desejável e histórico de manutenção alto' },
  { rank: 5, truck: 'GJU1B26 — Cavalo LS', km: 4303, kml: 2.35, manut: 24338, custoKm: 4.79, motivo: 'R$ 1,95/km de manutenção e dez dias parado' },
  { rank: 6, truck: 'EVO9758 — Cavalo LS', km: 2621, kml: 2.04, manut: 12231, custoKm: 4.17, motivo: 'Pouco rodado, consumo ruim e manutenção recorrente' },
  { rank: 7, truck: 'FXS6A81 — Truck', km: 5743, kml: 3.44, manut: 25487, custoKm: 3.46, motivo: 'Maior manutenção recente entre os Trucks, 15 OS e dez dias parado' },
  { rank: 8, truck: 'FGX2388 — Cavalo LS', km: 5050, kml: 2.23, manut: 14426, custoKm: 4.06, motivo: 'Consumo ruim, manutenção elevada e oito dias parado' },
  { rank: 9, truck: 'FDZ0C43 — Cavalo LS', km: 3099, kml: 2.25, manut: 9171, custoKm: 3.71, motivo: 'Baixa utilização e concentração de manutenção em junho e julho' },
  { rank: 10, truck: 'FDP4D53 — 3/4', km: 4117, kml: 5.42, manut: 21967, custoKm: 3.08, motivo: 'Combustível eficiente, mas manutenção muito acima dos demais 3/4 e 15 OS' },
];

export const dataProblems = [
  { problema: 'Hodômetro e KM rodado', evidencia: '449 de 1.819 registros mensais têm algum alerta', impacto: 'KM/L e R$/km podem ser distorcidos sem filtro', acao: 'Usar eficiência somente com Obs_KM_Rodado = OK' },
  { problema: 'Motorista sem preenchimento', evidencia: '3.534 de 10.882 abastecimentos estão sem motorista', impacto: 'Ranking de motorista fica injusto e pouco acionável', acao: 'Tornar motorista obrigatório no abastecimento' },
  { problema: 'Tempo em manutenção', evidencia: '1.504 de 2.592 OS estão com zero dias; existe OS com 367 dias', impacto: 'Indisponibilidade e SLA ficam contaminados', acao: 'Definir regra de abertura, entrega e encerramento' },
  { problema: 'Classificação da manutenção', evidencia: '2.584 OS como corretiva; pouca distinção de preventiva', impacto: 'Não mede corretamente manutenção planejada x emergência', acao: 'Revisar tipos no ESLCloud e treinar lançamento' },
  { problema: 'Cadastro da frota', evidencia: 'Placas e categorias precisam de padronização contínua', impacto: 'Comparações por tipo, origem e cavalo/baú perdem precisão', acao: 'Manter Frota.xlsx como tabela-mestre oficial' },
];

export const dashboard = {
  periodo: 'Janeiro a Julho/2026',
  combustivel: 6556035.59,
  litros: 997873.91,
  precoMedio: 6.57,
  kmValidado: 3089612,
  kmlValidado: 3.57,
  combustivelKm: 1.84,
  manutencao: 1952477.17,
  ordens: 1550,
  pecasPct: 0.593,
  maoPct: 0.407,
  custoParcialKm: 2.47,
  registrosOK: 1370,
  registrosTotais: 1819,
};

export function SlideShell({ children, eyebrow, title, subtitle }: { children: any; eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="slide" style={{ ...styles.slide }}>
      <div style={styles.redGlow} />
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>{eyebrow}</p>
          <h1 style={styles.title}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
        <img src="/assets/logotransmassa.png" alt="Transmassa" style={styles.logo} />
      </header>
      <main style={styles.content}>{children}</main>
    </section>
  );
}

export function Kpi({ label, value, note, tone = 'red' }: { label: string; value: string; note?: string; tone?: 'red' | 'green' | 'blue' | 'amber' }) {
  const toneColor = tone === 'green' ? colors.green : tone === 'blue' ? colors.blue : tone === 'amber' ? colors.amber : colors.red;
  return (
    <article style={{ ...styles.kpi, borderColor: `${toneColor}66` }}>
      <span style={styles.kpiLabel}>{label}</span>
      <strong style={{ ...styles.kpiValue, color: toneColor }}>{value}</strong>
      {note && <small style={styles.kpiNote}>{note}</small>}
    </article>
  );
}

export function Bars({ rows, valueKey, color = colors.red, formatter = compactMoney }: { rows: any[]; valueKey: string; color?: string; formatter?: (v: number) => string }) {
  const max = Math.max(...rows.map((r) => Number(r[valueKey]) || 0), 1);
  return (
    <div style={styles.bars}>
      {rows.map((row) => {
        const v = Number(row[valueKey]) || 0;
        return (
          <div key={row.mes} style={styles.barItem}>
            <div style={styles.barLabel}>{row.mes}</div>
            <div style={styles.barTrack}><div style={{ ...styles.barFill, background: color, width: `${(v / max) * 100}%` }} /></div>
            <div style={styles.barValue}>{formatter(v)}</div>
          </div>
        );
      })}
    </div>
  );
}

export function DownloadButton({ rows, filename }: { rows: any[]; filename: string }) {
  function downloadCsv() {
    const headers = Object.keys(rows[0] || {});
    const csv = [headers.join(';'), ...rows.map((r) => headers.map((h) => String(r[h] ?? '').replace(/;/g, ',')).join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return <button onClick={downloadCsv} style={styles.button}>Baixar tabela CSV</button>;
}

export const styles: Record<string, any> = {
  slide: {
    minHeight: '100%', position: 'relative', overflow: 'hidden', padding: '42px 48px',
    background: 'radial-gradient(circle at 12% 10%, rgba(227,27,35,.28), transparent 26%), linear-gradient(135deg, #060606 0%, #111114 56%, #1a0708 100%)',
    color: colors.text,
  },
  redGlow: { position: 'absolute', right: '-160px', bottom: '-220px', width: 520, height: 520, borderRadius: '50%', background: 'rgba(227,27,35,.22)', filter: 'blur(12px)' },
  header: { display: 'flex', justifyContent: 'space-between', gap: 26, alignItems: 'flex-start', marginBottom: 22, position: 'relative', zIndex: 1 },
  logo: { width: 210, maxHeight: 88, objectFit: 'contain', filter: 'drop-shadow(0 16px 30px rgba(0,0,0,.35))' },
  eyebrow: { color: colors.red2, textTransform: 'uppercase', letterSpacing: '.16em', fontWeight: 900, fontSize: 13, margin: '0 0 10px' },
  title: { fontSize: 43, lineHeight: 1.03, letterSpacing: '-.04em', margin: 0, maxWidth: 1000 },
  subtitle: { margin: '13px 0 0', color: colors.muted, fontSize: 17, maxWidth: 900, lineHeight: 1.45 },
  content: { position: 'relative', zIndex: 1 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 20, alignItems: 'stretch' },
  card: { background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: 24, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.28)' },
  kpi: { background: colors.panel, border: '1px solid rgba(255,255,255,.12)', borderRadius: 22, padding: 18, minHeight: 122 },
  kpiLabel: { display: 'block', color: colors.muted, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '.09em', fontSize: 12 },
  kpiValue: { display: 'block', fontSize: 31, lineHeight: 1.05, marginTop: 12, letterSpacing: '-.04em' },
  kpiNote: { display: 'block', color: '#d4d4d8', marginTop: 8, fontWeight: 700, lineHeight: 1.3 },
  bars: { display: 'grid', gap: 12 },
  barItem: { display: 'grid', gridTemplateColumns: '50px 1fr 120px', gap: 12, alignItems: 'center' },
  barLabel: { color: '#e4e4e7', fontWeight: 900 },
  barTrack: { height: 16, borderRadius: 999, background: 'rgba(255,255,255,.08)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  barValue: { color: '#fafafa', fontWeight: 900, textAlign: 'right' },
  button: { border: 0, borderRadius: 999, padding: '11px 16px', background: colors.red, color: '#fff', fontWeight: 900, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 },
  th: { color: '#fecaca', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 10.5, padding: '8px 7px', borderBottom: `1px solid ${colors.line}` },
  td: { color: '#f4f4f5', fontWeight: 700, padding: '8px 7px', borderBottom: `1px solid ${colors.line}`, verticalAlign: 'top' },
  pill: { display: 'inline-flex', borderRadius: 999, padding: '7px 11px', background: 'rgba(227,27,35,.16)', border: '1px solid rgba(227,27,35,.36)', color: '#fecaca', fontWeight: 900 },
};
