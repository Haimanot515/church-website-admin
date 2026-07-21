import React from "react";
import { Link } from "react-router-dom";

const STATS = [
  { label: "Sermons Published", value: "48", note: "+2 this month", to: "/admin/skills/view" },
  { label: "Upcoming Events", value: "6", note: "Next: Sun 9:00 AM", to: "/admin/projects/view" },
  { label: "New Prayer Requests", value: "11", note: "5 unread", to: "/admin/contacts/view" },
  { label: "Giving This Month", value: "$8,240", note: "312 gifts", to: "/admin/users/view" },
  { label: "Active Ministries", value: "9", note: "1 new this quarter", to: "/admin/projects/view" },
  { label: "Testimonies Shared", value: "27", note: "3 pending review", to: "/admin/about/view" },
];

const STATUS_ITEMS = [
  { label: "Landing Page", ok: true },
  { label: "Sermon Series", ok: true },
  { label: "Give Page", ok: true },
  { label: "Events Calendar", ok: false },
  { label: "Media Library", ok: true },
];

const SERMONS_PREVIEW = [
  { title: "Hope in Hard Seasons", desc: "Finding steadiness in Scripture when life feels uncertain.", status: "Published", date: "Jul 13, 2026" },
  { title: "Living Waters", desc: "A study through John, on thirst, grace, and being made new.", status: "Published", date: "Jul 6, 2026" },
  { title: "Faith of Our Fathers", desc: "Lessons from the patriarchs on trust and obedience.", status: "Published", date: "Jun 29, 2026" },
  { title: "Come As You Are", desc: "Welcome, belonging, and the open table of the Gospel.", status: "Published", date: "Jun 22, 2026" },
  { title: "The Divine Liturgy", desc: "Understanding the rhythm and meaning behind our weekly worship.", status: "Draft", date: "Not scheduled" },
];

const UPCOMING_EVENTS = [
  { title: "Sunday Worship", date: "Jul 20, 2026", time: "9:00 & 11:00 AM", location: "Main Sanctuary" },
  { title: "Youth Retreat: Faith & Fire Pits", date: "Jul 25–27, 2026", time: "All weekend", location: "Camp Windridge" },
  { title: "Prayer & Fasting Night", date: "Jul 29, 2026", time: "7:00 PM", location: "Chapel" },
  { title: "Community Outreach: Food Drive", date: "Aug 2, 2026", time: "10:00 AM – 2:00 PM", location: "Fellowship Hall" },
  { title: "Missions Team Info Session", date: "Aug 5, 2026", time: "6:30 PM", location: "Room 204" },
  { title: "Choir & Chanters Rehearsal", date: "Aug 8, 2026", time: "5:00 PM", location: "Main Sanctuary" },
];

const QUICK_ACTIONS = [
  { label: "Add a Sermon", to: "/admin/skills/create" },
  { label: "Add an Event", to: "/admin/projects/create" },
  { label: "Reply to Messages", to: "/admin/contacts/view" },
  { label: "Manage Landing Page", to: "/admin/landing/manage" },
  { label: "Add a Ministry", to: "/admin/projects/create" },
  { label: "Review Testimonies", to: "/admin/about/view" },
];

const GIVING_SNAPSHOT = [
  { label: "This Month", value: "$8,240" },
  { label: "This Quarter", value: "$21,960" },
  { label: "Missions Fund", value: "$3,410" },
  { label: "Building Fund", value: "$5,120" },
  { label: "Total Donors", value: "186" },
  { label: "Average Gift", value: "$26" },
];

const PRAYER_REQUESTS = [
  { quote: "Please pray for my mother's recovery after surgery this week.", name: "Selam T.", time: "2 hours ago" },
  { quote: "Traveling for missions work — safe travel and open hearts.", name: "Biniam K.", time: "Yesterday" },
  { quote: "Give thanks — our family found housing after months of searching.", name: "Marta A.", time: "2 days ago" },
  { quote: "Pray for wisdom as I start a new job next week.", name: "Daniel H.", time: "3 days ago" },
];

