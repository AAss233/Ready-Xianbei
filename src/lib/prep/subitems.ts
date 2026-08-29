// 二级清单：某个物资内部的具体子物品。
// 依据国家应急广播官方应急包清单铺设，覆盖背包(bob)全物资。
//
// 两种子物品类型：
//  - count ：有单位、可 +/- 累加甚至超选（如创可贴/片、纱布/卷）
//  - toggle：一个整体，只勾/不勾（如成套的剪刀镊子）
//
// 一级打勾规则：所有「必需(essential)」子物品达到最低配置(baseline)即算「已备」，
// 非必需子物品不备也不影响打勾——特别适合水/食物这类重物减负后仍达标。
//
// key = 物资模板的 gearId（无 gearId 时为自身 key）。

export type SubItemType = "count" | "toggle";

// 数量缩放方式：
//  - perPerson：人人都要用的消耗品/贴身物，建议量 = 人均值 × 人数（水、食物、口罩、餐具、雨衣、卫生用品…）
//  - shared   ：全家共用 1 份即可，不随人数变（收音机、指南针、工具组、炊具锅炉、储水桶、地图证件…）
//  - optional ：多备更安全但非人手必需，默认固定值（灭火毯、保温毯、手电、净水片、绳索…）
// 缺省视为 shared（固定，不乘人数）。
export type SubItemScale = "perPerson" | "shared" | "optional";

export interface SubItem {
  key: string;            // 稳定标识（在该物资内唯一）
  name: string;           // 子物品名
  type: SubItemType;      // 交互类型
  unit?: string;          // 计数型单位（片/卷/支/条/副…）
  recommended: number;    // 人均/固定建议量：count=数量；toggle=1
  baseline?: number;      // 人均/固定生存基线量（超重时最低保留量；不填=可全部拿出）
  unitWeightKg: number;   // 单件（每单位）重量 kg
  essential?: boolean;    // 是否必需品（超重时更优先保留）
  scale?: SubItemScale;   // 数量缩放方式（缺省 shared=固定）
  note?: string;          // 关键规格 / 说明
}

// 按人数缩放后的建议量（perPerson 才乘人数；toggle 恒为 1）
export function scaledRecommended(sub: SubItem, members: number): number {
  if (sub.type === "toggle") return 1;
  const n = Math.max(1, members || 1);
  return sub.scale === "perPerson" ? sub.recommended * n : sub.recommended;
}

// 按人数缩放后的基线量
export function scaledBaseline(sub: SubItem, members: number): number {
  if (sub.type === "toggle") return sub.essential ? 1 : 0;
  const base = sub.baseline ?? sub.recommended;
  const n = Math.max(1, members || 1);
  return sub.scale === "perPerson" ? base * n : base;
}

