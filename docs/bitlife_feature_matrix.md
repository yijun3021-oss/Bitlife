# BitLife-like 功能矩阵与优先级说明

生成日期：2026-06-18  
资料来源：本地下载的 BitLife Fandom Wiki dump，位于 `wiki_dump/`。  
数据规模：`manifest.json` 共 5873 个页面，主文章 1644 篇，文件页 930 个，`files_manifest.json` 共 930 个素材文件。

> 说明：本文档用于做玩法结构研究和原创实现规划。不要在正式产品中直接复制 Wiki 文案、BitLife 原始 UI、商标、角色名、图片素材或受版权保护的表达。建议用这些资料理解系统边界，再做原创化命名、文案、事件与美术。

## 1. 优先级口径

| 优先级 | 定义 | 目标 | 典型模块 |
|---|---|---|---|
| P0 | 没有它就不像生命模拟游戏 | 做出可从出生到死亡的最小闭环 | 角色生成、年龄推进、基础属性、家庭关系、教育、工作、金钱、健康、死亡结算 |
| P1 | 第一版核心可玩深度 | 让玩家每一年有稳定选择、反馈和长期目标 | 活动、关系互动、职业晋升、资产、犯罪/监狱基础、疾病、成就 |
| P2 | 内容厚度和留存 | 增加可重玩性、稀有路线和中长期收集目标 | 名人、社交媒体、宠物、体育、音乐、王室、挑战、丝带、国家差异 |
| P3 | 后期扩展和商业化 | 用资料片、活动和高级编辑能力扩大内容池 | 黑市、邪教、动物园、宇航员、模特、Mafia 深度包、God Mode、商城、限时活动 |

排序原则：

1. 先做生命周期闭环，再做内容宽度。
2. 先做能复用的数据模型，再填大量事件文本。
3. 先做普通人生路线，再做特殊身份、资料片和付费能力。
4. 所有 P2/P3 功能都应挂在 P0/P1 的基础系统上，避免变成孤立小游戏。

## 2. Wiki 依据摘要

| 主题 | 本地页面 | 观察 |
|---|---|---|
| 基础属性 | `pages/345_Stats.json` | 页面覆盖 Happiness、Health、Smarts、Looks 及增减来源，是角色状态系统核心。 |
| 年龄推进 | `pages/348_Age.json` | 虽然页面短，但年龄推进是所有事件、学校、工作、健康和死亡的触发轴。 |
| 出生 | `pages/368_Adoption.json`、`pages/360_Fertility.json`、`pages/348_Age.json` | 出生、收养、生育与家庭关系共同构成开局和代际玩法。 |
| 教育与工作 | `pages/145_Careers.json`、`pages/167_CareersJobs.json`、`pages/742_CareersJob_activities.json` | 职业相关页面体量大，适合数据化为职业表、面试、岗位活动和晋升规则。 |
| 关系 | `pages/230_Relationships.json`、`pages/391_RelationshipsSpouses.json` | 关系页面约 7 万字符，是核心互动量最大的系统之一。 |
| 犯罪与监狱 | `pages/100_Crime.json`、`pages/108_Prison.json`、`pages/1120_PrisonActivities.json` | 犯罪、判刑、逃狱、帮派、假释形成一条独立风险路线。 |
| 健康与死亡 | `pages/150_Diseases.json`、`pages/110_Death.json`、`pages/2136_DeathFinal_Results.json` | 疾病页约 4 万字符，死亡页包含大量死因，是结局系统核心。 |
| 资产与金钱 | `pages/96_Assets.json`、`pages/893_Money.json`、`pages/3539_Licenses.json` | 房产、车辆、飞机船只、执照和财富增长是长期目标。 |
| 成就/丝带/挑战 | `pages/186_Achievements.json`、`pages/142_Ribbons.json`、`pages/2060_Challenges.json` | 成就页约 8 万字符，适合作为留存与目标系统。 |
| 扩展玩法 | `pages/3477_Royalty.json`、`pages/1354_Fame.json`、`pages/3089_Social_Media.json`、`pages/3514_Sports.json`、`pages/3524_Music.json` | 特殊身份和职业路线可放在 P2。 |
| 大型包 | `pages/3555_Mafia.json`、`pages/4498_Astronaut.json`、`pages/5568_Black_Market.json`、`pages/5836_Cult.json`、`pages/5180_Zoo.json` | 更适合资料片或后续版本，因为依赖基础经济、职业和事件系统。 |

## 3. 功能矩阵

