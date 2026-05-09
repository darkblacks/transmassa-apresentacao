import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ReactECharts from "echarts-for-react";

type FilterType = "total" | "proprio" | "terceiro";
type SortType = "desc" | "asc";
type FleetType = "Motorizado" | "Carreta";
type MonthFilter = "todos" | "Janeiro" | "Fevereiro" | "Março" | "Abril";

type MaintenanceRow = {
  placa: string;
  mes: string;
  tipoFrota: FleetType;
  propriedade: string;
  dono: string;
  total: number;
  dias: number;
  pecas: number;
  maoTerceiro: number;
  maoProprio: number;
  qualidade: string;
};

type PlateOption = {
  placa: string;
  dono: string;
  propriedade: string;
  tipoFrota: FleetType;
};

type MonthlyItem = {
  mes: string;
  total: number;
  os: number;
};

type RankingItem = {
  placa: string;
  total: number;
  os: number;
  dono: string;
  tipoFrota?: FleetType;
};

const FILE_PATH = "/data/Base_Manutencao_Frota_Transmassa_2026.xlsx";

const monthOrder: MonthFilter[] = ["Janeiro", "Fevereiro", "Março", "Abril"];

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizePlate(value: unknown) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();
}

function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const cleaned = String(value ?? "")
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function findColumn(row: Record<string, unknown>, aliases: string[]) {
  const keys = Object.keys(row);

  const exactMatch = keys.find((key) =>
    aliases.some((alias) => normalizeText(key) === normalizeText(alias))
  );

  if (exactMatch) return exactMatch;

  return keys.find((key) =>
    aliases.some((alias) => normalizeText(key).includes(normalizeText(alias)))
  );
}

function getValue(row: Record<string, unknown>, aliases: string[]) {
  const key = findColumn(row, aliases);
  return key ? row[key] : "";
}

function getMonthName(value: unknown) {
  const text = normalizeText(value);

  if (text.includes("jan") || text.includes("01/2026") || text.includes("2026-01")) return "Janeiro";
  if (text.includes("fev") || text.includes("02/2026") || text.includes("2026-02")) return "Fevereiro";
  if (text.includes("mar") || text.includes("03/2026") || text.includes("2026-03")) return "Março";
  if (text.includes("abr") || text.includes("04/2026") || text.includes("2026-04")) return "Abril";

  return String(value ?? "");
}

function getFleetType(value: unknown): FleetType | "" {
  const text = normalizeText(value);

  if (text.includes("carreta")) return "Carreta";
  if (text.includes("cavalo") || text.includes("motorizado")) return "Motorizado";

  return "";
}

function isProprio(value: string, dono?: string) {
  const text = `${normalizeText(value)} ${normalizeText(dono)}`;

  return (
    text.includes("proprio") ||
    text.includes("próprio") ||
    text.includes("transmassa") ||
    text.includes("alx")
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatInteger(value: number) {
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  });
}

function formatCompactCurrency(value: number) {
  return `R$ ${(value / 1000).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}k`;
}

function getMonthly(rows: MaintenanceRow[], fleet?: FleetType): MonthlyItem[] {
  return monthOrder.map((mes) => {
    const monthRows = rows.filter((row) => {
      const matchMonth = row.mes === mes;
      const matchFleet = fleet ? row.tipoFrota === fleet : true;

      return matchMonth && matchFleet;
    });

    return {
      mes,
      os: monthRows.length,
      total: monthRows.reduce((sum, row) => sum + row.total, 0),
    };
  });
}

function getRanking(
  rows: MaintenanceRow[],
  selectedMonth: MonthFilter,
  sortType: SortType,
  fleet?: FleetType
): RankingItem[] {
  const grouped = rows
    .filter((row) => (fleet ? row.tipoFrota === fleet : true))
    .filter((row) => (selectedMonth === "todos" ? true : row.mes === selectedMonth))
    .reduce<Record<string, RankingItem>>((acc, row) => {
      if (!acc[row.placa]) {
        acc[row.placa] = {
          placa: row.placa,
          total: 0,
          os: 0,
          dono: row.dono || "Não informado",
          tipoFrota: row.tipoFrota,
        };
      }

      acc[row.placa].total += row.total;
      acc[row.placa].os += 1;

      return acc;
    }, {});

  return Object.values(grouped)
    .filter((item) => item.total > 0)
    .sort((a, b) => (sortType === "desc" ? b.total - a.total : a.total - b.total))
    .slice(0, 12);
}

