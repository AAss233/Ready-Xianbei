// 细分单品数据（全部为虚构品牌 / 演示数据，不指向任何真实商品）。
// 品牌用「甲乙丙丁牌」等虚构名；价格/销量/图片均为演示用途。
// 物资详情页「去购买」推评分最高(score)的一个单品；商品详情页下滑展示同类其余单品；社区页聚合展示全部。

import { getSubItems, scaledRecommended, scaledBaseline } from "@/lib/prep/subitems";

export interface Product {
  id: string;
  gearId: string;
  name: string;
  brand: string;
  spec: string;
  price: number;   // 单件价（按最小售卖单位：瓶/块/条/盒/份…）
  sales: number;
  rating: number;
  score: number;
  emoji: string;
  tags: string[];
  desc: string;
  unit?: string;   // 最小售卖单位（瓶/块/条/盒/份…）；缺省视为「件」
  subKey?: string; // 对应二级清单里的代表子物品 key，一键打包据此按建议/基线量×人数配量
}

// 虚构用户评价（演示）
export interface Review {
  user: string;
  rating: number;   // 1-5
  likes: number;    // 点赞数
  text: string;
}

export const PRODUCTS: Product[] = [
  // —— 应急背包 backpack ——
  { id: "p-bag-1", gearId: "backpack", name: "甲牌 战术应急双肩包 45L", brand: "甲牌·驮行", spec: "45L · 防泼水 · 多仓", price: 189.0, sales: 5200, rating: 4.8, score: 96, emoji: "🎒", tags: ["大容积", "背负舒适", "分仓清晰"], desc: "45L 大容积多分仓，防泼水面料、承重腰带减负，一家三口物资一包装下，放门口随手拎走。" },
  { id: "p-bag-2", gearId: "backpack", name: "乙牌 轻量应急背包 30L", brand: "乙牌·轻行", spec: "30L · 轻量 · 反光条", price: 99.0, sales: 6800, rating: 4.6, score: 90, emoji: "🎒", tags: ["性价比", "轻量"], desc: "30L 适合一到两人，自重轻、带反光条，日常应急两用，性价比高。" },
  { id: "p-bag-3", gearId: "backpack", name: "丙牌 基础应急包 20L", brand: "丙牌·简备", spec: "20L · 基础款", price: 49.0, sales: 4100, rating: 4.4, score: 82, emoji: "🎒", tags: ["低价", "单人够用"], desc: "20L 单人随身够用，结构简单价格亲民，先备起来最重要。" },

  // —— 饮用水 water ——
  { id: "p-water-1", gearId: "water", name: "甲牌 饮用天然水 550ml", brand: "甲牌·清源", spec: "550ml / 瓶 · 论瓶买", price: 1.9, unit: "瓶", subKey: "bottle", sales: 12800, rating: 4.9, score: 98, emoji: "💧", tags: ["论瓶买", "保质期长"], desc: "单瓶起买，按家庭人数配到刚好；独立瓶装便于分发与随身携带，保质期长便于轮换。" },
  { id: "p-water-2", gearId: "water", name: "乙牌 纯净水 555ml", brand: "乙牌·澄泉", spec: "555ml / 瓶 · 论瓶买", price: 1.6, unit: "瓶", subKey: "bottle", sales: 9600, rating: 4.8, score: 92, emoji: "💧", tags: ["高性价比", "论瓶买"], desc: "单瓶起买，口感清爽、瓶身结实耐压，适合应急随身携带。" },
  { id: "p-water-3", gearId: "water", name: "丙牌 矿泉水 570ml", brand: "丙牌·山岩", spec: "570ml / 瓶 · 论瓶买", price: 2.3, unit: "瓶", subKey: "bottle", sales: 5400, rating: 4.9, score: 88, emoji: "💧", tags: ["天然矿泉", "论瓶买"], desc: "单瓶起买，含天然矿物质，瓶盖密封性好不易渗漏。" },

  // —— 食物 food（背包高热量口粮）——
  { id: "p-food-1", gearId: "food", name: "甲牌 压缩饼干 108g", brand: "甲牌·耐储", spec: "108g / 包 · 论包买", price: 3.5, unit: "包", subKey: "biscuit", sales: 8700, rating: 4.8, score: 97, emoji: "🍪", tags: ["高热量", "论包买", "长保质期"], desc: "单包起买，按人数配到刚好；约 500 大卡，免烹饪开袋即食，背包应急口粮首选。" },
  { id: "p-food-2", gearId: "food", name: "乙牌 花生能量棒 51g", brand: "乙牌·补给", spec: "51g / 根 · 论根买", price: 3.2, unit: "根", subKey: "energybar", sales: 15200, rating: 4.9, score: 90, emoji: "🍫", tags: ["快速补能", "论根买"], desc: "单根起买，高热量夹心，随手一根快速补能，撤离途中即时补充体力。" },
  { id: "p-food-3", gearId: "food", name: "丙牌 冻干牛肉干 20g", brand: "丙牌·原野", spec: "20g / 包 · 论包买", price: 3.8, unit: "包", subKey: "nuts", sales: 3300, rating: 4.7, score: 82, emoji: "🥩", tags: ["高蛋白", "论包买"], desc: "单包起买，高蛋白高热量，独立小包装耐储存，补充蛋白与电解质。" },

  // —— 家庭食物储备 homefood ——
  { id: "p-hfood-1", gearId: "homefood", name: "甲牌 自热米饭 260g", brand: "甲牌·暖食", spec: "260g / 盒 · 论盒买", price: 13.9, unit: "盒", subKey: "selfheat", sales: 6600, rating: 4.7, score: 95, emoji: "🍚", tags: ["无需明火", "论盒买"], desc: "单盒起买，自带发热包加冷水即热食，无需燃气电力；停水停电也能吃上热饭。" },
  { id: "p-hfood-2", gearId: "homefood", name: "乙牌 午餐肉罐头 198g", brand: "乙牌·常储", spec: "198g / 罐 · 论罐买", price: 14.9, unit: "罐", subKey: "can", sales: 4800, rating: 4.8, score: 90, emoji: "🥫", tags: ["开盖即食", "论罐买"], desc: "单罐起买，开盖即食或加热食用，补充蛋白与热量，保质期长易囤放。" },

  // —— 家中储水 waterstore ——
  { id: "p-wstore-1", gearId: "waterstore", name: "甲牌 折叠储水桶 10L", brand: "甲牌·蓄水", spec: "10L 折叠款", price: 39.0, sales: 4200, rating: 4.7, score: 94, emoji: "🪣", tags: ["大容量", "可折叠"], desc: "食品级材质，带龙头易取水，不用时折叠省空间，家庭储备生活用水首选。" },
  { id: "p-wstore-2", gearId: "waterstore", name: "乙牌 桶装水 18.9L", brand: "乙牌·净源", spec: "18.9L×1 桶", price: 25.0, sales: 3100, rating: 4.6, score: 86, emoji: "🛢️", tags: ["大桶囤放"], desc: "大桶囤放家中，覆盖数日饮用与生活用水，性价比高。" },

  // —— 急救医疗包 firstaid ——
  { id: "p-aid-1", gearId: "firstaid", name: "甲牌 家庭急救包 30+ 件", brand: "甲牌·安护", spec: "含 30+ 件敷料", price: 128.0, sales: 5200, rating: 4.9, score: 96, emoji: "⛑️", tags: ["一应俱全", "便携收纳"], desc: "含碘伏棉签、纱布、绷带、止血带、剪刀、创可贴等 30 余件，分格收纳一目了然，家庭与背包通用。" },
  { id: "p-aid-2", gearId: "firstaid", name: "乙牌 户外急救包 便携款", brand: "乙牌·随行", spec: "含 20+ 件", price: 99.0, sales: 3100, rating: 4.7, score: 86, emoji: "⛑️", tags: ["轻便", "户外"], desc: "轻量化户外急救包，覆盖常见外伤处理，适合背包随身携带。" },

  // —— 手电 flashlight ——
  { id: "p-light-1", gearId: "flashlight", name: "甲牌 手摇多功能应急灯", brand: "甲牌·恒光", spec: "手摇+太阳能+USB", price: 69.0, sales: 7400, rating: 4.8, score: 95, emoji: "🔦", tags: ["手摇发电", "带收音机"], desc: "手摇/太阳能双充，兼具照明、收音机、USB 应急充电与报警，断电断网也能用。" },
  { id: "p-light-2", gearId: "flashlight", name: "乙牌 强光手电+电池套装", brand: "乙牌·远射", spec: "含充电电池×2", price: 49.0, sales: 6200, rating: 4.7, score: 84, emoji: "🔦", tags: ["强光", "远射"], desc: "高流明强光远射，多档调节，配可充电池长续航，夜间搜寻/求救好用。" },

  // —— 充电宝 battery ——
  { id: "p-batt-1", gearId: "battery", name: "甲牌 移动电源 10000mAh", brand: "甲牌·续能", spec: "10000mAh 双向快充", price: 89.0, sales: 21000, rating: 4.9, score: 96, emoji: "🔋", tags: ["快充", "轻薄"], desc: "大容量双向快充，轻薄耐用，应急给手机/收音机补电，定期充满保持电量。" },

  // —— 收音机 radio ——
  { id: "p-radio-1", gearId: "radio", name: "甲牌 手摇应急收音机", brand: "甲牌·声波", spec: "手摇+太阳能+照明", price: 138.0, sales: 4100, rating: 4.8, score: 94, emoji: "📻", tags: ["接收预警", "带手电"], desc: "手摇/太阳能供电，接收官方应急广播与预警，兼具手电与充电功能，断网断电时的信息生命线。" },

  // —— 火灾专属 ——
  { id: "p-smoke-1", gearId: "smokemask", name: "甲牌 消防防烟逃生面罩", brand: "甲牌·净烟", spec: "过滤式 · 30 分钟", price: 59.0, sales: 5600, rating: 4.8, score: 95, emoji: "😷", tags: ["防浓烟", "高层必备"], desc: "过滤有毒烟气，高层火灾撤离佩戴可争取宝贵逃生时间，放卧室易取处。" },
  { id: "p-ext-1", gearId: "extinguisher", name: "乙牌 家用水基灭火器 3L", brand: "乙牌·灭焰", spec: "水基 · 喷后易清理", price: 89.0, sales: 4300, rating: 4.8, score: 92, emoji: "🧯", tags: ["初期扑救", "易清理"], desc: "水基灭火剂适用油/电/固体初起火，喷后清理方便，厨房与客厅各备一支。" },
  { id: "p-ext-2", gearId: "extinguisher", name: "丙牌 便携灭火喷雾", brand: "丙牌·速灭", spec: "600ml · 车载/厨房", price: 29.0, sales: 6800, rating: 4.6, score: 84, emoji: "🧯", tags: ["轻便", "随手可及"], desc: "小巧便携，油锅起火一喷即灭，适合厨房与车内常备。" },

  // —— 地震专属 ——
  { id: "p-helmet-1", gearId: "quakehelmet", name: "甲牌 折叠防砸安全头盔", brand: "甲牌·护顶", spec: "可折叠 · 抗冲击", price: 79.0, sales: 3900, rating: 4.7, score: 93, emoji: "⛑️", tags: ["防坠物", "可折叠"], desc: "抗冲击外壳保护头部，折叠收纳省空间，放床头与门口，地震摇晃时立即戴上。" },
  { id: "p-whistle-1", gearId: "quakewhistle", name: "乙牌 大声求生哨（含反光）", brand: "乙牌·鸣救", spec: "120dB · 挂绳款", price: 15.0, sales: 8200, rating: 4.8, score: 88, emoji: "📢", tags: ["高分贝", "省体力"], desc: "高分贝哨声传得远、省体力，被困废墟时间歇吹响指引救援，随身挂钥匙/背包。" },

  // —— 洪水专属 ——
  { id: "p-vest-1", gearId: "floodvest", name: "甲牌 成人救生衣 高浮力", brand: "甲牌·浮生", spec: "成人款 · 反光条", price: 99.0, sales: 3200, rating: 4.7, score: 93, emoji: "🦺", tags: ["高浮力", "涉水撤离"], desc: "高浮力材质配反光条，洪水涉水撤离时保命关键，每位家庭成员各备一件。" },
  { id: "p-drybag-1", gearId: "floodbag", name: "乙牌 防水收纳袋 20L", brand: "乙牌·密封", spec: "20L · IPX8 防水", price: 39.0, sales: 4600, rating: 4.7, score: 86, emoji: "🎒", tags: ["证件防水", "可背"], desc: "密封防水收纳证件、手机、现金与充电宝，撤离时随身背，泡水也不怕。" },

  // —— 台风专属 ——
  { id: "p-tape-1", gearId: "windtape", name: "甲牌 防爆玻璃贴膜 + 米字胶带", brand: "甲牌·固窗", spec: "贴膜 2m + 胶带", price: 45.0, sales: 5100, rating: 4.7, score: 93, emoji: "🪟", tags: ["防碎飞溅", "台风必备"], desc: "台风前贴牢窗户，防止玻璃被强风吹碎飞溅伤人；贴膜挡碎片，胶带做米字加固。" },
  { id: "p-rain-1", gearId: "raincoat", name: "乙牌 加厚分体雨衣雨裤", brand: "乙牌·御风", spec: "分体 · 强化袖口", price: 55.0, sales: 3600, rating: 4.6, score: 85, emoji: "🧥", tags: ["防风防雨", "耐撕"], desc: "分体式加厚雨衣裤，抗强风不易灌水，台风天涉水查看/撤离更安全。" },

  // —— 燃气泄漏专属 ——
  { id: "p-gas-1", gearId: "gasalarm", name: "甲牌 插电式燃气报警器", brand: "甲牌·安燃", spec: "220V · 声光报警", price: 49.0, sales: 6100, rating: 4.6, score: 92, emoji: "🔔", tags: ["提前预警", "老旧小区"], desc: "检测到危险浓度立即声光报警，安装在灶台上方，燃气无色难察觉时抢出逃生时间。" },
  { id: "p-gas-2", gearId: "gasalarm", name: "乙牌 报警+自动关阀套装", brand: "乙牌·断阀", spec: "含机械手 · 自动切断", price: 199.0, sales: 2400, rating: 4.7, score: 84, emoji: "🔧", tags: ["自动切断", "更省心"], desc: "报警同时自动关闭燃气阀门，无人在家也能第一时间切断气源，安全升级。" },

  // —— 入室抢劫 / 治安专属 ——
  { id: "p-door-1", gearId: "doorguard", name: "甲牌 门窗磁感报警器", brand: "甲牌·守门", spec: "120dB · 电池款", price: 19.0, sales: 7300, rating: 4.4, score: 90, emoji: "🚪", tags: ["免布线", "出租屋友好"], desc: "贴装门窗接缝处，被开启即触发 120dB 报警，安装简单无需布线，独居/出租屋更安心。" },
  { id: "p-door-2", gearId: "doorguard", name: "乙牌 加厚防撬门链", brand: "乙牌·固门", spec: "锌合金 · 免打孔", price: 25.0, sales: 4900, rating: 4.4, score: 82, emoji: "⛓️", tags: ["加固入户门", "免打孔"], desc: "锌合金加厚门链免打孔安装，夜间加挂争取反应时间，配合报警器更稳妥。" },

  // —— 常用药盒 / 慢病药 elderkit ——
  { id: "p-elder-1", gearId: "elderkit", name: "甲牌 慢性病常用药收纳盒", brand: "甲牌·安康", spec: "分格药盒 · 含病历卡", price: 26.0, unit: "套", subKey: "chronic", sales: 3600, rating: 4.7, score: 93, emoji: "💊", tags: ["慢病常备", "分格收纳"], desc: "单套起买，按周量分装慢病药，附病历卡/用药清单，随身取用不慌。" },
  { id: "p-elder-2", gearId: "elderkit", name: "乙牌 便携分格药盒", brand: "乙牌·分装", spec: "7 日分格 · 密封", price: 12.0, unit: "个", subKey: "pillbox", sales: 5200, rating: 4.6, score: 84, emoji: "💊", tags: ["按天分装", "轻便"], desc: "单个起买，一周七格密封防潮，避免漏服错服，老人用药更省心。" },

  // —— 儿童应急包 kidbag ——
  { id: "p-kid-1", gearId: "kidbag", name: "甲牌 儿童身份卡 + 安抚套装", brand: "甲牌·守护", spec: "身份卡 + 安抚物", price: 29.0, unit: "份", subKey: "idcard", sales: 3100, rating: 4.8, score: 92, emoji: "🧒", tags: ["身份识别", "稳定情绪"], desc: "单份起买，含可缝挂身份联系卡与安抚小物，灾时防走失、稳情绪。" },
  { id: "p-kid-2", gearId: "kidbag", name: "乙牌 婴幼儿尿不湿 + 湿巾", brand: "乙牌·柔护", spec: "独立包 · 便携", price: 15.0, unit: "包", subKey: "diaper", sales: 6400, rating: 4.7, score: 84, emoji: "🍼", tags: ["低龄必备", "便携"], desc: "单包起买，尿不湿配湿巾一体带，低龄幼儿撤离途中好照护。" },

  // —— 宠物应急包 petkit ——
  { id: "p-pet-1", gearId: "petkit", name: "甲牌 宠物应急口粮（分装）", brand: "甲牌·爱宠", spec: "3 天量分装 · 密封", price: 18.0, unit: "份", subKey: "petfood", sales: 2900, rating: 4.7, score: 92, emoji: "🐾", tags: ["按天分装", "密封"], desc: "单份起买，按天密封分装宠物粮，撤离随手带，毛孩也有应急口粮。" },
  { id: "p-pet-2", gearId: "petkit", name: "乙牌 宠物牵引绳 + 胸背带", brand: "乙牌·牵护", spec: "防挣脱 · 可调节", price: 39.0, unit: "套", subKey: "leash", sales: 3300, rating: 4.6, score: 84, emoji: "🐕", tags: ["防走失", "可调节"], desc: "单套起买，撤离时牢牢控制宠物防走失，胸背带受力更稳。" },

  // —— 取火套装 firestarter ——
  { id: "p-fire-1", gearId: "firestarter", name: "甲牌 防风打火机", brand: "甲牌·烈焰", spec: "防风 · 可充气", price: 9.9, unit: "个", subKey: "lighter", sales: 8800, rating: 4.7, score: 94, emoji: "🔥", tags: ["防风", "取火主力"], desc: "单个起买，防风易打火，取火主力，快取放腰封随手可用。" },
  { id: "p-fire-2", gearId: "firestarter", name: "乙牌 防水火柴", brand: "乙牌·常明", spec: "防水防潮 · 盒装", price: 6.9, unit: "盒", subKey: "match", sales: 5100, rating: 4.6, score: 84, emoji: "🔥", tags: ["防潮备份", "耐用"], desc: "单盒起买，打火机失效时的备份，防水防潮保存更放心。" },

  // —— 多功能工具组 toolset ——
  { id: "p-tool-1", gearId: "toolset", name: "甲牌 多功能钳（钳/刀/锯）", brand: "甲牌·万用", spec: "不锈钢 · 多合一", price: 49.0, unit: "把", subKey: "plier", sales: 6200, rating: 4.8, score: 95, emoji: "🛠️", tags: ["一具多用", "耐用"], desc: "单把起买，钳/刀/锯多用一体，切割固定破拆自救通用。" },
  { id: "p-tool-2", gearId: "toolset", name: "乙牌 破窗器 + 割绳刀", brand: "乙牌·脱困", spec: "破窗 · 割安全带", price: 19.0, unit: "个", subKey: "hammer", sales: 4700, rating: 4.7, score: 85, emoji: "🔨", tags: ["破窗逃生", "轻便"], desc: "单个起买，一击破窗、割断安全带，车内/家中脱困必备。" },

  // —— 防水收纳 waterproof ——
  { id: "p-wp-1", gearId: "waterproof", name: "甲牌 防水密封袋", brand: "甲牌·密封", spec: "IPX8 · 多尺寸", price: 6.5, unit: "个", subKey: "drybag", sales: 7300, rating: 4.7, score: 93, emoji: "🧷", tags: ["证件防潮", "分装"], desc: "单个起买，干粮药品数码证件分装防潮，泡水也不怕。" },
  { id: "p-wp-2", gearId: "waterproof", name: "乙牌 加厚大号垃圾袋", brand: "乙牌·多用", spec: "加厚 · 卷装", price: 8.9, unit: "卷", subKey: "garbage", sales: 5600, rating: 4.5, score: 82, emoji: "🗑️", tags: ["雨衣兼用", "多用途"], desc: "单卷起买，兼作临时雨衣、储水、防潮，轻便多用途。" },

  // —— 证件现金 + 备用手机 docsmoney ——
  { id: "p-docs-1", gearId: "docsmoney", name: "甲牌 贴身防水证件包", brand: "甲牌·随身", spec: "防水 · 挂脖款", price: 22.0, unit: "个", subKey: "id", sales: 4100, rating: 4.7, score: 92, emoji: "🪪", tags: ["贴身收纳", "防水"], desc: "单个起买，装身份证/银行卡复印件与现金，贴身防水随身带。" },
  { id: "p-docs-2", gearId: "docsmoney", name: "乙牌 家人联系信息卡（纸质）", brand: "乙牌·连心", spec: "防水纸 · 可书写", price: 6.0, unit: "张", subKey: "contactcard", sales: 3600, rating: 4.6, score: 84, emoji: "📇", tags: ["失散寻人", "防水"], desc: "单张起买，写明紧急联系人、血型、集合点，手机没电也能寻人。" },

  // —— 洗漱清洁包 hygienekit ——
  { id: "p-hyg-1", gearId: "hygienekit", name: "甲牌 医用 / KN95 口罩", brand: "甲牌·净呼", spec: "独立装 · 防尘防烟", price: 1.5, unit: "个", subKey: "mask", sales: 15600, rating: 4.8, score: 94, emoji: "😷", tags: ["论个买", "防尘防烟"], desc: "单个起买，按家庭人数配足；防尘防烟防病，避难场所常备。" },
  { id: "p-hyg-2", gearId: "hygienekit", name: "乙牌 免洗洗手液", brand: "乙牌·洁净", spec: "便携 · 速干", price: 7.9, unit: "瓶", subKey: "sanit", sales: 6800, rating: 4.6, score: 85, emoji: "🧴", tags: ["缺水消毒", "便携"], desc: "单瓶起买，缺水时手部消毒防病，速干不黏手。" },

  // —— 换洗衣物 + 雨披 clothing ——
  { id: "p-cloth-1", gearId: "clothing", name: "甲牌 速干衣裤（1 套）", brand: "甲牌·干爽", spec: "上衣+裤 · 速干", price: 69.0, unit: "套", subKey: "shirt", sales: 3400, rating: 4.7, score: 92, emoji: "👕", tags: ["论套买", "保持干燥"], desc: "单套起买，按人数配足；保持干燥防失温，撤离安置换洗用。" },
  { id: "p-cloth-2", gearId: "clothing", name: "乙牌 加厚分体雨衣", brand: "乙牌·御雨", spec: "分体 · 加厚", price: 39.0, unit: "件", subKey: "raincoat", sales: 4200, rating: 4.6, score: 85, emoji: "🧥", tags: ["论件买", "防风防雨"], desc: "单件起买，分体加厚抗强风不灌水，涉水查看/撤离更安全。" },

  // —— 睡袋寝具 + 保温毯 sleepgear ——
  { id: "p-sleep-1", gearId: "sleepgear", name: "甲牌 应急保温毯（万能应急毯）", brand: "甲牌·蓄暖", spec: "反射体温 · 极轻", price: 4.9, unit: "张", subKey: "blanket", sales: 9100, rating: 4.8, score: 93, emoji: "🌡️", tags: ["论张买", "防失温"], desc: "单张起买，反射体温防失温，极轻必带，多备几张更安心。" },
  { id: "p-sleep-2", gearId: "sleepgear", name: "乙牌 压缩睡袋", brand: "乙牌·暖眠", spec: "可压缩 · 便携", price: 89.0, unit: "个", subKey: "sleepbag", sales: 2600, rating: 4.6, score: 84, emoji: "🛌", tags: ["户外过夜", "可压缩"], desc: "单个起买，户外过夜保暖，可压缩收纳，转移安置更舒适。" },

  // —— 炊具组 cookset ——
  { id: "p-cook-1", gearId: "cookset", name: "甲牌 叉勺餐具（1 套）", brand: "甲牌·随食", spec: "叉勺一体 · 轻便", price: 12.0, unit: "套", subKey: "utensil", sales: 4800, rating: 4.7, score: 92, emoji: "🍴", tags: ["论套买", "轻便"], desc: "单套起买，按人数配足；叉勺一体轻便，避险进食必备。" },
  { id: "p-cook-2", gearId: "cookset", name: "乙牌 折叠炊具锅套装", brand: "乙牌·炊行", spec: "煮锅+煎锅 · 折叠", price: 79.0, unit: "套", subKey: "pot", sales: 2300, rating: 4.6, score: 84, emoji: "🍳", tags: ["长期避险", "折叠"], desc: "单套起买，长期避险烧水热食，折叠收纳省空间。" },

  // —— 涉水防护鞋 floodshoes ——
  { id: "p-fshoes-1", gearId: "floodshoes", name: "甲牌 涉水雨靴", brand: "甲牌·涉安", spec: "包脚防滑 · 加厚", price: 59.0, unit: "双", subKey: "boots", sales: 3900, rating: 4.7, score: 92, emoji: "🥾", tags: ["论双买", "包脚防划"], desc: "单双起买，按人数配足；包裹全脚防划伤，洪水涉水撤离更安全。" },
  { id: "p-fshoes-2", gearId: "floodshoes", name: "乙牌 速干袜", brand: "乙牌·干足", spec: "速干 · 透气", price: 9.9, unit: "双", subKey: "socks", sales: 5100, rating: 4.5, score: 82, emoji: "🧦", tags: ["论双买", "速干"], desc: "单双起买，涉水后及时更换防泡烂，透气速干护足。" },

  // —— 应急救生哨 eqwhistle ——
  { id: "p-eqw-1", gearId: "eqwhistle", name: "甲牌 高分贝救生哨", brand: "甲牌·鸣救", spec: "120dB · 挂绳", price: 12.0, unit: "个", subKey: "whistle", sales: 8200, rating: 4.8, score: 93, emoji: "📢", tags: ["论个买", "高分贝"], desc: "单个起买，人手一个挂身上；被埋压时省力求救，哨声传得远。" },

  // —— 防砸头套 / 安全帽 eqhelmet ——
  { id: "p-eqh-1", gearId: "eqhelmet", name: "甲牌 折叠防砸安全帽", brand: "甲牌·护顶", spec: "可折叠 · 抗冲击", price: 79.0, unit: "顶", subKey: "helmet", sales: 3900, rating: 4.7, score: 93, emoji: "⛑️", tags: ["论顶买", "可折叠"], desc: "单顶起买，按人数配足；抗冲击护头颈，床头门口各放一个。" },

  // —— 灭火毯 firetblanket ——
  { id: "p-ftb-1", gearId: "firetblanket", name: "甲牌 家用灭火毯 1m×1m", brand: "甲牌·隔焰", spec: "1m×1m · 玻纤", price: 29.0, unit: "块", subKey: "blanket", sales: 5300, rating: 4.8, score: 93, emoji: "🧯", tags: ["论块买", "厨房必备"], desc: "单块起买，油锅起火覆盖隔氧灭火，也可披身逃生，比灭火器易上手。" },

  // —— 备用眼镜 spareglasses ——
  { id: "p-glass-1", gearId: "spareglasses", name: "甲牌 眼镜防丢运动绑带", brand: "甲牌·稳视", spec: "防滑 · 可调", price: 8.0, unit: "条", subKey: "strap", sales: 4600, rating: 4.6, score: 90, emoji: "👓", tags: ["论条买", "防滑落"], desc: "单条起买，涉水奔跑不滑落，高度近视撤离时看得清更安全。" },

  // —— 女性卫生用品 hygiene ——
  { id: "p-hygf-1", gearId: "hygiene", name: "甲牌 卫生巾（独立装）", brand: "甲牌·安护", spec: "独立包 · 日夜用", price: 1.2, unit: "片", subKey: "pad", sales: 12100, rating: 4.8, score: 93, emoji: "🩸", tags: ["论片买", "按周量备"], desc: "单片起买，按一周量备足；独立包装干净卫生，避难场所难补给。" },
  { id: "p-hygf-2", gearId: "hygiene", name: "乙牌 私处清洁湿巾", brand: "乙牌·洁柔", spec: "便携 · 密封", price: 6.9, unit: "包", subKey: "wipe", sales: 5400, rating: 4.6, score: 84, emoji: "🧻", tags: ["论包买", "缺水可用"], desc: "单包起买，缺水时清洁，密封防潮携带方便。" },

  // —— 产后 / 待产护理包 maternitycare ——
  { id: "p-mat-1", gearId: "maternitycare", name: "甲牌 产褥垫（独立装）", brand: "甲牌·安月", spec: "加大吸量 · 独立包", price: 2.5, unit: "片", subKey: "matpad", sales: 3800, rating: 4.8, score: 92, emoji: "🤱", tags: ["论片买", "恶露期用"], desc: "单片起买，恶露期吸量大，独立包装卫生，产后护理必备。" },
  { id: "p-mat-2", gearId: "maternitycare", name: "乙牌 产妇专用加长卫生巾", brand: "乙牌·柔月", spec: "加长 · 独立包", price: 1.8, unit: "片", subKey: "matnap", sales: 4200, rating: 4.7, score: 84, emoji: "🩹", tags: ["论片买", "中后期用"], desc: "单片起买，恶露中后期用，加长设计更贴合，母婴护理更安心。" },

  // —— 子物品专属单品·背包/供水/储水 ——
  { id: "p-bag-body-1", gearId: "backpack", name: "丁牌 防泼水应急双肩包", brand: "丁牌·驮行", spec: "多容积可选 · 防泼水", price: 129.0, unit: "个", subKey: "bag", sales: 3400, rating: 4.7, score: 80, emoji: "🎒", tags: ["论个买", "防泼水"], desc: "单个起买，容积按人数选，防泼水面料承重腰带，BOB 骨架首选。" },
  { id: "p-bag-cover-1", gearId: "backpack", name: "戊牌 背包防雨罩", brand: "戊牌·遮雨", spec: "弹性收口 · 反光边", price: 12.0, unit: "个", subKey: "raincover", sales: 5200, rating: 4.6, score: 78, emoji: "☂️", tags: ["论个买", "防雨"], desc: "单个起买，雨天涉水套住背包保护内物，弹性收口带反光边。" },
  { id: "p-water-straw-1", gearId: "water", name: "丁牌 户外净水吸管", brand: "丁牌·直饮", spec: "过滤直饮 · 便携", price: 39.0, unit: "支", subKey: "straw", sales: 4100, rating: 4.7, score: 80, emoji: "🥤", tags: ["论支买", "野外过滤"], desc: "单支起买，野外过滤直饮减少带水负重，随身应急水源保障。" },
  { id: "p-water-tab-1", gearId: "water", name: "戊牌 应急净水片", brand: "戊牌·净饮", spec: "1 片处理约 1L", price: 0.4, unit: "片", subKey: "tablet", sales: 6800, rating: 4.6, score: 79, emoji: "💠", tags: ["论片买", "消毒可疑水"], desc: "单片起买，消毒可疑水源，一片约处理 1L，极轻按需多备。" },
  { id: "p-water-fold-1", gearId: "water", name: "己牌 折叠水袋", brand: "己牌·蓄水", spec: "轻量 · 可挂包", price: 15.0, unit: "个", subKey: "foldbag", sales: 3300, rating: 4.5, score: 77, emoji: "💧", tags: ["论个买", "扩展储水"], desc: "单个起买，空袋极轻，找到水源就地装水，扩展随身储水。" },
  { id: "p-wstore-drink-1", gearId: "waterstore", name: "丙牌 应急瓶装饮用水（家庭储备）", brand: "丙牌·清饮", spec: "按 L 备 · 饮用", price: 2.0, unit: "L", subKey: "drink", sales: 7600, rating: 4.7, score: 83, emoji: "🚰", tags: ["论升买", "饮用储备"], desc: "按升起买，家庭饮用储备约 1L/人/天×3 天，密封储存定期轮换。" },
  { id: "p-wstore-living-1", gearId: "waterstore", name: "丁牌 生活用水储备装", brand: "丁牌·蓄用", spec: "按 L 备 · 生活用", price: 1.2, unit: "L", subKey: "living", sales: 4300, rating: 4.5, score: 79, emoji: "🪣", tags: ["论升买", "生活用水"], desc: "按升起买，做饭清洁冲厕用，约 2L/人/天×3 天，储水桶接满备用。" },
  { id: "p-wstore-barrel-1", gearId: "waterstore", name: "戊牌 带盖避光储水桶", brand: "戊牌·藏水", spec: "带盖避光 · 大容量", price: 45.0, unit: "个", subKey: "barrel", sales: 3100, rating: 4.6, score: 81, emoji: "🛢️", tags: ["论个买", "避光防变质"], desc: "单个起买，盛装饮用/生活水，带盖避光定期换水防变质。" },
  { id: "p-wstore-tab-1", gearId: "waterstore", name: "己牌 家用净水片 / 滤水器芯", brand: "己牌·净源", spec: "1 片处理约 1L", price: 0.5, unit: "片", subKey: "tablet", sales: 5200, rating: 4.6, score: 78, emoji: "💠", tags: ["论片买", "管道污染可用"], desc: "单片起买，自来水异常时净化再用，家用滤水器可长期净化。" },

  // —— 子物品专属单品·食物/家庭食物 ——
  { id: "p-food-gel-1", gearId: "food", name: "丁牌 快速补能能量胶", brand: "丁牌·速能", spec: "独立支装 · 快吸收", price: 5.9, unit: "支", subKey: "gel", sales: 4200, rating: 4.6, score: 80, emoji: "🧃", tags: ["论支买", "快速补能"], desc: "单支起买，快速吸收补能，撤离或体力透支时即时补充。" },
  { id: "p-food-sugar-1", gearId: "food", name: "戊牌 葡萄糖 / 硬糖", brand: "戊牌·补糖", spec: "独立小包 · 耐放", price: 2.5, unit: "包", subKey: "sugar", sales: 5100, rating: 4.5, score: 78, emoji: "🍬", tags: ["论包买", "补糖稳情绪"], desc: "单包起买，快速补糖稳定体力与情绪，独立小包耐储存。" },
  { id: "p-food-salt-1", gearId: "food", name: "己牌 电解质盐包", brand: "己牌·补盐", spec: "独立包 · 补钠", price: 1.5, unit: "包", subKey: "salt", sales: 4700, rating: 4.5, score: 77, emoji: "🧂", tags: ["论包买", "防脱水"], desc: "单包起买，大量出汗后补钠防脱水乏力，随身携带方便。" },
  { id: "p-hfood-noodle-1", gearId: "homefood", name: "丙牌 方便面 / 挂面（份装）", brand: "丙牌·主食", spec: "按份 · 可煮食", price: 4.5, unit: "份", subKey: "noodle", sales: 6100, rating: 4.6, score: 83, emoji: "🍜", tags: ["论份买", "主食储备"], desc: "单份起买，主食储备，有燃气炉具时可煮食，耐储易囤。" },
  { id: "p-hfood-milk-1", gearId: "homefood", name: "丁牌 常温奶 / 豆奶", brand: "丁牌·常鲜", spec: "盒装 · 常温储存", price: 3.9, unit: "盒", subKey: "milk", sales: 5400, rating: 4.7, score: 81, emoji: "🥛", tags: ["论盒买", "补蛋白钙"], desc: "单盒起买，补充蛋白与钙，老人小孩尤其需要，常温耐储。" },
  { id: "p-hfood-snack-1", gearId: "homefood", name: "戊牌 饼干 / 麦片 / 果干", brand: "戊牌·耐零", spec: "按份 · 耐储零食", price: 5.0, unit: "份", subKey: "snack", sales: 4800, rating: 4.5, score: 79, emoji: "🍘", tags: ["论份买", "稳定情绪"], desc: "单份起买，耐储零食稳定情绪、丰富口味，居家常备。" },
  { id: "p-hfood-oil-1", gearId: "homefood", name: "己牌 食用油 / 调料套装", brand: "己牌·常味", spec: "油+盐糖等 · 家用", price: 39.0, unit: "套", subKey: "oilcond", sales: 3200, rating: 4.6, score: 77, emoji: "🫙", tags: ["论套买", "灾时可做饭"], desc: "单套起买，日常本就常备，灾时有火有水可做饭，改善口味。" },

  // —— 子物品专属单品·急救医疗包 firstaid ——
  { id: "p-aid-iodine-1", gearId: "firstaid", name: "丙牌 碘伏棉棒（独立装）", brand: "丙牌·消护", spec: "独立包 · 消毒", price: 0.5, unit: "支", subKey: "iodine", sales: 8600, rating: 4.8, score: 83, emoji: "🧼", tags: ["论支买", "消毒杀菌"], desc: "单支起买，独立包装免污染，伤口消毒杀菌随手可用。" },
  { id: "p-aid-alcohol-1", gearId: "firstaid", name: "丁牌 酒精棉棒", brand: "丁牌·洁创", spec: "独立包 · 清洁", price: 0.4, unit: "支", subKey: "alcohol", sales: 6200, rating: 4.7, score: 81, emoji: "🧴", tags: ["论支买", "清洁消毒"], desc: "单支起买，清洁消毒器械与皮肤，独立包装便携卫生。" },
  { id: "p-aid-bandaid-1", gearId: "firstaid", name: "戊牌 防水弹力创可贴", brand: "戊牌·护贴", spec: "防水 · 弹力", price: 0.3, unit: "片", subKey: "bandaid", sales: 12400, rating: 4.8, score: 84, emoji: "🩹", tags: ["论片买", "含防水款"], desc: "单片起买，含防水与弹力款，小伤口快速处理防感染。" },
  { id: "p-aid-ointment-1", gearId: "firstaid", name: "己牌 抗菌软膏", brand: "己牌·愈肤", spec: "支装 · 抗菌", price: 12.0, unit: "支", subKey: "ointment", sales: 4100, rating: 4.7, score: 80, emoji: "🧫", tags: ["论支买", "防感染"], desc: "单支起买，涂抹伤口预防感染，家庭急救常备。" },
  { id: "p-aid-gauze-1", gearId: "firstaid", name: "庚牌 医用纱布卷", brand: "庚牌·裹伤", spec: "卷装 · 无菌", price: 3.0, unit: "卷", subKey: "gauze", sales: 5200, rating: 4.7, score: 82, emoji: "🩹", tags: ["论卷买", "覆盖创面"], desc: "单卷起买，无菌纱布覆盖较大创面，配合胶带固定。" },
  { id: "p-aid-triangle-1", gearId: "firstaid", name: "辛牌 三角绷带", brand: "辛牌·固伤", spec: "条装 · 悬吊固定", price: 4.5, unit: "条", subKey: "triangle", sales: 3600, rating: 4.6, score: 79, emoji: "🧵", tags: ["论条买", "悬吊包扎"], desc: "单条起买，悬吊固定、包扎多用，骨折/外伤应急处理。" },
  { id: "p-aid-elastic-1", gearId: "firstaid", name: "壬牌 医用弹性绷带", brand: "壬牌·加压", spec: "卷装 · 弹性", price: 5.0, unit: "卷", subKey: "elastic", sales: 3900, rating: 4.6, score: 78, emoji: "🩹", tags: ["论卷买", "加压固定"], desc: "单卷起买，加压包扎、关节固定，回弹好不易松脱。" },
  { id: "p-aid-tour-1", gearId: "firstaid", name: "癸牌 应急止血带 / 压脉带", brand: "癸牌·止血", spec: "根装 · 快速止血", price: 18.0, unit: "根", subKey: "tourniquet", sales: 4300, rating: 4.8, score: 82, emoji: "🚑", tags: ["论根买", "四肢大出血"], desc: "单根起买，四肢大出血应急止血，一手可操作快速收紧。" },
  { id: "p-aid-scissors-1", gearId: "firstaid", name: "甲乙牌 圆头剪刀 + 镊子套装", brand: "甲乙牌·取护", spec: "圆头剪 + 镊子", price: 15.0, unit: "套", subKey: "scissors", sales: 3500, rating: 4.7, score: 80, emoji: "✂️", tags: ["论套买", "取异物"], desc: "单套起买，圆头剪剪敷料不伤肤，镊子取异物，急救必备。" },
  { id: "p-aid-gloves-1", gearId: "firstaid", name: "丙丁牌 医用橡胶手套", brand: "丙丁牌·隔护", spec: "副装 · 一次性", price: 1.0, unit: "副", subKey: "gloves", sales: 6100, rating: 4.6, score: 79, emoji: "🧤", tags: ["论副买", "隔离防感染"], desc: "单副起买，施救时隔离防交叉感染，一次性卫生安全。" },
  { id: "p-aid-tape-1", gearId: "firstaid", name: "戊己牌 医用宽胶带", brand: "戊己牌·固贴", spec: "卷装 · 固定敷料", price: 3.5, unit: "卷", subKey: "tape", sales: 4400, rating: 4.6, score: 78, emoji: "🩹", tags: ["论卷买", "固定敷料"], desc: "单卷起买，固定纱布敷料，粘性强不易脱落。" },
  { id: "p-aid-cotton-1", gearId: "firstaid", name: "庚辛牌 医用棉花球", brand: "庚辛牌·蘸取", spec: "包装 · 清洁", price: 4.0, unit: "包", subKey: "cotton", sales: 3300, rating: 4.5, score: 77, emoji: "☁️", tags: ["论包买", "蘸取药液"], desc: "单包起买，清洁伤口、蘸取药液，柔软吸液好用。" },
  { id: "p-aid-burn-1", gearId: "firstaid", name: "壬癸牌 烧烫伤软膏 / 敷料", brand: "壬癸牌·护烫", spec: "支装 · 降温镇痛", price: 16.0, unit: "支", subKey: "burn", sales: 3100, rating: 4.7, score: 79, emoji: "🔥", tags: ["论支买", "火灾热损伤"], desc: "单支起买，火灾/热损伤处理，降温镇痛防感染。" },
  { id: "p-aid-meds-1", gearId: "firstaid", name: "安康牌 家庭常用药套装（对症）", brand: "安康牌·对症", spec: "退烧止痛/止泻等", price: 15.0, unit: "种", subKey: "meds", sales: 5800, rating: 4.7, score: 81, emoji: "💊", tags: ["论种买", "对症常备"], desc: "按种起买，退烧止痛、止泻抗过敏、肠胃药等，按需备足。" },
  { id: "p-aid-card-1", gearId: "firstaid", name: "速查牌 药症速查卡（纸质）", brand: "速查牌·照卡", spec: "防水纸 · 症状对照", price: 5.0, unit: "张", subKey: "medcard", sales: 3600, rating: 4.6, score: 80, emoji: "🗂️", tags: ["论张买", "断网可用"], desc: "单张起买，写清症状→对应药名用法，断网也能照卡取药自救。" },

  // —— 子物品专属单品·照明/电源/求救/收音机/防烟 ——
  { id: "p-light-torch-1", gearId: "flashlight", name: "丙牌 手摇多功能手电筒", brand: "丙牌·自光", spec: "手摇+太阳能+USB", price: 55.0, unit: "支", subKey: "torch", sales: 6100, rating: 4.7, score: 80, emoji: "🔦", tags: ["论支买", "手摇发电"], desc: "单支起买，手摇/太阳能充电兼收音与 USB 输出，断电也能用。" },
  { id: "p-light-headlamp-1", gearId: "flashlight", name: "丁牌 应急头灯", brand: "丁牌·亮行", spec: "个装 · 解放双手", price: 29.0, unit: "个", subKey: "headlamp", sales: 4300, rating: 4.6, score: 79, emoji: "💡", tags: ["论个买", "解放双手"], desc: "单个起买，解放双手，撤离自救更方便，多档亮度可调。" },
  { id: "p-light-glow-1", gearId: "flashlight", name: "戊牌 应急荧光棒", brand: "戊牌·冷光", spec: "支装 · 折断即亮", price: 1.2, unit: "支", subKey: "glowstick", sales: 5600, rating: 4.5, score: 77, emoji: "🌟", tags: ["论支买", "无需电"], desc: "单支起买，无需电折断即亮，标记位置/夜间被发现好用。" },
  { id: "p-batt-pb-1", gearId: "battery", name: "乙牌 应急充电宝 10000mAh", brand: "乙牌·蓄能", spec: "个装 · 双向快充", price: 79.0, unit: "个", subKey: "powerbank", sales: 8600, rating: 4.8, score: 81, emoji: "🔋", tags: ["论个买", "给手机补电"], desc: "单个起买，给手机/收音机应急补电，双向快充每 3 个月充满。" },
  { id: "p-batt-cable-1", gearId: "battery", name: "丙牌 多头充电线", brand: "丙牌·通联", spec: "条装 · 一线多口", price: 12.0, unit: "条", subKey: "cable", sales: 6200, rating: 4.6, score: 79, emoji: "🔌", tags: ["论条买", "兼容多口"], desc: "单条起买，一线兼容常用接口，应急充电不挑设备。" },
  { id: "p-batt-cell-1", gearId: "battery", name: "丁牌 常用型号备用电池", brand: "丁牌·续电", spec: "节装 · AA/AAA", price: 2.0, unit: "节", subKey: "cell", sales: 7100, rating: 4.6, score: 78, emoji: "🔋", tags: ["论节买", "供手电报警器"], desc: "单节起买，AA/AAA 常用型号，供手电、报警器等长续航。" },
  { id: "p-whistle-w-1", gearId: "whistle", name: "甲牌 高分贝求救哨", brand: "甲牌·鸣救", spec: "个装 · 挂身", price: 12.0, unit: "个", subKey: "whistle", sales: 8200, rating: 4.8, score: 90, emoji: "📢", tags: ["论个买", "省力呼救"], desc: "单个起买，人手一个挂身上，被困时省力呼救传得远。" },
  { id: "p-whistle-r-1", gearId: "whistle", name: "乙牌 反光贴 / 反光条", brand: "乙牌·夜显", spec: "片装 · 夜间反光", price: 3.0, unit: "片", subKey: "reflect", sales: 4900, rating: 4.5, score: 82, emoji: "🔆", tags: ["论片买", "夜间被发现"], desc: "单片起买，夜间便于被搜救发现，贴衣物/背包/头盔。" },
  { id: "p-radio-r-1", gearId: "radio", name: "甲牌 手摇发电应急收音机", brand: "甲牌·声波", spec: "台装 · 带手电充电", price: 118.0, unit: "台", subKey: "radio", sales: 4100, rating: 4.8, score: 90, emoji: "📻", tags: ["论台买", "接收预警"], desc: "单台起买，手摇/太阳能供电，接收官方预警，兼手电与充电。" },
  { id: "p-radio-cell-1", gearId: "radio", name: "乙牌 收音机备用电池", brand: "乙牌·续声", spec: "节装 · 常用型号", price: 2.0, unit: "节", subKey: "cell", sales: 3600, rating: 4.5, score: 80, emoji: "🔋", tags: ["论节买", "非手摇款备电"], desc: "单节起买，非手摇款收音机备电，保持随时能接收预警。" },
  { id: "p-smoke-m-1", gearId: "smokemask", name: "甲牌 N95 防烟逃生面罩", brand: "甲牌·净烟", spec: "个装 · 过滤 30 分钟", price: 45.0, unit: "个", subKey: "mask", sales: 5600, rating: 4.8, score: 90, emoji: "😷", tags: ["论个买", "高层必备"], desc: "单个起买，每位家庭成员 1 个，过滤有毒烟气争取逃生时间。" },

  // —— 子物品专属单品·常用药盒/儿童/宠物/眼镜/女性/产后/取火 ——
  { id: "p-elder-card-1", gearId: "elderkit", name: "丙牌 病历卡 / 用药清单", brand: "丙牌·记护", spec: "防水纸 · 可书写", price: 6.0, unit: "张", subKey: "card", sales: 3300, rating: 4.6, score: 80, emoji: "📋", tags: ["论张买", "急救凭证"], desc: "单张起买，写明病史过敏史、用药与紧急联系人，就医更高效。" },
  { id: "p-elder-common-1", gearId: "elderkit", name: "丁牌 常用非处方药套装", brand: "丁牌·常护", spec: "退烧止泻等 · 多种", price: 14.0, unit: "种", subKey: "common", sales: 4600, rating: 4.6, score: 79, emoji: "💊", tags: ["论种买", "对症常备"], desc: "按种起买，退烧、止泻、抗过敏、创伤消炎等对症常备。" },
  { id: "p-kid-comfort-1", gearId: "kidbag", name: "丙牌 儿童安抚玩偶 / 毯", brand: "丙牌·暖心", spec: "件装 · 柔软", price: 29.0, unit: "件", subKey: "comfort", sales: 3400, rating: 4.7, score: 80, emoji: "🧸", tags: ["论件买", "稳定情绪"], desc: "单件起买，稳定孩子情绪、减少灾时应激，柔软便携。" },
  { id: "p-kid-snack-1", gearId: "kidbag", name: "丁牌 儿童零食 / 奶粉（份装）", brand: "丁牌·育养", spec: "按份 · 按需备", price: 12.0, unit: "份", subKey: "snack", sales: 5100, rating: 4.6, score: 79, emoji: "🍼", tags: ["论份买", "按需备足"], desc: "单份起买，按孩子日常需要备足，撤离途中随时补给。" },
  { id: "p-pet-water-1", gearId: "petkit", name: "丙牌 宠物饮水（瓶装）", brand: "丙牌·润宠", spec: "瓶装 · 配折叠碗", price: 3.0, unit: "瓶", subKey: "petwater", sales: 3100, rating: 4.6, score: 80, emoji: "💧", tags: ["论瓶买", "配折叠碗"], desc: "单瓶起买，撤离途中给宠物补水，可与折叠碗配合使用。" },
  { id: "p-pet-bowl-1", gearId: "petkit", name: "丁牌 折叠宠物食水碗", brand: "丁牌·轻喂", spec: "个装 · 可挂包", price: 12.0, unit: "个", subKey: "petbowl", sales: 2800, rating: 4.5, score: 78, emoji: "🥣", tags: ["论个买", "轻便可挂"], desc: "单个起买，轻便可挂包，随时给宠物喂食喂水。" },
  { id: "p-glass-g-1", gearId: "spareglasses", name: "乙牌 备用眼镜（度数够用）", brand: "乙牌·清视", spec: "副装 · 旧度数", price: 99.0, unit: "副", subKey: "glasses", sales: 2600, rating: 4.6, score: 80, emoji: "👓", tags: ["论副买", "逃生看得清"], desc: "单副起买，旧的一副度数够用即可，逃生救援时看得清更安全。" },
  { id: "p-glass-c-1", gearId: "spareglasses", name: "丙牌 隐形眼镜 + 护理液", brand: "丙牌·润瞳", spec: "套装 · 含护理液", price: 39.0, unit: "套", subKey: "contact", sales: 2200, rating: 4.5, score: 78, emoji: "👁️", tags: ["论套买", "有需要备"], desc: "单套起买，有需要时备用，护理液较重按需携带。" },
  { id: "p-hygf-cup-1", gearId: "hygiene", name: "丙牌 医用硅胶月经杯", brand: "丙牌·循洁", spec: "个装 · 可重复用", price: 39.0, unit: "个", subKey: "cup", sales: 3100, rating: 4.6, score: 80, emoji: "🩸", tags: ["论个买", "省耗材"], desc: "单个起买，可重复使用，缺水缺补给时更省耗材。" },
  { id: "p-hygf-adult-1", gearId: "hygiene", name: "丁牌 成人护理垫", brand: "丁牌·安垫", spec: "片装 · 失禁护理", price: 1.5, unit: "片", subKey: "adult", sales: 4200, rating: 4.5, score: 78, emoji: "🩹", tags: ["论片买", "失禁夜间"], desc: "单片起买，失禁/夜间护理用，吸量大独立包装卫生。" },
  { id: "p-mat-book-1", gearId: "maternitycare", name: "丙牌 母子健康手册收纳套（含证件袋）", brand: "丙牌·孕护", spec: "套装 · 防水袋", price: 12.0, unit: "套", subKey: "book", sales: 2600, rating: 4.6, score: 80, emoji: "📖", tags: ["论套买", "就医凭证"], desc: "单套起买，收纳母子健康手册与证件复印件，临产就医必备。" },
  { id: "p-mat-newborn-1", gearId: "maternitycare", name: "丁牌 新生儿基础用品包", brand: "丁牌·初生", spec: "份装 · 包被尿布等", price: 59.0, unit: "份", subKey: "newborn", sales: 2100, rating: 4.6, score: 78, emoji: "👶", tags: ["论份买", "孕晚期备"], desc: "单份起买，孕晚期一并备：包被、尿布、纸巾等，防灾时临产。" },
  { id: "p-fire-mirror-1", gearId: "firestarter", name: "丙牌 户外求生镜", brand: "丙牌·反光", spec: "个装 · 远距求救", price: 9.0, unit: "个", subKey: "mirror", sales: 3600, rating: 4.5, score: 80, emoji: "🪞", tags: ["论个买", "反光求救"], desc: "单个起买，反光远距离求救，晴天可引起救援注意。" },
  { id: "p-fire-compass-1", gearId: "firestarter", name: "丁牌 户外指南针", brand: "丁牌·辨向", spec: "个装 · 断网辨向", price: 12.0, unit: "个", subKey: "compass", sales: 3300, rating: 4.5, score: 78, emoji: "🧭", tags: ["论个买", "断网辨向"], desc: "单个起买，断网无 GPS 时辨向，配求生镜求救更稳妥。" },

  // —— 子物品专属单品·工具/证件/洗漱/衣物/寝具/炊具 ——
  { id: "p-tool-rope-1", gearId: "toolset", name: "丙牌 伞绳 / 逃生绳 5m", brand: "丙牌·牵绳", spec: "卷装 · 高承重", price: 15.0, unit: "卷", subKey: "rope", sales: 4200, rating: 4.7, score: 80, emoji: "🪢", tags: ["论卷买", "牵引下降"], desc: "单卷起买，牵引、固定、下降自救多用，高承重耐磨。" },
  { id: "p-tool-tape-1", gearId: "toolset", name: "丁牌 大力胶带", brand: "丁牌·强粘", spec: "卷装 · 强力", price: 9.0, unit: "卷", subKey: "tape", sales: 4600, rating: 4.6, score: 79, emoji: "🩹", tags: ["论卷买", "封堵固定"], desc: "单卷起买，封堵、固定、临时修补多用，粘性强耐撕。" },
  { id: "p-tool-shovel-1", gearId: "toolset", name: "戊牌 折叠工兵铲", brand: "戊牌·掘救", spec: "把装 · 多功能", price: 79.0, unit: "把", subKey: "shovel", sales: 2400, rating: 4.6, score: 78, emoji: "🪏", tags: ["论把买", "挖掘破拆"], desc: "单把起买，挖掘/破拆多用，折叠便携，地震场景按需带。" },
  { id: "p-docs-cash-1", gearId: "docsmoney", name: "丙牌 应急现金收纳包", brand: "丙牌·藏金", spec: "个装 · 隐蔽收纳", price: 15.0, unit: "个", subKey: "cash", sales: 3400, rating: 4.6, score: 80, emoji: "💵", tags: ["论个买", "断网可用"], desc: "单个起买，隐蔽存放零钞+整钞，断电断网刷卡扫码失效时保命。" },
  { id: "p-docs-phone-1", gearId: "docsmoney", name: "丁牌 备用应急手机（充满备用）", brand: "丁牌·备联", spec: "部装 · 存好联系人", price: 199.0, unit: "部", subKey: "phone", sales: 2600, rating: 4.5, score: 79, emoji: "📱", tags: ["论部买", "应急通讯"], desc: "单部起买，存好联系人充满电，主力机没电时保持通讯。" },
  { id: "p-docs-map-1", gearId: "docsmoney", name: "戊牌 本地纸质地图 + 记号笔", brand: "戊牌·寻路", spec: "套装 · 断网可用", price: 12.0, unit: "套", subKey: "map", sales: 3100, rating: 4.5, score: 78, emoji: "🗺️", tags: ["论套买", "规划路线"], desc: "单套起买，断网无导航时规划撤离/集合路线，记号笔标记。" },
  { id: "p-hyg-tooth-1", gearId: "hygienekit", name: "丙牌 旅行装牙刷牙膏", brand: "丙牌·洁齿", spec: "套装 · 便携", price: 6.9, unit: "套", subKey: "tooth", sales: 5200, rating: 4.6, score: 82, emoji: "🪥", tags: ["论套买", "口腔清洁"], desc: "单套起买，口腔清洁防病，旅行装轻便随身带。" },
  { id: "p-hyg-soap-1", gearId: "hygienekit", name: "丁牌 便携香皂 / 肥皂", brand: "丁牌·净手", spec: "块装 · 便携", price: 3.9, unit: "块", subKey: "soap", sales: 4300, rating: 4.5, score: 80, emoji: "🧼", tags: ["论块买", "清洁防病"], desc: "单块起买，清洁防病，便携装不占空间。" },
  { id: "p-hyg-tissue-1", gearId: "hygienekit", name: "戊牌 便携纸巾", brand: "戊牌·柔纸", spec: "包装 · 多用途", price: 2.0, unit: "包", subKey: "tissue", sales: 6800, rating: 4.6, score: 81, emoji: "🧻", tags: ["论包买", "多用途"], desc: "单包起买，擦拭、清洁多用途，独立小包随手取。" },
  { id: "p-hyg-towel-1", gearId: "hygienekit", name: "己牌 压缩毛巾", brand: "己牌·遇水开", spec: "片装 · 遇水膨胀", price: 1.0, unit: "片", subKey: "towel", sales: 5100, rating: 4.5, score: 79, emoji: "🧽", tags: ["论片买", "省空间"], desc: "单片起买，遇水膨胀成毛巾，极省空间，随身应急清洁。" },
  { id: "p-hyg-condom-1", gearId: "hygienekit", name: "庚牌 避孕套（多用途）", brand: "庚牌·多用", spec: "只装 · 防水储水", price: 2.0, unit: "只", subKey: "condom", sales: 4100, rating: 4.4, score: 77, emoji: "🎈", tags: ["论只买", "多用途"], desc: "单只起买，防水储水、包扎止血多用途，轻便应急好物。" },
  { id: "p-hyg-earplug-1", gearId: "hygienekit", name: "辛牌 降噪耳塞", brand: "辛牌·静眠", spec: "副装 · 降噪", price: 3.0, unit: "副", subKey: "earplug", sales: 3600, rating: 4.5, score: 78, emoji: "🔇", tags: ["论副买", "助眠"], desc: "单副起买，避难场所降噪助眠，稳定情绪好休息。" },
  { id: "p-hyg-wetwipe-1", gearId: "hygienekit", name: "壬牌 擦浴湿巾", brand: "壬牌·净肤", spec: "包装 · 全身清洁", price: 8.9, unit: "包", subKey: "wetwipe", sales: 4000, rating: 4.5, score: 77, emoji: "🧴", tags: ["论包买", "缺水清洁"], desc: "单包起买，缺水时全身清洁，防皮肤感染，密封防潮。" },
  { id: "p-cloth-socks-1", gearId: "clothing", name: "丙牌 速干袜", brand: "丙牌·干足", spec: "双装 · 速干", price: 9.9, unit: "双", subKey: "socks", sales: 5100, rating: 4.5, score: 80, emoji: "🧦", tags: ["论双买", "涉水更换"], desc: "单双起买，涉水后更换防泡烂，透气速干护足。" },
  { id: "p-cloth-undies-1", gearId: "clothing", name: "丁牌 一次性内裤 / 袜", brand: "丁牌·净换", spec: "套装 · 一次性", price: 3.9, unit: "套", subKey: "undies", sales: 4600, rating: 4.5, score: 78, emoji: "🩲", tags: ["论套买", "卫生便捷"], desc: "单套起买，卫生便捷，缺水时无需清洗直接更换。" },
  { id: "p-sleep-mat-1", gearId: "sleepgear", name: "丙牌 卷装防潮垫", brand: "丙牌·隔潮", spec: "个装 · 隔潮隔凉", price: 39.0, unit: "个", subKey: "mat", sales: 3200, rating: 4.6, score: 80, emoji: "🛏️", tags: ["论个买", "隔潮隔凉"], desc: "单个起买，隔潮隔凉，户外过夜/安置时垫身更舒适。" },
  { id: "p-cook-stove-1", gearId: "cookset", name: "丙牌 户外炉头", brand: "丙牌·点火", spec: "个装 · 配气罐", price: 49.0, unit: "个", subKey: "stove", sales: 2600, rating: 4.6, score: 80, emoji: "🔥", tags: ["论个买", "配气罐用"], desc: "单个起买，配气罐使用，长期避险烧水热食好帮手。" },
  { id: "p-cook-kettle-1", gearId: "cookset", name: "丁牌 不锈钢 / 软水壶", brand: "丁牌·盛水", spec: "个装 · 烧水装水", price: 29.0, unit: "个", subKey: "kettle", sales: 2900, rating: 4.5, score: 78, emoji: "🫖", tags: ["论个买", "两用"], desc: "单个起买，烧水/装水两用，配炉头长期避险更方便。" },
];