const TESTIMONIES = [
  { quote: "This church walked with my family through our hardest year. We are forever grateful.", name: "Selam T.", role: "Member since 2019", status: "Published" },
  { quote: "I found a home here, not just a service to attend.", name: "Biniam K.", role: "Youth Ministry", status: "Published" },
  { quote: "The prayer circle carried me when I couldn't pray for myself.", name: "Marta A.", role: "Member since 2021", status: "Pending Review" },
];

const MINISTRIES = [
  { name: "Youth Ministry", members: 42 },
  { name: "Worship Team", members: 18 },
  { name: "Community Outreach", members: 27 },
  { name: "Prayer Circle", members: 15 },
  { name: "Bible Study Groups", members: 33 },
  { name: "Missions Team", members: 12 },
  { name: "Choir & Chanters", members: 21 },
  { name: "Women's Fellowship", members: 24 },
  { name: "Icon Study Group", members: 9 },
];

const MEDIA_LIBRARY = [
  { title: "Joey's Journey: A Testimony of Coming Home", views: "1.2K views", type: "Testimony" },
  { title: "Sunday Highlights: Hope in Hard Seasons, Week 3", views: "845 views", type: "Highlight Reel" },
  { title: "Behind the Scenes: Our Worship Team at Rehearsal", views: "612 views", type: "Behind the Scenes" },
  { title: "Youth Retreat Recap: Faith, Fire Pits & Fellowship", views: "980 views", type: "Recap" },
  { title: "Missions Update: Stories from the Field", views: "530 views", type: "Update" },
];

const ACTIVITY_LOG = [
  { time: "09:42", text: "New prayer request submitted by Selam T." },
  { time: "08:15", text: "Sermon “The Divine Liturgy” saved as draft" },
  { time: "07:50", text: "New testimony submitted by Marta A., pending review" },
  { time: "Yesterday", text: "3 new givers this week" },
  { time: "Yesterday", text: "Event “Youth Retreat” updated" },
  { time: "Yesterday", text: "Video “Missions Update” uploaded to Media Library" },
  { time: "2 days ago", text: "Home hero image replaced" },
  { time: "3 days ago", text: "New member joined Bible Study Groups" },
];

