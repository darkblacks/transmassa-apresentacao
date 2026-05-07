import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ReactECharts from "echarts-for-react";

type OwnershipFilter = "total" | "proprio" | "terceiro";
type MonthFilter = "Total" | "Janeiro" | "Fevereiro" | "Março" | "Abril";

type OperationMetric =
  | "faturamentoTeorico"
  | "manifestos"
  | "servicos"
  | "km"
  | "faturamentoTransmassa";

type ServiceChartMetric = "quantidade" | "faturamento";

type DetailManifestRow = {
  mes: MonthFilter;
  data: string;
  placa: string;
  motorista: string;
  propriedade: string;
  dono: string;
  motivo: string;
  manifestoKey: string;
  km: number;
  valorFreteTransmassa: number;
  kgReal: number;
  nfs: number;
  quantidadeServico: number;
};

type ConsolidatedCostRow = {
  mes: MonthFilter;
  placa: string;
  propriedade: string;
  dono: string;
  combustivel: number;
  litros: number;
};

type MaintenanceSupportRow = {
  mes: MonthFilter;
  placa: string;
  propriedade: string;
  dono: string;
  manutencao: number;
  kmOficialPlacaMes: number;
};

type AuxCostRow = {
  mes: MonthFilter;
  conta: string;
  valor: number;
};

const BASE_FILE_PATH =
  "/data/Base_Consolidada_Placa_Mes_Transmassa_Cavalos_2026.xlsx";

const AUX_FILE_PATH =
  "/data/Custos_Auxiliares_Frota_Jan_Abr_2026.xlsx";

const monthOrder: MonthFilter[] = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
];

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

    if (exactMatch) return exactMatch;

    const partialMatch = keys.find((key) =>
      normalizeText(key).includes(normalizedAlias)
    );

    if (partialMatch) return partialMatch;
  }

  return undefined;
}

function getValue(row: Record<string, unknown>, aliases: string[]) {
  const key = findColumn(row, aliases);
  return key ? row[key] : "";
}

function getMonthName(value: unknown): MonthFilter {
  const text = normalizeText(value);

  if (
    text.includes("jan") ||
    text.includes("2026-01") ||
    text.includes("01/2026")
  ) {
    return "Janeiro";
  }

  if (
    text.includes("fev") ||
    text.includes("2026-02") ||
    text.includes("02/2026")
  ) {
    return "Fevereiro";
  }

  if (
    text.includes("mar") ||
    text.includes("2026-03") ||
    text.includes("03/2026")
  ) {
    return "Março";
  }

  if (
    text.includes("abr") ||
    text.includes("2026-04") ||
    text.includes("04/2026")
  ) {
    return "Abril";
  }

  return "Total";
}

function isProprio(value: string) {
  const text = normalizeText(value);
  return text.includes("proprio") || text.includes("transmassa");
}

function normalizeMotivo(value: unknown) {
  const raw = String(value ?? "").trim();
  const text = normalizeText(raw);

  if (!raw || text.includes("nao informado") || text.includes("não informado")) {
    return "Não identificado";
  }

  return raw;
}

