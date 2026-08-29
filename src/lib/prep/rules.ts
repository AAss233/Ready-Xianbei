import type { DisasterId } from "./domain";

// 住宅类型（前台简化为“住得怎么样”，后台保留细分）
export type HouseType = "high_rise" | "low_floor" | "bungalow" | "villa" | "old_community" | "basement" | "other";

export const HOUSE_TYPES: { id: HouseType; name: string }[] = [
  { id: "high_rise", name: "高楼层" },
  { id: "low_floor", name: "低楼层" },
  { id: "bungalow", name: "平房" },
  { id: "villa", name: "别墅" },
  { id: "old_community", name: "老旧住宅" },
  { id: "basement", name: "地下/半地下" },
];

// 家庭安全画像（后台数据结构；前台不出现“画像”字样）
export interface FamilyProfile {
  city: string;          // 显示用完整地址（省 · 市 · 区县）
  province?: string;
  cityName?: string;
  district?: string;
  houseType: HouseType;
  members: number;
  hasElderly: boolean;
  hasChildren: boolean;
  hasPets: boolean;
  hasFemale?: boolean;    // 家中有女性成员 → 经期护理物资
  hasPregnant?: boolean;  // 家中有孕妇 → 产后/待产护理物资
  specialNeeds: string;      // 兼容旧字段（自由文本）
  specialTags?: SpecialTag[]; // 新：细分“特别准备”标签
  concernedDisasters?: DisasterId[]; // 新：用户在意的灾害
}

// “特别准备”细分标签（前台可选）
export type SpecialTag =
  | "戴眼镜"
  | "长期用药"
  | "行动辅助"
  | "视听辅助"
  | "特殊饮食";

export const SPECIAL_TAGS: SpecialTag[] = [
  "戴眼镜", "长期用药", "行动辅助", "视听辅助", "特殊饮食",
];

// 家庭标签（内部：驱动物资匹配）
export type FamilyTag =
  | "高层住宅"
  | "低楼层"
  | "平房"
  | "老旧小区"
  | "地下半地下"
  | "老人家庭"
  | "儿童家庭"
  | "宠物家庭"
  | "慢病家庭"
  | "行动不便"
  | "戴眼镜"
  | "女性卫生"
  | "孕产护理"
  | "视听辅助"
  | "特殊饮食";

export function computeTags(p: FamilyProfile): FamilyTag[] {
  const tags: FamilyTag[] = [];
  if (p.houseType === "high_rise") tags.push("高层住宅");
  if (p.houseType === "low_floor") tags.push("低楼层");
  if (p.houseType === "bungalow") tags.push("平房");
  if (p.houseType === "old_community") tags.push("老旧小区");
  if (p.houseType === "basement") tags.push("地下半地下");
  if (p.hasElderly) tags.push("老人家庭");
  if (p.hasChildren) tags.push("儿童家庭");
  if (p.hasPets) tags.push("宠物家庭");
  if (p.hasFemale) tags.push("女性卫生");   // 女性成员 → 女性卫生用品（适用各年龄）
  if (p.hasPregnant) tags.push("孕产护理"); // 孕妇 → 产后/待产护理（不叠加经期物资）
  const st = p.specialTags ?? [];
  if (st.includes("戴眼镜")) tags.push("戴眼镜");
  if (st.includes("长期用药")) tags.push("慢病家庭");
  if (st.includes("行动辅助")) tags.push("行动不便");
  if (st.includes("视听辅助")) tags.push("视听辅助");
  if (st.includes("特殊饮食")) tags.push("特殊饮食");
  if (p.specialNeeds.includes("慢") || p.specialNeeds.includes("病")) { if (!tags.includes("慢病家庭")) tags.push("慢病家庭"); }
  if (p.specialNeeds.includes("行动") || p.specialNeeds.includes("不便")) { if (!tags.includes("行动不便")) tags.push("行动不便"); }
  return tags;
}

// 清单分组：应急背包（随身携带/穿戴）/ 家中常备（居家布置）
export type ListGroup = "bob" | "home";

export const LIST_GROUPS: { id: ListGroup; name: string; desc: string }[] = [
  { id: "bob", name: "应急背包", desc: "需要放进包里或随身穿戴、可带走的物品" },
  { id: "home", name: "家中常备", desc: "适合在家里布置、应对停水停电等居家灾害的物资" },
];

