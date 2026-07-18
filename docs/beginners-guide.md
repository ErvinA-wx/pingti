### 广告拦截

> 使用广告拦截器有多重要？

网站通常包含广告，其中一些可能有害，常会导向不想要的页面或虚假下载按钮。真正的下载按钮通常较小，多为文字形式或巧妙地融入网站设计。虚假按钮通常很大、颜色鲜艳、使用“立即下载”等通用术语，且可能在页面上多次出现。很难区分它们，因此始终使用广告拦截器很重要。请注意，某些文件托管站会有虚假弹窗，真正的下载发生在下载页面本身，而不是重定向页面或弹窗标签页。

对于浏览器，推荐使用 **[uBlock Origin (uBO)](https://github.com/gorhill/uBlock)**，也可以使用 **[Redirect Skipper](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/internet-tools/#wiki_.25B7_redirect_bypass)** 跳过烦人的倒计时。注意，仅使用 uBO 就足以实现浏览器广告拦截；同时使用 DNS 可能会导致冲突。请查看下方“浏览器”部分了解推荐选项。另外，强烈建议使用 uBO 的完整版而非精简版。

对于移动端，推荐 **[AdGuard Premium](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/android/#wiki_.25B7_android_adblocking)** / [iOS](https://adguard.com/en/adguard-ios/overview.html) 或 **[Rethink DNS](https://rethinkdns.com/app)**，并可通过 **[Morphe](https://morphe.software/)** 屏蔽 YouTube 和 Reddit 广告，还可以[轻松设置](https://wispydocs.pages.dev/morphe-piko-obtainium/)。注意，uBO 也适用于 Firefox 等移动浏览器。

!!!note 同时使用多个广告拦截器（如 uBO 和 AdGuard）可能会[导致问题](https://x.com/gorhill/status/1033706103782170625)。这仅发生在常规广告拦截器之间，因此将 uBO 与 SponsorBlock 等工具一起使用是完全没问题的。

***

### 杀毒软件

> 如何安全扫描文件，并判断检测结果是否为误报？

许多热门文件托管站的下载按钮会重定向到虚假恶意下载页面。使用 [uBlock Origin](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/adblock-vpn-privacy#wiki_.25BA_adblocking) 完整版可以防止这种情况，但并非总是有效。阅读此[指南](https://cs.rin.ru/forum/viewtopic.php?f=14&t=159345)了解虚假恶意下载页面的特征及规避方法。一般规则是：避免在新标签页或重定向页面中打开的下载页面，真正的下载应发生在文件托管站的同一页面内。

安装任何文件前，建议使用 **[VirusTotal](https://www.virustotal.com/)** 扫描安装程序，并在 [Triage](https://tria.ge/)（沙箱）中运行。如果难以判断是否为误报，请参考 **[Scan Guide](https://clarasguide.valeena.workers.dev/Guides/vtguide/)**，或发送至 [Discord](https://github.com/fmhy/FMHY/wiki/FMHY-Discord) 以便检查。对于 Android 应用，最好在 [Triage](https://tria.ge/) 等沙箱中分析。

!!!note 大多数杀毒软件并非必要，且可能导致系统变慢。如果使用可信网站，Windows Defender 足以保证安全，可定期运行 [Malwarebytes](https://www.malwarebytes.com/) 扫描以获得额外保护。


***

### 浏览器

> 应该使用哪个网页浏览器？

推荐使用 **[Firefox](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/internet-tools/#wiki_.25B7_firefox_tools)**，也可以尝试 **[Privacy-Focused Browsers](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/adblock-vpn-privacy/#wiki_.25B7_browser_privacy)**，如果偏好 Chromium，则可以选择 **[Brave](https://brave.com/)**。

对于 Android，推荐使用 **[Brave](https://brave.com/)** 或 **[Firefox](https://www.firefox.com/browsers/mobile/android/)**。

对于 iOS，推荐使用 **Safari + [AdGuard](https://adguard.com/en/adguard-ios/overview.html)** 或 **[Brave](https://brave.com/)**。

!!!note 建议浏览[扩展](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/internet-tools#wiki_.25B7_browser_extensions) / [Userscript](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/internet-tools#wiki_.25B7_userscripts) 部分，寻找增强浏览器功能的方法。

***

### Base64

> 如何解码 Base64？

如果看到类似 `aHR0cHM6Ly9mbWh5Lm5ldC8` 的文本字符串，可以使用 Base64 解码器查看。部分内容可能需要解码两次。

* **[Base64 Decoders](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/text-tools/#wiki_.25B7_encode_.2F_decode) / [Auto Decode](https://greasyfork.org/en/scripts/485772-fmhy-base64-auto-decoder)**

***

### 电影 / 剧集

* **在线观看：[Cineby](https://cineby.at/) / [Aether](https://aether.bar/) / [NEPU](https://nepu.to/)**
* **下载：[Directories](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/video#wiki_.25BA_download_sites)**
* **BT 下载：[ExT.to](https://ext.to/browse/?cat=1) / [1337x](https://1337x.to/movie-library/1/)**
* **体育直播：[Streamed](https://streamed.pk/) / [StreamFree](https://streamfree.top/) / [TimStreams](https://timstreams.st/)**
* **剧集在线观看：[GoPlay](https://goplay.su/) / [DramaCool](https://dramacool-l.fun/)**
* **追踪 / 发现：[Simkl](https://simkl.com/) / [Letterboxd](https://letterboxd.com/)**

***

### 动漫

* **在线观看：[Miruro](https://www.miruro.com/) / [All Manga](https://allmanga.to/) / [animepahe](https://animepahe.pw/)**
* **下载：[Tokyo Insider](https://www.tokyoinsider.com/) / [Kayoanime](https://kayoanime.com/)**
* **BT 下载：[Nyaa](https://nyaa.si/) / [Hayase](https://hayase.watch/) / [扩展](https://rentry.co/FMHYB64#hayase)**
* **追踪 / 发现：[MAL](https://myanimelist.net/) / [AniList](https://anilist.co/)**

***

### 音乐

* **在线收听：[SpotX](https://github.com/SpotX-Official/SpotX) / [Monochrome](https://monochrome.tf/)**
* **下载：[lucida](https://lucida.to/) / [squid.wtf](https://squid.wtf/) / [Nicotine+](https://nicotine-plus.org/)**
* **Android：[⁠ArchiveTune](https://archivetune.koiiverse.cloud/) / [Morphe](https://wispydocs.pages.dev/morphe-piko-obtainium/)（YTM 补丁）/ [SpotiFLAC-Mobile](https://github.com/zarzet/SpotiFLAC-Mobile)**
* **iOS: [SpotC++](https://spotc.yodaluca.dev/) / [⁠Octave](https://octavestreaming.com/) / [SpotiFLAC-Mobile](https://github.com/zarzet/SpotiFLAC-Mobile) / [Extension](https://github.com/spotiflacapp/SpotiFLAC-Extension)**
* **追踪 / 发现：[RateYourMusic](https://rateyourmusic.com/) / [Last.fm](https://www.last.fm/home)**

***

### 游戏

* **下载 / BT：[⁠HizSearch](https://hizsearch.pages.dev/) / [Virgil Game Search](https://virgil.samidy.com/Games/) / [AnkerGames](https://ankergames.net/) / [SteamRIP](https://steamrip.com/) / [FitGirl Repacks](https://fitgirl-repacks.site/)**
* **模拟器 / ROM：[Emulation Wiki](https://emulation.gametechwiki.com/index.php/Main_Page) / [Axekin](https://www.axekin.com/) / [r/ROMs Mega](https://r-roms.github.io/)**
* **追踪 / 发现：[Backloggd](https://www.backloggd.com/) / [Glitchwave](https://glitchwave.com/)**

***

### 阅读

* **下载：[Anna's Archive](https://annas-archive.gl/) / [Z-Library](https://z-lib.gd/) / [Bookracy](https://bookracy.com/)**
* **有声书：[Mobilism Audiobooks](https://forum.mobilism.org/viewforum.php?f=124) / [AudiobookBay](https://audiobookbay.lu/) / [警告](https://github.com/fmhy/edit/blob/main/docs/.vitepress/notes/audiobookbay-warning.md)**
* **电子书阅读器：[Readest](https://readest.com/) / [Koodo](https://www.koodoreader.com/) / [Google Play Books](https://play.google.com/books)**
* **漫画：[Weeb Central](https://weebcentral.com/) / [⁠Comix](https://comix.to/)**
* **漫画：[BatCave](https://batcave.biz/) / [GetComics](https://getcomics.org/)**
* **Android 阅读器：[Librera](https://librera.mobi/) / [Moon+ Reader](https://www.moondownload.com/) + [Theme Guide](https://clarasguide.valeena.workers.dev/Guides/moontheme/)**
* **追踪 / 发现：[GoodReads](https://www.goodreads.com/)**（书籍）/ [StoryGraph](https://www.thestorygraph.com/)（书籍）/ **[MAL](https://myanimelist.net/)**（漫画）/ **[LeagueOfComicGeeks](https://leagueofcomicgeeks.com/)**（漫画）

***

### 隐私

> 没什么可隐藏的，为什么要在意隐私？

隐私是关于控制个人信息，而不仅仅是保密。非敏感数据会被公司用来追踪行为、投放广告和影响选择。

对于邮件隐私，推荐使用 **[Proton](https://proton.me/mail)**，搜索则推荐 **[SearXNG](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/storage/#wiki_searx_instances)**。同时建议检查 HaveIBeenPwned **[email](https://haveibeenpwned.com/)** 和 [password](https://haveibeenpwned.com/Passwords) 引擎，确保信息未出现在近期数据泄露中。

!!!note 切勿在任何不信任的网站上输入真实邮箱或密码。为每个注册的网站使用独立密码。这样即使发生泄露，也只有一个网站的凭证受影响。还可以利用邮件 [aliasing](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/internet-tools/#wiki_.25B7_email_aliasing) 增加一层保护。

!!!note 请记住，**绝对**不要将个人或机密文件上传到任何文件托管站或云端 AI，即使它们声称已加密。

***

### Windows 指南

> 如何免费下载/激活 Windows？

从 Massgrave 的 **[Genuine Installation Media](https://massgrave.dev/genuine-installation-media)** 页面下载 ISO，然后按照 **[Windows 全新安装指南](https://massgrave.dev/clean_install_windows)** 进行安装。安装后使用 **[Microsoft Activation Scripts](https://rentry.co/FMHYB64#mas)** 激活。如果希望在 Windows 10 生命周期结束后继续使用，请参考 **[Windows 10 生命周期结束后](https://massgrave.dev/windows10_eol)**。

注意，可以通过打开文件资源管理器，点击“查看”菜单，勾选“文件扩展名”来显示所有文件的扩展名。

* **[Windows Install / Debloat Guide](https://wispydocs.pages.dev/windows/)**
* **软件站点：[Virgil Software Search](https://virgil.samidy.com/Software/) / [CracksURL](https://cracksurl.com/) / [下载指南](https://cracksurl.com/how-to-download/) / [LRepacks](https://lrepacks.net/)**

***

### BT 下载

> BT 下载需要 VPN 吗？

通过 BT 下载文件可能会与 ISP 产生问题，因此在大多数国家使用 **[VPN](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/adblock-vpn-privacy#wiki_.25BA_vpn)** 是必要的。还应该将 **[bind your VPN](https://wispydocs.pages.dev/torrenting/)** 绑定到 BT 客户端。这样如果 VPN 连接断开，BT 客户端会停止所有流量，防止真实 IP 地址暴露。也可以使用 **[Remote Torrenting Services](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/torrent#wiki_.25B7_remote_torrenting)** 来完全避免使用 VPN。

***

> 什么是端口转发？需要它吗？

[Port forwarding](https://wispydocs.pages.dev/torrenting/#port-forwarding)（开放端口）是 BT 下载的重要组成部分，建议进行设置。虽然不是必须的，但有利于 swarm，有时能提升下载速度，并改善种子较少的 BT 连接的连通性。

***

### Android 应用

* **[Mobilism](https://forum.mobilism.org/viewforum.php?f=398)** - 修改版 APK
* **[APKMirror](https://www.apkmirror.com/)** - 原版 APK
* **[Droid-ify](https://droidify.app/)** - 开源 Android 应用 / [GitHub](https://github.com/Droid-ify/client)
* **[Obtainium](https://github.com/ImranR98/Obtainium/)** - 获取 Android 应用更新

***

### iOS 侧载

* **[TrollStore](https://github.com/opa334/TrollStore)** - 无限应用侧载 [iOS 14.0-17.0]
* **[SideStore](https://sidestore.io/)** - 非越狱侧载应用 [iOS 16.0 及以上]
* **[Sideloadly](https://sideloadly.io/)** - 非越狱侧载应用 [iOS 7.0 及以上]
* **[Impactor](https://impactor.claration.dev/)** - 非越狱侧载

***

### 重要链接

* **下载管理器：[AB Download Manager](https://abdownloadmanager.com/)**
* **[Translate Web Pages](https://github.com/FilipePS/Traduzir-paginas-web)** - 将网页翻译成你的语言
* **[Glossary / Terminology](https://rentry.org/the-piracy-glossary)** - 常见盗版术语定义
* **[不安全站点/软件](https://fmhy.net/unsafe)** / [2](https://redd.it/10bh0h9) - 建议避免的内容
* **[FMHY.net](https://fmhy.net/)** - 我们的网站，包含更多站点/工具
