import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ReactECharts from "echarts-for-react";

type FilterType = "total" | "proprio" | "terceiro";
type SortType = "desc" | "asc";
type FleetType = "Cavalo" | "Carreta";
type MonthFilter = "todos" | "Janeiro" | "Fevereiro" | "Março" | "Abril";

type MaintenanceRow = {
  placa: string;
  mes: string;
  tipoFrota: string;
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
  tipoFrota: string;
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

function isProprio(value: string, dono?: string) {
  const text = `${normalizeText(value)} ${normalizeText(dono)}`;
  return text.includes("proprio") || text.includes("transmassa");
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatNumber(value: number) {
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  });
}


function fleetLabel(fleet: FleetType) {
  return fleet === "Cavalo" ? "Cavalos" : "Carretas";
}

function getFleetMonthly(rows: MaintenanceRow[], fleet: FleetType): MonthlyItem[] {
  return monthOrder.map((mes) => {
    const monthRows = rows.filter(
      (row) => row.tipoFrota === fleet && row.mes === mes
    );

    return {
      mes,
      os: monthRows.length,
      total: monthRows.reduce((sum, row) => sum + row.total, 0),
    };
  });
}

function getFleetRanking(
  rows: MaintenanceRow[],
  fleet: FleetType,
  selectedMonth: MonthFilter,
  sortType: SortType
): RankingItem[] {
  const grouped = rows
    .filter((row) => row.tipoFrota === fleet)
    .filter((row) => (selectedMonth === "todos" ? true : row.mes === selectedMonth))
    .reduce<Record<string, RankingItem>>((acc, row) => {
      if (!acc[row.placa]) {
        acc[row.placa] = {
          placa: row.placa,
          total: 0,
          os: 0,
          dono: row.dono || "Não informado",
        };
      }

      acc[row.placa].total += row.total;
      acc[row.placa].os += 1;
      return acc;
    }, {});

  return Object.values(grouped)
    .filter((item) => item.total > 0)
    .sort((a, b) =>
      sortType === "desc" ? b.total - a.total : a.total - b.total
    )
    .slice(0, 12);
}

function makeMonthlyChart(data: MonthlyItem[], fleet: FleetType) {
  return {
    grid: { left: 76, right: 24, top: 34, bottom: 34 },
    tooltip: {
      trigger: "axis",
      formatter: (params: Array<{ data: number; name: string }>) => {
        const item = params[0];
        const month = data.find((row) => row.mes === item.name);

        return [
          `<strong>${fleetLabel(fleet)} · ${item.name}</strong>`,
          `Total: ${formatCurrency(item.data)}`,
          `OS: ${formatNumber(month?.os ?? 0)}`,
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
        formatter: (value: number) => `R$ ${(value / 1000).toFixed(0)}k`,
      },
      splitLine: { lineStyle: { color: "#e5e7eb" } },
    },
    series: [
      {
        name: fleetLabel(fleet),
        type: "line",
        smooth: true,
        symbolSize: 10,
        data: data.map((item) => item.total),
        lineStyle: { width: 4, color: fleet === "Cavalo" ? "#991b1b" : "#243746" },
        itemStyle: { color: fleet === "Cavalo" ? "#dc2626" : "#229E93" },
        areaStyle: {
          color: fleet === "Cavalo" ? "rgba(220, 38, 38, 0.10)" : "rgba(34, 158, 147, 0.12)",
        },
      },
    ],
  };
}

function makeRankingChart(data: RankingItem[], fleet: FleetType) {
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
          `Dono: ${row?.dono ?? "Não informado"}`,
          `Total: ${formatCurrency(item.data)}`,
          `OS: ${formatNumber(row?.os ?? 0)}`,
        ].join("<br />");
      },
    },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `R$ ${(value / 1000).toFixed(0)}k`,
      },
      splitLine: { lineStyle: { color: "#e5e7eb" } },
    },
    yAxis: {
      type: "category",
      data: displayData.map((item) => item.placa),
    },
    series: [
      {
        name: fleetLabel(fleet),
        type: "bar",
        data: displayData.map((item) => item.total),
        barWidth: 20,
        itemStyle: {
          borderRadius: [0, 12, 12, 0],
          color: fleet === "Cavalo" ? "#b01625" : "#229E93",
        },
      },
    ],
  };
}

