import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Filter, Gauge, MousePointer2, PackageSearch, Scale, Table2, Truck } from "lucide-react";
import DeckStyles from "./DeckStyles";

type PeriodKey = "consolidado" | "mai" | "jun" | "jul";
type TripRow = {
  period: "mai" | "jun" | "jul";
  manifesto: string;
  filial: string;
  data: string;
  veiculo: string;
  destino: string;
  kgReal: string;
  classificacao: string;
};

const tripRows: TripRow[] = [
  {
    "period": "mai",
    "manifesto": "53927",
    "filial": "TRANSMASSA - SBC",
    "data": "03/05/2026",
    "veiculo": "FPX1E68",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "20.196,26",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "53909",
    "filial": "TRANSMASSA - RJ",
    "data": "04/05/2026",
    "veiculo": "FGX2388",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "17.607,73",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "54527",
    "filial": "TRANSMASSA - SBC",
    "data": "06/05/2026",
    "veiculo": "GJT1I13",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "20.397,08",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "54883",
    "filial": "TRANSMASSA - SBC",
    "data": "07/05/2026",
    "veiculo": "FXB0I17",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "18.856,46",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "55475",
    "filial": "TRANSMASSA - RJ",
    "data": "12/05/2026",
    "veiculo": "EZH6J29",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "20.397,08",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "55857",
    "filial": "TRANSMASSA - RJ",
    "data": "13/05/2026",
    "veiculo": "EVO9758",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "14.766,03",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "56118",
    "filial": "TRANSMASSA - RJ",
    "data": "13/05/2026",
    "veiculo": "FDZ0231",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "23.548,80",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "56097",
    "filial": "TRANSMASSA - RJ",
    "data": "14/05/2026",
    "veiculo": "FGX2388",
    "destino": "RJ - INT RJ, Itaboraí",
    "kgReal": "27.507,55",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "56681",
    "filial": "TRANSMASSA - SBC",
    "data": "17/05/2026",
    "veiculo": "FWB9C19",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "16.870,23",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "56762",
    "filial": "TRANSMASSA - SBC",
    "data": "17/05/2026",
    "veiculo": "GJT1I13",
    "destino": "RJ - CAPITAL, Queimados",
    "kgReal": "24.273,02",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "57601",
    "filial": "TRANSMASSA - SBC",
    "data": "21/05/2026",
    "veiculo": "GJT1I13",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "24.472,02",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "58679",
    "filial": "TRANSMASSA - SBC",
    "data": "27/05/2026",
    "veiculo": "FXS5J85",
    "destino": "TRANSDALLA - RJ",
    "kgReal": "18.520,72",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "58877",
    "filial": "TRANSMASSA - SBC",
    "data": "28/05/2026",
    "veiculo": "GEX7J17",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "24.515,26",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "59403",
    "filial": "TRANSMASSA - SBC",
    "data": "31/05/2026",
    "veiculo": "FWB9C19",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "16.819,81",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "mai",
    "manifesto": "59414",
    "filial": "TRANSMASSA - SBC",
    "data": "31/05/2026",
    "veiculo": "FGX2388",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "23.097,47",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "59562",
    "filial": "TRANSMASSA - RJ",
    "data": "02/06/2026",
    "veiculo": "GJU1B26",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "18.520,72",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "60467",
    "filial": "TRANSMASSA - SBC",
    "data": "04/06/2026",
    "veiculo": "FGX2388",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "17.231,42",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "60468",
    "filial": "TRANSMASSA - SBC",
    "data": "04/06/2026",
    "veiculo": "FXS5J85",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "19.766,83",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "60671",
    "filial": "TRANSMASSA - RJ",
    "data": "08/06/2026",
    "veiculo": "EVO9H62",
    "destino": "RJ - CAPITAL, Duque de Caxias",
    "kgReal": "16.065,45",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "61109",
    "filial": "TRANSMASSA - RJ",
    "data": "09/06/2026",
    "veiculo": "FVB3J92",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "19.766,83",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "61614",
    "filial": "TRANSDALLA - RJ",
    "data": "10/06/2026",
    "veiculo": "FDB7941",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "22.713,22",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "62816",
    "filial": "TRANSMASSA - SBC",
    "data": "17/06/2026",
    "veiculo": "FXS5J85",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "24.544,32",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "64145",
    "filial": "TRANSMASSA - SBC",
    "data": "23/06/2026",
    "veiculo": "FXS5J85",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "17.945,93",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "64330",
    "filial": "TRANSMASSA - SBC",
    "data": "24/06/2026",
    "veiculo": "GJT1I13",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "22.176,54",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "64575",
    "filial": "TRANSMASSA - RJ",
    "data": "26/06/2026",
    "veiculo": "DVT6D75",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "15.823,75",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "64917",
    "filial": "TRANSMASSA - SBC",
    "data": "27/06/2026",
    "veiculo": "FDB7941",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "20.883,66",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "64919",
    "filial": "TRANSMASSA - SBC",
    "data": "28/06/2026",
    "veiculo": "FPX1E68",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "18.064,42",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jun",
    "manifesto": "64920",
    "filial": "TRANSMASSA - SBC",
    "data": "28/06/2026",
    "veiculo": "GJT1I13",
    "destino": "TRANSDALLA - RJ",
    "kgReal": "18.102,30",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "65704",
    "filial": "TRANSMASSA - SBC",
    "data": "01/07/2026",
    "veiculo": "FDB7941",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "20.242,93",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "66147",
    "filial": "TRANSMASSA - SBC",
    "data": "02/07/2026",
    "veiculo": "GJU1B26",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "18.512,24",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "66115",
    "filial": "TRANSMASSA - RJ",
    "data": "03/07/2026",
    "veiculo": "EVO9763",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "23.684,35",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "66232",
    "filial": "TRANSMASSA - RJ",
    "data": "04/07/2026",
    "veiculo": "EVO9H70",
    "destino": "RJ - INT RJ 2, Três Rios",
    "kgReal": "14.077,75",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "66387",
    "filial": "TRANSMASSA - SBC",
    "data": "05/07/2026",
    "veiculo": "FGX2388",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "14.522,45",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "67225",
    "filial": "TRANSMASSA - SBC",
    "data": "07/07/2026",
    "veiculo": "FXB0I17",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "21.006,27",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "66914",
    "filial": "TRANSMASSA - RJ",
    "data": "08/07/2026",
    "veiculo": "GFK9E99",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "18.512,24",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "67006",
    "filial": "TRANSMASSA - RJ",
    "data": "08/07/2026",
    "veiculo": "FDB7941",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "14.107,01",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "67425",
    "filial": "TRANSMASSA - SBC",
    "data": "09/07/2026",
    "veiculo": "GEX7J17",
    "destino": "—",
    "kgReal": "16.020,27",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "67535",
    "filial": "TRANSMASSA - SBC",
    "data": "09/07/2026",
    "veiculo": "GEX7J17",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "16.020,27",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "67659",
    "filial": "TRANSMASSA - SBC",
    "data": "09/07/2026",
    "veiculo": "GJT1I13",
    "destino": "RJ - CAPITAL, Duque de Caxias",
    "kgReal": "17.407,46",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "67494",
    "filial": "TRANSMASSA - RJ",
    "data": "10/07/2026",
    "veiculo": "DVT6D75",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "14.829,05",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "68956",
    "filial": "TRANSMASSA - SBC",
    "data": "16/07/2026",
    "veiculo": "FDB7J42",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "14.685,53",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "69446",
    "filial": "TRANSMASSA - SBC",
    "data": "20/07/2026",
    "veiculo": "GJT1I13",
    "destino": "RJ - CAPITAL, Queimados",
    "kgReal": "18.506,88",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "69507",
    "filial": "TRANSDALLA - RP",
    "data": "21/07/2026",
    "veiculo": "FXS5J85",
    "destino": "RB - INT 3, São Carlos, Ribeirão Preto",
    "kgReal": "14.137,44",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "70687",
    "filial": "TRANSMASSA - SBC",
    "data": "26/07/2026",
    "veiculo": "FWB9C19",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "23.456,75",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "70844",
    "filial": "TRANSMASSA - SBC",
    "data": "27/07/2026",
    "veiculo": "FXS5J85",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "35.960,51",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "70858",
    "filial": "TRANSMASSA - RJ",
    "data": "27/07/2026",
    "veiculo": "EVO9H62",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "19.787,04",
    "classificacao": "DISTRIBUIÇÃO"
  },
  {
    "period": "jul",
    "manifesto": "71812",
    "filial": "TRANSMASSA - SBC",
    "data": "30/07/2026",
    "veiculo": "GJT1I13",
    "destino": "RJ - CAPITAL, Rio de Janeiro",
    "kgReal": "15.842,18",
    "classificacao": "DISTRIBUIÇÃO"
  }
];

