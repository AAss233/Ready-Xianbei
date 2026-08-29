import type { DisasterId } from "./domain";

// 灾中快速行动指导（大字号，按灾害差异化）
export interface ActionStep {
  code: string; // 01 / 02 / 03
  title: string; // DROP / COVER
  titleCn: string; // 大标题：几个字点明行动（如“断源”）
  sub?: string; // 小标题：一句话说清做什么
  desc: string; // 细节：不明白再看的详细说明
  icon: string;
}

export interface DisasterGuide {
  disaster: DisasterId;
  golden: string; // 黄金 X 秒
  steps: ActionStep[];
  notes: string[];
}

export const GUIDES: Record<string, DisasterGuide> = {
  burglary: {
    disaster: "burglary",
    golden: "安全第一",
    steps: [
      { code: "01", title: "HIDE", titleCn: "隐蔽", desc: "保持冷静，躲到安全房间，锁好房门，不要贸然对峙。", icon: "shield" },
      { code: "02", title: "CALL", titleCn: "报警", desc: "悄悄拨打 110，小声说明地址与情况，保持通话。", icon: "phone" },
      { code: "03", title: "SAFE", titleCn: "自保", desc: "以人身安全为先，财物可弃，寻找机会安全撤离。", icon: "user" },
    ],
    notes: ["不要为财物与对方搏斗", "记住对方特征便于报警", "撤离后到邻居或公共场所求助"],
  },
  gas: {
    disaster: "gas",
    golden: "切勿动火动电",
    steps: [
      { code: "01", title: "VALVE", titleCn: "关阀", desc: "立即关闭燃气总阀，切断气源。", icon: "power" },
      { code: "02", title: "VENT", titleCn: "通风", desc: "轻轻打开门窗自然通风，切勿开关任何电器与灯具。", icon: "wind" },
      { code: "03", title: "OUT", titleCn: "撤离", desc: "迅速离开到室外空旷处，再拨打燃气抢修与报警电话。", icon: "footprints" },
    ],
    notes: ["严禁使用明火、打火机、电器开关", "不要在室内打电话", "确认泄漏排除前不得返回"],
  },
  earthquake: {
    disaster: "earthquake",
    golden: "能跑先跑，跑不掉就地护",
    steps: [
      { code: "01", title: "JUDGE", titleCn: "先判断", sub: "有时间就往空旷处跑", desc: "如果身处一楼或门口、有预警时间，立即跑向室外空旷地带，避开楼梯口拥挤；走安全通道、绝不乘电梯。来不及跑就执行下一步。", icon: "footprints" },
      { code: "02", title: "PROTECT", titleCn: "就地护", sub: "趴下·掩护·抓牢", desc: "跑不出去时立即趴下，躲到坚固桌子下或承重墙墙角，用手护住头颈，抓牢固定物，远离窗户、玻璃与吊灯。", icon: "shield" },
      { code: "03", title: "EVACUATE", titleCn: "撤离", sub: "晃停后走楼梯到空旷处", desc: "主震晃动停止后，沿安全楼梯迅速撤到室外空旷地带，警惕余震与坠物、燃气泄漏等次生灾害。", icon: "arrow-up" },
    ],
    notes: ["全程绝不乘电梯，走安全楼梯", "远离外墙、窗户、广告牌与高压线", "余震可能反复，撤到空旷处后别急着回屋"],
  },
  fire: {
    disaster: "fire",
    golden: "黄金 3 分钟",
    steps: [
      { code: "01", title: "ALERT", titleCn: "报警", desc: "立即呼喊报警并拨打 119，通知同层住户。", icon: "siren" },
      { code: "02", title: "LOW", titleCn: "低姿", desc: "湿毛巾捂口鼻，弯腰低姿沿楼梯撤离。", icon: "arrow-down" },
      { code: "03", title: "STAIRS", titleCn: "走楼梯", desc: "切勿乘电梯，触摸门把判断门外火情。", icon: "footprints" },
    ],
    notes: ["浓烟中低姿前进，避免吸入有毒气体", "门把手发烫说明门外有火，另寻出路", "无法撤离时退守房间、堵缝、向窗外求救"],
  },
  flood: {
    disaster: "flood",
    golden: "先断电源气源，再转移",
    steps: [
      { code: "01", title: "POWER", titleCn: "断源", sub: "先关总电闸与燃气阀", desc: "在家的第一步：立即关闭家中总电闸与燃气总阀，拔下电器插头，避免涉水触电与漏气。", icon: "power" },
      { code: "02", title: "MOVE", titleCn: "转移", sub: "向高处走，穿包脚的鞋", desc: "向高处转移，避开积水暗流、下水道口与带电线缆。若必须涉水，穿能包裹全脚的运动鞋或雨靴，切勿穿拖鞋、洞洞鞋（易被水下杂物划伤或被水流冲脱）。", icon: "footprints" },
      { code: "03", title: "WAIT", titleCn: "候援", sub: "高处等待，穿好救生衣", desc: "转移到楼房高层或坚固高处等待救援，穿好救生衣或抱紧漂浮物；有皮划艇、橡皮艇时优先使用，向救援人员挥动亮色衣物或灯光发信号。", icon: "arrow-up" },
      { code: "04", title: "CONTACT", titleCn: "保通讯", sub: "保电量，报平安", desc: "保持手机与充电宝电量，用手电或收音机接收官方转移与救援信息，并告知家人所在位置。", icon: "radio" },
    ],
    notes: [
      "不要在积水中行走或驾车通过漫水路段，约 30cm 深的流水即可冲倒成人、冲走车辆",
      "远离电线杆、变压器与一切带电设施",
      "涉水后及时清洁消毒双脚与伤口，防止感染",
    ],
  },
  typhoon: {
    disaster: "typhoon",
    golden: "提前防护",
    steps: [
      { code: "01", title: "SECURE", titleCn: "加固", desc: "加固门窗，收好阳台与室外杂物。", icon: "shield" },
      { code: "02", title: "INDOOR", titleCn: "留室内", desc: "台风期间待在室内，远离门窗玻璃。", icon: "home" },
      { code: "03", title: "STOCK", titleCn: "备物资", desc: "备足饮水、食物、照明与药品。", icon: "package" },
    ],
    notes: ["不要外出，谨防高空坠物", "台风眼过境后仍有强风，勿掉以轻心", "关注官方预警与停电通知"],
  },
};

export function getGuide(d: DisasterId): DisasterGuide | undefined {
  return GUIDES[d];
}
