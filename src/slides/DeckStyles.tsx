export default function DeckStyles() {
  return (
    <style>{`
      .tm-slide {
        width: min(1240px, calc(100vw - 32px));
        min-height: min(710px, calc(100vh - 80px));
        padding: clamp(32px, 4vw, 56px);
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .tm-slide::before {
        background:
          radial-gradient(circle at top right, rgba(51, 180, 174, 0.11), transparent 34%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(241, 245, 249, 0.96)) !important;
      }
      .tm-red-slide {
        background:
          radial-gradient(circle at 18% 25%, rgba(255, 80, 80, 0.22), transparent 30%),
          radial-gradient(circle at 82% 20%, rgba(255, 56, 76, 0.28), transparent 32%),
          radial-gradient(circle at 78% 80%, rgba(190, 20, 38, 0.34), transparent 36%),
          linear-gradient(135deg, #21070b 0%, #650915 48%, #b01625 100%) !important;
        color: white;
        border-color: rgba(255,255,255,.16);
      }
      .tm-red-slide::before {
        background: linear-gradient(120deg, rgba(255,255,255,.07), transparent 30%, transparent 70%, rgba(255,255,255,.05)) !important;
      }
      .tm-eyebrow {
        display: inline-flex;
        width: fit-content;
        padding: 9px 15px;
        border-radius: 999px;
        background: rgba(176, 22, 37, .08);
        border: 1px solid rgba(176, 22, 37, .12);
        color: #991b1b;
        font-size: 13px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .09em;
      }
      .tm-title {
        color: #0f172a !important;
        font-weight: 950 !important;
        letter-spacing: -0.06em !important;
        line-height: .95 !important;
        font-size: clamp(44px, 4.8vw, 74px) !important;
        max-width: 980px;
      }
      .tm-subtitle {
        max-width: 900px;
        color: #475569 !important;
        font-size: 20px !important;
        line-height: 1.55 !important;
      }
      .tm-logo-mini {
        position: absolute;
        top: 42px;
        right: 48px;
        width: 150px;
        height: auto;
        object-fit: contain;
      }
      .tm-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }
      .tm-kpi {
        background: white;
        border: 1px solid rgba(15, 23, 42, .08);
        border-radius: 24px;
        padding: 22px;
        box-shadow: 0 18px 36px rgba(15, 23, 42, .07);
        min-height: 122px;
      }
      .tm-kpi span {
        display: block;
        color: #64748b;
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .08em;
        margin-bottom: 10px;
      }
      .tm-kpi strong {
        display: block;
        color: #0f172a;
        font-size: clamp(25px, 2vw, 34px);
        line-height: 1;
        letter-spacing: -.04em;
      }
      .tm-kpi small {
        display: block;
        color: #475569;
        font-size: 13px;
        font-weight: 800;
        margin-top: 10px;
      }
      .tm-card {
        background: white;
        border: 1px solid rgba(15, 23, 42, .08);
        border-radius: 28px;
        padding: 28px;
        box-shadow: 0 20px 42px rgba(15, 23, 42, .08);
      }
      .tm-chart-card {
        background: white;
        color: #0f172a;
        border: 1px solid rgba(15, 23, 42, .08);
        border-radius: 28px;
        padding: 28px;
        box-shadow: 0 20px 42px rgba(15, 23, 42, .08);
      }
      .tm-chart-card p, .tm-chart-card span { color: #475569 !important; }
      .tm-chart-card .tm-mini-title { color: #0f172a !important; }
      .tm-chart-card .tm-bar-row { color: #0f172a; }
      .tm-chart-card .tm-bar-row > span { color: #475569 !important; }
      .tm-chart-card .tm-bar-row strong { color: #0f172a; }
      .tm-chart-card .tm-bar-track { background: #e5e7eb; }
      .tm-chart-card .tm-bar-fill {
        background: linear-gradient(90deg, #b01625, #ef4444);
      }
      .tm-share-card {
        background: #fff;
        border: 1px solid rgba(15,23,42,.08);
        border-radius: 22px;
        padding: 24px;
      }
      .tm-share-card span {
        color: #64748b !important;
        font-weight: 900;
        font-size: 12px;
        letter-spacing: .08em;
      }
      .tm-share-card strong {
        display: block;
        font-size: 44px;
        line-height: 1;
        letter-spacing: -.05em;
        margin-top: 12px;
      }
      .tm-dark-card {
        background: #3b3b40;
        color: white;
        border: 1px solid rgba(176,22,37,.18);
        border-radius: 28px;
        padding: 28px;
        box-shadow: 0 22px 42px rgba(15, 23, 42, .12);
      }
      .tm-dark-card p, .tm-dark-card span { color: rgba(255,255,255,.78) !important; }
      .tm-bars { display: grid; gap: 16px; margin-top: 18px; }
      .tm-bar-row { display: grid; grid-template-columns: 52px 1fr 120px; gap: 14px; align-items: center; color: white; font-weight: 900; }
      .tm-bar-track { height: 18px; border-radius: 999px; background: rgba(255,255,255,.11); overflow: hidden; }
      .tm-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #ff3748, #b01625); }
      .tm-two-col { display: grid; grid-template-columns: 1.05fr .95fr; gap: 22px; align-items: stretch; flex: 1; }
      .tm-mini-title {
        margin: 0 0 10px !important;
        color: #0f172a !important;
        font-size: 24px !important;
        letter-spacing: -.035em !important;
      }
      .tm-dark-card .tm-mini-title { color: white !important; }
      .tm-note {
        border-radius: 24px;
        padding: 22px 24px;
        background: linear-gradient(135deg, rgba(176,22,37,.08), rgba(239,68,68,.03));
        border: 1px solid rgba(176,22,37,.12);
        color: #7f1d1d !important;
        font-size: 18px !important;
        font-weight: 800;
      }
      .tm-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .tm-table th {
        text-align: left;
        color: #7f1d1d;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: .07em;
        padding: 9px 8px;
        border-bottom: 1px solid rgba(176,22,37,.18);
      }
      .tm-table td {
        color: #0f172a;
        padding: 8px;
        border-bottom: 1px solid rgba(15,23,42,.08);
        font-weight: 700;
        vertical-align: top;
      }
      .tm-rank {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        display: inline-grid;
        place-items: center;
        background: #b01625;
        color: white;
        font-weight: 950;
      }
      .tm-problem-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 18px;
        flex: 1;
      }
      .tm-problem {
        background: white;
        border: 1px solid rgba(15, 23, 42, .08);
        border-radius: 26px;
        padding: 24px;
        box-shadow: 0 18px 36px rgba(15,23,42,.07);
      }
      .tm-problem strong {
        display: block;
        color: #0f172a;
        font-size: 24px;
        letter-spacing: -.04em;
        margin-bottom: 10px;
      }
      .tm-problem p { font-size: 16px !important; }
      .tm-process-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        flex: 1;
      }
      .tm-process {
        background: white;
        border-radius: 28px;
        border: 1px solid rgba(15,23,42,.08);
        padding: 26px;
        box-shadow: 0 20px 42px rgba(15,23,42,.08);
      }
      .tm-process .num {
        display: inline-grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: linear-gradient(135deg, #b01625, #7f1d1d);
        color: white;
        font-weight: 950;
        margin-bottom: 20px;
      }
      .tm-process strong {
        display: block;
        color: #0f172a;
        font-size: 22px;
        letter-spacing: -.04em;
        margin-bottom: 12px;
      }
      .tm-process p { font-size: 16px !important; }
      .tm-final-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        flex: 1;
      }
      .tm-final-card {
        background: rgba(255,255,255,.1);
        border: 1px solid rgba(255,255,255,.18);
        border-radius: 28px;
        padding: 30px;
      }
      .tm-final-card strong {
        display: block;
        color: white;
        font-size: 28px;
        margin-bottom: 14px;
      }
      .tm-final-card p { color: rgba(255,255,255,.76) !important; }
      @media (max-width: 980px) {
        .tm-kpi-grid, .tm-two-col, .tm-problem-grid, .tm-process-grid, .tm-final-grid {
          grid-template-columns: 1fr;
        }
        .tm-logo-mini { position: static; width: 120px; margin-left: auto; }
        .tm-table { font-size: 11px; }
      }
    `}</style>
  );
}
