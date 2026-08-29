import type { DisasterId } from "./domain";

// 装备分类
export type GearCategory = "防护装备" | "应急物资" | "工具" | "食品饮水" | "药品";

export interface GearReview {
  user: string;
  rating: number; // 1-5
  text: string;
}

export interface GearVariant {
  id: string;
  name: string;
  spec: string; // 基本参数
  rating: number;
  price: string; // 模拟价格，仅展示
}

export interface GearItem {
  id: string;
  name: string;
  nameEn: string;
  icon: string; // lucide
  category: GearCategory;
  disasters: (DisasterId | "general")[];
  scene: string; // 适用场景
  why: string; // 为什么需要
  usage: string; // 使用说明
  buyUrl: string; // 外链购买（模拟，不做真实购买）
  relatedKnowledge?: string; // knowledge id
  rating?: number; // 模拟评分 1-5
  matchTags?: string[]; // 用于与家庭标签匹配度计算
  pros?: string[]; // 推荐理由
  cons?: string[]; // 不推荐理由
  reviews?: GearReview[]; // 模拟评论
  variants?: GearVariant[]; // 模拟商品瀑布流
}

export interface KnowledgeItem {
  id: string;
  title: string;
  disasters: (DisasterId | "general")[];
  brief: string;
  content: string;
  relatedGear?: string[]; // gear ids
}

