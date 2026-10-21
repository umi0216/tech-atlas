# TECH ATLAS · 个人技术宇宙

把每次探索，连成自己的宇宙。

一个可以持续维护的个人技术成长地图。七个知识领域、50 个初始节点，分别记录掌握深度、学习状态、优先级和项目证据。纯 HTML / CSS / JavaScript，适合 GitHub Pages，不需要构建、账户、API Key 或后端。

## 第二版：动效升级

动效使用浏览器原生 CSS、Canvas 和 JavaScript，GitHub Pages 直接支持，无需额外服务或依赖。

- 首屏行星与观察标签缓慢浮动；桌面鼠标在插画区域移动时产生小幅视差。
- 背景星光轻微漂移、呼吸，并有低频流星；手机降低星点数量，绘制最多 30 fps。
- 标题、正文与概况卡片分组入场；滚动到内容区域时渐入。
- 星系聚焦与全景恢复采用平滑镜头过渡；手动拖动或缩放会立即接管，不会追赶旧动画。
- 选中节点时关联线逐段展开；视图切换、卡片悬停与按钮按压提供轻量反馈。
- 顶部细线显示阅读位置。

右上角的 **动效** 开关可以关闭动画，选择保存在当前浏览器。操作系统的 **减少动态效果** 设置优先；启用后不运行星空画布或镜头补间。浏览器标签隐藏时暂停连续动画，首屏离开视口后暂停行星和星空绘制。关闭动效不修改学习数据。

`motion.js` 是独立的可选增强层；未加载时，页面内容与知识编辑功能仍然可用。单文件生成脚本也会内嵌动效代码。

## 主页设计

保留宇宙科技主题，采用个人主页布局：顶部导航、大标题、太空插画、知识概况，以及可以聚焦和编辑的星图。借鉴用户提供主页的留白、字号层级和按钮反馈，未复制参考项目的代码或内容。

行星主视觉由 ImageGen 生成并经过 WebP 压缩，网站使用 `assets/orbital-world.webp`，不请求外部图片服务。

## 直接运行

下载完整源码，双击根目录的 `index.html`。也可以在源码目录启动本地静态服务器：

```bash
python3 -m http.server 8080
```

随后打开 `http://localhost:8080`。

## 发布到 GitHub Pages

