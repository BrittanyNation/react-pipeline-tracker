const { useState, useEffect } = React;

const LANES = [
  "Email / Front-End / Web Dev",
  "Design (UI/UX, Web)",
  "Tech Writing / Copy / Content",
  "Claims / Prior Auth",
  "Billing / Revenue Cycle",
  "Insurance Operations",
  "Bookkeeping",
  "Customer Service (written)",
  "HR Coordination",
];
const STATUSES = ["Applied", "Screening", "Interview", "Offer", "Rejected"];
const KEY = "pipeline-apps-v1";

const SEED = [
  { id: 1, company: "Canvas Medical", title: "Customer Operations Coordinator", lane: "Customer Service (written)", pay: "$65,000-$80,000", status: "Applied" },
  { id: 2, company: "Clarity RCM", title: "Dermatology Revenue Cycle Specialist", lane: "Billing / Revenue Cycle", pay: "$55,000-$60,000", status: "Applied" },
];

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return SEED;
}

function Stat({ value, label }) {
  return (
    <div className="stat"><b>{value}</b><span>{label}</span></div>
  );
}

function AppCard({ app, onAdvance, onReject, onDelete }) {
  return (
    <div className="card">
      <div className="grow">
        <h3>{app.company}</h3>
        <div className="meta">{app.title} · {app.lane}{app.pay ? " · " + app.pay : ""}</div>
      </div>
      <button className={"pill st-" + app.status} title="Tap to move to the next stage"
        onClick={() => onAdvance(app.id)}>{app.status}</button>
      {app.status !== "Rejected" &&
        <button className="mini" title="Mark rejected" onClick={() => onReject(app.id)}>✕ reject</button>}
      <button className="mini" title="Remove" onClick={() => onDelete(app.id)}>🗑</button>
    </div>
  );
}

function App() {
  const [apps, setApps] = useState(load);
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [lane, setLane] = useState(LANES[0]);
  const [pay, setPay] = useState("");
  const [query, setQuery] = useState("");
  const [laneFilter, setLaneFilter] = useState("All lanes");

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(apps)); } catch (e) {}
  }, [apps]);

  function addApp(e) {
    e.preventDefault();
    if (!company.trim() || !title.trim()) return;
    const next = {
      id: Date.now(),
      company: company.trim(),
      title: title.trim(),
      lane,
      pay: pay.trim(),
      status: "Applied",
    };
    setApps([next, ...apps]);
    setCompany(""); setTitle(""); setPay("");
  }

  function advance(id) {
    setApps(apps.map(a => {
      if (a.id !== id) return a;
      const i = STATUSES.indexOf(a.status);
      const nextStatus = i >= 3 ? "Applied" : STATUSES[i + 1]; // Offer wraps back to Applied; Rejected handled separately
      return { ...a, status: a.status === "Rejected" ? "Applied" : nextStatus };
    }));
  }
  function reject(id) { setApps(apps.map(a => a.id === id ? { ...a, status: "Rejected" } : a)); }
  function remove(id) { setApps(apps.filter(a => a.id !== id)); }

  const visible = apps.filter(a => {
    const matchesLane = laneFilter === "All lanes" || a.lane === laneFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || a.company.toLowerCase().includes(q) || a.title.toLowerCase().includes(q);
    return matchesLane && matchesQuery;
  });

  const count = s => apps.filter(a => a.status === s).length;

  return (
    <div>
      <header>
        <div className="wrap">
          <h1>🌼 Pipeline</h1>
          <p>Your job hunt, in one place. Add an application, tap its badge to move it along, and watch the interviews stack up.</p>
          <div className="stats">
            <Stat value={apps.length} label="Applications" />
            <Stat value={count("Screening")} label="Screening" />
            <Stat value={count("Interview")} label="Interviews" />
            <Stat value={count("Offer")} label="Offers" />
          </div>
        </div>
      </header>
      <main className="wrap">
        <div className="panel">
          <h2>Add an application</h2>
          <form className="add" onSubmit={addApp}>
            <div><label>Company</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Canvas Medical" /></div>
            <div><label>Role title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Email Developer" /></div>
            <div><label>Lane</label>
              <select value={lane} onChange={e => setLane(e.target.value)}>
                {LANES.map(l => <option key={l} value={l}>{l}</option>)}
              </select></div>
            <div><label>Pay (as listed)</label>
              <input value={pay} onChange={e => setPay(e.target.value)} placeholder="e.g. $55,000-$60,000" /></div>
            <div className="full"><button className="btn-add" type="submit">Add to pipeline</button></div>
          </form>
        </div>

        <div className="toolbar">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search company or title…" />
          <select value={laneFilter} onChange={e => setLaneFilter(e.target.value)}>
            <option>All lanes</option>
            {LANES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {visible.length === 0
          ? <div className="empty">Nothing here yet — add your first application above.</div>
          : visible.map(a => (
              <AppCard key={a.id} app={a} onAdvance={advance} onReject={reject} onDelete={remove} />
            ))}
      </main>
      <footer>Built with React — components, hooks (useState + useEffect), and localStorage persistence. Your entries save in this browser automatically.</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
