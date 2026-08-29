// 地域灾害风险判定（省级，参照中国真实地理：地震带 / 沿海台风影响区 / 主要流域易涝区）。
// 仅对「地震 / 洪水 / 台风」做地域判断；火灾 / 燃气 / 入室抢劫 视为全国通用。
import type { DisasterId } from "@/lib/prep/domain";

// 需要做地域判断的灾害；其余灾害一律视为「本地有风险」（全国通用）。
export const GEO_DISASTERS: DisasterId[] = ["earthquake", "flood", "typhoon"];

// 每个省对应「有风险」的地域灾害集合。未列出的灾害即视为该省无此风险。
// 依据：地震——华北(京津)、川陕滇等地震带活跃区；台风——沿海省份；洪水——长江/珠江等多雨易涝流域。
const PROVINCE_RISK: Record<string, DisasterId[]> = {
  北京市: ["earthquake"],                     // 华北地震带
  天津市: ["earthquake", "typhoon"],           // 华北地震带 + 渤海沿海偶受台风
  上海市: ["flood", "typhoon"],                // 沿海 + 长江口易涝，地震风险低
  重庆市: ["earthquake", "flood"],             // 邻近地震带 + 长江流域易涝，内陆无台风
  广东省: ["flood", "typhoon"],                // 台风重灾区 + 珠江流域易涝
  江苏省: ["flood", "typhoon"],                // 沿海 + 江淮易涝
  浙江省: ["flood", "typhoon"],                // 台风重灾区 + 多雨易涝
  四川省: ["earthquake", "flood"],             // 龙门山等强震带 + 盆地易涝，内陆无台风
  湖北省: ["flood"],                           // 长江中游易涝，内陆无台风、地震低
  陕西省: ["earthquake"],                      // 关中—渭河地震带
  山东省: ["earthquake", "typhoon"],           // 郯庐地震带 + 半岛沿海受台风
  河南省: ["flood"],                           // 黄淮易涝，内陆无台风、地震较低
  福建省: ["earthquake", "flood", "typhoon"],  // 东南沿海台风重灾 + 沿海地震带 + 多雨
};

// 判断某地址（按省）对某灾害是否「本地有风险」。
// 非地域判断类灾害（火灾/燃气/入室抢劫）恒为 true；未知省份为安全起见也返回 true（不误伤）。
export function hasLocalRisk(province: string | undefined, disaster: DisasterId): boolean {
  if (!GEO_DISASTERS.includes(disaster)) return true;
  if (!province || !(province in PROVINCE_RISK)) return true;
  return PROVINCE_RISK[province].includes(disaster);
}

// 找出用户「在意」但本地实际无风险的地域类灾害（用于清单上方提醒）。
export function lowRiskConcerns(
  province: string | undefined,
  concerned: DisasterId[] | undefined,
): DisasterId[] {
  return (concerned ?? []).filter(
    (d) => GEO_DISASTERS.includes(d) && !hasLocalRisk(province, d),
  );
}
