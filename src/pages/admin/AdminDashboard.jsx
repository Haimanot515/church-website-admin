import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";

// Every number and list below is fetched from the backend — nothing here
// is hardcoded placeholder content. Each entry maps to a real model/route
// that already exists elsewhere in this admin panel.
const CONTENT_CONFIG = [
  { key: "posts", label: "Posts", to: "/admin/posts/view" },
  { key: "media", label: "Media", to: "/admin/media/view" },
  { key: "categories", label: "Categories", to: "/admin/categories/view" },
  { key: "languages", label: "Languages", to: "/admin/languages/view" },
  { key: "churches", label: "Churches", to: "/admin/churches/view" },
  { key: "churchPersons", label: "Church Persons", to: "/admin/church-persons/view" },
  { key: "churchStory", label: "Church Story Chapters", to: "/admin/church-story/view" },
  { key: "services", label: "Services", to: "/admin/services/view" },
  { key: "promotions", label: "Promotions", to: "/admin/promotions/view" },
  { key: "subscribers", label: "Subscribers", to: "/admin/subscribers/view" },
  { key: "users", label: "Users", to: "/admin/users/view" },
];

// Shared cap for every "recent" list below (Posts, Promotions, Messages,
// Subscribers) so each section pulls the same number of items and the
// "Showing X of Y" labels stay consistent.
const RECENT_LIMIT = 5;

const QUICK_ACTIONS = [
  { label: "Create Post", to: "/admin/posts/create" },
  { label: "Create Promotion", to: "/admin/promotions/create" },
  { label: "Add Subscriber", to: "/admin/subscribers/create" },
  { label: "Reply to Messages", to: "/admin/contacts/view" },
  { label: "Create Church Story Chapter", to: "/admin/church-story/create" },
  { label: "Create Media", to: "/admin/media/create" },
];

