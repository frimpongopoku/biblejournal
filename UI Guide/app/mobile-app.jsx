// Mobile (iPhone) view of the Bible Journal app.
// Designed for 390x844, fits inside iOS frame's content area.

const { useState: useStateM } = React;

const MobileApp = ({ initialView, initialEntry, initialComposer, palette = 'warm' }) => {
  const T = window.BJ.palettes[palette] || window.BJ.palettes.warm;
  const Icon = window.BJ.Icon;
  const { dailyVerse, streak, entries, prayers, bibleChapter, navItems } = window.BJ;

  const [view, setView] = useStateM(initialView || 'home');
  const [activeEntry, setActiveEntry] = useStateM(initialEntry || 'morning-light');
  const [composerOpen, setComposerOpen] = useStateM(!!initialComposer);

  const C = T;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: C.bg,
      color: C.ink,
      fontFamily: 'var(--bj-ui), Inter, sans-serif',
      fontSize: 14,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      paddingTop: 54, paddingBottom: 22,
    }}>
      {/* Top bar */}
      <MTopBar C={C} view={view} />

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {view === 'home' && <MDashboard C={C} dailyVerse={dailyVerse} streak={streak} entries={entries} setView={setView} setActiveEntry={setActiveEntry} />}
        {view === 'journal' && <MJournalList C={C} entries={entries} setActiveEntry={setActiveEntry} setView={setView} />}
        {view === 'entry' && <MEntry C={C} entries={entries} activeEntry={activeEntry} back={() => setView('journal')} />}
        {view === 'bible' && <MBible C={C} chapter={bibleChapter} />}
        {view === 'prayer' && <MPrayer C={C} prayers={prayers} />}
        {view === 'more' && <MMore C={C} />}
      </div>

      {/* Bottom nav */}
      <MBottomNav C={C} view={view} setView={setView} setComposerOpen={setComposerOpen} />

      {/* Composer modal */}
      {composerOpen && <MComposer C={C} close={() => setComposerOpen(false)} />}
    </div>
  );
};

const MTopBar = ({ C, view }) => {
  const Icon = window.BJ.Icon;
  const titles = {
    home: { l: 'Saturday', t: 'Today' },
    journal: { l: 'May 9, 2026', t: 'Journal' },
    bible: { l: 'ESV \u00b7 Reading plan d12', t: 'John 15' },
    prayer: { l: '3 ongoing \u00b7 2 answered', t: 'Prayers' },
    more: { l: '', t: 'More' },
    entry: { l: '', t: '' },
  };
  if (view === 'entry') return null;
  const tt = titles[view] || titles.home;
  return (
    <div style={{
      padding: '14px 20px 12px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      background: C.bg,
    }}>
      <div>
        <div style={{ fontSize: 11.5, color: C.ink3, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 500 }}>{tt.l}</div>
        <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 30, fontWeight: 500, lineHeight: 1.05, marginTop: 2, letterSpacing: -0.4 }}>{tt.t}</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <MIconBtn C={C} icon="search" />
        <div style={{
          width: 34, height: 34, borderRadius: 999,
          background: `linear-gradient(135deg, ${C.sage}, ${C.gold})`,
          display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 600, fontSize: 12,
        }}>OF</div>
      </div>
    </div>
  );
};

const MIconBtn = ({ C, icon, onClick }) => {
  const Icon = window.BJ.Icon;
  return (
    <button onClick={onClick} style={{
      width: 34, height: 34, borderRadius: 999,
      background: C.bgPanel, border: `1px solid ${C.line}`,
      color: C.ink2, cursor: 'pointer',
      display: 'grid', placeItems: 'center',
    }}><Icon name={icon} size={16} /></button>
  );
};

