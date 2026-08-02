/* KonyaGo gizli yönetim — şifre yalnızca bu cihazda (localStorage) */
(function () {
  "use strict";

  var AUTH_KEY = "konyago_admin_ok";
  var HASH_KEY = "konyago_admin_hash_v1";

  function $(id) { return document.getElementById(id); }

  function sha256(str) {
    var data = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", data).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    });
  }

  function getStoredHash() {
    try { return (localStorage.getItem(HASH_KEY) || "").trim(); } catch (e) { return ""; }
  }

  function setStoredHash(h) {
    try { localStorage.setItem(HASH_KEY, h); } catch (e) {}
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

  function sharedLast() {
    try {
      return JSON.parse(localStorage.getItem("konyago_shared_last") || "null");
    } catch (e) {
      return null;
    }
  }

  function render() {
    var data = loadAnalytics();
    var today = (function () {
      try {
        return new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Istanbul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(new Date());
      } catch (e) {
        return new Date().toISOString().slice(0, 10);
      }
    })();
    var day = (data.days && data.days[today]) || { hits: 0, sessions: 0 };
    var shared = sharedLast();

    if ($("sToday")) $("sToday").textContent = String(day.hits || 0);
    if ($("sPublic")) $("sPublic").textContent = shared && shared.day === today ? String(shared.count) : (shared ? String(shared.count) + "*" : "—");
    if ($("sSessions")) $("sSessions").textContent = String(day.sessions || 0);
    if ($("sPages")) $("sPages").textContent = String((data.events && data.events.length) || 0);

    var pubNote = $("sPublicNote");
    if (pubNote) {
      pubNote.textContent = shared
        ? ("Ortak sayaç · gün: " + shared.day + " · tüm tarayıcılarda aynı API değeri")
        : "Ortak sayaç henüz alınamadı (internet / API).";
    }

    var pages = data.pages || {};
    var keys = Object.keys(pages).sort(function (a, b) { return pages[b] - pages[a]; });
    var html = "";
    if (!keys.length) html = "<p>Henüz sayfa kaydı yok.</p>";
    else {
      html = "<ul>";
      keys.slice(0, 30).forEach(function (k) {
        html += "<li><code>" + k + "</code> — <strong>" + pages[k] + "</strong></li>";
      });
      html += "</ul>";
    }
    if ($("pageBreak")) $("pageBreak").innerHTML = html;

    var ev = (data.events || []).slice().reverse().slice(0, 50);
    var tb = $("logBody");
    if (!tb) return;
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
    if ($("loginBox")) $("loginBox").classList.toggle("hidden", on);
    if ($("dashBox")) $("dashBox").classList.toggle("hidden", !on);
    if (on) render();
  }

  function updateLoginUI() {
    var has = !!getStoredHash();
    var title = $("loginTitle");
    var hint = $("loginHint");
    var btn = $("adminLogin");
    if (title) title.textContent = has ? "Yönetim girişi" : "İlk kurulum";
    if (hint) {
      hint.textContent = has
        ? "Şifre yalnızca bu tarayıcıda saklanır; repoda veya sunucuda yoktur."
        : "Bu cihazda ilk kez bir yönetim şifresi belirle (en az 8 karakter). Şifre sunucuya gitmez.";
    }
    if (btn) btn.textContent = has ? "Giriş" : "Şifreyi kaydet ve gir";
  }

  function loginOrSetup() {
    var pass = (($("adminPass") && $("adminPass").value) || "").trim();
    var err = $("loginErr");
    if (err) {
      err.classList.add("hidden");
      err.textContent = "Şifre hatalı.";
    }
    if (pass.length < 8) {
      if (err) {
        err.textContent = "En az 8 karakter gir.";
        err.classList.remove("hidden");
      }
      return;
    }
    var stored = getStoredHash();
    sha256(pass).then(function (h) {
      if (!stored) {
        setStoredHash(h);
        setAuth(true);
        showDash(true);
        updateLoginUI();
        return;
      }
      if (h === stored) {
        setAuth(true);
        showDash(true);
      } else if (err) {
        err.classList.remove("hidden");
      }
    });
  }

  if ($("adminLogin")) $("adminLogin").addEventListener("click", loginOrSetup);
  if ($("adminPass")) {
    $("adminPass").addEventListener("keydown", function (e) {
      if (e.key === "Enter") loginOrSetup();
    });
  }

  if ($("btnLogout")) {
    $("btnLogout").addEventListener("click", function () {
      setAuth(false);
      showDash(false);
      updateLoginUI();
    });
  }

  if ($("btnRefresh")) $("btnRefresh").addEventListener("click", render);

  if ($("btnExport")) {
    $("btnExport").addEventListener("click", function () {
      var blob = new Blob([JSON.stringify({
        analytics: loadAnalytics(),
        shared: sharedLast()
      }, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "konyago-analytics-" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
    });
  }

  if ($("btnClear")) {
    $("btnClear").addEventListener("click", function () {
      if (!confirm("Yerel analitik kayıtları silinsin mi? (Ortak ziyaret sayacı silinmez)")) return;
      localStorage.removeItem("konyago_analytics");
      render();
    });
  }

  if ($("btnResetPass")) {
    $("btnResetPass").addEventListener("click", function () {
      if (!confirm("Bu tarayıcıdaki yönetim şifresi sıfırlansın mı? Yeni şifre belirlemen gerekir.")) return;
      try { localStorage.removeItem(HASH_KEY); } catch (e) {}
      setAuth(false);
      showDash(false);
      updateLoginUI();
    });
  }

  updateLoginUI();
  if (isAuthed() && getStoredHash()) showDash(true);
  else showDash(false);
})();