const monthSeries = {
  "mai": {
    "label": "Maio",
    "above14": 15,
    "tripCount": 192,
    "days": [
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      0,
      0,
      0,
      1,
      2,
      1,
      0,
      0,
      2,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      0,
      0,
      2
    ],
    "buckets": [
      {
        "label": "≤ 8 t",
        "count": 157,
        "tone": "ok"
      },
      {
        "label": "8–10 t",
        "count": 12,
        "tone": "ok"
      },
      {
        "label": "10–14 t",
        "count": 8,
        "tone": "ok"
      },
      {
        "label": "> 14 t",
        "count": 15,
        "tone": "risk"
      }
    ]
  },
  "jun": {
    "label": "Junho",
    "above14": 13,
    "tripCount": 172,
    "days": [
      0,
      1,
      0,
      2,
      0,
      0,
      0,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      2,
      0,
      0
    ],
    "buckets": [
      {
        "label": "≤ 8 t",
        "count": 142,
        "tone": "ok"
      },
      {
        "label": "8–10 t",
        "count": 11,
        "tone": "ok"
      },
      {
        "label": "10–14 t",
        "count": 6,
        "tone": "ok"
      },
      {
        "label": "> 14 t",
        "count": 13,
        "tone": "risk"
      }
    ]
  },
  "jul": {
    "label": "Julho",
    "above14": 19,
    "tripCount": 180,
    "days": [
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      2,
      3,
      1,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      1,
      0,
      0,
      0,
      0,
      1,
      2,
      0,
      0,
      1,
      0
    ],
    "buckets": [
      {
        "label": "≤ 8 t",
        "count": 143,
        "tone": "ok"
      },
      {
        "label": "8–10 t",
        "count": 12,
        "tone": "ok"
      },
      {
        "label": "10–14 t",
        "count": 6,
        "tone": "ok"
      },
      {
        "label": "> 14 t",
        "count": 19,
        "tone": "risk"
      }
    ]
  }
} as const;