| 模块 | 子功能 | 核心内容 | 数据/规则来源 | 优先级 | 优先级说明 |
|---|---|---|---|---|---|
| 角色核心 | 角色生成 | 性别、国家、出生年份、父母、初始属性、姓名 | Birth、Stats、Countries、Relationships | P0 | 这是所有人生路径的起点；没有角色生成就无法承载后续系统。 |
| 角色核心 | 基础属性 | Happiness、Health、Smarts、Looks，后续可扩展 Karma、Fame、Athleticism | Stats、Karma、Stats/Fame、Sports | P0 | 属性是事件成功率、职业、关系和死亡风险的通用输入。 |
| 角色核心 | 年龄推进 | 每次点击推进一年，触发年龄段事件、学校/工作变化、死亡检查 | Age、Events/Childhood events、Death | P0 | 年龄推进是生命模拟的主循环，所有系统都围绕它调度。 |
| 角色核心 | 年龄段规则 | 婴幼儿、儿童、青少年、成年、老年解锁不同活动 | Age、Childhood events、School Dance、Death | P0 | 限定可做选择，避免玩家在早期访问成人系统。 |
| 角色核心 | 死亡与结算 | 死因、墓志铭、最终资产、关系、成就结算 | Death、Death/Final Results、Ribbons | P0 | 形成一局游戏的结束反馈，是重开动力和目标系统入口。 |
| 角色核心 | 存档与时间线 | 保存每年事件、重大节点、角色状态快照 | Death/Final Results、Achievements | P0 | 需要支撑回顾、调试和后续成就判断。 |
| 家庭与关系 | 父母/兄弟姐妹 | 家庭成员生成、关系值、互动和死亡事件 | Relationships、Death/Family | P0 | 家庭是早期玩法主要反馈来源，也影响情感状态。 |
| 家庭与关系 | 朋友/同学/同事 | 生成关系对象，支持互动、冲突、事件 | Relationships、Education/Faculty Staff、Careers/Job activities | P1 | 第一版需要社会互动深度，但可先做统一关系模型。 |
| 家庭与关系 | 伴侣与约会 | 约会 App、恋爱、求婚、婚姻、分手 | Relationships、Dating App、Marriage Proposal、Relationships/Spouses | P1 | 高重玩价值，和生育、资产、遗产强相关。 |
| 家庭与关系 | 婚姻与离婚 | 婚礼、伴侣关系、离婚、丧偶 | Relationships/Spouses、Will/Testament、Death/Family | P1 | 是成人阶段的核心人生线，应在第一版包含。 |
| 家庭与关系 | 生育与收养 | 怀孕、双胞胎/多胞胎概率、收养审核 | Fertility、Adoption、Relationships | P1 | 支撑代际玩法和家庭目标，但可先简化为规则表。 |
| 家庭与关系 | 宠物关系 | 宠物购买、收养、互动、生病、死亡 | Pets、Pet Shop、Pet Shelter、Death/Pets | P2 | 内容丰富但不是最小人生闭环，可作为留存扩展。 |
| 教育 | 小学/中学 | 学业、同学、老师、校园事件、社团 | Events/Childhood events、Education/Faculty Staff、School Dance | P0 | 童年和青少年阶段需要稳定事件来源。 |
| 教育 | 大学/社区大学 | 专业、成绩、压力、活动、毕业 | Community college、Careers | P1 | 直接影响职业门槛，可在基础教育后加入。 |
| 教育 | 学校互动 | 学习、逃课、举报、约会、舞会、校园冲突 | Community college、Education/Faculty Staff、Events/Childhood events | P1 | 增加学校阶段可玩性，和属性变化关联强。 |
| 职业 | 普通职业表 | 公司、医院、学校、法律、餐饮、军警等职业族 | Careers、Careers/Jobs、Jobs/Careers | P0 | 工作是成年主循环和金钱来源，需优先做数据表。 |
| 职业 | 面试与录用 | 学历/属性/犯罪记录影响通过率 | Careers、Careers/Jobs | P1 | 可先做简单概率规则，再逐步细化。 |
| 职业 | 晋升与薪资 | 年薪、职位层级、绩效、同事/上司互动 | Careers、Careers/Job activities | P1 | 让工作不只是收入按钮，提供长期成长目标。 |
| 职业 | 工作活动 | 加班、辞职、退休、同事行为、上司互动 | Careers/Job activities | P1 | 与关系和属性联动，适合第一版中后段实现。 |
| 职业 | 特殊职业入口 | 医生、律师、军人、警察、演员、音乐、体育等 | Careers、Music、Sports、Medical Doctor | P2 | 依赖学历、属性和普通职业模型，适合后置。 |
| 职业 | 名人系统 | Fame 属性、广告、采访、粉丝、争议 | Fame、Stats/Fame、Social Media、Music、Sports | P2 | 增加后期目标，但需要职业系统先稳定。 |
| 经济 | 现金与收入 | 工资、支出、资产、税费、随机收入 | Money、Careers、Annual tax、Death tax | P0 | 现金是工作、资产、活动和犯罪收益的统一资源。 |
| 经济 | 资产购买 | 房子、车、飞机、船、珠宝、乐器 | Assets、Car、Aircraft、Boat、Jewelry | P1 | 提供长期目标和财富展示，规则可数据化。 |
| 经济 | 资产维护 | 折旧、卖出、维修、贷款、税费 | Assets、Money、Annual tax | P2 | 第一版可只做买卖，维护规则后续增加。 |
| 经济 | 执照 | 驾照、船照、飞行执照、考试 | Licenses、Driving License | P1 | 是车辆/飞机/船只资产和部分活动的前置条件。 |
| 经济 | 赌博与彩票 | 彩票、赌场、赛马、下注风险 | Lottery、Casino、Horse Races | P2 | 玩法独立，适合在基础经济稳定后加入。 |
| 健康 | 疾病系统 | 疾病、症状、传染、严重度、治疗结果 | Diseases、Diseases/Deadly diseases | P1 | 健康页体量大，是死亡、属性和事件的重要驱动。 |
| 健康 | 医疗活动 | 医生、替代医生、巫医、治疗选择 | Medical Doctor、Alternative Doctor、Witch Doctor | P1 | 能把疾病从纯随机变成可决策系统。 |
| 健康 | 心身活动 | 健身、冥想、读书、看电影、按摩、整容/美容 | Mind & Body、Salon & Spa、Movie Theater | P1 | 给玩家提供主动调节属性的入口。 |
| 健康 | 成瘾与风险 | 酒精、毒品、夜生活、过量、康复 | Addictions、Nightlife、Death | P2 | 对事件系统有价值，但可在健康基础后加入。 |
| 活动 | 年度活动菜单 | 按年龄、国家、资金、状态显示可用活动 | Activities、Mind & Body、Vacation、Casino | P0 | 玩家每年需要可点击的选择入口，是主循环操作面。 |
| 活动 | 旅行与移民 | 度假、邮轮、移民国家、拒签/批准 | Vacation、Emigration、Countries | P2 | 内容广但依赖国家、资金和身份规则。 |
| 活动 | 随机事件 | 童年事件、家庭事件、校园事件、路遇事件 | Events/Childhood events、Prison/Events、Death | P1 | 提供叙事感和不可预测性，是生命模拟的味道。 |
| 活动 | 选择结果系统 | 事件选项影响属性、关系、金钱、犯罪记录 | Activities、Stats、Relationships、Crime | P0 | 需要作为通用事件引擎实现，后续内容都复用。 |
| 犯罪 | 犯罪列表 | 偷窃、抢劫、谋杀、入室盗窃、诈骗等 | Crime | P1 | 犯罪是重要分支路线，第一版可做少量高影响犯罪。 |
| 犯罪 | 被捕与审判 | 犯罪成功率、被捕、律师、判刑 | Crime、Prison | P1 | 需要和监狱系统闭环，否则犯罪缺少风险。 |
| 犯罪 | 监狱基础 | 刑期、假释、上诉、暴动、逃狱 | Prison、Prison/Activities、Prison/Security | P1 | 监狱是犯罪路线的核心后果，应随犯罪一起做最小版。 |
| 犯罪 | 监狱关系和帮派 | 囚犯互动、帮派加入/退出、霸凌事件 | Prison/Gangs、Prison/Events、Relationships | P2 | 内容细但依赖关系系统，可在监狱基础后扩展。 |
| 犯罪 | Mafia 路线 | 加入、层级、告密、犯罪、首领 | Mafia | P3 | 属于大型特殊职业/犯罪资料片，不适合 MVP。 |
| 国家与身份 | 国家差异 | 出生国家、货币/税、合法性、王室国家 | Countries、Royalty、Emigration | P1 | 国家影响很多系统，第一版可先做少量国家配置。 |
| 国家与身份 | 性取向与婚姻限制 | 性取向、约会池、同性恋爱/婚姻限制 | Sexuality、Crime、Relationships | P2 | 需要谨慎处理地区规则和包容性设计。 |
| 国家与身份 | 王室 | 出生/嫁入王室、尊重值、头衔、退位/废黜 | Royalty | P2 | 高吸引力特殊路线，但需要家庭、国家、资产和事件基础。 |
| 目标系统 | 成就 | 按长寿、财富、职业、疾病、爱情、军事、监狱等分类 | Achievements | P1 | 成就页体量最大之一，能驱动重玩；先做基础成就。 |
| 目标系统 | 丝带 | 按人生表现给予结局标签 | Ribbons、Ribbon、Death/Final Results | P2 | 依赖完整生命周期数据，适合在死亡结算稳定后加入。 |
| 目标系统 | 挑战 | 每周/年度挑战、条件组合、完成记录 | Challenges、Scavenger Hunts | P2 | 是留存系统，但需要大量底层条件判断。 |
| 目标系统 | 收藏/图鉴 | 职业、疾病、国家、宠物、资产、死因等收集 | Achievements、Ribbons、Death | P2 | 可复用已有数据表，增加长期目标。 |
| 社交与名人 | 社交媒体平台 | 发帖、粉丝、违规、账号封禁、OnlyFans 等 | Social Media、Social Media/Trolling | P2 | 和 Fame、职业、金钱联动，适合第二阶段。 |
| 社交与名人 | 音乐路线 | 乐队/单飞、专辑、巡演、类型、团队关系 | Music | P2 | 是特殊职业扩展，可复用职业和名人系统。 |
| 社交与名人 | 体育路线 | 运动项目、技能、训练、队伍互动、成就 | Sports | P2 | 需要 Athleticism 和训练规则，适合职业系统后。 |
| 扩展包 | 宇航员 | 教育、太空学院、任务、许可等级、遗物 | Astronaut | P3 | 功能链长，独立规则多，适合资料片。 |
| 扩展包 | 黑市 | 古董、武器、艺术品、拍卖、博物馆 | Black Market | P3 | 依赖经济、风险、收藏系统，后期更合适。 |
| 扩展包 | 邪教 | 创建邪教、招募、成员管理 | Cult | P3 | 当前 Wiki 页面短，可作为原创扩展而非优先复刻。 |
| 扩展包 | 动物园 | 动物、栖息地、帽子、经营管理 | Zoo | P3 | 近似经营子游戏，范围较大。 |
| 扩展包 | 模特 | 模特职业、服装、高定内容 | Model | P3 | 页面较短，可等职业系统成熟后补。 |
| 商业化 | God Mode | 编辑角色属性、外貌、家庭成员等高级能力 | God Mode | P3 | 可作为调试工具先内部使用，商业化后再外显。 |
| 商业化 | Bitizenship/会员 | 去广告、高级职业、宠物、特殊活动等权益 | Bitizenship、Bitlife Marketplace、BitPoints | P3 | 需要先有足够内容价值，不应早于核心体验。 |
| 商业化 | 内容包/市场 | 职业包、扩展包、活动包、点数购买 | Bitlife Marketplace、Updates | P3 | 适合后期产品化，不影响第一版可玩性。 |
| 数据工程 | Wiki 数据清洗 | 从 JSON 提取页面、标题、命名空间、wikitext、素材索引 | `manifest.json`、`files_manifest.json` | P0 | 复刻前需要把资料转成可查询的设计资料库。 |
| 数据工程 | 游戏配置表 | 职业、疾病、事件、资产、国家、成就转成结构化表 | Careers/Jobs、Diseases、Assets、Achievements | P0 | 内容量很大，必须数据驱动，不能写死在代码里。 |
| 数据工程 | 事件 DSL | 统一描述条件、选项、概率、结果和文本 | Activities、Relationships、Crime、Diseases | P0 | 这是支撑所有玩法扩展的基础设施。 |
| 数据工程 | 内容原创化流程 | 把 Wiki 结构映射为原创事件、原创文案和原创素材 | 全部 Wiki dump | P0 | 降低版权和同质化风险，也便于本地化。 |

