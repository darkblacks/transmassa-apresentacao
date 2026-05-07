import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ReactECharts from "echarts-for-react";

type VariationMode = "marcoAbril" | "janeiroAbril";

type CostRow = {
  mes: string;
  custo: string;
  valor: number;
};

const FILE_PATH =
  "/data/Custos_Auxiliares_Frota_Jan_Abr_2026.xlsx";

const monthOrder = ["Janeiro", "Fevereiro", "Março", "Abril"];

const costOrder = [
  "Pedágio",
  "Pedágio(Sem Parar)",
  "Seguro de Carga",
  "Documentação/IPVA",
  "Gerenciamento de Riscos",
];

const costColors: Record<string, string> = {
   "Pedágio": "#991b1b",
  "Pedágio(Sem Parar)": "#0f766e",
  "Seguro de Carga": "#dc2626",
  "Documentação/IPVA": "#f97316",
  "Gerenciamento de Riscos": "#7f1d1d",
};

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;

  const cleaned = String(value ?? "")
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function findColumn(row: Record<string, unknown>, aliases: string[]) {
  const keys = Object.keys(row);

  for (const alias of aliases) {
    const normalizedAlias = normalizeText(alias);

    const exactMatch = keys.find(
      (key) => normalizeText(key) === normalizedAlias
    );

    if (exactMatch) {
      return exactMatch;
    }

    const partialMatch = keys.find((key) =>
      normalizeText(key).includes(normalizedAlias)
    );

    if (partialMatch) {
      return partialMatch;
    }
  }

  return undefined;
}

function getValue(row: Record<string, unknown>, aliases: string[]) {
  const key = findColumn(row, aliases);

  return key ? row[key] : "";
}

function getMonthName(value: unknown) {
  const text = normalizeText(value);

  if (text.includes("jan") || text.includes("2026-01") || text.includes("01/2026")) {
    return "Janeiro";
  }

  if (text.includes("fev") || text.includes("2026-02") || text.includes("02/2026")) {
    return "Fevereiro";
  }

  if (text.includes("mar") || text.includes("2026-03") || text.includes("03/2026")) {
    return "Março";
  }

  if (text.includes("abr") || text.includes("2026-04") || text.includes("04/2026")) {
    return "Abril";
  }

  return String(value ?? "");
}

function normalizeCostName(value: unknown) {
  const text = normalizeText(value);

  if (
    text.includes("pedagio") &&
    (text.includes("sem parar") || text.includes("semparar"))
  ) {
    return "Pedágio(Sem Parar)";
  }

  if (text.includes("pedagio")) return "Pedágio";

  if (text.includes("seguro") && text.includes("carga")) {
    return "Seguro de Carga";
  }

  if (text.includes("documentacao") || text.includes("ipva")) {
    return "Documentação/IPVA";
  }

  if (text.includes("gerenciamento") || text.includes("risco")) {
    return "Gerenciamento de Riscos";
  }

  return String(value ?? "Não classificado").trim();
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0,0%";

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + "%";
}

function getVariation(current: number, previous: number) {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0 && current > 0) return 100;

  return ((current - previous) / previous) * 100;
}

