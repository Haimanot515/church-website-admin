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
import enGetService from "../locales/en/getservice.json";
import enCreateService from "../locales/en/createservice.json";
import enUpdateService from "../locales/en/updateservice.json";
import enGetMedia from "../locales/en/getmedia.json";
import enCreateMedia from "../locales/en/createmedia.json";
import enGetCategory from "../locales/en/getcategory.json";
import enCreateCategory from "../locales/en/createcategory.json";
import enCreateLanguage from "../locales/en/createlanguage.json";
import enGetLanguage from "../locales/en/getlanguage.json";
import enCreatePromotion from "../locales/en/createpromotion.json";
import enGetPromotions from "../locales/en/getpromotions.json";
import enUpdatePromotion from "../locales/en/updatepromotion.json";
import enCreateSubscriber from "../locales/en/createsubscriber.json";
import enGetSubscribers from "../locales/en/getsubscribers.json";
import enCreateAbout from "../locales/en/createabout.json";
import enGetAbout from "../locales/en/getabout.json";
import enAdminSidebar from "../locales/en/adminsidebar.json";
import enAdminLogin from "../locales/en/adminlogin.json";
import enFooter from "../locales/en/footer.json";
import enAdminUsers from "../locales/en/adminusers.json";
import enCreateChurch from "../locales/en/createchurch.json";
import enGetChurch from "../locales/en/getchurch.json";
import enUpdateChurch from "../locales/en/updatechurch.json";
import enCreateChurchAssignment from "../locales/en/createchurchassignment.json";
import enCreateChurchPerson from "../locales/en/createchurchperson.json";
import enGetChurchPerson from "../locales/en/getchurchperson.json";
import enReorderChurchPerson from "../locales/en/reorderchurchperson.json";
import enCreateChurchStory from "../locales/en/createchurchstory.json";
import enGetChurchStories from "../locales/en/getchurchstory.json";
import enAdminMessages from "../locales/en/adminmessages.json";
import enChatWindow from "../locales/en/chatwindow.json";
import enInboxList from "../locales/en/inboxlist.json";
import enCreateMissionVision from "../locales/en/createmissionvision.json";
import enGetMissionVision from "../locales/en/getmissionvision.json";
import enCreateFaq from "../locales/en/createfaq.json";
import enGetFaq from "../locales/en/getfaq.json";

// Amharic
import amNavbar from "../locales/am/navbar.json";
import amDashboard from "../locales/am/dashboard.json";
import amCreateHomeHero from "../locales/am/createhomehero.json";
import amGetHomeHero from "../locales/am/gethomehero.json";
import amPost from "../locales/am/post.json";
import amCreatePost from "../locales/am/createpost.json";
import amGetService from "../locales/am/getservice.json";
import amCreateService from "../locales/am/createservice.json";
import amUpdateService from "../locales/am/updateservice.json";
import amGetMedia from "../locales/am/getmedia.json";
import amCreateMedia from "../locales/am/createmedia.json";
import amGetCategory from "../locales/am/getcategory.json";
import amCreateCategory from "../locales/am/createcategory.json";
import amCreateLanguage from "../locales/am/createlanguage.json";
import amGetLanguage from "../locales/am/getlanguage.json";
import amCreatePromotion from "../locales/am/createpromotion.json";
import amGetPromotions from "../locales/am/getpromotions.json";
import amUpdatePromotion from "../locales/am/updatepromotion.json";
import amCreateSubscriber from "../locales/am/createsubscriber.json";
import amGetSubscribers from "../locales/am/getsubscribers.json";
import amCreateAbout from "../locales/am/createabout.json";
import amGetAbout from "../locales/am/getabout.json";
import amAdminSidebar from "../locales/am/adminsidebar.json";
import amAdminLogin from "../locales/am/adminlogin.json";
import amFooter from "../locales/am/footer.json";
import amAdminUsers from "../locales/am/adminusers.json";
import amCreateChurch from "../locales/am/createchurch.json";
import amGetChurch from "../locales/am/getchurch.json";
import amUpdateChurch from "../locales/am/updatechurch.json";
import amCreateChurchAssignment from "../locales/am/createchurchassignment.json";
import amCreateChurchPerson from "../locales/am/createchurchperson.json";
import amGetChurchPerson from "../locales/am/getchurchperson.json";
import amReorderChurchPerson from "../locales/am/reorderchurchperson.json";
import amCreateChurchStory from "../locales/am/createchurchstory.json";
import amGetChurchStories from "../locales/am/getchurchstory.json";
import amAdminMessages from "../locales/am/adminmessages.json";
import amChatWindow from "../locales/am/chatwindow.json";
import amInboxList from "../locales/am/inboxlist.json";
import amCreateMissionVision from "../locales/am/createmissionvision.json";
import amGetMissionVision from "../locales/am/getmissionvision.json";
import amCreateFaq from "../locales/am/createfaq.json";
import amGetFaq from "../locales/am/getfaq.json";

