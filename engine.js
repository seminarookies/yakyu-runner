/* engine.js
 * 出題・判定・ヒント・進捗の状態機械。
 * このファイルは DOM を一切さわらない（＝将来スマホアプリに そのまま 持っていける）。
 */
(function (global) {
  'use strict';

  var STORE_KEY = 'yakyu-runner-v1';

  /* ---------------- 進捗の保存（端末内だけ・ログインなし） ---------------- */
  var Progress = {
    load: function () {
      var def = { clearedStages: [], badges: [], plays: 0 };
      try {
        var raw = global.localStorage.getItem(STORE_KEY);
        if (!raw) return def;
        var o = JSON.parse(raw);
        return {
          clearedStages: Array.isArray(o.clearedStages) ? o.clearedStages : [],
          badges: Array.isArray(o.badges) ? o.badges : [],
          plays: o.plays || 0
        };
      } catch (e) { return def; }
    },
    save: function (p) {
      try { global.localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) {}
    },
    reset: function () {
      try { global.localStorage.removeItem(STORE_KEY); } catch (e) {}
    }
  };

  /* ---------------- 出題リストをつくる ---------------- */
  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pickStage(all, stages, stageNo) {
    var def = null;
    for (var i = 0; i < stages.length; i++) if (stages[i].no === stageNo) def = stages[i];
    if (def && def.mix) return shuffle(all).slice(0, 5);
    return all.filter(function (q) { return q.stage === stageNo; }).slice(0, 5);
  }

  function pickTheme(all, themeKey) {
    var pool = (themeKey === 'all')
      ? all
      : all.filter(function (q) { return (q.themes || []).indexOf(themeKey) >= 0; });
    return shuffle(pool).slice(0, Math.min(5, pool.length));
  }

  /* ---------------- 1プレイぶんのゲーム ---------------- */
  function Game(list, meta) {
    this.list = list;
    this.meta = meta || {};
    this.i = 0;
    this.attempts = 0;
    this.firstTryCorrect = 0;
    this.wrongIds = [];
    this.streak = 0;
    this.bestStreak = 0;
    this.solvedFirstTry = {};
  }

  Game.prototype.total = function () { return this.list.length; };
  Game.prototype.current = function () { return this.list[this.i] || null; };
  Game.prototype.number = function () { return this.i + 1; };

  // 回答。戻り値で UI が何を出すかが決まる。
  Game.prototype.answer = function (choiceId) {
    var q = this.current();
    if (!q) return { state: 'done' };
    this.attempts++;
    var ok = (choiceId === q.correctAnswer) ||
             ((q.acceptableAnswers || []).indexOf(choiceId) >= 0);

    if (ok) {
      if (this.attempts === 1) {
        this.firstTryCorrect++;
        this.solvedFirstTry[q.id] = true;
        this.streak++;
        if (this.streak > this.bestStreak) this.bestStreak = this.streak;
      }
      return {
        state: 'correct',
        firstTry: this.attempts === 1,
        streak: this.streak,
        praise: (this.attempts === 1 && this.streak >= 3) ? 'ナイス判断！' : null
      };
    }

    // 不正解
    this.streak = 0;
    if (this.wrongIds.indexOf(q.id) < 0) this.wrongIds.push(q.id);
    if (this.attempts === 1) return { state: 'hint', hint: q.hint };
    return { state: 'reveal' }; // 2回目も不正解 → 正解を見せる
  };

  Game.prototype.next = function () {
    this.i++;
    this.attempts = 0;
    return this.i < this.list.length;
  };

  Game.prototype.result = function () {
    return {
      correct: this.firstTryCorrect,
      total: this.list.length,
      wrongIds: this.wrongIds.slice(),
      bestStreak: this.bestStreak,
      solvedFirstTry: this.solvedFirstTry,
      cleared: this.firstTryCorrect >= Math.max(1, this.list.length - 1),
      perfect: this.firstTryCorrect === this.list.length,
      meta: this.meta
    };
  };

  global.Engine = {
    Progress: Progress,
    shuffle: shuffle,
    stageQuestions: pickStage,
    themeQuestions: pickTheme,
    createGame: function (list, meta) { return new Game(list, meta); },
    byIds: function (all, ids) {
      return ids.map(function (id) {
        for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
        return null;
      }).filter(Boolean);
    },
    // ステージが解放されているか
    isUnlocked: function (stages, progress, no) {
      var def = null;
      for (var i = 0; i < stages.length; i++) if (stages[i].no === no) def = stages[i];
      if (!def || !def.ready) return false;
      if (no === 1) return true;
      if (def.mix) return progress.clearedStages.indexOf(4) >= 0;
      return progress.clearedStages.indexOf(no - 1) >= 0;
    }
  };
})(window);