function makeMonthlyChart(data: MonthlyItem[], title: string, color = "#b01625") {
  return {
    grid: { left: 76, right: 24, top: 34, bottom: 34 },
    tooltip: {
      trigger: "axis",
      formatter: (params: Array<{ data: number; name: string }>) => {
        const item = params[0];
        const month = data.find((row) => row.mes === item.name);

        return [
          `<strong>${title} · ${item.name}</strong>`,
          `Total: ${formatCurrency(item.data)}`,
          `OS: ${formatInteger(month?.os ?? 0)}`,
        ].join("<br />");
      },
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.mes),
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => formatCompactCurrency(value),
      },
      splitLine: { lineStyle: { color: "#e5e7eb" } },
    },
    series: [
      {
        name: title,
        type: "line",
        smooth: true,
        symbolSize: 10,
        data: data.map((item) => item.total),
        lineStyle: { width: 4, color },
        itemStyle: { color },
        areaStyle: { color: "rgba(176, 22, 37, 0.10)" },
      },
    ],
  };
}

function makeRankingChart(data: RankingItem[], title: string, color = "#b01625") {
  const displayData = [...data].reverse();

  return {
    grid: { left: 92, right: 28, top: 28, bottom: 36 },
    tooltip: {
      trigger: "axis",
      formatter: (params: Array<{ data: number; name: string }>) => {
        const item = params[0];
        const row = displayData.find((entry) => entry.placa === item.name);

        return [
          `<strong>${item.name}</strong>`,
          row?.tipoFrota ? `Tipo: ${row.tipoFrota}` : "",
          `Dono: ${row?.dono ?? "Não informado"}`,
          `Total: ${formatCurrency(item.data)}`,
          `OS: ${formatInteger(row?.os ?? 0)}`,
        ]
          .filter(Boolean)
          .join("<br />");
      },
    },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => formatCompactCurrency(value),
      },
      splitLine: { lineStyle: { color: "#e5e7eb" } },
    },
    yAxis: {
      type: "category",
      data: displayData.map((item) => item.placa),
    },
    series: [
      {
        name: title,
        type: "bar",
        data: displayData.map((item) => item.total),
        barWidth: 20,
        itemStyle: {
          borderRadius: [0, 12, 12, 0],
          color,
        },
      },
    ],
  };
}