## 4. 建议版本拆分

### V0.1 原型：生命主循环

目标：玩家可以创建角色，从出生逐年推进到死亡，并看到状态变化。

范围：

- 角色生成：国家、姓名、性别、父母、基础属性。
- 年龄推进：每年触发 1 到 3 个事件。
- 属性系统：Happiness、Health、Smarts、Looks。
- 家庭关系：父母、兄弟姐妹、基础互动。
- 学校/工作最小版：儿童进入学校，成年后找普通工作。
- 金钱：工资、简单支出、资产总额。
- 死亡：老死、疾病死、事故死，死亡结算页。

成功标准：

- 一局游戏可以完整跑通。
- 每次推进年龄都有可理解的反馈。
- 角色状态变化能影响后续事件概率。

### V0.2 第一版可玩：普通人生深度

目标：玩家能体验学习、恋爱、工作、资产、健康、犯罪等普通人生路线。

范围：

- 教育：成绩、大学、社区大学、专业。
- 职业：职业表、面试、薪资、晋升、退休。
- 关系：朋友、伴侣、结婚、离婚、生育、收养。
- 活动：Mind & Body、看医生、美容、旅行简化版。
- 资产：房子、车、执照。
- 犯罪：少量犯罪、被捕、判刑、监狱基础。
- 成就：基础成就和人生统计。

