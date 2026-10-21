/* 技术宇宙的数据源：可以直接修改这里的初始节点。\n * mastery: 0 未涉足, 1 了解, 2 跑通, 3 独立应用, 4 深入掌握, 5 专业深耕
 * status: explored 已涉足, active 正在攻占, future 未来探索
 * priority: now 当下, parallel 并行, later 以后
 */
const ATLAS_DATA = {
  version: 2,
  lastUpdated: '2026-10-20',
  domains: [
    {id:'foundation', name:'计算机科学基础', en:'COMPUTER SCIENCE', color:'#8aafc9', x:-520,y:-175, description:'理解机器、算法、操作系统与网络是怎样工作的。'},
    {id:'software',name:'软件开发工程',en:'SOFTWARE ENGINEERING',color:'#8dc5b5',x:-85,y:-235,description:'从需求到可测试、可维护的代码和产品。'},
    {id:'storage',name:'数据与存储系统',en:'DATA & STORAGE',color:'#c9b28a',x:325,y:-180,description:'围绕数据建模、事务、持久化与检索展开。'},
    {id:'infra',name:'基础设施与安全',en:'INFRA & SECURITY',color:'#9aaac8',x:-540,y:225,description:'让软件可靠地部署、运行、通信并受到保护。'},
    {id:'distributed',name:'系统架构与分布式',en:'SYSTEM ARCHITECTURE',color:'#ceaa94',x:-165,y:260,description:'解决负载、并发、一致性与系统扩展的问题。'},
    {id:'aiapps',name:'AI 应用工程',en:'AI APPLICATIONS',color:'#8db9bc',x:280,y:260,description:'把模型能力转化为真正有用的业务系统。'},
    {id:'aimodel',name:'AI 模型与训练',en:'MODEL ENGINEERING',color:'#b4a1c9',x:670,y:-10,description:'从数学和训练机制走向模型研发与优化。'}
  ],
  skills: [
    {id:'cs408',domain:'foundation',name:'计算机 408',mastery:1,status:'explored',priority:'now',detail:'已接触计算机基础的部分内容，需要逐步补齐理论体系。'},
    {id:'os',domain:'foundation',name:'操作系统原理',mastery:1,status:'explored',priority:'parallel',detail:'进程、内存、文件系统、系统调用等。'},
    {id:'network',domain:'foundation',name:'计算机网络',mastery:2,status:'explored',priority:'now',detail:'协议分层、TCP/IP、HTTP、DNS、路由等。'},
    {id:'algorithm',domain:'foundation',name:'数据结构 / 算法',mastery:1,status:'explored',priority:'parallel',detail:'复杂度分析、常见数据结构和算法设计。'},
    {id:'math',domain:'foundation',name:'数学基础',mastery:1,status:'explored',priority:'parallel',detail:'线性代数、微积分、概率统计，为后续模型研究打基础。'},
    {id:'compiler',domain:'foundation',name:'编译原理',mastery:0,status:'future',priority:'later',detail:'词法分析、语法分析、中间表示、编译和运行时。'},
    {id:'linux-internals',domain:'foundation',name:'Linux 底层',mastery:2,status:'explored',priority:'parallel',detail:'理解 Linux 的基础机制，并继续探索内核与系统边界。'},

    {id:'java',domain:'software',name:'Java',mastery:2,status:'active',priority:'now',detail:'语法、集合、异常、并发及工程规范。'},
    {id:'spring',domain:'software',name:'Spring Boot',mastery:2,status:'active',priority:'now',detail:'依赖注入、MVC、Security、事务及后端业务模块。'},
    {id:'vue',domain:'software',name:'Vue 3',mastery:2,status:'active',priority:'now',detail:'组件、路由、状态管理以及 API 协作。'},
    {id:'api',domain:'software',name:'API / HTTP',mastery:2,status:'active',priority:'now',detail:'接口设计、校验、错误处理、鉴权、幂等。'},
    {id:'iam',domain:'software',name:'IAM 权限模型',mastery:2,status:'active',priority:'now',detail:'资源、动作、数据范围与业务规则分层。',evidence:['ERP 项目：组织、用户、角色及权限模型设计']},
    {id:'testing',domain:'software',name:'自动化测试',mastery:1,status:'active',priority:'now',detail:'单元测试、集成测试、并发测试、可回归性。'},
    {id:'jvm',domain:'software',name:'JVM / 并发',mastery:1,status:'future',priority:'now',detail:'线程、内存模型、GC、线程池和性能问题。'},

    {id:'sql',domain:'storage',name:'SQL / 数据建模',mastery:2,status:'active',priority:'now',detail:'表结构、范式、约束、索引及业务关系建模。'},
    {id:'postgres',domain:'storage',name:'PostgreSQL',mastery:2,status:'active',priority:'now',detail:'事务、复杂查询、索引、锁、执行计划与运维。'},
    {id:'redis',domain:'storage',name:'Redis',mastery:2,status:'active',priority:'now',detail:'缓存、会话存储、过期控制和一致性边界。'},
    {id:'minio',domain:'storage',name:'MinIO / S3',mastery:3,status:'explored',priority:'parallel',detail:'对象存储、预签名上传、策略与访问控制。',evidence:['对象存储部署及 mc 上传、下载、临时链接演练']},
    {id:'mvcc',domain:'storage',name:'MVCC / WAL',mastery:1,status:'explored',priority:'parallel',detail:'数据库并发可见性、日志、Checkpoint 和恢复机制。'},
    {id:'dbbackup',domain:'storage',name:'PITR / 备份',mastery:0,status:'future',priority:'now',detail:'实际演练数据库备份、恢复与故障处理。'},

    {id:'linuxops',domain:'infra',name:'Linux 运维',mastery:3,status:'explored',priority:'parallel',detail:'命令、权限、进程、网络、系统服务与排障。'},
    {id:'nginx',domain:'infra',name:'Nginx',mastery:3,status:'explored',priority:'parallel',detail:'反向代理、TLS、路径转发、静态站点和负载均衡。'},
    {id:'tls',domain:'infra',name:'DNS / TLS',mastery:2,status:'explored',priority:'parallel',detail:'域名解析、证书配置和 HTTPS 连接。'},
    {id:'firewall',domain:'infra',name:'网络 / 防火墙',mastery:2,status:'explored',priority:'parallel',detail:'路由器配置、端口、网络访问控制。'},
    {id:'proxmox',domain:'infra',name:'Proxmox',mastery:2,status:'explored',priority:'later',detail:'虚拟机平台和实验环境管理。'},
    {id:'docker',domain:'infra',name:'Docker / Compose',mastery:2,status:'explored',priority:'now',detail:'镜像、容器、数据卷、网络和服务部署。'},
    {id:'cicd',domain:'infra',name:'CI / CD',mastery:1,status:'future',priority:'now',detail:'构建、测试、发布流水线与版本回滚。'},
    {id:'secrets',domain:'infra',name:'Secrets 管理',mastery:1,status:'explored',priority:'later',detail:'从 .env 安全使用逐步走向集中密钥管理。'},

    {id:'modular',domain:'distributed',name:'模块化单体',mastery:2,status:'active',priority:'now',detail:'明确业务边界，不为了微服务而拆服务。'},
    {id:'scale',domain:'distributed',name:'水平扩容',mastery:1,status:'active',priority:'parallel',detail:'多实例、无状态、负载均衡与共享状态。'},
    {id:'replica',domain:'distributed',name:'主从复制',mastery:1,status:'active',priority:'parallel',detail:'复制延迟、读写分离和故障切换。'},
    {id:'concurrency',domain:'distributed',name:'并发一致性',mastery:1,status:'active',priority:'now',detail:'事务、乐观锁、悲观锁与竞争条件。'},
    {id:'mq',domain:'distributed',name:'消息队列',mastery:0,status:'future',priority:'later',detail:'异步任务、投递语义、幂等与补偿。'},
    {id:'observability',domain:'distributed',name:'可观测性',mastery:0,status:'future',priority:'now',detail:'日志、指标、追踪与告警。'},
    {id:'consensus',domain:'distributed',name:'分布式一致性',mastery:0,status:'future',priority:'later',detail:'CAP、复制协议、协调与失败恢复。'},
    {id:'microservices',domain:'distributed',name:'微服务治理',mastery:0,status:'future',priority:'later',detail:'服务发现、故障隔离、配置、通信与治理。'},

    {id:'modelapi',domain:'aiapps',name:'模型 API',mastery:2,status:'explored',priority:'parallel',detail:'模型调用、适配层、费用和延迟控制。'},
    {id:'agent',domain:'aiapps',name:'Agent / 工具调用',mastery:2,status:'explored',priority:'parallel',detail:'工具执行、记忆、工作流和权限边界。'},
    {id:'rag',domain:'aiapps',name:'RAG',mastery:0,status:'future',priority:'parallel',detail:'数据预处理、检索、召回、重排及答案评估。'},
    {id:'vector',domain:'aiapps',name:'向量检索',mastery:0,status:'future',priority:'parallel',detail:'Embedding、相似性检索与数据库索引。'},
    {id:'serve',domain:'aiapps',name:'推理服务',mastery:0,status:'future',priority:'later',detail:'推理部署、吞吐、并发、KV Cache 及成本。'},
    {id:'eval',domain:'aiapps',name:'应用评估',mastery:0,status:'future',priority:'later',detail:'建立评测集，量化正确率、稳定性与用户价值。'},

    {id:'python',domain:'aimodel',name:'Python',mastery:2,status:'explored',priority:'parallel',detail:'模型实验、数据处理、训练脚本。'},
    {id:'torch',domain:'aimodel',name:'PyTorch',mastery:2,status:'explored',priority:'parallel',detail:'Tensor、autograd、训练循环、优化器。'},
    {id:'transformer',domain:'aimodel',name:'Transformer',mastery:1,status:'active',priority:'parallel',detail:'注意力机制、前向与反向、KV Cache、计算和内存成本。'},
    {id:'backprop',domain:'aimodel',name:'反向传播 / 优化',mastery:1,status:'active',priority:'parallel',detail:'链式法则、梯度下降、优化器与数值稳定性。'},
    {id:'lora',domain:'aimodel',name:'LoRA 微调',mastery:2,status:'explored',priority:'parallel',detail:'参数高效微调、训练与验证指标。',evidence:['云 GPU 上完成 LoRA 微调实验']},
    {id:'training',domain:'aimodel',name:'预训练与数据',mastery:0,status:'future',priority:'later',detail:'数据配比、训练目标、优化与规模化。'},
    {id:'cuda',domain:'aimodel',name:'CUDA / GPU',mastery:0,status:'future',priority:'later',detail:'GPU 内存、计算核心、并行计算及性能分析。'},
    {id:'disttrain',domain:'aimodel',name:'分布式训练',mastery:0,status:'future',priority:'later',detail:'数据并行、张量并行、流水线并行与通信。'}
  ],
  edges:[
    ['cs408','os'],['cs408','algorithm'],['network','api'],['os','linux-internals'],['math','backprop'],['algorithm','sql'],
    ['java','spring'],['spring','api'],['api','iam'],['java','jvm'],['spring','testing'],['vue','api'],
    ['sql','postgres'],['postgres','mvcc'],['postgres','dbbackup'],['postgres','replica'],['redis','scale'],['minio','api'],
    ['linuxops','docker'],['nginx','tls'],['docker','cicd'],['nginx','scale'],['firewall','linuxops'],
    ['modular','microservices'],['scale','observability'],['concurrency','consensus'],['replica','consensus'],['mq','microservices'],
    ['modelapi','agent'],['vector','rag'],['rag','eval'],['modelapi','serve'],
    ['python','torch'],['torch','lora'],['backprop','transformer'],['transformer','training'],['torch','training'],['cuda','disttrain'],
    ['api','modelapi'],['postgres','vector'],['spring','modular'],['linux-internals','linuxops'],['transformer','serve'],['training','disttrain'],['agent','rag']
  ],
  milestones:[
    {id:'ship',tag:'主线 · 0—2个月',title:'独立业务开发能力',description:'用真实 ERP 模块证明可以从设计到测试独立交付。',skillIds:['java','spring','vue','api','iam','postgres','testing'],checks:['完成一条业务闭环','有集成测试与异常场景','能够解释事务、权限和状态流转']},
    {id:'operate',tag:'主线 · 3—4个月',title:'独立系统交付能力',description:'完成部署、运维、故障处理以及备份恢复演练。',skillIds:['linuxops','docker','nginx','cicd','dbbackup','observability'],checks:['空服务器可重复部署','有日志与健康检查','模拟故障并验证恢复']},
    {id:'scaleup',tag:'主线 · 5—6个月',title:'系统架构与扩展能力',description:'以具体的瓶颈与一致性问题驱动架构选择。',skillIds:['modular','scale','concurrency','replica','redis'],checks:['完成多实例部署实验','解释会话共享与竞争条件','用压测或指标论证扩容']},
    {id:'modeltrack',tag:'并行航线 · 持续推进',title:'AI 模型机制能力',description:'数学、Transformer、PyTorch 和训练机制同步积累。',skillIds:['math','python','torch','transformer','backprop','lora'],checks:['能手推一次注意力计算','独立跑通训练和验证','解释显存与性能瓶颈']},
    {id:'future',tag:'中长期远征',title:'AI 产品与模型研发',description:'根据真实机会在 AI 系统工程、模型研发和创业之间形成专精。',skillIds:['rag','agent','serve','eval','cuda','disttrain'],checks:['构建可评估的 AI 产品','研究推理或训练性能','验证真实用户价值']}
  ],
  goals:[{name:'独立交付可靠系统',sub:'近期目标'},{name:'AI 系统工程能力',sub:'核心方向'},{name:'前沿模型研发与创业',sub:'长期探索'}]
};