/* ───── Mobile Dashboard ───── */
const MDashboard = ({ C, dailyVerse, streak, entries, setView, setActiveEntry }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{ padding: '4px 16px 30px' }}>
      {/* Daily verse */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(155deg, ${C.goldTint} 0%, ${C.bgPanel} 75%)`,
        border: `1px solid ${C.goldSoft}`,
        borderRadius: 18,
        padding: '20px 20px 18px',
        overflow: 'hidden',
        marginBottom: 14,
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.gold}33, transparent 70%)`,
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.goldDeep, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
          <Icon name="sun" size={12} /> Verse for today
        </div>
        <p style={{
          fontFamily: 'var(--bj-display), Georgia, serif',
          fontSize: 22, lineHeight: 1.35, fontWeight: 400,
          margin: '10px 0 8px', color: C.ink, letterSpacing: -0.1,
        }}>\u201c{dailyVerse.text}\u201d</p>
        <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontStyle: 'italic', fontSize: 13, color: C.ink2 }}>\u2014 {dailyVerse.ref}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          <MChip C={C} icon="pen">Reflect</MChip>
          <MChip C={C} icon="quote">Save</MChip>
          <MChip C={C} icon="headphones">Listen</MChip>
        </div>
      </div>

      {/* Streak strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', marginBottom: 14,
        background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 14,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontWeight: 500, fontSize: 28, color: C.ink }}>{streak.days}</span>
          <span style={{ fontSize: 11, color: C.ink3 }}>day streak</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, color: C.ink3, marginBottom: 6 }}>This week</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {streak.weekDots.map((d, i) => (
              <span key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: d ? C.gold : C.line }} />
            ))}
          </div>
        </div>
      </div>

      {/* Continue writing */}
      <SectionTitle C={C} title="Continue writing" action="See all" onAction={() => setView('journal')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {entries.slice(0, 3).map((e, i) => (
          <div key={e.id} onClick={() => { setActiveEntry(e.id); setView('entry'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 12,
              background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 12,
              cursor: 'pointer',
            }}>
            <div style={{
              width: 38, height: 46, borderRadius: 5,
              background: i === 0 ? C.goldSoft : C.bgInk,
              border: `1px solid ${C.line}`,
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--bj-display), Georgia, serif',
              fontSize: 18, color: i === 0 ? C.goldDeep : C.ink3,
              flexShrink: 0,
            }}>{e.title[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {e.pinned && <Icon name="pin" size={10} style={{ color: C.gold }} />}
                <span style={{ fontSize: 14, fontWeight: 500, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
              </div>
              <div style={{ fontSize: 12, color: C.ink3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.excerpt}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Reading plan */}
      <SectionTitle C={C} title="Reading plan" action="John, 21d" />
      <div style={{
        background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 14,
        padding: 14, marginBottom: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 19, color: C.ink }}>John 15:1\u201311</div>
          <div style={{ fontSize: 11.5, color: C.goldDeep, fontWeight: 600 }}>Day 12 / 21</div>
        </div>
        <div style={{ height: 5, background: C.lineSoft, borderRadius: 999, overflow: 'hidden', margin: '10px 0 12px' }}>
          <div style={{ width: '57%', height: '100%', background: C.gold }} />
        </div>
        <button style={{
          width: '100%', padding: '10px 12px',
          background: C.ink, color: C.bg, border: 'none', borderRadius: 9,
          fontSize: 13.5, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }} onClick={() => setView('bible')}><Icon name="book" size={14} />Open today\u2019s reading</button>
      </div>

      {/* Reflection prompt */}
      <SectionTitle C={C} title="Reflection prompt" action="New" />
      <div style={{
        background: C.goldTint, border: `1px solid ${C.goldSoft}`, borderRadius: 14,
        padding: 16, marginBottom: 18,
      }}>
        <p style={{
          fontFamily: 'var(--bj-display), Georgia, serif', fontStyle: 'italic',
          fontSize: 17, lineHeight: 1.4, color: C.ink, margin: 0,
        }}>\u201cWhat is the difference between waiting on God and waiting for an outcome?\u201d</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <MChip C={C} icon="pen">Write 5m</MChip>
          <MChip C={C} icon="mic">Voice note</MChip>
        </div>
      </div>

      {/* Prayers preview */}
      <SectionTitle C={C} title="Prayers" action="Open" onAction={() => setView('prayer')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {[
          { s: 'Mum\u2019s recovery', d: 14 },
          { s: 'Wisdom in the new role', d: 7 },
          { s: 'Our small group', d: 21 },
        ].map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: C.ember, boxShadow: `0 0 0 4px ${C.ember}1a`, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13.5, color: C.ink }}>{p.s}</span>
            <span style={{ fontSize: 11, color: C.ink4 }}>{p.d}d</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionTitle = ({ C, title, action, onAction }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 4px 8px' }}>
    <div style={{ fontSize: 12.5, color: C.ink2, fontWeight: 600 }}>{title}</div>
    {action && <div onClick={onAction} style={{ fontSize: 12, color: C.goldDeep, fontWeight: 500, cursor: 'pointer' }}>{action}</div>}
  </div>
);

const MChip = ({ C, icon, children, onClick }) => {
  const Icon = window.BJ.Icon;
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 11px',
      background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 999,
      color: C.ink2, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
    }}>
      {icon && <Icon name={icon} size={11} />} {children}
    </button>
  );
};

/* ───── Mobile Journal list ───── */
const MJournalList = ({ C, entries, setActiveEntry, setView }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{ padding: '4px 16px 30px' }}>
      <div style={{
        display: 'flex', gap: 8, padding: '4px 0 14px', overflowX: 'auto',
      }}>
        {['All', 'Pinned', 'Reflections', 'Sermons', 'Bible study'].map((t, i) => (
          <span key={t} style={{
            padding: '6px 13px', borderRadius: 999, fontSize: 12.5,
            background: i === 0 ? C.ink : C.bgPanel,
            color: i === 0 ? C.bg : C.ink2,
            border: `1px solid ${i === 0 ? C.ink : C.line}`,
            whiteSpace: 'nowrap', cursor: 'pointer',
          }}>{t}</span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map(e => (
          <div key={e.id} onClick={() => { setActiveEntry(e.id); setView('entry'); }}
            style={{ padding: 14, background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {e.pinned && <Icon name="pin" size={10} style={{ color: C.gold }} />}
                <span style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 19, fontWeight: 500, color: C.ink, letterSpacing: -0.1 }}>{e.title}</span>
              </div>
              <span style={{ fontSize: 11, color: C.ink4, flexShrink: 0 }}>{e.date.split(' ')[0]}</span>
            </div>
            <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.45, textWrap: 'pretty' }}>{e.excerpt}</div>
            {e.tags && (
              <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                {e.tags.map(t => <span key={t} style={{ fontSize: 10.5, color: C.ink3, background: C.bgInk, border: `1px solid ${C.lineSoft}`, borderRadius: 999, padding: '1px 8px' }}>#{t}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ───── Mobile Entry ───── */
const MEntry = ({ C, entries, activeEntry, back }) => {
  const Icon = window.BJ.Icon;
  const e = entries.find(x => x.id === activeEntry) || entries[0];
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 4,
        background: C.bg, padding: '10px 16px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${C.lineSoft}`,
      }}>
        <button onClick={back} style={{
          background: 'transparent', border: 'none', color: C.ink2,
          fontFamily: 'inherit', fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4, padding: 0,
        }}><Icon name="chevR" size={16} style={{ transform: 'rotate(180deg)' }} /> Journal</button>
        <div style={{ display: 'flex', gap: 12, color: C.ink2 }}>
          <Icon name="pin" size={17} />
          <Icon name="more" size={17} />
        </div>
      </div>

      <div style={{ padding: '20px 22px 100px' }}>
        <div style={{ fontSize: 11, color: C.ink4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{e.date}</div>
        <h1 style={{
          fontFamily: 'var(--bj-display), Georgia, serif',
          fontWeight: 500, fontSize: 32, lineHeight: 1.08, letterSpacing: -0.4,
          margin: '6px 0 18px', color: C.ink,
        }}>{e.title}</h1>
        <EntryBodyMobile C={C} entry={e} />
      </div>

      {/* Floating formatting toolbar */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 12,
        display: 'flex', gap: 4, padding: '6px 8px',
        background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 12,
        boxShadow: '0 6px 24px rgba(0,0,0,.08)',
        justifyContent: 'space-between',
      }}>
        {['type', 'quote', 'book', 'link', 'mic'].map(i => (
          <button key={i} style={{
            flex: 1, height: 32, borderRadius: 8, border: 'none',
            background: 'transparent', color: C.ink2,
            display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}><Icon name={i} size={16} /></button>
        ))}
      </div>
    </div>
  );
};

const EntryBodyMobile = ({ C, entry }) => {
  const body = entry.body || [
    { kind: 'p', text: entry.excerpt || 'A reflection on grace and the quiet ways it arrives.' },
  ];
  return (
    <div style={{ fontSize: 15.5, lineHeight: 1.7, color: C.ink2 }}>
      {body.map((b, i) => {
        if (b.kind === 'p') return <p key={i} style={{ margin: '0 0 14px', textWrap: 'pretty' }}>{b.text}</p>;
        if (b.kind === 'verse') return (
          <blockquote key={i} style={{
            margin: '18px 0', padding: '14px 16px',
            background: C.goldTint, borderLeft: `2px solid ${C.gold}`, borderRadius: '4px 12px 12px 4px',
            fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 18.5, lineHeight: 1.4, color: C.ink,
          }}>
            <div style={{ fontSize: 10.5, color: C.goldDeep, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'var(--bj-ui), Inter, sans-serif', marginBottom: 4 }}>{b.ref}</div>
            \u201c{b.text}\u201d
          </blockquote>
        );
        if (b.kind === 'callout') return (
          <div key={i} style={{
            margin: '18px 0', padding: '12px 14px',
            background: C.bgInk, border: `1px solid ${C.line}`, borderRadius: 12,
          }}>
            <div style={{ fontSize: 10.5, color: C.ink3, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>{b.label}</div>
            <div style={{ fontSize: 14, color: C.ink, fontStyle: 'italic' }}>{b.text}</div>
          </div>
        );
        return null;
      })}
    </div>
  );
};

/* ───── Mobile Bible ───── */
const MBible = ({ C, chapter }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{ padding: '0 4px 30px' }}>
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, justifyContent: 'center' }}>
        <span style={{ padding: '6px 12px', background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 999, fontSize: 12, color: C.ink2 }}>ESV</span>
        <span style={{ padding: '6px 12px', background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 999, fontSize: 12, color: C.ink2 }}>John 15</span>
        <span style={{ padding: '6px 12px', background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 999, fontSize: 12, color: C.ink2 }}>Aa</span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 10.5, color: C.ink4, textTransform: 'uppercase', letterSpacing: 0.6 }}>The Gospel of John</div>
        <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 36, lineHeight: 1, fontWeight: 500, letterSpacing: -0.5, color: C.ink, margin: '4px 0' }}>Chapter 15</div>
        <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontStyle: 'italic', fontSize: 15, color: C.ink2 }}>{chapter.title}</div>
      </div>
      <div style={{
        padding: '0 22px',
        fontFamily: 'var(--bj-display), Georgia, serif',
        fontSize: 19, lineHeight: 1.65, color: C.ink, textWrap: 'pretty',
      }}>
        {chapter.verses.map(v => (
          <span key={v.n} style={{ background: v.highlight ? C.goldTint : 'transparent', padding: v.highlight ? '1px 3px' : 0, borderRadius: 3 }}>
            <sup style={{ fontFamily: 'var(--bj-ui), Inter, sans-serif', fontSize: 10, color: v.highlight ? C.goldDeep : C.ink4, marginRight: 3, fontWeight: 600 }}>{v.n}</sup>
            {v.text}{' '}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ───── Mobile Prayer ───── */
const MPrayer = ({ C, prayers }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{ padding: '4px 16px 30px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['Active', 'Answered', 'All'].map((t, i) => (
          <span key={t} style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12.5,
            background: i === 0 ? C.ink : C.bgPanel,
            color: i === 0 ? C.bg : C.ink2,
            border: `1px solid ${i === 0 ? C.ink : C.line}`,
          }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {prayers.map(p => (
          <div key={p.id} style={{ padding: 15, background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              {p.status === 'praying' ? (
                <span style={{ width: 7, height: 7, borderRadius: 999, background: C.ember, boxShadow: `0 0 0 4px ${C.ember}1a` }} />
              ) : (
                <span style={{ width: 14, height: 14, borderRadius: 999, background: C.sage, display: 'grid', placeItems: 'center', color: '#fff' }}><Icon name="check" size={9} /></span>
              )}
              <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, color: p.status === 'praying' ? C.ember : C.sage }}>
                {p.status === 'praying' ? 'Praying' : 'Answered'}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 10.5, color: C.ink4 }}>
                {p.streak ? `${p.streak} day streak` : `Answered ${p.answeredOn}`}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 20, fontWeight: 500, color: C.ink, letterSpacing: -0.1 }}>{p.subject}</div>
            <div style={{ fontSize: 13, color: C.ink2, marginTop: 5, textWrap: 'pretty' }}>{p.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ───── Mobile More ───── */
const MMore = ({ C }) => {
  const Icon = window.BJ.Icon;
  const items = [
    { label: 'Highlights', sub: '24 captures', icon: 'spark' },
    { label: 'Research workspace', sub: '3 active boards', icon: 'compass' },
    { label: 'Knowledge graph', sub: '142 nodes', icon: 'graph' },
    { label: 'Reading plans', sub: 'John \u00b7 d12', icon: 'book' },
    { label: 'Greek & Hebrew tools', sub: 'Lexicon, parsing', icon: 'type' },
    { label: 'Voice notes', sub: '8 unread', icon: 'mic' },
    { label: 'Settings', sub: 'Theme, fonts, account', icon: 'settings' },
  ];
  return (
    <div style={{ padding: '4px 16px 30px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden' }}>
        {items.map((it, i) => (
          <div key={it.label} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '13px 14px',
            borderTop: i ? `1px solid ${C.lineSoft}` : 'none',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.goldTint, color: C.goldDeep, display: 'grid', placeItems: 'center' }}><Icon name={it.icon} size={16} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>{it.label}</div>
              <div style={{ fontSize: 11.5, color: C.ink3 }}>{it.sub}</div>
            </div>
            <Icon name="chevR" size={14} style={{ color: C.ink4 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ───── Bottom nav with FAB ───── */
const MBottomNav = ({ C, view, setView, setComposerOpen }) => {
  const Icon = window.BJ.Icon;
  const items = [
    { id: 'home', label: 'Today', icon: 'home' },
    { id: 'bible', label: 'Bible', icon: 'book' },
    { id: 'fab', label: '', icon: 'plus' },
    { id: 'prayer', label: 'Prayers', icon: 'flame' },
    { id: 'more', label: 'More', icon: 'more' },
  ];
  return (
    <div style={{
      position: 'relative',
      borderTop: `1px solid ${C.line}`,
      background: C.bg,
      paddingTop: 6, paddingBottom: 8,
      display: 'flex', alignItems: 'center',
    }}>
      {items.map(it => {
        if (it.id === 'fab') {
          return (
            <div key="fab" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setComposerOpen(true)} style={{
                width: 50, height: 50, borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.gold}, ${C.ember})`,
                color: '#fff', border: 'none', cursor: 'pointer',
                display: 'grid', placeItems: 'center',
                marginTop: -22,
                boxShadow: `0 6px 18px ${C.ember}55, 0 1px 0 rgba(255,255,255,.5) inset`,
              }}><Icon name="pen" size={20} /></button>
            </div>
          );
        }
        const on = view === it.id || (it.id === 'home' && view === 'entry') === false && view === it.id;
        const active = view === it.id;
        return (
          <button key={it.id} onClick={() => setView(it.id)} style={{
            flex: 1, padding: '6px 0',
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: active ? C.ink : C.ink3,
          }}>
            <Icon name={it.icon} size={19} stroke={active ? 1.9 : 1.6} />
            <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ───── Mobile composer (slash commands) ───── */
const MComposer = ({ C, close }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(40,30,20,0.45)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      backdropFilter: 'blur(2px)',
    }} onClick={close}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.bg,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '16px 18px 22px',
        boxShadow: '0 -10px 40px rgba(0,0,0,.18)',
      }}>
        <div style={{ width: 40, height: 4, background: C.line, borderRadius: 999, margin: '0 auto 12px' }} />
        <div style={{ fontSize: 11.5, color: C.ink4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, marginBottom: 6 }}>New entry</div>
        <input placeholder="Title \u2014 e.g. Saturday morning"
          style={{
            width: '100%', padding: '10px 0', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 26, color: C.ink, letterSpacing: -0.3,
          }} />
        <div style={{ fontSize: 14, color: C.ink3, padding: '6px 0 14px', borderBottom: `1px solid ${C.lineSoft}`, fontStyle: 'italic' }}>Type <span style={{ background: C.bgInk, padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontStyle: 'normal' }}>/</span> for verse, prayer, callout, table…</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
          {[
            { c: '/verse', d: 'Insert scripture passage', i: 'book' },
            { c: '/prayer', d: 'Start a prayer card', i: 'flame' },
            { c: '/quote', d: 'Pull quote with attribution', i: 'quote' },
            { c: '/callout', d: 'Highlighted note', i: 'sparkles' },
            { c: '/audio', d: 'Voice memo', i: 'mic' },
          ].map(s => (
            <div key={s.c} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 6px' }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: C.goldTint, color: C.goldDeep, display: 'grid', placeItems: 'center' }}><Icon name={s.i} size={14} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12.5, color: C.ink }}>{s.c}</div>
                <div style={{ fontSize: 11.5, color: C.ink3 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.MobileApp = MobileApp;