成功标准：

- 不同属性和选择会明显改变人生路径。
- 成年后至少有 3 条常见路线：稳定工作、家庭生活、犯罪风险。
- 数据表可继续扩展，而不需要改核心逻辑。

### V0.3 内容扩展：留存和特殊路线

目标：增加可重玩性和长期目标。

范围：

- 疾病完整表、治疗方式、成瘾。
- 宠物、社交媒体、名人、音乐、体育。
- 国家差异、移民、王室。
- 丝带、挑战、收集图鉴。
- 更多资产、旅行、赌场、彩票、赛马。

成功标准：

- 玩家能主动追求不同人生结局。
- 每局人生有更多不可预测事件。
- 成就/丝带/挑战能反向引导玩家探索系统。

### V1.0 后期包：大型扩展和商业化

目标：建立可持续内容包结构。

范围：

- Mafia、Astronaut、Black Market、Cult、Zoo、Model 等大型扩展。
- God Mode、会员权益、市场、点数。
- 限时挑战、节日活动、Scavenger Hunts。
- 内部内容编辑器或配置校验工具。

成功标准：

- 每个扩展包可以独立开关。
- 商业化不破坏普通玩家的核心人生体验。
- 内容团队能用配置表新增事件和路线。

## 5. P0 数据模型建议

