import React from "react";
import { useTranslation } from "react-i18next";
import "./Footer.css";

const Cross = ({ width = 18, height = 26, opacity = 1 }) => {
  const barW = Math.round(width * 0.22);
  const barH = Math.round(height * 0.16);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <rect x={(width - barW) / 2} y="0" width={barW} height={height} fill="var(--gold)" opacity={opacity} />
      <rect x={(width - width * 0.85) / 2} y={height * 0.24} width={width * 0.85} height={barH} fill="var(--gold)" opacity={opacity} />
    </svg>
  );
};

const CrossRail = ({ width = 22, height = 32 }) => (
  <div className="cross-rail-inner">
    <span className="cross-rail-line cross-rail-line-top" />
    <Cross width={width} height={height} />
    <span className="cross-rail-line cross-rail-line-bottom" />
  </div>
);

const BackToTop = ({ label }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button className="back-to-top" onClick={scrollToTop} aria-label={label}>
      <span className="back-to-top-line" />
      <span className="back-to-top-arrow">↑</span>
      <span className="back-to-top-line" />
    </button>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  const footerColumns = t("footer.columns", { returnObjects: true });

  return (
    <footer className="site-footer">
      <div className="footer-cross-rail footer-cross-rail-left">
        <CrossRail width={22} height={32} />
      </div>
      <div className="footer-cross-rail footer-cross-rail-right">
        <CrossRail width={22} height={32} />
      </div>

      <div className="wrapper">
        <div className="footer-grid">
          <div>
            <h4 className="display footer-brand">{t("footer.brand")}</h4>
            <p className="footer-tagline">{t("footer.tagline")}</p>
          </div>
          {footerColumns.map((col, i) => (
            <div key={i}>
              <h5 className="eyebrow footer-col-title">{col.title}</h5>
              {col.items.map((s, j) => (
                <p key={j} className="footer-link">{s}</p>
              ))}
            </div>
          ))}
        </div>

        <div
          className="footer-cross-divider"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "26px",
            margin: "24px 0",
          }}
        >
          <span
            style={{
              flex: 1,
              maxWidth: "220px",
              height: "2px",
              background: "linear-gradient(90deg, rgba(207,159,63,0) 0%, rgba(207,159,63,0.55) 50%, rgba(207,159,63,0) 100%)",
            }}
          />
          <Cross width={18} height={26} opacity={0.7} />
          <Cross width={26} height={38} />
          <Cross width={18} height={26} opacity={0.7} />
          <span
            style={{
              flex: 1,
              maxWidth: "220px",
              height: "2px",
              background: "linear-gradient(90deg, rgba(207,159,63,0) 0%, rgba(207,159,63,0.55) 50%, rgba(207,159,63,0) 100%)",
            }}
          />
        </div>

        <BackToTop label={t("footer.backToTop")} />

        <div className="footer-bottom">
          <p className="eyebrow footer-bottom-text">{t("footer.copyright")}</p>
          <p className="eyebrow footer-bottom-text">{t("footer.privacyPolicy")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;