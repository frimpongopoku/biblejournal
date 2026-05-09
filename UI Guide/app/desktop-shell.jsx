// Desktop view of the Bible Journal app.
// 1440x900 artboard. Three-pane: collections / workspace / context.

const { useState, useMemo, useEffect, useRef } = React;

const DesktopApp = ({ initialView, initialCollection, palette = 'warm' }) => {
  const T = window.BJ.palettes[palette] || window.BJ.palettes.warm;
  const Icon = window.BJ.Icon;
  const { dailyVerse, streak, collections, tags, entries, prayers, bibleChapter, crossRefs, aiInsights, navItems } = window.BJ;

  const [view, setView] = useState(initialView || 'home');
  const [activeEntry, setActiveEntry] = useState('morning-light');
  const [openCollection, setOpenCollection] = useState(initialCollection || 'all');
  const [showRight, setShowRight] = useState(true);
  const [localPalette, setLocalPalette] = useState(palette);

  // Re-sync to incoming prop changes (Tweaks panel updates)
  React.useEffect(() => { setLocalPalette(palette); }, [palette]);

  const C = window.BJ.palettes[localPalette] || window.BJ.palettes.warm;
  const dark = localPalette === 'midnight';
  const toggleTheme = () => setLocalPalette(dark ? 'warm' : 'midnight');

  return (
    <div style={{
      width: 1440, height: 900,
      background: C.bg,
      color: C.ink,
      fontFamily: 'var(--bj-ui), Inter, sans-serif',
      fontSize: 14,
      lineHeight: 1.5,
      display: 'grid',
      gridTemplateColumns: '264px 1fr ' + (showRight ? '320px' : '0px'),
      gridTemplateRows: '52px 1fr',
      transition: 'grid-template-columns .25s ease',
      fontFeatureSettings: '"ss01","cv11"',
    }}>
      <TopBar C={C} dark={dark} toggleTheme={toggleTheme} showRight={showRight} setShowRight={setShowRight} view={view} />
      <LeftSidebar C={C} navItems={navItems} view={view} setView={setView} collections={collections} openCollection={openCollection} setOpenCollection={setOpenCollection} tags={tags} streak={streak} />
      <Workspace C={C} view={view} entries={entries} activeEntry={activeEntry} setActiveEntry={setActiveEntry} dailyVerse={dailyVerse} streak={streak} bibleChapter={bibleChapter} prayers={prayers} openCollection={openCollection} collections={collections} />
      <RightPanel C={C} show={showRight} view={view} crossRefs={crossRefs} aiInsights={aiInsights} entries={entries} activeEntry={activeEntry} />
    </div>
  );
};

/* ───────────────────────── TOP BAR ───────────────────────── */
const TopBar = ({ C, dark, toggleTheme, showRight, setShowRight, view }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex', alignItems: 'center',
      borderBottom: `1px solid ${C.line}`,
      background: C.bg,
      paddingRight: 14,
    }}>
      <div style={{ width: 264, display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 18, height: '100%' }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: `linear-gradient(135deg, ${C.gold}, ${C.ember})`,
          display: 'grid', placeItems: 'center',
          color: '#fff',
          fontFamily: 'var(--bj-display), Georgia, serif',
          fontWeight: 600, fontSize: 17, lineHeight: 1,
          boxShadow: `0 1px 0 rgba(255,255,255,.4) inset, 0 4px 14px ${C.gold}40`,
        }}>L</div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -0.1 }}>Lampstand</span>
          <span style={{ fontSize: 11, color: C.ink3 }}>Personal study & journal</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 16 }}>
        <div style={{
          flex: '0 1 520px',
          height: 34,
          display: 'flex', alignItems: 'center', gap: 9,
          background: C.bgInk,
          border: `1px solid ${C.line}`,
          borderRadius: 9,
          padding: '0 11px',
          color: C.ink3,
        }}>
          <Icon name="search" size={15} />
          <span style={{ flex: 1, fontSize: 13 }}>Search verses, notes, prayers…</span>
          <span style={{
            display: 'flex', gap: 3, fontSize: 11, color: C.ink4,
          }}>
            <kbd style={kbd(C)}>⌘</kbd><kbd style={kbd(C)}>K</kbd>
          </span>
        </div>

        <Crumbs C={C} view={view} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <IconBtn C={C} icon="bell" />
        <IconBtn C={C} icon={dark ? 'sun' : 'moon'} onClick={toggleTheme} />
        <IconBtn C={C} icon="panel" onClick={() => setShowRight(s => !s)} active={showRight} />
        <div style={{ width: 1, height: 22, background: C.line, margin: '0 6px' }} />
        <div style={{
          width: 30, height: 30, borderRadius: 999,
          background: `linear-gradient(135deg, ${C.sage}, ${C.gold})`,
          display: 'grid', placeItems: 'center',
          color: '#fff', fontWeight: 600, fontSize: 12,
          boxShadow: '0 1px 2px rgba(0,0,0,.15)',
        }}>OF</div>
      </div>
    </div>
  );
};

const kbd = C => ({
  padding: '1px 5px', borderRadius: 4,
  background: C.bgPanel, border: `1px solid ${C.line}`,
  fontFamily: 'inherit', fontSize: 10, lineHeight: 1.4,
  color: C.ink3,
});

