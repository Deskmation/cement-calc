/* Cement Calc - dump-bailer cement calculator (15 Oct 2026).
   The question on the job: for a plug of so many feet in this pipe, how much cement is that (litres, gallons,
   barrels, cubic feet), and how many runs with which bailer? Then, as the runs go down, where is the cement now.
   The arithmetic is the dump-bailer CALC_MASTER sheet's: capacity = 158.987 / 1029.45 lts per ft per in² of ID
   (the bailer's 159 / 1029.45), a bailer is run in 5 ft joints so the last run is rounded UP to a multiple of 5 ft
   (1 m in metres), the cement is placed from the bottom up. Everything stays on the phone; no server. */
(function () {
  "use strict";
  var KEY = "cc.state.1";
  var app = document.getElementById("app");
  var L2G = 3.78541, L2BBL = 158.987, L2CUFT = 28.3168, FT = 0.3048, IN = 25.4;
  var BAILER_K = 159.0 / 1029.45, CASING_K = 158.987 / 1029.45;
  var VOL = { l: ["L", "litres", 1], gal: ["gal", "US gallons", L2G], bbl: ["bbl", "barrels", L2BBL], cuft: ["ft³", "cubic feet", L2CUFT] };

  // ---- the pipe tables: API casing (OD -> [[lb/ft, ID]]) and API 5CT tubing. Anything else: type the ID.
  var CASING = {"4.5":[[9.5,4.09],[10.5,4.052],[11.6,4.0],[12.6,3.958],[13.5,3.92],[15.1,3.826],[16.6,3.754],[16.9,3.74],[17.7,3.696],[18.8,3.64],[21.6,3.5],[24.6,3.38],[26.5,3.24]],"5.0":[[11.5,4.56],[13.0,4.494],[15.0,4.408],[18.0,4.276],[20.3,4.184],[20.8,4.156],[21.4,4.126],[23.2,4.044],[24.2,4.0],[26.7,3.876],[32.0,3.62]],"5.5":[[13.0,5.044],[14.0,5.012],[15.5,4.95],[17.0,4.892],[20.0,4.778],[23.0,4.67],[26.0,4.548],[28.4,4.44],[29.7,4.376],[32.3,4.276],[36.4,4.09],[39.3,4.044]],"6.0":[[15.0,5.542],[18.0,5.424],[20.0,5.352],[23.0,5.24],[26.0,5.132]],"6.625":[[17.0,6.135],[20.0,6.049],[24.0,5.921],[28.0,5.791],[32.0,5.675],[35.0,5.575],[43.2,5.375],[69.6,4.375]],"7.0":[[17.0,6.538],[20.0,6.456],[23.0,6.366],[26.0,6.276],[29.0,6.184],[32.0,6.094],[35.0,6.004],[38.0,5.92],[41.0,5.82],[42.7,5.75],[44.0,5.72],[45.4,5.66],[49.5,5.54],[56.1,5.376],[58.0,5.24],[66.5,5.04]],"7.625":[[20.0,7.125],[24.0,7.025],[26.4,6.969],[29.7,6.875],[33.7,6.765],[39.0,6.625],[42.8,6.501],[45.3,6.435],[47.1,6.375],[51.2,6.249],[52.8,6.201],[55.8,6.201]],"7.75":[[46.1,6.56]],"8.625":[[24.0,8.097],[28.0,8.017],[32.0,7.921],[36.0,7.825],[40.0,7.725],[44.0,7.625],[49.0,7.511],[52.0,7.435]],"8.75":[[49.7,7.636]],"9.625":[[29.3,9.063],[32.3,9.001],[36.0,8.921],[38.0,8.885],[40.0,8.835],[43.5,8.755],[47.0,8.681],[53.5,8.535],[58.4,8.435],[59.4,8.407],[61.1,8.375],[64.9,8.281],[70.3,8.157],[71.8,8.125]],"9.75":[[59.2,8.56]],"9.875":[[62.8,8.625]],"10.75":[[32.8,10.192],[35.8,10.136],[40.5,10.05],[45.5,9.95],[51.0,9.85],[55.5,9.76],[60.7,9.66],[65.7,9.56],[71.1,9.45],[73.2,9.406],[76.0,9.35],[79.2,9.282],[81.0,9.25]],"11.75":[[38.0,11.15],[42.0,11.084],[47.0,11.0],[54.0,10.88],[60.0,10.772],[65.0,10.682],[66.7,10.656],[71.0,10.586],[73.6,10.532],[75.0,10.514],[76.0,10.5],[79.0,10.438],[80.5,10.406],[83.0,10.368],[87.2,10.282],[95.0,10.124]],"11.875":[[71.8,10.711]],"13.375":[[48.0,12.715],[54.5,12.615],[61.0,12.515],[68.0,12.415],[72.0,12.347],[77.0,12.275],[80.7,12.215],[83.0,12.175],[85.0,12.159],[86.0,12.125],[91.0,12.055],[92.0,12.031],[96.0,11.975],[98.0,11.937],[100.3,11.907],[102.0,11.889]],"13.5":[[81.4,12.34]],"13.625":[[88.2,12.375]],"16.0":[[55.0,15.375],[62.0,15.25],[65.0,15.25],[70.0,15.125],[75.0,15.062],[84.0,14.938],[109.0,14.688]],"18.625":[[87.5,17.755],[112.0,17.615]],"20.0":[[94.0,19.124],[106.5,19.0],[133.0,18.73],[169.0,18.376]]};
  var TUBING = { "1.05": [[1.14, 0.824], [1.48, 0.742]], "1.315": [[1.7, 1.049], [2.19, 0.957]], "1.66": [[2.3, 1.38], [3.03, 1.278]],
    "1.9": [[2.75, 1.61], [3.65, 1.5], [4.42, 1.41]], "2.063": [[3.25, 1.751], [4.5, 1.613]],
    "2.375": [[4.0, 2.041], [4.6, 1.995], [5.8, 1.867], [6.6, 1.785], [7.35, 1.703]],
    "2.875": [[6.4, 2.441], [7.8, 2.323], [8.6, 2.259], [9.35, 2.195], [10.5, 2.091], [11.5, 1.995]],
    "3.5": [[7.7, 3.068], [9.2, 2.992], [10.2, 2.922], [12.7, 2.75], [15.5, 2.548]], "4.0": [[9.5, 3.548], [11.0, 3.476], [13.2, 3.34]],
    "4.5": [[12.6, 3.958], [15.5, 3.826], [19.2, 3.64]] };
  var LABEL = { "1.05": "1.050\"", "1.315": "1.315\"", "1.66": "1.660\"", "1.9": "1.900\"", "2.063": "2.063\"", "2.375": "2⅜\"", "2.875": "2⅞\"", "3.5": "3½\"",
    "4.0": "4\"", "4.5": "4½\"", "5.0": "5\"", "5.5": "5½\"", "6.0": "6\"", "6.625": "6⅝\"", "7.0": "7\"", "7.625": "7⅝\"", "7.75": "7¾\"",
    "8.625": "8⅝\"", "8.75": "8¾\"", "9.625": "9⅝\"", "9.75": "9¾\"", "9.875": "9⅞\"", "10.75": "10¾\"", "11.75": "11¾\"", "11.875": "11⅞\"",
    "13.375": "13⅜\"", "13.5": "13½\"", "13.625": "13⅝\"", "16.0": "16\"", "18.625": "18⅝\"", "20.0": "20\"" };
  var BAILERS = ["1.5", "1.75", "2", "2.1", "2.25", "2.6", "3"];       // the usual bailer IDs, inches; any other is typed

  // ---- the arithmetic (inputs in ft and inches; the screen converts)
  function calc(csgId, blrId, bottom, top, runLen, joint) {
    var height = bottom - top;
    if (!(bottom > 0) || !(top >= 0)) return { error: "Type the plug bottom and the new top (or the height)." };
    if (!(height > 0)) return { error: "The new top must be ABOVE the bottom of the plug." };
    if (!(csgId > 0)) return { error: "Pick the pipe at the plug, or type its ID." };
    if (!(blrId > 0)) return { error: "Pick the bailer." };
    runLen = runLen > 0 ? runLen : 40; joint = joint > 0 ? joint : 5;
    var blrFt = BAILER_K * blrId * blrId, csgFt = CASING_K * csgId * csgId;
    var req = height * csgFt, runsFrac = req / (blrFt * runLen);
    var full = Math.floor(runsFrac + 1e-9), lastTheo = (runsFrac - full) * runLen;
    var lastFt = Math.ceil(lastTheo / joint - 1e-9) * joint, lastLts = blrFt * lastFt, oneRun = runLen * blrFt;
    var total = runLen * full * blrFt + lastLts, cemented = total / csgFt;
    return { height: height, blr_ft: blrFt, csg_ft: csgFt, req_lts: req, full_runs: full, run_len: runLen, last_ft: lastFt, last_lts: lastLts,
      one_run_lts: oneRun, total_lts: total, cemented_ft: cemented, new_toc: bottom - cemented, over_ft: cemented - height,
      total_runs: full + (lastFt > 0 ? 1 : 0), cover_long: oneRun / csgFt, cover_last: lastLts / csgFt };
  }

  // ---- state, saved on the phone
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private window or full */ } }
  var S = load() || { depth: "ft", idu: "in", vol: "l", kind: "casing", size: "", wt: "", id: "", bottom: "", top: "", blr: "2", blrOther: "", len: "40", lenOther: "", od: "", restr: "", done: 0 };
  function todayIso() { var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }
  function blankJob(keep) { keep = keep || {}; return { client: keep.client || "", well: "", field: "", ref: "", unit: keep.unit || "", date: todayIso(), by: keep.by || "", remarks: "" }; }
  if (!S.job) S.job = blankJob();
  var fromMain = false;                  // the report was opened from the calculator: Back = the browser's back

  // ---- DOM helpers: typed text is always text, never HTML
  function h(tag, attrs) {
    var el = document.createElement(tag), i, a;
    attrs = attrs || {};
    for (a in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, a) || attrs[a] == null || attrs[a] === false) continue;
      if (a === "text") el.textContent = attrs[a];
      else if (a === "on") { for (var ev in attrs.on) el.addEventListener(ev, attrs.on[ev]); }
      else if (a === "cls") el.className = attrs[a];
      else el.setAttribute(a, attrs[a]);
    }
    for (i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { add(el, x); });
    else el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
  function toNum(v) { var n = Number(String(v == null ? "" : v).replace(/,/g, "").trim()); return String(v == null ? "" : v).trim() !== "" && isFinite(n) ? n : null; }
  function f(v, d) { return v == null || !isFinite(v) ? "–" : v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function numIn(id, ph, val, onIn) {
    var el = h("input", { cls: "in", id: id, type: "text", inputmode: "decimal", placeholder: ph || "", autocomplete: "off" });
    if (val != null && val !== "") el.value = val;
    el.addEventListener("input", function () { onIn(el.value); });
    return el;
  }
  function chipRow(list, cur, onPick) {
    var row = h("div", { cls: "chips" });
    list.forEach(function (x) {
      add(row, h("button", { cls: "chip", "aria-pressed": String(cur === x[0]), text: x[1], on: { click: function (ev) {
        Array.prototype.forEach.call(row.children, function (c) { c.setAttribute("aria-pressed", String(c === ev.currentTarget)); });
        onPick(x[0]);
      } } }));
    });
    return row;
  }
  function dd(dl, pairs) { dl.textContent = ""; pairs.forEach(function (p) { if (p) add(dl, [h("dt", { text: p[0] }), h("dd", null, p[1], p[2] ? h("small", { text: p[2] }) : null)]); }); }

  // ---- units: depth ft or m, ID in or mm, volume L / gal / bbl / ft³
  function du() { return S.depth === "m" ? "m" : "ft"; }
  function toFt(v) { return v == null ? null : S.depth === "m" ? v / FT : v; }          // typed depth -> ft
  function fromFt(v) { return S.depth === "m" ? v * FT : v; }                           // ft -> shown depth
  function toIn(v) { return v == null ? null : S.idu === "mm" ? v / IN : v; }
  function vol(l) { return f(l / VOL[S.vol][2], S.vol === "bbl" ? 3 : 2) + " " + VOL[S.vol][0]; }
  function volAll(l) {
    return h("div", { cls: "vol" }, Object.keys(VOL).map(function (k) {
      return h("div", { cls: k === S.vol ? "on" : "" }, h("b", { text: f(l / VOL[k][2], k === "bbl" ? 3 : 2) }), h("small", { text: VOL[k][0] }));
    }));
  }
  function dep(v, d) { return f(fromFt(v), d == null ? 1 : d) + " " + du(); }
  function inputs() {
    var blr = S.blr === "other" ? S.blrOther : S.blr, len = S.len === "other" ? S.lenOther : S.len;
    return { csg: toIn(toNum(S.id)), blr: toIn(toNum(blr)), bottom: toFt(toNum(S.bottom)), top: toFt(toNum(S.top)),
      len: toFt(toNum(len)), joint: S.depth === "m" ? 1 / FT : 5 };
  }

  // ---- the screen
  function build() {
    app.textContent = "";
    var band = h("div", { cls: "band" }, h("h1", null, "Cement Calc", h("span", { cls: "sub", text: "dump bailer · volume, runs, new TOC" })),
      h("div", { cls: "units" }, ["ft", "m"].map(function (u) {
        return h("button", { "aria-pressed": String(S.depth === u), text: u, on: { click: function () { switchDepth(u); } } });
      })));
    // the answer
    var big = h("div", { cls: "big" }), runs = h("div", { cls: "runs" }), kv = h("dl", { cls: "kv" }), volBox = h("div"), wait = h("div", { cls: "wait" });
    var volChips = chipRow(Object.keys(VOL).map(function (k) { return [k, VOL[k][1]]; }), S.vol, function (k) { S.vol = k; recalc(); });
    var res = h("div", { cls: "card res" }, h("div", { cls: "spread" }, h("div", { cls: "sec", text: "Cement needed" }),
      h("button", { cls: "link", text: "Report ›", on: { click: openReport } })), wait, big, runs, h("div", { cls: "sec", text: "in every unit" }), volBox, volChips, kv);

    // 1. the pipe at the plug
    var sizeSel = h("select", { cls: "in", id: "sz" }), wtSel = h("select", { cls: "in", id: "wt" });
    var idIn = numIn("id", "type the ID", S.id, function (v) { S.id = v; S.wt = ""; wtSel.value = ""; idLine(); recalc(); });
    var idHint = h("div", { cls: "hint" });
    var idUnit = chipRow([["in", "inches"], ["mm", "mm"]], S.idu, function (u) {
      var cur = toNum(S.id);
      if (cur != null) { S.id = String(Math.round((u === "mm" ? cur * IN : cur / IN) * 1000) / 1000); idIn.value = S.id; }
      S.idu = u; idLine(); recalc();
    });
    function table() { return S.kind === "tubing" ? TUBING : S.kind === "casing" ? CASING : {}; }
    function sizes() { return Object.keys(table()).sort(function (a, b) { return Number(a) - Number(b); }); }
    function fillSize() {
      sizeSel.textContent = "";
      add(sizeSel, h("option", { value: "", text: S.kind === "other" ? "any pipe: type the ID" : "size…" }));
      sizes().forEach(function (sz) { add(sizeSel, h("option", { value: sz, text: (LABEL[sz] || sz + "\"") + " " + S.kind })); });
      sizeSel.value = table()[S.size] ? S.size : ""; sizeSel.disabled = S.kind === "other";
    }
    function fillWt() {
      wtSel.textContent = "";
      add(wtSel, h("option", { value: "", text: S.kind === "other" ? "–" : table()[S.size] ? "weight lb/ft…" : "pick the size first" }));
      (table()[S.size] || []).forEach(function (r) { add(wtSel, h("option", { value: String(r[0]), text: r[0] + " lb/ft  ·  ID " + r[1].toFixed(3) + "\"" })); });
      wtSel.value = S.wt || ""; wtSel.disabled = S.kind === "other" || !table()[S.size];
    }
    function setIdFromTable() {
      var rows = table()[S.size] || [];
      for (var k = 0; k < rows.length; k++) if (String(rows[k][0]) === String(S.wt)) {
        S.id = String(S.idu === "mm" ? Math.round(rows[k][1] * IN * 10) / 10 : rows[k][1]); idIn.value = S.id; return;
      }
    }
    function idLine() {
      var id = toIn(toNum(S.id));
      idHint.textContent = id ? ((table()[S.size] && S.wt) ? (LABEL[S.size] || S.size + "\"") + " " + S.wt + " lb/ft " + S.kind + " · " : "")
        + "ID " + f(id, 3) + "\" (" + f(id * IN, 1) + " mm) holds " + f(CASING_K * id * id, 2) + " L per ft · " + f(CASING_K * id * id / FT, 2) + " L per m"
        : "Pick the size and weight, or type the ID yourself (a liner, a nipple, an odd pipe).";
    }
    sizeSel.addEventListener("change", function () { S.size = sizeSel.value; S.wt = ""; fillWt(); idLine(); recalc(); });
    wtSel.addEventListener("change", function () { S.wt = wtSel.value; setIdFromTable(); idLine(); recalc(); });
    var kindChips = chipRow([["casing", "Casing"], ["tubing", "Tubing"], ["other", "Other · type the ID"]], S.kind, function (k) {
      S.kind = k; S.wt = ""; if (!table()[S.size]) S.size = "";
      fillSize(); fillWt(); idLine(); recalc(); if (k === "other") idIn.focus();
    });
    fillSize(); fillWt(); idLine();
    var pipe = h("div", { cls: "card" }, h("div", { cls: "sec", text: "Pipe at the plug" }), kindChips,
      h("div", { cls: "grid2" }, h("label", { cls: "f", "for": "sz" }, "Size", sizeSel), h("label", { cls: "f", "for": "wt" }, "Weight", wtSel)),
      h("label", { cls: "f", "for": "id" }, "ID (free to type)", idIn), idUnit, idHint);

    // 2. the plug
    var bot, top, hgt;
    function hv() { var b = toNum(S.bottom), t = toNum(S.top); return b != null && t != null ? String(Math.round((b - t) * 100) / 100) : ""; }
    bot = numIn("bot", du(), S.bottom, function (v) {
      S.bottom = v; var b = toNum(v), x = toNum(hgt.value);
      if (b != null && x != null && toNum(S.top) == null) { S.top = String(Math.round((b - x) * 100) / 100); top.value = S.top; }
      else hgt.value = hv();
      recalc();
    });
    top = numIn("top", du(), S.top, function (v) { S.top = v; hgt.value = hv(); recalc(); });
    hgt = numIn("hgt", du(), hv(), function (v) { var b = toNum(S.bottom), x = toNum(v); if (b != null && x != null) { S.top = String(Math.round((b - x) * 100) / 100); top.value = S.top; } recalc(); });
    var plug = h("div", { cls: "card" }, h("div", { cls: "sec", text: "The plug · " + du() }),
      h("div", { cls: "grid3" }, h("label", { cls: "f", "for": "bot" }, "Bottom", bot), h("label", { cls: "f", "for": "top" }, "New top (TOC)", top), h("label", { cls: "f", "for": "hgt" }, "Height", hgt)),
      h("div", { cls: "hint", text: "Bottom and new top, or bottom and height. Depths along the hole." }));

    // 3. the bailer
    var blrOther = numIn("blr", "ID " + S.idu, S.blrOther, function (v) { S.blrOther = v; recalc(); });
    blrOther.hidden = S.blr !== "other";
    var blrChips = chipRow(BAILERS.map(function (b) { return [b, b + "\""]; }).concat([["other", "other…"]]), S.blr, function (b) {
      S.blr = b; blrOther.hidden = b !== "other"; if (b === "other") blrOther.focus(); recalc();
    });
    var lens = S.depth === "m" ? [["6", "6 m"], ["9", "9 m"], ["12", "12 m"], ["18", "18 m"]] : [["20", "20 ft"], ["30", "30 ft"], ["40", "40 ft"], ["60", "60 ft"]];
    var lenOther = numIn("len", du(), S.lenOther, function (v) { S.lenOther = v; recalc(); });
    lenOther.hidden = S.len !== "other";
    var lenChips = chipRow(lens.concat([["other", "other…"]]), S.len, function (v) { S.len = v; lenOther.hidden = v !== "other"; if (v === "other") lenOther.focus(); recalc(); });
    var od = numIn("od", S.idu, S.od, function (v) { S.od = v; fit(); save(); });
    var restr = numIn("re", "smallest ID above", S.restr, function (v) { S.restr = v; fit(); save(); });
    var fitLine = h("div", { cls: "hint" });
    function fit() {
      var o = toNum(S.od), r = toNum(S.restr);
      if (o != null && r != null) { fitLine.className = r <= o ? "note bad" : "hint"; fitLine.textContent = r <= o ? "⚠ a " + o + " " + S.idu + " OD bailer will NOT pass a " + r + " " + S.idu + " restriction - wrong bailer" : "the " + o + " " + S.idu + " OD bailer passes the " + r + " " + S.idu + " restriction"; }
      else { fitLine.className = "hint"; fitLine.textContent = "Optional: the bailer OD and the smallest ID it must pass (a nipple, the tubing)."; }
    }
    fit();
    var bailer = h("div", { cls: "card" }, h("div", { cls: "sec", text: "Dump bailer" }),
      h("div", { cls: "f" }, h("span", { text: "Bailer ID · " + S.idu }), blrChips, blrOther),
      h("div", { cls: "f" }, h("span", { text: "Bailer length per run" }), lenChips, lenOther),
      h("div", { cls: "grid2" }, h("label", { cls: "f", "for": "od" }, "Bailer OD · " + S.idu, od), h("label", { cls: "f", "for": "re" }, "Restriction · " + S.idu, restr)), fitLine);

    // 4. which bailer: every bailer against this plug
    var cmpBody = h("tbody"), cmpNote = h("div", { cls: "hint", text: "Tap a bailer to plan with it." });
    var cmp = h("div", { cls: "card" }, h("div", { cls: "sec", text: "Which bailer" }),
      h("table", { cls: "cmp" }, h("thead", null, h("tr", null, h("th", { text: "Bailer ID" }), h("th", { text: "Per run" }), h("th", { text: "Runs" }))), cmpBody), cmpNote);

    // 5. on the job
    var doneN = h("span", { cls: "n", text: String(S.done || 0) }), doneLine = h("div", { cls: "hint" });
    function bump(d) { S.done = Math.max(0, (S.done || 0) + d); doneN.textContent = String(S.done); recalc(); }
    var onjob = h("div", { cls: "card" }, h("div", { cls: "sec", text: "On the job" }),
      h("div", { cls: "cnt" }, h("button", { cls: "btn ghost sm", text: "−", "aria-label": "one run less", on: { click: function () { bump(-1); } } }),
        h("span", { cls: "lab" }, "runs dumped ", doneN), h("button", { cls: "btn sm", text: "+ 1 run", on: { click: function () { bump(1); } } })), doneLine);

    // 6. the job, for the report (section 1 of the report)
    function txt(id, key, lab, attrs) {
      var a = { cls: "in", id: id, type: "text", autocomplete: "off" }, k;
      for (k in (attrs || {})) a[k] = attrs[k];
      var area = a.type === "area";
      if (area) delete a.type;
      var el = h(area ? "textarea" : "input", a);
      el.value = S.job[key] || "";
      el.addEventListener("input", function () { S.job[key] = el.value; save(); });
      return h("label", { cls: "f", "for": id }, lab, el);
    }
    var job = h("div", { cls: "card" }, h("div", { cls: "sec", text: "Job data · for the report" }),
      h("div", { cls: "grid2" },
        txt("j-client", "client", "Client"), txt("j-well", "well", "Well", { autocapitalize: "characters" }),
        txt("j-field", "field", "Field / area"), txt("j-ref", "ref", "Request / job no."),
        txt("j-unit", "unit", "Unit / rig"), txt("j-date", "date", "Date", { type: "date" })),
      txt("j-by", "by", "Prepared by", { autocapitalize: "words" }),
      txt("j-rem", "remarks", "Remarks", { type: "area", rows: "2", placeholder: "anything the report should say" }),
      h("button", { cls: "btn", text: "Generate report", on: { click: openReport } }));

    var reset = h("button", { cls: "link", text: "Start again", on: { click: function () {
      S = { depth: S.depth, idu: S.idu, vol: S.vol, kind: "casing", size: "", wt: "", id: "", bottom: "", top: "", blr: "2", blrOther: "", len: "40", lenOther: "", od: "", restr: "", done: 0, job: blankJob(S.job) };
      save(); build();
    } } });
    var foot = h("div", { cls: "foot" }, h("div", { cls: "spread" }, h("span", { text: "Capacity 158.987 / 1029.45 L per ft per in² · the last run rounded up to " + (S.depth === "m" ? "1 m" : "5 ft") + " joints." }), reset),
      h("div", { text: "Works without signal · a Deskmation Labs product" }));

    function recalc() {
      save();
      var i = inputs(), r = calc(i.csg, i.blr, i.bottom, i.top, i.len, i.joint);
      cmpBody.textContent = "";
      if (r.error) {
        res.className = "card res wait"; wait.textContent = r.error; big.textContent = ""; runs.textContent = ""; kv.textContent = ""; volBox.textContent = ""; doneLine.textContent = "";
        if (i.csg > 0 && i.bottom > 0 && i.bottom - i.top > 0) fillCmp(i); return;
      }
      res.className = "card res"; wait.textContent = "";
      big.textContent = vol(r.req_lts);
      runs.textContent = r.total_runs + (r.total_runs === 1 ? " run" : " runs") + " · " + [r.full_runs ? r.full_runs + " × " + f(fromFt(r.run_len), 0) + " " + du() : "", r.last_ft ? "1 × " + f(fromFt(r.last_ft), S.depth === "m" ? 1 : 0) + " " + du() : ""].filter(Boolean).join(" + ")
        + " of " + f(i.blr, i.blr === Math.round(i.blr * 10) / 10 ? 1 : 2) + "\" bailer";
      volBox.textContent = ""; volBox.appendChild(volAll(r.req_lts));
      dd(kv, [["Plug", dep(r.height) + " in ID " + f(i.csg, 3) + "\"", f(r.csg_ft, 2) + " L per ft of pipe"],
        r.full_runs ? ["Each " + f(fromFt(r.run_len), 0) + " " + du() + " run", vol(r.one_run_lts), "covers " + dep(r.cover_long, 2)] : null,
        r.last_ft ? ["The " + f(fromFt(r.last_ft), S.depth === "m" ? 1 : 0) + " " + du() + " run", vol(r.last_lts), "covers " + dep(r.cover_last, 2)] : null,
        ["Dumped in all", vol(r.total_lts), r.total_runs + (r.total_runs === 1 ? " run" : " runs")],
        ["Cemented", dep(r.cemented_ft, 2), "new TOC " + dep(r.new_toc, 1)],
        [r.over_ft >= 0 ? "Above the target" : "Short of the target", S.depth === "m" ? f(Math.abs(r.over_ft) * FT * 100, 0) + " cm" : f(Math.abs(r.over_ft) * 12, 1) + " in"]]);
      fillCmp(i, r);
      var d = Math.min(S.done || 0, r.total_runs), ftDone = 0;
      for (var k = 0; k < d; k++) ftDone += (k < r.full_runs ? r.one_run_lts : r.last_lts) / r.csg_ft;
      doneLine.textContent = !S.done ? "Count the runs as they are dumped: the theoretical top of cement follows."
        : (S.done > r.total_runs ? "⚠ " + S.done + " runs is more than the plan. " : "") + d + " of " + r.total_runs + " dumped · " + dep(ftDone, 2) + " cemented · theoretical TOC " + dep(r.new_toc + (r.cemented_ft - ftDone), 1)
          + (r.total_runs - d > 0 ? " · " + (r.total_runs - d) + " to go" : " · done, tag the TOC");
    }
    function fillCmp(i) {
      var list = BAILERS.slice(), cur = S.blr === "other" ? S.blrOther : S.blr;
      if (S.blr === "other" && toNum(S.blrOther) != null) list.push(S.blrOther);
      list.forEach(function (b) {
        var r = calc(i.csg, toIn(toNum(b)), i.bottom, i.top, i.len, i.joint);
        if (r.error) return;
        var tr = h("tr", { cls: String(b) === String(cur) ? "on" : "", on: { click: function () {
          if (BAILERS.indexOf(b) >= 0) { S.blr = b; blrOther.hidden = true; } else { S.blr = "other"; S.blrOther = b; blrOther.hidden = false; }
          Array.prototype.forEach.call(blrChips.children, function (c, k) { c.setAttribute("aria-pressed", String(BAILERS[k] === b || (k === BAILERS.length && S.blr === "other"))); });
          recalc();
        } } },
          h("td", null, h("b", { text: f(toIn(toNum(b)), 2) + "\"" }), " · " + f(fromFt(r.run_len), 0) + " " + du()),
          h("td", { text: vol(r.one_run_lts) }),
          h("td", null, h("b", { text: String(r.total_runs) }), r.last_ft && r.last_ft !== r.run_len ? h("small", { text: " (last " + f(fromFt(r.last_ft), S.depth === "m" ? 1 : 0) + " " + du() + ")" }) : null));
        cmpBody.appendChild(tr);
      });
    }
    function switchDepth(u) {
      if (u === S.depth) return;
      var k = u === "m" ? FT : 1 / FT, cv = function (s) { var n = toNum(s); return n == null ? "" : String(Math.round(n * k * 100) / 100); };
      S.bottom = cv(S.bottom); S.top = cv(S.top); S.lenOther = cv(S.lenOther);
      if (S.len !== "other") S.len = { "20": "6", "30": "9", "40": "12", "60": "18", "6": "20", "9": "30", "12": "40", "18": "60" }[S.len] || S.len;
      S.depth = u; save(); build();
    }
    add(app, [band, res, pipe, plug, bailer, cmp, onjob, job, foot]);
    recalc();
  }

  // ---- THE REPORT (16 Oct 2026): three sections - 1 the request / job data, 2 the calculations and the bailers used,
  // 3 the outputs. A paper sheet on screen; "Save as PDF / Print" uses the phone's own print (Save as PDF there).
  function openReport() { fromMain = true; location.hash = "report"; }
  function backToCalc() {
    if (fromMain) { fromMain = false; history.back(); return; }
    history.replaceState(null, "", location.pathname + location.search); render();
  }
  function pipeText() {
    var t = S.kind === "tubing" ? TUBING : S.kind === "casing" ? CASING : {}, sz = LABEL[S.size] || S.size + "\"";
    if (t[S.size] && S.wt) return sz + " " + S.kind + ", " + S.wt + " lb/ft";
    if (t[S.size]) return sz + " " + S.kind + " (ID typed)";
    return S.kind === "other" ? "Other pipe (ID typed)" : S.kind.charAt(0).toUpperCase() + S.kind.slice(1) + " (ID typed)";
  }
  function dayText(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  function inch(v) { return f(v, 3) + " in (" + f(v * IN, 1) + " mm)"; }
  function vAll(l) { return Object.keys(VOL).map(function (k) { return f(l / VOL[k][2], k === "bbl" ? 3 : 2); }); }
  function jointText() { return S.depth === "m" ? "1 m" : "5 ft"; }
  function lenText(ft) { return f(fromFt(ft), S.depth === "m" ? 1 : 0) + " " + du(); }
  function planText(r, blr) {
    return [r.full_runs ? r.full_runs + " × " + lenText(r.run_len) : "", r.last_ft ? "1 × " + lenText(r.last_ft) : ""].filter(Boolean).join(" + ")
      + " of the " + f(blr, 2) + " in bailer";
  }
  function againstText(r) {
    var x = Math.abs(r.over_ft), t = S.depth === "m" ? f(x * FT * 100, 0) + " cm" : f(x * 12, 1) + " in";
    return t + (r.over_ft >= 0 ? " above the target top" : " short of the target top");
  }
  function buildReport() {
    app.textContent = "";
    var i = inputs(), r = calc(i.csg, i.blr, i.bottom, i.top, i.len, i.joint), J = S.job || blankJob();
    var bar = h("div", { cls: "band noprint" },
      h("button", { cls: "back", "aria-label": "Back to the calculator", text: "‹", on: { click: backToCalc } }),
      h("h1", null, "Report", h("span", { cls: "sub", text: [J.well, dayText(J.date)].filter(Boolean).join(" · ") || "dump-bailer cement plug" })));
    if (r.error) {
      add(app, [bar, h("div", { cls: "card" }, h("div", { cls: "note", text: "The report needs a finished calculation. " + r.error }),
        h("button", { cls: "btn", text: "Back to the calculator", on: { click: backToCalc } }))]);
      return;
    }
    var dk = S.depth === "m" ? FT : 1;                          // ft -> the depth unit on screen
    var cp = r.csg_ft / dk, cb = r.blr_ft / dk, Kp = CASING_K / dk, Kb = BAILER_K / dk, perDu = "L/" + du();
    var runsFrac = r.req_lts / r.one_run_lts, lastTheo = (runsFrac - r.full_runs) * r.run_len;
    var od = toNum(S.od), re = toNum(S.restr);

    function section(n, title, kids) { return h("section", { cls: "rs" }, h("h2", null, h("span", { cls: "no", text: String(n) }), title), kids); }
    function sub(t) { return h("h3", { text: t }); }
    function grid(pairs) {
      return h("dl", { cls: "rg" }, pairs.filter(Boolean).map(function (p) {
        return h("div", { cls: p[2] || "" }, h("dt", { text: p[0] }), h("dd", { text: p[1] == null || p[1] === "" ? "–" : String(p[1]) }));
      }));
    }
    function table(head, rows, numFrom, mark) {
      return h("table", { cls: "rt" },
        h("thead", null, h("tr", null, head.map(function (x, k) { return h("th", { cls: k >= numFrom ? "n" : "", text: x }); }))),
        h("tbody", null, rows.map(function (row, ri) {
          return h("tr", { cls: ri === mark ? "on" : "" }, row.map(function (x, k) { return h("td", { cls: k >= numFrom ? "n" : "", text: String(x) }); }));
        })));
    }

    // ---- 1. request / job data
    var s1 = section(1, "Request / job data", [
      grid([["Client", J.client], ["Well", J.well], ["Field / area", J.field], ["Request / job no.", J.ref],
        ["Unit / rig", J.unit], ["Date", dayText(J.date)], ["Prepared by", J.by]]),
      sub("Well data at the plug"),
      grid([["Pipe at the plug", pipeText()], ["Pipe ID", inch(i.csg)], ["Plug bottom", dep(i.bottom, 2)], ["Target top of cement", dep(i.top, 2)],
        ["Plug height", dep(r.height, 2)], ["Restriction above the plug", re != null ? f(re, S.idu === "mm" ? 1 : 3) + " " + S.idu : ""]]),
      J.remarks ? h("p", { cls: "rem" }, h("b", { text: "Remarks: " }), J.remarks) : null]);

    // ---- 2. calculations and bailers used
    var fit = od != null && re != null ? (re <= od ? "NO - the " + od + " " + S.idu + " OD does not pass the " + re + " " + S.idu + " restriction" : "Yes - " + od + " " + S.idu + " OD through " + re + " " + S.idu) : "";
    var steps = [
      ["1", "Pipe capacity", f(Kp, 6) + " × ID² = " + f(Kp, 6) + " × " + f(i.csg, 3) + "²", f(cp, 3) + " " + perDu],
      ["2", "Bailer capacity", f(Kb, 6) + " × ID² = " + f(Kb, 6) + " × " + f(i.blr, 3) + "²", f(cb, 3) + " " + perDu],
      ["3", "Cement required", "plug height × pipe capacity = " + f(fromFt(r.height), 2) + " × " + f(cp, 3), f(r.req_lts, 2) + " L"],
      ["4", "One full run", "run length × bailer capacity = " + f(fromFt(r.run_len), 2) + " × " + f(cb, 3), f(r.one_run_lts, 2) + " L"],
      ["5", "Runs needed", "required ÷ one run = " + f(r.req_lts, 2) + " ÷ " + f(r.one_run_lts, 2), f(runsFrac, 3)],
      ["6", "Full runs", "whole number of step 5", String(r.full_runs)],
      ["7", "Last run", "(" + f(runsFrac, 3) + " − " + r.full_runs + ") × " + f(fromFt(r.run_len), 2) + " = " + f(fromFt(lastTheo), 2) + " " + du() + ", up to whole " + jointText() + " joints", r.last_ft ? lenText(r.last_ft) : "none"],
      ["8", "Last run volume", "last run × bailer capacity = " + f(fromFt(r.last_ft), 2) + " × " + f(cb, 3), f(r.last_lts, 2) + " L"],
      ["9", "Cement dumped", "full runs × one run + last run = " + r.full_runs + " × " + f(r.one_run_lts, 2) + " + " + f(r.last_lts, 2), f(r.total_lts, 2) + " L"],
      ["10", "Cemented height", "dumped ÷ pipe capacity = " + f(r.total_lts, 2) + " ÷ " + f(cp, 3), dep(r.cemented_ft, 2)],
      ["11", "New top of cement", "plug bottom − cemented height = " + f(fromFt(i.bottom), 2) + " − " + f(fromFt(r.cemented_ft), 2), dep(r.new_toc, 2)],
      ["12", "Against the target", "cemented height − plug height", againstText(r)]];
    var list = BAILERS.slice(), cur = S.blr === "other" ? S.blrOther : S.blr, mark = -1;
    if (S.blr === "other" && toNum(S.blrOther) != null && BAILERS.indexOf(S.blrOther) < 0) list.push(S.blrOther);
    var cmpRows = [];
    list.forEach(function (b) {
      var x = calc(i.csg, toIn(toNum(b)), i.bottom, i.top, i.len, i.joint);
      if (x.error) return;
      if (String(b) === String(cur)) mark = cmpRows.length;
      cmpRows.push([f(toIn(toNum(b)), 2) + " in", f(x.one_run_lts, 2) + " L", String(x.total_runs), x.last_ft ? lenText(x.last_ft) : "–", f(x.total_lts, 2) + " L", dep(x.new_toc, 1)]);
    });
    var s2 = section(2, "Calculations and bailers used", [
      sub("Bailer used"),
      grid([["Bailer ID", inch(i.blr)], ["Bailer OD", od != null ? f(od, S.idu === "mm" ? 1 : 3) + " " + S.idu : ""], ["Length per run", lenText(r.run_len)],
        ["Last run rounded up to", jointText() + " joints"], fit ? ["Passes the restriction", fit, re <= od ? "bad" : ""] : null]),
      sub("Step by step"),
      h("p", { cls: "fine", text: "Capacity of a pipe = 158.987 ÷ 1029.45 L per ft per in² of ID (the bailer: 159 ÷ 1029.45). Volumes in litres; depths in " + du() + ". Cement placed from the plug bottom up." }),
      h("div", { cls: "scroll" }, table(["#", "Step", "Working", "Result"], steps, 3)),
      sub("Bailers compared for this plug"),
      h("div", { cls: "keep" }, h("div", { cls: "scroll" }, table(["Bailer ID", "Per run", "Runs", "Last run", "Dumped", "New TOC"], cmpRows, 1, mark)),
      h("p", { cls: "fine", text: "Every bailer run " + lenText(r.run_len) + " per run against the same plug; the highlighted row is the bailer used." }))]);

    // ---- 3. outputs
    var vols = [["Cement required"].concat(vAll(r.req_lts))];
    if (r.full_runs) vols.push(["Each full run (" + lenText(r.run_len) + ")"].concat(vAll(r.one_run_lts)));
    if (r.last_ft) vols.push(["Last run (" + lenText(r.last_ft) + ")"].concat(vAll(r.last_lts)));
    vols.push(["Cement dumped in all"].concat(vAll(r.total_lts)));
    var sched = [], cum = 0;
    for (var k = 0; k < r.total_runs; k++) {
      var ft = k < r.full_runs ? r.run_len : r.last_ft, l = ft * r.blr_ft; cum += l;
      sched.push([String(k + 1), lenText(ft), f(l, 2), f(cum, 2), dep(i.bottom - cum / r.csg_ft, 2)]);
    }
    var dn = Math.min(S.done || 0, r.total_runs), ftDone = 0;
    for (k = 0; k < dn; k++) ftDone += (k < r.full_runs ? r.one_run_lts : r.last_lts) / r.csg_ft;
    var s3 = section(3, "Outputs", [
      h("div", { cls: "tiles3" },
        h("div", null, h("small", { text: "Cement required" }), h("b", { text: vol(r.req_lts) })),
        h("div", null, h("small", { text: "Runs" }), h("b", { text: r.total_runs + (r.total_runs === 1 ? " run" : " runs") })),
        h("div", null, h("small", { text: "New top of cement" }), h("b", { text: dep(r.new_toc, 1) }))),
      grid([["Run plan", planText(r, i.blr), "wide"], ["Cemented height", dep(r.cemented_ft, 2)], ["Against the target", againstText(r)]]),
      sub("Volumes in every unit"),
      h("div", { cls: "scroll" }, table(["", "L", "US gal", "bbl", "ft³"], vols, 1)),
      sub("Run schedule"),
      h("div", { cls: "scroll" }, table(["Run", "Bailer", "Volume L", "Cumulative L", "Cement top after the run"], sched, 1)),
      S.done ? h("p", { cls: "fine", text: "At the time of this report " + dn + " of " + r.total_runs + " runs were dumped: " + dep(ftDone, 2) + " cemented, theoretical top of cement " + dep(i.bottom - ftDone, 2) + "." }) : null,
      h("p", { cls: "fine", text: "Theoretical values from the pipe ID. Tag the top of cement after the job to confirm it." })]);

    var now = new Date();
    var sheet = h("article", { cls: "rep" },
      h("header", { cls: "rh" },
        h("div", null, h("div", { cls: "rk", text: "Dump-bailer cement plug" }), h("h1", { text: "Calculation report" }),
          h("div", { cls: "rw", text: [J.client, J.well, J.field].filter(Boolean).join(" · ") })),
        h("dl", { cls: "rm" }, h("dt", { text: "Date" }), h("dd", { text: dayText(J.date) || "–" }), h("dt", { text: "Ref" }), h("dd", { text: J.ref || "–" }))),
      s1, s2, s3,
      h("div", { cls: "sign" },
        h("div", null, h("small", { text: "Prepared by" }), h("span", { text: J.by || "" })),
        h("div", null, h("small", { text: "Checked / approved by" }), h("span"))),
      h("footer", { cls: "rf", text: "Cement Calc · dump bailer · generated " + now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }));
    var acts = h("div", { cls: "acts noprint" },
      h("button", { cls: "btn", text: "Save as PDF / Print", on: { click: function () { printIt(J); } } }),
      navigator.share ? h("button", { cls: "btn ghost", text: "Share as text", on: { click: function () { shareIt(J, i, r); } } }) : null);
    add(app, [bar, acts, sheet, h("div", { cls: "acts noprint" }, h("button", { cls: "btn ghost", text: "Back to the calculator", on: { click: backToCalc } }))]);
  }
  function printIt(J) {
    var old = document.title;
    document.title = ["Cement report", J.well, J.ref, J.date].filter(Boolean).join(" - ");
    var done = function () { document.title = old; window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
    setTimeout(done, 4000);
  }
  function shareIt(J, i, r) {
    var lines = ["CEMENT PLUG - dump bailer", [J.client, J.well, J.field].filter(Boolean).join(" · "), [J.ref, dayText(J.date)].filter(Boolean).join(" · "), "",
      "Pipe: " + pipeText() + ", ID " + f(i.csg, 3) + " in",
      "Plug: " + dep(i.bottom, 2) + " to " + dep(i.top, 2) + " (" + dep(r.height, 2) + ")",
      "Bailer: " + f(i.blr, 2) + " in ID, " + lenText(r.run_len) + " per run", "",
      "Cement required: " + vAll(r.req_lts).map(function (v, k) { return v + " " + VOL[Object.keys(VOL)[k]][0]; }).join(" · "),
      "Runs: " + r.total_runs + " = " + planText(r, i.blr),
      "Dumped: " + f(r.total_lts, 2) + " L (" + f(r.total_lts / L2G, 2) + " gal)",
      "New TOC: " + dep(r.new_toc, 2) + " (" + againstText(r) + ")",
      J.by ? "\nBy " + J.by : ""].filter(function (x) { return x !== null; });
    navigator.share({ title: "Cement plug " + (J.well || ""), text: lines.join("\n") }).catch(function () { /* closed */ });
  }

  function render() { if (location.hash === "#report") buildReport(); else build(); window.scrollTo(0, 0); }
  window.addEventListener("hashchange", render);
  render();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
  window.__cc = { calc: calc, CASING: CASING, TUBING: TUBING };   // for the tests
})();
