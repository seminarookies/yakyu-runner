/* anim.js
 * アニメーション再生エンジン。
 * 「ステップの配列」を順に再生するだけ。何を再生するかは questions.js のデータが決める。
 *
 * ステップの種類：
 *   { actor:'ball', from:'HOME', to:'SS', dur:600 }      … 移動
 *   { actor:'ball', from:'HOME', to:'LF', dur:1200, arc:true } … フライ（山なり）
 *   { …, arc:true, frac:0.68 }        … 軌道の68%まで動かして止める（まだ空中）
 *   { …, arc:true, fracFrom:0.68 }    … 68%地点から続きを動かす
 *   { set:'ball', at:'P' }                               … 瞬間移動
 *   { show:'ball' } / { hide:'ball' }                    … 表示切替
 *   { wait:300 }                                         … 待つ
 *   { sound:'hit' }                                      … 効果音（hit/catch/drop など）
 *   { label:'キャッチ！', at:'LF', dur:800 }              … 吹き出し
 *   { flash:'outs' }                                     … 画面の一部を点滅
 *   { par:[ step, step, ... ] }                          … 同時に動かす
 */
(function (global) {
  'use strict';

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  function Player(field, hooks) {
    this.field = field;
    this.hooks = hooks || {};
    this.cancelled = false;
    this._raf = null;
    this._timer = null;
  }

  Player.prototype.cancel = function () {
    this.cancelled = true;
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._timer) clearTimeout(this._timer);
  };

  Player.prototype._sleep = function (ms) {
    var self = this;
    return new Promise(function (res) {
      self._timer = setTimeout(res, ms);
    });
  };

  Player.prototype._move = function (step) {
    var self = this, field = this.field;
    var a = field.actors[step.actor];
    if (!a) return Promise.resolve();
    var F = global.Field.resolve(step.from != null ? step.from : field.posOf(step.actor));
    var T = global.Field.resolve(step.to);
    var dur = step.dur || 600;
    var arc = !!step.arc;
    var lift = step.lift || 64;
    // frac / fracFrom：軌道ぜんたいの何割ぶんを動かすか。
    // フライを「まだ高く上がっている途中」で止めたいときに使う。
    var u0 = step.fracFrom != null ? step.fracFrom : 0;
    var u1 = step.frac != null ? step.frac : 1;
    field.setVisible(step.actor, true);

    return new Promise(function (res) {
      var t0 = null;
      function frame(ts) {
        if (self.cancelled) return res();
        if (t0 === null) t0 = ts;
        var raw = Math.min(1, (ts - t0) / dur);
        var e = arc ? raw : easeInOut(raw);
        var t = u0 + (u1 - u0) * e;          // 軌道ぜんたいの中での位置
        var x = F[0] + (T[0] - F[0]) * t;
        var y = F[1] + (T[1] - F[1]) * t;
        var scale = 1;
        if (arc) {
          var h = Math.sin(Math.PI * t);
          y -= lift * h;
          scale = 1 + 0.7 * h;
        }
        a.pos = [x, y];
        a.el.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(' + scale + ')');
        if (raw < 1) { self._raf = requestAnimationFrame(frame); }
        else {
          // 途中で止める指定のときは、その位置のまま残す
          var ex = F[0] + (T[0] - F[0]) * u1;
          var ey = F[1] + (T[1] - F[1]) * u1;
          var es = 1;
          if (arc) { var eh = Math.sin(Math.PI * u1); ey -= lift * eh; es = 1 + 0.7 * eh; }
          a.pos = [ex, ey];
          a.el.setAttribute('transform', 'translate(' + ex + ',' + ey + ') scale(' + es + ')');
          res();
        }
      }
      self._raf = requestAnimationFrame(frame);
    });
  };

  Player.prototype._one = function (step) {
    if (this.cancelled) return Promise.resolve();
    var field = this.field;

    if (step.par) {
      var self = this;
      return Promise.all(step.par.map(function (s) { return self._one(s); }));
    }
    if (step.sound) {
      if (global.Sound) global.Sound.play(step.sound);
      return this._sleep(step.wait || 0);
    }
    if (step.wait != null) return this._sleep(step.wait);
    if (step.set) { field.place(step.set, step.at); field.setVisible(step.set, true); return Promise.resolve(); }
    if (step.show) { field.setVisible(step.show, true); return Promise.resolve(); }
    if (step.hide) { field.setVisible(step.hide, false); return Promise.resolve(); }
    if (step.label) {
      field.label(step.label, step.at, step.dur);
      return this._sleep(step.hold != null ? step.hold : 520);
    }
    if (step.flash) {
      if (this.hooks.onFlash) this.hooks.onFlash(step.flash);
      return this._sleep(step.dur || 800);
    }
    if (step.actor) return this._move(step);
    return Promise.resolve();
  };

  Player.prototype.play = function (steps) {
    var self = this;
    var list = (steps || []).slice();
    var p = Promise.resolve();
    list.forEach(function (s) {
      p = p.then(function () { return self.cancelled ? null : self._one(s); });
    });
    return p;
  };

  global.Anim = {
    create: function (field, hooks) { return new Player(field, hooks); }
  };
})(window);