const consolidatedDays = [1, 2, 2, 4, 1, 1, 2, 3, 4, 2, 0, 1, 2, 1, 0, 1, 3, 0, 0, 1, 2, 0, 1, 1, 0, 2, 4, 3, 0, 1, 2];

const periodButtons: { key: PeriodKey; label: string }[] = [
  { key: "consolidado", label: "Consolidado" },
  { key: "mai", label: "Maio" },
  { key: "jun", label: "Junho" },
  { key: "jul", label: "Julho" },
];

export default function SlideTruck() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("consolidado");
  const [hoverDay, setHoverDay] = useState<{ day: number; count: number } | null>(null);

  const selected = useMemo(() => {
    if (selectedPeriod === "consolidado") {
      return {
        label: "Consolidado",
        above14: 47,
        tripCount: 544,
        days: consolidatedDays,
        buckets: [
          {
                    "label": "≤ 8 t",
                    "count": 442,
                    "tone": "ok"
          },
          {
                    "label": "8–10 t",
                    "count": 35,
                    "tone": "ok"
          },
          {
                    "label": "10–14 t",
                    "count": 20,
                    "tone": "ok"
          },
          {
                    "label": "> 14 t",
                    "count": 47,
                    "tone": "risk"
          }
] as const,
      };
    }
    return monthSeries[selectedPeriod];
  }, [selectedPeriod]);

  const filteredRows = useMemo(() => (
    selectedPeriod === "consolidado"
      ? tripRows
      : tripRows.filter((row) => row.period === selectedPeriod)
  ), [selectedPeriod]);

  const maxDaily = Math.max(...selected.days, 1);
  const topDays = selected.days
    .map((count, index) => ({ day: index + 1, count }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.day - b.day)
    .slice(0, 3);

  return (
    <section className="slide tm-slide">
      <DeckStyles />
      <img className="tm-logo-mini" src="/assets/logotransmassa.png" alt="Transmassa" />

      <span className="tm-eyebrow">05 • Dimensionamento</span>
      <h1 className="tm-title">Cavalo x Truck: leitura sem transferência e sem Distribuição SBC</h1>
      <p className="tm-subtitle">
        Para focar no que realmente pertence à operação do Rio de Janeiro, esta análise desconsidera tanto as viagens classificadas como transferência quanto as classificadas como Distribuição SBC.
        Assim, o slide passa a refletir melhor o que deve permanecer na malha RJ e o que pode ser investigado para substituição por Truck.
      </p>

      <div className="tm-kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 16 }}>
        {[
          { label: "Viagens analisadas", value: "544", hint: "Cavalos próprios · finalizadas · sem transferência e sem Distribuição SBC" },
          { label: "Até 14 t", value: "497", hint: "91.4".replace('.', ',') + "% dentro da faixa de Truck" },
          { label: "Acima de 14 t", value: "47", hint: "8.6".replace('.', ',') + "% passaram da referência" },
          { label: "Maior carga", value: "36.0".replace('.', ',') + " t", hint: "Pico observado na base filtrada" },
        ].map((item) => (
          <div className="tm-kpi" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.hint}</small>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.95fr", gap: 16, marginBottom: 16 }}>
        <div className="tm-chart-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Truck size={22} color="#991b1b" />
            <h2 className="tm-mini-title" style={{ margin: 0 }}>Faixa de carga por viagem</h2>
          </div>
          <p style={{ marginBottom: 16 }}>
            Após retirar transferências e Distribuição SBC, a leitura fica mais aderente ao que realmente representa a operação do RJ.
          </p>

          <div style={{ display: "grid", gap: 12 }}>
            {selected.buckets.map((item) => {
              const percent = (item.count / selected.tripCount) * 100;
              return (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 900, color: "#334155" }}>
                    <span>{item.label}</span>
                    <span>{percent.toFixed(1).replace('.', ',')}% · {item.count} viagens</span>
                  </div>
                  <div className="tm-bar-track" style={{ marginTop: 6, height: 16 }}>
                    <div className="tm-bar-fill" style={{ width: `${percent}%`, background: item.tone === "risk" ? "#dc2626" : "#16a34a" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="tm-card" style={{ padding: 18, display: "grid", gap: 14, alignContent: "start" }}>
          <h2 className="tm-mini-title">Leitura executiva</h2>

          <div style={{ display: "flex", gap: 10 }}>
            <CheckCircle2 size={22} color="#16a34a" />
            <p style={{ margin: 0 }}>
              <strong>O cenário ficou ainda mais favorável após o corte de SP.</strong><br />
              {"497"} viagens ficaram até 14 t, equivalentes a {"91.4".replace('.', ',')}% da base analisada.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <AlertTriangle size={22} color="#dc2626" />
            <p style={{ margin: 0 }}>
              <strong>As exceções reduziram bastante.</strong><br />
              Restaram {"47"} viagens acima de 14 t, que são as que realmente pedem análise individual.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Scale size={22} color="#f59e0b" />
            <p style={{ margin: 0 }}>
              <strong>A tabela dinâmica resolve a investigação.</strong><br />
              Abaixo, cada linha acima de 14 t aparece com manifesto, filial, data, veículo, destino, kg real e classificação.
            </p>
          </div>
        </div>
      </div>

      <div className="tm-chart-card" style={{ padding: 18, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Gauge size={22} color="#991b1b" />
              <h2 className="tm-mini-title" style={{ margin: 0 }}>Evolução diária de viagens acima de 14 t</h2>
            </div>
            <p style={{ margin: 0, maxWidth: 720 }}>
              O filtro por período controla tanto o gráfico quanto a tabela dinâmica logo abaixo.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12, fontWeight: 900 }}>
              <Filter size={15} />
              <span>Filtrar período</span>
            </div>
            {periodButtons.map((item) => {
              const active = selectedPeriod === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedPeriod(item.key)}
                  style={{
                    borderRadius: 999,
                    border: active ? "1px solid #991b1b" : "1px solid #cbd5e1",
                    background: active ? "#991b1b" : "#fff",
                    color: active ? "#fff" : "#334155",
                    padding: "8px 14px",
                    fontWeight: 900,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.85fr", gap: 16, alignItems: "start" }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 18, padding: 16, background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
              <div>
                <strong style={{ color: "#0f172a", fontSize: 15 }}>{selected.label}</strong>
                <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 12 }}>
                  Meta visual: idealmente 0 viagens por dia acima de 14 t.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 12, fontWeight: 900 }}>
                <MousePointer2 size={15} />
                <span>Passe o mouse nas barras</span>
              </div>
            </div>

            <div style={{ height: 160, display: "flex", alignItems: "end", gap: 4, padding: "8px 0 10px 0", borderBottom: "1px solid #e2e8f0" }}>
              {selected.days.map((count, index) => {
                const height = count === 0 ? 8 : Math.max(12, (count / maxDaily) * 120);
                const active = hoverDay?.day === index + 1;
                return (
                  <div
                    key={`${selected.label}-${index}`}
                    onMouseEnter={() => setHoverDay({ day: index + 1, count })}
                    onMouseLeave={() => setHoverDay(null)}
                    style={{
                      flex: 1,
                      height,
                      borderRadius: 6,
                      background: count > 0 ? (active ? "#991b1b" : "#ef4444") : "#e5e7eb",
                      opacity: count > 0 ? 1 : 0.7,
                      transition: "all .15s ease",
                      transform: active ? "translateY(-2px)" : "none",
                      cursor: "pointer",
                    }}
                    title={`Dia ${String(index + 1).padStart(2, '0')}: ${count} viagem(ns) acima de 14 t`}
                  />
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: "#64748b", fontSize: 11, fontWeight: 800 }}>
              <span>01</span>
              <span>10</span>
              <span>20</span>
              <span>{String(selected.days.length).padStart(2, "0")}</span>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div className="tm-share-card">
              <span style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>PERÍODO SELECIONADO</span>
              <strong style={{ display: "block", color: "#0f172a", fontSize: 28, lineHeight: 1.05, marginTop: 10 }}>{selected.label}</strong>
              <p style={{ margin: "8px 0 0 0", fontSize: 13, color: "#475569" }}>{selected.tripCount} viagens analisadas</p>
            </div>

            <div className="tm-share-card">
              <span style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>RESULTADO DO PERÍODO</span>
              <strong style={{ display: "block", color: "#991b1b", fontSize: 32, lineHeight: 1.05, marginTop: 10 }}>{selected.above14}</strong>
              <p style={{ margin: "8px 0 0 0", fontSize: 13, color: "#475569" }}>viagens acima de 14 t</p>
            </div>

            <div className="tm-share-card">
              <span style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>HOVER / DESTAQUE</span>
              <strong style={{ display: "block", color: "#0f172a", fontSize: 24, lineHeight: 1.05, marginTop: 10 }}>
                {hoverDay ? `Dia ${String(hoverDay.day).padStart(2, "0")}` : "Passe o mouse"}
              </strong>
              <p style={{ margin: "8px 0 0 0", fontSize: 13, color: "#475569" }}>
                {hoverDay ? `${hoverDay.count} viagem(ns) acima de 14 t nesse dia` : "O detalhe do dia aparece aqui."}
              </p>
            </div>
          </div>
        </div>

        <div className="tm-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Table2 size={20} color="#991b1b" />
            <h3 style={{ margin: 0, color: "#0f172a", fontSize: 16 }}>Tabela dinâmica · viagens acima de 14 t</h3>
          </div>
          <p style={{ margin: "0 0 12px 0", color: "#64748b", fontSize: 13 }}>
            A tabela abaixo acompanha o filtro do gráfico e mostra somente as linhas que passaram de 14 t, já sem transferência e sem Distribuição SBC.
          </p>

          <div style={{ maxHeight: 310, overflow: "auto", border: "1px solid #e2e8f0", borderRadius: 16 }}>
            <table className="tm-table" style={{ minWidth: 980, margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ position: "sticky", top: 0, background: "#fff7ed", zIndex: 1 }}>Manifesto</th>
                  <th style={{ position: "sticky", top: 0, background: "#fff7ed", zIndex: 1 }}>Filial</th>
                  <th style={{ position: "sticky", top: 0, background: "#fff7ed", zIndex: 1 }}>Data</th>
                  <th style={{ position: "sticky", top: 0, background: "#fff7ed", zIndex: 1 }}>Veículo</th>
                  <th style={{ position: "sticky", top: 0, background: "#fff7ed", zIndex: 1 }}>Destino</th>
                  <th style={{ position: "sticky", top: 0, background: "#fff7ed", zIndex: 1 }}>Kg Real</th>
                  <th style={{ position: "sticky", top: 0, background: "#fff7ed", zIndex: 1 }}>Classificação</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={`${row.manifesto}-${row.veiculo}`}>
                    <td><strong>{row.manifesto}</strong></td>
                    <td>{row.filial}</td>
                    <td>{row.data}</td>
                    <td>{row.veiculo}</td>
                    <td>{row.destino}</td>
                    <td>{row.kgReal}</td>
                    <td>{row.classificacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tm-note" style={{ marginTop: 12 }}>
            Total de linhas na tabela para o período selecionado: <strong>{filteredRows.length}</strong>.
          </div>
        </div>
      </div>
    </section>
  );
}
