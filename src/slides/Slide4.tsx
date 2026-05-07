import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ReactECharts from "echarts-for-react";

type SortType = "desc" | "asc";

type MaintenanceRow = {
  placa: string;
  mes: string;
  total: number;
};

const FILE_PATH =
  "/data/Base_Consolidada_Placa_Mes_Transmassa_Cavalos_2026.xlsx";

const monthOrder = ["Janeiro", "Fevereiro", "Março", "Abril"];

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
  return Object.keys(row).find((key) =>
    aliases.some((alias) => normalizeText(key).includes(normalizeText(alias)))
  );
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

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export default function Slide4() {
  const [rows, setRows] = useState<MaintenanceRow[]>([]);
  const [sortType, setSortType] = useState<SortType>("desc");

  useEffect(() => {
    async function loadData() {
      const response = await fetch(FILE_PATH);
      const arrayBuffer = await response.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, { type: "array" });

    const sheetName =
  workbook.SheetNames.find((name) => {
    const normalized = normalizeText(name);
    return normalized.includes("manutencao");
  }) ?? workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      const parsedRows = rawRows
        .map((row) => ({
          placa: String(
            getValue(row, ["placa", "veiculo", "veículo"])
          ).trim(),

          mes: getMonthName(
            getValue(row, ["mês", "mes", "competência"])
          ),
total: toNumber(
  getValue(row, [
    "manutenção r$",
    "manutencao r$",
    "manutenção",
    "manutencao",
    "total",
    "valor",
  ])
),
        }))
        .filter(
          (row) =>
            row.placa &&
            monthOrder.includes(row.mes)
        );

      setRows(parsedRows);
    }

    loadData();
  }, []);

  const monthly = useMemo(() => {
    return monthOrder.map((mes) => {
      const monthRows = rows.filter((row) => row.mes === mes);

      return {
        mes,
        total: monthRows.reduce(
          (sum, row) => sum + row.total,
          0
        ),
      };
    });
  }, [rows]);

const byVehicle = useMemo(() => {
  const grouped = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.placa] = (acc[row.placa] || 0) + row.total;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([placa, total]) => ({
      placa,
      total,
    }))
    .filter((item) => item.total > 0) // remove placas zeradas
    .sort((a, b) =>
      sortType === "desc"
        ? b.total - a.total
        : a.total - b.total
    )
    .slice(0, 12);
}, [rows, sortType]);

  const lineChart = {
    grid: {
      left: 70,
      right: 24,
      top: 28,
      bottom: 36,
    },

    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) =>
        formatCurrency(value),
    },

    xAxis: {
      type: "category",
      data: monthly.map((item) => item.mes),
      axisTick: { show: false },
    },

    yAxis: {
      type: "value",

      axisLabel: {
        formatter: (value: number) =>
          `R$ ${(value / 1000).toFixed(0)}k`,
      },

      splitLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
    },

    series: [
      {
        type: "line",
        smooth: true,
        symbolSize: 10,

        data: monthly.map((item) => item.total),

        lineStyle: {
          width: 4,
          color: "#991b1b",
        },

        itemStyle: {
          color: "#dc2626",
        },

        areaStyle: {
          color: "rgba(220, 38, 38, 0.10)",
        },
      },
    ],
  };

  const barChart = {
    grid: {
      left: 90,
      right: 28,
      top: 28,
      bottom: 36,
    },

    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) =>
        formatCurrency(value),
    },

    xAxis: {
      type: "value",

      axisLabel: {
        formatter: (value: number) =>
          `R$ ${(value / 1000).toFixed(0)}k`,
      },

      splitLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
    },

    yAxis: {
      type: "category",
      data: byVehicle.map((item) => item.placa),
    },

    series: [
      {
        type: "bar",

        data: byVehicle.map((item) => item.total),

        barWidth: 22,

        itemStyle: {
          borderRadius: [0, 12, 12, 0],
          color: "#b01625",
        },
      },
    ],
  };

  const totalMaintenance = rows.reduce(
    (sum, row) => sum + row.total,
    0
  );

  return (
    <section className="slide slide4">
      <header className="slide4-header">
        <div>
          <span className="slide4-tag">
            Manutenção
          </span>

          <h1 className="slide4-title">
            Evolução dos custos de manutenção
          </h1>

          <p className="slide4-subtitle">
            Acompanhamento dos custos
            operacionais de manutenção da
            frota entre Janeiro e Abril/2026.
          </p>
        </div>

        <div className="slide4-kpi">
          <span>Total manutenção 2026</span>

          <strong>
            {formatCurrency(totalMaintenance)}
          </strong>
        </div>
      </header>

      <div className="slide4-dashboard">
        <div className="slide4-chart-card">
          <div className="slide4-chart-header">
            <div>
              <strong>
                Evolução mensal
              </strong>

              <span>
                Valor total de manutenção
              </span>
            </div>
          </div>

          <ReactECharts
            option={lineChart}
            style={{
              height: 340,
              width: "100%",
            }}
          />
        </div>

        <div className="slide4-chart-card">
          <div className="slide4-chart-header">
            <div>
              <strong>
                Veículos com maior custo
              </strong>

              <span>
                Ranking de manutenção
              </span>
            </div>

            <button
              className="slide4-toggle"
              onClick={() =>
                setSortType((prev) =>
                  prev === "desc"
                    ? "asc"
                    : "desc"
                )
              }
            >
              {sortType === "desc"
                ? "Maior → Menor"
                : "Menor → Maior"}
            </button>
          </div>

          <ReactECharts
            option={barChart}
            style={{
              height: 340,
              width: "100%",
            }}
          />
        </div>
      </div>

      <footer className="slide4-warning">
        <strong>
          Evolução futura recomendada:
        </strong>

        <span>
          O cenário ideal é acompanhar
          também o tempo ocioso dos
          veículos em manutenção,
          permitindo medir quantos dias a
          frota ficou parada e o impacto
          operacional disso na
          produtividade.
        </span>
      </footer>
    </section>
  );
}