function defaultPriceForService(service: string) {
  const text = normalizeText(service);

  if (text.includes("transfer")) return 450;
  if (text.includes("distribuicao")) return 120;
  if (text.includes("coleta")) return 120;
  if (text.includes("entrega")) return 120;
  if (text.includes("devol")) return 80;
  if (text.includes("nao identificado")) return 0;

  return 0;
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

function formatDecimal(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function operationMetricLabel(metric: OperationMetric) {
  const labels: Record<OperationMetric, string> = {
    faturamentoTeorico: "Faturamento teórico",
    manifestos: "Manifestos",
    servicos: "Serviços",
    km: "KM total",
    faturamentoTransmassa: "Faturamento Transmassa",
  };

  return labels[metric];
}

function countManifestos(rows: DetailManifestRow[]) {
  const keys = rows
    .map((row) => row.manifestoKey)
    .filter((key) => key && !key.startsWith("linha-"));

  if (keys.length > 0) {
    return new Set(keys).size;
  }

  return rows.length;
}

export default function Slide6() {
  const [detailRows, setDetailRows] = useState<DetailManifestRow[]>([]);
  const [costRows, setCostRows] = useState<ConsolidatedCostRow[]>([]);
  const [auxRows, setAuxRows] = useState<AuxCostRow[]>([]);

  const [selectedMonth, setSelectedMonth] = useState<MonthFilter>("Total");
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilter>("total");

  const [operationMetric, setOperationMetric] =
    useState<OperationMetric>("faturamentoTeorico");

  const [serviceChartMetric, setServiceChartMetric] =
    useState<ServiceChartMetric>("faturamento");

  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});

  const [maintenanceRows, setMaintenanceRows] = useState<MaintenanceSupportRow[]>([]);

  useEffect(() => {
    async function loadBaseData() {
      const response = await fetch(BASE_FILE_PATH);
      const arrayBuffer = await response.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
      });

      const consolidatedSheetName =
        workbook.SheetNames.find((name) => {
          const normalized = normalizeText(name);
          return normalized.includes("consolidado");
        }) ?? workbook.SheetNames[0];

      const detailSheetName =
        workbook.SheetNames.find((name) => {
          const normalized = normalizeText(name);
          return (
            normalized.includes("detalhe_manifestos") ||
            (normalized.includes("detalhe") && normalized.includes("manifest"))
          );
        }) ?? workbook.SheetNames[0];

      const consolidatedSheet = workbook.Sheets[consolidatedSheetName];
      const detailSheet = workbook.Sheets[detailSheetName];

      const consolidatedRawRows =
        XLSX.utils.sheet_to_json<Record<string, unknown>>(consolidatedSheet, {
          defval: "",
        });

      const parsedCostRows: ConsolidatedCostRow[] = consolidatedRawRows
  .map((row) => {
    const mes = getMonthName(
      getValue(row, ["mês", "mes", "competência", "competencia"])
    );

    return {
      mes,
      placa: String(getValue(row, ["placa", "veiculo", "veículo"])).trim(),
      dono: String(
        getValue(row, ["dono", "empresa", "proprietario", "proprietário"])
      ).trim(),
      propriedade: String(
        getValue(row, [
          "próprio/terceiro",
          "proprio/terceiro",
          "propriedade",
          "tipo frota",
        ])
      ).trim(),
      combustivel: toNumber(
        getValue(row, ["combustível r$", "combustivel r$"])
      ),
      litros: toNumber(
        getValue(row, [
          "litros",
          "litros totais",
          "combustível litros",
          "combustivel litros",
        ])
      ),
    };
  })
  .filter((row) => row.placa && monthOrder.includes(row.mes));

      setCostRows(parsedCostRows);

      const ownershipByPlate = new Map<
        string,
        {
          propriedade: string;
          dono: string;
        }
      >();
        const maintenanceSheetName =
  workbook.SheetNames.find((name) => {
    const normalized = normalizeText(name);
    return normalized.includes("manutencao");
  }) ?? null;

if (maintenanceSheetName) {
  const maintenanceSheet = workbook.Sheets[maintenanceSheetName];

  const maintenanceRawRows =
    XLSX.utils.sheet_to_json<Record<string, unknown>>(maintenanceSheet, {
      defval: "",
    });

  const parsedMaintenanceRows: MaintenanceSupportRow[] = maintenanceRawRows
    .map((row) => {
      const mes = getMonthName(
        getValue(row, ["mês", "mes", "competência", "competencia"])
      );

      const placa = String(
        getValue(row, ["placa", "veiculo", "veículo"])
      ).trim();

      const mappedOwnership = ownershipByPlate.get(placa);

      return {
        mes,
        placa,
        propriedade:
          String(
            getValue(row, [
              "próprio/terceiro",
              "proprio/terceiro",
              "propriedade",
              "tipo frota",
            ])
          ).trim() ||
          mappedOwnership?.propriedade ||
          "Não informado",
        dono:
          String(
            getValue(row, ["dono", "empresa", "proprietario", "proprietário"])
          ).trim() ||
          mappedOwnership?.dono ||
          "Não informado",
        manutencao: toNumber(
          getValue(row, [
            "manutenção r$",
            "manutencao r$",
            "manutenção",
            "manutencao",
          ])
        ),
        kmOficialPlacaMes: toNumber(
          getValue(row, [
            "km oficial placa/mês (somável)",
            "km oficial placa/mes (somavel)",
            "km oficial placa/mês",
            "km oficial placa/mes",
          ])
        ),
      };
    })
    .filter((row) => row.placa && monthOrder.includes(row.mes));

  setMaintenanceRows(parsedMaintenanceRows);
}
      parsedCostRows.forEach((row) => {
        if (!ownershipByPlate.has(row.placa)) {
          ownershipByPlate.set(row.placa, {
            propriedade: row.propriedade,
            dono: row.dono,
          });
        }
      });

      const detailRawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        detailSheet,
        {
          defval: "",
        }
      );

      const parsedDetailRows: DetailManifestRow[] = detailRawRows
        .map((row, index) => {
          const mes = getMonthName(
            getValue(row, ["mês", "mes", "competência", "competencia"])
          );

          const placa = String(getValue(row, ["placa"])).trim();

          const mappedOwnership = ownershipByPlate.get(placa);

          const propriedadeFromDetail = String(
            getValue(row, [
              "próprio/terceiro",
              "proprio/terceiro",
              "propriedade",
              "tipo frota",
            ])
          ).trim();

          const donoFromDetail = String(
            getValue(row, ["dono", "empresa", "proprietario", "proprietário"])
          ).trim();

          const manifestoOriginal = String(
            getValue(row, [
              "manifesto",
              "manifestos",
              "nº manifesto",
              "numero manifesto",
              "número manifesto",
              "documento",
              "cte",
            ])
          ).trim();

          return {
            mes,
            data: String(getValue(row, ["data"])).trim(),
            placa,
            motorista: String(getValue(row, ["motorista"])).trim(),
            propriedade:
              propriedadeFromDetail ||
              mappedOwnership?.propriedade ||
              "Não informado",
            dono: donoFromDetail || mappedOwnership?.dono || "Não informado",
            motivo: normalizeMotivo(getValue(row, ["motivo"])),
            manifestoKey: manifestoOriginal || `linha-${index}`,
            km: toNumber(
              getValue(row, [
                "km oficial alocado (somável no detalhe)",
                "km oficial alocado (somavel no detalhe)",
                "km oficial alocado",
                "km alocado",
              ])
            ),
            valorFreteTransmassa: toNumber(
              getValue(row, [
                "valor frete transmassa",
                "frete transmassa",
                "faturamento transmassa",
              ])
            ),
            kgReal: toNumber(getValue(row, ["kg real", "peso real"])),
            nfs: toNumber(getValue(row, ["nfs", "nf"])),
            quantidadeServico:
              toNumber(
                getValue(row, [
                  "quantidade",
                  "qtd",
                  "qtd serviços",
                  "qtd servicos",
                ])
              ) || 1,
          };
        })
        .filter((row) => row.placa && monthOrder.includes(row.mes));

      setDetailRows(parsedDetailRows);
    }

    async function loadAuxCosts() {
      const response = await fetch(AUX_FILE_PATH);
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

      const parsedRows: AuxCostRow[] = rawRows
        .map((row) => ({
          mes: getMonthName(
            getValue(row, ["mês", "mes", "competência", "competencia"])
          ),
          conta: String(
            getValue(row, ["conta", "categoria", "descrição", "descricao"])
          ).trim(),
          valor: toNumber(
            getValue(row, [
              "valor considerado kpi",
              "valor considerado no kpi",
              "valor considerado",
              "considerado kpi",
            ])
          ),
        }))
        .filter((row) => monthOrder.includes(row.mes) && row.valor > 0);

      setAuxRows(parsedRows);
    }

    loadBaseData();
    loadAuxCosts();
  }, []);

  const filteredDetailRows = useMemo(() => {
    return detailRows.filter((row) => {
      const matchMonth =
        selectedMonth === "Total" ? true : row.mes === selectedMonth;

      const ownershipValue = `${row.propriedade} ${row.dono}`;
      const proprio = isProprio(ownershipValue);

      const matchOwnership =
        ownershipFilter === "total"
          ? true
          : ownershipFilter === "proprio"
            ? proprio
            : !proprio;

      return matchMonth && matchOwnership;
    });
  }, [detailRows, selectedMonth, ownershipFilter]);

  const filteredCostRows = useMemo(() => {
    return costRows.filter((row) => {
      const matchMonth =
        selectedMonth === "Total" ? true : row.mes === selectedMonth;

      const ownershipValue = `${row.propriedade} ${row.dono}`;
      const proprio = isProprio(ownershipValue);

      const matchOwnership =
        ownershipFilter === "total"
          ? true
          : ownershipFilter === "proprio"
            ? proprio
            : !proprio;

      return matchMonth && matchOwnership;
    });
  }, [costRows, selectedMonth, ownershipFilter]);
  const filteredMaintenanceRows = useMemo(() => {
  return maintenanceRows.filter((row) => {
    const matchMonth =
      selectedMonth === "Total" ? true : row.mes === selectedMonth;

    const ownershipValue = `${row.propriedade} ${row.dono}`;
    const proprio = isProprio(ownershipValue);

    const matchOwnership =
      ownershipFilter === "total"
        ? true
        : ownershipFilter === "proprio"
          ? proprio
          : !proprio;

    return matchMonth && matchOwnership;
  });
}, [maintenanceRows, selectedMonth, ownershipFilter]);
  const filteredAuxRows = useMemo(() => {
    return auxRows.filter((row) => {
      if (selectedMonth === "Total") return true;

      return row.mes === selectedMonth;
    });
  }, [auxRows, selectedMonth]);

  const serviceRows = useMemo(() => {
    const map = new Map<string, number>();

    filteredDetailRows.forEach((row) => {
      const service = row.motivo || "Não identificado";

      map.set(service, (map.get(service) ?? 0) + row.quantidadeServico);
    });

    return Array.from(map.entries())
      .map(([service, quantidade]) => {
        const price = servicePrices[service] ?? defaultPriceForService(service);

        return {
          service,
          quantidade,
          price,
          faturamento: quantidade * price,
        };
      })
      .sort((a, b) => b.faturamento - a.faturamento);
  }, [filteredDetailRows, servicePrices]);

  const faturamentoTeorico = useMemo(() => {
    return serviceRows.reduce((sum, row) => sum + row.faturamento, 0);
  }, [serviceRows]);

  const totals = useMemo(() => {
    const manifestos = countManifestos(filteredDetailRows);
    const servicos = serviceRows.reduce((sum, row) => sum + row.quantidade, 0);
    const km = filteredDetailRows.reduce((sum, row) => sum + row.km, 0);
    const nfs = filteredDetailRows.reduce((sum, row) => sum + row.nfs, 0);
    const kgReal = filteredDetailRows.reduce((sum, row) => sum + row.kgReal, 0);

    const faturamentoTransmassa = filteredDetailRows.reduce(
      (sum, row) => sum + row.valorFreteTransmassa,
      0
    );

    const combustivel = filteredCostRows.reduce(
      (sum, row) => sum + row.combustivel,
      0
    );

    const manutencao = filteredMaintenanceRows.reduce(
  (sum, row) => sum + row.manutencao,
  0
);

    const custosAuxiliares = filteredAuxRows.reduce(
      (sum, row) => sum + row.valor,
      0
    );

    return {
      manifestos,
      servicos,
      nfs,
      kgReal,
      km,
      kmPorManifesto: manifestos > 0 ? km / manifestos : 0,
      faturamentoTransmassa,
      faturamentoTeorico,
      combustivel,
      manutencao,
      custosAuxiliares,
      resultadoEstimado:
        faturamentoTeorico - combustivel - manutencao - custosAuxiliares,
    };
  }, [
    filteredDetailRows,
    filteredCostRows,
    filteredAuxRows,
    serviceRows,
    faturamentoTeorico,
  ]);

  const monthlySummary = useMemo(() => {
    return monthOrder.map((mes) => {
      const monthRows = detailRows.filter((row) => {
        const ownershipValue = `${row.propriedade} ${row.dono}`;
        const proprio = isProprio(ownershipValue);

        const matchOwnership =
          ownershipFilter === "total"
            ? true
            : ownershipFilter === "proprio"
              ? proprio
              : !proprio;

        return row.mes === mes && matchOwnership;
      });

      const manifestos = countManifestos(monthRows);
      const km = monthRows.reduce((sum, row) => sum + row.km, 0);
      const faturamentoTransmassa = monthRows.reduce(
        (sum, row) => sum + row.valorFreteTransmassa,
        0
      );

      const serviceMap = new Map<string, number>();

      monthRows.forEach((row) => {
        const service = row.motivo || "Não identificado";

        serviceMap.set(
          service,
          (serviceMap.get(service) ?? 0) + row.quantidadeServico
        );
      });

      const servicos = Array.from(serviceMap.values()).reduce(
        (sum, value) => sum + value,
        0
      );

      const faturamentoTeoricoMes = Array.from(serviceMap.entries()).reduce(
        (sum, [service, quantidade]) => {
          const price =
            servicePrices[service] ?? defaultPriceForService(service);

          return sum + quantidade * price;
        },
        0
      );

      return {
        mes,
        manifestos,
        servicos,
        km,
        faturamentoTransmassa,
        faturamentoTeorico: faturamentoTeoricoMes,
      };
    });
  }, [detailRows, ownershipFilter, servicePrices]);

  const comparisonRows = useMemo(() => {
    return [
      {
        label: "Faturamento Transmassa",
        value: totals.faturamentoTransmassa,
        positive: true,
      },
      {
        label: "Faturamento teórico",
        value: totals.faturamentoTeorico,
        positive: true,
      },
      {
        label: "Combustível",
        value: totals.combustivel,
        positive: false,
      },
      {
        label: "Manutenção",
        value: totals.manutencao,
        positive: false,
      },
      {
        label: "Custos auxiliares",
        value: totals.custosAuxiliares,
        positive: false,
      },
      {
        label: "Resultado estimado",
        value: totals.resultadoEstimado,
        positive: totals.resultadoEstimado >= 0,
      },
    ];
  }, [totals]);

  const monthlySupportSummary = useMemo(() => {
  return monthOrder.map((mes) => {
    const fuelMonthRows = costRows.filter((row) => {
      const ownershipValue = `${row.propriedade} ${row.dono}`;
      const proprio = isProprio(ownershipValue);

      const matchOwnership =
        ownershipFilter === "total"
          ? true
          : ownershipFilter === "proprio"
            ? proprio
            : !proprio;

      return row.mes === mes && matchOwnership;
    });

    const maintenanceMonthRows = maintenanceRows.filter((row) => {
      const ownershipValue = `${row.propriedade} ${row.dono}`;
      const proprio = isProprio(ownershipValue);

      const matchOwnership =
        ownershipFilter === "total"
          ? true
          : ownershipFilter === "proprio"
            ? proprio
            : !proprio;

      return row.mes === mes && matchOwnership;
    });

    const combustivel = fuelMonthRows.reduce(
      (sum, row) => sum + row.combustivel,
      0
    );

    const litros = fuelMonthRows.reduce(
      (sum, row) => sum + row.litros,
      0
    );

    const combustivelRlitro = litros > 0 ? combustivel / litros : 0;

    const manutencao = maintenanceMonthRows.reduce(
      (sum, row) => sum + row.manutencao,
      0
    );

    const kmOficialPlacaMes = maintenanceMonthRows.reduce(
      (sum, row) => sum + row.kmOficialPlacaMes,
      0
    );

    return {
      mes,
      combustivel,
      litros,
      combustivelRlitro,
      manutencao,
      kmOficialPlacaMes,
    };
  });
}, [costRows, maintenanceRows, ownershipFilter]);

  const highlightedFuelMonths = useMemo(() => {
  return monthlySupportSummary
    .filter((item) => item.combustivelRlitro > 0)
    .slice(-2)
    .map((item) => item.mes);
}, [monthlySupportSummary]);

  const marchSupport = useMemo(() => {
    return monthlySupportSummary.find((item) => item.mes === "Março");
  }, [monthlySupportSummary]);

  const operationChart = {
    grid: {
      left: 72,
      right: 24,
      top: 28,
      bottom: 38,
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) =>
        operationMetric.includes("faturamento")
          ? formatCurrency(value)
          : formatNumber(value),
    },
    xAxis: {
      type: "category",
      data: monthlySummary.map((item) => item.mes),
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) =>
          operationMetric.includes("faturamento")
            ? `R$ ${(value / 1000).toFixed(0)}k`
            : `${(value / 1000).toFixed(0)}k`,
      },
      splitLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
    },
    series: [
      {
        name: operationMetricLabel(operationMetric),
        type: operationMetric.includes("faturamento") ? "bar" : "line",
        smooth: true,
        symbolSize: 9,
        barWidth: 38,
        data: monthlySummary.map((item) => item[operationMetric]),
        lineStyle: {
          width: 4,
          color: "#15803d",
        },
        itemStyle: {
          color: "#16a34a",
          borderRadius: [12, 12, 0, 0],
        },
        areaStyle: operationMetric.includes("faturamento")
          ? undefined
          : {
              color: "rgba(22, 163, 74, 0.10)",
            },
      },
    ],
  };

  const serviceChart = {
    grid: {
      left: 132,
      right: 26,
      top: 24,
      bottom: 34,
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) =>
        serviceChartMetric === "faturamento"
          ? formatCurrency(value)
          : formatNumber(value),
    },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) =>
          serviceChartMetric === "faturamento"
            ? `R$ ${(value / 1000).toFixed(0)}k`
            : `${value}`,
      },
      splitLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
    },
    yAxis: {
      type: "category",
      data: serviceRows.map((item) => item.service).reverse(),
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        data: serviceRows
          .map((item) =>
            serviceChartMetric === "faturamento"
              ? item.faturamento
              : item.quantidade
          )
          .reverse(),
        barWidth: 22,
        itemStyle: {
          color: "#15803d",
          borderRadius: [0, 12, 12, 0],
        },
      },
    ],
  };

  const comparisonChart = {
    grid: {
      left: 140,
      right: 24,
      top: 24,
      bottom: 34,
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => formatCurrency(value),
    },
    xAxis: {
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
    yAxis: {
      type: "category",
      data: comparisonRows.map((item) => item.label).reverse(),
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        data: comparisonRows
          .map((item) => ({
            value: item.value,
            itemStyle: {
              color: item.positive ? "#16a34a" : "#b01625",
              borderRadius: [0, 12, 12, 0],
            },
          }))
          .reverse(),
        barWidth: 22,
      },
    ],
  };

  const fuelSupportChart = {
    grid: {
      left: 64,
      right: 24,
      top: 34,
      bottom: 42,
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => `R$ ${value.toFixed(2)}`,
    },
    xAxis: {
      type: "category",
      data: monthlySupportSummary.map((item) => item.mes),
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `R$ ${value.toFixed(2)}`,
      },
      splitLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
    },
    series: [
      {
        name: "R$/Litro Combustível",
        type: "line",
        smooth: true,
        symbolSize: 10,
        data: monthlySupportSummary.map((item) => item.combustivelRlitro),
        lineStyle: {
          width: 4,
          color: "#15803d",
        },
        itemStyle: {
          color: "#16a34a",
        },
        areaStyle: {
          color: "rgba(22, 163, 74, 0.10)",
        },
      },
      {
        name: "Meses em destaque",
        type: "effectScatter",
        data: monthlySupportSummary
          .filter((item) => highlightedFuelMonths.includes(item.mes))
          .map((item) => ({
            value: [item.mes, item.combustivelRlitro],
          })),
        symbolSize: 18,
        rippleEffect: {
          scale: 3,
          brushType: "stroke",
        },
        itemStyle: {
          color: "#ef4444",
          shadowBlur: 18,
          shadowColor: "rgba(239, 68, 68, 0.45)",
        },
        zlevel: 3,
      },
    ],
  };

  const maintenanceSupportChart = {
    grid: {
      left: 68,
      right: 68,
      top: 30,
      bottom: 42,
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: {
        color: "#475569",
        fontWeight: 700,
      },
    },
    xAxis: {
      type: "category",
      data: monthlySupportSummary.map((item) => item.mes),
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: "value",
        name: "Manutenção",
        axisLabel: {
          formatter: (value: number) => `R$ ${(value / 1000).toFixed(0)}k`,
        },
        splitLine: {
          lineStyle: {
            color: "#e5e7eb",
          },
        },
      },
      {
        type: "value",
        name: "KM",
        axisLabel: {
          formatter: (value: number) => `${(value / 1000).toFixed(0)}k`,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: "Manutenção R$",
        type: "line",
        smooth: true,
        yAxisIndex: 0,
        symbolSize: 10,
        data: monthlySupportSummary.map((item) => item.manutencao),
        lineStyle: {
          width: 4,
          color: "#b01625",
        },
        itemStyle: {
          color: "#b01625",
        },
        areaStyle: {
          color: "rgba(176, 22, 37, 0.08)",
        },
      },
      {
        name: "KM Oficial Placa/Mês",
        type: "bar",
        yAxisIndex: 1,
        barWidth: 28,
        data: monthlySupportSummary.map((item) => item.kmOficialPlacaMes),
        itemStyle: {
          color: "#94a3b8",
          borderRadius: [10, 10, 0, 0],
        },
      },
      {
        name: "Destaque Março",
        type: "effectScatter",
        yAxisIndex: 0,
        data: marchSupport
          ? [
              {
                value: [marchSupport.mes, marchSupport.manutencao],
              },
            ]
          : [],
        symbolSize: 20,
        rippleEffect: {
          scale: 3.5,
          brushType: "stroke",
        },
        itemStyle: {
          color: "#ef4444",
          shadowBlur: 18,
          shadowColor: "rgba(239, 68, 68, 0.45)",
        },
        zlevel: 3,
      },
    ],
  };

  return (
    <section className="slide slide6">
      <header className="slide6-header">
        <div>
          <span className="slide6-tag">Faturamento e produtividade</span>

          <h1 className="slide6-title">
            Faturamento, produtividade e leitura operacional
          </h1>

          <p className="slide6-subtitle">
            Visão de manifestos, serviços executados, KM alocado, faturamento
            Transmassa e simulação do faturamento teórico da frota arrendada.
          </p>
        </div>

        <div className="slide6-filters">
          <label>
            Mês
            <select
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(event.target.value as MonthFilter)
              }
            >
              <option value="Total">Total Jan–Abr</option>
              <option value="Janeiro">Janeiro</option>
              <option value="Fevereiro">Fevereiro</option>
              <option value="Março">Março</option>
              <option value="Abril">Abril</option>
            </select>
          </label>

          <div className="slide6-ownership-filter">
            <button
              className={ownershipFilter === "total" ? "active" : ""}
              onClick={() => setOwnershipFilter("total")}
            >
              Total
            </button>

            <button
              className={ownershipFilter === "proprio" ? "active" : ""}
              onClick={() => setOwnershipFilter("proprio")}
            >
              Próprio
            </button>

            <button
              className={ownershipFilter === "terceiro" ? "active" : ""}
              onClick={() => setOwnershipFilter("terceiro")}
            >
              Terceiro
            </button>
          </div>
        </div>
      </header>

      <div className="slide6-kpis">
        <div className="slide6-kpi featured">
          <span>Manifestos totais</span>
          <strong>{formatNumber(totals.manifestos)}</strong>
          <small>Documentos operacionais considerados.</small>
        </div>

        <div className="slide6-kpi">
          <span>Serviços executados</span>
          <strong>{formatNumber(totals.servicos)}</strong>
          <small>Quantidade classificada por motivo.</small>
        </div>

        <div className="slide6-kpi">
          <span>NFs</span>
          <strong>{formatNumber(totals.nfs)}</strong>
          <small>Total de notas consideradas.</small>
        </div>

        <div className="slide6-kpi">
          <span>KM total</span>
          <strong>{formatNumber(totals.km)}</strong>
          <small>KM/manifesto: {formatDecimal(totals.kmPorManifesto)}</small>
        </div>

        <div className="slide6-kpi revenue">
          <span>Faturamento Transmassa</span>
          <strong>{formatCurrency(totals.faturamentoTransmassa)}</strong>
          <small>Valor Frete Transmassa.</small>
        </div>

        <div className="slide6-kpi revenue">
          <span>Faturamento teórico</span>
          <strong>{formatCurrency(totals.faturamentoTeorico)}</strong>
          <small>Preço unitário × motivo.</small>
        </div>
      </div>

      <div className="slide6-main-grid">
        <div className="slide6-simulator">
          <div className="slide6-section-header">
            <div>
              <strong>Simulação do faturamento por serviço</strong>
            </div>
          </div>

          <div className="slide6-service-table">
            <div className="slide6-service-row header">
              <span>Seviço</span>
              <span>Qtde</span>
              <span>Preço unit.</span>
              <span>Total</span>
            </div>

            {serviceRows.map((item) => (
              <div className="slide6-service-row" key={item.service}>
                <strong>{item.service}</strong>

                <span>{formatNumber(item.quantidade)}</span>

                <input
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(event) =>
                    setServicePrices((prev) => ({
                      ...prev,
                      [item.service]: toNumber(event.target.value),
                    }))
                  }
                />

                <p>{formatCurrency(item.faturamento)}</p>
              </div>
            ))}
          </div>

          <div className="slide6-simulator-note">
            O faturamento teórico não substitui o faturamento real da
            Transmassa. Ele simula quanto a frota arrendada poderia gerar com
            base nos motivos registrados nos manifestos.
          </div>
        </div>

        <div className="slide6-chart-card">
          <div className="slide6-chart-header">
            <div>
              <strong>Evolução mensal da operação</strong>
              <span>{operationMetricLabel(operationMetric)}</span>
            </div>

            <select
              value={operationMetric}
              onChange={(event) =>
                setOperationMetric(event.target.value as OperationMetric)
              }
            >
              <option value="faturamentoTeorico">Faturamento teórico</option>
              <option value="faturamentoTransmassa">
                Faturamento Transmassa
              </option>
              <option value="manifestos">Manifestos</option>
              <option value="servicos">Serviços</option>
              <option value="km">KM total</option>
            </select>
          </div>

          <ReactECharts
            option={operationChart}
            style={{
              width: "100%",
              height: 320,
            }}
          />
        </div>
      </div>

      <div className="slide6-bottom-grid">
        <div className="slide6-chart-card">
          <div className="slide6-chart-header">
            <div>
              <strong>Operações executadas</strong>
              <span>
                {serviceChartMetric === "faturamento"
                  ? "Faturamento teórico por motivo"
                  : "Quantidade por motivo"}
              </span>
            </div>

            <button
              className="slide6-toggle"
              onClick={() =>
                setServiceChartMetric((prev) =>
                  prev === "faturamento" ? "quantidade" : "faturamento"
                )
              }
            >
              {serviceChartMetric === "faturamento"
                ? "Faturamento"
                : "Quantidade"}
            </button>
          </div>

          <ReactECharts
            option={serviceChart}
            style={{
              width: "100%",
              height: 300,
            }}
          />
        </div>

        <div className="slide6-chart-card">
          <div className="slide6-chart-header">
            <div>
              <strong>Faturamento x custos acompanhados</strong>
              <span>Resultado estimado acompanhado, não lucro contábil.</span>
            </div>
          </div>

          <ReactECharts
            option={comparisonChart}
            style={{
              width: "100%",
              height: 300,
            }}
          />
        </div>
      </div>

      <div className="slide6-support-grid">
        <div className="slide6-support-card">
          <div className="slide6-support-content">
            <div className="slide6-support-chart">
              <ReactECharts
                option={fuelSupportChart}
                style={{
                  width: "100%",
                  height: 250,
                }}
              />
            </div>

            <div className="slide6-support-text">
              <strong>Combustível</strong>
              <span>
                Se você notar o salto no gráfico entre março e abril, fica claro que o custo da sua operação sofreu um golpe direto por conta da instabilidade lá fora. O que está acontecendo é que os conflitos nos países árabes mexem com o fornecimento global de petróleo, e a resposta imediata dos Estados Unidos a essa tensão acaba travando o mercado. Como o dólar e o preço do barril são os pilares que sustentam o nosso combustível aqui no Brasil, qualquer movimento mais agressivo nessa região chega muito rápido na bomba.
