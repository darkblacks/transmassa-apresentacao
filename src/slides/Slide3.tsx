import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ReactECharts from "echarts-for-react";

type FilterType = "total" | "proprio" | "terceiro";
type EfficiencyMetric = "kmPorLitro" | "realPorLitro" | "realPorKm";
type TotalMetric = "reais" | "litros" | "km";

type TrailerEfficiencyMetric = "litrosPorHora" | "realPorHora";
type TrailerTotalMetric = "reais" | "litros" | "horas";

type FuelRow = {
  placa: string;
  mes: string;
  propriedade: string;
  reais: number;
  litros: number;
  km: number;
};

type TrailerFuelRow = {
  placa: string;
  mes: string;
  propriedade: string;
  reais: number;
  litros: number;
  horas: number;
  litrosPorHora: number;
  realPorHora: number;
  qualidade: string;
  filtro: string;
};

const FILE_PATH =
  "/data/Base_Consolidada_Placa_Mes_Transmassa_Cavalos_2026.xlsx";

const TRAILER_FILE_PATH =
  "/data/Combustivel_Carretas_Termoking_Transmassa_2026.xlsx";

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

function excelDateToMonthName(value: number) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(excelEpoch.getTime() + value * 86400000);

  const monthIndex = date.getUTCMonth();

  return monthOrder[monthIndex] ?? String(value);
}

function getMonthName(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return excelDateToMonthName(value);
  }

  const text = normalizeText(value);

  if (text.includes("jan") || text.includes("01/2026") || text.includes("2026-01")) return "Janeiro";
  if (text.includes("fev") || text.includes("02/2026") || text.includes("2026-02")) return "Fevereiro";
  if (text.includes("mar") || text.includes("03/2026") || text.includes("2026-03")) return "Março";
  if (text.includes("abr") || text.includes("04/2026") || text.includes("2026-04")) return "Abril";

  return String(value ?? "");
}

function isProprio(value: string) {
  const text = normalizeText(value);
  return text.includes("proprio") || text.includes("transmassa");
}

