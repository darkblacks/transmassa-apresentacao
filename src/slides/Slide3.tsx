import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ReactECharts from "echarts-for-react";
import { Fuel, Gauge, MapPin, RefreshCcw, Route, TrendingUp } from "lucide-react";
import DeckStyles from "./DeckStyles";

const FILE_PATH = "/data/Base_Manutencao_Frota_Transmassa_2026.xlsx";

type PeriodKey = "Todos" | string;
type MetricKey = "reais" | "litros" | "km";
type StationMetric = "reais" | "litros";

type SummaryRow = {
  mes: string;
  total: number;
  litros: number;
  preco: number;
  km: number;
  kml: number;
  rskm: number;
  registros: number;
  ok: number;
};

type FuelRow = {
  placa: string;
  mes: string;
  propriedade: string;
  tipo: string;
  cavaloBau: string;
  posto: string;
  motorista: string;
  combustivel: string;
  reais: number;
  litros: number;
  km: number;
  kml: number;
  rsl: number;
  rskm: number;
  obs: string;
  abastecimentos: number;
};

const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function monthLabel(monthKey: string) {
  const match = monthKey.match(/^(20\d{2})-(\d{2})$/);
  if (!match) return monthKey;

  const year = match[1];
  const month = Number(match[2]);
  const label = monthNames[month - 1];
  return label ? `${label}/${year.slice(-2)}` : monthKey;
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const cleaned = raw
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function findColumn(row: Record<string, unknown>, aliases: string[]) {
  const keys = Object.keys(row || {});
  return keys.find((key) => {
    const normalizedKey = normalizeText(key).replace(/[^a-z0-9]+/g, " ");
    return aliases.some((alias) => {
      const normalizedAlias = normalizeText(alias).replace(/[^a-z0-9]+/g, " ");
      return normalizedKey === normalizedAlias || normalizedKey.includes(normalizedAlias);
    });
  });
}

function getValue(row: Record<string, unknown>, aliases: string[]) {
  const key = findColumn(row, aliases);
  return key ? row[key] : "";
}

function excelDateToDate(value: number) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  return new Date(excelEpoch.getTime() + value * 86400000);
}

function toMonthKey(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = excelDateToDate(value);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  const raw = String(value ?? "").trim();
  const text = normalizeText(raw);

  const iso = raw.match(/(20\d{2})[-/](\d{1,2})/);
  if (iso) return `${iso[1]}-${String(Number(iso[2])).padStart(2, "0")}`;

  const br = raw.match(/(\d{1,2})[/-](\d{1,2})[/-](20\d{2})/);
  if (br) return `${br[3]}-${String(Number(br[2])).padStart(2, "0")}`;

  if (text.includes("jan")) return "2026-01";
  if (text.includes("fev")) return "2026-02";
  if (text.includes("mar")) return "2026-03";
  if (text.includes("abr")) return "2026-04";
  if (text.includes("mai")) return "2026-05";
  if (text.includes("jun")) return "2026-06";
  if (text.includes("jul")) return "2026-07";
  if (text.includes("ago")) return "2026-08";
  if (text.includes("set")) return "2026-09";
  if (text.includes("out")) return "2026-10";
  if (text.includes("nov")) return "2026-11";
  if (text.includes("dez")) return "2026-12";

  return raw;
}

function fmtBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: value >= 100000 ? 0 : 2,
  });
}

function fmtNumber(value: number, digits = 0) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtCompactBRL(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  return fmtBRL(value);
}