| 数据表/对象 | 关键字段 | 支撑功能 |
|---|---|---|
| Character | id、age、gender、country、alive、attributes、money、karma、fame | 全局角色状态 |
| AttributeState | happiness、health、smarts、looks、athleticism、discipline | 成功率、事件条件、结算 |
| Relationship | characterId、targetId、type、closeness、history、alive | 家庭、朋友、伴侣、同事、宠物 |
| LifeEvent | id、ageRange、conditions、choices、effects、weight、tags | 年度事件和活动 |
| ChoiceEffect | attributeDelta、moneyDelta、relationshipDelta、flags、newEvent | 选择结果 |
| Job | id、industry、title、salaryRange、requirements、promotionPath | 职业系统 |
| EducationRecord | schoolType、major、grade、stress、graduated | 学历与职业前置 |
| Asset | type、name、value、condition、owner、requirements | 房车、飞机、船、收藏 |
| Disease | name、severity、symptoms、treatments、deathRisk | 健康与死亡 |
| Crime | type、risk、reward、requirements、sentenceRange | 犯罪与监狱 |
| Achievement | id、conditions、category、reward、hidden | 目标系统 |
| EndingSummary | deathCause、age、netWorth、relationships、ribbon、unlockedAchievements | 死亡结算 |

## 6. 风险与处理建议

| 风险 | 影响 | 建议 |
|---|---|---|
| 直接复制原游戏表达 | 法律和上架风险高 | 只借鉴系统结构，重写文案、事件、UI 和素材。 |
| 内容量过大导致开发失控 | MVP 无法完成 | 严格按 P0/P1/P2/P3 分批，先做事件引擎和数据结构。 |
| 事件系统写死 | 后续无法扩展 | P0 就建立配置化事件 DSL。 |
| 职业/疾病/成就数据太散 | 维护成本高 | 先把 Wiki 页转成中间表，再人工清洗。 |
| 特殊扩展过早开发 | 主循环不稳 | Mafia、Astronaut、Black Market、Zoo 等放到 P3。 |
| 国家/性别/婚姻规则处理不当 | 体验和舆论风险 | 做包容性设计，避免把现实歧视机制机械照搬。 |
| 商业化过早 | 影响核心体验判断 | 先内部用 God Mode 做调试，等内容量足够再设计权益。 |

## 7. 下一步建议

1. 先把 `wiki_dump/manifest.json` 和核心页面转成一个 `data/catalog` 中间目录，形成页面标题、模块、来源、状态的索引。
2. 为 P0 建立最小配置表：属性、事件、职业、关系、疾病、死亡。
3. 先实现一个无 UI 或简易 UI 的生命周期模拟器，用 20 到 50 条原创事件跑通。
4. 再补第一版 UI、职业表、关系互动和死亡结算。
5. 当 P0/P1 稳定后，再把 Wiki 中的大量职业、疾病、成就和扩展路线分批清洗进游戏。
