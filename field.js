/* field.js
 * 上から見たグラウンドのSVG描画。
 * このファイルは「表示」だけを担当し、野球のルールは一切知らない。
 */
(function (global) {
  'use strict';

  // 名前付き座標（viewBox 0 0 400 380）
  var POS = {
    HOME: [200, 330], B1: [300, 230], B2: [200, 130], B3: [100, 230],
    P: [200, 234], MOUND: [200, 234],
    F1: [200, 246], F2: [200, 368], F3: [284, 208], F4: [252, 172],
    F5: [116, 208], F6: [152, 172], F7: [80, 84], F8: [200, 52], F9: [320, 84],
    BENCH: [352, 376]
  };
  var ALIAS = {
    '1B': 'F3', '2B': 'F4', '3B': 'F5', 'SS': 'F6',
    'LF': 'F7', 'CF': 'F8', 'RF': 'F9', 'C': 'F2', 'PIT': 'F1'
  };
  var FIELDER_LABEL = {
    F1: '投', F2: '捕', F3: '一', F4: '二', F5: '三',
    F6: '遊', F7: '左', F8: '中', F9: '右'
  };

  function resolve(p) {
    if (Array.isArray(p)) return [p[0], p[1]];
    var k = ALIAS[p] || p;
    var v = POS[k] || POS.HOME;
    return [v[0], v[1]];
  }

  // 2点の間の点（データ側で「打球方向が分かった瞬間」の位置を書くのに使う）
  function mid(a, b, f) {
    var A = resolve(a), B = resolve(b);
    return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f];
  }

  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attrs) {
    var e = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function baseShape(x, y, size) {
    var s = size || 9;
    return 'M' + x + ',' + (y - s) + ' L' + (x + s) + ',' + y +
           ' L' + x + ',' + (y + s) + ' L' + (x - s) + ',' + y + ' Z';
  }

  function build(container) {
    container.innerHTML = '';
    var svg = svgEl('svg', {
      viewBox: '58 8 284 374', class: 'field-svg',
      preserveAspectRatio: 'xMidYMid meet'
    });

    // ファウルゾーン（外側）
    svg.appendChild(svgEl('rect', { x: 0, y: 0, width: 400, height: 380, fill: '#13361d' }));
    // フェアゾーン（芝）
    svg.appendChild(svgEl('path', {
      d: 'M200,330 L40,170 A 226 226 0 0 1 360,170 Z', fill: '#2f7d3a'
    }));
    // 内野（土）
    svg.appendChild(svgEl('path', {
      d: 'M200,356 L326,230 L200,104 L74,230 Z', fill: '#c69a63'
    }));
    // 内野の芝（中央）
    svg.appendChild(svgEl('path', {
      d: 'M200,320 L290,230 L200,140 L110,230 Z', fill: '#39913f'
    }));
    // ベースライン
    svg.appendChild(svgEl('path', {
      d: 'M200,330 L300,230 L200,130 L100,230 Z',
      fill: 'none', stroke: '#f2e4cf', 'stroke-width': 3, 'stroke-linejoin': 'round'
    }));
    // ファウルライン
    svg.appendChild(svgEl('path', {
      d: 'M200,330 L372,158 M200,330 L28,158',
      stroke: '#f2e4cf', 'stroke-width': 2, opacity: 0.75
    }));
    // マウンド
    svg.appendChild(svgEl('circle', { cx: 200, cy: 234, r: 16, fill: '#c69a63' }));

    // 各塁
    [['B1', 9], ['B2', 9], ['B3', 9]].forEach(function (b) {
      var p = resolve(b[0]);
      svg.appendChild(svgEl('path', {
        d: baseShape(p[0], p[1], b[1]), fill: '#ffffff', stroke: '#8d6a3f', 'stroke-width': 1.5
      }));
    });
    // ホームベース
    svg.appendChild(svgEl('path', {
      d: 'M191,322 L209,322 L209,334 L200,342 L191,334 Z',
      fill: '#ffffff', stroke: '#8d6a3f', 'stroke-width': 1.5
    }));

    // 塁の名前
    [['B1', 324, 254, '1るい'], ['B2', 200, 106, '2るい'], ['B3', 76, 254, '3るい'], ['HOME', 152, 352, 'ホーム']]
      .forEach(function (t) {
        var el = svgEl('text', { x: t[1], y: t[2], class: 'base-name', 'text-anchor': 'middle' });
        el.textContent = t[3];
        svg.appendChild(el);
      });

    // 守備選手
    var fielders = svgEl('g', { class: 'fielders' });
    Object.keys(FIELDER_LABEL).forEach(function (key) {
      var p = POS[key];
      var g = svgEl('g', { 'data-fielder': key });
      g.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: 10, fill: '#2b4d8c', stroke: '#0d1e3a', 'stroke-width': 2 }));
      var t = svgEl('text', { x: p[0], y: p[1] + 4, class: 'fielder-label', 'text-anchor': 'middle' });
      t.textContent = FIELDER_LABEL[key];
      g.appendChild(t);
      fielders.appendChild(g);
    });
    svg.appendChild(fielders);

    // 塁のタップ領域（answerType: baseTap のときだけ有効化）
    var taps = svgEl('g', { class: 'base-taps' });
    ['B1', 'B2', 'B3', 'HOME'].forEach(function (b) {
      var p = resolve(b);
      var g = svgEl('g', { class: 'base-tap', 'data-base': b });
      g.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: 30, class: 'base-tap-hit' }));
      g.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: 24, class: 'base-tap-ring' }));
      taps.appendChild(g);
    });
    svg.appendChild(taps);

    // 動くもの（ランナー・ボール）
    var actors = svgEl('g', { class: 'actors' });
    svg.appendChild(actors);
    // ラベル（キャッチ！など）
    var labels = svgEl('g', { class: 'labels' });
    svg.appendChild(labels);

    container.appendChild(svg);
    return { svg: svg, actors: actors, labels: labels, taps: taps };
  }

  function Field(container) {
    var parts = build(container);
    this.svg = parts.svg;
    this.actorsLayer = parts.actors;
    this.labelsLayer = parts.labels;
    this.tapsLayer = parts.taps;
    this.actors = {};
    this._tapHandler = null;
    var self = this;
    this.tapsLayer.addEventListener('click', function (ev) {
      var g = ev.target.closest('.base-tap');
      if (!g || !g.classList.contains('is-active')) return;
      if (self._tapHandler) self._tapHandler(g.getAttribute('data-base'));
    });
  }

  Field.prototype.clearActors = function () {
    this.actorsLayer.innerHTML = '';
    this.labelsLayer.innerHTML = '';
    this.actors = {};
  };

  // ランナー／自分／ボールをつくる
  Field.prototype.addActor = function (id, kind, pos) {
    var p = resolve(pos);
    var g = svgEl('g', { class: 'actor actor-' + kind, 'data-actor': id });
    if (kind === 'ball') {
      g.appendChild(svgEl('circle', { r: 7, fill: '#ffffff', stroke: '#1d2b3a', 'stroke-width': 2 }));
    } else if (kind === 'me') {
      g.appendChild(svgEl('circle', { r: 16, class: 'me-ring', fill: 'none', stroke: '#ffd33d', 'stroke-width': 2 }));
      g.appendChild(svgEl('circle', { r: 11, fill: '#ffd33d', stroke: '#1d2b3a', 'stroke-width': 2.5 }));
      var t = svgEl('text', { y: 4, class: 'actor-label', 'text-anchor': 'middle', fill: '#1d2b3a' });
      t.textContent = '自';
      g.appendChild(t);
    } else {
      g.appendChild(svgEl('circle', { r: 10, fill: '#f5f7fa', stroke: '#1d2b3a', 'stroke-width': 2 }));
    }
    g.setAttribute('transform', 'translate(' + p[0] + ',' + p[1] + ')');
    this.actorsLayer.appendChild(g);
    this.actors[id] = { el: g, pos: p, kind: kind };
    return g;
  };

  Field.prototype.has = function (id) { return !!this.actors[id]; };

  Field.prototype.place = function (id, pos) {
    var a = this.actors[id];
    if (!a) return;
    var p = resolve(pos);
    a.pos = p;
    a.el.setAttribute('transform', 'translate(' + p[0] + ',' + p[1] + ')');
  };

  Field.prototype.posOf = function (id) {
    var a = this.actors[id];
    return a ? [a.pos[0], a.pos[1]] : resolve('HOME');
  };

  Field.prototype.setVisible = function (id, show) {
    var a = this.actors[id];
    if (a) a.el.style.display = show ? '' : 'none';
  };

  Field.prototype.setScale = function (id, s) {
    var a = this.actors[id];
    if (!a) return;
    a.el.setAttribute('transform', 'translate(' + a.pos[0] + ',' + a.pos[1] + ') scale(' + s + ')');
  };

  // 「キャッチ！」などの吹き出し
  Field.prototype.label = function (text, pos, dur) {
    var p = resolve(pos || 'MOUND');
    var g = svgEl('g', { class: 'field-label' });
    var w = Math.max(48, text.length * 15 + 16);
    g.appendChild(svgEl('rect', {
      x: -w / 2, y: -15, width: w, height: 30, rx: 8,
      fill: '#12203a', stroke: '#ffd33d', 'stroke-width': 2
    }));
    var t = svgEl('text', { y: 6, class: 'field-label-text', 'text-anchor': 'middle' });
    t.textContent = text;
    g.appendChild(t);
    var y = Math.max(28, Math.min(352, p[1] - 26));
    g.setAttribute('transform', 'translate(' + p[0] + ',' + y + ')');
    this.labelsLayer.appendChild(g);
    var ms = dur || 900;
    setTimeout(function () {
      g.classList.add('is-out');
      setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 300);
    }, ms);
  };

  Field.prototype.clearLabels = function () { this.labelsLayer.innerHTML = ''; };

  // 塁タップの有効化
  Field.prototype.enableBaseTap = function (bases, handler) {
    this._tapHandler = handler;
    var list = bases || [];
    Array.prototype.forEach.call(this.tapsLayer.children, function (g) {
      var on = list.indexOf(g.getAttribute('data-base')) >= 0;
      g.classList.toggle('is-active', on);
    });
    this.tapsLayer.classList.add('is-on');
  };

  Field.prototype.disableBaseTap = function () {
    this._tapHandler = null;
    Array.prototype.forEach.call(this.tapsLayer.children, function (g) {
      g.classList.remove('is-active');
    });
    this.tapsLayer.classList.remove('is-on');
  };

  // 問題データから初期配置をつくる
  Field.prototype.layout = function (q) {
    this.clearActors();
    this.disableBaseTap();
    var runners = q.runners || {};
    var pb = (typeof q.playerBase === 'number') ? q.playerBase : 0;

    if (runners.first && pb !== 1) this.addActor('r1', 'runner', 'B1');
    if (runners.second && pb !== 2) this.addActor('r2', 'runner', 'B2');
    if (runners.third && pb !== 3) this.addActor('r3', 'runner', 'B3');

    if (pb === 0) {
      this.addActor('me', 'me', 'HOME');
    } else {
      this.addActor('me', 'me', 'B' + pb);
      if (!q.hideBatter) this.addActor('batter', 'runner', 'HOME');
    }
    this.addActor('ball', 'ball', 'P');
    this.setVisible('ball', false);
  };

  global.Field = {
    create: function (container) { return new Field(container); },
    resolve: resolve,
    mid: mid,
    POS: POS
  };
})(window);
