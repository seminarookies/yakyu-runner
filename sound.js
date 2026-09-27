/* sound.js
 * 効果音。音声ファイルは使わず、その場で音を合成する（Web Audio）。
 * 追加ファイルが増えないので、公開・更新がかんたん。
 *
 * つかい方： Sound.play('hit')  … カキーン
 *   hit    打球（金属バット）
 *   catch  キャッチ
 *   drop   おとした
 *   correct / wrong  正解・まちがい
 *   cue    つぎの問題のあいず
 *   clear  ステージクリア
 */
(function (global) {
  'use strict';

  var KEY = 'yakyu-runner-sound';
  var ctx = null, master = null;
  var on = true;
  try { on = global.localStorage.getItem(KEY) !== 'off'; } catch (e) {}

  function ac() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    return ctx;
  }

  // iPhone/iPad は、画面をさわったときでないと音が出せない
  function unlock() {
    var c = ac();
    if (c && c.state === 'suspended') c.resume();
  }

  function noiseBuf(c, sec, shape) {
    var n = Math.max(1, Math.floor(c.sampleRate * sec));
    var b = c.createBuffer(1, n, c.sampleRate);
    var d = b.getChannelData(0);
    for (var i = 0; i < n; i++) {
      var k = 1 - i / n;
      d[i] = (Math.random() * 2 - 1) * Math.pow(k, shape || 3);
    }
    return b;
  }

  function burst(c, t, sec, filterType, freq, gain, shape) {
    var src = c.createBufferSource();
    src.buffer = noiseBuf(c, sec, shape);
    var f = c.createBiquadFilter();
    f.type = filterType; f.frequency.value = freq;
    var g = c.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t);
  }

  function tone(c, t, freq, sec, type, gain, glideTo) {
    var o = c.createOscillator();
    o.type = type || 'triangle';
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + sec);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + sec);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + sec + 0.03);
  }

  var SOUNDS = {
    // カキーン（金属バット）＝ 鋭いアタック＋高い金属の余韻
    hit: function (c, t) {
      burst(c, t, 0.045, 'highpass', 1800, 0.55, 2.2);
      [2180, 3260, 4700].forEach(function (f, i) {
        tone(c, t, f, 0.42 - i * 0.09, 'triangle', 0.30 / (i + 1), f * 0.9);
      });
      tone(c, t, 620, 0.09, 'square', 0.12, 420);
    },
    // グラブに収まる音
    'catch': function (c, t) {
      burst(c, t, 0.10, 'lowpass', 900, 0.5, 2.6);
      tone(c, t, 180, 0.11, 'sine', 0.22, 110);
    },
    // ポロッと落とす
    drop: function (c, t) {
      burst(c, t, 0.08, 'lowpass', 600, 0.45, 2.0);
      burst(c, t + 0.11, 0.07, 'lowpass', 450, 0.32, 2.0);
      tone(c, t + 0.02, 150, 0.10, 'sine', 0.26, 95);
    },
    correct: function (c, t) {
      tone(c, t, 784, 0.13, 'triangle', 0.30);
      tone(c, t + 0.11, 1047, 0.22, 'triangle', 0.30);
    },
    wrong: function (c, t) {
      tone(c, t, 320, 0.14, 'square', 0.22, 300);
      tone(c, t + 0.13, 232, 0.26, 'square', 0.22, 210);
    },
    cue: function (c, t) {
      tone(c, t, 988, 0.10, 'sine', 0.22);
    },
    clear: function (c, t) {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone(c, t + i * 0.11, f, 0.26, 'triangle', 0.28);
      });
    }
  };

  function play(name) {
    if (!on) return;
    var c = ac();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    var fn = SOUNDS[name];
    if (fn) { try { fn(c, c.currentTime + 0.001); } catch (e) {} }
  }

  global.Sound = {
    play: play,
    unlock: unlock,
    isOn: function () { return on; },
    toggle: function () {
      on = !on;
      try { global.localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
      if (on) { unlock(); play('cue'); }
      return on;
    }
  };
})(window);