// 某物资大类下的全部单品（按推荐评分降序）
export function productsByGear(gearId: string): Product[] {
  return PRODUCTS.filter((p) => p.gearId === gearId).sort((a, b) => b.score - a.score);
}

// 某物资大类的最优推荐单品（评分最高）
export function topProduct(gearId: string): Product | null {
  return productsByGear(gearId)[0] ?? null;
}

// 一键打包配量：按商品对应二级子物品的「建议量 / 最低基线量」×人数得到下单数量。
// basis="full" 取建议量（满配）；basis="base" 取最低基线量（精简）。
// 无 subKey（非消耗品，如背包/头盔/报警器）按 1 件计。
export function packQtyForProduct(p: Product, members: number, basis: "full" | "base"): number {
  if (!p.subKey) return 1;
  const sub = getSubItems(p.gearId)?.find((s) => s.key === p.subKey);
  if (!sub) return 1;
  const q = basis === "base" ? scaledBaseline(sub, members) : scaledRecommended(sub, members);
  return Math.max(1, q); // 至少买 1，避免基线为 0 时打包漏项
}

export function getProduct(id: string): Product | null {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

// 二级清单某个子物品对应的商品：优先精确匹配 subKey 的单品（评分最高者）；
// 没有精确匹配时回退到该物资评分最高的单品，保证「去购物」始终有落地页。
export function productForSub(gearId: string, subKey: string): Product | null {
  const exact = productsByGear(gearId).filter((p) => p.subKey === subKey);
  if (exact.length > 0) return exact[0]; // productsByGear 已按 score 降序
  return topProduct(gearId);
}

// 社区页聚合：全部单品（按推荐评分降序）
export function allProducts(): Product[] {
  return [...PRODUCTS].sort((a, b) => b.score - a.score);
}

// —— 虚构用户评价池（演示）：按物资大类归类，供社区首页高赞展示与详情页评价区使用 ——
const REVIEWS_BY_GEAR: Record<string, Review[]> = {
  water: [
    { user: "囤水的老张", rating: 5, likes: 328, text: "整箱放阳台，停水那两天全靠它，瓶装分着喝也方便。" },
    { user: "两娃妈妈", rating: 5, likes: 156, text: "保质期够长，半年轮换一次一点不浪费。" },
    { user: "租房青年", rating: 4, likes: 63, text: "性价比高，就是整箱有点占地方。" },
  ],
  food: [
    { user: "徒步老李", rating: 5, likes: 402, text: "压缩饼干顶饿，一块扛半天，背包必备。" },
    { user: "健身小王", rating: 5, likes: 188, text: "能量棒随手一根就补上了，撤离路上救命。" },
    { user: "细心的妈", rating: 4, likes: 71, text: "口味一般但热量够，应急就图个稳。" },
  ],
  homefood: [
    { user: "停电亲历者", rating: 5, likes: 271, text: "自热米饭真香，那次燃气停了全家吃上热饭。" },
    { user: "囤货达人", rating: 4, likes: 94, text: "罐头耐放，开盖即食，就是钠有点高。" },
  ],
  waterstore: [
    { user: "有娃家庭", rating: 5, likes: 143, text: "折叠桶不用时收起来，接满能撑好几天生活用水。" },
    { user: "务实派", rating: 4, likes: 58, text: "龙头设计好用，倒水不洒。" },
  ],
  firstaid: [
    { user: "带队老师", rating: 5, likes: 356, text: "分格清楚，找东西不慌，孩子擦伤马上能处理。" },
    { user: "户外向导", rating: 5, likes: 129, text: "该有的都有，出门就塞包里，很安心。" },
  ],
  flashlight: [
    { user: "夜班司机", rating: 5, likes: 210, text: "手摇也能发电，停电摸黑那次太顶用了。" },
    { user: "极简党", rating: 4, likes: 66, text: "亮度够，还能给手机应急充电。" },
  ],
  battery: [
    { user: "通勤族", rating: 5, likes: 512, text: "容量实在，出门带一个心里踏实。" },
    { user: "数码控", rating: 4, likes: 88, text: "双向快充方便，充满自己也快。" },
  ],
  radio: [
    { user: "老派备灾", rating: 5, likes: 174, text: "断网那阵子全靠它听预警，手摇不怕没电。" },
  ],
  smokemask: [
    { user: "高层住户", rating: 5, likes: 233, text: "演练戴过，浓烟里能正常呼吸，放床头很安心。" },
    { user: "谨慎的人", rating: 4, likes: 47, text: "希望永远用不上，但必须备一个。" },
  ],
  extinguisher: [
    { user: "备灾老王", rating: 5, likes: 289, text: "厨房必备，油锅起火按住就灭了。" },
    { user: "高层住户L", rating: 4, likes: 102, text: "分量合适，记得每年看压力表。" },
  ],
  quakehelmet: [
    { user: "四川网友", rating: 5, likes: 318, text: "床头放一个，摇起来第一时间戴上真的稳。" },
    { user: "折叠党", rating: 4, likes: 55, text: "能折叠不占地，抽屉就能放。" },
  ],
  quakewhistle: [
    { user: "登山客", rating: 5, likes: 196, text: "声音特别大，喊破嗓子不如吹一下省力。" },
  ],
  floodvest: [
    { user: "沿海居民", rating: 5, likes: 167, text: "去年发大水穿着心里有底，浮力足。" },
  ],
  floodbag: [
    { user: "细节控", rating: 5, likes: 121, text: "证件手机塞进去泡水也不怕，撤离背着就走。" },
  ],
  windtape: [
    { user: "广东街坊", rating: 5, likes: 208, text: "台风来之前贴上米字，玻璃稳稳的没碎。" },
  ],
  raincoat: [
    { user: "外卖小哥", rating: 4, likes: 73, text: "分体的比一次性结实太多，大风也不灌水。" },
  ],
  gasalarm: [
    { user: "租房小陈", rating: 5, likes: 245, text: "半夜误开灶报警了，真·救命装备。" },
    { user: "顾家的人", rating: 4, likes: 81, text: "灵敏度不错，选带自动关阀的更省心。" },
  ],
  doorguard: [
    { user: "独居女生", rating: 5, likes: 302, text: "睡觉更安心了，门一动就响，声音够大。" },
    { user: "出租屋党", rating: 4, likes: 64, text: "免打孔贴上就行，搬家还能带走。" },
  ],
};

// 该商品的评论列表（按点赞降序）；无专属池时回退到通用好评
export function reviewsFor(productId: string): Review[] {
  const p = getProduct(productId);
  const pool = (p && REVIEWS_BY_GEAR[p.gearId]) ?? [
    { user: "备灾用户", rating: 5, likes: 42, text: "关键时刻用得上，早备早安心。" },
  ];
  return [...pool].sort((a, b) => b.likes - a.likes);
}

// 该商品最高赞的一条评论（社区首页卡片用）
export function topReview(productId: string): Review | null {
  return reviewsFor(productId)[0] ?? null;
}
