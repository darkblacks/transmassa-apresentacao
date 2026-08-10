import { SlideShell, styles } from './_shared';

export default function Slide9() {
  const steps = [
    ['D+7', 'Campo obrigatório', 'Motorista, placa, tipo e hodômetro sem vazio.'],
    ['D+15', 'Trava de hodômetro', 'Alerta quando o atual for menor ou igual ao anterior.'],
    ['D+30', 'Fechamento mensal', 'Conciliar OS, serviços, peças e abastecimento.'],
    ['D+45', 'Ofensores recorrentes', 'Lista mensal de veículos críticos e plano de ação.'],
    ['D+60', 'Governança', 'Dono do dado e regra clara por campo crítico.'],
  ];
  return (
    <SlideShell eyebrow="Apoio • plano" title="Apoio: cronograma simples para retomar processos" subtitle="Uma proposta objetiva para transformar o dashboard em rotina gerencial.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {steps.map(([prazo, titulo, texto]) => (
          <article key={prazo} style={styles.card}>
            <span style={styles.pill}>{prazo}</span>
            <h3 style={{ margin: '18px 0 10px', fontSize: 21 }}>{titulo}</h3>
            <p style={{ color: '#e4e4e7', lineHeight: 1.5 }}>{texto}</p>
          </article>
        ))}
      </div>
    </SlideShell>
  );
}