function isFalseFilter(value: unknown) {
  const text = normalizeText(value);

  return (
    text === "falso" ||
    text === "false" ||
    text === "0" ||
    text === "nao" ||
    text === "não"
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatDecimal(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatNumber(value: number) {
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  });
}

function metricLabel(metric: EfficiencyMetric) {
  const labels: Record<EfficiencyMetric, string> = {
    kmPorLitro: "KM/L",
    realPorLitro: "R$/L",
    realPorKm: "R$/KM",
  };

  return labels[metric];
}

function totalLabel(metric: TotalMetric) {
  const labels: Record<TotalMetric, string> = {
    reais: "Reais",
    litros: "Litros",
    km: "KM",
  };

  return labels[metric];
}

function trailerMetricLabel(metric: TrailerEfficiencyMetric) {
  const labels: Record<TrailerEfficiencyMetric, string> = {
    litrosPorHora: "L/h",
    realPorHora: "R$/h",
  };

  return labels[metric];
}

function trailerTotalLabel(metric: TrailerTotalMetric) {
  const labels: Record<TrailerTotalMetric, string> = {
    reais: "Reais",
    litros: "Litros",
    horas: "Horas",
  };

  return labels[metric];
}

export default function Slide3() {
  const [rows, setRows] = useState<FuelRow[]>([]);
  const [trailerRows, setTrailerRows] = useState<TrailerFuelRow[]>([]);

  const [filter, setFilter] = useState<FilterType>("total");
  const [selectedOwner, setSelectedOwner] = useState("total");
  const [selectedPlate, setSelectedPlate] = useState("total");

  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [draftPlateSearch, setDraftPlateSearch] = useState("");
  const [draftSelectedOwner, setDraftSelectedOwner] = useState("total");
  const [draftSelectedPlate, setDraftSelectedPlate] = useState("total");

  const [efficiencyMetric, setEfficiencyMetric] =
    useState<EfficiencyMetric>("kmPorLitro");

  const [totalMetric, setTotalMetric] = useState<TotalMetric>("reais");

  const [trailerEfficiencyMetric, setTrailerEfficiencyMetric] =
    useState<TrailerEfficiencyMetric>("realPorHora");

  const [trailerTotalMetric, setTrailerTotalMetric] =
    useState<TrailerTotalMetric>("reais");

  const [trailerQualityFilter, setTrailerQualityFilter] = useState("total");

  useEffect(() => {
    async function loadData() {
      const response = await fetch(FILE_PATH);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheetName =
        workbook.SheetNames.find((name) =>
          normalizeText(name).includes("combustivel")
        ) ?? workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      const parsedRows = rawRows
        .map((row) => {
          const placa = String(
            getValue(row, ["placa", "veiculo", "veículo"])
          ).trim();

          const mes = getMonthName(
            getValue(row, ["mês", "mes", "competência", "competencia"])
          );

          const propriedade = String(
            getValue(row, [
              "próprio/terceiro",
              "proprio/terceiro",
              "propriedade",
              "dono",
              "frota",
            ])
          ).trim();

          const reais = toNumber(
            getValue(row, [
              "combustível r$",
              "combustivel r$",
              "r$ combustível",
              "r$ combustivel",
              "valor combustível",
              "valor combustivel",
              "total combustível",
              "total combustivel",
            ])
          );

          const litros = toNumber(
            getValue(row, ["litros", "litragem", "volume"])
          );

          const km = toNumber(
            getValue(row, [
              "km oficial placa/mês",
              "km oficial placa/mes",
              "km oficial",
            ])
          );

          return {
            placa,
            mes,
            propriedade,
            reais,
            litros,
            km,
          };
        })
        .filter((row) => row.placa && monthOrder.includes(row.mes));

      setRows(parsedRows);
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadTrailerData() {
      const response = await fetch(TRAILER_FILE_PATH);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheetName =
        workbook.SheetNames.find((name) =>
          normalizeText(name).includes("periodos")
        ) ??
        workbook.SheetNames.find((name) =>
          normalizeText(name).includes("consolidado")
        ) ??
        workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      const parsedRows = rawRows
        .map((row) => {
          const placa = String(
            getValue(row, ["placa", "veiculo", "veículo"])
          ).trim();

          let mes = getMonthName(
  getValue(row, ["mês", "mes", "competência", "competencia"])
);

if (!monthOrder.includes(mes)) {
  mes = getMonthName(
    getValue(row, ["data fim", "data_fim", "data"])
  );
}

          const propriedade = String(
            getValue(row, [
              "próprio/terceiro",
              "proprio/terceiro",
              "propriedade",
              "dono",
              "frota",
            ])
          ).trim();

          const reais = toNumber(
            getValue(row, [
              "reais",
              "valor",
              "total",
              "r$",
              "valor total",
              "combustível r$",
              "combustivel r$",
              "r$ combustível",
              "r$ combustivel",
            ])
          );

          const litros = toNumber(
            getValue(row, ["litros", "litragem", "volume"])
          );

          const horas = toNumber(
            getValue(row, [
              "horas",
              "horas ligadas",
              "horas período",
              "horas periodo",
              "horímetro rodado",
              "horimetro rodado",
            ])
          );

          const litrosPorHora =
            toNumber(getValue(row, ["l/h", "litros por hora", "litros/hora"])) ||
            (horas > 0 ? litros / horas : 0);

          const realPorHora =
            toNumber(getValue(row, ["r$/h", "reais por hora", "valor por hora"])) ||
            (horas > 0 ? reais / horas : 0);

          const qualidade = String(
            getValue(row, ["qualidade", "confiabilidade", "status"])
          ).trim();

          const filtro = String(getValue(row, ["filtro"])).trim();

          return {
            placa,
            mes,
            propriedade,
            reais,
            litros,
            horas,
            litrosPorHora,
            realPorHora,
            qualidade: qualidade || "Não informado",
            filtro,
          };
        })
        .filter((row) => {
          return (
            row.placa &&
            monthOrder.includes(row.mes) &&
            isFalseFilter(row.filtro)
          );
        });

      setTrailerRows(parsedRows);
    }

    loadTrailerData();
  }, []);

  const plateOptions = useMemo(() => {
    const map = new Map<string, { placa: string; propriedade: string }>();

    rows.forEach((row) => {
      if (!map.has(row.placa)) {
        map.set(row.placa, {
          placa: row.placa,
          propriedade: row.propriedade || "Não informado",
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.placa.localeCompare(b.placa)
    );
  }, [rows]);

  const ownerOptions = useMemo(() => {
    return Array.from(
      new Set(
        rows
          .map((row) => row.propriedade || "Não informado")
          .filter(Boolean)
      )
    ).sort();
  }, [rows]);

  const modalPlateOptions = useMemo(() => {
    return plateOptions.filter((item) => {
      const matchOwner =
        draftSelectedOwner === "total"
          ? true
          : item.propriedade === draftSelectedOwner;

      const matchPlate = draftPlateSearch
        ? normalizeText(item.placa).includes(normalizeText(draftPlateSearch))
        : true;

      return matchOwner && matchPlate;
    });
  }, [plateOptions, draftSelectedOwner, draftPlateSearch]);

  function openPlateModal() {
    setDraftSelectedOwner(selectedOwner);
    setDraftSelectedPlate(selectedPlate);
    setDraftPlateSearch("");
    setIsPlateModalOpen(true);
  }

  function applyPlateSelection() {
    setSelectedOwner(draftSelectedOwner);
    setSelectedPlate(draftSelectedPlate);
    setIsPlateModalOpen(false);
  }

  function clearPlateSelection() {
    setDraftSelectedOwner("total");
    setDraftSelectedPlate("total");

    setSelectedOwner("total");
    setSelectedPlate("total");

    setIsPlateModalOpen(false);
  }

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchOwnership =
        filter === "total"
          ? true
          : filter === "proprio"
            ? isProprio(row.propriedade)
            : !isProprio(row.propriedade);

      const matchOwner =
        selectedOwner === "total" ? true : row.propriedade === selectedOwner;

      const matchPlate =
        selectedPlate === "total" ? true : row.placa === selectedPlate;

      return matchOwnership && matchOwner && matchPlate;
    });
  }, [rows, filter, selectedOwner, selectedPlate]);

  const monthly = useMemo(() => {
    return monthOrder.map((mes) => {
      const monthRows = filteredRows.filter((row) => row.mes === mes);

      const reais = monthRows.reduce((sum, row) => sum + row.reais, 0);
      const litros = monthRows.reduce((sum, row) => sum + row.litros, 0);
      const km = monthRows.reduce((sum, row) => sum + row.km, 0);

      return {
        mes,
        reais,
        litros,
        km,
        kmPorLitro: litros > 0 ? km / litros : 0,
        realPorLitro: litros > 0 ? reais / litros : 0,
        realPorKm: km > 0 ? reais / km : 0,
      };
    });
  }, [filteredRows]);

  const totals = useMemo(() => {
    const reais = filteredRows.reduce((sum, row) => sum + row.reais, 0);
    const litros = filteredRows.reduce((sum, row) => sum + row.litros, 0);
    const km = filteredRows.reduce((sum, row) => sum + row.km, 0);

    return {
      reais,
      litros,
      km,
      kmPorLitro: litros > 0 ? km / litros : 0,
      realPorLitro: litros > 0 ? reais / litros : 0,
      realPorKm: km > 0 ? reais / km : 0,
    };
  }, [filteredRows]);

  const filteredTrailerRows = useMemo(() => {
    return trailerRows.filter((row) => {
      const matchQuality =
        trailerQualityFilter === "total"
          ? true
          : normalizeText(row.qualidade).includes(
              normalizeText(trailerQualityFilter)
            );

      return matchQuality;
    });
  }, [trailerRows, trailerQualityFilter]);

  const trailerMonthly = useMemo(() => {
    return monthOrder.map((mes) => {
      const monthRows = filteredTrailerRows.filter((row) => row.mes === mes);

      const reais = monthRows.reduce((sum, row) => sum + row.reais, 0);
      const litros = monthRows.reduce((sum, row) => sum + row.litros, 0);
      const horas = monthRows.reduce((sum, row) => sum + row.horas, 0);

      return {
        mes,
        reais,
        litros,
        horas,
        litrosPorHora: horas > 0 ? litros / horas : 0,
        realPorHora: horas > 0 ? reais / horas : 0,
      };
    });
  }, [filteredTrailerRows]);

  const trailerTotals = useMemo(() => {
    const reais = filteredTrailerRows.reduce((sum, row) => sum + row.reais, 0);
    const litros = filteredTrailerRows.reduce((sum, row) => sum + row.litros, 0);
    const horas = filteredTrailerRows.reduce((sum, row) => sum + row.horas, 0);

    return {
      reais,
      litros,
      horas,
      litrosPorHora: horas > 0 ? litros / horas : 0,
      realPorHora: horas > 0 ? reais / horas : 0,
      placas: new Set(filteredTrailerRows.map((row) => row.placa)).size,
      periodos: filteredTrailerRows.length,
    };
  }, [filteredTrailerRows]);

  const trailerQualityOptions = useMemo(() => {
    return Array.from(
      new Set(
        trailerRows
          .map((row) => row.qualidade || "Não informado")
          .filter(Boolean)
      )
    ).sort();
  }, [trailerRows]);

  const topTrailerPlates = useMemo(() => {
    const map = new Map<
      string,
      { placa: string; reais: number; litros: number; horas: number }
    >();

    filteredTrailerRows.forEach((row) => {
      const current =
        map.get(row.placa) ?? {
          placa: row.placa,
          reais: 0,
          litros: 0,
          horas: 0,
        };

      current.reais += row.reais;
      current.litros += row.litros;
      current.horas += row.horas;

      map.set(row.placa, current);
    });

    return Array.from(map.values())
      .sort((a, b) => b.reais - a.reais)
      .slice(0, 10);
  }, [filteredTrailerRows]);

  const efficiencyChart = {
    grid: { left: 58, right: 22, top: 28, bottom: 34 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => formatDecimal(value),
    },
    xAxis: {
      type: "category",
      data: monthly.map((item) => item.mes),
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#e5e7eb" } },
    },
    series: [
      {
        name: metricLabel(efficiencyMetric),
        type: "line",
        smooth: true,
        symbolSize: 10,
        data: monthly.map((item) => item[efficiencyMetric]),
        lineStyle: { width: 4, color: "#991b1b" },
        itemStyle: { color: "#dc2626" },
        areaStyle: { color: "rgba(220, 38, 38, 0.10)" },
      },
    ],
  };

  const totalsChart = {
    grid: { left: 72, right: 22, top: 28, bottom: 34 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) =>
        totalMetric === "reais" ? formatCurrency(value) : formatNumber(value),
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
          totalMetric === "reais"
            ? `R$ ${(value / 1000).toFixed(0)}k`
            : `${(value / 1000).toFixed(0)}k`,
      },
      splitLine: { lineStyle: { color: "#e5e7eb" } },
    },
    series: [
      {
        name: totalLabel(totalMetric),
        type: "bar",
        data: monthly.map((item) => item[totalMetric]),
        barWidth: 40,
        itemStyle: {
          borderRadius: [12, 12, 0, 0],
          color: "#b01625",
        },
      },
    ],
  };

  const trailerEfficiencyChart = {
    grid: { left: 64, right: 22, top: 28, bottom: 34 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => formatDecimal(value),
    },
    xAxis: {
      type: "category",
      data: trailerMonthly.map((item) => item.mes),
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#e5e7eb" } },
    },
    series: [
      {
        name: trailerMetricLabel(trailerEfficiencyMetric),
        type: "line",
        smooth: true,
        symbolSize: 10,
        data: trailerMonthly.map((item) => item[trailerEfficiencyMetric]),
        lineStyle: { width: 4, color: "#7f1d1d" },
        itemStyle: { color: "#b91c1c" },
        areaStyle: { color: "rgba(185, 28, 28, 0.10)" },
      },
    ],
  };

  const trailerTotalsChart = {
    grid: { left: 78, right: 22, top: 28, bottom: 34 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) =>
        trailerTotalMetric === "reais"
          ? formatCurrency(value)
          : formatNumber(value),
    },
    xAxis: {
      type: "category",
      data: trailerMonthly.map((item) => item.mes),
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) =>
          trailerTotalMetric === "reais"
            ? `R$ ${(value / 1000).toFixed(0)}k`
            : `${(value / 1000).toFixed(0)}k`,
      },
      splitLine: { lineStyle: { color: "#e5e7eb" } },
    },
    series: [
      {
        name: trailerTotalLabel(trailerTotalMetric),
        type: "bar",
        data: trailerMonthly.map((item) => item[trailerTotalMetric]),
        barWidth: 40,
        itemStyle: {
          borderRadius: [12, 12, 0, 0],
          color: "#991b1b",
        },
      },
    ],
  };

  const trailerTopPlatesChart = {
    grid: { left: 78, right: 26, top: 24, bottom: 34 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => formatCurrency(value),
    },
    xAxis: {
      type: "category",
      data: topTrailerPlates.map((item) => item.placa),
      axisTick: { show: false },
      axisLabel: { rotate: 35 },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `R$ ${(value / 1000).toFixed(0)}k`,
      },
      splitLine: { lineStyle: { color: "#e5e7eb" } },
    },
    series: [
      {
        name: "Valor total",
        type: "bar",
        data: topTrailerPlates.map((item) => item.reais),
        barWidth: 28,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: "#7f1d1d",
        },
      },
    ],
  };

  return (
    <section className="slide slide3">
      <header className="slide3-header">
        <div>
          <span className="slide3-tag">Combustível</span>

          <h1 className="slide3-title">Evolução mensal do combustível</h1>

          <p className="slide3-subtitle">
            Acompanhamento de KM oficial, litros, valor total e eficiência da
            frota no período de Janeiro a Abril/2026.
          </p>
        </div>

        <div className="slide3-controls">
          <button
            type="button"
            className="slide3-open-modal-button"
            onClick={openPlateModal}
          >
            <span>Placa selecionada</span>

            <strong>
              {selectedOwner === "total" ? "Todas as frotas" : selectedOwner}

              {selectedPlate !== "total" ? ` · ${selectedPlate}` : ""}
            </strong>
          </button>

          <div className="slide3-filter">
            <button
              className={filter === "total" ? "active" : ""}
              onClick={() => setFilter("total")}
            >
              Total
            </button>

            <button
              className={filter === "proprio" ? "active" : ""}
              onClick={() => setFilter("proprio")}
            >
              Próprio
            </button>

            <button
              className={filter === "terceiro" ? "active" : ""}
              onClick={() => setFilter("terceiro")}
            >
              Terceiro
            </button>
          </div>
        </div>
      </header>

      <div className="slide3-kpis">
        <div className="slide3-kpi">
          <span>Reais totais 2026</span>
          <strong>{formatCurrency(totals.reais)}</strong>
        </div>

        <div className="slide3-kpi">
          <span>Litros totais 2026</span>
          <strong>{formatNumber(totals.litros)}</strong>
        </div>

        <div className="slide3-kpi">
          <span>KM totais 2026</span>
          <strong>{formatNumber(totals.km)}</strong>
        </div>

        <div className="slide3-kpi highlight">
          <span>R$/KM médio 2026</span>
          <strong>{formatDecimal(totals.realPorKm)}</strong>
        </div>
      </div>

      <div className="slide3-dashboard">
        <div className="slide3-chart-card">
          <div className="slide3-chart-header">
            <div>
              <strong>Indicador de eficiência</strong>
              <span>{metricLabel(efficiencyMetric)}</span>
            </div>

            <select
              value={efficiencyMetric}
              onChange={(event) =>
                setEfficiencyMetric(event.target.value as EfficiencyMetric)
              }
            >
              <option value="kmPorLitro">KM/L</option>
              <option value="realPorLitro">R$/L</option>
              <option value="realPorKm">R$/KM</option>
            </select>
          </div>

          <ReactECharts
            option={efficiencyChart}
            style={{ height: 280, width: "100%" }}
          />
        </div>

        <div className="slide3-chart-card">
          <div className="slide3-chart-header">
            <div>
              <strong>Totais mês a mês</strong>
              <span>{totalLabel(totalMetric)}</span>
            </div>

            <select
              value={totalMetric}
              onChange={(event) =>
                setTotalMetric(event.target.value as TotalMetric)
              }
            >
              <option value="reais">Reais</option>
              <option value="litros">Litros</option>
              <option value="km">KM</option>
            </select>
          </div>

          <ReactECharts
            option={totalsChart}
            style={{ height: 280, width: "100%" }}
          />
        </div>
      </div>

      <section className="slide3-trailer-section">
        <header className="slide3-trailer-header">
          <div>
            <span className="slide3-tag">Carretas / Termoking</span>

            <h2 className="slide3-trailer-title">
              Abastecimento das carretas
            </h2>
          </div>

          <div className="slide3-trailer-controls">
            <label>
              Qualidade dos dados

              <select
                value={trailerQualityFilter}
                onChange={(event) =>
                  setTrailerQualityFilter(event.target.value)
                }
              >
                <option value="total">Todas</option>

                {trailerQualityOptions.map((quality) => (
                  <option key={quality} value={quality}>
                    {quality}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <div className="slide3-kpis">
          <div className="slide3-kpi">
            <span>Valor total Termoking</span>
            <strong>{formatCurrency(trailerTotals.reais)}</strong>
          </div>

          <div className="slide3-kpi">
            <span>Litros Termoking</span>
            <strong>{formatNumber(trailerTotals.litros)}</strong>
          </div>

          <div className="slide3-kpi">
            <span>Horas apuradas</span>
            <strong>{formatNumber(trailerTotals.horas)}</strong>
          </div>

          <div className="slide3-kpi highlight">
            <span>R$/hora médio</span>
            <strong>{formatDecimal(trailerTotals.realPorHora)}</strong>
          </div>

          <div className="slide3-kpi">
            <span>L/h médio</span>
            <strong>{formatDecimal(trailerTotals.litrosPorHora)}</strong>
          </div>

          <div className="slide3-kpi">
            <span>Placas analisadas</span>
            <strong>{formatNumber(trailerTotals.placas)}</strong>
          </div>

          <div className="slide3-kpi">
            <span>Períodos válidos</span>
            <strong>{formatNumber(trailerTotals.periodos)}</strong>
          </div>
        </div>

        <div className="slide3-dashboard">
          <div className="slide3-chart-card">
            <div className="slide3-chart-header">
              <div>
                <strong>Eficiência por hora</strong>
                <span>{trailerMetricLabel(trailerEfficiencyMetric)}</span>
              </div>

              <select
                value={trailerEfficiencyMetric}
                onChange={(event) =>
                  setTrailerEfficiencyMetric(
                    event.target.value as TrailerEfficiencyMetric
                  )
                }
              >
                <option value="realPorHora">R$/h</option>
                <option value="litrosPorHora">L/h</option>
              </select>
            </div>

            <ReactECharts
              option={trailerEfficiencyChart}
              style={{ height: 280, width: "100%" }}
            />
          </div>

          <div className="slide3-chart-card">
            <div className="slide3-chart-header">
              <div>
                <strong>Totais das carretas mês a mês</strong>
                <span>{trailerTotalLabel(trailerTotalMetric)}</span>
              </div>

              <select
                value={trailerTotalMetric}
                onChange={(event) =>
                  setTrailerTotalMetric(event.target.value as TrailerTotalMetric)
                }
              >
                <option value="reais">Reais</option>
                <option value="litros">Litros</option>
                <option value="horas">Horas</option>
              </select>
            </div>

            <ReactECharts
              option={trailerTotalsChart}
              style={{ height: 280, width: "100%" }}
            />
          </div>

        </div>

        <div className="slide3-analysis-note">
          <strong>Leitura executiva:</strong>

          <p>
            A análise das carretas deve ser lida de forma diferente dos cavalos.
            Aqui, o objetivo não é medir KM/L, mas sim quanto o Termoking consome
            por hora ligada. Por isso, os principais indicadores são R$/h e L/h.
            Registros inconsistentes foram retirados da análise para
            evitar distorções provocadas por horímetro incorreto, períodos
            inconsistentes ou lançamentos que não representam operação confiável.
          </p>
        </div>
      </section>

      {isPlateModalOpen && (
        <div className="slide3-modal-backdrop">
          <div className="slide3-modal">
            <div className="slide3-modal-header">
              <div>
                <strong>Selecionar placa</strong>
                <span>Procure por dono/propriedade e escolha uma placa.</span>
              </div>

              <button
                type="button"
                className="slide3-modal-close"
                onClick={() => setIsPlateModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="slide3-modal-search">
              <label>
                Dono / Frota

                <select
                  value={draftSelectedOwner}
                  onChange={(event) => {
                    setDraftSelectedOwner(event.target.value);
                    setDraftSelectedPlate("total");
                  }}
                >
                  <option value="total">Todas as frotas</option>

                  {ownerOptions.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Placa

                <input
                  value={draftPlateSearch}
                  onChange={(event) => setDraftPlateSearch(event.target.value)}
                  placeholder="Ex: ABC1D23..."
                />
              </label>
            </div>

            <div className="slide3-modal-list">
              <button
                type="button"
                className={`slide3-modal-item ${
                  draftSelectedPlate === "total" ? "active" : ""
                }`}
                onClick={() => setDraftSelectedPlate("total")}
              >
                <strong>Todas as placas</strong>
                <span>Visualizar total filtrado</span>
              </button>

              {modalPlateOptions.map((item) => (
                <button
                  key={item.placa}
                  type="button"
                  className={`slide3-modal-item ${
                    draftSelectedPlate === item.placa ? "active" : ""
                  }`}
                  onClick={() => setDraftSelectedPlate(item.placa)}
                >
                  <strong>{item.placa}</strong>
                  <span>{item.propriedade || "Não informado"}</span>
                </button>
              ))}
            </div>

            <div className="slide3-modal-footer">
              <button
                type="button"
                className="slide3-modal-secondary"
                onClick={clearPlateSelection}
              >
                Limpar
              </button>

              <button
                type="button"
                className="slide3-modal-primary"
                onClick={applyPlateSelection}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}