export default function Slide4() {
  const [rows, setRows] = useState<MaintenanceRow[]>([]);
  const [filter, setFilter] = useState<FilterType>("total");

  const [selectedOwner, setSelectedOwner] = useState("total");
  const [selectedMotorizedPlate, setSelectedMotorizedPlate] = useState("total");
  const [selectedTrailerPlate, setSelectedTrailerPlate] = useState("total");

  const [selectedRankingMonth, setSelectedRankingMonth] =
    useState<MonthFilter>("todos");
  const [sortType, setSortType] = useState<SortType>("desc");

  const [isMotorizedPlateModalOpen, setIsMotorizedPlateModalOpen] = useState(false);
  const [isTrailerPlateModalOpen, setIsTrailerPlateModalOpen] = useState(false);

  const [draftPlateSearch, setDraftPlateSearch] = useState("");
  const [draftSelectedOwner, setDraftSelectedOwner] = useState("total");
  const [draftSelectedMotorizedPlate, setDraftSelectedMotorizedPlate] = useState("total");
  const [draftSelectedTrailerPlate, setDraftSelectedTrailerPlate] = useState("total");

  useEffect(() => {
    async function loadData() {
      const response = await fetch(FILE_PATH);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });

      const sheetName =
        workbook.SheetNames.find((name) =>
          normalizeText(name).includes("manutencao")
        ) ?? workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      const parsedRows = rawRows
        .map((row) => {
          const placa = normalizePlate(getValue(row, ["placa", "veiculo", "veículo"]));

          const mes = getMonthName(
            getValue(row, ["mês", "mes", "competência", "competencia"])
          );

          const tipoFrota = getFleetType(
            getValue(row, ["tipo frota", "cavalo_carreta", "cavalo carreta"])
          );

          const propriedade = String(
            getValue(row, ["próprio/terceiro", "proprio/terceiro", "propriedade"])
          ).trim();

          const dono = String(
            getValue(row, ["dono", "frota", "proprietario", "proprietário"])
          ).trim();

          return {
            placa,
            mes,
            tipoFrota,
            propriedade,
            dono,
            total: toNumber(getValue(row, ["total", "manutenção", "manutencao", "valor"])),
            dias: toNumber(getValue(row, ["dias em manutenção", "dias em manutencao", "dias"])),
            pecas: toNumber(getValue(row, ["peças", "pecas"])),
            maoTerceiro: toNumber(getValue(row, ["mão de obra terceiro", "mao de obra terceiro"])),
            maoProprio: toNumber(getValue(row, ["mão de obra próprio", "mao de obra proprio"])),
            qualidade:
              String(getValue(row, ["qualidade", "status qualidade"])).trim() ||
              "Não avaliado",
          };
        })
        .filter(
          (row): row is MaintenanceRow =>
            Boolean(row.placa) &&
            monthOrder.includes(row.mes as MonthFilter) &&
            (row.tipoFrota === "Motorizado" || row.tipoFrota === "Carreta")
        );

      setRows(parsedRows);
    }

    loadData();
  }, []);

  const motorizedPlateOptions = useMemo(() => {
    const map = new Map<string, PlateOption>();

    rows
      .filter((row) => row.tipoFrota === "Motorizado")
      .forEach((row) => {
        if (!map.has(row.placa)) {
          map.set(row.placa, {
            placa: row.placa,
            dono: row.dono || "Não informado",
            propriedade: row.propriedade || "Não informado",
            tipoFrota: row.tipoFrota,
          });
        }
      });

    return Array.from(map.values()).sort((a, b) =>
      a.placa.localeCompare(b.placa)
    );
  }, [rows]);

  const trailerPlateOptions = useMemo(() => {
    const map = new Map<string, PlateOption>();

    rows
      .filter((row) => row.tipoFrota === "Carreta")
      .forEach((row) => {
        if (!map.has(row.placa)) {
          map.set(row.placa, {
            placa: row.placa,
            dono: row.dono || "Não informado",
            propriedade: row.propriedade || "Não informado",
            tipoFrota: row.tipoFrota,
          });
        }
      });

    return Array.from(map.values()).sort((a, b) =>
      a.placa.localeCompare(b.placa)
    );
  }, [rows]);

  const ownerOptions = useMemo(() => {
    const owners = rows
      .filter((row) => row.tipoFrota === "Motorizado")
      .map((row) => row.dono || "Não informado")
      .filter(Boolean);

    return Array.from(new Set(owners)).sort();
  }, [rows]);

  const modalMotorizedPlateOptions = useMemo(() => {
    return motorizedPlateOptions.filter((item) => {
      const matchOwner =
        draftSelectedOwner === "total"
          ? true
          : item.dono === draftSelectedOwner;

      const matchPlate = draftPlateSearch
        ? normalizeText(item.placa).includes(normalizeText(draftPlateSearch))
        : true;

      return matchOwner && matchPlate;
    });
  }, [motorizedPlateOptions, draftSelectedOwner, draftPlateSearch]);

  const modalTrailerPlateOptions = useMemo(() => {
    return trailerPlateOptions.filter((item) => {
      const matchPlate = draftPlateSearch
        ? normalizeText(item.placa).includes(normalizeText(draftPlateSearch))
        : true;

      return matchPlate;
    });
  }, [trailerPlateOptions, draftPlateSearch]);

  function openMotorizedPlateModal() {
    setDraftSelectedOwner(selectedOwner);
    setDraftSelectedMotorizedPlate(selectedMotorizedPlate);
    setDraftPlateSearch("");
    setIsMotorizedPlateModalOpen(true);
  }

  function openTrailerPlateModal() {
    setDraftSelectedTrailerPlate(selectedTrailerPlate);
    setDraftPlateSearch("");
    setIsTrailerPlateModalOpen(true);
  }

  function applyMotorizedPlateSelection() {
    setSelectedOwner(draftSelectedOwner);
    setSelectedMotorizedPlate(draftSelectedMotorizedPlate);
    setIsMotorizedPlateModalOpen(false);
  }

  function applyTrailerPlateSelection() {
    setSelectedTrailerPlate(draftSelectedTrailerPlate);
    setIsTrailerPlateModalOpen(false);
  }

  function clearMotorizedPlateSelection() {
    setDraftSelectedOwner("total");
    setDraftSelectedMotorizedPlate("total");
    setSelectedOwner("total");
    setSelectedMotorizedPlate("total");
    setIsMotorizedPlateModalOpen(false);
  }

  function clearTrailerPlateSelection() {
    setDraftSelectedTrailerPlate("total");
    setSelectedTrailerPlate("total");
    setIsTrailerPlateModalOpen(false);
  }

  function clearAllFilters() {
    setFilter("total");
    setSelectedOwner("total");
    setSelectedMotorizedPlate("total");
    setSelectedTrailerPlate("total");
    setSelectedRankingMonth("todos");
    setSortType("desc");
  }

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const rowIsProprio = isProprio(row.propriedade, row.dono);

      const matchOwnership =
        filter === "total"
          ? true
          : filter === "proprio"
            ? rowIsProprio
            : !rowIsProprio;

      const matchOwner =
        row.tipoFrota === "Motorizado"
          ? selectedOwner === "total" || row.dono === selectedOwner
          : true;

      const matchMotorizedPlate =
        row.tipoFrota === "Motorizado"
          ? selectedMotorizedPlate === "total" || row.placa === selectedMotorizedPlate
          : true;

      const matchTrailerPlate =
        row.tipoFrota === "Carreta"
          ? selectedTrailerPlate === "total" || row.placa === selectedTrailerPlate
          : true;

      return (
        matchOwnership &&
        matchOwner &&
        matchMotorizedPlate &&
        matchTrailerPlate
      );
    });
  }, [
    rows,
    filter,
    selectedOwner,
    selectedMotorizedPlate,
    selectedTrailerPlate,
  ]);

  const sectionTotals = useMemo(() => {
    const totalRows = filteredRows;
    const motorizadoRows = filteredRows.filter((row) => row.tipoFrota === "Motorizado");
    const carretaRows = filteredRows.filter((row) => row.tipoFrota === "Carreta");

    function calc(list: MaintenanceRow[]) {
      const total = list.reduce((sum, row) => sum + row.total, 0);

      return {
        total,
        os: list.length,
        placas: new Set(list.map((row) => row.placa)).size,
        dias: list.reduce((sum, row) => sum + row.dias, 0),
        custoMedioOs: list.length > 0 ? total / list.length : 0,
      };
    }

    return {
      geral: calc(totalRows),
      motorizado: calc(motorizadoRows),
      carreta: calc(carretaRows),
    };
  }, [filteredRows]);

  const totalMonthly = useMemo(() => getMonthly(filteredRows), [filteredRows]);

  const motorizadoMonthly = useMemo(
    () => getMonthly(filteredRows, "Motorizado"),
    [filteredRows]
  );

  const carretaMonthly = useMemo(
    () => getMonthly(filteredRows, "Carreta"),
    [filteredRows]
  );

  const totalRanking = useMemo(
    () => getRanking(filteredRows, selectedRankingMonth, sortType),
    [filteredRows, selectedRankingMonth, sortType]
  );

  const motorizadoRanking = useMemo(
    () => getRanking(filteredRows, selectedRankingMonth, sortType, "Motorizado"),
    [filteredRows, selectedRankingMonth, sortType]
  );

  const carretaRanking = useMemo(
    () => getRanking(filteredRows, selectedRankingMonth, sortType, "Carreta"),
    [filteredRows, selectedRankingMonth, sortType]
  );

  const totalMonthlyChart = useMemo(
    () => makeMonthlyChart(totalMonthly, "Total", "#b01625"),
    [totalMonthly]
  );

  const totalRankingChart = useMemo(
    () => makeRankingChart(totalRanking, "Total", "#7f1d1d"),
    [totalRanking]
  );

  const motorizadoMonthlyChart = useMemo(
    () => makeMonthlyChart(motorizadoMonthly, "Motorizados", "#991b1b"),
    [motorizadoMonthly]
  );

  const motorizadoRankingChart = useMemo(
    () => makeRankingChart(motorizadoRanking, "Motorizados", "#b01625"),
    [motorizadoRanking]
  );

  const carretaMonthlyChart = useMemo(
    () => makeMonthlyChart(carretaMonthly, "Carretas", "#243746"),
    [carretaMonthly]
  );

  const carretaRankingChart = useMemo(
    () => makeRankingChart(carretaRanking, "Carretas", "#229E93"),
    [carretaRanking]
  );

  return (
    <section className="slide slide4">
      <header className="slide4-header">
        <div>
          <span className="slide4-tag">Manutenção</span>

          <h1 className="slide4-title">Manutenção por tipo de frota</h1>

          <p className="slide4-subtitle">
            Separação entre motorizados e carretas, com visão de totais,
            evolução mensal e ranking por placa.
          </p>
        </div>

        <div className="slide3-controls slide4-controls">
          <div className="slide3-plate-selector-grid">
            <button
              type="button"
              className="slide3-open-modal-button"
              onClick={openMotorizedPlateModal}
            >
              <span>Placa Motorizado</span>

              <strong>
                {selectedMotorizedPlate === "total"
                  ? "Motorizado selecionado"
                  : selectedMotorizedPlate}
              </strong>
            </button>

            <button
              type="button"
              className="slide3-open-modal-button"
              onClick={openTrailerPlateModal}
            >
              <span>Placa Carreta</span>

              <strong>
                {selectedTrailerPlate === "total"
                  ? "Carreta selecionada"
                  : selectedTrailerPlate}
              </strong>
            </button>
          </div>

          <div className="slide3-filter slide4-filter">
            <button
              type="button"
              className={filter === "total" ? "active" : ""}
              onClick={() => setFilter("total")}
            >
              Total
            </button>

            <button
              type="button"
              className={filter === "proprio" ? "active" : ""}
              onClick={() => setFilter("proprio")}
            >
              Próprio
            </button>

            <button
              type="button"
              className={filter === "terceiro" ? "active" : ""}
              onClick={() => setFilter("terceiro")}
            >
              Terceiro
            </button>
          </div>
        </div>
      </header>

      <div className="slide4-secondary-controls">
        <label>
          Mês do ranking

          <select
            value={selectedRankingMonth}
            onChange={(event) =>
              setSelectedRankingMonth(event.target.value as MonthFilter)
            }
          >
            <option value="todos">Todos os meses</option>

            {monthOrder.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="slide4-toggle"
          onClick={() => setSortType((prev) => (prev === "desc" ? "asc" : "desc"))}
        >
          {sortType === "desc" ? "Maior → Menor" : "Menor → Maior"}
        </button>

        <button type="button" className="slide4-toggle" onClick={clearAllFilters}>
          Limpar filtros
        </button>
      </div>

      <section className="slide4-section-block">
        <div className="slide4-section-header">
          <span className="slide4-tag">Totais</span>

          <h2 className="slide4-section-title">Total geral de manutenção</h2>

          <p className="slide4-section-subtitle">
            Soma dos custos de manutenção dos motorizados e das carretas.
          </p>
        </div>

        <div className="slide3-kpis slide4-kpis">
          <div className="slide3-kpi slide4-kpi-card">
            <span>Total manutenção</span>
            <strong>{formatCurrency(sectionTotals.geral.total)}</strong>
          </div>

          <div className="slide3-kpi slide4-kpi-card">
            <span>Total OS</span>
            <strong>{formatInteger(sectionTotals.geral.os)}</strong>
          </div>

          <div className="slide3-kpi slide4-kpi-card">
            <span>Placas analisadas</span>
            <strong>{formatInteger(sectionTotals.geral.placas)}</strong>
          </div>

          <div className="slide3-kpi slide4-kpi-card highlight">
            <span>Custo médio por OS</span>
            <strong>{formatCurrency(sectionTotals.geral.custoMedioOs)}</strong>
          </div>
        </div>

        <div className="slide4-dashboard">
          <div className="slide4-chart-card">
            <div className="slide4-chart-header">
              <div>
                <strong>Total · evolução mensal</strong>
                <span>Custo total de manutenção por mês</span>
              </div>
            </div>

            <ReactECharts
              option={totalMonthlyChart}
              style={{ height: 280, width: "100%" }}
            />
          </div>

          <div className="slide4-chart-card">
            <div className="slide4-chart-header">
              <div>
                <strong>Total · maior manutenção</strong>
                <span>
                  Ranking por placa ·{" "}
                  {selectedRankingMonth === "todos" ? "Jan-Abr" : selectedRankingMonth}
                </span>
              </div>
            </div>

            <ReactECharts
              option={totalRankingChart}
              style={{ height: 280, width: "100%" }}
            />
          </div>
        </div>
      </section>

      <section className="slide4-section-block">
        <div className="slide4-section-header">
          <span className="slide4-tag">Motorizados</span>

          <h2 className="slide4-section-title">
            Totais de manutenção dos motorizados
          </h2>

          <p className="slide4-section-subtitle">
            Custos, OS e ranking específicos dos veículos motorizados.
          </p>
        </div>

        <div className="slide3-kpis slide4-kpis">
          <div className="slide3-kpi slide4-kpi-card">
            <span>Total motorizados</span>
            <strong>{formatCurrency(sectionTotals.motorizado.total)}</strong>
          </div>

          <div className="slide3-kpi slide4-kpi-card">
            <span>OS motorizados</span>
            <strong>{formatInteger(sectionTotals.motorizado.os)}</strong>
          </div>

          <div className="slide3-kpi slide4-kpi-card">
            <span>Placas motorizadas</span>
            <strong>{formatInteger(sectionTotals.motorizado.placas)}</strong>
          </div>

          <div className="slide3-kpi slide4-kpi-card highlight">
            <span>Custo médio por OS</span>
            <strong>{formatCurrency(sectionTotals.motorizado.custoMedioOs)}</strong>
          </div>
        </div>

        <div className="slide4-dashboard">
          <div className="slide4-chart-card">
            <div className="slide4-chart-header">
              <div>
                <strong>Motorizados · evolução mensal</strong>
                <span>Custo total de manutenção por mês</span>
              </div>
            </div>

            <ReactECharts
              option={motorizadoMonthlyChart}
              style={{ height: 280, width: "100%" }}
            />
          </div>

          <div className="slide4-chart-card">
            <div className="slide4-chart-header">
              <div>
                <strong>Motorizados · maior manutenção</strong>
                <span>
                  Ranking por placa ·{" "}
                  {selectedRankingMonth === "todos" ? "Jan-Abr" : selectedRankingMonth}
                </span>
              </div>
            </div>

            <ReactECharts
              option={motorizadoRankingChart}
              style={{ height: 280, width: "100%" }}
            />
          </div>
        </div>
      </section>

      <section className="slide4-section-block">
        <div className="slide4-section-header">
          <span className="slide4-tag">Carretas</span>

          <h2 className="slide4-section-title">
            Totais de manutenção das carretas
          </h2>

          <p className="slide4-section-subtitle">
            Custos, OS e ranking específicos das carretas.
          </p>
        </div>

        <div className="slide3-kpis slide4-kpis">
          <div className="slide3-kpi slide4-kpi-card">
            <span>Total carretas</span>
            <strong>{formatCurrency(sectionTotals.carreta.total)}</strong>
          </div>

          <div className="slide3-kpi slide4-kpi-card">
            <span>OS carretas</span>
            <strong>{formatInteger(sectionTotals.carreta.os)}</strong>
          </div>

          <div className="slide3-kpi slide4-kpi-card">
            <span>Placas carretas</span>
            <strong>{formatInteger(sectionTotals.carreta.placas)}</strong>
          </div>

          <div className="slide3-kpi slide4-kpi-card highlight">
            <span>Custo médio por OS</span>
            <strong>{formatCurrency(sectionTotals.carreta.custoMedioOs)}</strong>
          </div>
        </div>

        <div className="slide4-dashboard">
          <div className="slide4-chart-card">
            <div className="slide4-chart-header">
              <div>
                <strong>Carretas · evolução mensal</strong>
                <span>Custo total de manutenção por mês</span>
              </div>
            </div>

            <ReactECharts
              option={carretaMonthlyChart}
              style={{ height: 280, width: "100%" }}
            />
          </div>

          <div className="slide4-chart-card">
            <div className="slide4-chart-header">
              <div>
                <strong>Carretas · maior manutenção</strong>
                <span>
                  Ranking por placa ·{" "}
                  {selectedRankingMonth === "todos" ? "Jan-Abr" : selectedRankingMonth}
                </span>
              </div>
            </div>

            <ReactECharts
              option={carretaRankingChart}
              style={{ height: 280, width: "100%" }}
            />
          </div>
        </div>
      </section>

      <footer className="slide4-warning">
        <strong>Ponto de melhoria:</strong>

        <span>
          O ideal é aprofundar os custos totais com tempo ocioso de OS e
          indicadores como KM/total de manutenção nas próximas análises.
        </span>
      </footer>

      {isMotorizedPlateModalOpen && (
        <div className="slide3-modal-backdrop">
          <div className="slide3-modal">
            <div className="slide3-modal-header">
              <div>
                <strong>Selecionar motorizado</strong>
                <span>Filtre por dono/frota e escolha uma placa motorizada.</span>
              </div>

              <button
                type="button"
                className="slide3-modal-close"
                onClick={() => setIsMotorizedPlateModalOpen(false)}
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
                    setDraftSelectedMotorizedPlate("total");
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
                Placa Motorizado

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
                  draftSelectedMotorizedPlate === "total" ? "active" : ""
                }`}
                onClick={() => setDraftSelectedMotorizedPlate("total")}
              >
                <strong>Todos os motorizados</strong>
                <span>Visualizar total filtrado</span>
              </button>

              {modalMotorizedPlateOptions.map((item) => (
                <button
                  key={`${item.tipoFrota}-${item.placa}`}
                  type="button"
                  className={`slide3-modal-item ${
                    draftSelectedMotorizedPlate === item.placa ? "active" : ""
                  }`}
                  onClick={() => setDraftSelectedMotorizedPlate(item.placa)}
                >
                  <strong>{item.placa}</strong>

                  <span>
                    {item.tipoFrota} · {item.propriedade} · {item.dono}
                  </span>
                </button>
              ))}
            </div>

            <div className="slide3-modal-footer">
              <button
                type="button"
                className="slide3-modal-secondary"
                onClick={clearMotorizedPlateSelection}
              >
                Limpar
              </button>

              <button
                type="button"
                className="slide3-modal-primary"
                onClick={applyMotorizedPlateSelection}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {isTrailerPlateModalOpen && (
        <div className="slide3-modal-backdrop">
          <div className="slide3-modal">
            <div className="slide3-modal-header">
              <div>
                <strong>Selecionar carreta</strong>
                <span>Escolha uma placa de carreta.</span>
              </div>

              <button
                type="button"
                className="slide3-modal-close"
                onClick={() => setIsTrailerPlateModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="slide3-modal-search">
              <label>
                Placa Carreta

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
                  draftSelectedTrailerPlate === "total" ? "active" : ""
                }`}
                onClick={() => setDraftSelectedTrailerPlate("total")}
              >
                <strong>Todas as carretas</strong>
                <span>Visualizar total filtrado</span>
              </button>

              {modalTrailerPlateOptions.map((item) => (
                <button
                  key={`${item.tipoFrota}-${item.placa}`}
                  type="button"
                  className={`slide3-modal-item ${
                    draftSelectedTrailerPlate === item.placa ? "active" : ""
                  }`}
                  onClick={() => setDraftSelectedTrailerPlate(item.placa)}
                >
                  <strong>{item.placa}</strong>

                  <span>
                    {item.tipoFrota} · {item.propriedade} · {item.dono}
                  </span>
                </button>
              ))}
            </div>

            <div className="slide3-modal-footer">
              <button
                type="button"
                className="slide3-modal-secondary"
                onClick={clearTrailerPlateSelection}
              >
                Limpar
              </button>

              <button
                type="button"
                className="slide3-modal-primary"
                onClick={applyTrailerPlateSelection}
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