export const GEAR: GearItem[] = [
  {
    id: "backpack", name: "应急背包", nameEn: "GO BAG", icon: "backpack", category: "应急物资",
    disasters: ["general"], scene: "装下全部应急物资、随手拎走的 BOB 本体",
    why: "背包是 BOB 的骨架，容积不合适会导致物资装不下或背负吃力。",
    usage: "按家庭人数与物资量选容积：单人 20-30L、两人 30-45L、三口及以上 45-60L；选防泼水、背负舒适，放床头/门口随手可取。",
    buyUrl: "",
  },
  {
    id: "water", name: "饮用水", nameEn: "WATER", icon: "droplet", category: "食品饮水",
    disasters: ["general"], scene: "所有灾害断水时的基本生存需求",
    why: "人体缺水 3 天即危及生命，应急场景常伴随断水。",
    usage: "背包只带随身应急水（每人 2 瓶）；家庭大量储水按每人每天约 3 升、备 3 天，放在家中并定期轮换。",
    buyUrl: "https://s.taobao.com/search?q=应急饮用水",
    relatedKnowledge: "k-water",
  },
  {
    id: "food", name: "食物储备", nameEn: "FOOD", icon: "package", category: "食品饮水",
    disasters: ["general"], scene: "灾后短期无法获取食物时",
    why: "维持体力与情绪稳定，儿童老人尤其需要。",
    usage: "选择压缩饼干、罐头、能量棒等免烹饪、长保质期食品，备足 3 天。",
    buyUrl: "https://s.taobao.com/search?q=应急食品储备",
  },
  {
    id: "homefood", name: "家庭食物储备", nameEn: "HOME FOOD", icon: "package", category: "食品饮水",
    disasters: ["general"], scene: "家中长期囤放、无需明火即可食用",
    why: "停水停电时也能吃上热食，覆盖数日热量需求。",
    usage: "自热米饭、罐头等常温存放，定期检查保质期并轮换。",
    buyUrl: "",
  },
  {
    id: "waterstore", name: "家中储水", nameEn: "WATER STORE", icon: "droplet", category: "食品饮水",
    disasters: ["general"], scene: "家庭大量储备饮用与生活用水",
    why: "断水时覆盖全家数日饮用、清洁与冲厕需求。",
    usage: "按每人每天约 3 升备 3 天，折叠桶/桶装水放家中定期轮换。",
    buyUrl: "",
  },
  {
    id: "firstaid", name: "急救包", nameEn: "FIRST AID KIT", icon: "cross", category: "药品",
    disasters: ["general"], scene: "受伤、擦伤、止血、包扎",
    why: "灾害中外伤高发，及时处理可避免感染与失血。",
    usage: "含纱布、创可贴、消毒棉、止血带、剪刀；定期检查并补充。",
    buyUrl: "https://s.taobao.com/search?q=家用急救包",
    relatedKnowledge: "k-firstaid",
  },
  {
    id: "flashlight", name: "手电筒", nameEn: "FLASHLIGHT", icon: "flashlight", category: "工具",
    disasters: ["general"], scene: "停电、夜间撤离、被困照明",
    why: "灾害常伴随停电，光源是撤离与求救的关键。",
    usage: "优先选手摇/充电式，避免依赖电池；放在床头与应急包各一支。",
    buyUrl: "https://s.taobao.com/search?q=应急手电筒",
  },
  {
    id: "battery", name: "备用电池", nameEn: "BATTERY", icon: "battery", category: "工具",
    disasters: ["general"], scene: "为手电、收音机、手机供电",
    why: "长时间停电时维持通讯与照明设备运转。",
    usage: "准备充电宝与常用型号电池；定期检查电量。",
    buyUrl: "https://s.taobao.com/search?q=应急备用电池",
  },
  {
    id: "radio", name: "应急收音机", nameEn: "RADIO", icon: "radio", category: "工具",
    disasters: ["general"], scene: "断网断电时接收预警与救援信息",
    why: "灾害中网络常中断，收音机是可靠的信息来源。",
    usage: "选手摇发电款，可兼充电功能；熟悉本地应急频率。",
    buyUrl: "https://s.taobao.com/search?q=手摇应急收音机",
  },
  {
    id: "smokemask", name: "防烟面罩", nameEn: "SMOKE MASK", icon: "shield", category: "防护装备",
    disasters: ["fire"], scene: "高层火灾浓烟中撤离",
    why: "火灾致死多因浓烟窒息，面罩可争取撤离时间。",
    usage: "撤离时佩戴，配合低姿前进；放在卧室易取处。",
    buyUrl: "https://s.taobao.com/search?q=消防防烟面罩",
    relatedKnowledge: "k-fire",
  },
  {
    id: "extinguisher", name: "灭火器", nameEn: "EXTINGUISHER", icon: "flame-kindling", category: "工具",
    disasters: ["fire"], scene: "初起火灾的快速扑救",
    why: "老旧小区电路火灾风险高，初期扑救最有效。",
    usage: "记住「提拔握压」四步；定期检查压力表在绿区。",
    buyUrl: "https://s.taobao.com/search?q=家用灭火器",
    relatedKnowledge: "k-fire",
    rating: 4.7, matchTags: ["老旧小区", "高层住宅"],
    pros: ["初期火灾最有效", "家庭必备、体积小", "老旧小区强烈推荐"],
    cons: ["需定期检查压力，过期需更换", "干粉型喷后清理较麻烦"],
    reviews: [
      { user: "备灾老王", rating: 5, text: "厨房必备，油锅起火按住就灭了。" },
      { user: "高层住户L", rating: 4, text: "分量合适，就是要记得每年看压力表。" },
    ],
    variants: [
      { id: "ext-dry", name: "干粉灭火器 1kg", spec: "ABC 干粉 · 适用油/电/固体", rating: 4.6, price: "¥ 39" },
      { id: "ext-water", name: "水基灭火器 3L", spec: "水基 · 喷后易清理", rating: 4.8, price: "¥ 89" },
      { id: "ext-spray", name: "便携灭火喷雾", spec: "600ml · 车载/厨房", rating: 4.5, price: "¥ 29" },
    ],
  },
  {
    id: "kidbag", name: "儿童应急包", nameEn: "KIDS KIT", icon: "baby", category: "应急物资",
    disasters: ["general"], scene: "有儿童家庭撤离与安抚",
    why: "儿童逃生能力弱，需要专属物资与安抚用品。",
    usage: "含身份卡、常用药、零食、安抚玩具、备用衣物。",
    buyUrl: "https://s.taobao.com/search?q=儿童应急包",
  },
  {
    id: "elderkit", name: "常用药品包", nameEn: "MED KIT", icon: "pill", category: "药品",
    disasters: ["general"], scene: "有老人/慢病家庭",
    why: "长期服药者一旦断药风险极高，需额外储备。",
    usage: "按医嘱储备至少一周常用药，附用药清单与病历卡。",
    buyUrl: "https://s.taobao.com/search?q=常备药盒",
  },
  {
    id: "petkit", name: "宠物应急物资", nameEn: "PET KIT", icon: "paw-print", category: "应急物资",
    disasters: ["general"], scene: "有宠物家庭撤离",
    why: "宠物无法自主撤离，需专属食水与牵引装备。",
    usage: "含宠物粮、水、牵引绳/航空箱、疫苗本。",
    buyUrl: "https://s.taobao.com/search?q=宠物应急包",
    rating: 4.4, matchTags: ["宠物家庭"],
  },
  {
    id: "gasalarm", name: "燃气泄漏报警器", nameEn: "GAS ALARM", icon: "flame-kindling", category: "工具",
    disasters: ["gas"], scene: "厨房 / 燃气热水器附近",
    why: "燃气泄漏无色难察觉，报警器能在危险浓度前预警。",
    usage: "安装在灶台上方或燃气设备附近，接通电源，定期按测试键。",
    buyUrl: "https://s.taobao.com/search?q=燃气泄漏报警器",
    rating: 4.6, matchTags: ["老旧小区"],
    pros: ["提前预警、避免爆燃", "老旧小区尤其推荐"],
    cons: ["需接电或定期换电池", "劣质产品误报较多"],
    reviews: [
      { user: "租房小陈", rating: 5, text: "半夜误开灶报警了，救命装备。" },
      { user: "顾家的人", rating: 4, text: "灵敏度不错，选带自动切断阀的更省心。" },
    ],
    variants: [
      { id: "gas-plug", name: "插电式燃气报警器", spec: "220V · 声光报警", rating: 4.5, price: "¥ 49" },
      { id: "gas-valve", name: "报警+自动关阀套装", spec: "含机械手 · 自动切断", rating: 4.7, price: "¥ 199" },
    ],
  },
  {
    id: "doorguard", name: "门窗报警器 / 门链", nameEn: "DOOR GUARD", icon: "shield-alert", category: "防护装备",
    disasters: ["burglary"], scene: "入户门 / 一楼窗户 / 出租屋",
    why: "入室时第一时间发出声响并争取反应时间。",
    usage: "贴装于门窗接缝处，开启时触发即报警；夜间加挂门链。",
    buyUrl: "https://s.taobao.com/search?q=门窗报警器",
    rating: 4.3, matchTags: ["老旧小区"],
    pros: ["安装简单、无需布线", "出租屋友好"],
    cons: ["电池款需定期更换", "无法替代正规门锁"],
    reviews: [
      { user: "独居女生", rating: 5, text: "睡觉更安心了，声音够大。" },
    ],
    variants: [
      { id: "door-alarm", name: "门窗磁感报警器", spec: "120dB · 电池款", rating: 4.3, price: "¥ 19" },
      { id: "door-chain", name: "加厚防撬门链", spec: "锌合金 · 免打孔", rating: 4.4, price: "¥ 25" },
    ],
  },
  {
    id: "quakehelmet", name: "防砸头盔", nameEn: "QUAKE HELMET", icon: "shield", category: "防护装备",
    disasters: ["earthquake"], scene: "地震时保护头部、躲避坠物",
    why: "地震伤亡多因坠物砸伤头部，头盔能显著降低致命风险。",
    usage: "放在床头与门口易取处，摇晃时立即戴上、躲到承重墙角或坚固家具旁。",
    buyUrl: "",
  },
  {
    id: "quakewhistle", name: "应急求生哨", nameEn: "SURVIVAL WHISTLE", icon: "bell", category: "工具",
    disasters: ["earthquake"], scene: "被困废墟时发出求救信号",
    why: "被压埋时喊叫极耗体力，哨声传得更远、更省力，是黄金救援期的关键。",
    usage: "随身挂在钥匙/背包上，被困时间歇性吹响以指引救援。",
    buyUrl: "",
  },
  {
    id: "floodvest", name: "救生衣 / 浮力装备", nameEn: "LIFE VEST", icon: "life-buoy", category: "防护装备",
    disasters: ["flood"], scene: "洪水上涨、涉水撤离",
    why: "洪水中失足或被冲走时，浮力装备是保命关键。",
    usage: "每位家庭成员各备一件，撤离前穿好；儿童选专用尺寸。",
    buyUrl: "",
  },
  {
    id: "floodbag", name: "防水收纳袋", nameEn: "DRY BAG", icon: "package", category: "工具",
    disasters: ["flood"], scene: "洪水中保护证件、手机、现金",
    why: "证件与通讯设备一旦泡水，撤离与灾后重建都会受阻。",
    usage: "把身份证、现金、手机、充电宝密封其中，撤离时随身携带。",
    buyUrl: "",
  },
  {
    id: "windtape", name: "窗户加固贴膜 / 胶带", nameEn: "WINDOW TAPE", icon: "shield", category: "防护装备",
    disasters: ["typhoon"], scene: "台风前加固门窗玻璃",
    why: "台风强风易吹碎玻璃，碎片飞溅是主要致伤原因。",
    usage: "台风来临前给玻璃贴防爆膜，并用胶带做米字加固；远离窗边活动。",
    buyUrl: "",
  },
  {
    id: "raincoat", name: "防风雨衣裤", nameEn: "RAIN GEAR", icon: "cloud-rain", category: "防护装备",
    disasters: ["typhoon"], scene: "台风天涉水查看 / 撤离",
    why: "普通雨伞在强风中无用，分体雨衣裤更能防风防雨。",
    usage: "每位需外出的成员各备一套；撤离前穿好，避免失温。",
    buyUrl: "",
  },
];