const IconBtn = ({ C, icon, onClick, active }) => {
  const Icon = window.BJ.Icon;
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      width: 32, height: 32, borderRadius: 8,
      background: active ? C.bgInk : (hover ? C.bgInk : 'transparent'),
      border: 'none', cursor: 'pointer',
      color: active ? C.ink : C.ink2,
      display: 'grid', placeItems: 'center',
      transition: 'background .12s',
    }}>
      <Icon name={icon} size={17} />
    </button>
  );
};

const Crumbs = ({ C, view }) => {
  const map = {
    home: ['Today', 'Saturday, May 9'],
    journal: ['Journal', 'All notes'],
    bible: ['Bible', 'John 15 · ESV'],
    prayer: ['Prayers', 'Active'],
    highlights: ['Highlights', 'Recent'],
    research: ['Research', 'Sermon — Mercy'],
    graph: ['Graph', '142 nodes'],
  };
  const [a, b] = map[view] || map.home;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: C.ink3 }}>
      <span>{a}</span>
      <span style={{ opacity: 0.5 }}>›</span>
      <span style={{ color: C.ink2 }}>{b}</span>
    </div>
  );
};

/* ───────────────────────── LEFT SIDEBAR ───────────────────────── */
const LeftSidebar = ({ C, navItems, view, setView, collections, openCollection, setOpenCollection, tags, streak }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{
      borderRight: `1px solid ${C.line}`,
      background: C.bgSoft,
      padding: '14px 10px',
      overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <NavGroup label="Workspace" C={C}>
        {navItems.slice(0, 4).map(n => (
          <NavRow key={n.id} C={C} item={n} active={view === n.id} onClick={() => setView(n.id)} />
        ))}
      </NavGroup>

      <NavGroup label="Discover" C={C}>
        {navItems.slice(4).map(n => (
          <NavRow key={n.id} C={C} item={n} active={view === n.id} onClick={() => setView(n.id)} />
        ))}
      </NavGroup>

      <NavGroup label="Collections" C={C} action={<Icon name="plus" size={13} />}>
        {collections.map(c => (
          <CollectionRow key={c.id} C={C} c={c} active={openCollection === c.id && view === 'journal'} onClick={() => { setOpenCollection(c.id); setView('journal'); }} />
        ))}
      </NavGroup>

      <NavGroup label="Tags" C={C}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '2px 8px 4px' }}>
          {tags.map(t => (
            <span key={t.id} style={{
              fontSize: 11, padding: '3px 8px',
              background: C.bgInk, color: C.ink2,
              border: `1px solid ${C.line}`,
              borderRadius: 999,
              cursor: 'pointer',
            }}>#{t.name} <span style={{ color: C.ink4, marginLeft: 2 }}>{t.count}</span></span>
          ))}
        </div>
      </NavGroup>

      <div style={{ flex: 1 }} />

      {/* Streak card */}
      <div style={{
        margin: '10px 4px 4px', padding: 12,
        background: C.goldTint,
        border: `1px solid ${C.goldSoft}`,
        borderRadius: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: C.ink3, textTransform: 'uppercase', letterSpacing: 0.4 }}>Reading streak</span>
          <span style={{ fontSize: 11, color: C.ink4 }}>this week</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
          <span style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontWeight: 500, fontSize: 32, lineHeight: 1, color: C.ink }}>{streak.days}</span>
          <span style={{ fontSize: 12, color: C.ink2 }}>days</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 9 }}>
          {streak.weekDots.map((d, i) => (
            <span key={i} style={{
              flex: 1, height: 5, borderRadius: 999,
              background: d ? C.gold : C.line,
            }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 8px 4px', color: C.ink3 }}>
        <Icon name="settings" size={14} />
        <span style={{ fontSize: 12 }}>Preferences</span>
      </div>
    </div>
  );
};

const NavGroup = ({ label, C, action, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '4px 10px 6px',
      fontSize: 10.5, color: C.ink4,
      textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600,
    }}>
      <span>{label}</span>
      {action && <span style={{ opacity: 0.7, cursor: 'pointer' }}>{action}</span>}
    </div>
    {children}
  </div>
);

const NavRow = ({ C, item, active, onClick }) => {
  const Icon = window.BJ.Icon;
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 10px',
        borderRadius: 8,
        background: active ? C.bgPanel : (hover ? C.bgInk : 'transparent'),
        color: active ? C.ink : C.ink2,
        cursor: 'pointer',
        boxShadow: active ? `inset 0 0 0 1px ${C.line}` : 'none',
        transition: 'background .12s',
      }}>
      <span style={{ color: active ? C.gold : C.ink3 }}><Icon name={item.icon} size={16} /></span>
      <span style={{ fontSize: 13, fontWeight: active ? 500 : 400 }}>{item.label}</span>
    </div>
  );
};

const CollectionRow = ({ C, c, active, onClick }) => {
  const Icon = window.BJ.Icon;
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '5px 10px',
      borderRadius: 7,
      background: active ? C.bgInk : 'transparent',
      color: active ? C.ink : C.ink2,
      cursor: 'pointer',
      fontSize: 12.5,
    }}>
      <Icon name="folder" size={14} style={{ color: active ? C.gold : C.ink4 }} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
      <span style={{ fontSize: 11, color: C.ink4 }}>{c.count}</span>
    </div>
  );
};

window.DesktopApp = DesktopApp;
