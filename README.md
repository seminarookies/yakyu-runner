# ランナーはんだん

少年野球の低学年（小1〜3）向け、**走塁の「判断」を鍛える**Webアプリです。

ルールの暗記ではなく、「打球が飛んだ瞬間に、走る／戻る／待つ／次の塁へ を自分で決められる」
ことをねらいにしています。

- サーバーもログインも不要。**URLを開けばすぐ遊べます**
- 進んだ記録（クリア状況・バッジ）はスマホの中だけに保存されます
- iPhone・iPadのホーム画面に追加すると、アプリのように開けます（PWA）
- HTML＋CSS＋ふつうのJavaScriptだけ。むずかしいライブラリは使っていません

---

## 1. ファイルの置き方

この13個を、**ぜんぶ同じフォルダ**に入れてください（入れ子にしない）。

```
yakyu-runner/
├── index.html            ← アプリの入口
├── styles.css            ← 見た目
├── sound.js              ← 効果音（音声ファイルなし・その場で合成）
├── field.js              ← グラウンドの絵（表示だけ）
├── anim.js               ← アニメーションを再生する仕組み
├── questions.js          ← 問題データ（ここを足していく）
├── badges.js             ← バッジ・称号
├── engine.js             ← 出題・判定・進捗（画面を知らない）
├── ui.js                 ← 画面の切りかえ
├── manifest.webmanifest  ← ホーム画面に追加するための設定
├── sw.js                 ← オフライン用
├── icon-192.png          ← ホーム画面アイコン（小）
├── icon-512.png          ← ホーム画面アイコン（大）
└── README.md             ← このファイル
```

---

## 2. パソコン（Mac）で動かして確認する

`index.html` をダブルクリックでも画面は出ますが、「ホーム画面に追加」やオフライン機能は
**http:// で開いたとき**しか動きません。下の方法で確認するのがおすすめです。

1. Macで「ターミナル」を開く
2. 次の1行を貼って Enter

```bash
cd ~/Desktop/yakyu/yakyu-runner && python3 -m http.server 8000
```

3. ブラウザで `http://localhost:8000` を開く
4. 止めるときはターミナルで `Control + C`

---

## 3. 無料で公開する（GitHub Pages）

ブラウザだけで完結します。所要10分ほど。

1. https://github.com/ にログイン（組織 **seminarookies** を使います）
2. 右上の「＋」→ **New repository** → Owner を **seminarookies** に
3. Repository name に `yakyu-runner` → **Public** → **Create repository**
4. 次の画面で **uploading an existing file** を押す
5. `yakyu-runner` フォルダの**中のファイル13個**をまとめてドラッグ＆ドロップ
   （※フォルダごとではなく、中のファイルを選ぶのがコツ）
6. 下の **Commit changes** を押す
7. **Settings** → 左の **Pages** → Source「Deploy from a branch」、Branch **main** ／ **/(root)** → **Save**
8. 1〜2分待って再読み込みすると、上にURLが出ます

```
https://seminarookies.github.io/yakyu-runner/
```

このURLを、チームの子のスマホにLINEなどで送れば、そのまま遊べます。
個人の名前や写真は一切入っていません。

> 直したファイルを差しかえるときは、同じリポジトリで **Add file → Upload files** から
> 同じ名前のファイルを入れて Commit すればOKです。

---

## 4. iPhone・iPadのホーム画面に追加する

1. **Safari**で上のURLを開く（ChromeではなくSafariで）
2. 下（iPadは上）の **共有ボタン**（□に↑）をタップ
3. メニューを下にスクロールして **「ホーム画面に追加」**
4. 名前が「ランナーはんだん」になっていることを確認して **追加**

---

## 5. 遊び方

1. ホームで「ステージに ちょうせん」または「じゆう れんしゅう」を選ぶ
2. グラウンドの絵が動き、**いちばん判断すべき瞬間で止まる**（「どうする？」が出る）
3. ボタン、または**グラウンドの塁を直接タップ**して答える
4. 正解 → 理由＋正しい動きのアニメーション
   まちがい → ヒントが出て、**同じ問題にもう一度**挑戦
5. 1プレイ5問。**5問中4問正解でステージクリア**
6. まちがえた問題は、結果画面から**必ず復習**できます

1回2〜5分で終わるように作っています。長くやらせないのがねらいです。

### ステージ

| STAGE | テーマ | 中身 |
|---|---|---|
| 1 | まずは走ってみよう | 打ったら一塁、塁の場所、アウトのあと |
| 2 | アウトカウントを見よう | 同じ打球でも0・1・2アウトで判断が変わる |
| 3 | ゴロをはんだんしよう | フォース（進塁義務）がある／ない |
| 4 | フライをはんだんしよう | もどる、捕球かくにん、タッチアップ、落球 |
| 5 | タッチアップ | じゅんびちゅう（問題を足したら遊べます） |
| 6 | ランナーがいっぱい | じゅんびちゅう |
| 7 | 実戦チャレンジ | STAGE 1〜4からランダムに5問 |

ステージは順番に解放されます。「じゆう れんしゅう」は最初から全テーマ選べます。

---

## 6. 判断の3種類（だいじ）

問題ごとに、答えの根拠を3つに分けて表示しています。

