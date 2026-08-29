// 来自 READY 小游戏题库（已去重去套话前缀，保留精炼核心题）
// 判断题（√/×）：题干挖生活误区，答错给一句毒舌金句 + 一句极简科普（讲“为什么”，不用命令口吻）。
// 大部分题是“错误直觉”(答案 ×)，另掺入正确做法题(答案 √) 打破规律。
import type { DisasterId } from "./domain";

export interface JudgeQuestion {
  id: string;
  disaster: DisasterId | "general";
  statement: string; // 题目：一个容易踩的错误直觉
  truth: boolean;    // 说法是否正确（√=true / ×=false）
  quip: string;      // 答错时的毒舌金句
  fact: string;      // 答错时的极简科普（陈述“为什么”，不用命令语气）
}

export const JUDGE_BANK: JudgeQuestion[] = [
  { id: "q1", disaster: "general", statement: "灾害预警来了，再准备东西也来得及？", truth: false, quip: "时间：我没答应等你。", fact: "预警到发生往往只有一小会儿，临时才凑东西通常来不及。" },
  { id: "q2", disaster: "general", statement: "上次没出事，这次应该也不会出事？", truth: false, quip: "运气可以有，不能拿来当计划。", fact: "上次没事只是运气，风险每次都不一样。" },
  { id: "q3", disaster: "general", statement: "家里人默认都知道紧急情况下去哪集合？", truth: false, quip: "“默认设置”最容易掉线。", fact: "没提前说好，慌乱时很容易走散、联系不上。" },
  { id: "q4", disaster: "general", statement: "手机有电，就等于什么信息都能解决？", truth: false, quip: "手机：别给我安排这么多活。", fact: "断网断电时手机也会失灵，照明和信息备份同样重要。" },
  { id: "q5", disaster: "general", statement: "应急包越重越专业，能塞多少塞多少？", truth: false, quip: "包：我只是包，不是健身器材。", fact: "太重反而拎不动、跑不快，够用便携才实用。" },
  { id: "q6", disaster: "general", statement: "应急包放在家里最里面，需要时再找？", truth: false, quip: "记得在哪，和找得到是两回事。", fact: "真出事时争分夺秒，放门口顺手处才拿得到。" },
  { id: "q7", disaster: "general", statement: "应急包做好了就不用检查了？", truth: false, quip: "不会消失，只会悄悄过期。", fact: "食品、药品、电池都会过期或没电，隔段时间看一眼更靠谱。" },
  { id: "q8", disaster: "general", statement: "一家人准备完全一样的应急包就够了？", truth: false, quip: "一家人，需求可不一样。", fact: "老人、小孩、宠物需要的东西不同，一刀切容易漏。" },
  { id: "q9", disaster: "gas", statement: "屋里闻到燃气味，开抽油烟机吸一下？", truth: false, quip: "小手一按，火花蹦。", fact: "开关电器的瞬间会打火花，容易点燃聚集的燃气。" },
  { id: "q10", disaster: "gas", statement: "闻到燃气味，开灯找找哪里漏？", truth: false, quip: "灯：这活我真干不了。", fact: "开灯也是通电动作，同样可能引爆积聚的燃气。" },
  { id: "q11", disaster: "gas", statement: "闻到燃气味，点火确认一下？", truth: false, quip: "这检测方式，多少有点积极。", fact: "用明火验证漏气，等于直接给泄漏的燃气点火。" },
  { id: "q12", disaster: "gas", statement: "怀疑燃气泄漏，继续留在厨房找原因？", truth: false, quip: "侦探工作，今天先暂停。", fact: "燃气聚多了有中毒和爆燃风险，先离开更安全。" },
  { id: "q13", disaster: "fire", statement: "起火了，电脑还在房里，冲进去拿一下很快就出来？", truth: false, quip: "电脑：我不值得你这么拼。", fact: "火场里烟气和高温几秒就能致命，东西没了还能再买。" },
  { id: "q14", disaster: "fire", statement: "火灾时电梯还能用，坐电梯下楼更快？", truth: false, quip: "电梯：今天不接这个单。", fact: "火灾常会断电、被烟灌入，电梯里更容易被困。" },
  { id: "q15", disaster: "fire", statement: "油锅起火，直接往锅里泼水？", truth: false, quip: "水：我来帮你把事情做大。", fact: "水遇热油会炸开、火苗四溅，盖锅盖断氧更有效。" },
  { id: "q16", disaster: "fire", statement: "看到烟不多，就可以继续往里面走？", truth: false, quip: "烟少，不代表事情少。", fact: "烟气扩散极快，现在少不代表下一刻还安全。" },
  { id: "q17", disaster: "earthquake", statement: "地震晃得不厉害，站在门口比躲起来更方便逃跑？", truth: false, quip: "门：你猜猜我和墙谁更结实？", fact: "晃动时头顶随时可能掉东西，就近躲避护住头颈更稳妥。" },
  { id: "q18", disaster: "earthquake", statement: "地震来了，抓紧冲下楼跑到空地总没错？", truth: false, quip: "楼梯：我今天也不太稳定。", fact: "晃动中跑动容易摔倒或被坠物砸中，震停后再撤更安全。" },
  { id: "q19", disaster: "earthquake", statement: "地震刚停，马上回受损建筑拿手机？", truth: false, quip: "手机：我等得起，你先别回来。", fact: "余震随时可能来，受损建筑此时最容易二次坍塌。" },
  { id: "q20", disaster: "earthquake", statement: "地震时站在窗边看看外面发生了什么？", truth: false, quip: "玻璃：今天不负责观景。", fact: "晃动会震碎玻璃，窗边是最容易被割伤的位置。" },
  { id: "q21", disaster: "flood", statement: "洪水还没漫上来，地下车库的车现在开出去应该还来得及？", truth: false, quip: "车：好耶，今夜我就要远航。", fact: "地下车库进水极快，水一涨车就可能漂起来、人被困住。" },
  { id: "q22", disaster: "flood", statement: "积水看着不深，走过去应该没问题？", truth: false, quip: "看起来浅，底下可没答应。", fact: "浑水看不清底下的暗流、井盖和坑洞，深浅很难判断。" },
  { id: "q23", disaster: "flood", statement: "车还能开，就继续开过积水？", truth: false, quip: "车：我感觉我也没那么自信。", fact: "水到一定深度车就会熄火甚至漂浮，方向都控制不住。" },
  { id: "q24", disaster: "flood", statement: "洪水退了一点，就能进地下车库拿东西？", truth: false, quip: "水退一点，不代表危险也退场。", fact: "退水后地下仍可能有积水、漏电和淤泥，危险没真正解除。" },
  { id: "q25", disaster: "typhoon", statement: "台风又没来，上次也没事，这次应该也没事？", truth: false, quip: "运气可以有，准备也得有。", fact: "每次台风路径和强度都不同，靠上次的经验不保险。" },
  { id: "q26", disaster: "typhoon", statement: "台风预警了，花盆等风来了再收？", truth: false, quip: "花盆：我已经开始规划航线了。", fact: "大风一起就来不及了，阳台上的东西会被吹成“炮弹”。" },
  { id: "q27", disaster: "typhoon", statement: "台风天站阳台看看风有多大？", truth: false, quip: "风：来都来了，给你加点参与感。", fact: "阳台和窗边最容易被飞来的杂物和碎玻璃击中。" },
  { id: "q28", disaster: "typhoon", statement: "台风天走树下面避雨，应该比淋雨强？", truth: false, quip: "树：今天也不保证站得住。", fact: "强风里树枝、广告牌都可能砸下来，树下反而更危险。" },
  { id: "q29", disaster: "burglary", statement: "回家发现门锁不太对，先进去看看少了什么？", truth: false, quip: "家里的东西不会跑，先让自己别进去。", fact: "对方可能还在屋里，先离开报警比查东西安全得多。" },
  { id: "q30", disaster: "burglary", statement: "半夜有人自称物业，开门确认一下？", truth: false, quip: "物业这班，确实有点晚。", fact: "深夜上门本身就反常，没核实身份开门风险很大。" },
  { id: "q31", disaster: "burglary", statement: "有人尾随回家，赶紧进电梯甩掉对方？", truth: false, quip: "电梯：这局我建议别开。", fact: "电梯是封闭空间，反而把自己和尾随者关到了一起。" },
  { id: "q32", disaster: "burglary", statement: "陌生人说认识家人，就可以让他进门？", truth: false, quip: "认识谁，和进谁家是两回事。", fact: "“认识家人”只是一句话，核实之前开门风险未知。" },
  { id: "q33", disaster: "general", statement: "应急包这次没用上，放回原处就行？", truth: false, quip: "没用上是运气，不是免检。", fact: "经历一次灾害后，物资状态和数量都值得重新看一遍。" },
  { id: "q34", disaster: "general", statement: "灾后用掉的物资，以后想起来再补？", truth: false, quip: "下次：不一定提前通知。", fact: "下一次可能来得很突然，用掉的东西尽早补才安心。" },

  // ── 正确做法题（答案 √），打破“全选×”规律 ──
  { id: "q35", disaster: "earthquake", statement: "地震正在晃，先躲到结实桌子下护住头颈，等震停再撤？", truth: true, quip: "别急着否定对的那个。", fact: "就近躲避、护住头颈能挡住多数坠物，是公认的做法。" },
  { id: "q36", disaster: "fire", statement: "浓烟里逃生，弯低身子、捂住口鼻贴地走？", truth: true, quip: "这题你可别手滑。", fact: "烟气往上飘，贴地空气更干净，捂鼻能少吸有毒气体。" },
  { id: "q37", disaster: "gas", statement: "闻到燃气味，先关阀、开窗、到室外再打电话？", truth: true, quip: "对的操作也值得你点个√。", fact: "关阀通风能降浓度，室外打电话避免了打火花的风险。" },
  { id: "q38", disaster: "flood", statement: "洪水要来，提前往高处转移比留在低洼处更安全？", truth: true, quip: "这回别跟自己较劲。", fact: "水往低处走，去高处能避开上涨的积水和急流。" },
  { id: "q39", disaster: "typhoon", statement: "台风前把阳台杂物收进屋、加固好门窗？", truth: true, quip: "做得对，就大方承认。", fact: "提前收好易吹飞的东西、加固门窗，能少很多风灾损失。" },
  { id: "q40", disaster: "general", statement: "家里备一份饮用水和常用药，定期检查更换？", truth: true, quip: "对的事，别犹豫。", fact: "水和药是关键时刻的底气，定期更换才不会关键时掉链子。" },
  { id: "q41", disaster: "burglary", statement: "遇到入室者，优先躲好、悄悄报警而不是硬拼？", truth: true, quip: "命比东西值钱，这题选√。", fact: "保住自己再报警，比正面冲突安全得多。" },
  { id: "q42", disaster: "general", statement: "和家人约好紧急联络方式和集合地点？", truth: true, quip: "这么靠谱，给个√吧。", fact: "事先说好去哪碰头，走散时才不至于彼此干着急。" },
];
