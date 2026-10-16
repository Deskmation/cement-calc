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
    var band = h("div", { cls: "band" }, h("h1", null, "Cement Calc", h("span", { cls: "sub" }, h("b", { text: "DUMP BAILER" }), " · volume · runs · TOC")),
      h("div", { cls: "units" }, ["ft", "m"].map(function (u) {
        return h("button", { "aria-pressed": String(S.depth === u), text: u, on: { click: function () { switchDepth(u); } } });
      })));
    // the answer
    var big = h("div", { cls: "big" }), runs = h("div", { cls: "runs" }), kv = h("dl", { cls: "kv" }), volBox = h("div"), wait = h("div", { cls: "wait" });
    var volChips = chipRow(Object.keys(VOL).map(function (k) { return [k, VOL[k][1]]; }), S.vol, function (k) { S.vol = k; recalc(); });
    var res = h("div", { cls: "card res" }, h("div", { cls: "spread" }, h("div", { cls: "sec", text: "Cement volume required" }),
      h("button", { cls: "link", text: "View report ›", on: { click: openReport } })), wait, big, runs, h("div", { cls: "sec", text: "Volume in all units" }), volBox, volChips, kv);

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
        : "Select the size and weight, or enter the ID manually (liner, nipple, non-API pipe).";
    }
    sizeSel.addEventListener("change", function () { S.size = sizeSel.value; S.wt = ""; fillWt(); idLine(); recalc(); });
    wtSel.addEventListener("change", function () { S.wt = wtSel.value; setIdFromTable(); idLine(); recalc(); });
    var kindChips = chipRow([["casing", "Casing"], ["tubing", "Tubing"], ["other", "Other · type the ID"]], S.kind, function (k) {
      S.kind = k; S.wt = ""; if (!table()[S.size]) S.size = "";
      fillSize(); fillWt(); idLine(); recalc(); if (k === "other") idIn.focus();
    });
    fillSize(); fillWt(); idLine();
    var pipe = h("div", { cls: "card" }, h("div", { cls: "sec", text: "Casing / tubing at plug depth" }), kindChips,
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
    var plug = h("div", { cls: "card" }, h("div", { cls: "sec", text: "Plug interval · " + du() }),
      h("div", { cls: "grid3" }, h("label", { cls: "f", "for": "bot" }, "Plug bottom", bot), h("label", { cls: "f", "for": "top" }, "Target TOC", top), h("label", { cls: "f", "for": "hgt" }, "Plug length", hgt)),
      h("div", { cls: "hint", text: "Enter the plug bottom and the target TOC, or the bottom and the plug length. Measured depths." }));

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
      if (o != null && r != null) { fitLine.className = r <= o ? "note bad" : "hint"; fitLine.textContent = r <= o ? "⚠ a " + o + " " + S.idu + " OD bailer will NOT pass the " + r + " " + S.idu + " restriction - wrong bailer" : "the " + o + " " + S.idu + " OD bailer passes the " + r + " " + S.idu + " restriction"; }
      else { fitLine.className = "hint"; fitLine.textContent = "Optional: bailer OD and the minimum restriction above the plug (nipple, tubing)."; }
    }
    fit();
    var bailer = h("div", { cls: "card" }, h("div", { cls: "sec", text: "Dump bailer" }),
      h("div", { cls: "f" }, h("span", { text: "Bailer ID · " + S.idu }), blrChips, blrOther),
      h("div", { cls: "f" }, h("span", { text: "Bailer length per run" }), lenChips, lenOther),
      h("div", { cls: "grid2" }, h("label", { cls: "f", "for": "od" }, "Bailer OD · " + S.idu, od), h("label", { cls: "f", "for": "re" }, "Restriction · " + S.idu, restr)), fitLine);

    // 4. which bailer: every bailer against this plug
    var cmpBody = h("tbody"), cmpNote = h("div", { cls: "hint", text: "Tap a row to use that bailer for the job." });
    var cmp = h("div", { cls: "card" }, h("div", { cls: "sec", text: "Bailer comparison" }),
      h("table", { cls: "cmp" }, h("thead", null, h("tr", null, h("th", { text: "Bailer ID" }), h("th", { text: "Per run" }), h("th", { text: "Runs" }))), cmpBody), cmpNote);

    // 5. on the job
    var doneN = h("span", { cls: "n", text: String(S.done || 0) }), doneLine = h("div", { cls: "hint" });
    function bump(d) { S.done = Math.max(0, (S.done || 0) + d); doneN.textContent = String(S.done); recalc(); }
    var onjob = h("div", { cls: "card" }, h("div", { cls: "sec", text: "Job progress" }),
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
    var job = h("div", { cls: "card" }, h("div", { cls: "sec", text: "Job data (for the report)" }),
      h("div", { cls: "grid2" },
        txt("j-client", "client", "Client"), txt("j-well", "well", "Well", { autocapitalize: "characters" }),
        txt("j-field", "field", "Field / area"), txt("j-ref", "ref", "Request / job no."),
        txt("j-unit", "unit", "Unit / rig"), txt("j-date", "date", "Date", { type: "date" })),
      txt("j-by", "by", "Prepared by", { autocapitalize: "words" }),
      txt("j-rem", "remarks", "Remarks", { type: "area", rows: "2", placeholder: "anything the report should say" }),
      h("button", { cls: "btn", text: "Generate report", on: { click: openReport } }));

    var reset = h("button", { cls: "link", text: "New calculation", on: { click: function () {
      S = { depth: S.depth, idu: S.idu, vol: S.vol, kind: "casing", size: "", wt: "", id: "", bottom: "", top: "", blr: "2", blrOther: "", len: "40", lenOther: "", od: "", restr: "", done: 0, job: blankJob(S.job) };
      save(); build();
    } } });
    var foot = h("div", { cls: "foot" }, h("div", { cls: "spread" }, h("span", { text: "Capacity 158.987 / 1029.45 L per ft per in² · the last run rounded up to " + (S.depth === "m" ? "1 m" : "5 ft") + " joints." }), reset),
      h("div", { text: "Works offline · a Deskmation Labs product" }));

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
      dd(kv, [["Plug interval", dep(r.height) + " in ID " + f(i.csg, 3) + "\"", f(r.csg_ft, 2) + " L per ft of casing / tubing"],
        r.full_runs ? ["Per full run (" + f(fromFt(r.run_len), 0) + " " + du() + ")", vol(r.one_run_lts), "fills " + dep(r.cover_long, 2)] : null,
        r.last_ft ? ["Last run (" + f(fromFt(r.last_ft), S.depth === "m" ? 1 : 0) + " " + du() + ")", vol(r.last_lts), "fills " + dep(r.cover_last, 2)] : null,
        ["Total dumped", vol(r.total_lts), r.total_runs + (r.total_runs === 1 ? " run" : " runs")],
        ["Cement column", dep(r.cemented_ft, 2), "theoretical TOC " + dep(r.new_toc, 1)],
        [r.over_ft >= 0 ? "Excess over target" : "Short of target", S.depth === "m" ? f(Math.abs(r.over_ft) * FT * 100, 0) + " cm" : f(Math.abs(r.over_ft) * 12, 1) + " in"]]);
      fillCmp(i, r);
      var d = Math.min(S.done || 0, r.total_runs), ftDone = 0;
      for (var k = 0; k < d; k++) ftDone += (k < r.full_runs ? r.one_run_lts : r.last_lts) / r.csg_ft;
      doneLine.textContent = !S.done ? "Count each run as it is dumped to follow the theoretical TOC."
        : (S.done > r.total_runs ? "⚠ " + S.done + " runs is more than the plan. " : "") + d + " of " + r.total_runs + " dumped · " + dep(ftDone, 2) + " cemented · theoretical TOC " + dep(r.new_toc + (r.cemented_ft - ftDone), 1)
          + (r.total_runs - d > 0 ? " · " + (r.total_runs - d) + " to go" : " · all runs dumped, tag the TOC");
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
      + " with the " + f(blr, 2) + " in bailer";
  }
  function againstText(r) {
    var x = Math.abs(r.over_ft), t = S.depth === "m" ? f(x * FT * 100, 0) + " cm" : f(x * 12, 1) + " in";
    return t + (r.over_ft >= 0 ? " above target TOC" : " below target TOC (short)");
  }
  // the report's content, once: the screen sheet and the PDF file are both drawn from this
  function reportData() {
    var i = inputs(), r = calc(i.csg, i.blr, i.bottom, i.top, i.len, i.joint), J = S.job || blankJob();
    var D = { J: J, i: i, r: r, error: r.error };
    if (r.error) return D;
    var dk = S.depth === "m" ? FT : 1;                          // ft -> the depth unit on screen
    var cp = r.csg_ft / dk, cb = r.blr_ft / dk, Kp = CASING_K / dk, Kb = BAILER_K / dk, perDu = "L/" + du();
    var runsFrac = r.req_lts / r.one_run_lts, lastTheo = (runsFrac - r.full_runs) * r.run_len;
    var od = toNum(S.od), re = toNum(S.restr);
    var now = new Date();
    D.head = { kicker: "Dump bailer cement plug", title: "Cement Calculation Report", line: [J.client, J.well, J.field].filter(Boolean).join(" · "),
      date: dayText(J.date) || "–", ref: J.ref || "–" };
    // 1. request / job data
    D.job = [["Client", J.client], ["Well", J.well], ["Field / area", J.field], ["Request / job no.", J.ref],
      ["Unit / rig", J.unit], ["Date", dayText(J.date)], ["Prepared by", J.by]];
    D.well = [["Casing / tubing", pipeText()], ["Pipe ID", inch(i.csg)], ["Plug bottom", dep(i.bottom, 2)], ["Target TOC", dep(i.top, 2)],
      ["Plug length", dep(r.height, 2)], ["Min. restriction above plug", re != null ? f(re, S.idu === "mm" ? 1 : 3) + " " + S.idu : ""]];
    D.remarks = J.remarks || "";
    // 2. calculations and bailers used
    var fit = od != null && re != null ? (re <= od ? "FAIL - the " + od + " " + S.idu + " OD does not pass the " + re + " " + S.idu + " restriction" : "PASS - " + od + " " + S.idu + " OD through " + re + " " + S.idu) : "";
    D.bailer = [["Bailer ID", inch(i.blr)], ["Bailer OD", od != null ? f(od, S.idu === "mm" ? 1 : 3) + " " + S.idu : ""], ["Length per run", lenText(r.run_len)],
      ["Last-run rounding", "up to " + jointText() + " joints"], fit ? ["Restriction check", fit, re <= od ? "bad" : ""] : null].filter(Boolean);
    D.stepsNote = "Capacity = 158.987 ÷ 1029.45 L/ft per in² of ID (bailer: 159 ÷ 1029.45). Volumes in litres, depths in " + du() + ". Cement is placed from the plug bottom upward.";
    D.steps = [
      ["1", "Casing / tubing capacity", f(Kp, 6) + " × ID² = " + f(Kp, 6) + " × " + f(i.csg, 3) + "²", f(cp, 3) + " " + perDu],
      ["2", "Bailer capacity", f(Kb, 6) + " × ID² = " + f(Kb, 6) + " × " + f(i.blr, 3) + "²", f(cb, 3) + " " + perDu],
      ["3", "Required cement volume", "plug length × capacity = " + f(fromFt(r.height), 2) + " × " + f(cp, 3), f(r.req_lts, 2) + " L"],
      ["4", "Volume per full run", "run length × bailer capacity = " + f(fromFt(r.run_len), 2) + " × " + f(cb, 3), f(r.one_run_lts, 2) + " L"],
      ["5", "Runs required (exact)", "required volume ÷ volume per run = " + f(r.req_lts, 2) + " ÷ " + f(r.one_run_lts, 2), f(runsFrac, 3)],
      ["6", "Full runs", "integer part of step 5", String(r.full_runs)],
      ["7", "Last run length", "(" + f(runsFrac, 3) + " − " + r.full_runs + ") × " + f(fromFt(r.run_len), 2) + " = " + f(fromFt(lastTheo), 2) + " " + du() + ", rounded up to " + jointText() + " joints", r.last_ft ? lenText(r.last_ft) : "none"],
      ["8", "Last run volume", "last run × bailer capacity = " + f(fromFt(r.last_ft), 2) + " × " + f(cb, 3), f(r.last_lts, 2) + " L"],
      ["9", "Total volume dumped", "full runs × volume per run + last run = " + r.full_runs + " × " + f(r.one_run_lts, 2) + " + " + f(r.last_lts, 2), f(r.total_lts, 2) + " L"],
      ["10", "Cement column height", "volume dumped ÷ capacity = " + f(r.total_lts, 2) + " ÷ " + f(cp, 3), dep(r.cemented_ft, 2)],
      ["11", "Theoretical new TOC", "plug bottom − cement column = " + f(fromFt(i.bottom), 2) + " − " + f(fromFt(r.cemented_ft), 2), dep(r.new_toc, 2)],
      ["12", "Difference to target", "cement column − plug length", againstText(r)]];
    var list = BAILERS.slice(), cur = S.blr === "other" ? S.blrOther : S.blr, mark = -1, cmpRows = [];
    if (S.blr === "other" && toNum(S.blrOther) != null && BAILERS.indexOf(S.blrOther) < 0) list.push(S.blrOther);
    list.forEach(function (b) {
      var x = calc(i.csg, toIn(toNum(b)), i.bottom, i.top, i.len, i.joint);
      if (x.error) return;
      if (String(b) === String(cur)) mark = cmpRows.length;
      cmpRows.push([f(toIn(toNum(b)), 2) + " in", f(x.one_run_lts, 2) + " L", String(x.total_runs), x.last_ft ? lenText(x.last_ft) : "–", f(x.total_lts, 2) + " L", dep(x.new_toc, 1)]);
    });
    D.cmp = { head: ["Bailer ID", "Per run", "Runs", "Last run", "Dumped", "New TOC"], rows: cmpRows, mark: mark,
      note: "All bailers at " + lenText(r.run_len) + " per run for the same plug. Highlighted: the bailer selected for the job." };
    // 3. outputs
    D.tiles = [["Required volume", vol(r.req_lts)], ["Bailer runs", r.total_runs + (r.total_runs === 1 ? " run" : " runs")], ["Theoretical TOC", dep(r.new_toc, 1)]];
    D.out = [["Run plan", planText(r, i.blr), "wide"], ["Cement column", dep(r.cemented_ft, 2)], ["Difference to target", againstText(r)]];
    var vols = [["Required volume"].concat(vAll(r.req_lts))];
    if (r.full_runs) vols.push(["Per full run (" + lenText(r.run_len) + ")"].concat(vAll(r.one_run_lts)));
    if (r.last_ft) vols.push(["Last run (" + lenText(r.last_ft) + ")"].concat(vAll(r.last_lts)));
    vols.push(["Total dumped"].concat(vAll(r.total_lts)));
    D.vols = { head: ["", "L", "US gal", "bbl", "ft³"], rows: vols };
    var sched = [], cum = 0, k;
    for (k = 0; k < r.total_runs; k++) {
      var ft = k < r.full_runs ? r.run_len : r.last_ft, l = ft * r.blr_ft; cum += l;
      sched.push([String(k + 1), lenText(ft), f(l, 2), f(cum, 2), dep(i.bottom - cum / r.csg_ft, 2)]);
    }
    D.sched = { head: ["Run", "Bailer", "Volume L", "Cumulative L", "TOC after run"], rows: sched };
    var dn = Math.min(S.done || 0, r.total_runs), ftDone = 0;
    for (k = 0; k < dn; k++) ftDone += (k < r.full_runs ? r.one_run_lts : r.last_lts) / r.csg_ft;
    D.progress = S.done ? "Progress at report time: " + dn + " of " + r.total_runs + " runs dumped, " + dep(ftDone, 2) + " of cement placed, theoretical TOC " + dep(i.bottom - ftDone, 2) + "." : "";
    D.note = "Note: values are theoretical, based on the nominal ID. Confirm the TOC by tagging after the job.";
    D.by = J.by || "";
    D.generated = "Generated with Cement Calc · " + now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return D;
  }
  function buildReport() {
    app.textContent = "";
    var D = reportData(), J = D.J;
    var bar = h("div", { cls: "band noprint" },
      h("button", { cls: "back", "aria-label": "Back to the calculator", text: "‹", on: { click: backToCalc } }),
      h("h1", null, "Cement report", h("span", { cls: "sub" }, J.well ? h("b", { text: J.well }) : null, (J.well ? " · " : "") + (dayText(J.date) || "dump bailer cement plug"))));
    if (D.error) {
      add(app, [bar, h("div", { cls: "card" }, h("div", { cls: "note", text: "Complete the calculation first. " + D.error }),
        h("button", { cls: "btn", text: "Back to the calculator", on: { click: backToCalc } }))]);
      return;
    }
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
    var sheet = h("article", { cls: "rep" },
      h("header", { cls: "rh" },
        h("div", null, h("div", { cls: "rk", text: D.head.kicker }), h("h1", { text: D.head.title }), h("div", { cls: "rw", text: D.head.line })),
        h("dl", { cls: "rm" }, h("dt", { text: "Date" }), h("dd", { text: D.head.date }), h("dt", { text: "Ref" }), h("dd", { text: D.head.ref }))),
      section(1, "Request / Job Data", [grid(D.job), sub("Well data at plug depth"), grid(D.well),
        D.remarks ? h("p", { cls: "rem" }, h("b", { text: "Remarks: " }), D.remarks) : null]),
      section(2, "Calculations & Bailers Used", [sub("Bailer used"), grid(D.bailer), sub("Calculation steps"),
        h("p", { cls: "fine", text: D.stepsNote }), h("div", { cls: "scroll" }, table(["#", "Step", "Working", "Result"], D.steps, 3)),
        sub("Bailer comparison"),
        h("div", { cls: "keep" }, h("div", { cls: "scroll" }, table(D.cmp.head, D.cmp.rows, 1, D.cmp.mark)), h("p", { cls: "fine", text: D.cmp.note }))]),
      section(3, "Outputs", [
        h("div", { cls: "tiles3" }, D.tiles.map(function (t) { return h("div", null, h("small", { text: t[0] }), h("b", { text: t[1] })); })),
        grid(D.out), sub("Volumes in all units"), h("div", { cls: "scroll" }, table(D.vols.head, D.vols.rows, 1)),
        sub("Run schedule"), h("div", { cls: "scroll" }, table(D.sched.head, D.sched.rows, 1)),
        D.progress ? h("p", { cls: "fine", text: D.progress }) : null, h("p", { cls: "fine", text: D.note })]),
      h("div", { cls: "sign" },
        h("div", null, h("small", { text: "Prepared by" }), h("span", { text: D.by })),
        h("div", null, h("small", { text: "Reviewed & approved by" }), h("span"))),
      h("footer", { cls: "rf", text: D.generated }));
    // the PDF is made on the phone (16 Oct 2026: the phone's print did nothing for the user; sharing worked)
    var msg = h("div", { cls: "hint pdfmsg", role: "status" });
    var saveBtn = h("button", { cls: "btn", text: "Save PDF", on: { click: function () { pdfDo("save", D, saveBtn, msg); } } });
    var shareBtn = navigator.share ? h("button", { cls: "btn ghost", text: "Share PDF", on: { click: function () { pdfDo("share", D, shareBtn, msg); } } }) : null;
    var more = h("div", { cls: "spread noprint" },
      navigator.share ? h("button", { cls: "link", text: "Share as text", on: { click: function () { shareIt(J, D.i, D.r); } } }) : h("span"),
      h("button", { cls: "link", text: "Print", on: { click: function () { printIt(J); } } }));
    add(app, [bar, h("div", { cls: "acts noprint" }, saveBtn, shareBtn), msg, more, sheet,
      h("div", { cls: "acts noprint" }, h("button", { cls: "btn ghost", text: "Back to the calculator", on: { click: backToCalc } }))]);
  }

  // ---- the PDF file (jsPDF 2.5.2 + autotable 3.8.4, in vendor/, loaded on the first tap, kept offline by sw.js)
  var pdfLibs = null;
  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script"); s.src = src; s.onload = ok;
      s.onerror = function () { bad(new Error("could not load " + src)); };
      document.head.appendChild(s);
    });
  }
  function libs() {
    if (!pdfLibs) pdfLibs = loadScript("vendor/jspdf.umd.min.js").then(function () { return loadScript("vendor/jspdf.plugin.autotable.min.js"); })
      .then(function () { if (!window.jspdf || !window.jspdf.jsPDF) throw new Error("the PDF library did not start"); return window.jspdf.jsPDF; })
      .catch(function (e) { pdfLibs = null; throw e; });
    return pdfLibs;
  }
  function pdfName(J) {
    return ["Cement report", J.well, J.ref, J.date].filter(Boolean).join(" - ").replace(/[\\/:*?"<>|]+/g, "-").slice(0, 120) + ".pdf";
  }
  // the PDF's built-in fonts carry Latin-1 only: the fraction glyphs and the true minus become plain text
  var FRAC = { "⅛": "-1/8", "¼": "-1/4", "⅜": "-3/8", "½": "-1/2", "⅝": "-5/8", "¾": "-3/4", "⅞": "-7/8" };
  function pt(s) {
    return String(s == null ? "" : s).replace(/[⅛¼⅜½⅝¾⅞]/g, function (c) { return FRAC[c]; })
      .replace(/[−–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/…/g, "...").replace(/[^\x00-\xff]/g, "");
  }
  function makePdf(jsPDF, D) {
    var doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    var NAVY = [21, 50, 76], NEON = [47, 212, 242], AMBER = [245, 181, 74], INK = [23, 33, 42], MUTED = [107, 120, 131],
      LINE = [207, 214, 220], HEAD = [230, 238, 245], HL = [255, 242, 217], BAD = [184, 50, 38], PALE = [207, 233, 242];
    var M = 12, W = 186, BOTTOM = 297 - 14, y = M;
    doc.setProperties({ title: pt(D.head.title + (D.J.well ? " - " + D.J.well : "")), subject: "Dump bailer cement plug", creator: "Cement Calc" });
    function ensure(hh) { if (y + hh > BOTTOM) { doc.addPage(); y = M; } }
    function txt(s, x, yy, size, color, style, opt) { doc.setFont("helvetica", style || "normal"); doc.setFontSize(size); doc.setTextColor.apply(doc, color); doc.text(pt(s), x, yy, opt || {}); }
    // the head band: navy, amber rule, the date and ref in amber
    doc.setFillColor.apply(doc, NAVY); doc.roundedRect(M, y, W, 26, 2, 2, "F");
    doc.setFillColor.apply(doc, AMBER); doc.rect(M, y + 25, W, 1.4, "F");
    txt(D.head.kicker.toUpperCase(), M + 5, y + 6.5, 6.5, NEON, "bold", { charSpace: 0.5 });
    txt(D.head.title, M + 5, y + 14.2, 16, [255, 255, 255], "bold");
    if (D.head.line) txt(D.head.line, M + 5, y + 21, 8, PALE, "bold");
    txt("Date", M + W - 46, y + 8, 7.5, NEON); txt(D.head.date, M + W - 5, y + 8, 8.5, AMBER, "bold", { align: "right" });
    txt("Ref", M + W - 46, y + 14, 7.5, NEON); txt(D.head.ref, M + W - 5, y + 14, 8.5, AMBER, "bold", { align: "right" });
    y += 26 + 1.4 + 6;
    function section(n, title) {
      ensure(16);
      doc.setFillColor.apply(doc, NAVY); doc.roundedRect(M, y, 6.2, 6.2, 1.2, 1.2, "F");
      txt(String(n), M + 3.1, y + 4.5, 9, AMBER, "bold", { align: "center" });
      txt(title.toUpperCase(), M + 8.8, y + 4.7, 11, NAVY, "bold");
      doc.setDrawColor.apply(doc, NEON); doc.setLineWidth(0.6); doc.line(M, y + 8, M + W, y + 8);
      y += 11.5;
    }
    function sub(t) { ensure(9); txt(t.toUpperCase(), M, y + 2.5, 6.8, MUTED, "bold", { charSpace: 0.4 }); y += 5; }
    function grid(pairs) {
      var cols = 3, cw = W / cols, row = [], rows = [];
      pairs.forEach(function (p) {
        if (p[2] === "wide") { if (row.length) rows.push(row); rows.push([p]); row = []; return; }
        row.push(p); if (row.length === cols) { rows.push(row); row = []; }
      });
      if (row.length) rows.push(row);
      rows.forEach(function (rw) {
        var wide = rw.length === 1 && rw[0][2] === "wide", cellW = wide ? W : cw;
        var lines = rw.map(function (p) { doc.setFont("helvetica", "bold"); doc.setFontSize(8.6); return doc.splitTextToSize(pt(p[1] == null || p[1] === "" ? "-" : p[1]), cellW - 4); });
        var hh = 4.2 + Math.max.apply(null, lines.map(function (l) { return l.length; })) * 3.7 + 2.2;
        ensure(hh);
        rw.forEach(function (p, k) {
          var x = M + k * cw;
          txt(p[0], x, y + 2.6, 6.8, MUTED);
          txt(lines[k], x, y + 6.3, 8.6, p[2] === "bad" ? BAD : INK, "bold");
          doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.2); doc.setLineDashPattern([0.5, 0.6], 0);
          doc.line(x, y + hh - 0.6, x + cellW - 4, y + hh - 0.6); doc.setLineDashPattern([], 0);
        });
        y += hh + 0.8;
      });
      y += 1.5;
    }
    function para(t, size, color, box) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(size);
      var lines = doc.splitTextToSize(pt(t), W - (box ? 6 : 0)), hh = lines.length * size * 0.42 + (box ? 4 : 0.8);
      ensure(hh + 1);
      if (box) { doc.setFillColor(243, 246, 248); doc.roundedRect(M, y, W, hh, 1.5, 1.5, "F"); }
      txt(lines, M + (box ? 3 : 0), y + (box ? 2 : 0) + size * 0.36, size, color);
      y += hh + 2;
    }
    function table(head, rows, numFrom, mark, colStyles) {
      doc.autoTable({
        startY: y, head: [head.map(pt)], body: rows.map(function (r) { return r.map(pt); }), margin: { left: M, right: M, top: M, bottom: 297 - BOTTOM },
        theme: "plain", showHead: "everyPage", rowPageBreak: "avoid",
        styles: { font: "helvetica", fontSize: 8, textColor: INK, cellPadding: { top: 1.1, bottom: 1.1, left: 1.8, right: 1.8 }, lineColor: [225, 230, 234], lineWidth: { bottom: 0.2 } },
        headStyles: { fillColor: HEAD, textColor: NAVY, fontStyle: "bold", fontSize: 6.8 },
        columnStyles: colStyles || {},
        didParseCell: function (d) {
          if (d.column.index >= numFrom) d.cell.styles.halign = "right";
          if (d.section === "body" && d.row.index === mark) { d.cell.styles.fillColor = HL; d.cell.styles.fontStyle = "bold"; }
        },
        didDrawCell: function (d) {
          if (d.section === "body" && d.row.index === mark && d.column.index === 0) { doc.setFillColor.apply(doc, AMBER); doc.rect(d.cell.x, d.cell.y, 0.9, d.cell.height, "F"); }
        }
      });
      y = doc.lastAutoTable.finalY + 2.5;
    }

    section(1, "Request / Job Data");
    grid(D.job); sub("Well data at plug depth"); grid(D.well);
    if (D.remarks) para("Remarks: " + D.remarks, 8.2, INK, true);
    section(2, "Calculations & Bailers Used");
    sub("Bailer used"); grid(D.bailer);
    sub("Calculation steps"); para(D.stepsNote, 7.4, MUTED);
    table(["#", "Step", "Working", "Result"], D.steps, 3, -1, { 0: { cellWidth: 7 }, 1: { cellWidth: 40, fontStyle: "bold" }, 3: { cellWidth: 36 } });
    ensure(9 + (D.cmp.rows.length + 1) * 5.6 + 8);                      // the comparison stays on one page
    sub("Bailer comparison"); table(D.cmp.head, D.cmp.rows, 1, D.cmp.mark); para(D.cmp.note, 7.4, MUTED);
    section(3, "Outputs");
    ensure(17);
    var tw = (W - 8) / 3;
    D.tiles.forEach(function (t, k) {
      var x = M + k * (tw + 4);
      doc.setFillColor.apply(doc, NAVY); doc.roundedRect(x, y, tw, 14, 1.8, 1.8, "F");
      txt(t[0].toUpperCase(), x + 3.5, y + 4.8, 6.5, NEON, "bold", { charSpace: 0.3 });
      txt(t[1], x + 3.5, y + 11, 12.5, AMBER, "bold");
    });
    y += 18;
    grid(D.out);
    sub("Volumes in all units"); table(D.vols.head, D.vols.rows, 1);
    sub("Run schedule"); table(D.sched.head, D.sched.rows, 1);
    if (D.progress) para(D.progress, 7.4, MUTED);
    para(D.note, 7.4, MUTED);
    ensure(15);
    y += 6;
    doc.setDrawColor.apply(doc, INK); doc.setLineWidth(0.35);
    doc.line(M, y, M + W / 2 - 6, y); doc.line(M + W / 2 + 6, y, M + W, y);
    txt("Prepared by", M, y + 3.6, 6.8, MUTED); txt(D.by, M, y + 7.6, 8.6, INK, "bold");
    txt("Reviewed & approved by", M + W / 2 + 6, y + 3.6, 6.8, MUTED);
    // every page: the footer and the page number
    var n = doc.getNumberOfPages();
    for (var p = 1; p <= n; p++) {
      doc.setPage(p);
      doc.setDrawColor(225, 230, 234); doc.setLineWidth(0.2); doc.line(M, 297 - 11, M + W, 297 - 11);
      txt(D.generated + (D.J.well ? "  ·  " + D.J.well : ""), M, 297 - 7, 6.8, MUTED);
      txt("Page " + p + " of " + n, M + W, 297 - 7, 6.8, MUTED, "normal", { align: "right" });
    }
    return doc;
  }
  function pdfDo(how, D, btn, msg) {
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = "Making the PDF…"; msg.textContent = "";
    libs().then(function (jsPDF) {
      var doc = makePdf(jsPDF, D), name = pdfName(D.J), blob = doc.output("blob");
      var file = null;
      try { file = new File([blob], name, { type: "application/pdf" }); } catch (e) { /* very old browser: no File */ }
      if (how === "share") {
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          return navigator.share({ files: [file], title: name.replace(/\.pdf$/, "") }).then(function () { msg.textContent = "PDF shared."; }, function (e) {
            if (e && e.name === "AbortError") return;
            throw e;
          });
        }
        msg.textContent = "This phone cannot share files from the browser: the PDF was saved instead.";
      }
      var url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      if (how === "save") msg.textContent = "Saved as \"" + name + "\" (Downloads).";
    }).catch(function (e) {
      msg.textContent = "Could not make the PDF (" + (e && e.message || e) + "). Try Print below, or open the app once with signal.";
    }).then(function () { btn.disabled = false; btn.textContent = label; });
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
    var lines = ["DUMP BAILER CEMENT PLUG", [J.client, J.well, J.field].filter(Boolean).join(" · "), [J.ref, dayText(J.date)].filter(Boolean).join(" · "), "",
      "Pipe: " + pipeText() + ", ID " + f(i.csg, 3) + " in",
      "Plug: " + dep(i.bottom, 2) + " to " + dep(i.top, 2) + " (" + dep(r.height, 2) + ")",
      "Bailer: " + f(i.blr, 2) + " in ID, " + lenText(r.run_len) + " per run", "",
      "Cement required: " + vAll(r.req_lts).map(function (v, k) { return v + " " + VOL[Object.keys(VOL)[k]][0]; }).join(" · "),
      "Bailer runs: " + r.total_runs + " = " + planText(r, i.blr),
      "Dumped: " + f(r.total_lts, 2) + " L (" + f(r.total_lts / L2G, 2) + " gal)",
      "Theoretical TOC: " + dep(r.new_toc, 2) + " (" + againstText(r) + ")",
      J.by ? "\nBy " + J.by : ""].filter(function (x) { return x !== null; });
    navigator.share({ title: "Cement plug " + (J.well || ""), text: lines.join("\n") }).catch(function () { /* closed */ });
  }

  function render() { if (location.hash === "#report") buildReport(); else build(); window.scrollTo(0, 0); }
  window.addEventListener("hashchange", render);
  render();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
  window.__cc = { calc: calc, CASING: CASING, TUBING: TUBING };   // for the tests
})();