export const SUBITEMS: Record<string, SubItem[]> = {
  // ——— 应急背包本体（BOB 骨架，容积按人数缩放） ———
  backpack: [
    { key: "bag", name: "应急双肩包（防泼水）", type: "count", unit: "个", recommended: 1, baseline: 1, unitWeightKg: 1.2, essential: true, scale: "shared", note: "容积按人数选：单人 20-30L / 两人 30-45L / 三口及以上 45-60L" },
    { key: "raincover", name: "背包防雨罩", type: "toggle", recommended: 1, unitWeightKg: 0.1, note: "雨天/涉水保护包内物资" },
  ],
  // ——— 供水（背包·随身应急量，非家庭储水；家庭 3L/人/天 见 waterstore） ———
  water: [
    { key: "bottle",  name: "瓶装水 550ml", type: "count",  unit: "瓶", recommended: 2,  baseline: 1, unitWeightKg: 0.55,  essential: true, scale: "perPerson", note: "随身应急饮水，每人 2 瓶足够转移途中；家庭储水另按 3L/人/天备" },
    { key: "straw",   name: "净水吸管",     type: "toggle", recommended: 1,  baseline: 0, unitWeightKg: 0.06,  note: "野外过滤直饮，减少带水负重" },
    { key: "tablet",  name: "净水片",       type: "count",  unit: "片", recommended: 10, baseline: 4, unitWeightKg: 0.001, note: "消毒可疑水源，1 片约处理 1L" },
    { key: "foldbag", name: "折叠水袋",     type: "count",  unit: "个", recommended: 1,  baseline: 0, scale: "optional", unitWeightKg: 0.08, note: "空袋极轻，找到水源可就地装水，扩展随身储水" },
  ],
  // ——— 家中储水（居家常备·按 3L/人/天×3天，饮用与生活用水分开计） ———
  waterstore: [
    { key: "drink",  name: "饮用水（喝）",       type: "count", unit: "L", recommended: 3,  baseline: 1, unitWeightKg: 1, essential: true, scale: "perPerson", note: "约 1L/人/天×3 天：只用于饮用；瓶装或煮沸放凉密封储存" },
    { key: "living", name: "生活用水（做饭/清洁/冲厕）", type: "count", unit: "L", recommended: 6, baseline: 2, unitWeightKg: 1, essential: true, scale: "perPerson", note: "约 2L/人/天×3 天：储水桶/浴缸接满，做饭、洗漱、冲厕、清洁伤口用" },
    { key: "barrel", name: "带盖避光储水桶 / 折叠水袋", type: "count", unit: "个", recommended: 2, baseline: 1, unitWeightKg: 1.2, note: "盛装上面的水，定期换水防变质" },
    { key: "tablet", name: "净水片 / 家用滤水器", type: "count", unit: "片", recommended: 20, baseline: 8, unitWeightKg: 0.001, essential: true, note: "管道污染或自来水异常时净化再用，1 片约处理 1L；家用滤水器可长期净化" },
  ],
  // ——— 食物（背包·耐储存、好携带、高热量的应急口粮；家中丰富种类见 homefood） ———
  food: [
    { key: "biscuit",  name: "压缩饼干",       type: "count", unit: "包", recommended: 6, baseline: 2, unitWeightKg: 0.15, essential: true, scale: "perPerson", note: "免烹饪、高热量、长保质期，每人每天约 2 包" },
    { key: "energybar",name: "高热量能量棒",   type: "count", unit: "根", recommended: 6, baseline: 3, unitWeightKg: 0.05, essential: true, scale: "perPerson", note: "体积小热量高，随身补给" },
    { key: "gel",      name: "能量胶",        type: "count", unit: "支", recommended: 3, baseline: 0, scale: "perPerson", unitWeightKg: 0.04, note: "快速吸收补能，撤离/体力透支时用" },
    { key: "nuts",     name: "坚果 / 牛肉干（独立包）", type: "count", unit: "包", recommended: 3, baseline: 0, scale: "perPerson", unitWeightKg: 0.05, note: "高热量高蛋白、耐放，随手补给" },
    { key: "sugar",    name: "葡萄糖 / 硬糖",  type: "count", unit: "包", recommended: 2, baseline: 1, unitWeightKg: 0.05, note: "快速补糖，稳定情绪与体力" },
    { key: "salt",     name: "盐包 / 电解质",  type: "count", unit: "包", recommended: 6, baseline: 2, unitWeightKg: 0.005, note: "大量出汗后补钠防脱水乏力" },
  ],
  // ——— 家庭食物储备（居家常备·种类更丰富，可热食/口味营养更全） ———
  homefood: [
    { key: "selfheat", name: "自热米饭 / 面",  type: "count", unit: "盒", recommended: 3, baseline: 1, scale: "perPerson", unitWeightKg: 0.3,  essential: true, note: "无需明火即可热食，改善口感与士气" },
    { key: "can",      name: "各类罐头（肉/鱼/果蔬）", type: "count", unit: "罐", recommended: 6, baseline: 2, scale: "perPerson", unitWeightKg: 0.35, essential: true, note: "开盖即食，补充蛋白与维生素，种类换着来" },
    { key: "noodle",   name: "方便面 / 挂面 · 米面", type: "count", unit: "份", recommended: 6, baseline: 2, scale: "perPerson", unitWeightKg: 0.1, note: "主食储备，有燃气/炉具时可煮食" },
    { key: "milk",     name: "常温奶 / 豆奶",  type: "count", unit: "盒", recommended: 6, baseline: 0, scale: "perPerson", unitWeightKg: 0.25, note: "补充蛋白与钙，老人小孩尤其需要" },
    { key: "snack",    name: "饼干 / 麦片 / 果干", type: "count", unit: "份", recommended: 4, baseline: 0, scale: "perPerson", unitWeightKg: 0.1, note: "耐储零食，稳定情绪、丰富口味" },
    { key: "oilcond",  name: "食用油 / 盐糖等调料", type: "toggle", recommended: 1, unitWeightKg: 1, note: "日常本就常备，灾时可做饭" },
  ],
  // ——— 应急医疗包 ———
  firstaid: [
    { key: "iodine",   name: "碘伏棉棒",      type: "count",  unit: "支", recommended: 10, baseline: 4, unitWeightKg: 0.002, essential: true,  note: "独立包装，消毒杀菌" },
    { key: "alcohol",  name: "酒精棉棒",      type: "count",  unit: "支", recommended: 10, baseline: 2, unitWeightKg: 0.002, note: "清洁消毒" },
    { key: "bandaid",  name: "创可贴",        type: "count",  unit: "片", recommended: 20, baseline: 6, unitWeightKg: 0.003, essential: true,  note: "含防水与弹力款" },
    { key: "ointment", name: "抗菌软膏",      type: "count",  unit: "支", recommended: 1,  baseline: 1, unitWeightKg: 0.02,  note: "预防伤口感染" },
    { key: "gauze",    name: "医用纱布块 / 纱布卷", type: "count", unit: "卷", recommended: 3, baseline: 1, unitWeightKg: 0.03, essential: true, note: "覆盖较大创面" },
    { key: "triangle", name: "三角绷带",      type: "count",  unit: "条", recommended: 2, baseline: 1, unitWeightKg: 0.04, note: "悬吊固定、包扎" },
    { key: "elastic",  name: "医用弹性绷带",  type: "count",  unit: "卷", recommended: 2, baseline: 1, unitWeightKg: 0.03, note: "加压包扎、固定" },
    { key: "tourniquet", name: "止血带 / 压脉带", type: "count", unit: "根", recommended: 1, baseline: 1, unitWeightKg: 0.03, essential: true, note: "四肢大出血应急" },
    { key: "scissors", name: "剪刀 + 镊子",   type: "toggle", recommended: 1, unitWeightKg: 0.08, note: "圆头剪，取异物用镊子" },
    { key: "gloves",   name: "医用橡胶手套",  type: "count",  unit: "副", recommended: 2, baseline: 1, unitWeightKg: 0.01, note: "施救隔离防感染" },
    { key: "tape",     name: "宽胶带",        type: "count",  unit: "卷", recommended: 1, baseline: 1, unitWeightKg: 0.03, note: "固定敷料" },
    { key: "cotton",   name: "棉花球",        type: "count",  unit: "包", recommended: 1, baseline: 1, unitWeightKg: 0.02, note: "清洁、蘸取药液" },
    { key: "burn",     name: "烧烫伤软膏 / 敷料", type: "count", unit: "支", recommended: 1, baseline: 0, unitWeightKg: 0.03, note: "火灾/热损伤处理，降温镇痛防感染" },
    { key: "meds",     name: "常用药（对症）",   type: "count", unit: "种", recommended: 5, baseline: 2, unitWeightKg: 0.03, essential: true, scale: "perPerson", note: "退烧止痛、止泻、抗过敏、消炎、肠胃药等；配下方「药症速查卡」按需去药店买" },
    { key: "medcard",  name: "药症速查卡（纸质）", type: "toggle", recommended: 1, unitWeightKg: 0.01, essential: true, note: "写清常见症状→对应药名/用法，断网也能照卡取药自救" },
  ],
  // ——— 照明 · 手电筒 ———
  flashlight: [
    { key: "torch",   name: "手摇多功能手电筒", type: "toggle", recommended: 1, unitWeightKg: 0.25, essential: true, note: "手摇/太阳能充电，兼收音机与 USB 输出" },
    { key: "headlamp",name: "头灯",           type: "count", unit: "个", recommended: 1, baseline: 0, unitWeightKg: 0.08, note: "解放双手，撤离/自救更方便" },
    { key: "glowstick",name: "荧光棒",         type: "count", unit: "支", recommended: 4, baseline: 2, unitWeightKg: 0.02, note: "无需电，折断即亮，标记位置/夜间被发现" },
  ],
  // ——— 供电 · 充电宝 ———
  battery: [
    { key: "powerbank", name: "充电宝 10000mAh", type: "count", unit: "个", recommended: 1, baseline: 1, unitWeightKg: 0.22, essential: true, note: "每 3 个月充满一次；给手机/收音机补电" },
    { key: "cable",     name: "多头充电线",     type: "count", unit: "条", recommended: 1, baseline: 1, unitWeightKg: 0.03, note: "一线兼容常用接口" },
    { key: "cell",      name: "常用型号备用电池", type: "count", unit: "节", recommended: 8, baseline: 4, unitWeightKg: 0.024, note: "AA/AAA 等，供手电、报警器使用" },
  ],
  // ——— 求救哨（通用） ———
  whistle: [
    { key: "whistle", name: "高分贝求救哨", type: "count", unit: "个", recommended: 1, baseline: 1, unitWeightKg: 0.03, essential: true, note: "被困时省力呼救，人手一个挂身上" },
    { key: "reflect", name: "反光贴 / 反光条", type: "count", unit: "片", recommended: 2, baseline: 0, unitWeightKg: 0.005, note: "夜间便于被搜救发现" },
  ],
  // ——— 应急收音机 ———
  radio: [
    { key: "radio",  name: "手摇发电应急收音机", type: "toggle", recommended: 1, unitWeightKg: 0.3, essential: true, note: "断网断电接收官方预警，选带手电/充电款" },
    { key: "cell",   name: "备用电池",          type: "count", unit: "节", recommended: 4, baseline: 0, unitWeightKg: 0.024, note: "非手摇款需备电" },
  ],
  // ——— 防烟逃生面罩（火灾） ———
  smokemask: [
    { key: "mask", name: "N95 防烟逃生面罩", type: "count", unit: "个", recommended: 2, baseline: 1, unitWeightKg: 0.2, essential: true, note: "每位家庭成员 1 个，认准消防认证与有效期" },
  ],
  // ——— 常用药盒 / 慢病药（elderkit，与 chronicmed 共用） ———
  elderkit: [
    { key: "chronic",  name: "慢性病常用药", type: "count", unit: "周量", recommended: 2, baseline: 1, unitWeightKg: 0.1, essential: true, note: "降压/降糖等，至少备 1 周量" },
    { key: "card",     name: "病历卡 / 用药清单", type: "toggle", recommended: 1, unitWeightKg: 0.02, essential: true, note: "写明病史、过敏史、用药与紧急联系人" },
    { key: "common",   name: "常用非处方药", type: "count", unit: "种", recommended: 4, baseline: 2, unitWeightKg: 0.05, note: "退烧、止泻、抗过敏、创伤消炎等" },
    { key: "pillbox",  name: "分格药盒",     type: "toggle", recommended: 1, unitWeightKg: 0.05, note: "按天分装，避免漏服/错服" },
  ],
  // ——— 儿童应急包 ———
  kidbag: [
    { key: "idcard",  name: "儿童身份卡 / 联系卡", type: "toggle", recommended: 1, unitWeightKg: 0.02, essential: true, note: "写明姓名、血型、监护人电话，缝/挂在孩子衣物" },
    { key: "comfort", name: "安抚物（玩偶/毯）",   type: "count", unit: "件", recommended: 1, baseline: 1, unitWeightKg: 0.2, note: "稳定情绪，减少灾时应激" },
    { key: "snack",   name: "儿童零食 / 奶粉",     type: "count", unit: "份", recommended: 3, baseline: 1, unitWeightKg: 0.15, essential: true, note: "按孩子日常需要备足" },
    { key: "diaper",  name: "尿不湿 / 湿巾",       type: "count", unit: "包", recommended: 2, baseline: 1, unitWeightKg: 0.3, note: "低龄幼儿必备" },
  ],
  // ——— 宠物应急包 ———
  petkit: [
    { key: "petfood", name: "宠物粮",       type: "count", unit: "份", recommended: 3, baseline: 1, unitWeightKg: 0.3, essential: true, note: "按 3 天量分装密封" },
    { key: "petwater",name: "宠物饮水",     type: "count", unit: "瓶", recommended: 2, baseline: 1, unitWeightKg: 0.55, note: "可与折叠碗配合" },
    { key: "leash",   name: "牵引绳 + 胸背带", type: "toggle", recommended: 1, unitWeightKg: 0.15, essential: true, note: "撤离时控制宠物，防走失" },
    { key: "petbowl", name: "折叠食水碗",   type: "count", unit: "个", recommended: 1, baseline: 0, unitWeightKg: 0.05, note: "轻便可挂包" },
  ],
  // ——— 涉水防护鞋（洪水） ———
  floodshoes: [
    { key: "boots",  name: "涉水雨靴 / 包脚运动鞋", type: "count", unit: "双", recommended: 1, baseline: 1, unitWeightKg: 0.8, essential: true, scale: "perPerson", note: "每人 1 双，包裹全脚防划伤，切勿穿拖鞋/洞洞鞋" },
    { key: "socks",  name: "速干袜",              type: "count", unit: "双", recommended: 2, baseline: 0, unitWeightKg: 0.03, note: "涉水后及时更换防泡烂" },
  ],
  // ——— 应急救生哨（地震） ———
  eqwhistle: [
    { key: "whistle", name: "应急救生哨", type: "count", unit: "个", recommended: 1, baseline: 1, unitWeightKg: 0.03, essential: true, note: "被埋压时省力求救，固定在背包肩带/随身衣物" },
  ],
  // ——— 防砸头套 / 安全帽（地震） ———
  eqhelmet: [
    { key: "helmet", name: "折叠安全帽 / 防砸头套", type: "count", unit: "顶", recommended: 1, baseline: 1, unitWeightKg: 0.5, essential: true, scale: "perPerson", note: "护住头颈抵挡坠物，床头/门口各放一个" },
  ],
  // ——— 灭火毯（火灾） ———
  firetblanket: [
    { key: "blanket", name: "灭火毯 1m×1m", type: "count", unit: "块", recommended: 1, baseline: 1, unitWeightKg: 0.6, essential: true, note: "油锅起火覆盖隔氧，也可披身逃生" },
  ],
  // ——— 高度近视 / 戴眼镜相关（合并：备用眼镜 + 隐形 + 防丢绳） ———
  spareglasses: [
    { key: "glasses", name: "备用眼镜",       type: "count", unit: "副", recommended: 1, baseline: 1, unitWeightKg: 0.05, essential: true, scale: "perPerson", note: "旧的一副度数够用即可" },
    { key: "contact", name: "隐形眼镜 + 护理液", type: "count", unit: "套", recommended: 1, baseline: 0, unitWeightKg: 0.1, note: "有需要时备，护理液较重" },
    { key: "strap",   name: "眼镜防丢绳 / 运动绑带", type: "count", unit: "条", recommended: 1, baseline: 1, unitWeightKg: 0.02, essential: true, note: "涉水/奔跑不易滑落，高度近视尤其关键" },
  ],
  // ——— 女性卫生用品 ———
  hygiene: [
    { key: "pad",    name: "卫生巾",       type: "count", unit: "片", recommended: 20, baseline: 8, unitWeightKg: 0.01, essential: true, note: "经期用，按一周量备" },
    { key: "cup",    name: "月经杯",       type: "toggle", recommended: 1, unitWeightKg: 0.02, note: "可重复用，缺水缺补给时更省耗材" },
    { key: "adult",  name: "成人护理垫",   type: "count", unit: "片", recommended: 6, baseline: 2, unitWeightKg: 0.03, note: "失禁/夜间护理" },
    { key: "wipe",   name: "私处清洁湿巾", type: "count", unit: "包", recommended: 2, baseline: 1, unitWeightKg: 0.08, note: "缺水时清洁，密封防潮" },
  ],
  // ——— 产后 / 待产护理包 ———
  maternitycare: [
    { key: "matpad", name: "产褥垫 / 成人护理垫", type: "count", unit: "片", recommended: 10, baseline: 3, unitWeightKg: 0.04, essential: true, note: "恶露期用，吸量大" },
    { key: "matnap", name: "产妇专用加长卫生巾", type: "count", unit: "片", recommended: 12, baseline: 4, unitWeightKg: 0.015, essential: true, note: "恶露中后期用" },
    { key: "book",   name: "母子健康手册 + 证件复印件", type: "toggle", recommended: 1, unitWeightKg: 0.05, essential: true, note: "临产/就医必备凭证" },
    { key: "newborn",name: "新生儿基础用品",   type: "count", unit: "份", recommended: 1, baseline: 0, unitWeightKg: 0.4, note: "孕晚期一并备：包被、尿布、纸巾等" },
  ],
  // ——— 取火套装（央视·辅助用品：防风火柴等） ———
  firestarter: [
    { key: "lighter", name: "防风打火机",   type: "count", unit: "个", recommended: 2, baseline: 1, unitWeightKg: 0.02, essential: true, note: "取火主力，快取放腰封" },
    { key: "match",   name: "防水火柴",     type: "count", unit: "盒", recommended: 1, baseline: 1, unitWeightKg: 0.03, essential: true, note: "打火机失效时的备份，防潮" },
    { key: "mirror",  name: "求生镜",       type: "count", unit: "个", recommended: 1, baseline: 0, unitWeightKg: 0.03, note: "反光远距离求救" },
    { key: "compass", name: "指南针",       type: "count", unit: "个", recommended: 1, baseline: 0, unitWeightKg: 0.03, note: "断网无 GPS 时辨向（央视·求救口哨配指南针）" },
  ],
  // ——— 多功能工具组（央视·辅助用品：多功能锤/逃生绳 + 地震·多功能铲） ———
  toolset: [
    { key: "plier",  name: "多功能钳 / 战术钳", type: "count", unit: "把", recommended: 1, baseline: 1, unitWeightKg: 0.2, essential: true, note: "钳/刀/锯多用" },
    { key: "hammer", name: "多功能锤 / 破窗器", type: "count", unit: "个", recommended: 1, baseline: 1, unitWeightKg: 0.12, essential: true, note: "破窗、割安全带逃生" },
    { key: "rope",   name: "伞绳 / 逃生绳 5m", type: "count", unit: "卷", recommended: 1, baseline: 1, unitWeightKg: 0.15, essential: true, note: "牵引、固定、下降自救" },
    { key: "tape",   name: "大力胶带",       type: "count", unit: "卷", recommended: 1, baseline: 0, unitWeightKg: 0.2, note: "封堵、固定、临时修补" },
    { key: "shovel", name: "折叠工兵铲",     type: "count", unit: "把", recommended: 1, baseline: 0, unitWeightKg: 0.6, note: "央视·地震场景推荐，挖掘/破拆，较重按需带" },
  ],
  // ——— 防水收纳 ———
  waterproof: [
    { key: "drybag",  name: "防水密封袋",   type: "count", unit: "个", recommended: 3, baseline: 2, unitWeightKg: 0.03, essential: true, note: "干粮/药品/数码/证件分装防潮" },
    { key: "garbage", name: "大号垃圾袋",   type: "count", unit: "卷", recommended: 1, baseline: 1, unitWeightKg: 0.1, note: "兼作雨衣、储水、防潮" },
  ],
  // ——— 证件现金 + 备用手机 ———
  docsmoney: [
    { key: "id",    name: "身份证 / 银行卡复印件", type: "toggle", recommended: 1, unitWeightKg: 0.02, essential: true, note: "贴身存放，救助/取款凭证" },
    { key: "cash",  name: "现金（零钞+整钞）", type: "toggle", recommended: 1, unitWeightKg: 0.05, essential: true, note: "断电断网时刷卡/扫码失效" },
    { key: "phone", name: "备用手机",       type: "count", unit: "部", recommended: 1, baseline: 0, unitWeightKg: 0.18, note: "存好联系人，充满电" },
    { key: "contactcard", name: "纸质家人照片 + 联系信息", type: "toggle", recommended: 1, unitWeightKg: 0.01, essential: true, note: "手机没电/失散时寻人，含紧急联系人、血型、集合点" },
    { key: "map",   name: "本地纸质地图 + 记号笔", type: "toggle", recommended: 1, unitWeightKg: 0.05, note: "断网无导航时规划撤离/集合路线" },
  ],
  // ——— 洗漱清洁包 ———
  hygienekit: [
    { key: "tooth",  name: "牙刷牙膏（旅行装）", type: "toggle", recommended: 1, unitWeightKg: 0.05, note: "口腔清洁防病" },
    { key: "soap",   name: "香皂 / 便携肥皂", type: "count", unit: "块", recommended: 1, baseline: 1, unitWeightKg: 0.05, note: "清洁防病" },
    { key: "tissue", name: "纸巾",         type: "count", unit: "包", recommended: 3, baseline: 1, unitWeightKg: 0.05, essential: true, note: "多用途" },
    { key: "sanit",  name: "免洗洗手液",   type: "count", unit: "瓶", recommended: 1, baseline: 1, unitWeightKg: 0.1, essential: true, note: "缺水时手部消毒" },
    { key: "towel",  name: "压缩毛巾",     type: "count", unit: "片", recommended: 4, baseline: 1, unitWeightKg: 0.01, note: "遇水膨胀，省空间" },
    { key: "mask",   name: "医用 / KN95 口罩", type: "count", unit: "个", recommended: 5, baseline: 2, unitWeightKg: 0.005, essential: true, scale: "perPerson", note: "防尘防烟防病（央视·呼吸防护）" },
    { key: "condom", name: "避孕套",       type: "count", unit: "只", recommended: 4, baseline: 0, unitWeightKg: 0.003, note: "防水储水、包扎止血多用途" },
    { key: "earplug",name: "耳塞",         type: "count", unit: "副", recommended: 1, baseline: 0, unitWeightKg: 0.005, note: "避难场所降噪助眠，稳定情绪" },
    { key: "wetwipe",name: "擦浴湿巾",     type: "count", unit: "包", recommended: 1, baseline: 0, unitWeightKg: 0.15, note: "缺水时全身清洁，防皮肤感染" },
  ],
  // ——— 换洗衣物 + 雨披（含央视·洪涝分体雨衣） ———
  clothing: [
    { key: "shirt",  name: "速干衣裤（1 套）", type: "count", unit: "套", recommended: 1, baseline: 1, unitWeightKg: 0.4, essential: true, scale: "perPerson", note: "上衣+裤，保持干燥防失温" },
    { key: "socks",  name: "速干袜",       type: "count", unit: "双", recommended: 2, baseline: 1, unitWeightKg: 0.03, note: "涉水后更换防泡烂" },
    { key: "undies", name: "一次性内裤 / 袜", type: "count", unit: "套", recommended: 5, baseline: 1, unitWeightKg: 0.02, note: "卫生便捷" },
    { key: "raincoat",name: "加厚分体雨衣 / 雨披", type: "count", unit: "件", recommended: 1, baseline: 1, unitWeightKg: 0.3, essential: true, scale: "perPerson", note: "央视·洪涝场景推荐，分体款活动方便" },
  ],
  // ——— 睡袋寝具 + 保温毯（含央视·万能应急毯/保温毯） ———
  sleepgear: [
    { key: "sleepbag", name: "压缩睡袋",   type: "count", unit: "个", recommended: 1, baseline: 0, unitWeightKg: 1.2, note: "户外过夜保暖，较重按需带" },
    { key: "mat",      name: "卷装防潮垫", type: "count", unit: "个", recommended: 1, baseline: 0, unitWeightKg: 0.4, note: "隔潮隔凉" },
    { key: "blanket",  name: "应急保温毯（万能应急毯）", type: "count", unit: "张", recommended: 2, baseline: 1, unitWeightKg: 0.05, essential: true, note: "央视·应急用品，反射体温防失温，极轻必带" },
  ],
  // ——— 炊具组 ———
  cookset: [
    { key: "pot",    name: "折叠炊具锅",   type: "count", unit: "套", recommended: 1, baseline: 0, unitWeightKg: 0.4, note: "煮锅+煎锅，长期避险烧水热食" },
    { key: "stove",  name: "炉头",         type: "count", unit: "个", recommended: 1, baseline: 0, unitWeightKg: 0.15, note: "配气罐使用" },
    { key: "utensil",name: "叉勺餐具 / 饭盒",     type: "count", unit: "套", recommended: 1, baseline: 1, unitWeightKg: 0.05, essential: true, scale: "perPerson", note: "叉勺一体轻便" },
    { key: "kettle", name: "不锈钢 / 软水壶", type: "count", unit: "个", recommended: 1, baseline: 1, unitWeightKg: 0.2, note: "烧水/装水两用" },
  ],
};