</span><span>
O ponto principal para a sua gestão é entender que esse pico reflete uma antecipação de escassez. Quando os EUA e os países árabes entram em rota de colisão, o mercado global entra em alerta e o preço dispara preventivamente. Por isso, esses meses de março e abril aparecem tão destacados: não é apenas uma variação de rotina, mas o reflexo de que o custo para movimentar a frota está sendo ditado por uma crise que foge do controle interno e exige um planejamento de caixa muito mais rígido para absorver essa volatilidade.
          </span>    
              <p>
                O gráfico ao lado mostra a evolução de <b>R$/L</b> no
                combustível e destaca os meses mais recentes disponíveis na
                base, reforçando a tendência de aumento observada no fechamento.
              </p>
            </div>
          </div>
        </div>

        <div className="slide6-support-card">
          <div className="slide6-support-content">
            <div className="slide6-support-chart">
              <ReactECharts
                option={maintenanceSupportChart}
                style={{
                  width: "100%",
                  height: 250,
                }}
              />
            </div>

            <div className="slide6-support-text">
              <strong>Manutenção</strong>
              <span>
                Se você observar o gráfico, verá uma subida acentuada no custo de manutenção, mas é fundamental notar que esse valor acompanha exatamente o salto na quilometragem rodada pela nossa frota no mesmo período. Na prática, isso mostra que o aumento não foi causado por quebras inesperadas ou má qualidade das peças, mas sim por uma operação muito mais intensa.
              </span>
              <p>
                O gráfico compara a evolução mensal de <b>Manutenção R$</b> com
                <b> KM Oficial Placa/Mês</b>, destacando março para justificar a
                leitura gerencial ao lado.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="slide6-final-note">
        A frota precisa ser avaliada pelo equilíbrio entre o que movimenta, o
        que custa e o que pode gerar de faturamento.
      </footer>
    </section>
  );
}