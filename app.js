(function () {
  'use strict';

  const DEMO_LABELS = [
    'Module Page',
    'Pod Panel',
    'Join Pod',
    'Joining',
    'Active Session',
    'Create Pod',
    'Inactive',
    'Session End',
    'No Pods',
  ];

  const SPEEDS = [1, 1.25, 1.5, 2];

  function makeLesson(n, title, mins, extra) {
    const o = extra || {};
    const sec = mins * 60 + (o.extraSec || 0);
    return {
      n,
      title,
      durationLabel: mins + ' mins',
      durationSec: sec,
      mins,
      xp: o.xp != null ? o.xp : 120,
      date: o.date || 'Mar 28, 2026',
      desc:
        o.desc ||
        'In this session, we explore how user research informs design decisions and how to translate insights into wireframes and prototypes that solve real problems.',
      tags: o.tags || ['User Research', 'Prototyping', 'Wireframes'],
      resources: o.resources || [
        'Lesson slides (PDF)',
        'FigJam — wireframe starter',
        'Reading: Nielsen Norman on usability',
      ],
      aiBullets: o.aiBullets || [
        'Core idea: align user goals with business constraints early.',
        'Use research signals to prioritize what to prototype first.',
        'Validate assumptions with lightweight tests before high fidelity.',
      ],
      completed: !!o.completed,
    };
  }

  function placeholderLessons(count) {
    const out = [];
    for (let i = 1; i <= count; i++) {
      out.push(
        makeLesson(i, 'Lesson ' + i + ' — ' + sampleTitle(i), 18 + ((i * 3) % 12), {
          completed: i <= 1,
        })
      );
    }
    return out;
  }

  function sampleTitle(i) {
    const t = ['Sketching flows', 'Heuristic review', 'Design tokens', 'Usability test plan', 'Visual hierarchy', 'Portfolio critique', 'Motion basics', 'Design QA'];
    return t[(i - 1) % t.length];
  }

  const MODULES = [
    {
      id: 'found',
      name: 'Foundations',
      lessons: [
        makeLesson(1, 'Introduction to Product Design', 20, {
          completed: true,
          desc: 'Orientation to the Foundations track: outcomes, how sessions work, and how we’ll build from research to shipped UI.',
        }),
        makeLesson(2, 'Understanding Users', 18, {
          completed: true,
          desc: 'Personas vs. behavioral segments, interview basics, and turning notes into actionable insights.',
        }),
        makeLesson(3, 'Foundations of Product Design', 24, {
          completed: false,
          desc:
            'In this session, we dive deep into the foundational principles of product design, exploring how user research informs every design decision. You will learn how to translate research insights into wireframes and early prototypes that solve real user problems while aligning with business objectives and technical constraints.',
          tags: ['User Research', 'Prototyping', 'Wireframes'],
        }),
        makeLesson(4, 'Wireframing Basics', 25, { completed: false }),
        makeLesson(5, 'Prototyping Methods', 21, { completed: false }),
        makeLesson(6, 'Final Project Walkthrough', 18, { completed: false }),
      ],
    },
    { id: 'ux', name: 'Advanced UX', lessons: placeholderLessons(4) },
    { id: 'ds', name: 'Design Systems', lessons: placeholderLessons(7) },
    { id: 'rm', name: 'Research Methods', lessons: placeholderLessons(5) },
    { id: 'vd', name: 'Visual Design', lessons: placeholderLessons(8) },
  ];

  const state = {
    demo: 0,
    moduleIdx: 0,
    lessonIdx: 2,
    tab: 'overview',
    currentSec: 4 * 60 + 32,
    playing: false,
    muted: false,
    speedIdx: 0,
    podPanelOpen: false,
    tmr: 1800,
    joinCountdown: 3,
  };

  let playTimer = null;
  let cur = 0;

  function fmt(s) {
    s = Math.max(0, Math.floor(s));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function getMod() {
    return MODULES[state.moduleIdx];
  }

  function getLesson() {
    const m = getMod();
    return m.lessons[state.lessonIdx] || m.lessons[0];
  }

  function completedCount() {
    return getMod().lessons.filter(function (l) {
      return l.completed;
    }).length;
  }

  function progressPct() {
    const m = getMod();
    if (!m.lessons.length) return 0;
    return (completedCount() / m.lessons.length) * 100;
  }

  function lessonRowStatus(idx) {
    const L = getMod().lessons[idx];
    if (L.completed) return 'done';
    if (idx === state.lessonIdx) return 'cur';
    return '';
  }

  function side() {
    return (
      '<div class="is" role="navigation" aria-label="App">' +
      '<div class="logo"><svg><use href="#i-star"/></svg></div>' +
      '<div class="ico"><svg><use href="#i-grid"/></svg></div>' +
      '<div class="ico on"><svg><use href="#i-mod"/></svg></div>' +
      '<div class="ico"><svg><use href="#i-folder"/></svg></div>' +
      '<div class="ico"><svg><use href="#i-chart"/></svg></div>' +
      '<div class="ico"><svg><use href="#i-trophy"/></svg></div>' +
      '<div class="ico"><svg><use href="#i-ppl"/></svg></div>' +
      '<div class="gap"></div>' +
      '<div class="ico"><svg><use href="#i-chat"/></svg></div>' +
      '<div class="bav" title="Profile">V</div>' +
      '</div>' +
      '<div class="ms"><h3>Modules</h3>' +
      MODULES.map(function (m, i) {
        return (
          '<div class="mi' +
          (i === state.moduleIdx ? ' on' : '') +
          '" data-mi="' +
          i +
          '">' +
          m.name +
          '<span class="c">' +
          m.lessons.length +
          '</span></div>'
        );
      }).join('') +
      '</div>'
    );
  }

  function tb(mode, shortMeta) {
    const les = getLesson();
    const m = getMod();
    let right = '';
    if (mode === 'active') {
      right =
        '<div class="ti"><svg><use href="#i-cal"/></svg></div>' +
        '<div class="apill" id="debugPill"><div class="pav"><svg><use href="#i-pod"/></svg></div>Debug Squad<span class="timer" id="tPill">' +
        fmt(state.tmr) +
        ' left</span></div>' +
        '<div class="ti"><svg><use href="#i-bell"/></svg></div>' +
        '<div class="profile-pill" title="Account">AA</div>';
    } else {
      right =
        '<div class="ti"><svg><use href="#i-cal"/></svg></div>' +
        '<div class="ti" id="podTrigger" title="Study pods"><svg><use href="#i-pod"/></svg></div>' +
        '<div class="ti"><svg><use href="#i-bell"/></svg></div>' +
        '<div class="profile-pill" title="Account">AA</div>';
    }
    const crumb =
      'Modules<span class="sep">›</span>' +
      m.name +
      '<span class="sep">›</span><span class="cur">Lesson ' +
      les.n +
      '</span>';
    return (
      '<div class="tb">' +
      '<div class="bc">' +
      crumb +
      '</div>' +
      '<div class="srch"><svg><use href="#i-search"/></svg><input type="search" id="q" placeholder="Search lessons, topics..." autocomplete="off"><span class="k">⌘K</span></div>' +
      '<div class="xp"><span aria-hidden="true">⚡</span> 905</div>' +
      '<div class="tbr">' +
      right +
      '</div></div>'
    );
  }

  function vid() {
    const les = getLesson();
    const dur = les.durationSec;
    const pct = dur ? Math.min(100, (state.currentSec / dur) * 100) : 0;
    const showBig = !state.playing && state.currentSec < 1;
    return (
      '<div class="vid" id="videoBox">' +
      '<div class="tag" id="vidTag">Session ' +
      les.n +
      ' · ' +
      les.title +
      '</div>' +
      '<button type="button" class="play" id="bigPlay" aria-label="Play"><svg><use href="#i-play"/></svg></button>' +
      '<div class="seek-wrap"><input type="range" class="seek-r" id="seek" min="0" max="' +
      dur +
      '" value="' +
      Math.min(dur, state.currentSec) +
      '" step="1" aria-label="Seek"></div>' +
      '<div class="vc">' +
      '<div class="vc-l">' +
      '<button type="button" id="btnPlay" aria-label="Play or pause">' +
      '<svg id="icoPlayPause"><use href="' +
      (state.playing ? '#i-pause' : '#i-play') +
      '"/></svg></button>' +
      '<span class="vc-time" id="timeLbl">' +
      fmt(state.currentSec) +
      ' / ' +
      fmt(dur) +
      '</span></div>' +
      '<div class="vc-r">' +
      '<button type="button" id="btnVol" aria-label="Mute">' +
      '<svg><use href="#i-vol"/></svg></button>' +
      '<button type="button" class="spd" id="btnSpeed">' +
      SPEEDS[state.speedIdx] +
      'x</button>' +
      '<button type="button" id="btnFs" aria-label="Fullscreen"><svg><use href="#i-fs"/></svg></button>' +
      '</div></div></div>'
    );
  }

  function tabPanel() {
    const les = getLesson();
    if (state.tab === 'resources') {
      return (
        '<div class="abt"><h3>Resources</h3><ul>' +
        les.resources
          .map(function (r) {
            return '<li>' + r + '</li>';
          })
          .join('') +
        '</ul></div>'
      );
    }
    if (state.tab === 'ai') {
      return (
        '<div class="abt"><h3>AI Summary</h3><ul>' +
        les.aiBullets
          .map(function (b) {
            return '<li>' + b + '</li>';
          })
          .join('') +
        '</ul></div>'
      );
    }
    return (
      '<div class="abt"><h3>About this lesson</h3><p>' +
      les.desc +
      '</p><div class="tags">' +
      les.tags
        .map(function (t) {
          return '<span>' + t + '</span>';
        })
        .join('') +
      '</div></div>'
    );
  }

  function meta(short) {
    const les = getLesson();
    const tabs = ['overview', 'resources', 'ai'];
    const labels = ['Overview', 'Resources', '✨ AI Summary'];
    const tabBtns = tabs
      .map(function (id, i) {
        return (
          '<button type="button" class="' +
          (state.tab === id ? 'on' : '') +
          '" data-tab="' +
          id +
          '">' +
          labels[i] +
          '</button>'
        );
      })
      .join('');
    const line = short
      ? les.mins + ' mins <span class="sep">|</span> +' + les.xp + ' XP'
      : '<svg style="width:12px;height:12px;flex-shrink:0"><use href="#i-cal"/></svg> ' +
        les.date +
        ' <span class="sep">|</span> Live Session <span class="sep">|</span> +' +
        les.xp +
        ' XP';
    return (
      '<div class="lm"><h2 id="lessonTitle">Lesson ' +
      les.n +
      ' — ' +
      les.title +
      '</h2>' +
      '<div class="lm-i">' +
      line +
      '</div>' +
      '<div class="by"><a href="#">By Arjun Sharma</a></div></div>' +
      '<div class="ctabs" role="tablist">' +
      tabBtns +
      '</div>' +
      tabPanel()
    );
  }

  function lessHTML() {
    const m = getMod();
    return m.lessons
      .map(function (l, idx) {
        const st = lessonRowStatus(idx);
        const chk = st === 'done' ? '<svg><use href="#i-check"/></svg>' : '';
        return (
          '<div class="lr' +
          (st === 'cur' ? ' now' : '') +
          '" data-li="' +
          idx +
          '">' +
          '<div class="cir' +
          (st === 'done' ? ' done' : st === 'cur' ? ' cur' : '') +
          '">' +
          chk +
          '</div>' +
          '<div class="inf"><div class="n">Lesson ' +
          l.n +
          '</div><div class="t">' +
          l.title +
          '</div>' +
          (st === 'cur' ? '<div class="st">Playing now</div>' : '') +
          '</div><div class="d">' +
          l.durationLabel +
          '</div></div>'
        );
      })
      .join('');
  }

  function rp() {
    const m = getMod();
    const done = completedCount();
    const pct = progressPct();
    return (
      '<div class="cr"><div class="llh">' +
      m.name +
      ' · ' +
      m.lessons.length +
      ' lessons</div><div class="ll" id="lessonList">' +
      lessHTML() +
      '</div><div class="mpg"><h4>Module Progress</h4><div class="bar"><div class="f" style="width:' +
      pct +
      '%"></div></div><div class="tx">' +
      done +
      ' of ' +
      m.lessons.length +
      ' lessons completed</div></div></div>'
    );
  }

  function sessionR() {
    return (
      '<div class="cr"><div class="sr"><div class="sr-h"><div class="l"><span class="gdot"></span><h4>Debug Squad</h4></div><div style="display:flex;align-items:center;gap:8px"><span class="sr-tm" id="tPanel">' +
      fmt(state.tmr) +
      '</span><button type="button" class="fp-x" id="closeSess">✕</button></div></div>' +
      '<div class="sr-sect"><div class="sr-lbl">Members</div>' +
      '<div class="mr"><div class="av" style="background:var(--orange);width:26px;height:26px;font-size:9px">V</div><div class="nm">Vipin</div><div class="ms2" style="color:var(--green)">Working</div></div>' +
      '<div class="mr"><div class="av" style="background:var(--purple);width:26px;height:26px;font-size:9px">P</div><div class="nm">Priya</div><div class="ms2" style="color:var(--accent)">Active</div></div>' +
      '<div class="mr"><div class="av" style="background:var(--blue);width:26px;height:26px;font-size:9px">A</div><div class="nm">Arjun</div><div class="ms2" style="color:var(--accent)">Focused</div></div>' +
      '<div class="mr"><div class="av" style="background:var(--green);width:26px;height:26px;font-size:9px">K</div><div class="nm">Keerthi</div><div class="ms2" style="color:var(--yellow)">On Break</div></div></div>' +
      '<div class="sr-sect"><div class="sr-lbl">Chat</div></div>' +
      '<div class="cw" id="chatW">' +
      '<div class="cm"><div class="av" style="background:var(--purple);width:22px;height:22px;font-size:8px">P</div><div><span class="cn">Priya</span><span class="cx">anyone confused by the dependency array?</span></div></div>' +
      '<div class="cm"><div class="av" style="background:var(--blue);width:22px;height:22px;font-size:8px">A</div><div><span class="cn">Arjun</span><span class="cx">yes same here</span></div></div>' +
      '<div class="cm"><div class="av" style="background:var(--green);width:22px;height:22px;font-size:8px">K</div><div><span class="cn">Keerthi</span><span class="cx">it re-renders when deps change</span></div></div></div>' +
      '<div class="ci"><input id="chatIn" placeholder="Say something...">' +
      '<button type="button" class="snd" id="chatSend"><svg><use href="#i-send"/></svg></button></div>' +
      '<button type="button" class="lv" id="leavePod">Leave Pod</button>' +
      '<div class="mpg"><h4>Module Progress</h4><div class="bar"><div class="f" style="width:' +
      progressPct() +
      '%"></div></div><div class="tx">' +
      completedCount() +
      ' of ' +
      getMod().lessons.length +
      ' lessons completed</div></div></div></div>'
    );
  }

  function podPanel() {
    return (
      '<div class="fp show" id="podPanel" role="dialog" aria-label="Study Pod">' +
      '<div class="fp-h"><div class="tl"><svg><use href="#i-pod"/></svg>Study Pod</div><button type="button" class="fp-x" id="closePod">✕</button></div>' +
      '<div class="fp-b"><div class="fps"><svg><use href="#i-search"/></svg><input placeholder="Search pods..."></div>' +
      '<div class="fpf"><select><option>All modules</option></select><select><option>All types</option></select></div>' +
      '<div class="pc"><div class="pc-r"><div class="pcav">DS</div><div class="pc-i"><h4>Debug_Squad</h4><div class="sub">Module 2<br>Coding Practice</div></div><button type="button" class="jb" id="joinPodBtn">Join →</button></div>' +
      '<div class="pc-m"><span class="tp g">6 mins ago</span><span class="mc"><svg><use href="#i-ppl"/></svg>2/5</span></div></div>' +
      '<div class="pc"><div class="pc-r"><div class="pcav">NO</div><div class="pc-i"><h4>Night Owls</h4><div class="sub">Module 2<br>Coding Practice</div></div><button type="button" class="jb" id="joinPodBtn2">Join →</button></div>' +
      '<div class="pc-m"><span class="tp g">10 mins ago</span><span class="mc"><svg><use href="#i-ppl"/></svg>3/5</span></div></div>' +
      '<div class="pc"><div class="pc-r"><div class="pcav">S</div><div class="pc-i"><h4>Study</h4><div class="sub">Module 4<br>Watch along & learn</div></div><button type="button" class="eb" disabled>Ended</button></div>' +
      '<div class="pc-m"><span class="tp r">1 hr ago</span><span class="mc"><svg><use href="#i-ppl"/></svg>5/5</span></div></div></div>' +
      '<div class="fp-f"><a href="#" onclick="return false">View all pods ↓</a><button type="button" class="cbtn" id="createPodFromPanel">+ Create Pod</button></div></div>'
    );
  }

  function noPods() {
    return (
      '<div class="fp show" id="podPanel" role="dialog" aria-label="Study Pod">' +
      '<div class="fp-h"><div class="tl"><svg><use href="#i-pod"/></svg>Study Pod</div><button type="button" class="fp-x" id="closePod">✕</button></div>' +
      '<div class="fp-b"><div class="es"><div class="art"><svg><use href="#i-ppl"/></svg></div><h4>No pods active right now</h4><p>No one is studying this module yet</p>' +
      '<button type="button" class="cta" id="createPodEmpty">+ Create Pod</button><div class="hint">or wait and check back later</div></div></div></div>'
    );
  }

  function render(i) {
    cur = i;
    state.demo = i;
    const a = document.getElementById('app');
    hideAll();
    const base = side() + '<div class="mn" style="position:relative">';
    let inner = '';
    const shortMeta = i === 1;

    if (i === 0) {
      inner =
        base +
        tb('def', shortMeta) +
        '<div class="ct"><div class="cl">' +
        vid() +
        meta(shortMeta) +
        '</div>' +
        rp() +
        '</div></div>';
    } else if (i === 1) {
      inner =
        base +
        tb('def', shortMeta) +
        '<div class="ct"><div class="cl">' +
        vid() +
        meta(shortMeta) +
        '</div>' +
        rp() +
        '</div>' +
        podPanel() +
        '</div>';
    } else if (i === 2) {
      inner =
        base +
        tb('def', shortMeta) +
        '<div class="ct"><div class="cl">' +
        vid() +
        meta(false) +
        '</div>' +
        rp() +
        '</div></div>';
      showM('ov1');
    } else if (i === 3) {
      inner =
        base +
        tb('def', shortMeta) +
        '<div class="ct"><div class="cl">' +
        vid() +
        meta(false) +
        '</div>' +
        rp() +
        '</div></div>';
      startJoin();
    } else if (i === 4) {
      state.tmr = 1800;
      inner =
        base +
        tb('active', shortMeta) +
        '<div class="ct"><div class="cl">' +
        vid() +
        meta(false) +
        '</div>' +
        sessionR() +
        '</div></div>';
    } else if (i === 5) {
      inner =
        base +
        tb('active', shortMeta) +
        '<div class="ct"><div class="cl">' +
        vid() +
        meta(false) +
        '</div>' +
        rp() +
        '</div></div>';
      showM('ov3');
    } else if (i === 6) {
      inner =
        base +
        tb('active', shortMeta) +
        '<div class="ct"><div class="cl">' +
        vid() +
        meta(false) +
        '</div>' +
        rp() +
        '</div></div>';
      showM('ov4');
    } else if (i === 7) {
      inner =
        base +
        tb('active', shortMeta) +
        '<div class="ct"><div class="cl">' +
        vid() +
        meta(false) +
        '</div>' +
        rp() +
        '</div></div>';
      showM('ov5');
    } else if (i === 8) {
      inner =
        base +
        tb('def', shortMeta) +
        '<div class="ct"><div class="cl">' +
        vid() +
        meta(false) +
        '</div>' +
        rp() +
        '</div>' +
        noPods() +
        '</div>';
    }

    a.innerHTML = inner;
    wireAfterRender();
  }

  function stopPlayTimer() {
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
  }

  function updateVideoUI() {
    const les = getLesson();
    const dur = les.durationSec;
    const seek = document.getElementById('seek');
    const timeLbl = document.getElementById('timeLbl');
    const ico = document.getElementById('icoPlayPause');
    const big = document.getElementById('bigPlay');
    if (seek) seek.value = Math.min(dur, state.currentSec);
    if (timeLbl) timeLbl.textContent = fmt(state.currentSec) + ' / ' + fmt(dur);
    if (ico) ico.innerHTML = '<use href="' + (state.playing ? '#i-pause' : '#i-play') + '"/>';
    const spd = document.getElementById('btnSpeed');
    if (spd) spd.textContent = SPEEDS[state.speedIdx] + 'x';
    if (big) {
      big.classList.toggle('hidden', state.playing || state.currentSec > 0.5);
    }
  }

  function togglePlay() {
    const dur = getLesson().durationSec;
    if (state.currentSec >= dur) state.currentSec = 0;
    state.playing = !state.playing;
    stopPlayTimer();
    if (state.playing) {
      playTimer = setInterval(function () {
        state.currentSec += SPEEDS[state.speedIdx];
        if (state.currentSec >= dur) {
          state.currentSec = dur;
          state.playing = false;
          stopPlayTimer();
        }
        updateVideoUI();
      }, 1000);
    }
    updateVideoUI();
  }

  function wireAfterRender() {
    document.querySelectorAll('[data-mi]').forEach(function (el) {
      el.addEventListener('click', function () {
        const idx = +el.getAttribute('data-mi');
        if (idx === state.moduleIdx) return;
        state.moduleIdx = idx;
        state.lessonIdx = 0;
        state.currentSec = 0;
        state.playing = false;
        stopPlayTimer();
        state.tab = 'overview';
        render(cur);
      });
    });

    document.querySelectorAll('[data-li]').forEach(function (el) {
      el.addEventListener('click', function () {
        const idx = +el.getAttribute('data-li');
        state.lessonIdx = idx;
        state.currentSec = 0;
        state.playing = false;
        stopPlayTimer();
        state.tab = 'overview';
        render(cur);
      });
    });

    document.querySelectorAll('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.tab = b.getAttribute('data-tab');
        const tabs = document.querySelector('.ctabs');
        if (!tabs) return;
        tabs.querySelectorAll('button').forEach(function (x) {
          x.classList.toggle('on', x.getAttribute('data-tab') === state.tab);
        });
        const lm = document.querySelector('.lm');
        const tabsEl = document.querySelector('.ctabs');
        const oldAbt = document.querySelector('.abt');
        if (oldAbt) oldAbt.outerHTML = tabPanel();
        if (!document.querySelector('.abt') && lm && tabsEl) {
          tabsEl.insertAdjacentHTML('afterend', tabPanel());
        }
      });
    });

    const seek = document.getElementById('seek');
    if (seek) {
      seek.addEventListener('input', function () {
        state.currentSec = +seek.value;
        state.playing = false;
        stopPlayTimer();
        updateVideoUI();
      });
    }

    const bigPlay = document.getElementById('bigPlay');
    if (bigPlay) bigPlay.addEventListener('click', togglePlay);
    const btnPlay = document.getElementById('btnPlay');
    if (btnPlay) btnPlay.addEventListener('click', togglePlay);

    const btnSpeed = document.getElementById('btnSpeed');
    if (btnSpeed) {
      btnSpeed.addEventListener('click', function () {
        state.speedIdx = (state.speedIdx + 1) % SPEEDS.length;
        updateVideoUI();
      });
    }

    const box = document.getElementById('videoBox');
    const btnFs = document.getElementById('btnFs');
    if (btnFs && box) {
      btnFs.addEventListener('click', function () {
        if (document.fullscreenElement) document.exitFullscreen();
        else box.requestFullscreen && box.requestFullscreen();
      });
    }

    const podTr = document.getElementById('podTrigger');
    if (podTr) {
      podTr.addEventListener('click', function () {
        go(1);
      });
    }

    const closePod = document.getElementById('closePod');
    if (closePod) {
      closePod.addEventListener('click', function () {
        go(0);
      });
    }
    ['joinPodBtn', 'joinPodBtn2'].forEach(function (id) {
      const b = document.getElementById(id);
      if (b)
        b.addEventListener('click', function () {
          showM('ov1');
        });
    });
    const cp1 = document.getElementById('createPodFromPanel');
    if (cp1) cp1.addEventListener('click', function () {
      showM('ov3');
    });
    const cp2 = document.getElementById('createPodEmpty');
    if (cp2) cp2.addEventListener('click', function () {
      showM('ov3');
    });

    const closeSess = document.getElementById('closeSess');
    if (closeSess) closeSess.addEventListener('click', function () {
      go(0);
    });

    const leavePod = document.getElementById('leavePod');
    if (leavePod) leavePod.addEventListener('click', function () {
      showM('ov5');
    });

    const chatSend = document.getElementById('chatSend');
    const chatIn = document.getElementById('chatIn');
    if (chatSend && chatIn) {
      chatSend.addEventListener('click', sendMsg);
      chatIn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') sendMsg();
      });
    }

    const q = document.getElementById('q');
    if (q) {
      q.addEventListener('focus', function () {
        q.select();
      });
    }

    updateVideoUI();
  }

  function go(i) {
    cur = i;
    DEMO_LABELS.forEach(function (_, j) {
      const dock = document.getElementById('dock');
      if (dock && dock.children[j]) dock.children[j].classList.toggle('on', j === i);
    });
    render(i);
  }

  window.go = go;

  function showM(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const mdl = el.querySelector('.mdl');
    if (id === 'ov1') mdl.innerHTML = joinH();
    else if (id === 'ov3') mdl.innerHTML = createH();
    else if (id === 'ov4') mdl.innerHTML = inactiveH();
    else if (id === 'ov5') mdl.innerHTML = endH();
    el.classList.add('show');
  }

  function hideM(id) {
    document.getElementById(id).classList.remove('show');
  }

  function hideAll() {
    document.querySelectorAll('.ov').forEach(function (o) {
      o.classList.remove('show');
    });
  }

  window.hideM = hideM;
  window.showM = showM;

  function joinH() {
    return (
      '<div class="jm-hdr"><span class="gd"></span>You are joining this pod!</div><div class="jmav">DS</div><h3>Debug_Squad</h3><div class="sub" style="color:var(--sec)">Module 2 · Coding exercise</div>' +
      '<div class="pills"><span class="gp">Started 6 mins ago</span><span class="mp"><svg><use href="#i-ppl"/></svg>2/5</span></div>' +
      '<div class="btns"><button type="button" class="jn" id="joinNowBtn">Join Now →</button><button type="button" class="cn" id="joinCancelBtn">Cancel</button></div>'
    );
  }

  function startJoin() {
    const el = document.getElementById('ov2');
    let c = 3;
    function u() {
      el.querySelector('.mdl').innerHTML = joinAnimH(c);
      const cancel = el.querySelector('#joinAnimCancel');
      if (cancel) cancel.addEventListener('click', function () {
        hideM('ov2');
      });
      if (c <= 1) {
        setTimeout(function () {
          hideM('ov2');
          go(4);
        }, 1000);
        return;
      }
      setTimeout(function () {
        c--;
        u();
      }, 1000);
    }
    el.classList.add('show');
    u();
  }

  function joinAnimH(n) {
    const p = ((3 - n) / 3) * 100;
    const ci = 2 * Math.PI * 32;
    return (
      '<div class="jm-hdr"><span class="gd" style="width:7px;height:7px;border-radius:50%;background:var(--green)"></span>You are joining this pod!</div>' +
      '<div class="ja-ring"><span class="num">' +
      n +
      '</span><svg viewBox="0 0 72 72"><circle class="bg" cx="36" cy="36" r="32"/><circle class="fg" cx="36" cy="36" r="32" stroke-dasharray="' +
      ci +
      '" stroke-dashoffset="' +
      (ci - (ci * p) / 100) +
      '"/></svg></div>' +
      '<p style="color:var(--text);font-size:12px">Hang in tight, you will be<br>joining the pod in ' +
      n +
      ' secs</p>' +
      '<div class="ja-bar"><div class="f" style="width:' +
      p +
      '%"></div></div>' +
      '<span class="cancel" id="joinAnimCancel">Cancel</span>'
    );
  }

  function createH() {
    return (
      '<button type="button" class="mx" id="createClose">✕</button><h2>Create a Pod</h2><label>Pod name</label><div class="fi"><input value="Study Warriors"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0012 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg></div>' +
      '<label>What is this pod for?</label><div class="tgrid" id="podTypeGrid">' +
      ['Watch & Learn', 'Coding Practice', 'Practice Exercise', 'Read & Review', 'Doubt Clearing', 'Open Study']
        .map(function (label, i) {
          return (
            '<button type="button" class="' +
            (label === 'Open Study' ? 'on' : '') +
            '" data-ptype="' +
            i +
            '">' +
            label +
            '</button>'
          );
        })
        .join('') +
      '</div><label>Module</label><select><option>Module 2 — React Hooks Deep Dive</option></select><label>Level</label><div class="rg" id="levelRg">' +
      ['Just starting out', 'Getting the hang of it', 'Need help with specifics', 'Going deeper']
        .map(function (t, i) {
          return (
            '<div class="ri' +
            (i === 1 ? ' on' : '') +
            '" data-level="' +
            i +
            '"><div class="dot"></div>' +
            t +
            '</div>'
          );
        })
        .join('') +
      '</div><label>Duration (minutes)</label><select><option value="">Select…</option><option>15</option><option>30</option><option>45</option><option>60</option></select><label>Who can join?</label><select><option>Anyone</option></select>' +
      '<button type="button" class="sub-btn" id="createSubmit">Create Pod</button><span class="cl2" id="createCancel">Cancel</span>'
    );
  }

  function inactiveH() {
    return (
      '<div class="hdr"><span class="yd"></span>Debug Squad — Study Pod</div><h3>Are you still studying?</h3><div class="desc">You have been inactive for 10 minutes</div>' +
      '<div class="btns"><button type="button" class="yes" id="inactiveYes">Yes! I\'m here</button><button type="button" class="no" id="inactiveNo">Leave pod</button></div>' +
      '<div class="note">Your pod members will be notified if you leave. Click "Yes! I\'m here" to continue your session.</div>'
    );
  }

  function endH() {
    return (
      '<div class="chk"><svg><use href="#i-check"/></svg></div><h2>Great session, Vipin!</h2><div class="sub2">28 minutes · Coding Exercise · Debug Squad</div><hr><div class="sl">You studied with:</div>' +
      '<div class="em"><div class="av" style="background:var(--purple);width:30px;height:30px;font-size:10px">P</div><div class="nm">Priya</div><button type="button" class="abtn" data-appr>👋 It was great studying with you</button></div>' +
      '<div class="em"><div class="av" style="background:var(--blue);width:30px;height:30px;font-size:10px">A</div><div class="nm">Arjun</div><button type="button" class="abtn" data-appr>👋 It was great studying with you</button></div>' +
      '<div class="em"><div class="av" style="background:var(--green);width:30px;height:30px;font-size:10px">K</div><div class="nm">Keerthi</div><button type="button" class="abtn" data-appr>👋 It was great studying with you</button></div>' +
      '<hr><div class="stats">28 minutes studied · 4 pod members · Module 2</div>' +
      '<button type="button" class="bb" id="endBack">Back to Module</button><span class="hl" id="endHistory">View session history</span>'
    );
  }

  window.appr = function (b) {
    b.classList.add('sent');
    b.textContent = 'Sent ✓';
    b.disabled = true;
  };

  function sendMsg() {
    const i = document.getElementById('chatIn');
    if (!i) return;
    const m = i.value.trim();
    if (!m) return;
    const w = document.getElementById('chatW');
    const d = document.createElement('div');
    d.className = 'cm';
    d.innerHTML =
      '<div class="av" style="background:var(--orange);width:22px;height:22px;font-size:8px">V</div><div><span class="cn">Vipin</span><span class="cx">' +
      m.replace(/</g, '&lt;') +
      '</span></div>';
    w.appendChild(d);
    i.value = '';
    w.scrollTop = w.scrollHeight;
  }

  function bindModalActions(id) {
    const root = document.getElementById(id);
    if (!root) return;
    root.addEventListener('click', function (e) {
      if (e.target === root) root.classList.remove('show');
    });
  }

  document.addEventListener('click', function (e) {
    const t = e.target;
    if (t.id === 'joinNowBtn') {
      hideM('ov1');
      startJoin();
    }
    if (t.id === 'joinCancelBtn') hideM('ov1');
    if (t.id === 'createClose' || t.id === 'createCancel') hideM('ov3');
    if (t.id === 'createSubmit') {
      hideM('ov3');
      go(4);
    }
    if (t.id === 'inactiveYes') hideM('ov4');
    if (t.id === 'inactiveNo') {
      hideM('ov4');
      showM('ov5');
    }
    if (t.id === 'endBack' || t.id === 'endHistory') {
      hideM('ov5');
      go(0);
    }
    if (t.matches('[data-appr]')) appr(t);
  });

  document.addEventListener('click', function (e) {
    const grid = e.target.closest('#podTypeGrid');
    if (grid) {
      const btn = e.target.closest('button');
      if (btn && grid.contains(btn)) {
        grid.querySelectorAll('button').forEach(function (b) {
          b.classList.remove('on');
        });
        btn.classList.add('on');
      }
    }
    const lv = e.target.closest('[data-level]');
    if (lv && lv.parentElement && lv.parentElement.id === 'levelRg') {
      lv.parentElement.querySelectorAll('.ri').forEach(function (r) {
        r.classList.remove('on');
      });
      lv.classList.add('on');
    }
  });

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const q = document.getElementById('q');
      if (q) q.focus();
    }
  });

  setInterval(function () {
    if (cur === 4 && state.tmr > 0) {
      state.tmr--;
      const a = document.getElementById('tPill');
      if (a) a.textContent = fmt(state.tmr) + ' left';
      const b = document.getElementById('tPanel');
      if (b) b.textContent = fmt(state.tmr);
    }
  }, 1000);

  const dock = document.getElementById('dock');
  if (dock) {
    DEMO_LABELS.forEach(function (t, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.addEventListener('click', function () {
        go(i);
      });
      dock.appendChild(b);
    });
  }

  for (let j = 1; j <= 5; j++) bindModalActions('ov' + j);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && cur === 1) go(0);
  });

  go(0);
})();
