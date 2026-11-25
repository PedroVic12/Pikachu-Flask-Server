import React from 'react';

export function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; background: #070b14; color: #e6edf3; }
      button, input, select { font: inherit; }
      button { cursor: pointer; }
      .app-shell { min-height: 100vh; background: radial-gradient(ellipse at 75% 0%, #10263c 0, #070b14 48rem); }
      .sidebar { position: fixed; inset: 0 auto 0 0; width: 248px; padding: 25px 16px; background: rgba(7, 13, 24, .9); border-right: 1px solid rgba(255,255,255,.1); backdrop-filter: blur(20px); z-index: 30; display: flex; flex-direction: column; }
      .brand { display: flex; align-items: center; gap: 12px; padding: 2px 10px 28px; }
      .brand-icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 13px; background: linear-gradient(135deg,#22d3ee,#2563eb); color: #06111d; font-size: 20px; }
      .brand-title { font-size: 13px; font-weight: 800; color: white; }
      .brand-subtitle { font-family: monospace; color: #67e8f9; font-size: 10px; margin-top: 4px; }
      .nav-label { padding: 8px 11px; color: #64748b; font: 10px monospace; letter-spacing: 1.5px; text-transform: uppercase; }
      .side-link { width: 100%; display: flex; align-items: center; gap: 11px; text-align: left; border: 1px solid transparent; border-radius: 12px; background: transparent; color: #a8b5c7; padding: 11px 12px; margin: 3px 0; font-size: 13px; transition: .2s; }
      .side-link:hover { background: rgba(255,255,255,.06); color: #fff; }
      .side-link.active { color: #7dd3fc; background: rgba(14,165,233,.12); border-color: rgba(56,189,248,.24); }
      .side-footer { margin-top: auto; padding: 14px 10px 0; color: #64748b; font-size: 11px; line-height: 1.6; border-top: 1px solid rgba(255,255,255,.08); }
      .main-area { margin-left: 248px; min-height: 100vh; padding: 94px 34px 52px; }
      .topbar { position: fixed; z-index: 25; top: 0; left: 248px; right: 0; min-height: 68px; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 34px; background: rgba(7,11,20,.78); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(255,255,255,.08); }
      .topbar-title { color: #f8fafc; font-weight: 700; font-size: 14px; }
      .topbar-caption { color: #8493a8; font: 10px monospace; margin-top: 4px; }
      .font-controls { display: flex; align-items: center; gap: 6px; }
      .font-label { color: #94a3b8; font-size: 11px; margin-right: 3px; }
      .font-button { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.13); color: #cbd5e1; border-radius: 9px; padding: 7px 10px; font-size: 11px; }
      .font-button:hover, .font-button.active { background: #0e7490; border-color: #22d3ee; color: white; }
      .content { width: min(1120px, 100%); margin: 0 auto; }
      .eyebrow { color: #67e8f9; font: 11px monospace; text-transform: uppercase; letter-spacing: 1.4px; }
      .page-title { color: #f8fafc; font-size: clamp(28px,4vw,44px); line-height: 1.12; margin: 12px 0; letter-spacing: -.04em; }
      .page-intro { color: #9aa9bd; line-height: 1.7; max-width: 760px; font-size: 14px; }
      .glass-card { background: linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025)); border: 1px solid rgba(255,255,255,.11); box-shadow: 0 16px 50px rgba(0,0,0,.2), inset 0 1px rgba(255,255,255,.08); backdrop-filter: blur(16px); border-radius: 22px; }
      .hero-card { position: relative; overflow: hidden; padding: 30px; margin: 24px 0; }
      .hero-card:after { content: ''; position: absolute; width: 250px; height: 250px; border-radius: 50%; right: -80px; top: -140px; background: rgba(34,211,238,.16); filter: blur(12px); pointer-events: none; }
      .grid { display: grid; gap: 16px; }
      .grid-4 { grid-template-columns: repeat(4,minmax(0,1fr)); }
      .grid-3 { grid-template-columns: repeat(3,minmax(0,1fr)); }
      .grid-2 { grid-template-columns: repeat(2,minmax(0,1fr)); }
      .metric { padding: 18px; }
      .metric-label { color: #93a4b8; font: 10px monospace; text-transform: uppercase; letter-spacing: .8px; }
      .metric-value { color: white; font: 700 27px monospace; margin: 10px 0 4px; }
      .metric-note { color: #6ee7b7; font-size: 11px; }
      .section { margin-top: 34px; }
      .section-heading { font-size: 19px; color: #f1f5f9; margin: 0 0 15px; }
      .section-copy { color: #94a3b8; font-size: 12px; line-height: 1.6; margin: -7px 0 16px; }
      .progress-track { height: 9px; overflow: hidden; background: rgba(15,23,42,.9); border-radius: 99px; border: 1px solid rgba(255,255,255,.1); }
      .progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg,#06b6d4,#3b82f6,#34d399); transition: width .3s; }
      .row-between { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .pill { display: inline-flex; align-items: center; border-radius: 99px; background: rgba(34,211,238,.1); color: #67e8f9; border: 1px solid rgba(34,211,238,.2); font: 10px monospace; padding: 5px 9px; }
      .data-card { padding: 19px; }
      .data-card h3 { color: #f8fafc; font-size: 14px; margin: 0 0 8px; }
      .data-card p { color: #9aa9bd; font-size: 12px; line-height: 1.65; margin: 0; }
      .list-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 0; border-bottom: 1px solid rgba(255,255,255,.07); }
      .list-row:last-child { border-bottom: 0; }
      .list-name { color: #e2e8f0; font-size: 12px; }
      .list-detail { color: #8190a5; font: 10px monospace; margin-top: 4px; }
      .control-button { border: 1px solid rgba(34,211,238,.3); border-radius: 10px; background: rgba(8,145,178,.15); color: #a5f3fc; padding: 8px 11px; font-size: 11px; }
      .control-button:hover { background: rgba(8,145,178,.3); }
      .text-input, .select-input { background: rgba(2,6,23,.75); border: 1px solid rgba(148,163,184,.22); color: #e2e8f0; border-radius: 10px; padding: 10px 11px; width: 100%; outline: none; font-size: 12px; }
      .text-input:focus, .select-input:focus { border-color: #22d3ee; }
      .timeline-item { display: grid; grid-template-columns: 115px 1fr; gap: 18px; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,.08); }
      .timeline-year { color: #67e8f9; font: 12px monospace; }
      .timeline-title { color: #f1f5f9; font-weight: 700; font-size: 14px; }
      .timeline-description { color: #9aa9bd; line-height: 1.6; font-size: 12px; margin-top: 6px; }
      .tab-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 18px 0; }
      .tab-button { border: 1px solid rgba(255,255,255,.13); background: rgba(255,255,255,.04); color: #aab8c9; border-radius: 10px; padding: 8px 12px; font-size: 11px; }
      .tab-button.active { color: #04111b; background: #67e8f9; border-color: #67e8f9; font-weight: 700; }
      .check-row { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; color: #d1d9e5; font-size: 12px; }
      .check-row input { accent-color: #22d3ee; margin-top: 1px; }
      .muted { color: #8493a8; }
      @media (max-width: 980px) { .sidebar { width: 210px; } .main-area { margin-left: 210px; padding-left: 22px; padding-right: 22px; } .topbar { left: 210px; padding-left: 22px; padding-right: 22px; } .grid-4 { grid-template-columns: repeat(2,minmax(0,1fr)); } }
      @media (max-width: 680px) { .sidebar { width: 65px; padding: 16px 8px; } .brand { padding: 0 5px 24px; } .brand-copy, .nav-label, .side-link span:last-child, .side-footer { display: none; } .side-link { justify-content: center; padding: 12px 5px; font-size: 18px; } .main-area { margin-left: 65px; padding: 84px 14px 35px; } .topbar { left: 65px; padding: 10px 12px; min-height: 62px; } .font-label { display: none; } .font-controls { gap: 4px; } .font-button { padding: 7px 6px; font-size: 10px; } .grid-3, .grid-2 { grid-template-columns: 1fr; } .hero-card { padding: 22px; } .timeline-item { grid-template-columns: 1fr; gap: 7px; } }
    `}</style>
  );
}

export function Sidebar({ page, onNavigate }) {
  const links = [
    { id: 'overview', icon: '◈', label: 'Visão geral' },
    { id: 'journey', icon: '⌁', label: 'Jornada & projetos' },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">⚡</div>
        <div className="brand-copy"><div className="brand-title">PVRV DEV CORE</div><div className="brand-subtitle">UFF 2022.2 → 2027.2</div></div>
      </div>
      <div className="nav-label">Navegação</div>
      {links.map(link => (
        <button key={link.id} className={`side-link${page === link.id ? ' active' : ''}`} onClick={() => onNavigate(link.id)} aria-current={page === link.id ? 'page' : undefined}>
          <span>{link.icon}</span><span>{link.label}</span>
        </button>
      ))}
      <div className="side-footer">Portfólio acadêmico e técnico<br />Engenharia Elétrica · UFF</div>
    </aside>
  );
}

export function FontBar({ fonts, selectedFont, onFontChange, page }) {
  return (
    <header className="topbar">
      <div><div className="topbar-title">{page === 'overview' ? 'Painel de controle' : 'Linha do tempo & ecossistema'}</div><div className="topbar-caption">PORTFÓLIO • ENGENHARIA • DESENVOLVIMENTO</div></div>
      <div className="font-controls" role="group" aria-label="Escolha da fonte do site">
        <span className="font-label">Fonte</span>
        {Object.keys(fonts).map(font => (
          <button key={font} type="button" className={`font-button${selectedFont === font ? ' active' : ''}`} style={{ fontFamily: fonts[font] }} aria-pressed={selectedFont === font} onClick={() => onFontChange(font)}>{font}</button>
        ))}
      </div>
    </header>
  );
}

export function GlassCard({ children, className = '', ...props }) {
  return <section className={`glass-card ${className}`} {...props}>{children}</section>;
}