const AdminDashboard = () => {
  // Greeting is based on Ethiopian time (Africa/Addis_Ababa), not the
  // visitor's local browser time, since this is a church admin panel
  // for a congregation there.
  const ethiopianHour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Addis_Ababa",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date()),
    10
  );

  const greeting =
    ethiopianHour >= 5 && ethiopianHour < 12
      ? "Good morning"
      : ethiopianHour >= 12 && ethiopianHour < 17
      ? "Good afternoon"
      : ethiopianHour >= 17 && ethiopianHour < 21
      ? "Good evening"
      : "Good night";

  const [contentCounts, setContentCounts] = useState({});
  const [contentErrors, setContentErrors] = useState({});
  const [contentLoading, setContentLoading] = useState(true);

  const [recentPosts, setRecentPosts] = useState([]);
  const [postsError, setPostsError] = useState(false);

  const [recentPromotions, setRecentPromotions] = useState([]);
  const [promotionsError, setPromotionsError] = useState(false);

  const [recentThreads, setRecentThreads] = useState([]);
  const [threadsError, setThreadsError] = useState(false);

  const [recentSubscribers, setRecentSubscribers] = useState([]);
  const [subscribersError, setSubscribersError] = useState(false);

  const [recentMedia, setRecentMedia] = useState([]);
  const [mediaError, setMediaError] = useState(false);

  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    fetchContentCounts();
    fetchRecentActivity();
  }, []);

  const fetchContentCounts = async () => {
    setContentLoading(true);

    const results = await Promise.allSettled([
      API.get("/posts", { params: { page: 1, limit: 1 } }),
      API.get("/media"),
      API.get("/categories"),
      API.get("/languages"),
      API.get("/churches"),
      API.get("/church-persons"),
      API.get("/church-story", { params: { page: 1, limit: 1 } }),
      API.get("/services"),
      API.get("/promotions"),
      API.get("/subscribers"),
      API.get("/admin/users", { params: { page: 1, limit: 1 } }),
    ]);

    const [
      postsRes,
      mediaRes,
      categoriesRes,
      languagesRes,
      churchesRes,
      churchPersonsRes,
      churchStoryRes,
      servicesRes,
      promotionsRes,
      subscribersRes,
      usersRes,
    ] = results;

    const nextCounts = {};
    const nextErrors = {};

    if (postsRes.status === "fulfilled") {
      nextCounts.posts = postsRes.value.data.totalPosts ?? postsRes.value.data.posts?.length ?? 0;
    } else {
      nextErrors.posts = true;
    }

    if (mediaRes.status === "fulfilled") {
      nextCounts.media = mediaRes.value.data.length ?? 0;
    } else {
      nextErrors.media = true;
    }

    if (categoriesRes.status === "fulfilled") {
      nextCounts.categories = categoriesRes.value.data.length ?? 0;
    } else {
      nextErrors.categories = true;
    }

    if (languagesRes.status === "fulfilled") {
      nextCounts.languages = languagesRes.value.data.length ?? 0;
    } else {
      nextErrors.languages = true;
    }

    if (churchesRes.status === "fulfilled") {
      nextCounts.churches = churchesRes.value.data.length ?? 0;
    } else {
      nextErrors.churches = true;
    }

    if (churchPersonsRes.status === "fulfilled") {
      nextCounts.churchPersons = churchPersonsRes.value.data.length ?? 0;
    } else {
      nextErrors.churchPersons = true;
    }

    if (churchStoryRes.status === "fulfilled") {
      nextCounts.churchStory = churchStoryRes.value.data.stories?.length ?? 0;
    } else {
      nextErrors.churchStory = true;
    }

    if (servicesRes.status === "fulfilled") {
      nextCounts.services = servicesRes.value.data.length ?? 0;
    } else {
      nextErrors.services = true;
    }

    if (promotionsRes.status === "fulfilled") {
      nextCounts.promotions = promotionsRes.value.data.length ?? 0;
    } else {
      nextErrors.promotions = true;
    }

    if (subscribersRes.status === "fulfilled") {
      nextCounts.subscribers = subscribersRes.value.data.length ?? 0;
    } else {
      nextErrors.subscribers = true;
    }

    if (usersRes.status === "fulfilled") {
      nextCounts.users = usersRes.value.data.totalUsers ?? usersRes.value.data.users?.length ?? 0;
    } else {
      nextErrors.users = true;
    }

    setContentCounts(nextCounts);
    setContentErrors(nextErrors);
    setContentLoading(false);
  };

  const fetchRecentActivity = async () => {
    setRecentLoading(true);

    const results = await Promise.allSettled([
      API.get("/posts", { params: { page: 1, limit: RECENT_LIMIT } }),
      API.get("/promotions"),
      API.get("/admin/threads", { params: { limit: RECENT_LIMIT } }),
      API.get("/subscribers"),
      API.get("/media"),
    ]);

    const [postsRes, promotionsRes, threadsRes, subscribersRes, mediaRes] = results;

    if (postsRes.status === "fulfilled") {
      setRecentPosts(postsRes.value.data.posts ?? []);
    } else {
      setPostsError(true);
    }

    if (promotionsRes.status === "fulfilled") {
      setRecentPromotions(promotionsRes.value.data.slice(0, RECENT_LIMIT));
    } else {
      setPromotionsError(true);
    }

    if (threadsRes.status === "fulfilled") {
      setRecentThreads(threadsRes.value.data.threads ?? []);
    } else {
      setThreadsError(true);
    }

    if (subscribersRes.status === "fulfilled") {
      setRecentSubscribers(subscribersRes.value.data.slice(0, RECENT_LIMIT));
    } else {
      setSubscribersError(true);
    }

    if (mediaRes.status === "fulfilled") {
      setRecentMedia(mediaRes.value.data.slice(0, RECENT_LIMIT));
    } else {
      setMediaError(true);
    }

    setRecentLoading(false);
  };

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
          {greeting}
        </h1>
        <p style={{ fontSize: "1.3rem", color: "var(--slate)", lineHeight: 1.6, maxWidth: "640px" }}>
          Here's a live look at your site's content, straight from the database.
        </p>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Content Library</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>Live counts from the database</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          {CONTENT_CONFIG.map(({ key, label, to }) => (
            <Link
              key={key}
              to={to}
              style={{
                display: "block",
                borderRadius: "10px",
                padding: "26px 22px",
                background: "linear-gradient(180deg, var(--navy) 0%, var(--navy-deep) 100%)",
                color: "#eaf3f8",
              }}
            >
              <div className="display" style={{ fontSize: "2.8rem", fontWeight: 700, lineHeight: 1 }}>
                {contentLoading ? (
                  <span style={{ color: "rgba(234,243,248,0.4)" }}>—</span>
                ) : contentErrors[key] ? (
                  <span style={{ fontSize: "1.1rem", fontFamily: "'IBM Plex Mono', monospace", color: "#e5793f" }}>
                    Failed to load
                  </span>
                ) : (
                  contentCounts[key] ?? 0
                )}
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: "10px", color: "#eaf3f8" }}>
                Total {label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Recent Posts</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>
            {!contentLoading && !contentErrors.posts &&
              `Showing ${Math.min(recentPosts.length, RECENT_LIMIT)} of ${contentCounts.posts ?? 0}`}
          </span>
          <Link to="/admin/posts/view" className="eyebrow" style={{ color: "var(--navy)" }}>View All</Link>
        </div>
        {recentLoading ? (
          <p style={{ color: "var(--slate)" }}>Loading...</p>
        ) : postsError ? (
          <p style={{ color: "var(--deep-red)" }}>Failed to load posts.</p>
        ) : recentPosts.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>No posts yet.</p>
        ) : (
          recentPosts.map((p, i) => (
            <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", padding: "28px 0", borderTop: i === 0 ? "1px solid rgba(28,58,82,0.12)" : "none", borderBottom: "1px solid rgba(28,58,82,0.12)", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1, minWidth: "260px" }}>
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    style={{ width: "90px", height: "70px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                  />
                )}
                <div>
                  <h4 className="display" style={{ fontSize: "2.2rem", fontWeight: 700, margin: "0 0 8px 0", color: "var(--deep-red)" }}>{p.title}</h4>
                  <p style={{ fontSize: "1.15rem", color: "var(--slate)", margin: "0 0 6px 0", lineHeight: 1.5 }}>{p.category?.name || "Uncategorized"}</p>
                  <p className="eyebrow" style={{ margin: 0 }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
              <span className="eyebrow" style={{ flexShrink: 0, padding: "8px 16px", borderRadius: "20px", background: p.status === "published" ? "rgba(181,69,31,0.12)" : "rgba(122,16,16,0.1)", color: p.status === "published" ? "var(--accent)" : "var(--deep-red)" }}>{p.status}</span>
            </div>
          ))
        )}
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
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Recent Promotions</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>
            {!contentLoading && !contentErrors.promotions &&
              `Showing ${Math.min(recentPromotions.length, RECENT_LIMIT)} of ${contentCounts.promotions ?? 0}`}
          </span>
          <Link to="/admin/promotions/view" className="eyebrow" style={{ color: "var(--navy)" }}>View All</Link>
        </div>
        {recentLoading ? (
          <p style={{ color: "var(--slate)" }}>Loading...</p>
        ) : promotionsError ? (
          <p style={{ color: "var(--deep-red)" }}>Failed to load promotions.</p>
        ) : recentPromotions.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>No promotions yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "30px" }}>
            {recentPromotions.map((promo) => (
              <div key={promo._id} style={{ borderTop: "2px solid var(--deep-red)", paddingTop: "18px" }}>
                {promo.photo && (
                  <img
                    src={promo.photo}
                    alt={promo.title}
                    style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "14px" }}
                  />
                )}
                <p style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 8px 0", color: "var(--navy-deep)" }}>{promo.title}</p>
                <p style={{ fontSize: "1rem", color: "var(--slate)", lineHeight: 1.5, margin: 0 }}>{promo.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Recent Media</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>
            {!contentLoading && !contentErrors.media &&
              `Showing ${Math.min(recentMedia.length, RECENT_LIMIT)} of ${contentCounts.media ?? 0}`}
          </span>
          <Link to="/admin/media/view" className="eyebrow" style={{ color: "var(--navy)" }}>View All</Link>
        </div>
        {recentLoading ? (
          <p style={{ color: "var(--slate)" }}>Loading...</p>
        ) : mediaError ? (
          <p style={{ color: "var(--deep-red)" }}>Failed to load media.</p>
        ) : recentMedia.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>No media yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {recentMedia.map((item) => (
              <div key={item._id}>
                {item.mediaType === "photo" && item.mediaUrl ? (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }}
                  />
                ) : item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "140px", borderRadius: "8px", marginBottom: "10px", background: "rgba(28,58,82,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="eyebrow">{item.mediaType || "Media"}</span>
                  </div>
                )}
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--navy-deep)" }}>{item.title}</div>
                <div className="eyebrow" style={{ marginTop: "4px" }}>{item.category?.name || "Uncategorized"}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">Messages Awaiting Reply</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>
            {!threadsError && !recentLoading && `Showing ${recentThreads.length} most recent`}
          </span>
          <Link to="/admin/contacts/view" className="eyebrow" style={{ color: "var(--navy)" }}>View All</Link>
        </div>
        {recentLoading ? (
          <p style={{ color: "var(--slate)" }}>Loading...</p>
        ) : threadsError ? (
          <p style={{ color: "var(--deep-red)" }}>Failed to load messages.</p>
        ) : recentThreads.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>No messages yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "30px" }}>
            {recentThreads.map((t) => (
              <div key={t._id} style={{ borderTop: "2px solid var(--navy)", paddingTop: "18px" }}>
                <p style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--navy)" }}>{t.userName}</p>
                <p style={{ fontSize: "1rem", color: "var(--slate)", lineHeight: 1.5, margin: "0 0 8px 0" }}>{t.lastMessage}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="eyebrow">
                    {t.lastMessageAt ? new Date(t.lastMessageAt).toLocaleString() : "—"}
                  </span>
                  {t.unreadForAdmin > 0 && (
                    <span className="eyebrow" style={{ padding: "4px 10px", borderRadius: "20px", background: "rgba(122,16,16,0.1)", color: "var(--deep-red)" }}>
                      {t.unreadForAdmin} unread
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ borderBottom: "none" }}>
        <div className="section-head">
          <h3 className="eyebrow">Recent Subscribers</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>
            {!contentLoading && !contentErrors.subscribers &&
              `Showing ${Math.min(recentSubscribers.length, RECENT_LIMIT)} of ${contentCounts.subscribers ?? 0}`}
          </span>
          <Link to="/admin/subscribers/view" className="eyebrow" style={{ color: "var(--navy)" }}>View All</Link>
        </div>
        {recentLoading ? (
          <p style={{ color: "var(--slate)" }}>Loading...</p>
        ) : subscribersError ? (
          <p style={{ color: "var(--deep-red)" }}>Failed to load subscribers.</p>
        ) : recentSubscribers.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>No subscribers yet.</p>
        ) : (
          recentSubscribers.map((s, i) => (
            <div key={s._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", padding: "18px 0", borderTop: i === 0 ? "1px solid rgba(28,58,82,0.12)" : "none", borderBottom: "1px solid rgba(28,58,82,0.12)", flexWrap: "wrap" }}>
              <div style={{ fontSize: "1.05rem", color: "var(--navy-deep)", fontWeight: 700 }}>{s.email}</div>
              <div style={{ fontSize: "0.95rem", color: "var(--slate)", flexShrink: 0 }}>
                {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : "—"}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;