function safeDiv(a: number, b: number) {
  return b ? a / b : 0;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function sortMonth(a: string, b: string) {
  return a.localeCompare(b);
}

function metricLabel(metric: MetricKey) {
  if (metric === "reais") return "Total combustível";
  if (metric === "litros") return "Litros";
  return "KM validado";
}

function metricValue(row: SummaryRow, metric: MetricKey) {
  if (metric === "reais") return row.total;
  if (metric === "litros") return row.litros;
  return row.km;
}

function metricFormatter(metric: MetricKey, value: number) {
  if (metric === "reais") return fmtCompactBRL(value);
  if (metric === "litros") return `${fmtNumber(value, 0)} L`;
  return `${fmtNumber(value, 0)} km`;
}

function aggregateFuelRows(rows: FuelRow[], months: string[]) {
  const byMonth = new Map<string, SummaryRow>();

  months.forEach((mes) => {
    byMonth.set(mes, {
      mes,
      total: 0,
      litros: 0,
      preco: 0,
      km: 0,
      kml: 0,
      rskm: 0,
      registros: 0,
      ok: 0,
    });
  });

  for (const row of rows) {
    if (!byMonth.has(row.mes)) {
      byMonth.set(row.mes, {
        mes: row.mes,
        total: 0,
        litros: 0,
        preco: 0,
        km: 0,
        kml: 0,
        rskm: 0,
        registros: 0,
        ok: 0,
      });
    }

    const item = byMonth.get(row.mes)!;
    item.total += row.reais;
    item.litros += row.litros;
    item.registros += 1;

    const isOk = normalizeText(row.obs) === "ok" && row.km > 0 && row.litros > 0;
    if (isOk) {
      item.km += row.km;
      item.ok += 1;
    }
  }

  return Array.from(byMonth.values())
    .map((item) => ({
      ...item,
      preco: safeDiv(item.total, item.litros),
      kml: safeDiv(item.km, item.litros),
      rskm: safeDiv(item.total, item.km),
    }))
    .sort((a, b) => sortMonth(a.mes, b.mes));
}

export default function Slide3() {
  const [fuelRows, setFuelRows] = useState<FuelRow[]>([]);
  const [status, setStatus] = useState("Carregando aba Abastecimento...");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("Todos");
  const [selectedOrigin, setSelectedOrigin] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [selectedStation, setSelectedStation] = useState("Todos");
  const [mainMetric, setMainMetric] = useState<MetricKey>("reais");
  const [stationMetric, setStationMetric] = useState<StationMetric>("reais");

  useEffect(() => {
    async function loadWorkbook() {
      try {
        const response = await fetch(FILE_PATH);
        if (!response.ok) {
          throw new Error(`Arquivo não encontrado: ${FILE_PATH}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const sheetToJson = (aliases: string[]) => {
          const sheetName = workbook.SheetNames.find((sheet) =>
            aliases.some((alias) => normalizeText(sheet) === normalizeText(alias)),
          );

          if (!sheetName) return [] as Record<string, unknown>[];

          return XLSX.utils.sheet_to_json<Record<string, unknown>>(
            workbook.Sheets[sheetName],
            { defval: "", raw: true },
          );
        };

        // A nova base consolidada possui todos os dados necessários nesta aba.
        // Mantemos aliases para funcionar também caso ela seja renomeada para Combustivel.
        const abastecimento = sheetToJson(["Abastecimento", "Combustivel", "Combustível"]);

        if (!abastecimento.length) {
          throw new Error("Aba Abastecimento/Combustivel não encontrada ou vazia");
        }

        const parsedFuel = abastecimento
          .map((row) => {
            const km = toNumber(getValue(row, ["Km Rodado", "KM Rodado", "KM"]));
            const litros = toNumber(getValue(row, ["Litros", "Litragem", "Volume"]));
            const reais = toNumber(getValue(row, ["Total", "Valor Total", "Total R$", "Valor R$"]));
            const valorLitro = toNumber(getValue(row, ["Valor", "R$/L", "Preço", "Preco"]));

            return {
              placa: String(getValue(row, ["Veículo", "Veiculo", "Placa"])).trim().toUpperCase(),
              mes: toMonthKey(getValue(row, ["Data", "Mês", "Mes"])),
              propriedade: String(getValue(row, ["Origem", "Próprio/Terceiro", "Proprio/Terceiro", "Propriedade"])).trim() || "Sem origem",
              tipo: String(getValue(row, ["Tipo"])).trim() || "Sem tipo",
              cavaloBau: String(getValue(row, ["Cavalo_Báu", "Cavalo_Bau", "Cavalo/Baú", "Cavalo/Bau"])).trim(),
              posto: String(getValue(row, ["Posto", "Fornecedor", "Estabelecimento", "Local"])).trim() || "Posto não informado",
              motorista: String(getValue(row, ["Motorista"])).trim() || "Motorista não informado",
              combustivel: String(getValue(row, ["Combustível", "Combustivel", "Produto"])).trim() || "Combustível",
              reais,
              litros,
              km,
              kml: toNumber(getValue(row, ["Consumo (KM/Litro)", "KM/L", "Consumo"])),
              rsl: valorLitro || safeDiv(reais, litros),
              rskm: safeDiv(reais, km),
              // Para esta aba, consideramos KM válido quando existe rodagem positiva e litros positivos.
              obs: km > 0 && litros > 0 ? "OK" : "",
              abastecimentos: 1,
            };
          })
          .filter((row) => row.placa && row.mes && (row.reais > 0 || row.litros > 0));

        setFuelRows(parsedFuel);
        setStatus(`Base carregada: ${parsedFuel.length.toLocaleString("pt-BR")} abastecimentos`);
      } catch (error) {
        console.warn(error);
        setFuelRows([]);
        setStatus("Erro ao carregar a aba Abastecimento da base consolidada");
      }
    }

    loadWorkbook();
  }, []);

  const months = useMemo(
    () => uniqueSorted(fuelRows.map((row) => row.mes)).sort(sortMonth),
    [fuelRows],
  );

  const originOptions = useMemo(
    () => ["Todos", ...uniqueSorted(fuelRows.map((row) => row.propriedade || "Sem origem"))],
    [fuelRows],
  );

  const typeOptions = useMemo(
    () => ["Todos", ...uniqueSorted(fuelRows.map((row) => row.tipo || "Sem tipo"))],
    [fuelRows],
  );

  // Base para montar as opções de posto sem o próprio filtro de posto.
  const stationBaseRows = useMemo(() => {
    return fuelRows.filter((row) => {
      if (selectedPeriod !== "Todos" && row.mes !== selectedPeriod) return false;
      if (selectedOrigin !== "Todos" && row.propriedade !== selectedOrigin) return false;
      if (selectedType !== "Todos" && row.tipo !== selectedType) return false;
      return true;
    });
  }, [fuelRows, selectedOrigin, selectedPeriod, selectedType]);

  const stationOptions = useMemo(
    () => ["Todos", ...uniqueSorted(stationBaseRows.map((row) => row.posto))],
    [stationBaseRows],
  );

  const filteredFuelRows = useMemo(() => {
    return stationBaseRows.filter((row) => {
      if (selectedStation !== "Todos" && row.posto !== selectedStation) return false;
      return true;
    });
  }, [selectedStation, stationBaseRows]);

  const chartRows = useMemo(() => {
    const chosenMonths = selectedPeriod === "Todos" ? months : [selectedPeriod];
    return aggregateFuelRows(filteredFuelRows, chosenMonths)
      .filter((row) => row.total > 0 || row.litros > 0);
  }, [filteredFuelRows, months, selectedPeriod]);

  const totals = useMemo(() => {
    const total = chartRows.reduce((acc, row) => acc + row.total, 0);
    const litros = chartRows.reduce((acc, row) => acc + row.litros, 0);
    const km = chartRows.reduce((acc, row) => acc + row.km, 0);
    const registros = chartRows.reduce((acc, row) => acc + row.registros, 0);
    const ok = chartRows.reduce((acc, row) => acc + row.ok, 0);

    return {
      total,
      litros,
      km,
      preco: safeDiv(total, litros),
      kml: safeDiv(km, litros),
      rskm: safeDiv(total, km),
      registros,
      ok,
      okPct: safeDiv(ok, registros) * 100,
    };
  }, [chartRows]);

  const stationRows = useMemo(() => {
    const map = new Map<string, { posto: string; total: number; litros: number; preco: number }>();

    for (const row of filteredFuelRows) {
      const item = map.get(row.posto) || { posto: row.posto, total: 0, litros: 0, preco: 0 };
      item.total += row.reais;
      item.litros += row.litros;
      map.set(row.posto, item);
    }

    return Array.from(map.values())
      .map((item) => ({ ...item, preco: safeDiv(item.total, item.litros) }))
      .filter((item) => (stationMetric === "reais" ? item.total > 0 : item.litros > 0))
      .sort((a, b) => (stationMetric === "reais" ? b.total - a.total : b.litros - a.litros))
      .slice(0, 8);
  }, [filteredFuelRows, stationMetric]);

  const plateRows = useMemo(() => {
    const map = new Map<string, { placa: string; total: number; litros: number; km: number; kml: number; rskm: number }>();

    for (const row of filteredFuelRows) {
      const item = map.get(row.placa) || { placa: row.placa, total: 0, litros: 0, km: 0, kml: 0, rskm: 0 };
      item.total += row.reais;
      item.litros += row.litros;
      if (normalizeText(row.obs) === "ok") item.km += row.km;
      map.set(row.placa, item);
    }

    return Array.from(map.values())
      .map((item) => ({ ...item, kml: safeDiv(item.km, item.litros), rskm: safeDiv(item.total, item.km) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [filteredFuelRows]);

  const evolutionOption = useMemo(() => ({
    color: ["#991b1b", "#f59e0b", "#0f172a"],
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        return rows
          .map((item: any) => {
            const value = Number(item.value || 0);
            const formatted = item.seriesName === "KM/L validado" ? `${fmtNumber(value, 2)} km/L` : metricFormatter(mainMetric, value);
            return `<strong>${item.marker}${item.seriesName}</strong>: ${formatted}`;
          })
          .join("<br/>");
      },
    },
    legend: { bottom: 0, textStyle: { color: "#64748b", fontSize: 11, fontWeight: 700 } },
    grid: { left: 52, right: 46, top: 28, bottom: 58 },
    xAxis: {
      type: "category",
      data: chartRows.map((row) => monthLabel(row.mes)),
      axisLine: { lineStyle: { color: "#cbd5e1" } },
      axisLabel: { color: "#334155", fontWeight: 800 },
    },
    yAxis: [
      {
        type: "value",
        axisLabel: { color: "#64748b", formatter: (value: number) => metricFormatter(mainMetric, Number(value)).replace("R$ ", "R$") },
        splitLine: { lineStyle: { color: "#e2e8f0" } },
      },
      {
        type: "value",
        axisLabel: { color: "#64748b", formatter: (value: number) => `${Number(value).toFixed(1)}` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: metricLabel(mainMetric),
        type: "bar",
        data: chartRows.map((row) => metricValue(row, mainMetric)),
        barMaxWidth: 32,
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
      {
        name: "KM/L validado",
        type: "line",
        yAxisIndex: 1,
        data: chartRows.map((row) => Number(row.kml.toFixed(3))),
        smooth: true,
        symbolSize: 7,
        lineStyle: { width: 3 },
      },
    ],
  }), [chartRows, mainMetric]);

  const stationOption = useMemo(() => ({
    color: ["#dc2626", "#0f172a"],
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        return rows
          .map((item: any) => {
            const value = Number(item.value || 0);
            const formatted = item.seriesName === "Preço médio R$/L" ? `R$ ${fmtNumber(value, 2)}` : stationMetric === "reais" ? fmtBRL(value) : `${fmtNumber(value, 0)} L`;
            return `<strong>${item.marker}${item.seriesName}</strong>: ${formatted}`;
          })
          .join("<br/>");
      },
    },
    legend: { bottom: 0, textStyle: { color: "#64748b", fontSize: 11, fontWeight: 700 } },
    grid: { left: 64, right: 52, top: 24, bottom: 82 },
    xAxis: {
      type: "category",
      data: stationRows.map((row) => row.posto),
      axisLabel: { color: "#334155", fontWeight: 700, rotate: 35, width: 96, overflow: "truncate" },
      axisLine: { lineStyle: { color: "#cbd5e1" } },
    },
    yAxis: [
      {
        type: "value",
        axisLabel: { color: "#64748b", formatter: (value: number) => stationMetric === "reais" ? fmtCompactBRL(Number(value)).replace("R$ ", "R$") : `${fmtNumber(Number(value), 0)} L` },
        splitLine: { lineStyle: { color: "#e2e8f0" } },
      },
      { type: "value", axisLabel: { color: "#64748b", formatter: (value: number) => `R$ ${Number(value).toFixed(1)}` }, splitLine: { show: false } },
    ],
    series: [
      {
        name: stationMetric === "reais" ? "Total (R$)" : "Litros",
        type: "bar",
        data: stationRows.map((row) => stationMetric === "reais" ? row.total : row.litros),
        barMaxWidth: 26,
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
      {
        name: "Preço médio R$/L",
        type: "line",
        yAxisIndex: 1,
        data: stationRows.map((row) => Number(row.preco.toFixed(2))),
        smooth: true,
        symbolSize: 7,
        lineStyle: { width: 3 },
      },
    ],
  }), [stationMetric, stationRows]);

  return (
    <section className="slide tm-slide">
      <DeckStyles />
      <img className="tm-logo-mini" src="/assets/logotransmassa.png" alt="Transmassa" />

      <span className="tm-eyebrow">02 • Combustível</span>
      <h1 className="tm-title">Combustível: consumo, postos e eficiência em leitura dinâmica</h1>
      <p className="tm-subtitle">
        Todos os KPIs e gráficos são calculados diretamente da aba Abastecimento da base consolidada.
        Os filtros alteram evolução mensal, postos, placas e indicadores de eficiência.
      </p>

      <div
        className="tm-card"
        style={{
          padding: 14,
          marginBottom: 14,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr auto auto",
          gap: 10,
          alignItems: "end",
        }}
      >
        <label style={{ display: "grid", gap: 6, fontSize: 11, fontWeight: 900, color: "#64748b" }}>
          Período
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} style={{ borderRadius: 999, border: "1px solid #cbd5e1", padding: "9px 12px", fontWeight: 800 }}>
            <option value="Todos">Todos</option>
            {months.map((mes) => <option key={mes} value={mes}>{monthLabel(mes)}</option>)}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, fontSize: 11, fontWeight: 900, color: "#64748b" }}>
          Origem
          <select value={selectedOrigin} onChange={(e) => setSelectedOrigin(e.target.value)} style={{ borderRadius: 999, border: "1px solid #cbd5e1", padding: "9px 12px", fontWeight: 800 }}>
            {originOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, fontSize: 11, fontWeight: 900, color: "#64748b" }}>
          Tipo
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ borderRadius: 999, border: "1px solid #cbd5e1", padding: "9px 12px", fontWeight: 800 }}>
            {typeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, fontSize: 11, fontWeight: 900, color: "#64748b" }}>
          Posto
          <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} style={{ borderRadius: 999, border: "1px solid #cbd5e1", padding: "9px 12px", fontWeight: 800 }}>
            {stationOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setMainMetric((prev) => prev === "reais" ? "litros" : prev === "litros" ? "km" : "reais")}
          style={{ borderRadius: 999, border: "1px solid #991b1b", background: "#991b1b", color: "#fff", padding: "10px 14px", fontWeight: 900, cursor: "pointer" }}
        >
          Métrica: {mainMetric === "reais" ? "R$" : mainMetric === "litros" ? "Litros" : "KM"}
        </button>

        <button
          type="button"
          onClick={() => setStationMetric((prev) => prev === "reais" ? "litros" : "reais")}
          style={{ borderRadius: 999, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", padding: "10px 14px", fontWeight: 900, cursor: "pointer" }}
        >
          Postos: {stationMetric === "reais" ? "R$" : "Litros"}
        </button>
      </div>

      <div className="tm-kpi-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 14 }}>
        <div className="tm-kpi"><span>Total combustível</span><strong>{fmtCompactBRL(totals.total)}</strong><small>{fmtNumber(totals.litros, 0)} litros</small></div>
        <div className="tm-kpi"><span>Preço médio</span><strong>R$ {fmtNumber(totals.preco, 2)}</strong><small>por litro abastecido</small></div>
        <div className="tm-kpi"><span>KM validado</span><strong>{fmtNumber(totals.km, 0)}</strong><small>{fmtNumber(totals.kml, 2)} km/L</small></div>
        <div className="tm-kpi"><span>Custo por KM</span><strong>R$ {fmtNumber(totals.rskm, 2)}</strong><small>KM Rodado maior que zero</small></div>
        <div className="tm-kpi"><span>KM com rodagem</span><strong>{fmtNumber(totals.okPct, 1)}%</strong><small>{fmtNumber(totals.ok, 0)} de {fmtNumber(totals.registros, 0)} registros com KM</small></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 14, flex: 1, minHeight: 0 }}>
        <div className="tm-chart-card" style={{ padding: 16, minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <TrendingUp size={22} color="#991b1b" />
            <h2 className="tm-mini-title" style={{ margin: 0 }}>Evolução mensal</h2>
          </div>
          <p style={{ margin: "0 0 6px 0" }}>
            Alterne entre R$, litros e KM para enxergar se a alta vem de preço, volume ou rodagem.
          </p>
          <ReactECharts option={evolutionOption} style={{ height: 274, width: "100%" }} notMerge />
        </div>

        <div className="tm-chart-card" style={{ padding: 16, minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <MapPin size={22} color="#991b1b" />
            <h2 className="tm-mini-title" style={{ margin: 0 }}>Consumo por posto</h2>
          </div>
          <p style={{ margin: "0 0 6px 0" }}>
            Ranking dinâmico por posto, com total abastecido e preço médio por litro.
          </p>
          {stationRows.length ? (
            <ReactECharts option={stationOption} style={{ height: 274, width: "100%" }} notMerge />
          ) : (
            <div className="tm-note" style={{ height: 250, display: "grid", placeItems: "center", textAlign: "center" }}>
              Sem dados de posto no filtro atual da aba Abastecimento.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: 14, marginTop: 14 }}>
        <div className="tm-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Fuel size={20} color="#991b1b" />
            <h3 style={{ margin: 0, color: "#0f172a", fontSize: 16 }}>Placas com maior consumo no filtro</h3>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {plateRows.length ? plateRows.map((row) => (
              <div key={row.placa} style={{ display: "grid", gridTemplateColumns: "90px 1fr 88px", gap: 10, alignItems: "center" }}>
                <strong style={{ color: "#0f172a" }}>{row.placa}</strong>
                <div className="tm-bar-track" style={{ height: 12 }}>
                  <div className="tm-bar-fill" style={{ width: `${Math.max(6, safeDiv(row.total, plateRows[0]?.total || 1) * 100)}%`, background: "#991b1b" }} />
                </div>
                <span style={{ color: "#475569", fontWeight: 900, textAlign: "right" }}>{fmtCompactBRL(row.total)}</span>
              </div>
            )) : (
              <p style={{ margin: 0, color: "#64748b" }}>Carregando dados por placa ou sem registros no filtro.</p>
            )}
          </div>
        </div>

        <div className="tm-card" style={{ padding: 16, display: "grid", alignContent: "start", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Gauge size={20} color="#991b1b" />
            <h3 style={{ margin: 0, color: "#0f172a", fontSize: 16 }}>Leitura executiva</h3>
          </div>
          <p style={{ margin: 0 }}>
            O pico financeiro aparece quando há combinação de preço médio alto e volume. Por isso, o controle precisa separar três leituras: consumo total, posto de abastecimento e eficiência validada por KM.
          </p>
          <div className="tm-note">
            <RefreshCcw size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
            {status}
          </div>
          <div className="tm-note">
            <Route size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Gestão: usar total para orçamento e KM/L apenas com registros com KM.
          </div>
        </div>
      </div>
    </section>
  );
}