export default function Slide4() {
  const [rows, setRows] = useState<MaintenanceRow[]>([]);
  const [filter, setFilter] = useState<FilterType>("total");
  const [selectedOwner, setSelectedOwner] = useState("total");
  const [selectedPlate, setSelectedPlate] = useState("total");
  const [selectedRankingMonth, setSelectedRankingMonth] =
    useState<MonthFilter>("todos");
  const [sortType, setSortType] = useState<SortType>("desc");

  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [draftPlateSearch, setDraftPlateSearch] = useState("");
  const [draftSelectedOwner, setDraftSelectedOwner] = useState("total");
  const [draftSelectedPlate, setDraftSelectedPlate] = useState("total");

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
          const mes = getMonthName(getValue(row, ["mês", "mes", "competência", "competencia"]));
          const tipoFrota = String(
            getValue(row, ["tipo frota", "cavalo_carreta", "cavalo carreta"])
          ).trim();
          const propriedade = String(
            getValue(row, ["próprio/terceiro", "proprio/terceiro", "propriedade"])
          ).trim();
          const dono = String(getValue(row, ["dono", "frota", "proprietario", "proprietário"])).trim();

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
            qualidade: String(getValue(row, ["qualidade", "status qualidade"])).trim() || "Não avaliado",
          };
        })
        .filter(
          (row) =>
            row.placa &&
            monthOrder.includes(row.mes as MonthFilter) &&
            ["Cavalo", "Carreta"].includes(row.tipoFrota)
        );

      setRows(parsedRows);
    }

    loadData();
  }, []);

  const plateOptions = useMemo(() => {
    const map = new Map<string, PlateOption>();

    rows.forEach((row) => {
      if (!map.has(row.placa)) {
        map.set(row.placa, {
          placa: row.placa,
          dono: row.dono || "Não informado",
          propriedade: row.propriedade || "Não informado",
          tipoFrota: row.tipoFrota || "Não informado",
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.placa.localeCompare(b.placa)
    );
  }, [rows]);

  const ownerOptions = useMemo(() => {
    return Array.from(
      new Set(rows.map((row) => row.dono || "Não informado").filter(Boolean))
    ).sort();
  }, [rows]);

  const modalPlateOptions = useMemo(() => {
    return plateOptions.filter((item) => {
      const matchOwner =
        draftSelectedOwner === "total" ? true : item.dono === draftSelectedOwner;

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
    setDraftPlateSearch("");

    setSelectedOwner("total");
    setSelectedPlate("total");
    setIsPlateModalOpen(false);
  }

  function clearAllFilters() {
    setFilter("total");
    setSelectedOwner("total");
    setSelectedPlate("total");
    setSelectedRankingMonth("todos");
    setSortType("desc");
  }

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchOwnership =
        filter === "total"
          ? true
          : filter === "proprio"
            ? isProprio(row.propriedade, row.dono)
            : !isProprio(row.propriedade, row.dono);

      const matchOwner = selectedOwner === "total" ? true : row.dono === selectedOwner;
      const matchPlate = selectedPlate === "total" ? true : row.placa === selectedPlate;

      return matchOwnership && matchOwner && matchPlate;
    });
  }, [rows, filter, selectedOwner, selectedPlate]);

  const totals = useMemo(() => {
    const total = filteredRows.reduce((sum, row) => sum + row.total, 0);
    const totalCavalo = filteredRows
      .filter((row) => row.tipoFrota === "Cavalo")
      .reduce((sum, row) => sum + row.total, 0);
    const totalCarreta = filteredRows
      .filter((row) => row.tipoFrota === "Carreta")
      .reduce((sum, row) => sum + row.total, 0);
    const totalDias = filteredRows.reduce((sum, row) => sum + row.dias, 0);
    const linhasRevisar = filteredRows.filter(
      (row) => normalizeText(row.qualidade) !== "confiavel"
    ).length;

    return {
      total,
      totalCavalo,
      totalCarreta,
      totalDias,
      os: filteredRows.length,
      placas: new Set(filteredRows.map((row) => row.placa)).size,
      linhasRevisar,
      custoMedioOs: filteredRows.length > 0 ? total / filteredRows.length : 0,
    };
  }, [filteredRows]);

  const cavaloMonthly = useMemo(
    () => getFleetMonthly(filteredRows, "Cavalo"),
    [filteredRows]
  );

  const carretaMonthly = useMemo(
    () => getFleetMonthly(filteredRows, "Carreta"),
    [filteredRows]
  );

  const cavaloRanking = useMemo(
    () => getFleetRanking(filteredRows, "Cavalo", selectedRankingMonth, sortType),
    [filteredRows, selectedRankingMonth, sortType]
  );

  const carretaRanking = useMemo(
    () => getFleetRanking(filteredRows, "Carreta", selectedRankingMonth, sortType),
    [filteredRows, selectedRankingMonth, sortType]
  );

  const cavaloMonthlyChart = useMemo(
    () => makeMonthlyChart(cavaloMonthly, "Cavalo"),
    [cavaloMonthly]
  );

  const carretaMonthlyChart = useMemo(
    () => makeMonthlyChart(carretaMonthly, "Carreta"),
    [carretaMonthly]
  );

  const cavaloRankingChart = useMemo(
    () => makeRankingChart(cavaloRanking, "Cavalo"),
    [cavaloRanking]
  );

  const carretaRankingChart = useMemo(
    () => makeRankingChart(carretaRanking, "Carreta"),
    [carretaRanking]
  );

  return (
    <section className="slide slide4">
      <header className="slide4-header">
        <div>
          <span className="slide4-tag">Manutenção</span>

          <h1 className="slide4-title">Manutenção por tipo de frota</h1>

          <p className="slide4-subtitle">
            Separação entre cavalos e carretas, com leitura mensal, ranking por placa
            e filtros por dono, placa, propriedade e mês do ranking.
          </p>
        </div>

        <div className="slide3-controls slide4-controls">
          <button
            type="button"
            className="slide3-open-modal-button"
            onClick={openPlateModal}
          >
            <span>Placa / Dono selecionado</span>
            <strong>
              {selectedOwner === "total" ? "Todas as frotas" : selectedOwner}
              {selectedPlate !== "total" ? ` · ${selectedPlate}` : ""}
            </strong>
          </button>

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

      <div className="slide3-kpis slide4-kpis">
        <div className="slide3-kpi slide4-kpi-card">
          <span>Total manutenção</span>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>

        <div className="slide3-kpi slide4-kpi-card">
          <span>Total cavalos</span>
          <strong>{formatCurrency(totals.totalCavalo)}</strong>
        </div>

        <div className="slide3-kpi slide4-kpi-card">
          <span>Total carretas</span>
          <strong>{formatCurrency(totals.totalCarreta)}</strong>
        </div>

        <div className="slide3-kpi slide4-kpi-card highlight">
          <span>Custo médio por OS</span>
          <strong>{formatCurrency(totals.custoMedioOs)}</strong>
        </div>
      </div>

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

        <div className="slide4-quality-pill">
          <span>OS: {formatNumber(totals.os)}</span>
          <span>Placas: {formatNumber(totals.placas)}</span>
          <span>Revisar: {formatNumber(totals.linhasRevisar)}</span>
        </div>
      </div>

      <div className="slide4-dashboard">
        <div className="slide4-chart-card">
          <div className="slide4-chart-header">
            <div>
              <strong>Cavalos · evolução mensal</strong>
              <span>Custo total de manutenção por mês</span>
            </div>
          </div>

          <ReactECharts option={cavaloMonthlyChart} style={{ height: 280, width: "100%" }} />
        </div>

        <div className="slide4-chart-card">
          <div className="slide4-chart-header">
            <div>
              <strong>Cavalos · maior manutenção</strong>
              <span>
                Ranking por placa · {selectedRankingMonth === "todos" ? "Jan-Abr" : selectedRankingMonth}
              </span>
            </div>
          </div>

          <ReactECharts option={cavaloRankingChart} style={{ height: 280, width: "100%" }} />
        </div>

        <div className="slide4-chart-card">
          <div className="slide4-chart-header">
            <div>
              <strong>Carretas · evolução mensal</strong>
              <span>Custo total de manutenção por mês</span>
            </div>
          </div>

          <ReactECharts option={carretaMonthlyChart} style={{ height: 280, width: "100%" }} />
        </div>

        <div className="slide4-chart-card">
          <div className="slide4-chart-header">
            <div>
              <strong>Carretas · maior manutenção</strong>
              <span>
                Ranking por placa · {selectedRankingMonth === "todos" ? "Jan-Abr" : selectedRankingMonth}
              </span>
            </div>
          </div>

          <ReactECharts option={carretaRankingChart} style={{ height: 280, width: "100%" }} />
        </div>
      </div>

      <footer className="slide4-warning">
        <strong>Ponto de Melhoria:</strong>
        <span>
          O Ideal é que possamos averiguar além dos custos totais, verificar o
          tempo ocioso de OS, a  quantidade de KM/TOTAL DE Manutenção
          podemos conseguir estes indicadores nas proximas analises através de um trabalho mais completo.
        </span>
      </footer>

      {isPlateModalOpen && (
        <div className="slide3-modal-backdrop">
          <div className="slide3-modal">
            <div className="slide3-modal-header">
              <div>
                <strong>Selecionar placa</strong>
                <span>Filtre por dono/frota e escolha uma placa específica.</span>
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
