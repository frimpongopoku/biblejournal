// Desktop Journal, Bible, Prayer, Highlights, Research, Graph views.

const { useState: useStateJ } = React;

/* ───── Journal (3-pane: list + reader) ───── */
const JournalView = ({ C, entries, activeEntry, setActiveEntry, openCollection, collections }) => {
  const Icon = window.BJ.Icon;
  const PrimaryBtn = window.PrimaryBtn;
  const ChipBtn = window.ChipBtn;
  const filtered = openCollection === 'all' ? entries : entries.filter(e => e.folder === openCollection);
  const active = entries.find(e => e.id === activeEntry) || entries[0];
  const collName = (collections.find(c => c.id === openCollection) || { name: 'All notes' }).name;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100%', overflow: 'hidden' }}>
      {/* List */}
      <div style={{ borderRight: `1px solid ${C.line}`, background: C.bgSoft, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${C.lineSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: C.ink4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Collection</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginTop: 2 }}>{collName}</div>
            </div>
            <button style={{
              width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.line}`,
              background: C.bgPanel, color: C.ink2, cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}><Icon name="plus" size={14} /></button>
          </div>
          <div style={{ fontSize: 12, color: C.ink3, marginTop: 4 }}>{filtered.length} entries · sorted by edited</div>
        </div>
        <div style={{ overflowY: 'auto', padding: '6px 8px' }}>
          {filtered.map(e => {
            const on = e.id === active.id;
            return (
              <div key={e.id} onClick={() => setActiveEntry(e.id)} style={{
                padding: '10px 12px',
                borderRadius: 9,
                background: on ? C.bgPanel : 'transparent',
                boxShadow: on ? `inset 0 0 0 1px ${C.line}` : 'none',
                marginBottom: 2, cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {e.pinned && <Icon name="pin" size={11} style={{ color: C.gold }} />}
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: C.ink, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                  <span style={{ fontSize: 11, color: C.ink4 }}>{e.date.split(' ')[0]}</span>
                </div>
                <div style={{ fontSize: 12.5, color: C.ink3, margin: '4px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{e.excerpt}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(e.tags || []).map(t => (
                    <span key={t} style={{ fontSize: 10.5, color: C.ink3, background: C.bgInk, border: `1px solid ${C.lineSoft}`, borderRadius: 999, padding: '1px 7px' }}>#{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reader / Editor */}
      <div style={{ overflowY: 'auto' }}>
        {/* Editor toolbar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '10px 36px',
          background: C.bg, borderBottom: `1px solid ${C.lineSoft}`,
        }}>
          <ToolBtn C={C} icon="type" />
          <ToolBtn C={C} label="B" bold />
          <ToolBtn C={C} label="I" italic />
          <ToolBtn C={C} label="H" />
          <div style={{ width: 1, height: 18, background: C.line, margin: '0 4px' }} />
          <ToolBtn C={C} icon="quote" />
          <ToolBtn C={C} icon="link" />
          <ToolBtn C={C} icon="book" />
          <ToolBtn C={C} icon="mic" />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: C.ink4, marginRight: 8 }}>Saved · 2 min ago</span>
          <ChipBtn C={C} icon="eye">Focus</ChipBtn>
        </div>

        <div style={{ padding: '40px 90px 80px', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontSize: 12, color: C.ink4, letterSpacing: 0.4, textTransform: 'uppercase' }}>{active.date}</div>
          <h1 style={{
            fontFamily: 'var(--bj-display), Georgia, serif',
            fontWeight: 500, fontSize: 44, lineHeight: 1.05,
            margin: '8px 0 18px',
            letterSpacing: -0.5,
            color: C.ink,
          }}>{active.title}</h1>

          <EntryBody C={C} entry={active} />

          <div style={{ marginTop: 36, paddingTop: 18, borderTop: `1px solid ${C.lineSoft}`, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: C.ink4, textTransform: 'uppercase', letterSpacing: 0.4 }}>Tags</span>
            {(active.tags || ['grace', 'waiting']).map(t => (
              <span key={t} style={{ fontSize: 12, color: C.ink2, background: C.bgInk, border: `1px solid ${C.line}`, borderRadius: 999, padding: '3px 9px' }}>#{t}</span>
            ))}
            <span style={{ fontSize: 12, color: C.ink4, padding: '3px 9px', cursor: 'pointer' }}>+ add</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EntryBody = ({ C, entry }) => {
  const body = entry.body || [
    { kind: 'p', text: entry.excerpt || 'A reflection on grace and the quiet ways it arrives.' },
    { kind: 'p', text: 'Open this entry to keep writing — every keystroke is saved automatically.' },
  ];
  return (
    <div style={{ fontSize: 16.5, lineHeight: 1.72, color: C.ink2 }}>
      {body.map((b, i) => {
        if (b.kind === 'p') return <p key={i} style={{ margin: '0 0 18px', textWrap: 'pretty' }}>{b.text}</p>;
        if (b.kind === 'h') return null;
        if (b.kind === 'meta') return null;
        if (b.kind === 'verse') return (
          <blockquote key={i} style={{
            margin: '22px 0',
            padding: '18px 22px',
            background: C.goldTint,
            borderLeft: `2px solid ${C.gold}`,
            borderRadius: '4px 12px 12px 4px',
            fontFamily: 'var(--bj-display), Georgia, serif',
            fontSize: 22, lineHeight: 1.42,
            color: C.ink,
            fontStyle: 'normal',
          }}>
            <div style={{ fontSize: 11, color: C.goldDeep, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'var(--bj-ui), Inter, sans-serif', marginBottom: 6 }}>{b.ref}</div>
            \u201c{b.text}\u201d
          </blockquote>
        );
        if (b.kind === 'callout') return (
          <div key={i} style={{
            margin: '22px 0',
            padding: '14px 18px',
            background: C.bgInk,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>{b.label}</div>
            <div style={{ fontSize: 15, color: C.ink, fontStyle: 'italic' }}>{b.text}</div>
          </div>
        );
        return null;
      })}
    </div>
  );
};

const ToolBtn = ({ C, icon, label, bold, italic }) => {
  const Icon = window.BJ.Icon;
  return (
    <button style={{
      width: 28, height: 28, borderRadius: 6,
      background: 'transparent', color: C.ink2,
      border: 'none', cursor: 'pointer',
      display: 'grid', placeItems: 'center',
      fontFamily: bold ? 'Georgia, serif' : (italic ? 'Georgia, serif' : 'inherit'),
      fontWeight: bold ? 700 : 500,
      fontStyle: italic ? 'italic' : 'normal',
      fontSize: 13,
    }}>
      {icon ? <Icon name={icon} size={15} /> : label}
    </button>
  );
};

/* ───── Bible reader ───── */
const BibleView = ({ C, chapter }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{ overflow: 'auto', padding: '28px 64px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 760 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={navPill(C)}><Icon name="chevR" size={14} style={{ transform: 'rotate(180deg)' }} /></button>
            <button style={navPill(C)}><Icon name="chevR" size={14} /></button>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button style={{ ...navPill(C), padding: '6px 12px', width: 'auto' }}>{chapter.book} {chapter.chapter}</button>
            <button style={{ ...navPill(C), padding: '6px 12px', width: 'auto' }}>{chapter.version}</button>
            <button style={navPill(C)}><Icon name="panelL" size={14} /></button>
            <button style={navPill(C)}><Icon name="eye" size={14} /></button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: C.ink4, textTransform: 'uppercase', letterSpacing: 0.6 }}>Gospel of {chapter.book}</div>
          <h1 style={{
            fontFamily: 'var(--bj-display), Georgia, serif',
            fontWeight: 500, fontSize: 52, lineHeight: 1, margin: '6px 0',
            letterSpacing: -0.6, color: C.ink,
          }}>Chapter {chapter.chapter}</h1>
          <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontStyle: 'italic', fontSize: 19, color: C.ink2, marginTop: 4 }}>{chapter.title}</div>
        </div>

        <div style={{
          fontFamily: 'var(--bj-display), Georgia, serif',
          fontSize: 22, lineHeight: 1.7, color: C.ink,
          textWrap: 'pretty',
        }}>
          {chapter.verses.map(v => (
            <span key={v.n} style={{
              background: v.highlight === 'gold' ? C.goldTint : 'transparent',
              padding: v.highlight ? '2px 4px' : 0,
              borderRadius: 4,
              transition: 'background .2s',
            }}>
              <sup style={{ fontFamily: 'var(--bj-ui), Inter, sans-serif', fontSize: 11, color: v.highlight ? C.goldDeep : C.ink4, marginRight: 4, fontWeight: 600, verticalAlign: 'super', position: 'relative', top: -2 }}>{v.n}</sup>
              <span>{v.text} </span>
            </span>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: '18px 0', borderTop: `1px solid ${C.lineSoft}`, display: 'flex', justifyContent: 'space-between', color: C.ink3, fontSize: 13 }}>
          <span>← John 14</span>
          <span>John 16 →</span>
        </div>
      </div>
    </div>
  );
};

const navPill = (C) => ({
  width: 32, height: 32, borderRadius: 8,
  border: `1px solid ${C.line}`, background: C.bgPanel,
  color: C.ink2, cursor: 'pointer',
  display: 'inline-grid', placeItems: 'center',
  fontFamily: 'inherit', fontSize: 13,
});

/* ───── Prayer ───── */
const PrayerView = ({ C, prayers }) => {
  const Icon = window.BJ.Icon;
  const PrimaryBtn = window.PrimaryBtn;
  return (
    <div style={{ overflow: 'auto', padding: '32px 56px 80px', maxWidth: 980, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 36, fontWeight: 500, margin: 0, letterSpacing: -0.4 }}>Prayer journal</h1>
          <div style={{ color: C.ink3, fontSize: 13.5, marginTop: 4 }}>3 ongoing · 2 answered this month</div>
        </div>
        <PrimaryBtn C={C} icon="plus">New prayer</PrimaryBtn>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {['Active', 'Answered', 'Archived', 'All'].map((t, i) => (
          <button key={t} style={{
            padding: '6px 14px', borderRadius: 999,
            background: i === 0 ? C.ink : C.bgPanel,
            color: i === 0 ? C.bg : C.ink2,
            border: `1px solid ${i === 0 ? C.ink : C.line}`,
            fontFamily: 'inherit', fontSize: 12.5, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {prayers.map(p => (
          <div key={p.id} style={{
            background: C.bgPanel,
            border: `1px solid ${C.line}`,
            borderRadius: 14,
            padding: 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {p.status === 'praying' ? (
                <span style={{
                  width: 7, height: 7, borderRadius: 999, background: C.ember,
                  boxShadow: `0 0 0 4px ${C.ember}1a`,
                }} />
              ) : (
                <span style={{
                  width: 16, height: 16, borderRadius: 999, background: C.sage,
                  display: 'grid', placeItems: 'center', color: '#fff',
                }}><Icon name="check" size={11} /></span>
              )}
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, color: p.status === 'praying' ? C.ember : C.sage }}>
                {p.status === 'praying' ? 'Praying' : 'Answered'}
              </span>
              <span style={{ flex: 1 }} />
              <Icon name="more" size={15} style={{ color: C.ink4 }} />
            </div>
            <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 22, fontWeight: 500, color: C.ink, lineHeight: 1.2 }}>{p.subject}</div>
            <div style={{ fontSize: 13.5, color: C.ink2, margin: '8px 0 12px', textWrap: 'pretty' }}>{p.body}</div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: C.ink4, alignItems: 'center' }}>
              <Icon name="clock" size={12} /> <span>Updated {p.updated}</span>
              {p.streak && (<><span>·</span><span>{p.streak} day streak</span></>)}
              {p.answeredOn && (<><span>·</span><span>Answered {p.answeredOn}</span></>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ───── Highlights / Research / Graph (lighter views) ───── */
const HighlightsView = ({ C, entries }) => (
  <div style={{ overflow: 'auto', padding: '32px 56px', maxWidth: 980, margin: '0 auto', width: '100%' }}>
    <h1 style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 36, fontWeight: 500, margin: '0 0 8px', letterSpacing: -0.4 }}>Highlights & revelations</h1>
    <div style={{ color: C.ink3, fontSize: 13.5, marginBottom: 22 }}>Quick captures from your week — taps, voice notes, screenshots.</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      {[
        { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.', when: 'Today, 7:12 AM', tag: 'voice' },
        { ref: 'Romans 8:28', text: 'And we know that for those who love God all things work together for good.', when: 'Yesterday', tag: 'verse' },
        { ref: 'Ecclesiastes 3:11', text: 'He has made everything beautiful in its time.', when: 'Thu, May 7', tag: 'pin' },
        { ref: 'Isaiah 41:10', text: 'Fear not, for I am with you; be not dismayed, for I am your God.', when: 'Wed, May 6', tag: 'voice' },
      ].map((h, i) => (
        <div key={i} style={{ background: C.bgPanel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: C.goldDeep, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{h.ref}</div>
          <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 19, lineHeight: 1.4, color: C.ink, margin: '8px 0 12px' }}>\u201c{h.text}\u201d</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: C.ink4 }}>
            <span>{h.when}</span><span>#{h.tag}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ResearchView = ({ C }) => (
  <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: `radial-gradient(circle at 30% 20%, ${C.goldTint} 0%, ${C.bg} 50%)` }}>
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `radial-gradient(circle, ${C.line} 1px, transparent 1px)`,
      backgroundSize: '32px 32px',
      opacity: 0.6,
    }} />
    <div style={{ position: 'absolute', top: 22, left: 32, fontSize: 12, color: C.ink3 }}>
      <span style={{ fontWeight: 600, color: C.ink }}>Sermon prep — Mercy</span>
      <span style={{ marginLeft: 10 }}>Infinite canvas · 11 cards · 6 connections</span>
    </div>
    {/* Cards */}
    <ResearchCard C={C} top={92} left={64} w={210} title="Hesed" tag="word study" body="Loyal love. Used 246× in OT. Untranslatable in one English word." />
    <ResearchCard C={C} top={130} left={340} w={250} title="Lam 3:22-23" tag="anchor verse" body="Mercy that is new every morning — covenantal, not transactional." accent />
    <ResearchCard C={C} top={300} left={140} w={230} title="Luke 15: prodigal" tag="parallel" body="The father runs. Mercy that pursues, not waits." />
    <ResearchCard C={C} top={330} left={440} w={260} title="Three movements" tag="outline" body="1. Pursued · 2. Received · 3. Multiplied" />
    <ResearchCard C={C} top={500} left={250} w={280} title="Question to land" tag="closing" body="Who, this week, is owed mercy you have been withholding?" />
    {/* edges */}
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <path d="M280 145 C 320 145, 320 170, 360 170" stroke={C.gold} strokeWidth="1.4" fill="none" strokeDasharray="3 4" />
      <path d="M380 220 C 380 260, 280 260, 280 305" stroke={C.gold} strokeWidth="1.4" fill="none" strokeDasharray="3 4" />
      <path d="M460 220 C 480 270, 540 270, 540 335" stroke={C.gold} strokeWidth="1.4" fill="none" strokeDasharray="3 4" />
      <path d="M540 420 C 510 460, 460 470, 420 500" stroke={C.gold} strokeWidth="1.4" fill="none" strokeDasharray="3 4" />
    </svg>
  </div>
);

const ResearchCard = ({ C, top, left, w, title, tag, body, accent }) => (
  <div style={{
    position: 'absolute', top, left, width: w,
    background: accent ? C.goldTint : C.bgPanel,
    border: `1px solid ${accent ? C.goldSoft : C.line}`,
    borderRadius: 12,
    padding: 14,
    boxShadow: '0 4px 18px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03)',
  }}>
    <div style={{ fontSize: 10, color: accent ? C.goldDeep : C.ink4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, marginBottom: 4 }}>{tag}</div>
    <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 19, fontWeight: 500, color: C.ink, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.5 }}>{body}</div>
  </div>
);

const GraphView = ({ C }) => {
  // Pretty deterministic node graph
  const nodes = [
    { id: 'morning', x: 50, y: 35, r: 22, label: 'Morning Light', kind: 'note' },
    { id: 'lam', x: 38, y: 55, r: 16, label: 'Lam 3', kind: 'verse' },
    { id: 'ps30', x: 26, y: 72, r: 11, label: 'Ps 30:5', kind: 'verse' },
    { id: 'grace', x: 60, y: 18, r: 14, label: '#grace', kind: 'tag' },
    { id: 'waiting', x: 75, y: 42, r: 13, label: '#waiting', kind: 'tag' },
    { id: 'onwait', x: 78, y: 60, r: 16, label: 'On Waiting', kind: 'note' },
    { id: 'vine', x: 56, y: 76, r: 18, label: 'The Vine', kind: 'note' },
    { id: 'jn15', x: 70, y: 88, r: 13, label: 'John 15', kind: 'verse' },
    { id: 'identity', x: 88, y: 78, r: 12, label: '#identity', kind: 'tag' },
    { id: 'hesed', x: 18, y: 30, r: 14, label: 'Hesed', kind: 'note' },
    { id: 'covenant', x: 8, y: 48, r: 11, label: '#covenant', kind: 'tag' },
  ];
  const edges = [
    ['morning', 'lam'], ['morning', 'grace'], ['morning', 'waiting'],
    ['lam', 'ps30'], ['onwait', 'waiting'], ['vine', 'jn15'], ['vine', 'identity'],
    ['hesed', 'covenant'], ['hesed', 'lam'], ['onwait', 'morning'],
  ];
  const colorFor = (k) => k === 'note' ? C.ink : (k === 'verse' ? C.gold : C.sage);

  return (
    <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: `radial-gradient(circle at 50% 50%, ${C.bgPanel} 0%, ${C.bg} 70%)` }}>
      <div style={{ position: 'absolute', top: 22, left: 32, fontSize: 12, color: C.ink3 }}>
        <span style={{ fontWeight: 600, color: C.ink }}>Knowledge graph</span>
        <span style={{ marginLeft: 10 }}>142 nodes · 318 connections</span>
      </div>
      <div style={{ position: 'absolute', top: 22, right: 32, fontSize: 11, color: C.ink3, display: 'flex', gap: 14 }}>
        <Legend C={C} color={C.ink} label="Notes" />
        <Legend C={C} color={C.gold} label="Verses" />
        <Legend C={C} color={C.sage} label="Tags" />
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {edges.map(([a, b], i) => {
          const A = nodes.find(n => n.id === a); const B = nodes.find(n => n.id === b);
          return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={C.line} strokeWidth="0.15" />;
        })}
      </svg>
      {nodes.map(n => (
        <div key={n.id} style={{
          position: 'absolute',
          left: `${n.x}%`, top: `${n.y}%`,
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          pointerEvents: 'auto',
        }}>
          <div style={{
            width: n.r * 2, height: n.r * 2, borderRadius: '50%',
            background: n.kind === 'note' ? C.bgPanel : (n.kind === 'verse' ? C.goldTint : C.sageTint),
            border: `1.5px solid ${colorFor(n.kind)}`,
            boxShadow: `0 0 0 6px ${colorFor(n.kind)}10`,
          }} />
          <span style={{ fontSize: 10.5, color: C.ink2, fontWeight: 500, fontFamily: n.kind === 'note' ? 'var(--bj-display), Georgia, serif' : 'var(--bj-ui), Inter, sans-serif', whiteSpace: 'nowrap' }}>{n.label}</span>
        </div>
      ))}
    </div>
  );
};

const Legend = ({ C, color, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
    <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
    {label}
  </span>
);

/* ───── Right context pane ───── */
const RightPanel = ({ C, show, view, crossRefs, aiInsights, entries, activeEntry }) => {
  const Icon = window.BJ.Icon;
  if (!show) return <div />;
  const active = entries.find(e => e.id === activeEntry) || entries[0];

  return (
    <div style={{ borderLeft: `1px solid ${C.line}`, background: C.bgSoft, overflow: 'hidden auto' }}>
      <div style={{ padding: '16px 18px' }}>
        <Section C={C} title="Linked references">
          {crossRefs.map(r => (
            <div key={r.ref} style={{
              padding: '10px 12px', marginBottom: 6,
              background: C.bgPanel, border: `1px solid ${C.lineSoft}`, borderRadius: 10,
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.gold }}>{r.ref}</div>
              <div style={{ fontSize: 12, color: C.ink2, marginTop: 3, lineHeight: 1.45 }}>{r.note}</div>
            </div>
          ))}
        </Section>

        <Section C={C} title="AI insights" icon="sparkles">
          {aiInsights.map((s, i) => (
            <div key={i} style={{
              padding: '10px 12px', marginBottom: 6,
              background: C.goldTint, border: `1px solid ${C.goldSoft}`, borderRadius: 10,
              fontSize: 12, color: C.ink, lineHeight: 1.5,
              fontStyle: i === 0 ? 'normal' : 'normal',
            }}>{s}</div>
          ))}
        </Section>

        <Section C={C} title="Greek & Hebrew">
          <div style={{ background: C.bgPanel, border: `1px solid ${C.lineSoft}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 22, color: C.ink }}>μένω</div>
            <div style={{ fontSize: 11, color: C.ink3, fontStyle: 'italic' }}>menō · to remain, abide, dwell</div>
            <div style={{ fontSize: 12, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>Used 11× in John 15. Suggests not effort but location — to stay where you already are.</div>
          </div>
        </Section>

        <Section C={C} title="Connected notes">
          {entries.slice(0, 3).map(e => (
            <div key={e.id} style={{ display: 'flex', gap: 8, padding: '7px 6px', alignItems: 'center', cursor: 'pointer', borderRadius: 7 }}>
              <Icon name="link" size={13} style={{ color: C.ink4 }} />
              <span style={{ flex: 1, fontSize: 12.5, color: C.ink2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
              <span style={{ fontSize: 10.5, color: C.ink4 }}>{e.date.split(' ')[0]}</span>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
};

const Section = ({ C, title, icon, children }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 10.5, color: C.ink4, textTransform: 'uppercase', letterSpacing: 0.6,
        fontWeight: 600, marginBottom: 8,
      }}>
        {icon && <Icon name={icon} size={11} style={{ color: C.gold }} />}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
};

window.JournalView = JournalView;
window.BibleView = BibleView;
window.PrayerView = PrayerView;
window.HighlightsView = HighlightsView;
window.ResearchView = ResearchView;
window.GraphView = GraphView;
window.RightPanel = RightPanel;
window.Workspace = Workspace;
