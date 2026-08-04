/* KonyaGo Radyo player v2 */
(function (w, d) {
  "use strict";
  if (d.getElementById("kgRadyoDone")) return;
  var flag = d.createElement("meta");
  flag.id = "kgRadyoDone";
  d.head.appendChild(flag);

  var state = {
    tracks: [],
    index: 0,
    playing: false,
    shuffle: false,
    order: [],
    errors: 0
  };

  function $(id) {
    return d.getElementById(id);
  }

  function fmtTime(s) {
    if (!isFinite(s)) return "0:00";
    s = Math.max(0, Math.floor(s));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function rebuildOrder() {
    var n = state.tracks.length;
    state.order = [];
    for (var i = 0; i < n; i++) state.order.push(i);
    if (state.shuffle) {
      for (var j = n - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var t = state.order[j];
        state.order[j] = state.order[k];
        state.order[k] = t;
      }
    }
  }

  function currentTrack() {
    if (!state.tracks.length) return null;
    return state.tracks[state.order[state.index] % state.tracks.length];
  }

  function renderList() {
    var box = $("radyoList");
    if (!box) return;
    var activeIdx = state.order[state.index];
    var html = "";
    state.tracks.forEach(function (tr, i) {
      html +=
        '<button type="button" class="radyo-track' +
        (activeIdx === i ? " active" : "") +
        '" data-i="' +
        i +
        '"><strong>' +
        (tr.title || "Parca") +
        "</strong><span>" +
        (tr.artist || "") +
        (tr.region ? " · " + tr.region : "") +
        (tr.license ? " · " + tr.license : "") +
        "</span></button>";
    });
    box.innerHTML = html;
    box.onclick = function (e) {
      var btn = e.target.closest(".radyo-track");
      if (!btn) return;
      var i = Number(btn.getAttribute("data-i"));
      var pos = state.order.indexOf(i);
      state.index = pos >= 0 ? pos : i;
      state.errors = 0;
      loadAndPlay(true);
    };
  }

  function setMeta(tr) {
    var title = $("radyoTitle");
    var sub = $("radyoSub");
    var badge = $("radyoBadge");
    if (title) title.textContent = tr ? tr.title : "KonyaGo Radyo";
    if (sub)
      sub.textContent = tr
        ? [tr.artist, tr.region, tr.mood].filter(Boolean).join(" · ")
        : "Liste hazirlaniyor";
    if (badge) badge.textContent = state.playing ? "CANLI" : "HAZIR";
  }

  function loadAndPlay(autoplay) {
    var audio = $("radyoAudio");
    var tr = currentTrack();
    if (!audio || !tr || !tr.src) {
      setMeta(null);
      return;
    }
    setMeta(tr);
    renderList();
    if (audio.src !== tr.src) {
      audio.src = tr.src;
      audio.load();
    }
    if (autoplay) {
      var p = audio.play();
      if (p && p.catch)
        p.catch(function () {
          state.playing = false;
          updatePlayBtn();
        });
    }
  }

  function updatePlayBtn() {
    var btn = $("radyoPlay");
    if (!btn) return;
    btn.textContent = state.playing ? "Duraklat" : "Cal";
    btn.setAttribute("aria-pressed", state.playing ? "true" : "false");
  }

  function next(delta) {
    if (!state.tracks.length) return;
    state.index = (state.index + delta + state.tracks.length) % state.tracks.length;
    loadAndPlay(true);
  }

  function bind() {
    var audio = $("radyoAudio");
    if (!audio) return;

    $("radyoPlay") &&
      $("radyoPlay").addEventListener("click", function (e) {
        e.preventDefault();
        if (!state.tracks.length) return;
        if (state.playing) audio.pause();
        else {
          if (!audio.src) loadAndPlay(true);
          else audio.play().catch(function () {});
        }
      });

    $("radyoNext") &&
      $("radyoNext").addEventListener("click", function (e) {
        e.preventDefault();
        state.errors = 0;
        next(1);
      });
    $("radyoPrev") &&
      $("radyoPrev").addEventListener("click", function (e) {
        e.preventDefault();
        state.errors = 0;
        next(-1);
      });
    $("radyoShuffle") &&
      $("radyoShuffle").addEventListener("click", function (e) {
        e.preventDefault();
        state.shuffle = !state.shuffle;
        rebuildOrder();
        $("radyoShuffle").classList.toggle("on", state.shuffle);
        renderList();
      });

    audio.addEventListener("play", function () {
      state.playing = true;
      state.errors = 0;
      updatePlayBtn();
      setMeta(currentTrack());
    });
    audio.addEventListener("pause", function () {
      state.playing = false;
      updatePlayBtn();
    });
    audio.addEventListener("ended", function () {
      next(1);
    });
    audio.addEventListener("error", function () {
      state.errors += 1;
      if (state.errors >= state.tracks.length) {
        var sub = $("radyoSub");
        if (sub) sub.textContent = "Kaynak gecici olarak ulasilamiyor";
        state.playing = false;
        updatePlayBtn();
        return;
      }
      next(1);
    });
    audio.addEventListener("timeupdate", function () {
      var cur = $("radyoTime");
      var bar = $("radyoBar");
      if (cur) cur.textContent = fmtTime(audio.currentTime) + " / " + fmtTime(audio.duration);
      if (bar && audio.duration && d.activeElement !== bar)
        bar.value = String((audio.currentTime / audio.duration) * 100);
    });
    var bar = $("radyoBar");
    if (bar) {
      bar.addEventListener("input", function () {
        if (!audio.duration) return;
        audio.currentTime = (Number(bar.value) / 100) * audio.duration;
      });
    }
  }

  function boot() {
    bind();
    fetch("assets/data/radyo-playlist.json?v=" + Date.now(), { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("playlist");
        return r.json();
      })
      .then(function (data) {
        state.tracks = data.tracks || [];
        rebuildOrder();
        renderList();
        if (state.tracks.length) {
          loadAndPlay(true);
          setMeta(currentTrack());
        }
        var note = $("radyoNote");
        if (note && data.note) note.textContent = data.note;
      })
      .catch(function () {
        var sub = $("radyoSub");
        if (sub) sub.textContent = "Liste yuklenemedi";
      });
  }

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
