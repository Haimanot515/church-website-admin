import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// English
import enNavbar from "../locales/en/navbar.json";
import enDashboard from "../locales/en/dashboard.json";
import enCreateHomeHero from "../locales/en/createhomehero.json";
import enGetHomeHero from "../locales/en/gethomehero.json";
import enPost from "../locales/en/post.json";
import enCreatePost from "../locales/en/createpost.json";
import enGetService from "../locales/en/getService.json";
import enCreateService from "../locales/en/createService.json";
import enGetMedia from "../locales/en/getmedia.json";
import enCreateMedia from "../locales/en/createmedia.json";
import enGetCategory from "../locales/en/getcategory.json";
import enCreateCategory from "../locales/en/createcategory.json";
import enCreateLanguage from "../locales/en/createlanguage.json";
import enGetLanguage from "../locales/en/getlanguage.json";
import enCreatePromotion from "../locales/en/createpromotion.json";
import enGetPromotions from "../locales/en/getpromotions.json";
import enCreateSubscriber from "../locales/en/createsubscriber.json";
import enGetSubscribers from "../locales/en/getsubscribers.json";
import enCreateAbout from "../locales/en/createabout.json";
import enGetAbout from "../locales/en/getabout.json";
import enAdminSidebar from "../locales/en/adminsidebar.json";
import enAdminLogin from "../locales/en/adminlogin.json";
import enFooter from "../locales/en/footer.json";

// Amharic
import amNavbar from "../locales/am/navbar.json";
import amDashboard from "../locales/am/dashboard.json";
import amCreateHomeHero from "../locales/am/createHomeHero.json";
import amGetHomeHero from "../locales/am/getHomeHero.json";
import amPost from "../locales/am/post.json";
import amCreatePost from "../locales/am/createpost.json";
import amGetService from "../locales/am/getService.json";
import amCreateService from "../locales/am/createService.json";
import amGetMedia from "../locales/am/getmedia.json";
import amCreateMedia from "../locales/am/createmedia.json";
import amGetCategory from "../locales/am/getcategory.json";
import amCreateCategory from "../locales/am/createcategory.json";
import amCreateLanguage from "../locales/am/createlanguage.json";
import amGetLanguage from "../locales/am/getlanguage.json";
import amCreatePromotion from "../locales/am/createpromotion.json";
import amGetPromotions from "../locales/am/getpromotions.json";
import amCreateSubscriber from "../locales/am/createsubscriber.json";
import amGetSubscribers from "../locales/am/getsubscribers.json";
import amCreateAbout from "../locales/am/createabout.json";
import amGetAbout from "../locales/am/getabout.json";
import amAdminSidebar from "../locales/am/adminsidebar.json";
import amAdminLogin from "../locales/am/adminlogin.json";
import amFooter from "../locales/am/footer.json";

// Italian
import itNavbar from "../locales/it/navbar.json";
import itDashboard from "../locales/it/dashboard.json";
import itCreateHomeHero from "../locales/it/createHomeHero.json";
import itGetHomeHero from "../locales/it/getHomeHero.json";
import itPost from "../locales/it/post.json";
import itCreatePost from "../locales/it/createPost.json";
import itGetService from "../locales/it/getService.json";
import itCreateService from "../locales/it/createService.json";
import itGetMedia from "../locales/it/getmedia.json";
import itCreateMedia from "../locales/it/createmedia.json";
import itGetCategory from "../locales/it/getcategory.json";
import itCreateCategory from "../locales/it/createcategory.json";
import itCreateLanguage from "../locales/it/createlanguage.json";
import itGetLanguage from "../locales/it/getlanguage.json";
import itCreatePromotion from "../locales/it/createpromotion.json";
import itGetPromotions from "../locales/it/getpromotions.json";
import itCreateSubscriber from "../locales/it/createsubscriber.json";
import itGetSubscribers from "../locales/it/getsubscribers.json";
import itCreateAbout from "../locales/it/createabout.json";
import itGetAbout from "../locales/it/getabout.json";
import itAdminSidebar from "../locales/it/adminsidebar.json";
import itAdminLogin from "../locales/it/adminlogin.json";
import itFooter from "../locales/it/footer.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          navbar: enNavbar,
          dashboard: enDashboard,
          createHomeHero: enCreateHomeHero,
          getHomeHero: enGetHomeHero,
          post: enPost,
          createPost: enCreatePost,
          getService: enGetService,
          createService: enCreateService,
          getMedia: enGetMedia,
          createMedia: enCreateMedia,
          getCategory: enGetCategory,
          createCategory: enCreateCategory,
          createLanguage: enCreateLanguage,
          getLanguage: enGetLanguage,
          createPromotion: enCreatePromotion,
          getPromotions: enGetPromotions,
          createSubscriber: enCreateSubscriber,
          getSubscribers: enGetSubscribers,
          createAbout: enCreateAbout,
          getAbout: enGetAbout,
          adminSidebar: enAdminSidebar,
          adminLogin: enAdminLogin,
          footer: enFooter,
        },
      },

      am: {
        translation: {
          navbar: amNavbar,
          dashboard: amDashboard,
          createHomeHero: amCreateHomeHero,
          getHomeHero: amGetHomeHero,
          post: amPost,
          createPost: amCreatePost,
          getService: amGetService,
          createService: amCreateService,
          getMedia: amGetMedia,
          createMedia: amCreateMedia,
          getCategory: amGetCategory,
          createCategory: amCreateCategory,
          createLanguage: amCreateLanguage,
          getLanguage: amGetLanguage,
          createPromotion: amCreatePromotion,
          getPromotions: amGetPromotions,
          createSubscriber: amCreateSubscriber,
          getSubscribers: amGetSubscribers,
          createAbout: amCreateAbout,
          getAbout: amGetAbout,
          adminSidebar: amAdminSidebar,
          adminLogin: amAdminLogin,
          footer: amFooter,
        },
      },

      it: {
        translation: {
          navbar: itNavbar,
          dashboard: itDashboard,
          createHomeHero: itCreateHomeHero,
          getHomeHero: itGetHomeHero,
          post: itPost,
          createPost: itCreatePost,
          getService: itGetService,
          createService: itCreateService,
          getMedia: itGetMedia,
          createMedia: itCreateMedia,
          getCategory: itGetCategory,
          createCategory: itCreateCategory,
          createLanguage: itCreateLanguage,
          getLanguage: itGetLanguage,
          createPromotion: itCreatePromotion,
          getPromotions: itGetPromotions,
          createSubscriber: itCreateSubscriber,
          getSubscribers: itGetSubscribers,
          createAbout: itCreateAbout,
          getAbout: itGetAbout,
          adminSidebar: itAdminSidebar,
          adminLogin: itAdminLogin,
          footer: itFooter,
        },
      },
    },

    fallbackLng: "en",

    supportedLngs: ["en", "am", "it"],

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
