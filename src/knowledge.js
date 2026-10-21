/** Public knowledge only. Personal records and spatial coordinates live elsewhere. */
const SOURCES = {
  linear:{title:'MIT · Linear Algebra / Gilbert Strang',url:'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'},
  calculus:{title:'MIT · Single Variable Calculus',url:'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/'},
  probability:{title:'MIT · Introduction to Probability and Statistics',url:'https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/'},
  biology:{title:'OpenStax · Biology 2e（外部资料）',url:'https://openstax.org/books/biology-2e/pages/1-introduction'}
};
export function createKnowledge(legacy){
 const nodes=new Map(),relations=[];
 function add(id,title,parent,kind,summary,extra={}){if(nodes.has(id))throw new Error(`Duplicate knowledge ID: ${id}`);nodes.set(id,{id,title,parent,kind,summary,revision:1,...extra});if(parent)relations.push({from:parent,to:id,type:'contains'});return id}
 add('universe','知识宇宙',null,'universe','给每一份好奇，留一个可以抵达的地方。',{en:'THE ATLAS',color:'#bda5f8'});
 const fields=[
 ['mathematics','数学','MATHEMATICS','#c5a4ff','从结构、变化与不确定性，理解世界的语言。','∑'],
 ['computing','计算与智能','COMPUTING & INTELLIGENCE','#8dbceb','从计算的基础，到软件、系统与人工智能。','⌘'],
 ['life','生命科学','LIFE SCIENCES','#8cd5b5','从微小的细胞，到生命的演化与相互联系。','⌁'],
 ['physics','物理与宇宙','PHYSICS & COSMOS','#d9b18b','探索物质、能量、时空与自然规律。','✧'],
 ['engineering','工程与创造','ENGINEERING & MAKING','#88c8d5','让理解成为可以运行、制造与验证的事物。','⎔'],
 ['humanities','人文与社会','HUMANITIES & SOCIETY','#d598a9','理解人的思想、历史、社会与共同生活。','◎'],
 ['arts','艺术与表达','ARTS & EXPRESSION','#b6b5e7','通过音乐、图像与文字，感受和表达世界。','♧']
 ];
 fields.forEach(([id,title,en,color,summary,glyph])=>add(id,title,'universe','discipline',summary,{en,color,glyph}));
 const math=[['linear-algebra','线性代数','LINEAR ALGEBRA','向量、空间、映射，以及它们的矩阵表达。','linear'],['calculus','微积分与分析','CALCULUS & ANALYSIS','研究变化、累积、极限与连续。','calculus'],['probability','概率与统计','PROBABILITY & STATISTICS','描述不确定性，并从数据中形成判断。','probability'],['geometry','几何与空间','GEOMETRY & SPACE','研究形状、空间与变换。'],['discrete','离散数学','DISCRETE MATHEMATICS','研究逻辑、组合、图与离散结构。'],['optimization','优化与计算','OPTIMIZATION','寻找目标与约束下可验证的解。']];
 math.forEach(([id,title,en,summary,source])=>add(id,title,'mathematics','branch',summary,{en,source}));
 const concepts=[
 ['vectors','向量与向量空间','linear-algebra','研究可以相加、可以数乘的对象，以及运算所遵循的结构。',['向量不只是一串数字；坐标是选择一组基以后的表达。','线性组合由向量的加法与数乘形成。理解张成空间，是进入线性代数的重要入口。'],'试着判断二维平面上的两个给定向量，能否张成整个平面。'],
 ['linear-map','线性映射','linear-algebra','同时保持向量加法与数乘的映射。',['线性映射满足 T(au+bv)=aT(u)+bT(v)。','选定输入和输出空间的基以后，有限维线性映射可以用矩阵表示；更换基会改变矩阵表达。'],'用二维缩放和旋转分别构造矩阵，检查它们如何变换两条基向量。'],
 ['rank','秩与线性独立','linear-algebra','矩阵的秩等于其列空间的维数，也等于行空间的维数。',['秩描述一个线性变换的像空间有多少独立方向。','两列成比例时，它们不提供两个独立方向。低秩结构因此可能使用更少的参数表达。'],'比较矩阵 [[1,2],[2,4]] 与单位矩阵的秩，并解释各自像空间的形状。'],
 ['eigenvalues','特征值与特征向量','linear-algebra','在线性变换下，只发生比例伸缩的非零向量及其伸缩系数。',['若 Av=λv 且 v≠0，则 v 是对应于 λ 的特征向量。','并非每个实矩阵都具有实特征值，也并非每个方阵都可以对角化。'],'观察对角矩阵对基向量的作用，写出其特征值。'],
 ['svd','奇异值分解','linear-algebra','将实矩阵分解为两个正交变换与一个非负对角缩放的组合。',['实矩阵可以写成 A=UΣVᵀ，矩阵形状需与所选完整或紧致分解一致。','SVD 为理解低秩近似提供入口；低秩参数训练与直接截断 SVD 是不同的操作。'],'对一个小矩阵进行 SVD，逐步增加保留的奇异值数量，比较重建误差。'],
 ['limits','极限与连续','calculus','描述输入趋近某处时，函数值的趋近行为。',['极限关注趋近过程；函数在该点是否定义是另一个问题。'],'比较函数在一点的值与其左右极限。'],
 ['derivative','导数与局部变化','calculus','通过差商的极限刻画函数的局部变化率。',['一元函数的导数在存在时给出该点的局部线性变化率。','多元函数中的偏导、方向导数和梯度需要区分。'],'对 f(x)=x²，在 x=2 处计算不同步长的差商并观察误差。'],
 ['integral','积分与累积','calculus','将局部贡献累积起来，研究面积、总量与连续变化。',['定积分通过极限过程建立区间上的累积量。'],'用越来越细的矩形近似 f(x)=x 在 [0,1] 上的面积。'],
 ['conditional-probability','条件概率','probability','已知事件 B 发生后，对事件 A 的概率重新限定。',['当 P(B)>0 时，P(A|B)=P(A∩B)/P(B)。','P(A|B) 与 P(B|A) 通常不同，需要明确条件事件。'],'在一个具体的二乘二计数表中，分别计算两个方向的条件概率。'],
 ['random-variable','随机变量与分布','probability','把随机结果映射成数值，并描述这些取值的概率。',['分布描述取值的概率结构；一次观测值只是一个实现。'],'用投掷两枚硬币时正面数量的例子写出完整概率分布。'],
 ['expectation','期望与方差','probability','分别描述随机变量的平均水平与离散程度。',['期望与方差的存在需要相应的可积条件。'],'计算有限离散分布的期望，比较两个均值相同但方差不同的分布。'],
 ['gradient','梯度与下降方向','optimization','梯度收集可微标量函数的偏导信息。',['在欧氏空间与适当的局部光滑条件下，负梯度给出局部最陡下降方向。','步长会影响实际迭代结果；局部下降不等于找到全局最优。'],'对一个二维二次函数画等高线，再观察不同步长的梯度下降轨迹。'],
 ['graphs','图与连接','discrete','用节点与边表达对象之间的联系。',['边可以有方向和类型。分类包含、知识相关和学习先修应分别建模。'],'把五个概念建成图，分别标明分类关系和学习先修。'],
 ['transformations','几何变换','geometry','用变换研究图形、位置与保持不变的性质。',['平移、旋转、缩放提供直观的几何变换例子。'],'用同一个三角形比较旋转和非均匀缩放保持了哪些性质。']
 ];
 concepts.forEach(([id,title,parent,summary,paragraphs,exercise])=>add(id,title,parent,'concept',summary,{paragraphs,exercise,source:nodes.get(parent).source,editorial:true}));
 const branches={
 life:[['cell-biology','细胞与分子','从细胞结构到生命过程的分子基础。'],['genetics','遗传与信息','探索遗传信息的传递、表达与变化。'],['physiology','生理与调控','理解生命系统如何协同运行。'],['ecology','演化与生态','观察生命在时间与环境中的联系。'],['neuroscience','神经与认知','从神经系统走向感知、学习与行为。'],['bioengineering','生物工程','连接生命知识与工程方法。']],
 physics:[['mechanics','力学','运动、相互作用与守恒。'],['electromagnetism','电磁学','电、磁与场。'],['thermodynamics','热与统计物理','能量、热与宏观行为。'],['quantum','量子物理','探索微观世界的描述框架。'],['cosmology','天文与宇宙','从恒星走向宇宙尺度。']],
 engineering:[['electronics','电子与电路','从基本电路到电子系统。'],['mechanical','机械与制造','从结构设计到实际制造。'],['materials','材料科学','连接结构、性质与应用。'],['control','控制与机器人','感知、反馈与行动。']],
 humanities:[['philosophy','哲学与思辨','概念、论证与根本问题。'],['history','历史与文明','追溯人类经验及其材料。'],['society','社会与制度','理解共同生活的结构。'],['language','语言与沟通','语言、理解与交流。']],
 arts:[['music','音乐与声音','节奏、音高、结构与表达。'],['visual-arts','视觉艺术','色彩、形态与视觉语言。'],['literature','文学与叙事','文字、经验与叙事。'],['design','设计与体验','从人的需要走向具体形式。']]
 };
 Object.entries(branches).forEach(([parent,list])=>list.forEach(([id,title,summary])=>add(id,title,parent,'branch',summary,{outline:true,source:parent==='life'?'biology':null})));
 legacy.domains.forEach(d=>{add(d.id,d.name,'computing','branch',d.description,{en:d.en,color:d.color});legacy.skills.filter(s=>s.domain===d.id).forEach(s=>add(s.id,s.name,d.id,'concept',s.detail,{legacyId:s.id}));});
 relations.push({from:'vectors',to:'linear-map',type:'related',label:'向量空间上的映射'},{from:'linear-map',to:'rank',type:'related',label:'像空间的维数'},{from:'rank',to:'svd',type:'related',label:'低秩结构'},{from:'svd',to:'lora',type:'appliesTo',label:'理解低秩参数化的数学背景'},{from:'derivative',to:'gradient',type:'related',label:'局部变化与优化'},{from:'gradient',to:'backprop',type:'related',label:'梯度计算与参数更新'},{from:'graphs',to:'algorithm',type:'related',label:'图结构与算法'});
 const children=id=>[...nodes.values()].filter(n=>n.parent===id);
 const ancestors=id=>{const out=[];let n=nodes.get(id);while(n){out.unshift(n);n=nodes.get(n.parent)}return out};
 const rootOf=id=>ancestors(id).find(n=>n.kind==='discipline')||nodes.get('universe');
 const descendants=id=>{const out=[];const visit=pid=>children(pid).forEach(n=>{out.push(n);visit(n.id)});visit(id);return out};
 return {nodes,relations,children,ancestors,rootOf,descendants,sources:SOURCES,version:1};
}
