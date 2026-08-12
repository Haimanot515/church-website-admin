import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function setMeta(attrName, attrValue, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function useDocumentMeta() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = t("meta.title");

    setMeta("name", "description", t("meta.description"));
    setMeta("property", "og:site_name", t("meta.siteName"));
    setMeta("property", "og:title", t("meta.ogTitle"));
    setMeta("property", "og:description", t("meta.ogDescription"));
    setMeta("property", "og:locale", t("meta.locale"));
    setMeta("name", "twitter:title", t("meta.twitterTitle"));
    setMeta("name", "twitter:description", t("meta.twitterDescription"));
  }, [i18n.language, t]); // <-- re-runs on every language switch, same trigger your Home.jsx effects use
}