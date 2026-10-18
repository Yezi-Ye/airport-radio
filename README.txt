机场无线电频率查询 — 安卓 / iPhone 跨平台网页版

个人仓库：https://github.com/Yezi-Ye/airport-radio
网站地址（GitHub Pages 部署成功后）：https://yezi-ye.github.io/airport-radio/
仓库和网站归个人账号 Yezi-Ye 所有，不属于任何组织。

本目录包含可直接部署的静态网站文件。
index.html 必须位于网站根目录，或与 sw.js 等文件一起位于同一子目录。
不需要 Node.js 后端、数据库或 API Key。不要只上传 index.html。

目录内容：
index.html                  查询页面及完整内置机场 / 频率数据
.nojekyll                   GitHub Pages 直接发布静态文件
web.js                      离线状态、安装说明及更新提示
sw.js                       离线缓存
manifest.webmanifest        主屏幕应用配置
icon-192.png / icon-512.png / icon-maskable.png

部署方式：
1. 使用你自己的 GitHub Pages、Cloudflare Pages、Netlify 或其他 HTTPS 静态网站空间。
2. 将此目录作为网站发布目录；若平台要求构建命令，不需要构建，发布目录就是这些文件所在目录。
3. 文件上传后，用平台生成的 HTTPS 网址打开，不要用源码文件链接、网盘预览或 192.168 地址。
4. 安卓用 Chrome 打开；iPhone 用 Safari 打开。普通网页内即可输入搜索。
5. 可添加到主屏幕：安卓按页面按钮 / 浏览器菜单操作；iPhone 在 Safari“分享”中选择“添加到主屏幕”。
6. 添加到主屏幕后，再联网打开图标一次，等到“离线已准备好”再断网测试。

GitHub Pages 网页操作（不需要安装命令行工具）：
1. 登录 https://github.com/new ，创建名为 airport-radio 的仓库。
   使用免费账号部署时可选择 Public（公开）。公开范围只是你上传的网站文件。
2. 解压“机场频率跨平台网页版.zip”。在仓库网页选择上传文件，把解压后的文件放到仓库根目录并提交。
   不要只上传 ZIP，也不要让 index.html 被包在额外一层文件夹中。
3. 打开仓库 Settings → Pages。
   Source 选择 Deploy from a branch，Branch 选择 main，目录选择 / (root)，保存。
   如果你的默认分支不是 main，选择实际上传文件的分支。
4. 等待部署成功。以 Pages 页面显示的正式网址为准，通常为：
   https://你的GitHub用户名.github.io/airport-radio/
5. 用安卓 Chrome 或 iPhone Safari 访问这个 HTTPS 网址。
   这不是 github.com 上的仓库源码页面，也不是 raw.githubusercontent.com 的原始文件地址。
6. 网站加载后等“离线已准备好”；添加到主屏幕后，再从图标联网打开一次。

无需将 GitHub 密码、验证码或访问令牌发送给他人。

注意：
- 网站托管完成后，不需要个人电脑在线，手机流量或任意可访问该网站的 Wi-Fi 都可以使用。
- 首次访问需要联网。离线保存依赖浏览器和系统存储；清理网站数据、隐私模式或系统自动回收缓存后，需要重新联网。
- 微信等内置浏览器的安装 / 离线能力可能受限，建议在 Safari / Chrome 打开。
- 修改网站后应重新生成版本号及 sw.js。替换 HTML 内数据时，不可谎称已逐条核验。
- 这里包含公开航空资料，无个人凭据；但只有得到网站所有者授权后才应上传发布。
- 频率来自 OurAirports 的 2026-10-18 下载快照，并非实时、完整或官方核验数据。
  仅供参考，使用前请核对最新官方 AIP / 航图 / NOTAM。