export function getGear(id: string): GearItem | undefined {
  return GEAR.find((g) => g.id === id);
}

// 部分物资在商城有单品、但未在 GEAR 表建独立详情条目；
// 这里给它们一个中文兜底名，避免筛选/卡片上直接暴露英文 gearId。
const GEAR_NAME_FALLBACK: Record<string, string> = {
  firestarter: "取火套装",
  toolset: "多功能工具组",
  waterproof: "防水收纳",
  docsmoney: "证件现金包",
  hygienekit: "洗漱清洁包",
  clothing: "换洗衣物 / 雨披",
  sleepgear: "睡袋寝具 / 保温毯",
  cookset: "炊具组",
  floodshoes: "涉水防护鞋",
  eqwhistle: "应急救生哨",
  eqhelmet: "防砸头套 / 安全帽",
  firetblanket: "灭火毯",
  spareglasses: "备用眼镜包",
  hygiene: "女性卫生用品",
  maternitycare: "产后 / 待产护理包",
  whistle: "求救哨",
};

// 物资中文显示名：优先 GEAR 表名称，其次兜底中文名，始终不回退到英文 gearId。
export function gearDisplayName(gearId: string): string {
  return getGear(gearId)?.name ?? GEAR_NAME_FALLBACK[gearId] ?? "应急物资";
}

