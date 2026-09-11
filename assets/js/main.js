/* =========================================================
   مركز دار الشفاء — Dar Al Chifaa — comportements du site
   Bascule AR/FR, menu mobile, révélation au défilement, formulaire → WhatsApp
   ========================================================= */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "212609038877"; // +212 609 038 877, format international sans "+"
  var DICT = window.DAR_AL_CHIFAA_I18N || { ar: {}, fr: {} };
  var STORAGE_KEY = "dac_lang";

  function getLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    return saved === "fr" ? "fr" : "ar"; // arabe = langue par défaut
  }

  function t(key, lang) {
    var dict = DICT[lang] || {};
    return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
  }

  function applyLang(lang) {
    var html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    // Texte des éléments [data-i18n]
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = t(key, lang);
    });

    // Attributs traduits : data-i18n-attr='{"placeholder":"contact.form.name"}'
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      try {
        var map = JSON.parse(el.getAttribute("data-i18n-attr"));
        Object.keys(map).forEach(function (attr) {
          el.setAttribute(attr, t(map[attr], lang));
        });
      } catch (e) {}
    });

    // <title> et meta description
    document.title = t("meta.title", lang);
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t("meta.description", lang));

    // Boutons de langue actifs
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function initLangSwitch() {
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"));
      });
    });
  }

  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      var expanded = nav.classList.contains("open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  function initContactForm() {
    var form = document.querySelector("#contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var lang = getLang();
      var name = form.querySelector("[name=name]").value.trim();
      var phone = form.querySelector("[name=phone]").value.trim();
      var service = form.querySelector("[name=service]");
      var serviceLabel = service && service.value ? service.options[service.selectedIndex].text : "";
      var message = form.querySelector("[name=message]").value.trim();

      var lines = lang === "ar"
        ? [
            "مرحباً، أرغب في حجز موعد في مركز دار الشفاء.",
            "الاسم: " + name,
            "الهاتف: " + phone,
            serviceLabel ? "الخدمة: " + serviceLabel : "",
            message ? "الرسالة: " + message : ""
          ]
        : [
            "Bonjour, je souhaite prendre rendez-vous au Centre Dar Al Chifaa.",
            "Nom : " + name,
            "Téléphone : " + phone,
            serviceLabel ? "Service : " + serviceLabel : "",
            message ? "Message : " + message : ""
          ];

      var text = encodeURIComponent(lines.filter(Boolean).join("\n"));
      window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text, "_blank", "noopener");
    });
  }

  function initActiveNav() {
    var links = document.querySelectorAll(".main-nav a[href^='#']");
    var sections = Array.prototype.map.call(links, function (a) {
      return document.querySelector(a.getAttribute("href"));
    }).filter(Boolean);
    if (!("IntersectionObserver" in window) || !sections.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = "#" + entry.target.id;
        var link = document.querySelector(".main-nav a[href='" + id + "']");
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          link.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  function initYear() {
    var el = document.querySelector("#current-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(getLang());
    initLangSwitch();
    initMobileNav();
    initReveal();
    initContactForm();
    initActiveNav();
    initYear();
  });
})();