export default function Slide5() {
  const [rows, setRows] = useState<CostRow[]>([]);
  const [variationMode, setVariationMode] =
    useState<VariationMode>("marcoAbril");

  useEffect(() => {
    async function loadData() {
      const response = await fetch(FILE_PATH);
      const arrayBuffer = await response.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
      });

      const sheetName =
        workbook.SheetNames.find((name) =>
          normalizeText(name).includes("custos_gerenciais")
        ) ??
        workbook.SheetNames.find((name) =>
          normalizeText(name).includes("custos")
        ) ??
        workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      const parsedRows = rawRows
        .map((row) => {
          const mes = getMonthName(
            getValue(row, ["mês", "mes", "competência", "competencia"])
          );

          const custo = normalizeCostName(
            getValue(row, [
              "custo",
              "categoria",
              "subcategoria",
              "conta",
              "descrição",
              "descricao",
            ])
          );

          const valor = toNumber(
          getValue(row, [
            "valor considerado kpi",
            "valor considerado no kpi",
            "valor considerado",
            "considerado kpi",
          ])
        );

          return {
            mes,
            custo,
            valor,
          };
        })
        .filter(
          (row) =>
            monthOrder.includes(row.mes) &&
            costOrder.includes(row.custo) &&
            row.valor > 0
        );

      setRows(parsedRows);
    }

    loadData();
  }, []);

  const monthlyByCost = useMemo(() => {
    return costOrder.map((custo) => {
      const values = monthOrder.map((mes) => {
        return rows
          .filter((row) => row.custo === custo && row.mes === mes)
          .reduce((sum, row) => sum + row.valor, 0);
      });

      return {
        custo,
        values,
        total: values.reduce((sum, value) => sum + value, 0),
        abril: values[3] ?? 0,
        marco: values[2] ?? 0,
        janeiro: values[0] ?? 0,
      };
    });
  }, [rows]);

  const totalGeral = useMemo(() => {
    return rows.reduce((sum, row) => sum + row.valor, 0);
  }, [rows]);

  const totalAbril = useMemo(() => {
    return rows
      .filter((row) => row.mes === "Abril")
      .reduce((sum, row) => sum + row.valor, 0);
  }, [rows]);

  const maiorCustoAbril = useMemo(() => {
    return [...monthlyByCost].sort((a, b) => b.abril - a.abril)[0];
  }, [monthlyByCost]);

  const variacaoTotalAbrilVsMarco = useMemo(() => {
    const abril = rows
      .filter((row) => row.mes === "Abril")
      .reduce((sum, row) => sum + row.valor, 0);

    const marco = rows
      .filter((row) => row.mes === "Março")
      .reduce((sum, row) => sum + row.valor, 0);

    return getVariation(abril, marco);
  }, [rows]);

  const variationData = useMemo(() => {
    return monthlyByCost.map((item) => {
      const current = variationMode === "marcoAbril" ? item.abril : item.abril;
      const previous = variationMode === "marcoAbril" ? item.marco : item.janeiro;

      return {
        custo: item.custo,
        variacao: getVariation(current, previous),
      };
    });
  }, [monthlyByCost, variationMode]);

  const evolutionChart = {
    color: costOrder.map((cost) => costColors[cost]),

    grid: {
      left: 76,
      right: 26,
      top: 44,
      bottom: 42,
    },

    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => formatCurrency(value),
    },

    legend: {
      top: 0,
      left: 0,
      itemGap: 18,
      textStyle: {
        color: "#475569",
        fontWeight: 700,
      },
    },

    xAxis: {
      type: "category",
      data: monthOrder,
      axisTick: { show: false },
    },

    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `R$ ${(value / 1000).toFixed(0)}k`,
      },
      splitLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
    },

    series: monthlyByCost.map((item) => ({
      name: item.custo,
      type: "line",
      smooth: true,
      symbolSize: 9,
      data: item.values,
      lineStyle: {
        width: 4,
      },
      areaStyle: {
        opacity: 0.05,
      },
    })),
  };

  const variationChart = {
    grid: {
      left: 150,
      right: 30,
      top: 28,
      bottom: 34,
    },

    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => formatPercent(value),
    },

    xAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `${value}%`,
      },
      splitLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
    },

    yAxis: {
      type: "category",
      data: variationData.map((item) => item.custo),
      axisTick: { show: false },
    },

    series: [
      {
        type: "bar",
        data: variationData.map((item) => ({
          value: item.variacao,
          itemStyle: {
            color: item.variacao >= 0 ? "#b01625" : "#16a34a",
            borderRadius: item.variacao >= 0 ? [0, 12, 12, 0] : [12, 0, 0, 12],
          },
        })),
        barWidth: 24,
        label: {
          show: true,
          position: "right",
          formatter: ({ value }: { value: number }) => formatPercent(value),
          color: "#0f172a",
          fontWeight: 800,
        },
      },
    ],
  };

  return (
    <section className="slide slide5">
      <header className="slide5-header">
        <div>
          <span className="slide5-tag">Custos auxiliares</span>

          <h1 className="slide5-title">
            Evolução dos custos gerenciais
          </h1>

          <p className="slide5-subtitle">
            Visão mensal dos custos que complementam a análise da frota:
            pedágio, seguro de carga, documentação e gerenciamento de riscos.
          </p>
        </div>

        <div className="slide5-kpis">
          <div className="slide5-kpi">
            <span>Total Jan–Abr</span>
            <strong>{formatCurrency(totalGeral)}</strong>
          </div>

          <div className="slide5-kpi">
            <span>Total Abril</span>
            <strong>{formatCurrency(totalAbril)}</strong>
          </div>

          <div className="slide5-kpi highlight">
            <span>Variação Abr x Mar</span>
            <strong>{formatPercent(variacaoTotalAbrilVsMarco)}</strong>
          </div>
        </div>
      </header>

      <div className="slide5-main-grid">
        <div className="slide5-chart-card wide">
          <div className="slide5-chart-header">
            <div>
              <strong>Evolução mês a mês</strong>
              <span>Comparação entre os principais custos auxiliares</span>
            </div>
          </div>

          <ReactECharts
            option={evolutionChart}
            style={{
              height: 330,
              width: "100%",
            }}
          />
        </div>

        <div className="slide5-side-panel">
          <div className="slide5-side-card">
            <span>Maior custo em Abril</span>
            <strong>
              {maiorCustoAbril?.custo ?? "Sem dados"}
            </strong>
            <p>
              {formatCurrency(maiorCustoAbril?.abril ?? 0)}
            </p>
          </div>

          <div className="slide5-cost-list">
            {monthlyByCost.map((item) => (
              <div className="slide5-cost-item" key={item.custo}>
                <div>
                  <strong>{item.custo}</strong>
                  <span>Total Jan–Abr</span>
                </div>

                <p>{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="slide5-bottom-grid">
        <div className="slide5-chart-card">
          <div className="slide5-chart-header">
            <div>
              <strong>Comparativo de aumento/redução</strong>
              <span>
                {variationMode === "marcoAbril"
                  ? "Abril comparado com Março"
                  : "Abril comparado com Janeiro"}
              </span>
            </div>

            <button
              className="slide5-toggle"
              onClick={() =>
                setVariationMode((prev) =>
                  prev === "marcoAbril" ? "janeiroAbril" : "marcoAbril"
                )
              }
            >
              {variationMode === "marcoAbril"
                ? "Abr x Mar"
                : "Abr x Jan"}
            </button>
          </div>

          <ReactECharts
            option={variationChart}
            style={{
              height: 260,
              width: "100%",
            }}
          />
        </div>

        <footer className="slide5-note">
          <strong>Observação gerencial:</strong>
          <span>
            Estes custos estão conectados por mês, não por placa. A leitura
            correta é usar esses valores como complemento do fechamento mensal
            da frota, sem distribuir automaticamente por veículo nesta etapa.
          </span>
        </footer>
      </div>
    </section>
  );
}