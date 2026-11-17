/* Living article ages and tooltips.
 *
 * One module for the browser and for the build helper (scripts/living-tags.js):
 * - ageDays(updatedIso, now): whole days from the last update to `now`. `now` is always passed
 *   in; nothing here holds a fixed "today".
 * - formatAge(days, form): the visible tag text in one of three forms
 *   ("words": "updated 3 d ago", the team default; "tminus": "T−3"; "cycle": "↻ 3 d").
 * - staticAge(updatedIso, sentIso, form): the text for static channels (e-mail, LinkedIn):
 *   the absolute date plus the age on the day of sending, which stays true after sending.
 * - enhance(root, now): on the web, rewrites each age mark to the live age and wires the
 *   tooltips (hover and focus open them through CSS; a tap toggles aria-expanded; Escape closes).
 * Without the script the page shows the absolute date, which is also true.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.LivingArticle = api;
    if (root.document) {
      const start = () => api.enhance(root.document, new Date());
      if (root.document.readyState === "loading") {
        root.document.addEventListener("DOMContentLoaded", start);
      } else {
        start();
      }
    }
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const DAY_MS = 86400000;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const FORMS = ["words", "tminus", "cycle"];

  function toDate(value, name) {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) throw new TypeError(name + " is an invalid date");
      return value;
    }
    if (typeof value !== "string" || !value) {
      throw new TypeError(name + " is required (an ISO date string or a Date)");
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) throw new TypeError(name + " is not a date: " + value);
    return d;
  }

  function utcDay(d) {
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  /* Whole calendar days (UTC) from `updated` to `now`; never negative. */
  function ageDays(updated, now) {
    const u = toDate(updated, "updated");
    const n = toDate(now, "now");
    return Math.max(0, Math.round((utcDay(n) - utcDay(u)) / DAY_MS));
  }

  function groupThousands(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function formatDate(value) {
    const d = toDate(value, "date");
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }

  function formatAge(days, form) {
    const f = form || "words";
    if (FORMS.indexOf(f) < 0) throw new RangeError("unknown tag form: " + f);
    const n = groupThousands(days);
    if (f === "tminus") return "T−" + n;
    if (f === "cycle") return "↻ " + n + " d";
    return days === 0 ? "updated today" : "updated " + n + " d ago";
  }

  /* Spoken form: the same fact in full words, for aria-label and the tooltip. */
  function spokenAge(days) {
    if (days === 0) return "updated today";
    return "updated " + groupThousands(days) + (days === 1 ? " day ago" : " days ago");
  }

  function staticAge(updated, sentAt, form) {
    const days = ageDays(updated, sentAt);
    const when = formatDate(updated);
    const f = form || "words";
    if (FORMS.indexOf(f) < 0) throw new RangeError("unknown tag form: " + f);
    const ago = days === 0 ? "on the day of sending" : groupThousands(days) + " d before sending";
    if (f === "tminus") return "T−" + groupThousands(days) + " at sending (" + when + ")";
    if (f === "cycle") return "↻ " + when + " (" + ago + ")";
    return "updated " + when + " (" + ago + ")";
  }

  function closeAll(doc, except) {
    const open = doc.querySelectorAll('.la-mark[aria-expanded="true"]');
    for (let i = 0; i < open.length; i++) {
      if (open[i] !== except) open[i].setAttribute("aria-expanded", "false");
    }
  }

  /* Live ages and tooltip wiring on the web page. `now` is passed in by the caller. */
  function enhance(root, now) {
    const n = toDate(now, "now");
    const doc = root.ownerDocument || root;
    const marks = root.querySelectorAll(".la-mark[data-la-updated]");
    for (let i = 0; i < marks.length; i++) {
      const m = marks[i];
      const updated = m.getAttribute("data-la-updated");
      const form = m.getAttribute("data-la-form") || "words";
      const days = ageDays(updated, n);
      const visible = formatAge(days, form);
      const text = m.querySelector(".la-age-text");
      if (text) text.textContent = visible;
      // The accessible name starts with the visible text (WCAG 2.5.3), then the age in full words.
      const description = visible + " (" + spokenAge(days) + ", on " + formatDate(updated) + "). " +
        (m.getAttribute("data-la-tip") || "");
      m.setAttribute("aria-label", description.trim());
      const tip = m.querySelector(".la-tip");
      if (tip) tip.textContent = description.trim();
    }
    const buttons = root.querySelectorAll(".la-mark");
    for (let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      if (b.getAttribute("data-la-wired") === "1") continue;
      b.setAttribute("data-la-wired", "1");
      b.setAttribute("aria-expanded", "false");
      // data-la-dismissed hides the tooltip even while hovered or focused (CSS), so Escape and a
      // second tap really close it (WCAG 1.4.13); leaving the mark clears it for next time.
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        const open = b.getAttribute("aria-expanded") === "true";
        closeAll(doc, b);
        b.setAttribute("aria-expanded", open ? "false" : "true");
        if (open) b.setAttribute("data-la-dismissed", "1");
        else b.removeAttribute("data-la-dismissed");
      });
      b.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape") {
          b.setAttribute("aria-expanded", "false");
          b.setAttribute("data-la-dismissed", "1");
        }
      });
      const reset = function () {
        b.setAttribute("aria-expanded", "false");
        b.removeAttribute("data-la-dismissed");
      };
      b.addEventListener("blur", reset);
      b.addEventListener("mouseleave", reset);
    }
    // Escape anywhere closes a tooltip opened by hover too, wherever focus is (WCAG 1.4.13).
    if (doc.addEventListener && !doc.__laEscape) {
      doc.__laEscape = true;
      doc.addEventListener("keydown", function (ev) {
        if (ev.key !== "Escape") return;
        const open = doc.querySelectorAll('.la-mark:hover, .la-mark:focus, .la-mark[aria-expanded="true"]');
        for (let i = 0; i < open.length; i++) {
          open[i].setAttribute("aria-expanded", "false");
          open[i].setAttribute("data-la-dismissed", "1");
        }
      });
    }
    return marks.length;
  }

  return { ageDays, formatAge, formatDate, spokenAge, staticAge, enhance, FORMS };
});