// 推荐任务模板（含推荐理由标签，理由仅在子页面展示）
export interface TaskTemplate {
  key: string;
  name: string;
  group: ListGroup;
  disaster: DisasterId | "general";
  gearId?: string; // 关联装备
  reasonTags: string[]; // 匹配理由标签
  detail?: string; // 品名/数量/关键细节的一句说明
  // 触发条件：满足任一 tag 即推荐；空数组表示通用必备
  requireTags?: FamilyTag[];
  // 可量化物资的目标数量（清单右侧显示，如 8/8 L）；检查/规划类任务不填
  target?: number;
  unit?: string;
  // 该物资装进应急背包的估算总重量（kg）；仅 bob 物资需要，已按其建议数量估算。
  weightKg?: number;
}

const TASK_TEMPLATES: TaskTemplate[] = [
  // 通用 BOB 必备
  { key: "backpack", weightKg: 1.2, name: "应急背包", group: "bob", disaster: "general", gearId: "backpack", reasonTags: ["通用必备"], target: 1, unit: "个", detail: "装下所有应急物资的背包本体，是 BOB 的骨架。容积按家庭人数与物资量选：单人约 20-30L，两人 30-45L，三口及以上 45-60L；选防泼水、背负舒适、可放床头/门口随手拎走的款式。" },
  { key: "water", weightKg: 8, name: "饮用水", group: "bob", disaster: "general", gearId: "water", reasonTags: ["通用必备"], detail: "背包只带随身应急水（每人 2 瓶），足够转移途中饮用；家庭大量储水看「家中常备 · 家中储水」。可搭配净水片/滤水吸管扩展水源。" },
  { key: "food", weightKg: 0.9, name: "食物", group: "bob", disaster: "general", gearId: "food", reasonTags: ["通用必备"], detail: "背包只带耐储存、好携带、高热量的应急口粮（压缩饼干、能量棒等）；家中常备种类更丰富，见「家中常备 · 家庭食物储备」。" },
  { key: "firstaid", weightKg: 0.6, name: "急救医疗包", group: "bob", disaster: "general", gearId: "firstaid", reasonTags: ["通用必备"], detail: "含碘伏棉签、无菌纱布、创可贴、弹性绷带、止血带、医用胶带、剪刀等，半年检查补充一次。" },
  { key: "flashlight", weightKg: 0.3, name: "手摇多功能手电筒（1 支）", group: "bob", disaster: "general", gearId: "flashlight", reasonTags: ["通用必备"], target: 1, unit: "支", detail: "选手摇/太阳能充电款，兼具照明、收音机与 USB 应急充电，无需依赖电池。" },
  { key: "battery", weightKg: 0.25, name: "充电宝 10000mAh（1 个）", group: "bob", disaster: "general", gearId: "battery", reasonTags: ["通用必备"], target: 1, unit: "个", detail: "另备常用型号电池若干；每 3 个月充满一次保持电量。" },
  { key: "whistle", weightKg: 0.03, name: "高分贝求救哨（1 个）", group: "bob", disaster: "general", reasonTags: ["通用必备"], target: 1, unit: "个", detail: "被困时省力呼救；可再加反光贴或头灯，便于夜间被发现。" },
  { key: "radio", weightKg: 0.35, name: "手摇发电应急收音机（1 台）", group: "bob", disaster: "general", gearId: "radio", reasonTags: ["通用必备"], target: 1, unit: "台", detail: "断网断电时接收官方预警与转移信息，选带手电与充电功能款。" },
  // 通用 BOB 扩展（进阶重装：借鉴户外 BOB 清单，重叠以国家版为准）
  { key: "firestarter", weightKg: 0.15, name: "取火套装（打火机+防水火柴+求生镜）", group: "bob", disaster: "general", gearId: "firestarter", reasonTags: ["通用必备", "取火生火"], detail: "防风打火机 2 个 + 防水火柴 1 盒 + 求生镜 1 个；取火、生火、反光求救多重保障，快取放腰封。" },
  { key: "toolset", weightKg: 0.9, name: "多功能工具组（钳/破窗/伞绳/胶带）", group: "bob", disaster: "general", gearId: "toolset", reasonTags: ["通用必备", "工具装备"], detail: "多功能钳/战术钳、破窗器、5m 伞绳、大力胶带、折叠工兵铲；切割、破拆、固定、自救通用。" },
  { key: "waterproof", weightKg: 0.2, name: "防水收纳（密封袋+垃圾袋）", group: "bob", disaster: "general", gearId: "waterproof", reasonTags: ["通用必备", "防潮收纳"], detail: "干粮、药品、数码、证件全部套防水袋双层防潮；垃圾袋兼作雨衣、储水、防潮多用途。" },
  { key: "docsmoney", weightKg: 0.3, name: "证件现金 + 备用手机", group: "bob", disaster: "general", gearId: "docsmoney", reasonTags: ["通用必备", "身份保障"], detail: "身份证/银行卡复印件、少量现金（零钞+整钞）、备用手机贴身存放，断网断电时保命保通讯。" },
  { key: "hygienekit", weightKg: 0.5, name: "洗漱清洁包（牙具/香皂/纸巾/口罩）", group: "bob", disaster: "general", gearId: "hygienekit", reasonTags: ["通用必备", "卫生清洁"], detail: "旅行装牙刷牙膏、香皂、纸巾、免洗洗手液、压缩毛巾、医用/KN95 口罩；避难场所卫生条件差，防病防感染。" },
  { key: "clothing", weightKg: 1.2, name: "换洗衣物 + 雨披", group: "bob", disaster: "general", gearId: "clothing", reasonTags: ["通用必备", "保暖防雨"], detail: "速干衣裤 1 套、速干袜、一次性内裤/袜、加厚雨披；保持干燥保暖，失温比饥饿更快致命。" },
  { key: "sleepgear", weightKg: 1.8, name: "睡袋寝具 + 保温毯", group: "bob", disaster: "general", gearId: "sleepgear", reasonTags: ["夜间户外", "保暖过夜"], detail: "压缩睡袋、卷装防潮垫、应急保温毯 2 张；需在户外过夜或转移安置时防失温，较重按需携带。" },
  { key: "cookset", weightKg: 1.0, name: "炊具组（锅/炉头/餐具/水壶）", group: "bob", disaster: "general", gearId: "cookset", reasonTags: ["长期避险", "热食加热"], detail: "折叠炊具锅+炉头、叉勺餐具、不锈钢/软水壶；5-7 天长期避险可热食烧水，短期避险可不带以减重。" },
  // 高层住宅 · 火灾
  { key: "smokemask", weightKg: 0.2, name: "N95 防烟逃生面罩", group: "bob", disaster: "fire", gearId: "smokemask", reasonTags: ["高层住宅", "厨房火灾风险"], requireTags: ["高层住宅"], detail: "每位家庭成员 1 个，过滤一氧化碳等有毒烟气，放床头易取处，认准消防认证与有效期。" },
  { key: "checkstair", name: "清理并检查消防通道畅通", group: "home", disaster: "fire", reasonTags: ["高层住宅"], requireTags: ["高层住宅"] },
  // 老旧小区 · 火灾
  { key: "extinguisher", name: "A类干粉灭火器（1kg）", group: "home", disaster: "fire", gearId: "extinguisher", reasonTags: ["老旧小区", "电路火灾风险"], requireTags: ["老旧小区"], detail: "厨房或玄关放 1 具，适用固体/油/电起火；记住「提、拔、握、压」，每月看压力表在绿区。" },
  { key: "checkwire", name: "检查并更换老化电路 / 插排", group: "home", disaster: "fire", reasonTags: ["老旧小区"], requireTags: ["老旧小区"] },
  // 老人家庭
  { key: "elderkit", weightKg: 0.3, name: "常用药盒（含病历卡）", group: "bob", disaster: "general", gearId: "elderkit", reasonTags: ["老人家庭", "慢性病需求"], requireTags: ["老人家庭"] },
  { key: "elderplan", name: "制定老人协助撤离路线卡", group: "home", disaster: "general", reasonTags: ["老人家庭", "行动不便"], requireTags: ["老人家庭", "行动不便"] },
  // 儿童家庭
  { key: "kidbag", weightKg: 0.8, name: "儿童应急包（身份卡+安抚物）", group: "bob", disaster: "general", gearId: "kidbag", reasonTags: ["儿童家庭"], requireTags: ["儿童家庭"] },
  { key: "kidcall", name: "与孩子约定家庭暗号 / 呼救词", group: "home", disaster: "general", reasonTags: ["儿童家庭"], requireTags: ["儿童家庭"] },
  // 宠物家庭
  { key: "petkit", weightKg: 1.2, name: "宠物应急包（粮+水+牵引绳）", group: "bob", disaster: "general", gearId: "petkit", reasonTags: ["宠物家庭"], requireTags: ["宠物家庭"] },
  // 慢病
  { key: "chronicmed", weightKg: 0.2, name: "慢性病常用药（≥1 周量）", group: "bob", disaster: "general", gearId: "elderkit", reasonTags: ["慢病家庭", "慢性病需求"], requireTags: ["慢病家庭"] },
  // 燃气泄漏（通用常备）
  { key: "gasalarm", name: "插电式燃气泄漏报警器", group: "home", disaster: "gas", gearId: "gasalarm", reasonTags: ["通用必备", "燃气安全"], detail: "灶台上方 30cm 或燃气表附近安装 1 个，声光报警；有条件选带自动关阀的套装，定期按测试键。" },
  { key: "gascheck", name: "更换金属波纹燃气软管", group: "home", disaster: "gas", reasonTags: ["通用必备", "燃气安全"], detail: "用不锈钢波纹软管替换老化橡胶管，一般每 18 个月检查、到期更换，两端卡箍拧紧。" },
  // 入室抢劫（通用治安）
  { key: "doorlock", name: "C级锁芯 / 加厚防撬门链", group: "home", disaster: "burglary", gearId: "doorguard", reasonTags: ["治安防护"], detail: "入户门升级 C 级（超 B 级）锁芯，夜间加挂防撬门链；一楼/出租屋更需加强。" },
  { key: "alarm", name: "门窗磁感报警器（120dB）", group: "home", disaster: "burglary", gearId: "doorguard", reasonTags: ["治安防护"], detail: "门窗各贴 1 个，开启即触发高分贝报警，免布线、电池供电，定期更换电池。" },
  // 洪水 / 涉水防护
  { key: "floodshoes", weightKg: 0.8, name: "涉水防护鞋（雨靴 / 包脚运动鞋）", group: "bob", disaster: "flood", gearId: "floodshoes", reasonTags: ["涉水安全"], detail: "每人 1 双能包裹全脚的雨靴或结实运动鞋；洪水中切勿穿拖鞋、洞洞鞋，避免被水下杂物划伤或被水流冲脱。" },
  { key: "floodsandbag", name: "防洪沙袋 / 挡水板（门口封堵）", group: "home", disaster: "flood", reasonTags: ["涉水安全"], target: 4, unit: "个", detail: "低层/临河住户在门口、车库口备沙袋或吸水膨胀袋，水位上涨前沿门缝码放挡水，减缓进水速度。" },
  // 地震 · 避震与被埋自救
  { key: "eqwhistle", weightKg: 0.03, name: "应急救生哨（挂身/挂包）", group: "bob", disaster: "earthquake", gearId: "eqwhistle", reasonTags: ["地震自救"], target: 1, unit: "个", detail: "被埋压时用哨声求救比喊叫更省力、传得更远；固定在背包肩带或随身衣物上，人手一个。" },
  { key: "eqhelmet", weightKg: 0.5, name: "防砸头套 / 应急安全帽", group: "bob", disaster: "earthquake", gearId: "eqhelmet", reasonTags: ["地震自救"], target: 1, unit: "顶", detail: "地震时护住头颈、抵挡坠物；可选可折叠安全帽或防砸头套，床头、门口各放一个方便随手取用。" },
  // 台风 · 防风与封窗
  { key: "typhoontape", name: "封窗胶带（宽幅防爆膜胶带）", group: "home", disaster: "typhoon", reasonTags: ["台风防护"], target: 1, unit: "卷", detail: "台风来临前在玻璃内侧贴“米”字形胶带，或加贴防爆膜，减少玻璃震碎飞溅伤人。" },
  { key: "typhoonclamp", name: "门窗加固卡扣 / 防风绳", group: "home", disaster: "typhoon", reasonTags: ["台风防护"], target: 2, unit: "套", detail: "加固易被吹开的窗户、阳台门与户外物件；把花盆、晾衣杆等收进室内或用绳固定，避免坠落伤人。" },

  // ——— 家中常备 · 停水停电与居家应对（通用，带不走） ———
  { key: "waterstore", name: "家中储水", group: "home", disaster: "general", reasonTags: ["通用必备", "停水应对"], detail: "按 3L/人/天×3 天储备，饮用与生活用水分开算；预报停水或灾害临近时提前接满。选带盖避光容器，定期换水防变质。" },
  { key: "homefood", name: "家庭食物储备", group: "home", disaster: "general", gearId: "homefood", reasonTags: ["通用必备", "停水应对"], detail: "家中常备种类更丰富：罐头、自热饭、方便面米面、常温奶、耐储零食等，兼顾口味与营养，按每人 3 天以上备足并定期轮换。" },
  { key: "toilet", name: "应急如厕包（马桶袋+凝固粉/猫砂）", group: "home", disaster: "general", reasonTags: ["通用必备", "停水应对"], target: 1, unit: "套", detail: "停水时套在马桶或坐便椅上，凝固粉或猫砂吸附后打结丢弃，减少异味与卫生风险。" },
  { key: "solar", name: "太阳能充电板 / 便携发电装置", group: "home", disaster: "general", reasonTags: ["通用必备", "停电应对"], target: 1, unit: "台", detail: "长时间停电时给手机、灯具、收音机补电；选带 USB 输出的折叠款，晴天摊开即可充电。" },
  { key: "firetblanket", weightKg: 0.6, name: "灭火毯（1m×1m）", group: "bob", disaster: "fire", gearId: "firetblanket", reasonTags: ["通用必备", "厨房安全"], target: 1, unit: "块", detail: "厨房或床边挂 1 块，初期油锅起火直接覆盖隔氧灭火，也可披身逃生，比灭火器更易上手。" },
  { key: "candlelight", name: "应急照明（营地灯 / 备用蜡烛+打火机）", group: "home", disaster: "general", reasonTags: ["通用必备", "停电应对"], target: 2, unit: "个", detail: "每个主要房间放 1 个可充电营地灯；蜡烛作为最后备用，使用时远离窗帘等易燃物并保持通风。" },

  // ——— 特别准备标签驱动 ———
  { key: "spareglasses", weightKg: 0.12, name: "高度近视应急包（备用眼镜 / 隐形 / 防丢绳）", group: "bob", disaster: "general", gearId: "spareglasses", reasonTags: ["戴眼镜"], requireTags: ["戴眼镜"], target: 1, unit: "副", detail: "把旧的一副度数够用的眼镜、隐形眼镜及护理液、眼镜防丢绳放在一起；逃生或救援时看得清、奔跑涉水不易丢，才更安全。对高度近视者尤其关键。" },
  { key: "hygiene", weightKg: 0.5, name: "女性卫生用品（1 周量）", group: "bob", disaster: "general", gearId: "hygiene", reasonTags: ["女性卫生"], requireTags: ["女性卫生"], target: 1, unit: "包", detail: "按家中女性成员需要备一周量：经期用卫生巾/月经杯、失禁护理用成人护理垫、私处清洁湿巾等；适用各年龄女性，密封防潮，避难场所往往难以及时补给。" },
  { key: "maternitycare", weightKg: 1.0, name: "产后 / 待产护理包（产褥垫+产妇卫生巾+母婴证件）", group: "bob", disaster: "general", gearId: "maternitycare", reasonTags: ["孕产护理"], requireTags: ["孕产护理"], target: 1, unit: "套", detail: "含产褥垫/成人护理垫、产妇专用加长卫生巾（恶露期用）、母子健康手册与证件复印件；孕晚期一并备好待产与新生儿基础用品，以防灾时临产。" },
  { key: "hearingaid", name: "助听器 / 助行器备用电池及配件", group: "bob", disaster: "general", reasonTags: ["视听辅助", "行动不便"], requireTags: ["视听辅助", "行动不便"], target: 1, unit: "套", detail: "备好助听器电池、眼镜绳、拐杖胶垫等易损配件；辅具失效会直接影响撤离。" },
  { key: "specialfood", name: "特殊饮食储备（无麸质 / 低敏 / 婴幼儿）", group: "home", disaster: "general", reasonTags: ["特殊饮食"], requireTags: ["特殊饮食"], target: 3, unit: "份", detail: "对饮食有特殊要求的成员单独备足 3 天量，避难物资多为普通食品，未必适合。" },
];

