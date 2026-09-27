/* questions.js
 * 問題データ。ここに1問ぶん足すだけで問題が増える。
 *
 * ruleType
 *   official_rule     … 野球規則上そうなる
 *   basic_judgment    … 少年野球で一般に教える基本
 *   tactical_judgment … チームによって変わる（tacticalNote を必ず付ける）
 *
 * decisionTiming（アニメを止める場所。toDecision の最後で止まる）
 *   contact / grounder_direction / fly_up / catch_confirmed / ball_dropped
 *   after_runthrough / ball_through / out_called / wildpitch / none
 */
(function (global) {
  'use strict';
  var M = function (a, b, f) { return global.Field.mid(a, b, f); };

  // 投球（どの問題でも共通）
  function pitch() {
    return [
      { set: 'ball', at: 'P' }, { show: 'ball' },
      { actor: 'ball', from: 'P', to: 'HOME', dur: 280 },
      { sound: 'hit' }   // カキーン（打った瞬間）
    ];
  }
  // バッターが一塁へ走り出す
  function batterGo(to, dur) {
    return { actor: 'batter', from: 'HOME', to: to || [252, 282], dur: dur || 850 };
  }

  var QUESTIONS = [

    /* ===================== STAGE 1 まずは走ってみよう ===================== */
    {
      id: 's1-01', stage: 1, themes: ['basic'], difficulty: 1,
      outs: 0, runners: {}, playerBase: 0,
      play: { ballType: 'grounder', direction: '2B', fielder: '2B', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'contact',
      questionText: '0アウト。きみは バッター。\nゴロを 打った！',
      answerType: 'baseTap', tapBases: ['B1', 'B2', 'B3', 'HOME'],
      choices: [], correctAnswer: 'B1', acceptableAnswers: [],
      hint: 'ボールを 打ったら、まず どこへ 走る？',
      explanation: '打ったら まず 一塁！\nアウトかどうかは 見なくていい。ぜんりょくで かけぬけよう。',
      ruleType: 'official_rule', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { actor: 'ball', from: 'HOME', to: M('HOME', 'F4', 0.3), dur: 320 }
        ]),
        onCorrect: [
          { par: [{ actor: 'ball', from: M('HOME', 'F4', 0.3), to: 'F4', dur: 620 },
                  { actor: 'me', from: 'HOME', to: 'B1', dur: 950 }] },
          { label: 'セーフ！', at: 'B1' }
        ]
      }
    },
    {
      id: 's1-02', stage: 1, themes: ['basic'], difficulty: 1,
      outs: 0, runners: { first: true }, playerBase: 1, hideBatter: true,
      play: { ballType: 'none', direction: '2B', fielder: '2B', depth: 'normal', outcome: 'held' },
      decisionTiming: 'after_runthrough',
      questionText: 'ヒット！ 一塁を かけぬけた。\nボールは セカンドが もっている。',
      answerType: 'twoChoice',
      choices: [{ id: 'back', label: 'すぐ 一塁に もどる' }, { id: 'second', label: '二塁へ 走る' }],
      correctAnswer: 'back', acceptableAnswers: [],
      hint: 'ボールは だれが もっている？',
      explanation: '一塁を かけぬけたら、すぐ ベースに もどる。\nはなれた ままだと、タッチされて アウトに なるよ。',
      ruleType: 'basic_judgment', tacticalNote: null,
      animation: {
        toDecision: [
          { set: 'me', at: [316, 210] }, { set: 'ball', at: 'F4' }, { show: 'ball' },
          { label: 'セカンドが もっている', at: 'F4', hold: 700 }
        ],
        onCorrect: [
          { actor: 'me', from: [316, 210], to: 'B1', dur: 480 },
          { label: 'セーフのまま！', at: 'B1' }
        ]
      }
    },
    {
      id: 's1-03', stage: 1, themes: ['basic'], difficulty: 1,
      outs: 0, runners: {}, playerBase: 0,
      play: { ballType: 'line', direction: 'RC', fielder: 'RF', depth: 'deep', outcome: 'through' },
      decisionTiming: 'ball_through',
      questionText: '0アウト。きみは バッター。\n打球が 外野の あいだを ぬけた！',
      answerType: 'baseTap', tapBases: ['B1', 'B2', 'B3', 'HOME'],
      choices: [], correctAnswer: 'B2', acceptableAnswers: [],
      hint: 'ボールは とおくへ 行ったよ。だれか すぐ 取れる？',
      explanation: '外野を ぬけた 大きな あたりは 二塁まで。\n一塁を まわるときは、ベースの 内がわを ふもう。',
      ruleType: 'basic_judgment', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: [278, 46], dur: 880, arc: true, lift: 26 },
                  { actor: 'me', from: 'HOME', to: 'B1', dur: 900 }] },
          { label: 'ぬけた！', at: [278, 66], hold: 500 }
        ]),
        onCorrect: [
          { par: [{ actor: 'me', from: 'B1', to: 'B2', dur: 820 },
                  { actor: 'ball', from: [278, 46], to: 'F9', dur: 700 }] },
          { label: '二塁 セーフ！', at: 'B2' }
        ]
      }
    },
    {
      id: 's1-04', stage: 1, themes: ['basic'], difficulty: 1,
      outs: 0, runners: {}, playerBase: 0,
      play: { ballType: 'grounder', direction: 'P', fielder: 'P', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'out_called',
      questionText: 'ピッチャーゴロ。\n一塁で アウトに なった。',
      answerType: 'threeChoice',
      choices: [
        { id: 'bench', label: 'ベンチに もどる' },
        { id: 'run', label: 'そのまま 二塁へ 走る' },
        { id: 'stand', label: '一塁に 立っている' }
      ],
      correctAnswer: 'bench', acceptableAnswers: [],
      hint: 'アウトに なった人は、もう 走れるかな？',
      explanation: 'アウトに なったら、もう 走れない。\nすぐ ベンチに もどって、つぎの 人を おうえん しよう。',
      ruleType: 'official_rule', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { actor: 'ball', from: 'HOME', to: 'F1', dur: 380 },
          { par: [{ actor: 'ball', from: 'F1', to: 'B1', dur: 420 },
                  { actor: 'me', from: 'HOME', to: [272, 258], dur: 780 }] },
          { label: 'アウト！', at: 'B1', hold: 650 }
        ]),
        onCorrect: [
          { actor: 'me', from: [272, 258], to: 'BENCH', dur: 700 },
          { hide: 'me' },
          { label: 'ベンチへ', at: [360, 320] }
        ]
      }
    },
    {
      id: 's1-05', stage: 1, themes: ['basic', 'fly'], difficulty: 1,
      outs: 0, runners: {}, playerBase: 0,
      play: { ballType: 'fly', direction: 'SS', fielder: 'SS', depth: 'shallow', outcome: 'dropped' },
      decisionTiming: 'fly_up',
      questionText: '0アウト。きみは バッター。\n高い フライを 打ち上げた！',
      answerType: 'twoChoice',
      choices: [{ id: 'run', label: 'すぐ 一塁まで 走る' }, { id: 'watch', label: '捕られるか 見てから 走る' }],
      correctAnswer: 'run', acceptableAnswers: [],
      hint: '捕れないことも あるよ。',
      explanation: 'フライは 捕られる ことも、おとされる ことも ある。\n見ていないで、まず 一塁まで 全力で 走る。',
      ruleType: 'basic_judgment', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { actor: 'ball', from: 'HOME', to: M('HOME', 'F6', 0.5), dur: 620, arc: true, lift: 78 }
        ]),
        onCorrect: [
          { par: [{ actor: 'ball', from: M('HOME', 'F6', 0.5), to: 'F6', dur: 640, arc: true, lift: 40 },
                  { actor: 'me', from: 'HOME', to: 'B1', dur: 950 }] },
          { sound: 'drop' }, { label: 'おとした！', at: 'F6', hold: 420 },
          { actor: 'ball', from: 'F6', to: [142, 186], dur: 220 },
          { label: 'セーフ！', at: 'B1' }
        ]
      }
    },

    /* ===================== STAGE 2 アウトカウントを見よう ===================== */
    {
      id: 's2-01', stage: 2, themes: ['outs'], difficulty: 1,
      outs: 2, runners: {}, playerBase: 0,
      play: { ballType: 'none', direction: null, fielder: null, depth: null, outcome: null },
      decisionTiming: 'none',
      questionText: 'いま 2アウト。\nもう 1つ アウトに なったら どうなる？',
      answerType: 'threeChoice',
      choices: [
        { id: 'change', label: 'こうたい（チェンジ）' },
        { id: 'runner', label: 'ランナーだけ もどる' },
        { id: 'keep', label: 'そのまま つづく' }
      ],
      correctAnswer: 'change', acceptableAnswers: [],
      hint: 'アウトは ぜんぶで いくつ？',
      explanation: 'アウトが 3つに なったら こうたい。\nだから アウトカウントを 見ておくと、走るか どうかが きまるよ。',
      ruleType: 'official_rule', tacticalNote: null,
      animation: {
        toDecision: [{ flash: 'outs', dur: 900 }],
        onCorrect: [{ label: '3アウト チェンジ！', at: 'MOUND' }]
      }
    },
    {
      id: 's2-02', stage: 2, themes: ['outs', 'fly'], difficulty: 2,
      outs: 1, runners: { second: true }, playerBase: 2,
      play: { ballType: 'fly', direction: 'LF', fielder: 'LF', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'fly_up',
      questionText: '1アウト。きみは 2るいランナー。\nレフトへ フライが 上がった！',
      answerType: 'twoChoice',
      choices: [{ id: 'run', label: 'すぐ 走る' }, { id: 'wait', label: '塁に もどって まつ' }],
      correctAnswer: 'wait', acceptableAnswers: [],
      hint: 'もし 捕られたら どうなる？',
      explanation: 'フライは まず 塁に もどって、捕るのを 見る。\n捕られてから 走れば アウトに ならない。',
      ruleType: 'basic_judgment', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F7', 0.45), dur: 700, arc: true, lift: 82 },
                  batterGo()] }
        ]),
        onCorrect: [
          { actor: 'ball', from: M('HOME', 'F7', 0.45), to: 'F7', dur: 640, arc: true, lift: 44 },
          { sound: 'catch' }, { label: 'キャッチ！', at: 'F7', hold: 520 },
          { actor: 'me', from: 'B2', to: 'B3', dur: 780 },
          { label: '三塁へ！', at: 'B3' }
        ]
      }
    },
    {
      id: 's2-03', stage: 2, themes: ['outs', 'fly'], difficulty: 2,
      outs: 2, runners: { second: true }, playerBase: 2,
      play: { ballType: 'fly', direction: 'LF', fielder: 'LF', depth: 'normal', outcome: 'dropped' },
      decisionTiming: 'fly_up',
      questionText: '2アウト。きみは 2るいランナー。\nレフトへ フライが 上がった！',
      answerType: 'twoChoice',
      choices: [{ id: 'run', label: 'すぐ 走る' }, { id: 'wait', label: '塁に もどって まつ' }],
      correctAnswer: 'run', acceptableAnswers: [],
      hint: '2アウトで 捕られたら、この 回は おわりだね。',
      explanation: '2アウトの フライは、捕られたら どうせ こうたい。\nだから 見ないで 全力で 走る。おとしたら ホームまで 行けるよ。',
      ruleType: 'basic_judgment', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F7', 0.45), dur: 700, arc: true, lift: 82 },
                  batterGo()] }
        ]),
        onCorrect: [
          { par: [{ actor: 'ball', from: M('HOME', 'F7', 0.45), to: 'F7', dur: 640, arc: true, lift: 44 },
                  { actor: 'me', from: 'B2', to: 'B3', dur: 700 }] },
          { sound: 'drop' }, { label: 'おとした！', at: 'F7', hold: 420 },
          { actor: 'me', from: 'B3', to: 'HOME', dur: 780 },
          { label: 'ホームイン！', at: 'HOME' }
        ]
      }
    },
    {
      id: 's2-04', stage: 2, themes: ['outs', 'goro'], difficulty: 2,
      outs: 0, runners: { third: true }, playerBase: 3,
      play: { ballType: 'grounder', direction: 'SS', fielder: 'SS', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'grounder_direction',
      questionText: '0アウト。きみは 3るいランナー。\nショートに ゴロが とんだ！',
      answerType: 'twoChoice',
      choices: [{ id: 'go', label: 'ホームへ 走る' }, { id: 'stay', label: 'とまって ようすを 見る' }],
      correctAnswer: 'stay', acceptableAnswers: [],
      hint: 'まだ 0アウト。あと 何人 打てる？',
      explanation: '0アウトなら、まだ 2回 チャンスが ある。\nあわてて 走らず、つぎの バッターに たくすのが 基本。',
      ruleType: 'tactical_judgment',
      tacticalNote: '0アウト 3るいで ゴロの とき 走るか どうかは、チームに よって ちがうよ。ベンチの サインを かくにん しよう。',
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F6', 0.55), dur: 460 }, batterGo()] }
        ]),
        onCorrect: [
          { actor: 'ball', from: M('HOME', 'F6', 0.55), to: 'F6', dur: 340 },
          { par: [{ actor: 'ball', from: 'F6', to: 'B1', dur: 420 },
                  { actor: 'batter', from: [252, 282], to: 'B1', dur: 420 }] },
          { label: 'アウト', at: 'B1', hold: 500 },
          { label: 'まだ 0アウト。つぎで かえろう', at: 'B3' }
        ]
      }
    },
    {
      id: 's2-05', stage: 2, themes: ['outs', 'goro'], difficulty: 2,
      outs: 2, runners: { third: true }, playerBase: 3,
      play: { ballType: 'grounder', direction: 'SS', fielder: 'SS', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'grounder_direction',
      questionText: '2アウト。きみは 3るいランナー。\nショートに ゴロが とんだ！',
      answerType: 'twoChoice',
      choices: [{ id: 'go', label: 'ホームへ 走る' }, { id: 'stay', label: 'とまって ようすを 見る' }],
      correctAnswer: 'go', acceptableAnswers: [],
      hint: '2アウト。バッターが アウトに なったら どうなる？',
      explanation: '2アウトは、バッターが 一塁で アウトに なったら こうたい。\n走らないと 点は 入らない。ゴロを 見たら すぐ スタート。',
      ruleType: 'basic_judgment', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F6', 0.55), dur: 460 }, batterGo()] }
        ]),
        onCorrect: [
          { par: [{ actor: 'ball', from: M('HOME', 'F6', 0.55), to: 'F6', dur: 340 },
                  { actor: 'me', from: 'B3', to: 'HOME', dur: 820 }] },
          { label: 'ホームイン！ 1点！', at: 'HOME', hold: 620 },
          { actor: 'ball', from: 'F6', to: 'B1', dur: 400 },
          { label: 'バッターは アウト', at: 'B1' }
        ]
      }
    },

    /* ===================== STAGE 3 ゴロをはんだんしよう ===================== */
    {
      id: 's3-01', stage: 3, themes: ['goro', 'force'], difficulty: 2,
      outs: 1, runners: { first: true }, playerBase: 1,
      play: { ballType: 'grounder', direction: 'SS', fielder: 'SS', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'grounder_direction',
      questionText: '1アウト。きみは 1るいランナー。\nショートに ゴロが とんだ！',
      answerType: 'twoChoice',
      choices: [{ id: 'go', label: '走る' }, { id: 'stay', label: 'とまる' }],
      correctAnswer: 'go', acceptableAnswers: [],
      hint: 'バッターは どこへ 走って くる？',
      explanation: 'バッターが 一塁へ 走って くるから、1るいランナーは 二塁へ\n行かなければ ならない（フォース）。とまると タッチなしで アウト。',
      ruleType: 'official_rule', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F6', 0.55), dur: 460 }, batterGo()] }
        ]),
        onCorrect: [
          { par: [{ actor: 'me', from: 'B1', to: 'B2', dur: 800 },
                  { actor: 'ball', from: M('HOME', 'F6', 0.55), to: 'F6', dur: 340 }] },
          { label: 'セーフ！', at: 'B2', hold: 520 },
          { actor: 'ball', from: 'F6', to: 'B1', dur: 420 },
          { label: 'バッターは アウト', at: 'B1' }
        ]
      }
    },
    {
      id: 's3-02', stage: 3, themes: ['goro', 'force'], difficulty: 2,
      outs: 1, runners: { second: true }, playerBase: 2,
      play: { ballType: 'grounder', direction: 'SS', fielder: 'SS', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'grounder_direction',
      questionText: '1アウト。きみは 2るいランナー。\n1るいは あいている。ショートに ゴロ！',
      answerType: 'twoChoice',
      choices: [{ id: 'go', label: '走る' }, { id: 'stay', label: 'とまる' }],
      correctAnswer: 'stay', acceptableAnswers: [],
      hint: 'うしろ（一塁）に ランナーは いる？',
      explanation: '1るいに ランナーが いないから、きみは 走らなくて いい。\nとび出すと タッチされて アウト。ボールを 見て、安全なら 進もう。',
      ruleType: 'basic_judgment', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F6', 0.55), dur: 460 }, batterGo()] }
        ]),
        onCorrect: [
          { actor: 'ball', from: M('HOME', 'F6', 0.55), to: 'F6', dur: 340 },
          { par: [{ actor: 'ball', from: 'F6', to: 'B1', dur: 420 },
                  { actor: 'batter', from: [252, 282], to: 'B1', dur: 420 }] },
          { label: 'アウト', at: 'B1', hold: 500 },
          { label: '二塁に のこって OK', at: 'B2' }
        ]
      }
    },
    {
      id: 's3-03', stage: 3, themes: ['goro', 'force'], difficulty: 3,
      outs: 1, runners: { first: true, second: true }, playerBase: 2,
      play: { ballType: 'grounder', direction: 'SS', fielder: 'SS', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'grounder_direction',
      questionText: '1アウト。1るいと 2るいに ランナー。\nきみは 2るい。ショートに ゴロ！',
      answerType: 'twoChoice',
      choices: [{ id: 'go', label: '走る' }, { id: 'stay', label: 'とまる' }],
      correctAnswer: 'go', acceptableAnswers: [],
      hint: '1るいの ランナーは どこへ 来る？',
      explanation: '1るいに ランナーが いると、2るいランナーも 進まなければ ならない\n（フォース）。うしろに ランナーが いるか 見て きめよう。',
      ruleType: 'official_rule', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F6', 0.55), dur: 460 }, batterGo()] }
        ]),
        onCorrect: [
          { par: [{ actor: 'me', from: 'B2', to: 'B3', dur: 800 },
                  { actor: 'r1', from: 'B1', to: 'B2', dur: 820 },
                  { actor: 'ball', from: M('HOME', 'F6', 0.55), to: 'F6', dur: 340 }] },
          { label: '三塁 セーフ！', at: 'B3' }
        ]
      }
    },
    {
      id: 's3-04', stage: 3, themes: ['goro', 'force'], difficulty: 2,
      outs: 0, runners: { first: true }, playerBase: 1,
      play: { ballType: 'grounder', direction: '2B', fielder: '2B', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'grounder_direction',
      questionText: '0アウト。きみは 1るいランナー。\nセカンドに ゴロが とんだ！',
      answerType: 'twoChoice',
      choices: [{ id: 'go', label: '走る' }, { id: 'stay', label: 'とまる' }],
      correctAnswer: 'go', acceptableAnswers: [],
      hint: '1るいランナーは 進まなくて いい？',
      explanation: 'セカンドゴロは 二塁が すぐ 近い。フォースだから とまれない。\nスタートを 早く、全力で 二塁へ すべりこもう。',
      ruleType: 'official_rule', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F4', 0.55), dur: 440 }, batterGo()] }
        ]),
        onCorrect: [
          { par: [{ actor: 'me', from: 'B1', to: 'B2', dur: 760 },
                  { actor: 'ball', from: M('HOME', 'F4', 0.55), to: 'F4', dur: 320 }] },
          { label: 'すぐ 二塁へ 投げる！', at: 'F4', hold: 380 },
          { actor: 'ball', from: 'F4', to: 'B2', dur: 240 },
          { label: 'ぜんりょくで スライディング！', at: 'B2' }
        ]
      }
    },
    {
      id: 's3-05', stage: 3, themes: ['goro'], difficulty: 2,
      outs: 1, runners: { third: true }, playerBase: 3,
      play: { ballType: 'grounder', direction: '3B', fielder: '3B', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'grounder_direction',
      questionText: '1アウト。きみは 3るいランナー。\nサードに ゴロが とんだ！',
      answerType: 'twoChoice',
      choices: [{ id: 'go', label: 'ホームへ 走る' }, { id: 'stay', label: '塁から はなれない' }],
      correctAnswer: 'stay', acceptableAnswers: [],
      hint: 'ボールは きみの すぐ そばだよ。',
      explanation: 'ボールが すぐ そばに あるときは 走れない。\nサードゴロは いちばん とび出しやすい。ベースを ふんだまま 見よう。',
      ruleType: 'basic_judgment', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F5', 0.6), dur: 420 }, batterGo()] }
        ]),
        onCorrect: [
          { actor: 'ball', from: M('HOME', 'F5', 0.6), to: 'F5', dur: 300 },
          { label: 'サードが 捕った！', at: 'F5', hold: 480 },
          { par: [{ actor: 'ball', from: 'F5', to: 'B1', dur: 440 },
                  { actor: 'batter', from: [252, 282], to: 'B1', dur: 440 }] },
          { label: 'アウト', at: 'B1', hold: 460 },
          { label: 'ベースに いれば 安全', at: 'B3' }
        ]
      }
    },

    /* ===================== STAGE 4 フライをはんだんしよう ===================== */
    {
      id: 's4-01', stage: 4, themes: ['fly'], difficulty: 2,
      outs: 1, runners: { first: true }, playerBase: 1,
      play: { ballType: 'fly', direction: 'SS', fielder: 'SS', depth: 'shallow', outcome: 'caught' },
      decisionTiming: 'fly_up',
      questionText: '1アウト。きみは 1るいランナー。\nショートの 上に 小さい フライ！',
      answerType: 'twoChoice',
      choices: [{ id: 'go', label: '二塁へ 走る' }, { id: 'back', label: '一塁に もどる' }],
      correctAnswer: 'back', acceptableAnswers: [],
      hint: 'すぐ 捕られそうな 高さだね。',
      explanation: 'すぐ 捕られそうな フライは、塁に もどって まつ。\nとび出すと、捕られた あとに もどれなくて アウトに なるよ。',
      ruleType: 'basic_judgment', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F6', 0.5), dur: 600, arc: true, lift: 80 },
                  { actor: 'me', from: 'B1', to: [314, 216], dur: 420 },
                  batterGo()] }
        ]),
        onCorrect: [
          { par: [{ actor: 'me', from: [314, 216], to: 'B1', dur: 380 },
                  { actor: 'ball', from: M('HOME', 'F6', 0.5), to: 'F6', dur: 560, arc: true, lift: 40 }] },
          { sound: 'catch' }, { label: 'キャッチ！', at: 'F6', hold: 480 },
          { label: 'もどっていて セーフ', at: 'B1' }
        ]
      }
    },
    {
      id: 's4-02', stage: 4, themes: ['fly', 'touchup'], difficulty: 2,
      outs: 1, runners: { second: true }, playerBase: 2,
      play: { ballType: 'fly', direction: 'LF', fielder: 'LF', depth: 'deep', outcome: 'caught' },
      decisionTiming: 'catch_confirmed',
      questionText: '1アウト。きみは 2るいランナー。\nレフトの ふかい フライ。捕られた！',
      answerType: 'baseTap', tapBases: ['B2', 'B3', 'HOME'],
      choices: [], correctAnswer: 'B3', acceptableAnswers: [],
      hint: '捕った あとは 走って いいよ。どこまで 行ける？',
      explanation: '捕られた あとは 走って いい（タッチアップ）。\nふかい フライなら 一つ 先の 塁へ 進める。捕る まえに 走ると もどれないよ。',
      ruleType: 'basic_judgment',
      tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: 'F7', dur: 1150, arc: true, lift: 96 }, batterGo()] },
          { sound: 'catch' }, { label: 'キャッチ！', at: 'F7', hold: 560 }
        ]),
        onCorrect: [
          { par: [{ actor: 'me', from: 'B2', to: 'B3', dur: 850 },
                  { actor: 'ball', from: 'F7', to: 'F6', dur: 700 }] },
          { label: '三塁 セーフ！', at: 'B3' }
        ]
      }
    },
    {
      id: 's4-03', stage: 4, themes: ['fly', 'touchup'], difficulty: 3,
      outs: 1, runners: { third: true }, playerBase: 3,
      play: { ballType: 'fly', direction: 'CF', fielder: 'CF', depth: 'deep', outcome: 'caught' },
      decisionTiming: 'catch_confirmed',
      questionText: '1アウト。きみは 3るいランナー。\nセンターの ふかい フライ。捕られた！',
      answerType: 'twoChoice',
      choices: [{ id: 'go', label: 'ホームへ 走る' }, { id: 'stay', label: '三塁に とどまる' }],
      correctAnswer: 'go', acceptableAnswers: [],
      hint: 'センターは ホームから とおいよ。',
      explanation: 'ふかい フライなら、捕られた あとに ホームまで 間に あう。\nこれが タッチアップ（犠牲フライ）。1点 入るよ。',
      ruleType: 'tactical_judgment',
      tacticalNote: 'あさい フライの ときは 走らないよ。フライの ふかさで かわるから、コーチの こえを 聞こう。',
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: 'F8', dur: 1200, arc: true, lift: 100 }, batterGo()] },
          { sound: 'catch' }, { label: 'キャッチ！', at: 'F8', hold: 560 }
        ]),
        onCorrect: [
          { par: [{ actor: 'me', from: 'B3', to: 'HOME', dur: 900 },
                  { actor: 'ball', from: 'F8', to: [200, 196], dur: 800 }] },
          { label: 'ホームイン！ 1点！', at: 'HOME' }
        ]
      }
    },
    {
      id: 's4-04', stage: 4, themes: ['fly', 'touchup'], difficulty: 3,
      outs: 1, runners: { second: true }, playerBase: 2,
      play: { ballType: 'fly', direction: 'CF', fielder: 'CF', depth: 'normal', outcome: 'caught' },
      decisionTiming: 'fly_up',
      questionText: '1アウト。きみは 2るいランナー。\nセンターへ フライが 上がった！',
      answerType: 'threeChoice',
      choices: [
        { id: 'back', label: '塁に もどって 捕るのを 見る' },
        { id: 'go', label: '三塁へ 走る' },
        { id: 'half', label: '塁を はなれて 中間で まつ' }
      ],
      correctAnswer: 'back', acceptableAnswers: [],
      hint: '捕られてから 走っても 間に あうよ。',
      explanation: 'フライが 上がったら、まず 塁に もどって 捕るのを 見る。\n捕られてから 走っても 間に あう。これが いちばん 安全。',
      ruleType: 'basic_judgment',
      tacticalNote: 'チームに よっては「るいの あいだで まつ（ハーフウェイ）」と 教えるよ。まずは もどって 見るのが 安全。',
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: M('HOME', 'F8', 0.45), dur: 720, arc: true, lift: 88 },
                  batterGo()] }
        ]),
        onCorrect: [
          { actor: 'ball', from: M('HOME', 'F8', 0.45), to: 'F8', dur: 680, arc: true, lift: 46 },
          { sound: 'catch' }, { label: 'キャッチ！', at: 'F8', hold: 520 },
          { actor: 'me', from: 'B2', to: 'B3', dur: 800 },
          { label: 'タッチアップ 成功！', at: 'B3' }
        ]
      }
    },
    {
      id: 's4-05', stage: 4, themes: ['fly'], difficulty: 2,
      outs: 1, runners: { second: true }, playerBase: 2,
      play: { ballType: 'fly', direction: 'CF', fielder: 'CF', depth: 'normal', outcome: 'dropped' },
      decisionTiming: 'ball_dropped',
      questionText: '1アウト。きみは 2るいランナー。\nセンターが フライを おとした！',
      answerType: 'twoChoice',
      choices: [{ id: 'go', label: '走る' }, { id: 'stay', label: 'とまる' }],
      correctAnswer: 'go', acceptableAnswers: [],
      hint: 'ボールは 地面に ついたよ。',
      explanation: 'ボールが 地面に ついたら、もう 捕られて いない。\nすぐ 走って いい。おちるのを 見たら スタート！',
      ruleType: 'official_rule', tacticalNote: null,
      animation: {
        toDecision: pitch().concat([
          { par: [{ actor: 'ball', from: 'HOME', to: 'F8', dur: 1120, arc: true, lift: 92 }, batterGo()] },
          { sound: 'drop' }, { label: 'おとした！', at: 'F8', hold: 420 },
          { actor: 'ball', from: 'F8', to: [216, 70], dur: 240 }
        ]),
        onCorrect: [
          { par: [{ actor: 'me', from: 'B2', to: 'B3', dur: 800 },
                  { actor: 'ball', from: [216, 70], to: 'F8', dur: 320 }] },
          { label: '三塁へ！', at: 'B3' }
        ]
      }
    }
  ];

  // ステージ定義
  var STAGES = [
    { no: 1, title: 'まずは走ってみよう', sub: '打ったら一塁・塁の場所', ready: true },
    { no: 2, title: 'アウトカウントを見よう', sub: '0・1・2アウトで変わる', ready: true },
    { no: 3, title: 'ゴロをはんだんしよう', sub: 'フォースと進塁義務', ready: true },
    { no: 4, title: 'フライをはんだんしよう', sub: 'もどる・捕球かくにん', ready: true },
    { no: 5, title: 'タッチアップ', sub: 'じゅんびちゅう', ready: false },
    { no: 6, title: 'ランナーがいっぱい', sub: 'じゅんびちゅう', ready: false },
    { no: 7, title: '実戦チャレンジ', sub: 'ぜんぶ まぜて 5問', ready: true, mix: true }
  ];

  // 自由練習のテーマ
  var THEMES = [
    { key: 'basic', label: 'きほんの走塁' },
    { key: 'outs', label: 'アウトカウント' },
    { key: 'goro', label: 'ゴロ' },
    { key: 'fly', label: 'フライ' },
    { key: 'touchup', label: 'タッチアップ' },
    { key: 'all', label: 'ぜんぶ まぜて' }
  ];

  global.QUESTIONS = QUESTIONS;
  global.STAGES = STAGES;
  global.THEMES = THEMES;
})(window);