1. 在 GitHub 新建仓库，将本目录**里面的文件**上传到仓库根目录。确保 `index.html`、`app.css`、`app.js`、`data.js`、`assets/`、`.nojekyll` 在根目录，不要额外嵌套一层 `site/` 或 `source/`。
2. 进入 [仓库 Settings → Pages](https://github.com/umi0216/tech-atlas/settings/pages)。
3. **Build and deployment → Source** 选择 **Deploy from a branch**。
4. **Branch** 选择你的发布分支，例如 `main`；目录选择 **/(root)**；点击 **Save**。
5. 等部署成功后，使用 Pages 页面显示的访问链接。后续提交到同一分支会更新网站。

参考：[GitHub 官方文档：配置发布源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

如果你使用命令行，先在 GitHub 创建空仓库，再在此目录执行（替换远程仓库地址）：

```bash
git init
git add .
git commit -m "Build personal knowledge atlas"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/tech-atlas.git
git push -u origin main
```

所有资源都使用相对路径，支持 `username.github.io/仓库名/` 这样的项目站点。字体与太空图片均本地提供，没有 CDN、外部字体请求、分析脚本或联网模型调用。访问 GitHub Pages 网站本身需要网络。

## 日常使用

- **宇宙星图**：桌面显示七个领域；通过星图上方领域标签选择星系聚焦，点击节点查看和修改档案。拖动平移，滚轮或右下角按钮缩放。可用全屏按钮扩大地图。
- **关联航线**：默认保留低对比度的域内联系；悬停、键盘聚焦或选中节点时，突出显示其关联。切换为“全部”可看到跨领域连线。航线统一表示知识关联，不代表必修顺序。
- **手机模式**：初次打开聚焦软件开发工程；顶部下拉框可以切换星系。“全景”显示七个可点击入口，避免小屏出现难以阅读的文字。搜索时自动进入目录。
- **成长航线**：五个里程碑及能力验收项，勾选后自动保存。
- **知识目录**：按领域筛选、按关键词查找，点击条目编辑。
- **档案编辑**：调整 L0—L5、学习状态、优先级，填写学习记录和验收证据后点击保存。
- **键盘**：右上角开关控制动效。`Ctrl / Cmd + K` 搜索，`Esc` 关闭档案；地图获得焦点后可用方向键平移、`+ / -` 缩放。Tab 可访问星系和技能节点，Enter 打开。

## 学习进度与备份

进度保存在当前浏览器的 localStorage，使用原版本相同的 `tech-atlas-v2` 存储键。等级为初始自评示例，不能视为经过测评的能力认证。

- **导出备份**包含本地技能修改、学习记录、验收证据和里程碑勾选。
- **导入**兼容原版本 `format: tech-atlas, version: 2` 的备份；成功导入会以备份内容替换本地编辑。
- 由原 HTML 文件迁移到 GitHub Pages 前，请先从原页面导出 JSON，再在新网址导入。不同来源不会自动共享浏览器数据。
- **GitHub Pages 只发布静态文件，不会把页面上的编辑写回 GitHub，也不会自动同步电脑与手机。** 换浏览器、换网址、清除站点数据前，请先导出备份。
- 想让所有设备初次打开都显示相同的新进度，可以在 `data.js` 更新初始数据后提交到 GitHub。已经存在的本地修改会继续覆盖同名节点的初始值。
- 初始节点会随源码公开；浏览器中的私有学习笔记不会因部署自动上传。请自行决定放进公开 `data.js` 的内容。

## 修改知识内容

`data.js` 中的 `ATLAS_DATA` 是初始数据源：

```javascript
{
  id: 'postgres',           // 保持稳定，旧备份通过此字段匹配
  name: 'PostgreSQL',
  domain: 'storage',
  mastery: 2,              // 0—5，掌握深度
  status: 'active',        // explored / active / future
  priority: 'now',         // now / parallel / later
  detail: '事务、索引、锁与执行计划',
  evidence: []
}
```

掌握深度、学习状态和优先级是独立维度。每个领域目前使用错落的双列星群布局，预置数据每个领域最多 8 个节点。如果大量增加节点，请同步调整 `app.js` 中的布局、全景边界和手机概览间距；不建议无限堆在同一个星系内。

连线在 `edges` 中定义：`['java', 'spring']` 表示两个节点存在知识联系，当前没有强制先修语义。里程碑在 `milestones` 中定义。

## 设计与字体

03 版重新设计了页面结构：顶部导航、宽松的首屏、大标题、行星主视觉和探索入口；星图采用错落星群、细线与按需关联；档案与目录沿用同一套字体和配色。手机采用纵向布局和悬浮底部导航。

`assets/atlas-sans.woff2` 是 Noto Sans SC 可变字体的子集，约 180 KB，包含当前界面及初始知识内容需要的字符。字体本地提供；新增文本中缺少的字形会回退到苹方、微软雅黑或系统无衬线字体。字体许可证见 `assets/OFL-NotoSansSC.txt`，来源：[Google Fonts / Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc)。

用户开启“减少动态效果”时，界面自动关闭呼吸动画和过渡。全屏能力由浏览器决定，不支持时会给出提示。

## 文件结构

| 文件 | 用途 |
| --- | --- |
| `index.html` | 网站入口 |
| `app.css` | 样式、字体、响应式布局 |
| `app.js` | 星图交互、镜头过渡、编辑、备份与本地保存 |
| `motion.js` | 可选动效：星空、视差、入场、暂停和减少动态效果 |
| `data.js` | 初始知识节点、关系与里程碑 |
| `assets/` | 本地字体、许可证、图标和太空插画 |
| `package.json` | 可选的本地预览和语法检查命令（无需安装依赖） |
| `.nojekyll` | 作为静态资源直接发布 |
| `scripts/build-standalone.py` | 生成可单独分享的 HTML |
| `docs/VALIDATION.md` | 本次验证范围 |

## 生成单文件版

```bash
python3 scripts/build-standalone.py
```

生成 `dist/tech-atlas-standalone.html`，内嵌 CSS、JavaScript 和字体，下载后可单独打开。正常维护、GitHub Pages 发布建议使用根目录的拆分文件，修改更方便。