export function matchTasks(tags: FamilyTag[], source: TaskTemplate[] = TASK_TEMPLATES): TaskTemplate[] {
  return source.filter((t) => {
    if (!t.requireTags || t.requireTags.length === 0) return true;
    return t.requireTags.some((rt) => tags.includes(rt));
  });
}

// 风险评估文案
export function riskSummary(p: FamilyProfile, tags: FamilyTag[]): string {
  const parts: string[] = [];
  if (tags.includes("高层住宅")) parts.push("高层疏散路线较长，需重点关注火灾防烟与避难层");
  if (tags.includes("老旧小区")) parts.push("建筑与电路隐患较多，需加强火灾与结构安全检查");
  if (tags.includes("老人家庭")) parts.push("家中有老人，需准备药品并制定协助撤离方案");
  if (tags.includes("儿童家庭")) parts.push("家中有儿童，需专属应急包与逃生教育");
  if (tags.includes("宠物家庭")) parts.push("家中有宠物，需准备专属应急物资");
  if (parts.length === 0) parts.push("整体风险较低，建议完成基础备灾清单以进一步提升安全等级");
  return `根据您在${p.city || "所在城市"}、${HOUSE_TYPES.find((h) => h.id === p.houseType)?.name || "住宅"}、${p.members} 口之家的信息：` + parts.join("；") + "。";
}

