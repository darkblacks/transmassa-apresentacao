export const deckInfo = {
  month: "Julho",
  period: "Jan–Jul/2026",
  partial: "Agosto parcial até 05/08/2026",
  title: "Fechamento de Frota Mensal",
};

export const fuelKpis = [
  { label: "Combustível no período", value: "R$ 6,56 mi", hint: "Janeiro a Julho/2026" },
  { label: "Volume abastecido", value: "997.873 L", hint: "Somatório mensal da frota" },
  { label: "Preço médio", value: "R$ 6,57/L", hint: "Total ÷ litros" },
  { label: "KM/L validado", value: "3,57", hint: "Apenas registros com hodômetro OK" },
];

export const fuelMonths = [
  { month: "Jan", total: "R$ 835 mil", value: 72, litros: "138,9 mil L", kml: "3,48" },
  { month: "Fev", total: "R$ 881 mil", value: 76, litros: "148,1 mil L", kml: "3,64" },
  { month: "Mar", total: "R$ 1,17 mi", value: 100, litros: "169,9 mil L", kml: "3,62" },
  { month: "Abr", total: "R$ 941 mil", value: 81, litros: "131,8 mil L", kml: "3,68" },
  { month: "Mai", total: "R$ 915 mil", value: 78, litros: "134,8 mil L", kml: "3,11" },
  { month: "Jun", total: "R$ 924 mil", value: 79, litros: "138,3 mil L", kml: "3,86" },
  { month: "Jul", total: "R$ 892 mil", value: 76, litros: "136,0 mil L", kml: "3,60" },
];

export const maintenanceKpis = [
  { label: "Manutenção total", value: "R$ 1,95 mi", hint: "OS entregues no período" },
  { label: "Ordens de serviço", value: "1.550", hint: "Jan–Jul/2026" },
  { label: "Peças", value: "59,3%", hint: "Maior parte do custo" },
  { label: "Mão de obra", value: "40,7%", hint: "Complemento do custo" },
];

export const maintenanceMonths = [
  { month: "Jan", total: "R$ 163,7 mil", value: 38 },
  { month: "Fev", total: "R$ 294,0 mil", value: 68 },
  { month: "Mar", total: "R$ 430,4 mil", value: 100 },
  { month: "Abr", total: "R$ 238,3 mil", value: 55 },
  { month: "Mai", total: "R$ 258,0 mil", value: 60 },
  { month: "Jun", total: "R$ 247,4 mil", value: 57 },
  { month: "Jul", total: "R$ 320,6 mil", value: 75 },
];

export const offenders = [
  { rank: 1, truck: "EZH6J29 — Cavalo LS", kmMes: "1.592", kml: "2,40", manut: "R$ 8.053", custoKm: "R$ 4,68", reason: "Utilização muito baixa, R$ 1,77/km de manutenção e 17 dias em manutenção" },
  { rank: 2, truck: "FPQ3187 — Truck", kmMes: "4.665", kml: "3,33", manut: "R$ 21.839", custoKm: "R$ 3,59", reason: "R$ 1,56/km de manutenção e 12 OS; forte candidato a substituição" },
  { rank: 3, truck: "FDB7941 — Cavalo LS", kmMes: "4.378", kml: "2,31", manut: "R$ 12.410", custoKm: "R$ 4,31", reason: "13 OS, nove dias em manutenção e custo elevado" },
  { rank: 4, truck: "EVO9H70 — Cavalo", kmMes: "3.237", kml: "2,15", manut: "R$ 7.715", custoKm: "R$ 4,05", reason: "Consumo ruim, utilização abaixo do desejável e histórico de manutenção alto" },
  { rank: 5, truck: "GJU1B26 — Cavalo LS", kmMes: "4.303", kml: "2,35", manut: "R$ 24.338", custoKm: "R$ 4,79", reason: "R$ 1,95/km de manutenção e dez dias parado" },
  { rank: 6, truck: "EVO9758 — Cavalo LS", kmMes: "2.621", kml: "2,04", manut: "R$ 12.231", custoKm: "R$ 4,17", reason: "Pouco rodado, consumo ruim e manutenção recorrente" },
  { rank: 7, truck: "FXS6A81 — Truck", kmMes: "5.743", kml: "3,44", manut: "R$ 25.487", custoKm: "R$ 3,46", reason: "Maior manutenção recente entre os Trucks, 15 OS e dez dias parado" },
  { rank: 8, truck: "FGX2388 — Cavalo LS", kmMes: "5.050", kml: "2,23", manut: "R$ 14.426", custoKm: "R$ 4,06", reason: "Consumo ruim, manutenção elevada e oito dias parado" },
  { rank: 9, truck: "FDZ0C43 — Cavalo LS", kmMes: "3.099", kml: "2,25", manut: "R$ 9.171", custoKm: "R$ 3,71", reason: "Baixa utilização e concentração de manutenção em junho e julho" },
  { rank: 10, truck: "FDP4D53 — 3/4", kmMes: "4.117", kml: "5,42", manut: "R$ 21.967", custoKm: "R$ 3,08", reason: "Combustível eficiente, mas manutenção muito acima dos demais 3/4 e 15 OS" },
];

export const dataProblems = [
  { title: "Hodômetro e KM rodado", text: "Nem todo mês possui hodômetro anterior ou leitura consistente. Por isso, KM/L e R$/KM devem usar apenas registros com observação OK." },
  { title: "Cadastro da frota", text: "Placas, origem, tipo e Cavalo/Baú precisam ficar padronizados para comparar próprio, terceiro, truck, 3/4 e cavalo de forma justa." },
  { title: "Motorista e posto", text: "Campos incompletos reduzem a confiança de rankings por motorista e dificultam leitura de comportamento de abastecimento." },
  { title: "Manutenção e tempo parado", text: "OS com zero dias e classificações muito genéricas dificultam medir indisponibilidade real e preventiva x corretiva." },
];

export const processPlan = [
  { step: "01", title: "Fechamento mensal", text: "Definir uma data fixa de corte e validação das bases de combustível, OS, serviços, peças e frota." },
  { step: "02", title: "Dono do cadastro", text: "Responsável por padronizar placas, tipo de veículo, origem e classificações antes do fechamento." },
  { step: "03", title: "Trava de qualidade", text: "Criar conferências simples: OS x serviços x peças, hodômetro atual x anterior e campos obrigatórios." },
  { step: "04", title: "Gestão por exceção", text: "Focar a reunião nos ofensores, nos dados contaminados e nas ações que precisam de responsável e prazo." },
];