| 表示 | 意味 |
|---|---|
| 野球のルール | 野球規則上そうなる（変わらない） |
| 少年野球の基本 | 一般に教えられる基本の動き |
| チームで変わる判断 | チームの方針で変わる。「唯一の正解」にしていない |

「チームで変わる判断」の問題には、🧢マークで補足が出ます。
チームの教え方と違うときは、**チームの教え方が優先**だと伝えてあげてください。

---

## 7. 問題を増やす

`questions.js` の最後のほう、`QUESTIONS` の配列に1つ足すだけです。

```js
{
  id: 's5-01', stage: 5, themes: ['touchup'], difficulty: 2,
  outs: 1, runners: { second: true }, playerBase: 2,
  play: { ballType: 'fly', direction: 'RF', fielder: 'RF', depth: 'deep', outcome: 'caught' },
  decisionTiming: 'catch_confirmed',
  questionText: '1アウト。きみは 2るいランナー。\nライトの ふかい フライ。捕られた！',
  answerType: 'baseTap', tapBases: ['B2', 'B3', 'HOME'],
  choices: [], correctAnswer: 'B3', acceptableAnswers: [],
  hint: '捕った あとは 走って いいよ。',
  explanation: 'ライトは 三塁から いちばん とおい。タッチアップで 三塁へ。',
  ruleType: 'basic_judgment', tacticalNote: null,
  animation: {
    toDecision: pitch().concat([
      { par: [{ actor: 'ball', from: 'HOME', to: 'F9', dur: 1150, arc: true, lift: 96 }, batterGo()] },
      { label: 'キャッチ！', at: 'F9', hold: 560 }
    ]),
    onCorrect: [
      { par: [{ actor: 'me', from: 'B2', to: 'B3', dur: 850 },
              { actor: 'ball', from: 'F9', to: 'F4', dur: 700 }] },
      { label: '三塁 セーフ！', at: 'B3' }
    ]
  }
}
```

### 書くときの決まり

- `answerType` は `twoChoice` / `threeChoice` / `baseTap` の3つ
  - `baseTap` のときは `tapBases` にタップできる塁（`B1` `B2` `B3` `HOME`）を書く
  - ボタンのときは `choices` に `{id, label}` を並べ、`correctAnswer` にその `id`
- `questionText` は**2行・45文字以内**。長い説明は `explanation` へ
- `ruleType` が `tactical_judgment` のときは `tacticalNote` を必ず書く
- `playerBase` は自分がいる塁（`0`＝バッター、`1` `2` `3`）。`runners` にも同じ塁を `true` に
- 打者走者を出したくないときは `hideBatter: true`

### アニメーションの書き方

守備位置や塁は**名前**で書きます。
`HOME` `B1` `B2` `B3` `P` と、`1B` `2B` `3B` `SS` `LF` `CF` `RF` `C`。

| 書き方 | 意味 |
|---|---|
| `{ actor:'ball', from:'HOME', to:'SS', dur:600 }` | ゴロ（まっすぐ） |
| `{ actor:'ball', from:'HOME', to:'LF', dur:1200, arc:true }` | フライ（山なり・だんだん大きくなる） |
| `{ actor:'me', from:'B2', to:'B3', dur:800 }` | 自分が走る |
| `{ label:'キャッチ！', at:'LF' }` | 吹き出し |
| `{ sound:'hit' }` | 効果音（`hit` カキーン／`catch` 捕球／`drop` 落球） |
| `{ wait:300 }` | 待つ |
| `{ par:[ …, … ] }` | 同時に動かす |

動かせるのは `me`（自分）、`batter`（打者走者）、`r1` `r2` `r3`（他のランナー）、`ball`。
`M('HOME','SS',0.55)` と書くと「ホームからショートまでの55%の地点」になります。
**`toDecision` の最後のステップが終わったところで画面が止まります**。ここが「判断の瞬間」です。

ステージを増やすときは `questions.js` のいちばん下の `STAGES` に1行足します
（`ready: true` にすると遊べるようになります）。

---

## 8. ファイルを直したのにスマホが古いまま、のとき

オフライン用のしくみ（Service Worker）が前のファイルを覚えているためです。
`sw.js` の1行目あたりにある

```js
const CACHE = 'yakyu-runner-v3';
```

の **v1 を v2、v3 …と増やして**アップロードし直すと、新しいものが届きます。

---

## 9. 記録の保存について

- 記録（クリアしたステージ・バッジ）は、そのスマホ／iPadの**ブラウザの中だけ**に保存されます
- 端末どうしで同期はしません。ログインもサーバーもありません
- Safariの履歴・サイトデータを全部消すと記録も消えます
- バッジ画面の下の「きろくを ぜんぶ けす」でリセットできます

---

## 10. これから足せるところ

- STAGE 5「タッチアップ」・STAGE 6「ランナーがいっぱい」の問題
- 暴投・牽制・オーバーラン（`ballType: 'wildpitch'`、`decisionTiming: 'wildpitch'` の枠は用意済み）
- 守備の判断、バッターの判断
- コーチが問題を作れる画面
- 苦手な `themes` を集計して出す「苦手克服ミッション」
- スマホアプリ化（`engine.js` と `questions.js` は画面に依存していないので、そのまま使えます）
