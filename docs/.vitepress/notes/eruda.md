#### Eruda

移动端浏览器的 Eruda 控制台 [bookmarklet](https://wikipedia.org/wiki/Bookmarklet)：
```
javascript:(function () { var script = document.createElement('script'); script.src="//cdn.jsdelivr.net/npm/eruda"; document.body.appendChild(script); script.onload = function () { eruda.init() } })();
```