// Italian
import itNavbar from "../locales/it/navbar.json";
import itDashboard from "../locales/it/dashboard.json";
import itCreateHomeHero from "../locales/it/createhomehero.json";
import itGetHomeHero from "../locales/it/gethomehero.json";
import itPost from "../locales/it/post.json";
import itCreatePost from "../locales/it/createpost.json";
import itGetService from "../locales/it/getservice.json";
import itCreateService from "../locales/it/createservice.json";
import itUpdateService from "../locales/it/updateservice.json";
import itGetMedia from "../locales/it/getmedia.json";
import itCreateMedia from "../locales/it/createmedia.json";
import itGetCategory from "../locales/it/getcategory.json";
import itCreateCategory from "../locales/it/createcategory.json";
import itCreateLanguage from "../locales/it/createlanguage.json";
import itGetLanguage from "../locales/it/getlanguage.json";
import itCreatePromotion from "../locales/it/createpromotion.json";
import itGetPromotions from "../locales/it/getpromotions.json";
import itUpdatePromotion from "../locales/it/updatepromotion.json";
import itCreateSubscriber from "../locales/it/createsubscriber.json";
import itGetSubscribers from "../locales/it/getsubscribers.json";
import itCreateAbout from "../locales/it/createabout.json";
import itGetAbout from "../locales/it/getabout.json";
import itAdminSidebar from "../locales/it/adminsidebar.json";
import itAdminLogin from "../locales/it/adminlogin.json";
import itFooter from "../locales/it/footer.json";
import itAdminUsers from "../locales/it/adminusers.json";
import itCreateChurch from "../locales/it/createchurch.json";
import itGetChurch from "../locales/it/getchurch.json";
import itUpdateChurch from "../locales/it/updatechurch.json";
import itCreateChurchAssignment from "../locales/it/createchurchassignment.json";
import itCreateChurchPerson from "../locales/it/createchurchperson.json";
import itGetChurchPerson from "../locales/it/getchurchperson.json";
import itReorderChurchPerson from "../locales/it/reorderchurchperson.json";
import itCreateChurchStory from "../locales/it/createchurchstory.json";
import itGetChurchStories from "../locales/it/getchurchstory.json";
import itAdminMessages from "../locales/it/adminmessages.json";
import itChatWindow from "../locales/it/chatwindow.json";
import itInboxList from "../locales/it/inboxlist.json";
import itCreateMissionVision from "../locales/it/createmissionvision.json";
import itGetMissionVision from "../locales/it/getmissionvision.json";
import itCreateFaq from "../locales/it/createfaq.json";
import itGetFaq from "../locales/it/getfaq.json";

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
          updateService: enUpdateService,
          getMedia: enGetMedia,
          createMedia: enCreateMedia,
          getCategory: enGetCategory,
          createCategory: enCreateCategory,
          createLanguage: enCreateLanguage,
          getLanguage: enGetLanguage,
          createPromotion: enCreatePromotion,
          getPromotions: enGetPromotions,
          updatePromotion: enUpdatePromotion,
          createSubscriber: enCreateSubscriber,
          getSubscribers: enGetSubscribers,
          createAbout: enCreateAbout,
          getAbout: enGetAbout,
          adminSidebar: enAdminSidebar,
          adminLogin: enAdminLogin,
          footer: enFooter,
          adminUsers: enAdminUsers,
          createChurch: enCreateChurch,
          getChurch: enGetChurch,
          updateChurch: enUpdateChurch,
          createChurchAssignment: enCreateChurchAssignment,
          createChurchPerson: enCreateChurchPerson,
          getChurchPerson: enGetChurchPerson,
          reorderChurchPerson: enReorderChurchPerson,
          createChurchStory: enCreateChurchStory,
          getChurchStories: enGetChurchStories,
          adminMessages: enAdminMessages,
          chatWindow: enChatWindow,
          inboxList: enInboxList,
          createMissionVision: enCreateMissionVision,
          getMissionVision: enGetMissionVision,
          createFaq: enCreateFaq,
          getFaq: enGetFaq,
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
          updateService: amUpdateService,
          getMedia: amGetMedia,
          createMedia: amCreateMedia,
          getCategory: amGetCategory,
          createCategory: amCreateCategory,
          createLanguage: amCreateLanguage,
          getLanguage: amGetLanguage,
          createPromotion: amCreatePromotion,
          getPromotions: amGetPromotions,
          updatePromotion: amUpdatePromotion,
          createSubscriber: amCreateSubscriber,
          getSubscribers: amGetSubscribers,
          createAbout: amCreateAbout,
          getAbout: amGetAbout,
          adminSidebar: amAdminSidebar,
          adminLogin: amAdminLogin,
          footer: amFooter,
          adminUsers: amAdminUsers,
          createChurch: amCreateChurch,
          getChurch: amGetChurch,
          updateChurch: amUpdateChurch,
          createChurchAssignment: amCreateChurchAssignment,
          createChurchPerson: amCreateChurchPerson,
          getChurchPerson: amGetChurchPerson,
          reorderChurchPerson: amReorderChurchPerson,
          createChurchStory: amCreateChurchStory,
          getChurchStories: amGetChurchStories,
          adminMessages: amAdminMessages,
          chatWindow: amChatWindow,
          inboxList: amInboxList,
          createMissionVision: amCreateMissionVision,
          getMissionVision: amGetMissionVision,
          createFaq: amCreateFaq,
          getFaq: amGetFaq,
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
          updateService: itUpdateService,
          getMedia: itGetMedia,
          createMedia: itCreateMedia,
          getCategory: itGetCategory,
          createCategory: itCreateCategory,
          createLanguage: itCreateLanguage,
          getLanguage: itGetLanguage,
          createPromotion: itCreatePromotion,
          getPromotions: itGetPromotions,
          updatePromotion: itUpdatePromotion,
          createSubscriber: itCreateSubscriber,
          getSubscribers: itGetSubscribers,
          createAbout: itCreateAbout,
          getAbout: itGetAbout,
          adminSidebar: itAdminSidebar,
          adminLogin: itAdminLogin,
          footer: itFooter,
          adminUsers: itAdminUsers,
          createChurch: itCreateChurch,
          getChurch: itGetChurch,
          updateChurch: itUpdateChurch,
          createChurchAssignment: itCreateChurchAssignment,
          createChurchPerson: itCreateChurchPerson,
          getChurchPerson: itGetChurchPerson,
          reorderChurchPerson: itReorderChurchPerson,
          createChurchStory: itCreateChurchStory,
          getChurchStories: itGetChurchStories,
          adminMessages: itAdminMessages,
          chatWindow: itChatWindow,
          inboxList: itInboxList,
          createMissionVision: itCreateMissionVision,
          getMissionVision: itGetMissionVision,
          createFaq: itCreateFaq,
          getFaq: itGetFaq,
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
      convertDetectedLanguage: (lng) => lng.split("-")[0], // "en-US" -> "en", "en-GB" -> "en"
    },
  });

export default i18n;