// 单项准备状态分级：缺少 → 准备中 → 基本就绪 → 充足。
// done=一级是否已打勾（必备达标）；pct=二级完成度百分比（无二级时传 done?100:0）。
export function prepStatus(done: boolean, pct: number): { label: string; cls: string } {
  if (pct >= 100) return { label: "充足", cls: "text-emerald-600" };
  if (done) return { label: "基本就绪", cls: "text-primary" };
  if (pct > 0) return { label: "准备中", cls: "text-amber-600" };
  return { label: "缺少", cls: "text-muted-foreground" };
}

export function getSubItems(id: string): SubItem[] | null {
  return SUBITEMS[id] ?? null;
}

// 某物资是否有二级清单
export function hasSubItems(id: string): boolean {
  return id in SUBITEMS;
}

// 按「建议量」计算该物资装满时的总重（kg），按人数缩放
export function subItemsRecommendedWeight(id: string, members = 1): number {
  const list = SUBITEMS[id];
  if (!list) return 0;
  return list.reduce((s, it) => s + it.unitWeightKg * scaledRecommended(it, members), 0);
}

// 二级清单完成度百分比（0-100）。综合「所有」子项的准备情况，
// 必需子项权重更高（×2），非必需（×1）；每项以按人数缩放的「建议量」为满分基准，
// 只有所有子项都备到建议量才 100%（必需项对进度影响更大）。
export function subItemsProgress(
  id: string,
  qtyMap: Record<string, number> | undefined,
  members = 1,
): number {
  const list = SUBITEMS[id];
  if (!list) return 0;
  const q = qtyMap ?? {};
  let weighted = 0;
  let totalWeight = 0;
  for (const s of list) {
    const w = s.essential ? 2 : 1;
    const target = scaledRecommended(s, members) || 1;
    const have = q[s.key] ?? 0;
    weighted += w * Math.min(1, have / target);
    totalWeight += w;
  }
  if (totalWeight === 0) return 0;
  return Math.round((weighted / totalWeight) * 100);
}
