import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Presentation,
} from "lucide-react";

type TopMenuProps = {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToSlide: (index: number) => void;
};

const slideLabels = [
  "Capa",
  "Contexto",
  "Combustível",
  "Solução",
  "Manutenção",
  "Custos Gerenciais",
  "Diagnóstico crítico dos dados",
  "Plano de evolução",
  "Proposta de implantação",
  "Encerramento",
];
function handleDownloadExcels() {
  const files = [
    "/data/Base_Consolidada_Placa_Mes_Transmassa_Cavalos_2026.xlsx",
    "/data/Custos_Auxiliares_Frota_Jan_Abr_2026.xlsx",
  ];

  files.forEach((file, index) => {
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = file;
      link.download = file.split("/").pop() ?? "arquivo.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, index * 300);
  });
}
export default function TopMenu({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onGoToSlide,
}: TopMenuProps) {
  return (
    <motion.header
      className="top-menu"
      initial={{ opacity: 0, y: -28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="top-menu-left">
        <motion.div
          className="top-menu-logo"
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <Presentation size={18} />
        </motion.div>

        <div>
          <strong>Fechamento Frota</strong>
          <span>Transmassa · Abril/2026</span>
        </div>
      </div>

      <nav className="top-menu-center">
        {Array.from({ length: totalSlides }).map((_, index) => {
          const active = index === currentSlide;

          return (
            <button
              key={index}
              type="button"
              className={`slide-dot ${active ? "active" : ""}`}
              onClick={() => onGoToSlide(index)}
              title={slideLabels[index] ?? `Slide ${index + 1}`}
            >
              {active && (
                <motion.span
                  layoutId="activeSlideIndicator"
                  className="active-slide-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <span className="slide-dot-text">{index + 1}</span>
            </button>
          );
        })}
      </nav>

      <div className="top-menu-right">
        <button type="button" className="menu-button ghost" onClick={onPrev}>
          <ChevronLeft size={18} />
          Anterior
        </button>

        <button type="button" className="menu-button primary" onClick={onNext}>
          Próximo
          <ChevronRight size={18} />
        </button>

        <button
  type="button"
  className="menu-button download"
  onClick={handleDownloadExcels}
>
  <Download size={17} />
  Excel
</button>
      </div>
    </motion.header>
  );
}