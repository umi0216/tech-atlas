# TECH ATLAS · 知识宇宙

世界很大，好奇心有坐标。

一个持续建设的个人知识宇宙：连接跨学科知识、资料、学习路径与个人实践记录。[打开网站](https://umi0216.github.io/tech-atlas/)。

## 第四版：跨学科与三维空间

- 七个学科入口：数学、计算与智能、生命科学、物理与宇宙、工程与创造、人文与社会、艺术与表达。
- 三维空间可旋转、缩放；点击星体或标签进入分支，沿面包屑返回。层级也有对应的按钮和目录，键盘与触摸均可操作。
- 数学可展开到线性代数、微积分与分析、概率统计等分支，再进入具体概念。部分概念有解释、公式、验证任务、相关知识和外部课程入口。
- 全局搜索、学科筛选、知识目录、收藏、笔记、自评、实践证据及“我的探索”互相连通。概念链接保存在 URL 哈希中，可刷新和分享。
- 当前公开结构有 108 个条目（包括根节点），含原有 50 个技术节点。生命科学等新增区域先提供方向索引，内容将持续补充；这不是完整的学科百科。
- 原版技术星图与五个成长里程碑保留在 [legacy.html](legacy.html)，与新版技术条目共享本地修改。

三维视图优先使用 Three.js WebGL 渲染；无 WebGL 时使用基于同一类三维坐标和透视投影的 Canvas 兼容渲染，仍可旋转、缩放与选择。兼容模式不是 GPU 性能承诺。布局表示浏览结构，不代表学术距离或个人掌握程度。

首页保留紫色环形星球主视觉，点击“进入知识宇宙”进入三维学科空间；进入具体分支后直接显示知识空间。知识空间的星云、星体和轨道由代码生成。静止时有持续的星光、轨道光点及小幅浮动；暂停开关会记住偏好，系统减少动态效果优先。空间离屏或标签隐藏后暂停连续绘制。滚轮缩放需先聚焦空间，直接滚动页面不应被大画布困住。

## 长期方向

- [项目愿景](docs/PROJECT_VISION.md)
- [架构与演进路线](docs/ARCHITECTURE_ROADMAP.md)
- [三维前端实现决策](docs/ADR-0001-SPATIAL-UI.md)
- [维护约定](AGENTS.md)
- [验证范围](docs/VALIDATION.md)

后续数据库、账户、同步与内容管理按需要接入。当前的云端开发工作区仅用于开发和验证，不承担生产托管。

## 运行与构建

部署文件已提交到仓库，GitHub Pages 直接发布根目录，无需现场安装依赖。所有运行资源使用相对路径且本地提供，没有运行时 CDN、外部字体或分析脚本；外部资料只在用户主动打开时访问。

完整源码可以在本地启动：

```bash
npm ci
npm run check
npm run build
npm run dev
```

默认打开 `http://localhost:4173`。若只想浏览已经构建的文件，可以用 `python3 -m http.server 8080`。

模块源码有修改时，运行 `npm run build` 并一起提交 `build/universe.js` 和更新后的 `index.html`。构建会更新资源内容哈希，避免新旧版本混用。`package-lock.json` 锁定开发依赖。

## 个人记录与备份

- 个人记录保存在当前浏览器，没有自动上传到 GitHub，没有跨设备同步。
- 原技术记录继续使用 `tech-atlas-v2`；新知识的记录及收藏使用 `atlas-personal-v1`。
- “我的探索 → 导出备份”导出 `format: atlas-universe, version: 1`，包含两部分记录与原里程碑。
- 导入支持新版备份与原版 `format: tech-atlas, version: 2`。导入原版备份只替换技术档案和里程碑，保留新知识记录；导入新版则恢复两部分。
- **原版星图的导出只包含原版记录。** 完整备份请使用新版“我的探索”。
- 新收录的概念默认“尚未评价”。阅读、收藏不会提高掌握度。原技术条目沿用历史示例自评和用户本地修改，仍可修订。
- 更换网址、浏览器、设备或清除站点数据前，请先导出。仓库中的知识内容与浏览器中的私人笔记分开保存。

## 知识与来源

`src/knowledge.js` 定义公开节点及有类型关系。当前提供分类包含、相关和应用联系；相关联系不表示强制学习顺序。节点 ID 应稳定，名称、排版和位置可以修改。

数学概念起点为独立编写的简要说明，外部延伸资料链接到 MIT OpenCourseWare。生命科学提供外部 OpenStax 阅读入口，未复制教材正文。正式扩展时逐条补充来源、适用范围和修订说明。

旧版 `data.js` 的个人示例自评暂时通过适配器保留；未来将继续拆分历史内容与个人状态。新学科数据不依赖旧版固定七领域、八节点的布局表。当前每次展示一层，尚未实现大规模服务端分页或完整语义缩放。

## 文件结构

| 文件 | 用途 |
| --- | --- |
| `index.html` / `universe.css` | 新界面、响应式布局与字体 |
| `src/knowledge.js` | 公共知识结构和初始内容 |
| `src/store.js` | 浏览器记录、旧数据适配和备份 |
| `src/space.js` | Three.js 三维渲染 |
| `src/canvas-space.js` | 无 WebGL 时的透视投影兼容渲染 |
| `src/universe.js` | 导航、目录、搜索、阅读及个人界面 |
| `build/universe.js` | 可直接发布的前端产物 |
| `legacy.html` / `app.js` / `app.css` / `motion.js` | 原版技术星图与里程碑 |
| `data.js` | 历史技术节点与初始示例 |
| `scripts/build.mjs` | 打包及资源版本更新 |
| `scripts/validate-knowledge.mjs` | 结构、关系及备份兼容检查 |
| `scripts/build-standalone.py` | 生成内嵌资源的离线 HTML |
| `assets/` | 本地字体、原行星图与许可证 |

## 离线 HTML

```bash
npm run build
python3 scripts/build-standalone.py
```

`dist/tech-atlas-standalone.html` 内嵌新界面的脚本、字体和图标，可以单独打开。生成的邻接文件 `dist/legacy.html` 内嵌旧版资源；离线使用原技术星图与里程碑时，请同时保留它。浏览器对 `file:` 来源的存储策略可能不同，请通过 JSON 备份迁移记录。

## 资产与许可

新界面使用本地 Noto Sans SC 可变字体子集，约 247 KB，覆盖初始界面与知识文本；其他输入字符按系统中文字体回退。旧字体子集保留供原版使用。许可证为 [OFL-NotoSansSC.txt](assets/OFL-NotoSansSC.txt)，来源为 [Google Fonts](https://github.com/google/fonts/tree/main/ofl/notosanssc)。

Three.js 0.186.1 使用 MIT 许可证，文本见 [THREE-LICENSE.txt](assets/THREE-LICENSE.txt)。原版行星图资产的生成记录见 [ASSETS.md](docs/ASSETS.md)。
