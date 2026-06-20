# P1 Wiki-Backed Life Sim Design

生成日期：2026-06-20

## 已确认决策

- P1 要完整实现 `docs/bitlife_feature_matrix.md` 中所有标记为 P1 的功能。
- P1 采用 Wiki-backed 内容路线：以本地 BitLife Fandom Wiki dump 作为内容与规则来源。
- Wiki 用于系统结构、条目、规则和覆盖面参考；玩家可见文案、事件叙述、按钮、UI 命名和本地化内容必须原创化改写。
- 当前仓库没有 `wiki_dump/` 目录，P1 第一阶段必须恢复或重新下载 Wiki dump。
- 技术栈保持现有单机 PWA：React、TypeScript、Vite、Zustand、localStorage 或 IndexedDB、Vitest。
- 不引入后端、账号、云存档、多档系统、数据库服务或联网玩法。
- 需求范围选择“接近产品首版”：内容量要明显高于技术样机，并能长期试玩。
- 实施路线选择“内容数据管线优先”：先建立 Wiki 抽取、清洗、catalog、schema 和校验，再逐步接入完整 P1 系统。
- P2/P3 功能可以保留浅入口或标记暂不支持，但不升级为完整闭环，不纳入 P1 验收。

## 产品目标

P1 的目标是把现有 P0 生命主循环升级为接近产品首版的普通人生模拟。玩家可以从出生玩到死亡，并在成年后围绕学习、职业、恋爱婚姻、资产、疾病、犯罪与监狱、成就形成长期路线。

P1 完成后，玩家至少能稳定体验三条常见路线：

- 稳定职业路线：通过教育、面试、工作表现、晋升、资产积累和退休形成长期成长。
- 家庭生活路线：通过朋友、伴侣、婚姻、离婚、生育、收养和子女关系形成长期家庭目标。
- 犯罪风险路线：通过犯罪、被捕、审判、判刑、监狱、假释、上诉和逃狱最小版形成高风险分支。

## 技术栈

继续使用现有技术栈：

- React 18
- TypeScript
- Vite
- Zustand
- localStorage 或 IndexedDB
- Vitest
- Testing Library
- PWA manifest

P1 不需要换框架。主要变化是把项目从“代码里写活动效果”升级为“Wiki-backed 内容管线 + 配置驱动规则引擎”。

## P1 功能范围

P1 必须覆盖以下系统。

### 关系系统

- 朋友、同学、同事关系生成。
- 关系对象按类型分组展示。
- 关系值、亲密度、冲突、存活状态。
- 伴侣与约会。
- 求婚、结婚、分手、离婚、丧偶。
- 生育与收养。
- 子女关系和家庭统计。

### 教育系统

- 大学和社区大学。
- 专业选择。
- 成绩、压力、毕业状态。
- 学校互动：学习、逃课、校园活动、同学互动、基础校园冲突。
- 教育结果影响职业门槛和面试概率。

### 职业系统

- Wiki-backed 职业和职位表。
- 面试与录用。
- 学历、属性、犯罪记录影响录用概率。
- 年薪、职位层级、绩效、任职年限。
- 晋升、加薪、降职、辞职、退休。
- 工作活动和同事/上司基础互动。

### 经济与资产系统

- 现金、年收入、基础年度支出。
- 房产、车辆、基础收藏类资产。
- 资产购买、卖出、价值展示。
- 简化折旧和净资产统计。
- 执照系统：驾照、船照、飞行执照最小版。

### 健康系统

- Wiki-backed 疾病表。
- 疾病严重度：轻症、慢性、致命。
- 症状、发现年龄、治疗记录。
- 医生、急诊、心理咨询、替代医疗等治疗入口。
- 心身活动：健身、冥想、读书、看电影、按摩、美容等。
- 疾病和健康状态影响死亡风险。

### 活动与事件系统

- 更完整的年度随机事件。
- 学校、家庭、关系、职业、健康、资产、犯罪、老年事件。
- 事件条件、权重、选项和结果都通过 catalog 配置。
- 事件结果可以影响属性、关系、金钱、资产、疾病、犯罪记录、监狱状态、成就统计。

### 犯罪系统

- Wiki-backed 犯罪列表。
- 每项犯罪包含风险、潜在收益、年龄限制和条件。
- 成功、失败、被捕、证据强度。
- 律师选择、审判、判刑。
- 犯罪记录影响职业、关系、旅行或其他事件概率。

### 监狱系统

- 是否服刑、剩余刑期、安全等级。
- 上诉、假释、行为记录。
- 基础监狱活动和监狱事件。
- 逃狱最小版。
- 监狱状态下限制普通活动。