// 把省/市名精简成「北京 / 成都 / 杭州」这样的短前缀（用于一句话总结）
function shortLocation(p: FamilyProfile): string {
  const raw = p.cityName || p.province || "";
  if (!raw) return "";
  return raw.replace(/(省|市|自治区|特别行政区|自治州)$/g, "");
}

// 家庭结构短描述（不含地点）
function householdDescriptor(p: FamilyProfile): string {
  const big = p.members >= 5;
  const three = p.hasElderly && p.hasChildren;
  if (three) return big ? "三世同堂大家庭" : "三世同堂之家";
  if (p.hasElderly) {
    if (p.members <= 1) return "独居长者";
    if (p.members === 2) return "老两口";
    return big ? "多口养老家庭" : "有老人的家庭";
  }
  if (p.hasChildren) {
    if (p.members >= 4 || big) return "多娃家庭";
    return "带娃小家庭";
  }
  if (p.hasPets) {
    if (p.members <= 1) return "独居铲屎官";
    if (p.members === 2) return "两口毛孩家庭";
    return "带宠家庭";
  }
  if (p.members <= 1) return "独居青年";
  if (p.members === 2) return "两口之家";
  if (p.members === 3) return "三口之家";
  if (p.members === 4) return "四口之家";
  return big ? "多口大家庭" : `${p.members} 口之家`;
}

