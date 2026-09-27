/* ui.js — 画面遷移とイベント結線。ルール判定は engine.js、描画は field.js/anim.js に任せる。 */
(function (global) {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var QUESTIONS = global.QUESTIONS, STAGES = global.STAGES, THEMES = global.THEMES;
  var Engine = global.Engine, Badges = global.Badges;

  var progress = Engine.Progress.load();
  var field = null, player = null, game = null, currentPlay = null;
  var decisionBadge = $('decision-badge');
  var roundCard = $('round-card');

  /* ---------------- 画面切替 ---------------- */
  function show(name) {
    ['home', 'stages', 'free', 'play', 'result'].forEach(function (n) {
      $('screen-' + n).classList.toggle('is-active', n === name);
    });
    if (name === 'home') renderHome();
    if (name === 'stages') renderStages();
    if (name === 'free') renderThemes();
  }

  /* ---------------- ホーム ---------------- */
  function renderHome() {
    $('home-title').textContent = Badges.titleFor(progress.badges);
    var strip = $('home-badges');
    strip.innerHTML = '';
    Badges.list.forEach(function (b) {
      var d = document.createElement('div');
      d.className = 'badge-chip' + (progress.badges.indexOf(b.id) < 0 ? ' locked' : '');
      d.textContent = b.icon;
      d.title = b.name;
      strip.appendChild(d);
    });
  }

  /* ---------------- ステージ一覧 ---------------- */
  function renderStages() {
    var list = $('stage-list');
    list.innerHTML = '';
    STAGES.forEach(function (s) {
      var unlocked = Engine.isUnlocked(STAGES, progress, s.no);
      var cleared = progress.clearedStages.indexOf(s.no) >= 0;
      var btn = document.createElement('button');
      btn.className = 'card' + (unlocked ? '' : ' locked') + (cleared ? ' cleared' : '');
      btn.innerHTML =
        '<span class="no">' + s.no + '</span>' +
        '<span class="body"><strong>' + s.title + '</strong><span>' + s.sub + '</span></span>' +
        '<span class="state">' + (!s.ready ? '🛠' : (cleared ? '★' : (unlocked ? '▶' : '🔒'))) + '</span>';
      if (unlocked) {
        btn.addEventListener('click', function () {
          startPlay(Engine.stageQuestions(QUESTIONS, STAGES, s.no), { mode: 'stage', stage: s.no, title: s.title });
        });
      } else {
        btn.addEventListener('click', function () {
          btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
                       { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 240 });
        });
      }
      list.appendChild(btn);
    });
  }

  /* ---------------- 自由練習 ---------------- */
  function renderThemes() {
    var list = $('theme-list');
    list.innerHTML = '';
    THEMES.forEach(function (t) {
      var n = (t.key === 'all') ? QUESTIONS.length
        : QUESTIONS.filter(function (q) { return (q.themes || []).indexOf(t.key) >= 0; }).length;
      var btn = document.createElement('button');
      btn.className = 'card';
      btn.innerHTML =
        '<span class="no">' + Math.min(5, n) + '</span>' +
        '<span class="body"><strong>' + t.label + '</strong><span>' + n + '問の なかから 出題</span></span>' +
        '<span class="state">▶</span>';
      btn.addEventListener('click', function () {
        startPlay(Engine.themeQuestions(QUESTIONS, t.key), { mode: 'free', theme: t.key, title: t.label });
      });
      list.appendChild(btn);
    });
  }

  /* ---------------- プレイ ---------------- */
  function startPlay(list, meta) {
    if (!list || !list.length) return;
    if (player) { player.cancel(); player = null; }
    game = Engine.createGame(list, meta);
    show('play');
    if (!field) {
      field = global.Field.create($('field-wrap'));
      // SVGを作るときに中身が消えるので、重ねる部品を付け直す
      $('field-wrap').appendChild(decisionBadge);
      $('field-wrap').appendChild(roundCard);
    }
    renderQuestion();
  }

  function youLabel(q) {
    var pb = q.playerBase || 0;
    if (pb === 0) return 'バッター';
    return pb + 'るいランナー';
  }

  function setHead(q) {
    var dots = $('outs-box').querySelectorAll('.dots i');
    for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i < (q.outs || 0));
    $('you-chip').textContent = youLabel(q);
    $('q-no').textContent = game.number();
    $('q-total').textContent = game.total();
  }

  function clearFeedback() {
    var fb = $('feedback');
    fb.innerHTML = '';
    fb.classList.add('hidden');
  }

  function setDecisionMode(on) {
    $('field-wrap').classList.toggle('is-decision', !!on);
  }

  function renderQuestion() {
    var q = game.current();
    if (!q) return;
    currentPlay = q;
    runId++;
    clearCard();
    setHead(q);
    clearFeedback();
    setDecisionMode(false);
    $('question-text').textContent = q.questionText;
    $('answers').innerHTML = '';
    $('answers').classList.add('hidden');
    $('answers').classList.remove('judged');
    $('tap-hint').classList.add('hidden');
    var foot = document.querySelector('.play-foot');
    if (foot) foot.scrollTop = 0;

    field.layout(q);
    field.clearLabels();
    var myRun = runId;
    showRoundCard(q, function () {
      // 別の問題に切り替わっていたら何もしない（古いタイマーの取りこぼし対策）
      if (myRun !== runId) return;
      playToDecision(q);
    });
  }

  // 問題と問題のあいだに「だい◯もん」を出して、切れ目をはっきりさせる
  function showRoundCard(q, done) {
    var card = roundCard;
    var meta = (game && game.meta) || {};
    card.querySelector('.rc-no').textContent = 'だい ' + game.number() + ' もん';
    card.querySelector('.rc-sub').textContent =
      (meta.mode === 'review') ? 'ふくしゅう' : 'よく 見てね';
    card.classList.add('is-on');
    if (global.Sound) global.Sound.play('cue');
    var t1 = setTimeout(function () {
      card.classList.remove('is-on');
      var t2 = setTimeout(done, 240);
      cardTimers.push(t2);
    }, 1000);
    cardTimers.push(t1);
  }

  var runId = 0;
  var cardTimers = [];
  function clearCard() {
    cardTimers.forEach(clearTimeout);
    cardTimers = [];
    roundCard.classList.remove('is-on');
  }

  function playToDecision(q) {
    if (player) player.cancel();
    var myRun = runId;
    player = global.Anim.create(field, {
      onFlash: function (what) {
        if (what === 'outs') {
          var box = $('outs-box');
          box.classList.add('flash');
          setTimeout(function () { box.classList.remove('flash'); }, 1400);
        }
      }
    });
    var anim = q.animation || {};
    var mine = player;
    player.play((anim.setup || []).concat(anim.toDecision || [])).then(function () {
      if (mine.cancelled || myRun !== runId) return;
      setDecisionMode(true);
      setTimeout(function () {
        if (!mine.cancelled && myRun === runId) openAnswers(q);
      }, 420);
    });
  }

  function openAnswers(q) {
    var box = $('answers');
    box.innerHTML = '';
    if (q.answerType === 'baseTap') {
      box.classList.add('hidden');
      $('tap-hint').classList.remove('hidden');
      field.enableBaseTap(q.tapBases || ['B1', 'B2', 'B3', 'HOME'], function (base) {
        field.disableBaseTap();
        $('tap-hint').classList.add('hidden');
        handleAnswer(base, null);
      });
      return;
    }
    $('tap-hint').classList.add('hidden');
    box.classList.remove('hidden');
    (q.choices || []).forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'ans-btn';
      b.textContent = c.label;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(box.children, function (x) { x.disabled = true; });
        handleAnswer(c.id, b);
      });
      box.appendChild(b);
    });
  }

  function baseName(id) {
    return { B1: '一塁', B2: '二塁', B3: '三塁', HOME: 'ホーム' }[id] || id;
  }

  function ruleChip(q) {
    var map = {
      official_rule: ['official', '野球のルール'],
      basic_judgment: ['basic', '少年野球の基本'],
      tactical_judgment: ['tactical', 'チームで変わる判断']
    };
    var m = map[q.ruleType] || map.basic_judgment;
    return '<span class="fb-rule ' + m[0] + '">' + m[1] + '</span>';
  }

  function handleAnswer(choiceId, btnEl) {
    var q = currentPlay;
    var r = game.answer(choiceId);
    setDecisionMode(false);
    $('answers').classList.add('judged');

    if (r.state === 'correct') {
      if (btnEl) btnEl.classList.add('is-correct');
      if (global.Sound) global.Sound.play('correct');
      showCorrect(q, r);
      return;
    }
    if (global.Sound) global.Sound.play('wrong');
    if (r.state === 'hint') {
      if (btnEl) btnEl.classList.add('is-wrong');
      showHint(q, r.hint);
      return;
    }
    // 2回目も不正解 → 正解を見せる
    if (btnEl) btnEl.classList.add('is-wrong');
    showReveal(q);
  }

  function fbEl() {
    var fb = $('feedback');
    fb.classList.remove('hidden');
    setTimeout(function () {
      var foot = document.querySelector('.play-foot');
      if (foot) foot.scrollTop = foot.scrollHeight;
    }, 30);
    return fb;
  }

  function showHint(q, hint) {
    var fb = fbEl();
    fb.innerHTML =
      '<div class="fb-banner ng">✗ ちがうよ</div>' +
      '<div class="fb-hint">💡 ' + hint + '</div>' +
      '<button class="big-btn primary" id="btn-retry">もう いちど！</button>';
    $('btn-retry').addEventListener('click', function () {
      clearFeedback();
      $('answers').innerHTML = '';
      $('answers').classList.add('hidden');
      $('answers').classList.remove('judged');
      field.layout(q);
      field.clearLabels();
      playToDecision(q);
    });
  }

  function answerLabel(q) {
    if (q.answerType === 'baseTap') return baseName(q.correctAnswer) + 'へ';
    var found = (q.choices || []).filter(function (c) { return c.id === q.correctAnswer; })[0];
    return found ? found.label : '';
  }

  function whyBlock(q) {
    var html = '<div class="fb-why">' + q.explanation + '</div>' + ruleChip(q);
    if (q.tacticalNote) html += '<div class="fb-tactical">🧢 ' + q.tacticalNote + '</div>';
    return html;
  }

  function showCorrect(q, r) {
    var fb = fbEl();
    fb.innerHTML =
      '<div class="fb-banner ok">◯ せいかい！</div>' +
      (r.praise ? '<p class="fb-praise">🔥 ' + r.praise + '</p>' : '') +
      whyBlock(q) +
      '<button class="big-btn primary" id="btn-next" disabled>うごきを 見てるよ…</button>';
    runCorrectAnimation(q);
  }

  function showReveal(q) {
    var fb = fbEl();
    fb.innerHTML =
      '<div class="fb-banner ng">✗ せいかいは「' + answerLabel(q) + '」</div>' +
      whyBlock(q) +
      '<button class="big-btn primary" id="btn-next" disabled>うごきを 見てるよ…</button>';
    // 正解の選択肢を光らせる
    Array.prototype.forEach.call($('answers').children, function (b, i) {
      var c = (q.choices || [])[i];
      if (c && c.id === q.correctAnswer) b.classList.add('is-correct');
    });
    runCorrectAnimation(q);
  }

  function runCorrectAnimation(q) {
    if (player) player.cancel();
    var myRun = runId;
    player = global.Anim.create(field, {});
    var steps = (q.animation && q.animation.onCorrect) || [];
    player.play(steps).then(function () {
      if (myRun !== runId) return;
      var btn = $('btn-next');
      if (!btn) return;
      btn.disabled = false;
      btn.textContent = (game.number() >= game.total()) ? 'けっかを 見る' : 'つぎの もんだい';
      btn.addEventListener('click', function () {
        if (game.next()) renderQuestion(); else finish();
      });
    });
  }

  /* ---------------- 結果 ---------------- */
  function finish() {
    if (player) player.cancel();
    clearCard();
    var res = game.result();
    var meta = res.meta || {};

    var newBadges = [];
    if (meta.mode === 'stage') {
      if (res.cleared && progress.clearedStages.indexOf(meta.stage) < 0) {
        progress.clearedStages.push(meta.stage);
      }
    }
    newBadges = Badges.evaluate(res, progress);
    newBadges.forEach(function (id) { progress.badges.push(id); });
    progress.plays++;
    Engine.Progress.save(progress);

    var isStage = meta.mode === 'stage';
    $('result-mark').textContent = res.cleared ? (res.perfect ? '💯' : '🎉') : '💪';
    $('result-title').textContent = isStage
      ? (res.cleared ? 'ステージ クリア！' : 'もう すこし！')
      : (res.cleared ? 'よく できた！' : 'もう すこし！');
    $('result-score').innerHTML = '<b>' + res.correct + '</b> / ' + res.total + ' もん せいかい';

    var bx = $('result-badges');
    bx.innerHTML = '';
    newBadges.forEach(function (id) {
      var b = Badges.byId(id);
      if (!b) return;
      var d = document.createElement('div');
      d.className = 'got-badge';
      d.innerHTML = '<div class="ic">' + b.icon + '</div><div class="nm">' + b.name + '</div>';
      bx.appendChild(d);
    });

    var btns = $('result-buttons');
    btns.innerHTML = '';
    function addBtn(label, cls, fn) {
      var b = document.createElement('button');
      b.className = 'big-btn ' + cls;
      b.textContent = label;
      b.addEventListener('click', fn);
      btns.appendChild(b);
    }

    // 間違えた問題は必ず復習させる
    if (res.wrongIds.length) {
      addBtn('まちがえた ' + res.wrongIds.length + '問に もう いちど！', 'primary', function () {
        startPlay(Engine.byIds(QUESTIONS, res.wrongIds), { mode: 'review', title: 'ふくしゅう' });
      });
    }
    if (isStage && res.cleared) {
      var nextNo = meta.stage + 1;
      if (Engine.isUnlocked(STAGES, progress, nextNo)) {
        addBtn('STAGE ' + nextNo + 'へ', res.wrongIds.length ? 'secondary' : 'primary', function () {
          var s = STAGES.filter(function (x) { return x.no === nextNo; })[0];
          startPlay(Engine.stageQuestions(QUESTIONS, STAGES, nextNo), { mode: 'stage', stage: nextNo, title: s.title });
        });
      } else if (Engine.isUnlocked(STAGES, progress, 7) && meta.stage === 4) {
        addBtn('実戦チャレンジへ', 'secondary', function () {
          startPlay(Engine.stageQuestions(QUESTIONS, STAGES, 7), { mode: 'stage', stage: 7, title: '実戦チャレンジ' });
        });
      }
    }
    if (isStage && !res.cleared) {
      addBtn('このステージを もう いちど', 'secondary', function () {
        startPlay(Engine.stageQuestions(QUESTIONS, STAGES, meta.stage), { mode: 'stage', stage: meta.stage, title: meta.title });
      });
    }
    addBtn('ホームへ', 'ghost', function () { show('home'); });

    if (global.Sound) global.Sound.play(res.cleared ? 'clear' : 'wrong');
    show('result');
  }

  /* ---------------- バッジ一覧 ---------------- */
  function renderBadgeSheet() {
    var g = $('badge-grid');
    g.innerHTML = '';
    Badges.list.forEach(function (b) {
      var has = progress.badges.indexOf(b.id) >= 0;
      var d = document.createElement('div');
      d.className = 'badge-card' + (has ? '' : ' locked');
      d.innerHTML = '<div class="ic">' + b.icon + '</div><div class="nm">' + b.name +
                    '</div><div class="cd">' + b.cond + '</div>';
      g.appendChild(d);
    });
  }

  /* ---------------- 結線 ---------------- */
  // iPhone/iPad は、画面をさわったあとでないと音が出せない
  document.addEventListener('click', function (ev) {
    if (global.Sound) global.Sound.unlock();
    var t = ev.target.closest('[data-go]');
    if (t) show(t.getAttribute('data-go'));
  });

  $('btn-quit').addEventListener('click', function () {
    if (player) player.cancel();
    clearCard();
    show('home');
  });

  (function () {
    var b = $('btn-sound');
    function paint() {
      var on = !global.Sound || global.Sound.isOn();
      b.textContent = on ? '🔊' : '🔇';
      b.classList.toggle('off', !on);
    }
    b.addEventListener('click', function () { if (global.Sound) global.Sound.toggle(); paint(); });
    paint();
  })();

  $('btn-badge-list').addEventListener('click', function () {
    renderBadgeSheet();
    $('overlay-badges').classList.add('is-open');
  });
  $('btn-close-badges').addEventListener('click', function () {
    $('overlay-badges').classList.remove('is-open');
  });
  (function () {
    var btn = $('btn-reset');
    var armed = false, timer = null;
    function disarm() { armed = false; btn.textContent = 'きろくを ぜんぶ けす'; }
    btn.addEventListener('click', function () {
      if (!armed) {
        armed = true;
        btn.textContent = 'ほんとうに けす？（もう いちど おす）';
        clearTimeout(timer);
        timer = setTimeout(disarm, 5000);
        return;
      }
      clearTimeout(timer);
      disarm();
      Engine.Progress.reset();
      progress = Engine.Progress.load();
      renderBadgeSheet();
      renderHome();
    });
    $('btn-close-badges').addEventListener('click', disarm);
  })();

  show('home');
})(window);