### 国家差异

- 首批少量国家配置。
- 货币、收入修正、税或基础支出修正。
- 部分合法性差异，优先服务犯罪、执照和收入规则。
- 不机械复刻现实歧视规则，不把地区规则做成伤害性体验。

### 成就系统

- Wiki-backed 基础成就分类。
- 自动解锁和反馈。
- 覆盖职业、关系、财富、疾病、犯罪、监狱、长寿等 P1 目标。
- 每个成就包含条件、分类、隐藏状态、解锁年龄和来源引用。

## 非 P1 范围

以下内容不在 P1 完整实现范围内：

- 宠物完整系统。
- 社交媒体完整系统。
- 名人和 Fame 完整系统。
- 音乐、体育、王室等特殊路线。
- Mafia 深度路线。
- 宇航员、黑市、邪教、动物园、模特等大型扩展包。
- God Mode、商城、会员、点数和商业化能力。
- 多档存档、云存档、账号系统。

如果当前活动列表已有这些入口，可以保留为浅活动、暂不支持状态或后续版本入口，但它们不算 P1 完成标准。

## Wiki 内容映射

P1 的内容来源映射如下。

| Wiki 来源 | P1 产物 |
|---|---|
| Careers / Jobs / Job activities | 职业族、职位、面试要求、职位层级、工作事件 |
| Relationships / Spouses / Dating / Fertility / Adoption | 关系、约会、伴侣、婚姻、离婚、生育、收养 |
| Assets / Money / Licenses | 资产、执照、购买条件、资产价值 |
| Diseases / Medical Doctor / Alternative Doctor | 疾病、严重度、治疗方式、健康风险 |
| Crime / Prison / Prison Activities | 犯罪、被捕、审判、刑期、监狱活动 |
| Achievements | 成就条件、分类、隐藏状态 |
| Countries | 国家配置、货币、收入和合法性差异 |

## 内容数据管线

P1 内容管线分为三层。

### 原始数据层

- `wiki_dump/`：原始 Wiki 下载结果，不手动修改。
- `data/wiki-index/`：脚本生成的页面索引。
- `data/wiki-extracts/`：按 P1 系统抽取后的中间资料。

需要恢复或重新下载：

- `wiki_dump/manifest.json`
- `wiki_dump/files_manifest.json`
- `wiki_dump/pages/*.json`

### 抽取与清洗脚本

新增脚本：

- `scripts/wiki/build-index.mjs`
- `scripts/wiki/extract-careers.mjs`
- `scripts/wiki/extract-relationships.mjs`
- `scripts/wiki/extract-assets.mjs`
- `scripts/wiki/extract-diseases.mjs`
- `scripts/wiki/extract-crime-prison.mjs`
- `scripts/wiki/extract-achievements.mjs`
- `scripts/wiki/extract-countries.mjs`
- `scripts/wiki/validate-extracts.mjs`

脚本生成可审阅中间表：

- `data/wiki-extracts/careers.json`
- `data/wiki-extracts/relationships.json`
- `data/wiki-extracts/assets.json`
- `data/wiki-extracts/diseases.json`
- `data/wiki-extracts/crime-prison.json`
- `data/wiki-extracts/achievements.json`
- `data/wiki-extracts/countries.json`

每条中间数据包含：

- `sourcePage`
- `sourceTitle`
- `sourceSection`
- `rawName`
- `normalizedId`
- `category`
- `notes`
- `status`: `draft | reviewed | implemented | skipped`

### 游戏配置层

中间表转成游戏 catalog：

- `src/content/catalog/careers.ts`
- `src/content/catalog/education.ts`
- `src/content/catalog/relationships.ts`
- `src/content/catalog/assets.ts`
- `src/content/catalog/diseases.ts`
- `src/content/catalog/crimes.ts`
- `src/content/catalog/prison.ts`
- `src/content/catalog/achievements.ts`
- `src/content/catalog/countries.ts`
- `src/content/catalog/events.ts`

所有 catalog 必须满足：

- id 唯一。
- 不含玩家可见 Wiki 长文案。
- 玩家可见文案只引用 locale key。
- 条件、风险、效果、权重字段可被规则引擎应用。
- `zh-CN` 和 `en-US` locale key 都存在。
- 每个配置项保留 `sourceRefs`，可追溯 Wiki 来源。

## 内容量目标

P1 产品首版目标：

- 职业/职位：50+
- 大学专业：20+
- 学校/大学事件：50+
- 关系/家庭事件：80+
- 资产：50+
- 执照：3 类
- 疾病：40+
- 治疗方式：医生、急诊、心理、替代医疗等
- 犯罪：20+
- 监狱事件/活动：40+
- 成就：80+
- 通用随机事件：150+

