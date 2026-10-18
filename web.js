(function () {
  'use strict';
  var status = document.getElementById('offlineStatus');
  var updateButton = document.getElementById('updateApp');
  var installButton = document.getElementById('installApp');
  var registration;
  var deferredInstall;
  var refreshing = false;
  var waitingWorker;

  function setStatus(message) { status.textContent = message; }
  function refreshConnection() {
    document.getElementById('connectionStatus').textContent = navigator.onLine === false ? '当前离线 · 搜索在手机本地完成' : '搜索在手机本地完成 · 不需要个人电脑在线';
  }
  function showInstallHelp() {
    var help = document.getElementById('installHelp');
    help.open = true;
    try { help.scrollIntoView({block: 'center'}); } catch (_) { help.scrollIntoView(true); }
  }
  function offerUpdate(worker) {
    waitingWorker = worker;
    updateButton.hidden = false;
    setStatus('离线版本可用；发现新版本，可点击“更新应用”。数据日期请看页面底部。');
  }
  function waitForActive(reg) {
    return new Promise(function (resolve, reject) {
      var interval;
      var timeout;
      function check() {
        if (reg.active && reg.active.state === 'activated') {
          clearInterval(interval); clearTimeout(timeout); resolve(reg);
        }
      }
      interval = setInterval(check, 250);
      timeout = setTimeout(function () { clearInterval(interval); reject(new Error('Offline setup timed out')); }, 90000);
      check();
    });
  }
  function askCacheStatus(worker) {
    return new Promise(function (resolve) {
      if (!worker || typeof MessageChannel === 'undefined') { resolve(false); return; }
      var channel = new MessageChannel();
      var finished = false;
      var timer = setTimeout(function () { done(false); }, 6000);
      function done(value) {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        channel.port1.close();
        resolve(value);
      }
      channel.port1.onmessage = function (event) { done(event.data && event.data.ready === true); };
      try { worker.postMessage({type: 'CACHE_STATUS'}, [channel.port2]); } catch (_) { done(false); }
    });
  }
  function showReady() {
    return askCacheStatus(registration && registration.active).then(function (ready) {
      if (ready) document.documentElement.setAttribute('data-offline-ready', 'true');
      if (waitingWorker) return;
      if (ready) {
        setStatus('离线已准备好 · 可断网查询。主屏幕图标首次打开时，请也联网等到此提示。');
      } else {
        setStatus('暂未确认离线保存成功；联网搜索仍可用。请保持联网后刷新重试。');
      }
    });
  }

  refreshConnection();
  window.addEventListener('online', function () {
    refreshConnection();
    if (registration) registration.update().catch(function () {});
  });
  window.addEventListener('offline', refreshConnection);
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault(); deferredInstall = event;
    installButton.textContent = '安装到主屏幕';
  });
  window.addEventListener('appinstalled', function () { deferredInstall = null; installButton.textContent = '已添加到主屏幕'; });
  installButton.addEventListener('click', function () {
    if (!deferredInstall) { showInstallHelp(); return; }
    var prompt = deferredInstall;
    deferredInstall = null;
    try {
      var requested = prompt.prompt();
      if (requested && requested.catch) requested.catch(showInstallHelp);
    } catch (_) { showInstallHelp(); }
    if (prompt.userChoice) prompt.userChoice.catch(function () { showInstallHelp(); });
  });
  updateButton.addEventListener('click', function () {
    if (!waitingWorker) return;
    refreshing = true; updateButton.disabled = true;
    setStatus('正在切换到新版本…');
    waitingWorker.postMessage({type: 'ACTIVATE_UPDATE'});
  });

  if (location.protocol === 'file:') {
    setStatus('尚未发布为网站。要在 iPhone 和安卓直接使用，请将网站目录部署到 HTTPS 地址，再用手机浏览器访问。');
    return;
  }
  if (!window.isSecureContext || !('serviceWorker' in navigator)) {
    setStatus('当前浏览器或地址不支持离线安装。联网搜索仍可用；请用 Safari / Chrome 访问 HTTPS 网站。');
    return;
  }
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (refreshing) { location.reload(); return; }
    if (registration) showReady();
  });
  setStatus('正在保存页面和内置数据，完成后可离线使用…');
  var pendingTimer = setTimeout(function () {
    if (!document.documentElement.hasAttribute('data-offline-ready')) setStatus('离线保存尚未完成，请保持联网；现在仍可搜索已加载的数据。');
  }, 20000);
  navigator.serviceWorker.register('./sw.js', {scope: './', updateViaCache: 'none'}).then(function (reg) {
    registration = reg;
    if (reg.waiting && reg.active) offerUpdate(reg.waiting);
    reg.addEventListener('updatefound', function () {
      var worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', function () {
        if (worker.state === 'installed' && reg.active && reg.active !== worker && reg.waiting) offerUpdate(reg.waiting);
        if (worker.state === 'redundant' && !reg.active) {
          clearTimeout(pendingTimer);
          setStatus('离线保存失败，可能网络中断或存储受限。联网搜索仍可用，请稍后刷新重试。');
        }
      });
    });
    // Wait for this registration, not an unrelated worker on a parent directory.
    return waitForActive(reg);
  }).then(function (reg) {
    registration = reg;
    clearTimeout(pendingTimer);
    return showReady();
  }).catch(function () {
    clearTimeout(pendingTimer);
    setStatus('当前环境不能保存离线版本；联网搜索仍可用。请检查 HTTPS、浏览器隐私模式和可用空间。');
  });
})();