export function gearByDisaster(d: DisasterId): GearItem[] {
  return GEAR.filter((g) => g.disasters.includes(d) || g.disasters.includes("general"));
}

// 与家庭标签的匹配度（0-100），供社区「高匹配」排序与商品详情展示
export function matchScore(g: GearItem, tags: string[]): number {
  if (!g.matchTags || g.matchTags.length === 0) return 60; // 通用基线
  const hit = g.matchTags.filter((t) => tags.includes(t)).length;
  return Math.min(100, 60 + hit * 20);
}

export type GearSort = "match" | "rating" | "random";

export function sortGear(list: GearItem[], sort: GearSort, tags: string[]): GearItem[] {
  const arr = [...list];
  if (sort === "match") return arr.sort((a, b) => matchScore(b, tags) - matchScore(a, tags));
  if (sort === "rating") return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return arr.sort(() => Math.random() - 0.5);
}

export const KNOWLEDGE: KnowledgeItem[] = [
  {
    id: "k-fire", title: "火灾逃生知识", disasters: ["fire"],
    brief: "低姿逃生、湿毛巾捂口鼻、切勿乘电梯。",
    content: "火灾时浓烟上升，应低姿沿楼梯撤离，用湿毛巾捂住口鼻。触摸门把手判断门外温度，高温则另寻出路。切勿乘坐电梯，防止断电被困。",
    relatedGear: ["smokemask", "extinguisher"],
  },
  {
    id: "k-water", title: "应急饮水储备", disasters: ["general"],
    brief: "每人每天 3 升，储备 3 天。",
    content: "断水时可就近取河湖、雨水等，务必用净水片、滤水吸管或煮沸后再饮用；瓶装水定期检查保质期并轮换。",
    relatedGear: ["water"],
  },
  {
    id: "k-firstaid", title: "基础急救要点", disasters: ["general"],
    brief: "止血、包扎、固定、呼救。",
    content: "外伤先直接压迫止血，再清洁包扎；骨折疑似部位就地固定勿随意搬动；意识不清立即拨打 120 并保持气道通畅。",
    relatedGear: ["firstaid"],
  },
];

export function getKnowledge(id: string): KnowledgeItem | undefined {
  return KNOWLEDGE.find((k) => k.id === id);
}
