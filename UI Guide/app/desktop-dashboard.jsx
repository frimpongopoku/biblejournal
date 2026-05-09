// Desktop workspace + right context pane.

const { useState, useMemo } = React;

/* ───────────────────────── WORKSPACE ───────────────────────── */
const Workspace = ({ C, view, entries, activeEntry, setActiveEntry, dailyVerse, streak, bibleChapter, prayers, openCollection, collections }) => {
  return (
    <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {view === 'home' && <DashboardView C={C} dailyVerse={dailyVerse} streak={streak} entries={entries} />}
      {view === 'journal' && <JournalView C={C} entries={entries} activeEntry={activeEntry} setActiveEntry={setActiveEntry} openCollection={openCollection} collections={collections} />}
      {view === 'bible' && <BibleView C={C} chapter={bibleChapter} />}
      {view === 'prayer' && <PrayerView C={C} prayers={prayers} />}
      {view === 'highlights' && <HighlightsView C={C} entries={entries} />}
      {view === 'research' && <ResearchView C={C} />}
      {view === 'graph' && <GraphView C={C} />}
    </div>
  );
};

/* ───── Dashboard ───── */
const DashboardView = ({ C, dailyVerse, streak, entries }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{ overflow: 'auto', padding: '32px 56px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <div style={{ fontSize: 12, color: C.ink3, letterSpacing: 0.4, textTransform: 'uppercase' }}>Saturday morning</div>
          <h1 style={{
            fontFamily: 'var(--bj-display), Georgia, serif',
            fontWeight: 500, fontSize: 38, lineHeight: 1.1,
            margin: '4px 0 0',
            letterSpacing: -0.4,
          }}>Good morning, Olu.</h1>
          <div style={{ marginTop: 6, fontSize: 13.5, color: C.ink2 }}>You\u2019ve written 7 of the last 7 mornings. Keep going gently.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PrimaryBtn C={C} icon="pen">New entry</PrimaryBtn>
          <GhostBtn C={C} icon="book">Open Bible</GhostBtn>
        </div>
      </div>

      {/* Daily verse hero */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${C.goldTint} 0%, ${C.bgPanel} 70%)`,
        border: `1px solid ${C.goldSoft}`,
        borderRadius: 18,
        padding: '32px 36px 30px',
        marginBottom: 26,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 220, height: 220, borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${C.gold}33 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.goldDeep || C.gold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>
          <Icon name="sun" size={13} />
          <span>Verse for today</span>
        </div>
        <p style={{
          fontFamily: 'var(--bj-display), Georgia, serif',
          fontSize: 30, lineHeight: 1.32, fontWeight: 400,
          color: C.ink,
          margin: '14px 0 12px',
          maxWidth: 720,
          letterSpacing: -0.2,
        }}>
          \u201c{dailyVerse.text}\u201d
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--bj-display), Georgia, serif',
            fontStyle: 'italic', fontSize: 16, color: C.ink2,
          }}>\u2014 {dailyVerse.ref}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <ChipBtn C={C} icon="pen">Reflect</ChipBtn>
            <ChipBtn C={C} icon="quote">Save</ChipBtn>
            <ChipBtn C={C} icon="headphones">Listen</ChipBtn>
          </div>
        </div>
      </div>

      {/* Two-column row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Continue writing */}
        <Card C={C} title="Continue writing" subtitle="3 entries in progress" icon="pen">
          {entries.slice(0, 3).map((e, i) => (
            <div key={e.id} style={{
              display: 'flex', gap: 14, padding: '13px 4px',
              borderTop: i ? `1px solid ${C.lineSoft}` : 'none',
              alignItems: 'center',
            }}>
              <div style={{
                width: 36, height: 44, borderRadius: 5,
                background: i === 0 ? C.goldSoft : C.bgInk,
                border: `1px solid ${C.line}`,
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--bj-display), Georgia, serif',
                fontSize: 17, color: i === 0 ? C.goldDeep : C.ink3,
                flexShrink: 0,
              }}>{e.title[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13.5, color: C.ink }}>{e.title}</span>
                  {e.pinned && <Icon name="pin" size={11} style={{ color: C.gold }} />}
                </div>
                <div style={{ fontSize: 12.5, color: C.ink3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.excerpt}</div>
              </div>
              <span style={{ fontSize: 11.5, color: C.ink4, flexShrink: 0 }}>{e.date}</span>
            </div>
          ))}
        </Card>

        {/* Reading plan */}
        <Card C={C} title="Reading plan" subtitle="The Gospel of John \u00b7 Day 12 of 21" icon="book">
          <div style={{ marginTop: 6 }}>
            <div style={{
              height: 6, background: C.lineSoft, borderRadius: 999, overflow: 'hidden', marginBottom: 14,
            }}>
              <div style={{ width: '57%', height: '100%', background: C.gold }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <PlanRow C={C} day="Today" passage="John 15:1\u201311" status="now" />
              <PlanRow C={C} day="Tomorrow" passage="John 15:12\u201327" status="next" />
              <PlanRow C={C} day="Mon" passage="John 16:1\u201315" status="up" />
              <PlanRow C={C} day="Tue" passage="John 16:16\u201333" status="up" />
            </div>
          </div>
        </Card>
      </div>

      {/* Prompt + prayer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card C={C} title="Reflection prompt" subtitle="Generated from your week" icon="sparkles">
          <p style={{
            fontFamily: 'var(--bj-display), Georgia, serif',
            fontStyle: 'italic',
            fontSize: 19, lineHeight: 1.45, color: C.ink2,
            margin: '6px 0 14px',
          }}>
            \u201cYou\u2019ve written about waiting four times this month. What is the difference between waiting on God and waiting for an outcome?\u201d
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <ChipBtn C={C} icon="pen">Write 5 minutes</ChipBtn>
            <ChipBtn C={C} icon="mic">Voice note</ChipBtn>
            <ChipBtn C={C} icon="more">New prompt</ChipBtn>
          </div>
        </Card>
        <Card C={C} title="Prayer reminders" subtitle="3 ongoing" icon="flame">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <PrayerMini C={C} subject="Mum\u2019s recovery" days={14} />
            <PrayerMini C={C} subject="Wisdom in the new role" days={7} />
            <PrayerMini C={C} subject="Our small group" days={21} />
          </div>
        </Card>
      </div>
    </div>
  );
};

const Card = ({ C, title, subtitle, icon, children }) => {
  const Icon = window.BJ.Icon;
  return (
    <div style={{
      background: C.bgPanel,
      border: `1px solid ${C.line}`,
      borderRadius: 14,
      padding: 18,
      boxShadow: '0 1px 0 rgba(255,255,255,.4) inset, 0 1px 2px rgba(0,0,0,.02)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name={icon} size={15} style={{ color: C.ink3 }} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, letterSpacing: -0.1 }}>{title}</span>
        </div>
        <span style={{ fontSize: 11.5, color: C.ink4 }}>{subtitle}</span>
      </div>
      {children}
    </div>
  );
};

const PlanRow = ({ C, day, passage, status }) => {
  const isNow = status === 'now';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 10px',
      borderRadius: 9,
      background: isNow ? C.goldTint : 'transparent',
      border: isNow ? `1px solid ${C.goldSoft}` : `1px solid transparent`,
    }}>
      <div style={{ width: 56, fontSize: 11.5, color: isNow ? C.goldDeep : C.ink3, fontWeight: isNow ? 600 : 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>{day}</div>
      <div style={{ flex: 1, fontFamily: 'var(--bj-display), Georgia, serif', fontSize: 16, color: C.ink }}>{passage}</div>
      {isNow && <span style={{ fontSize: 11, color: C.goldDeep, fontWeight: 600 }}>Read \u2192</span>}
    </div>
  );
};

const PrayerMini = ({ C, subject, days }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
    <span style={{
      width: 6, height: 6, borderRadius: 999, background: C.ember, flexShrink: 0,
      boxShadow: `0 0 0 4px ${C.ember}1a`,
    }} />
    <span style={{ flex: 1, fontSize: 13, color: C.ink }}>{subject}</span>
    <span style={{ fontSize: 11.5, color: C.ink4 }}>{days} days</span>
  </div>
);

const PrimaryBtn = ({ C, icon, children, onClick }) => {
  const Icon = window.BJ.Icon;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '8px 13px', height: 34,
      background: C.ink, color: C.bg,
      border: 'none', borderRadius: 9,
      fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(0,0,0,.08)',
    }}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
};

const GhostBtn = ({ C, icon, children, onClick }) => {
  const Icon = window.BJ.Icon;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '8px 13px', height: 34,
      background: C.bgPanel, color: C.ink2,
      border: `1px solid ${C.line}`, borderRadius: 9,
      fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
      cursor: 'pointer',
    }}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
};

const ChipBtn = ({ C, icon, children, onClick }) => {
  const Icon = window.BJ.Icon;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 10px',
      background: C.bgInk, color: C.ink2,
      border: `1px solid ${C.line}`, borderRadius: 7,
      fontSize: 12, fontFamily: 'inherit',
      cursor: 'pointer',
    }}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </button>
  );
};

window.DashboardView = DashboardView;
window.PrimaryBtn = PrimaryBtn;
window.GhostBtn = GhostBtn;
window.ChipBtn = ChipBtn;
window.Card = Card;
