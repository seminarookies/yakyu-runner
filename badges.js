/* badges.js
 * バッジと称号の定義・判定。ゲーム要素はここだけに閉じ込める。
 */
(function (global) {
  'use strict';

  var BADGES = [
    { id: 'start',   icon: '👟', name: 'はじめの一歩',        cond: 'STAGE 1 クリア' },
    { id: 'outs',    icon: '🔢', name: 'アウトカウントめいじん', cond: 'STAGE 2 クリア' },
    { id: 'goro',    icon: '⚡', name: 'ゴロはんだんめいじん',   cond: 'STAGE 3 クリア' },
    { id: 'fly',     icon: '☁️', name: 'フライはんだんめいじん', cond: 'STAGE 4 クリア' },
    { id: 'touchup', icon: '🏃', name: 'タッチアップめいじん',   cond: 'タッチアップの2問を 1回目で 正解' },
    { id: 'perfect', icon: '💯', name: 'パーフェクト',          cond: '5問ぜんぶ 1回目で 正解' },
    { id: 'master',  icon: '👑', name: '走塁マスター',          cond: '実戦チャレンジで 5問 正解' }
  ];

  // 称号（下から順に上書き）
  var TITLES = [
    { need: [],                              label: 'ルーキー' },
    { need: ['start'],                       label: 'かけだしランナー' },
    { need: ['start', 'outs'],               label: 'アウトが見えるランナー' },
    { need: ['start', 'outs', 'goro'],       label: 'ゴロはんだんランナー' },
    { need: ['start', 'outs', 'goro', 'fly'], label: 'はんだんできるランナー' },
    { need: ['master'],                      label: '走塁マスター' }
  ];

  var STAGE_BADGE = { 1: 'start', 2: 'outs', 3: 'goro', 4: 'fly' };
  var TOUCHUP_IDS = ['s4-02', 's4-03'];

  // 1プレイの結果から、新しく取れたバッジを返す
  function evaluate(result, progress) {
    var got = [];
    function add(id) {
      if (id && progress.badges.indexOf(id) < 0 && got.indexOf(id) < 0) got.push(id);
    }
    var m = result.meta || {};
    if (m.mode === 'stage' && result.cleared) {
      add(STAGE_BADGE[m.stage]);
      var stageDef = null;
      (global.STAGES || []).forEach(function (s) { if (s.no === m.stage) stageDef = s; });
      if (stageDef && stageDef.mix && result.correct === result.total) add('master');
    }
    if (result.perfect) add('perfect');

    var tu = TOUCHUP_IDS.every(function (id) { return !!result.solvedFirstTry[id]; });
    if (tu) add('touchup');

    return got;
  }

  function titleFor(badges) {
    var label = TITLES[0].label;
    TITLES.forEach(function (t) {
      var ok = t.need.every(function (b) { return badges.indexOf(b) >= 0; });
      if (ok) label = t.label;
    });
    return label;
  }

  function byId(id) {
    for (var i = 0; i < BADGES.length; i++) if (BADGES[i].id === id) return BADGES[i];
    return null;
  }

  global.Badges = { list: BADGES, evaluate: evaluate, titleFor: titleFor, byId: byId };
})(window);
