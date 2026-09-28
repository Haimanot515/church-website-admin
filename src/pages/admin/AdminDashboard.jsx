import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";

const CONTENT_CONFIG = [
  { key: "posts", to: "/admin/posts/view" },
  { key: "media", to: "/admin/media/view" },
  { key: "categories", to: "/admin/categories/view" },
  { key: "languages", to: "/admin/languages/view" },
  { key: "churches", to: "/admin/churches/view" },
  { key: "churchPersons", to: "/admin/church-persons/view" },
  { key: "churchStory", to: "/admin/church-story/view" },
  { key: "services", to: "/admin/services/view" },
  { key: "promotions", to: "/admin/promotions/view" },
  { key: "subscribers", to: "/admin/subscribers/view" },
  { key: "users", to: "/admin/users/view" },
];

const RECENT_LIMIT = 5;

const QUICK_ACTIONS = [
  { key: "createPost", to: "/admin/posts/create" },
  { key: "createPromotion", to: "/admin/promotions/create" },
  { key: "addSubscriber", to: "/admin/subscribers/create" },
  { key: "replyToMessages", to: "/admin/contacts/view" },
  { key: "createChurchStoryChapter", to: "/admin/church-story/create" },
  { key: "createMedia", to: "/admin/media/create" },
];

const AdminDashboard = () => {
  const { t } = useTranslation();

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
      ? t("dashboard.greeting.morning")
      : ethiopianHour >= 12 && ethiopianHour < 17
      ? t("dashboard.greeting.afternoon")
      : ethiopianHour >= 17 && ethiopianHour < 21
      ? t("dashboard.greeting.evening")
      : t("dashboard.greeting.night");

  const [contentCounts, setContentCounts] = useState({});
  const [contentErrors, setContentErrors] = useState({});
  const [contentLoading, setContentLoading] = useState(true);

  const [recentPosts, setRecentPosts] = useState([]);
  const [postsError, setPostsError] = useState(false);

  const [recentPromotions, setRecentPromotions] = useState([]);
  const [promotionsError, setPromotionsError] = useState(false);

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
      API.get("/subscribers"),
      API.get("/media"),
    ]);

    const [postsRes, promotionsRes, subscribersRes, mediaRes] = results;

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

        .church-admin .qa-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          grid-auto-rows: 96px;
          gap: 18px;
        }
        .church-admin .qa-btn {
          display: flex; align-items: center;
          height: 100%;
          padding: 0 26px;
          border-radius: 10px;
          color: #eaf3f8;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 700; line-height: 1.2;
          overflow: hidden;
        }

        .church-admin .rp-list {
          background: var(--white);
          border: 1px solid rgba(28,58,82,0.12);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(15,36,56,0.04), 0 10px 28px rgba(15,36,56,0.06);
        }
        .church-admin .rp-row {
          display: grid;
          grid-template-columns: 132px 1fr auto;
          align-items: center;
          gap: 24px;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(28,58,82,0.08);
          transition: background 0.15s ease;
        }
        .church-admin .rp-row:last-child { border-bottom: none; }
        .church-admin .rp-row:hover { background: var(--sky-low); }
        .church-admin .rp-thumb {
          width: 132px; height: 88px;
          border-radius: 8px;
          object-fit: cover;
          display: block;
          background: rgba(28,58,82,0.08);
        }
        .church-admin .rp-thumb-empty {
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 700;
          color: var(--slate);
        }
        .church-admin .rp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; font-weight: 700; line-height: 1.2;
          color: var(--navy-deep);
          margin: 0 0 10px 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .church-admin .rp-meta {
          display: flex; align-items: center; flex-wrap: wrap; gap: 12px;
          font-size: 0.9rem; color: var(--slate);
        }
        .church-admin .rp-category {
          padding: 3px 10px;
          border-radius: 6px;
          background: rgba(28,58,82,0.07);
          color: var(--navy);
          font-size: 0.82rem; font-weight: 600;
        }
        .church-admin .rp-status {
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.82rem; font-weight: 700;
          text-transform: capitalize;
          background: rgba(122,16,16,0.08);
          color: var(--deep-red);
        }
        .church-admin .rp-status.published { background: #e3f3ec; color: #1f6b4f; }

        .church-admin .pr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .church-admin .pr-card {
          display: flex; flex-direction: column;
          background: var(--white);
          border: 1px solid rgba(28,58,82,0.12);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(15,36,56,0.04), 0 10px 28px rgba(15,36,56,0.06);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .church-admin .pr-card:hover {
          box-shadow: 0 2px 4px rgba(15,36,56,0.06), 0 16px 36px rgba(15,36,56,0.12);
          transform: translateY(-2px);
        }
        .church-admin .pr-media {
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          display: block;
          background: linear-gradient(180deg, var(--navy) 0%, var(--navy-deep) 100%);
          border-bottom: 3px solid var(--deep-red);
        }
        .church-admin .pr-media-empty {
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem; font-weight: 700;
          color: rgba(234,243,248,0.85);
        }
        .church-admin .pr-body { padding: 20px 22px 24px; }
        .church-admin .pr-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 700; line-height: 1.2;
          color: var(--navy-deep);
          margin: 0 0 10px 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .church-admin .pr-desc {
          font-size: 0.98rem; line-height: 1.6;
          color: var(--slate);
          margin: 0;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .church-admin .md-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }
        .church-admin .md-card {
          background: var(--white);
          border: 1px solid rgba(28,58,82,0.12);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(15,36,56,0.04), 0 10px 28px rgba(15,36,56,0.06);
        }
        .church-admin .md-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          background: linear-gradient(180deg, var(--navy) 0%, var(--navy-deep) 100%);
          display: flex; align-items: center; justify-content: center;
        }
        .church-admin .md-frame img,
        .church-admin .md-frame video {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }
        .church-admin .md-frame audio { width: 88%; }
        .church-admin .md-type {
          position: absolute; top: 12px; left: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(15,36,56,0.82);
          color: #eaf3f8;
          font-size: 0.74rem; font-weight: 700;
          text-transform: capitalize;
        }
        .church-admin .md-body { padding: 16px 18px 20px; }
        .church-admin .md-title {
          font-size: 1.05rem; font-weight: 700; line-height: 1.35;
          color: var(--navy-deep);
          margin: 0 0 6px 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .church-admin .md-cat { font-size: 0.88rem; color: var(--slate); margin: 0; }

        @media (max-width: 900px) {
          .church-admin section { padding: 40px 0 !important; }

          .church-admin .section-head {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }

          .church-admin h1.display {
            text-align: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .church-admin section:first-of-type p {
            text-align: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }

          .church-admin .content-card { text-align: center !important; }
          .church-admin .qa-btn { justify-content: center; text-align: center; }

          .church-admin .subscriber-row {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }

          .church-admin .rp-row { grid-template-columns: 96px 1fr; gap: 16px; padding: 16px; }
          .church-admin .rp-thumb { width: 96px; height: 72px; }
          .church-admin .rp-title { font-size: 1.3rem; }
          .church-admin .rp-status { grid-column: 1 / -1; justify-self: start; }
          .church-admin .pr-grid { grid-template-columns: 1fr; }
          .church-admin .md-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .church-admin h1.display { font-size: 2.1rem !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .church-admin .pr-card, .church-admin .rp-row { transition: none; }
          .church-admin .pr-card:hover { transform: none; }
        }
      `}</style>

      <section>
        <h1 className="display" style={{ fontSize: "clamp(2.6rem, 5vw, 4.2rem)", fontWeight: 700, lineHeight: 1.08, margin: "16px 0 18px 0", color: "var(--navy-deep)" }}>
          {greeting}
        </h1>
        <p style={{ fontSize: "1.3rem", color: "var(--slate)", lineHeight: 1.6, maxWidth: "640px" }}>
          {t("dashboard.subtitle")}
        </p>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">{t("dashboard.contentLibrary.heading")}</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>{t("dashboard.contentLibrary.subheading")}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          {CONTENT_CONFIG.map(({ key, to }) => (
            <Link
              key={key}
              to={to}
              className="content-card"
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
                    {t("dashboard.contentLibrary.failedToLoad")}
                  </span>
                ) : (
                  contentCounts[key] ?? 0
                )}
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: "10px", color: "#eaf3f8" }}>
                {t("dashboard.contentLibrary.totalPrefix")} {t(`dashboard.content.${key}`)}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">{t("dashboard.recentPosts.heading")}</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>
            {!contentLoading && !contentErrors.posts &&
              t("dashboard.recentPosts.showing", { shown: Math.min(recentPosts.length, RECENT_LIMIT), total: contentCounts.posts ?? 0 })}
          </span>
          <Link to="/admin/posts/view" className="eyebrow" style={{ color: "var(--navy)" }}>{t("dashboard.recentPosts.viewAll")}</Link>
        </div>
        {recentLoading ? (
          <p style={{ color: "var(--slate)" }}>{t("dashboard.recentPosts.loading")}</p>
        ) : postsError ? (
          <p style={{ color: "var(--deep-red)" }}>{t("dashboard.recentPosts.failedToLoad")}</p>
        ) : recentPosts.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>{t("dashboard.recentPosts.none")}</p>
        ) : (
          <div className="rp-list">
            {recentPosts.map((p) => (
              <div key={p.id} className="rp-row">
                {p.imageUrl ? (
                  <img className="rp-thumb" src={p.imageUrl} alt={p.title} />
                ) : (
                  <div className="rp-thumb rp-thumb-empty">{(p.title || "?").charAt(0)}</div>
                )}
                <div>
                  <h4 className="rp-title">{p.title}</h4>
                  <div className="rp-meta">
                    <span className="rp-category">{p.category?.name || t("dashboard.recentPosts.uncategorized")}</span>
                    <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</span>
                  </div>
                </div>
                <span className={`rp-status ${p.status === "published" ? "published" : ""}`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="eyebrow" style={{ marginBottom: "30px" }}>{t("dashboard.quickActions.heading")}</h3>
        <div className="qa-grid">
          {QUICK_ACTIONS.map(({ key, to }, i) => (
            <Link
              key={key}
              to={to}
              className="qa-btn"
              style={{
                background: i % 2 === 0 ? "linear-gradient(180deg, var(--navy) 0%, var(--navy-deep) 100%)" : "linear-gradient(180deg, var(--deep-red) 0%, var(--deep-red-2) 100%)",
              }}
            >
              {t(`dashboard.quickActions.${key}`)}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">{t("dashboard.recentPromotions.heading")}</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>
            {!contentLoading && !contentErrors.promotions &&
              t("dashboard.recentPromotions.showing", { shown: Math.min(recentPromotions.length, RECENT_LIMIT), total: contentCounts.promotions ?? 0 })}
          </span>
          <Link to="/admin/promotions/view" className="eyebrow" style={{ color: "var(--navy)" }}>{t("dashboard.recentPromotions.viewAll")}</Link>
        </div>
        {recentLoading ? (
          <p style={{ color: "var(--slate)" }}>{t("dashboard.recentPromotions.loading")}</p>
        ) : promotionsError ? (
          <p style={{ color: "var(--deep-red)" }}>{t("dashboard.recentPromotions.failedToLoad")}</p>
        ) : recentPromotions.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>{t("dashboard.recentPromotions.none")}</p>
        ) : (
          <div className="pr-grid">
            {recentPromotions.map((promo) => (
              <article key={promo.id} className="pr-card">
                {promo.photo ? (
                  <img className="pr-media" src={promo.photo} alt={promo.title} />
                ) : (
                  <div className="pr-media pr-media-empty">{(promo.title || "?").charAt(0)}</div>
                )}
                <div className="pr-body">
                  <h4 className="pr-title">{promo.title}</h4>
                  <p className="pr-desc">{promo.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h3 className="eyebrow">{t("dashboard.recentMedia.heading")}</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>
            {!contentLoading && !contentErrors.media &&
              t("dashboard.recentMedia.showing", { shown: Math.min(recentMedia.length, RECENT_LIMIT), total: contentCounts.media ?? 0 })}
          </span>
          <Link to="/admin/media/view" className="eyebrow" style={{ color: "var(--navy)" }}>{t("dashboard.recentMedia.viewAll")}</Link>
        </div>
        {recentLoading ? (
          <p style={{ color: "var(--slate)" }}>{t("dashboard.recentMedia.loading")}</p>
        ) : mediaError ? (
          <p style={{ color: "var(--deep-red)" }}>{t("dashboard.recentMedia.failedToLoad")}</p>
        ) : recentMedia.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>{t("dashboard.recentMedia.none")}</p>
        ) : (
          <div className="md-grid">
            {recentMedia.map((item) => (
              <article key={item.id} className="md-card">
                <div className="md-frame">
                  {item.mediaType === "video" && item.mediaUrl ? (
                    <video src={item.mediaUrl} poster={item.thumbnail || undefined} controls preload="metadata" />
                  ) : item.mediaType === "audio" && item.mediaUrl ? (
                    <audio src={item.mediaUrl} controls preload="none" />
                  ) : item.mediaUrl || item.thumbnail ? (
                    <img src={item.mediaType === "photo" ? item.mediaUrl || item.thumbnail : item.thumbnail || item.mediaUrl} alt={item.title} />
                  ) : null}
                  <span className="md-type">{item.mediaType || t("dashboard.recentMedia.uncategorized")}</span>
                </div>
                <div className="md-body">
                  <h4 className="md-title">{item.title}</h4>
                  <p className="md-cat">{item.category?.name || t("dashboard.recentMedia.uncategorized")}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ borderBottom: "none" }}>
        <div className="section-head">
          <h3 className="eyebrow">{t("dashboard.recentSubscribers.heading")}</h3>
          <span className="eyebrow" style={{ color: "var(--slate)" }}>
            {!contentLoading && !contentErrors.subscribers &&
              t("dashboard.recentSubscribers.showing", { shown: Math.min(recentSubscribers.length, RECENT_LIMIT), total: contentCounts.subscribers ?? 0 })}
          </span>
          <Link to="/admin/subscribers/view" className="eyebrow" style={{ color: "var(--navy)" }}>{t("dashboard.recentSubscribers.viewAll")}</Link>
        </div>
        {recentLoading ? (
          <p style={{ color: "var(--slate)" }}>{t("dashboard.recentSubscribers.loading")}</p>
        ) : subscribersError ? (
          <p style={{ color: "var(--deep-red)" }}>{t("dashboard.recentSubscribers.failedToLoad")}</p>
        ) : recentSubscribers.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>{t("dashboard.recentSubscribers.none")}</p>
        ) : (
          recentSubscribers.map((s, i) => (
            <div key={s.id} className="subscriber-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", padding: "18px 0", borderTop: i === 0 ? "1px solid rgba(28,58,82,0.12)" : "none", borderBottom: "1px solid rgba(28,58,82,0.12)", flexWrap: "wrap" }}>
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