const AdminDashboard = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="church-admin">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Nunito+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .church-admin {
          --sky-low: #f3f8fa;
          --navy: #1c3a52;
          --navy-deep: #0f2438;
          --slate: #3d5a6c;
          --accent: #b5451f;
          --deep-red: #7a1010;
          --deep-red-2: #591414;
          --white: #ffffff;
          font-family: 'Nunito Sans', sans-serif;
          color: var(--navy);
          -webkit-font-smoothing: antialiased;
        }
        .church-admin * { box-sizing: border-box; }
        .church-admin .display { font-family: 'Cormorant Garamond', serif; }
        .church-admin .eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--accent);
        }
        .church-admin a { text-decoration: none; }
        .church-admin section { padding: 56px 0; border-bottom: 1px solid rgba(28,58,82,0.08); }
        .church-admin section:first-of-type { padding-top: 0; }
        .church-admin section:last-of-type { border-bottom: none; }
        .church-admin .section-head {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 30px; flex-wrap: wrap; gap: 10px;
        }
      `}</style>

      <section>
        <h1 className="display" style={{ fontSize: "clamp(2.6rem, 5vw, 4.2rem)", fontWeight: 700, lineHeight: 1.08, margin: "16px 0 18px 0", color: "var(--navy-deep)" }}>
          Welcome back to Harbor&nbsp;Light
        </h1>
        <p style={{ fontSize: "1.3rem", color: "var(--slate)", lineHeight: 1.6, maxWidth: "640px" }}>
          Here's what's happening across the church site this week — sermons, events,
          ministries, giving, and the people we're praying for, all in one place.
        </p>
      </section>

      <section style={{ borderBottom: "none" }}>
        <div style={{ background: "linear-gradient(180deg, var(--deep-red) 0%, var(--deep-red-2) 100%)", borderRadius: "10px", padding: "22px 30px", display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: "14px" }}>
          <span className="eyebrow" style={{ color: "#f0c9c0", marginRight: "26px" }}>Site Status</span>
          {STATUS_ITEMS.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "30px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.ok ? "#f0ded6" : "#e5793f", boxShadow: item.ok ? "0 0 0 4px rgba(240,222,214,0.2)" : "0 0 0 4px rgba(229,121,63,0.25)", flexShrink: 0 }} />
              <span style={{ color: "#f7e9e4", fontSize: "1.05rem", fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
          <span style={{ marginLeft: "auto", color: "#d59d90", fontSize: "0.9rem" }}>Updated just now</span>
        </div>
      </section>

      <section>
        <h3 className="eyebrow" style={{ marginBottom: "30px" }}>This Week, at a Glance</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          {STATS.map(({ label, value, note, to }) => (
            <Link key={label} to={to} style={{ display: "block", borderRadius: "10px", padding: "26px 22px", background: "linear-gradient(160deg, var(--deep-red) 0%, var(--deep-red-2) 100%)", color: "#ffffff" }}>
              <div className="display" style={{ fontSize: "2.8rem", fontWeight: 700, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: "10px", color: "#f7e9e4" }}>{label}</div>
              <div style={{ marginTop: "6px", fontSize: "0.78rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: "#e0a99c" }}>{note}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Upcoming Events</h3>
          <Link to="/admin/projects/view" className="eyebrow" style={{ color: "var(--navy)" }}>View All →</Link>
        </div>
        {UPCOMING_EVENTS.map((e, i) => (
          <div key={e.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", padding: "22px 0", borderTop: i === 0 ? "1px solid rgba(28,58,82,0.12)" : "none", borderBottom: "1px solid rgba(28,58,82,0.12)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <h4 className="display" style={{ fontSize: "1.9rem", fontWeight: 700, margin: "0 0 4px 0", color: "var(--navy-deep)" }}>{e.title}</h4>
              <p style={{ fontSize: "1rem", color: "var(--slate)", margin: 0 }}>{e.location}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--navy)" }}>{e.date}</div>
              <div className="eyebrow" style={{ marginTop: "4px" }}>{e.time}</div>
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Recent Sermons</h3>
          <Link to="/admin/skills/view" className="eyebrow" style={{ color: "var(--navy)" }}>View All →</Link>
        </div>
        {SERMONS_PREVIEW.map((s, i) => (
          <div key={s.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", padding: "28px 0", borderTop: i === 0 ? "1px solid rgba(28,58,82,0.12)" : "none", borderBottom: "1px solid rgba(28,58,82,0.12)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "260px" }}>
              <h4 className="display" style={{ fontSize: "2.2rem", fontWeight: 700, margin: "0 0 8px 0", color: "var(--deep-red)" }}>{s.title}</h4>
              <p style={{ fontSize: "1.15rem", color: "var(--slate)", margin: "0 0 6px 0", lineHeight: 1.5 }}>{s.desc}</p>
              <p className="eyebrow" style={{ margin: 0 }}>{s.date}</p>
            </div>
            <span className="eyebrow" style={{ flexShrink: 0, padding: "8px 16px", borderRadius: "20px", background: s.status === "Published" ? "rgba(181,69,31,0.12)" : "rgba(122,16,16,0.1)", color: s.status === "Published" ? "var(--accent)" : "var(--deep-red)" }}>{s.status}</span>
          </div>
        ))}
      </section>

      <section>
        <h3 className="eyebrow" style={{ marginBottom: "30px" }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
          {QUICK_ACTIONS.map(({ label, to }, i) => (
            <Link
              key={label}
              to={to}
              style={{
                display: "block", padding: "26px 24px", borderRadius: "10px",
                background: i % 2 === 0 ? "linear-gradient(180deg, var(--navy) 0%, var(--navy-deep) 100%)" : "linear-gradient(180deg, var(--deep-red) 0%, var(--deep-red-2) 100%)",
                color: "#eaf3f8", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700,
              }}
            >
              {label} <span style={{ color: "#f0c9c0" }}>→</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h3 className="eyebrow" style={{ marginBottom: "30px" }}>Giving Snapshot</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "18px" }}>
          {GIVING_SNAPSHOT.map((g) => (
            <div key={g.label} style={{ borderRadius: "10px", padding: "24px 20px", background: "var(--deep-red)", color: "#ffffff", textAlign: "center" }}>
              <div className="display" style={{ fontSize: "2.2rem", fontWeight: 700 }}>{g.value}</div>
              <div className="eyebrow" style={{ marginTop: "8px", color: "#f0c9c0" }}>{g.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Prayer Requests Awaiting Reply</h3>
          <Link to="/admin/contacts/view" className="eyebrow" style={{ color: "var(--navy)" }}>View All →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "30px" }}>
          {PRAYER_REQUESTS.map((p, i) => (
            <div key={i} style={{ borderTop: "2px solid var(--deep-red)", paddingTop: "18px" }}>
              <p className="display" style={{ fontSize: "1.4rem", fontStyle: "italic", fontWeight: 600, color: "var(--navy-deep)", lineHeight: 1.5, margin: "0 0 14px 0" }}>"{p.quote}"</p>
              <p style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--navy)" }}>{p.name}</p>
              <p className="eyebrow" style={{ marginTop: "2px" }}>{p.time}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Testimonies</h3>
          <Link to="/admin/about/view" className="eyebrow" style={{ color: "var(--navy)" }}>View All →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "30px" }}>
          {TESTIMONIES.map((t, i) => (
            <div key={i} style={{ borderTop: "2px solid var(--navy)", paddingTop: "18px" }}>
              <p className="display" style={{ fontSize: "1.4rem", fontStyle: "italic", fontWeight: 600, color: "var(--navy-deep)", lineHeight: 1.5, margin: "0 0 14px 0" }}>"{t.quote}"</p>
              <p style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--navy)" }}>{t.name}</p>
              <p className="eyebrow" style={{ marginTop: "2px", marginBottom: "10px" }}>{t.role}</p>
              <span
                className="eyebrow"
                style={{ padding: "6px 14px", borderRadius: "20px", background: t.status === "Published" ? "rgba(181,69,31,0.12)" : "rgba(122,16,16,0.1)", color: t.status === "Published" ? "var(--accent)" : "var(--deep-red)" }}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Ministries & Groups</h3>
          <Link to="/admin/projects/view" className="eyebrow" style={{ color: "var(--navy)" }}>Manage →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {MINISTRIES.map((m) => (
            <div key={m.name} style={{ border: "1px solid rgba(28,58,82,0.15)", borderRadius: "8px", padding: "18px 20px" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--navy-deep)" }}>{m.name}</div>
              <div className="eyebrow" style={{ marginTop: "6px" }}>{m.members} members</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Media Library</h3>
          <Link to="/admin/skills/view" className="eyebrow" style={{ color: "var(--navy)" }}>View All →</Link>
        </div>
        {MEDIA_LIBRARY.map((v, i) => (
          <div key={v.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", padding: "18px 0", borderTop: i === 0 ? "1px solid rgba(28,58,82,0.12)" : "none", borderBottom: "1px solid rgba(28,58,82,0.12)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "240px" }}>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--navy-deep)" }}>{v.title}</div>
              <div className="eyebrow" style={{ marginTop: "4px" }}>{v.type}</div>
            </div>
            <div style={{ fontSize: "0.95rem", color: "var(--slate)", flexShrink: 0 }}>{v.views}</div>
          </div>
        ))}
      </section>

      <section>
        <h3 className="eyebrow" style={{ marginBottom: "26px" }}>Activity Log</h3>
        <div>
          {ACTIVITY_LOG.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "24px", padding: "16px 0", borderBottom: i < ACTIVITY_LOG.length - 1 ? "1px solid rgba(28,58,82,0.1)" : "none", alignItems: "baseline" }}>
              <span className="eyebrow" style={{ width: "110px", flexShrink: 0 }}>{item.time}</span>
              <span style={{ fontSize: "1.1rem", color: "var(--navy)" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ borderBottom: "none", textAlign: "center", padding: "70px 0 40px" }}>
        <p className="display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 600, color: "var(--navy-deep)", margin: 0 }}>
          Shepherding a congregation, one page at a time.
        </p>
      </section>
    </div>
  );
};

export default AdminDashboard;