这些是 P1 的目标覆盖面。实施中可以分阶段填充，但最终 P1 验收必须达到或超过这些目标。

## 状态模型

P1 将存档升级到 `LifeState.version = 2`，并提供 `v1 -> v2` 迁移。

新增或扩展状态：

- `education`: 学历、学校类型、专业、成绩、压力、毕业状态、学费或债务。
- `career`: 当前工作、职业族、职位层级、年薪、绩效、任职年限、退休状态、同事和上司关系。
- `relationships`: 家庭、朋友、同学、同事、伴侣、配偶、子女，包含年龄、关系值、亲密度、冲突和存活状态。
- `family`: 婚姻状态、子女列表、生育和收养历史、离婚和丧偶记录。
- `assets`: 房产、车辆和基础收藏，包含购买价、当前价值、折旧和卖出状态。
- `licenses`: 驾照、船照、飞行执照通过状态。
- `health`: 疾病列表、严重度、发现年龄、治疗记录、慢性状态、死亡风险修正。
- `criminalRecord`: 犯罪记录、被捕次数、定罪记录、服刑状态。
- `prison`: 是否服刑、剩余刑期、安全等级、行为记录、假释资格、上诉状态。
- `achievements`: 已解锁成就、解锁年龄、分类。
- `stats`: 总收入、工作年数、婚姻次数、子女数、犯罪成功数、入狱次数、疾病康复数等。

## 规则架构

新增系统模块：

- `src/game/systems/educationSystem.ts`
- `src/game/systems/careerSystem.ts`
- `src/game/systems/relationshipSystem.ts`
- `src/game/systems/familySystem.ts`
- `src/game/systems/assetSystem.ts`
- `src/game/systems/healthSystem.ts`
- `src/game/systems/crimeSystem.ts`
- `src/game/systems/prisonSystem.ts`
- `src/game/systems/achievementSystem.ts`
- `src/game/systems/countrySystem.ts`

规则边界：

- UI 不直接修改玩法状态。
- Zustand store 只负责 UI action、存档和调用 engine。
- `engine.ts` 负责年度推进和动作调度。
- 具体规则放在 `src/game/systems/*`。
- 所有概率计算是纯函数，并支持 seeded random。
- 所有内容由 catalog 配置驱动。

## 年度推进

每次长大一岁按顺序执行：

1. 年龄 +1。
2. 教育年度结算：成绩、压力、毕业、升学机会。
3. 职业年度结算：工资、绩效、晋升、降职、退休机会。
4. 资产年度结算：价值变化和基础维护成本。
5. 健康年度结算：疾病进展、慢性影响、死亡风险。
6. 犯罪和监狱年度结算：刑期减少、假释、上诉、监狱事件。
7. 关系年度结算：关系自然变化、伴侣、婚姻和子女事件。
8. 成就检查。
9. 生成年度事件。

未处理年度事件时，玩家不能继续长大一岁。

## 玩家动作

P1 动作分为：

- 教育动作：申请大学、申请社区大学、选择专业、学习、逃课、校园活动。
- 职业动作：申请工作、面试、努力工作、加班、请求加薪、申请晋升、辞职、退休。
- 关系动作：交朋友、约会、求婚、结婚、分手、离婚、生育、收养、陪伴对象。
- 资产动作：买房、买车、卖出资产、考执照。
- 健康动作：看医生、急诊、心理咨询、替代治疗、健身、冥想。
- 犯罪动作：选择犯罪、计算成功、收益、被捕、审判和律师结果。
- 监狱动作：上诉、假释、服刑互动、逃狱最小版。
- 成就动作：系统自动解锁，无需玩家主动触发。

## UI 设计

P1 继续手机竖屏优先。保留 5 个底部 Tab：

- `人生`：年度事件、最近日志、长大一岁。
- `关系`：家庭、朋友、伴侣、配偶、子女、同学和同事。
- `事业`：学校、大学、工作、职业活动和退休。
- `活动`：健康、心身、资产、执照、犯罪、医疗等动作入口。
- `档案`：属性、资产净值、疾病、犯罪记录、成就、人生统计、语言设置。

P1 新增或升级面板：

- 教育面板。
- 职业面板。
- 关系面板。
- 资产面板。
- 健康面板。
- 犯罪面板。
- 监狱面板。
- 成就面板。
- 统计面板。

交互约束：

- 每个动作按钮显示成本、风险或主要效果。
- 不可用动作显示原因。
- 监狱状态下隐藏或禁用普通活动。
- 死亡后进入结算页。
- 所有玩家可见文案通过 locale key 渲染。