// 一句话总结：地点 + 家庭结构，尽量像「北京独居铲屎官」「成都三口之家」这样自然。
// 用在首页顶部标签、背包顶部、以及任何需要展示这句总结的地方。
export function profileSummary(p: FamilyProfile | null): string {
  if (!p) return "通用画像 · 待完善";
  const loc = shortLocation(p);
  const desc = householdDescriptor(p);
  return loc ? `${loc}${desc}` : desc;
}

// 与画像最相关的灾害集合（用于首页小游戏出题加权：相关+通用常识≥7 成）。
// general 永远算“相关常识”，另按住宅/家庭特征叠加高相关灾害。
export function relevantDisasters(p: FamilyProfile | null): (DisasterId | "general")[] {
  const set = new Set<DisasterId | "general">(["general", "fire", "gas"]); // 家庭最常见事故
  if (!p) return [...set];
  if (p.houseType === "high_rise") set.add("typhoon"); // 高层受台风影响明显
  if (p.houseType === "old_community") set.add("burglary"); // 老旧小区治安
  if (p.houseType === "basement" || p.houseType === "low_floor") set.add("flood"); // 低处易进水
  (p.concernedDisasters ?? []).forEach((d) => set.add(d)); // 用户主动在意的灾害
  return [...set];
}

// 全部内置任务模板（供后台编辑读取默认值）
export const TASK_TEMPLATES_ALL: TaskTemplate[] = TASK_TEMPLATES;

// 通用必备清单（任何家庭/场景都需要，requireTags 为空）
export function commonEssentials(source: TaskTemplate[] = TASK_TEMPLATES): TaskTemplate[] {
  // 地震/洪水/台风为地域相关物资，不进「人人常备」默认清单；仅在本地有风险或用户「就要加」时出现。
  const GEO = ["earthquake", "flood", "typhoon"];
  return source.filter(
    (t) => (!t.requireTags || t.requireTags.length === 0) && !GEO.includes(t.disaster),
  );
}
