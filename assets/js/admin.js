/* KonyaGo gizli yönetim — istemci tarafi; sifre SHA-256 */
(function () {
  "use strict";

  // Varsayılan şifre: KonyaAdmin2026  →  hemen değiştirmek için bu hash'i güncelle
  var PASS_HASH = "09a7dc2b02e24fa2d2c8e84e12aabd905d7738357253e2624918887b4820cdda";
  var AUTH_KEY = "konyago_admin_ok";

  function $(id) { return document.getElementById(id); }

  function sha256(str) {
    var data = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", data).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    });
  }

  function isAuthed() {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch (e) { return false; }
  }

  function setAuth(v) {
    try {
      if (v) sessionStorage.setItem(AUTH_KEY, "1");
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {}
  }

  function loadAnalytics() {
    try {
      return JSON.parse(localStorage.getItem("konyago_analytics") || "{\"events\":[],\"pages\":{},\"days\":{}}");
    } catch (e) {
      return { events: [], pages: {}, days: {} };
    }
  }

  function publicToday() {
    try {
      var today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem("konyago_visit_day") !== today) return 0;
      return parseInt(localStorage.getItem("konyago_visit_count") || "0", 10) || 0;
    } catch (e) { return 0; }
  }

  function render() {
    var data = loadAnalytics();
    var today = new Date().toISOString().slice(0, 10);
    var day = (data.days && data.days[today]) || { hits: 0, sessions: 0 };
    $("sToday").textContent = String(day.hits || 0);
    $("sPublic").textContent = String(publicToday());
    $("sSessions").textContent = String(day.sessions || 0);
    $("sPages").textContent = String((data.events && data.events.length) || 0);

    var pages = data.pages || {};
    var keys = Object.keys(pages).sort(function (a, b) { return pages[b] - pages[a]; });
    var html = "";
    if (!keys.length) html = "<p>Henüz sayfa kaydı yok. Sitede gezinince burada birikir.</p>";
    else {
      html = "<ul>";
      keys.slice(0, 30).forEach(function (k) {
        html += "<li><code>" + k + "</code> — <strong>" + pages[k] + "</strong></li>";
      });
      html += "</ul>";
    }
    $("pageBreak").innerHTML = html;

    var ev = (data.events || []).slice().reverse().slice(0, 50);
    var tb = $("logBody");
    tb.innerHTML = "";
    if (!ev.length) {
      tb.innerHTML = "<tr><td colspan=\"3\">Kayıt yok</td></tr>";
    } else {
      ev.forEach(function (e) {
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + (e.t || "") + "</td><td>" + (e.path || "") + "</td><td>" + (e.note || "") + "</td>";
        tb.appendChild(tr);
      });
    }
  }

  function showDash(on) {
    $("loginBox").classList.toggle("hidden", on);
    $("dashBox").classList.toggle("hidden", !on);
    if (on) render();
  }

  $("adminLogin").addEventListener("click", function () {
    var pass = ($("adminPass").value || "").trim();
    $("loginErr").classList.add("hidden");
    sha256(pass).then(function (h) {
      if (h === PASS_HASH) {
        setAuth(true);
        showDash(true);
      } else {
        $("loginErr").classList.remove("hidden");
      }
    });
  });

  $("adminPass").addEventListener("keydown", function (e) {
    if (e.key === "Enter") $("adminLogin").click();
  });

  $("btnLogout").addEventListener("click", function () {
    setAuth(false);
    showDash(false);
  });

  $("btnRefresh").addEventListener("click", render);

  $("btnExport").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(loadAnalytics(), null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "konyago-analytics-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
  });

  $("btnClear").addEventListener("click", function () {
    if (!confirm("Tüm yerel analitik kayıtları silinsin mi?")) return;
    localStorage.removeItem("konyago_analytics");
    render();
  });

  if (isAuthed()) showDash(true);
})();
