# Visual assets

- `assets/atlas-sans.woff2`: subset of Noto Sans SC, distributed under the SIL Open Font License. Full license is included in the assets directory.
- `assets/orbital-world.webp`: project hero illustration generated using the built-in ImageGen tool, then encoded as WebP for the website. No API key or generation service is used when the website runs.
- `assets/favicon.svg`: project-native vector mark.
- GitHub header icon: GitHub mark linked to this project's repository.

Hero generation prompt:

> Use case: stylized-concept. Asset type: website right-side hero illustration for a personal technical knowledge universe, to be placed in a 560px wide panel on a dark midnight navy web page. Primary request: a beautifully art-directed quiet space exploration scene, an elegant large deep-violet and indigo ringed planet, thin luminous rings sweeping diagonally around it, a tiny cream-colored exploration satellite off to the upper left, one small warm amber moon and one distant pale cyan moon. The planet has a subtle finely textured cloud surface and a luminous icy lavender crescent edge. Cinematic editorial illustration with refined semi-realistic 3D surfaces, slightly dreamlike hand-painted atmosphere, sophisticated, not toy-like or generic UI render. Composition: square image, ringed planet centered at 55 percent horizontal and 52 percent vertical, most of scene in middle 75 percent area, generous uncluttered dark negative space around all edges; planet sphere about 44 percent image width; ring ellipse 75 percent image width. Background near-uniform midnight navy #0d1224 gently fading to perfectly uniform #0d1224 at every edge, very sparse precise stars, faint dust. Palette restrained midnight indigo, lavender, pale cyan, tiny warm gold details. Glow controlled and soft, crisp silhouette, no excessive bloom. NO text, no letters, no labels, no watermarks, no interface, no charts or graphs, no borders, no anime people, no buildings.

## 第四版资产

新界面的星云、星体、环绕光点与远景星光由 Three.js 与 Canvas 程序生成，无额外背景图或外部图像服务。原版行星图片同时用于知识宇宙首页和原技术星图，作为维护者明确认可的主视觉保留。

`assets/atlas-universe-sans.woff2` 为 Noto Sans SC 可变字体的新增子集，252640 字节。原始字体来自 Google Fonts 仓库 `ofl/notosanssc/NotoSansSC[wght].ttf`；使用 FontTools 对当前界面、知识、旧数据与源码字符生成，ASCII 一并保留。沿用 `assets/OFL-NotoSansSC.txt` 许可证。未覆盖的用户自定义字符按系统字体回退；后续增加公共内容时应检查并更新字形覆盖。

Three.js 0.186.1 作为本地打包依赖，许可证文本保存在 `assets/THREE-LICENSE.txt`；浏览器不请求第三方脚本 CDN。