## 阶段拆分

### 阶段 1：Wiki 数据恢复与内容管线

交付：

- 恢复或重新下载 `wiki_dump/`。
- 生成 `data/wiki-index/` 页面索引。
- 生成 P1 中间抽取表。
- 建立 schema 校验和来源追踪。

验收：

- 每条中间数据有来源字段。
- P1 所需 Wiki 来源页面都能被索引。
- 抽取脚本可重复运行。

### 阶段 2：Catalog 与校验系统

交付：

- 新增 `src/content/catalog/*`。
- 新增内容 schema 和校验测试。
- locale key 校验。
- 原创化文案结构。

验收：

- catalog id 唯一。
- locale key 完整。
- 玩家可见文案不直接复制 Wiki 长文案。
- 每条配置可追溯到 Wiki 来源或原创补充来源。

### 阶段 3：P1 核心系统实现

交付：

- 教育、职业、关系、资产、疾病、犯罪、监狱、成就系统模块。
- `LifeState v2` 和存档迁移。
- 年度推进调度重构。
- store actions 接入系统模块。

验收：

- 每个系统有单元测试。
- 年度推进有集成测试。
- 旧 P0 存档能迁移。
- 监狱、死亡、未处理事件等状态限制正确。

### 阶段 4：P1 UI 完整接入

交付：

- `事业`、`关系`、`活动`、`档案` 页面升级。
- 资产、健康、犯罪/监狱、成就展示。
- 动作按钮显示成本、风险、锁定原因。
- 死亡结算展示 P1 统计。

验收：

- 移动端 390 x 844 不重叠。
- 稳定工作、家庭生活、犯罪入狱三条路线可玩。
- 所有不可用动作有明确原因。

### 阶段 5：内容填充与产品首版验收

交付：

- 达成 P1 内容量目标。
- 完成核心系统平衡和事件覆盖。
- 完成最终测试、构建和移动端 QA。

最终验收：

- 成年后至少三条完整路线可玩。
- 玩家选择能长期改变人生路径。
- 成就覆盖 P1 主要目标。
- 构建和测试通过。

## 测试策略

- Wiki index 测试：确认核心页面存在并可索引。
- Extract 测试：确认中间表字段完整、id 唯一、来源可追溯。
- Catalog schema 测试：确认配置字段合法。
- Locale 测试：确认 `zh-CN` 和 `en-US` key 完整。
- 系统单元测试：教育、职业、关系、资产、健康、犯罪、监狱、成就独立测试。
- Engine 集成测试：年度推进、动作调度、死亡、存档迁移。
- Store 测试：localStorage/IndexedDB 读写、迁移、动作调用。
- UI 测试：关键流程和锁定原因。
- 手动 QA：390 x 844 移动端创建人生、升学、工作、恋爱、资产、疾病、犯罪、入狱、死亡结算。

## 风险与处理

| 风险 | 影响 | 处理 |
|---|---|---|
| Wiki dump 当前不在仓库 | 无法开始内容抽取 | 第一阶段先恢复或重新下载 dump |
| Wiki 页面结构不统一 | 自动抽取不完整 | 抽取脚本生成中间表，人工 review 后进入 catalog |
| 内容量过大 | 开发周期失控 | 管线、系统、UI、内容分阶段验收 |
| 版权和同质化 | 法律和产品风险 | 只保留结构和条目参考，玩家文案原创化 |
| `engine.ts` 膨胀 | 难维护 | 规则拆到 `src/game/systems/*` |
| 存档破坏 | 用户无法继续 | `LifeState v2` 和迁移测试 |
| 当前环境缺少 `npm` 和 `git` PATH | 无法测试和提交 | 实施前恢复 PATH 或使用明确可执行文件路径 |

## 实施前置条件

- `wiki_dump/` 可用，或下载脚本可成功重新生成。
- Node/npm 可执行路径可用。
- Git 可执行路径可用，或接受由用户手动提交。
- 确认 `wiki_dump/` 是否纳入 git，或者加入 `.gitignore` 并只提交生成后的可审阅 extract/catalog。

## 成功标准

P1 完成时：

- 完整覆盖功能矩阵中的所有 P1 项。
- 内容来源可追溯到 Wiki-backed 管线。
- 玩家可见内容原创化并双语可用。
- 单机 PWA 可从出生玩到死亡。
- 教育、职业、关系、资产、疾病、犯罪/监狱、成就形成可玩的长期闭环。
- P2/P3 没有被误纳入 P1 完整范围。
- 测试和构建通过。
