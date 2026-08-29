"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Check } from "lucide-react";
import { AppShell, AtmosphereBg, Panel, Tag } from "@/components/shell/ui";
import { MenuButton } from "@/components/shell/side-drawer";
import { usePrep } from "@/stores/prep-store";
import {
  HOUSE_TYPES,
  SPECIAL_TAGS,
  profileSummary,
  type HouseType,
  type SpecialTag,
  type FamilyProfile,
  computeTags,
} from "@/lib/prep/rules";
import { PROVINCES, citiesOf, districtsOf, formatAddress } from "@/lib/prep/regions";
import { DISASTERS, getDisaster } from "@/lib/prep/domain";
import type { DisasterId } from "@/lib/prep/domain";
import { lowRiskConcerns } from "@/lib/prep/geo-risk";

// 需要用户补充具体内容的特别准备标签 → 输入提示
const TAG_NOTE_PROMPT: Partial<Record<SpecialTag, string>> = {
  长期用药: "填下常用药名 / 用量（如 降压药、胰岛素…）",
  特殊饮食: "填下忌口 / 特殊需求（如 无麸质、婴儿奶粉…）",
  行动辅助: "填下所用辅具（如 轮椅、拐杖、助行器…）",
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`border px-3 py-2 text-sm font-semibold transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-ink/25 bg-card text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ index, title, hint, children }: { index: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-lg font-bold leading-none text-primary">{index}</span>
        <div>
          <div className="font-heading text-[15px] font-bold text-ink">{title}</div>
          {hint && <div className="mt-0.5 text-[12px] text-muted-foreground">{hint}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

/** 与各导航页顶部一致的称号栏：菜单 + 大字标题 + 右侧当前称号 */
function TitleBar({ cnTitle, enLabel, rankTitle }: { cnTitle: string; enLabel: string; rankTitle: string }) {
  return (
    <div className="relative shrink-0 overflow-hidden border-b-2 border-ink bg-card" data-el="assess-titlebar">
      <AtmosphereBg src="/bg/tower.png" opacity={0.1} />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-4 -right-3 z-0 select-none font-heading text-[110px] font-bold leading-none text-ink/[0.05]"
      >
        {cnTitle}
      </span>
      <div
        className="relative z-10 flex items-end justify-between gap-2 px-4 pb-3 pt-3"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top, 0px))" }}
      >
        <div className="flex items-end gap-2.5">
          <div className="mb-0.5"><MenuButton /></div>
          <div>
            <div className="font-mono-label text-[11px] tracking-[0.2em] text-muted-foreground">{enLabel}</div>
            <h1 className="mt-0.5 font-heading text-4xl font-bold leading-none tracking-wide text-ink">{cnTitle}</h1>
          </div>
        </div>
        <div className="pb-0.5 text-right">
          <span className="mb-1 ml-auto block h-0.5 w-6 bg-primary" aria-hidden />
          <div className="font-heading text-xl font-bold leading-none text-primary">{rankTitle}</div>
        </div>
      </div>
    </div>
  );
}

export function AssessScreen() {
  const router = useRouter();
  const { profile, saveProfile, setForceInclude, dismissConcern, title } = usePrep();

  const [province, setProvince] = useState(profile?.province ?? "");
  const [cityName, setCityName] = useState(profile?.cityName ?? "");
  const [district, setDistrict] = useState(profile?.district ?? "");
  const [houseType, setHouseType] = useState<HouseType | "">(profile?.houseType ?? "");
  const [members, setMembers] = useState(profile?.members ?? 1);
  const [hasElderly, setHasElderly] = useState(profile?.hasElderly ?? false);
  const [hasChildren, setHasChildren] = useState(profile?.hasChildren ?? false);
  const [hasPets, setHasPets] = useState(profile?.hasPets ?? false);
  const [hasFemale, setHasFemale] = useState(profile?.hasFemale ?? false);
  const [hasPregnant, setHasPregnant] = useState(profile?.hasPregnant ?? false);
  const [specialTags, setSpecialTags] = useState<SpecialTag[]>(profile?.specialTags ?? []);
  const [concerned, setConcerned] = useState<DisasterId[]>(profile?.concernedDisasters ?? []);
  const [notes, setNotes] = useState<Partial<Record<SpecialTag, string>>>({});
  const [result, setResult] = useState<FamilyProfile | null>(null);
  // 结果页：本地低风险在意灾害已处理集合（keep=就要 / drop=算了），处理后从提醒中隐藏
  const [geoHandled, setGeoHandled] = useState<Record<string, "keep" | "drop">>({});

  const toggleIn = <T,>(arr: T[], set: (v: T[]) => void, v: T) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const buildProfile = (): FamilyProfile => {
    const noteText = specialTags
      .map((t) => (notes[t]?.trim() ? `${t}：${notes[t]!.trim()}` : ""))
      .filter(Boolean)
      .join("；");
    return {
      city: formatAddress(province, cityName, district),
      province: province || undefined,
      cityName: cityName || undefined,
      district: district || undefined,
      houseType: houseType || "other",
      members,
      hasElderly,
      hasChildren,
      hasPets,
      hasFemale,
      hasPregnant,
      specialNeeds: noteText,
      specialTags,
      concernedDisasters: concerned,
    };
  };

  const submit = () => {
    const p = buildProfile();
    saveProfile(p);
    setResult(p);
  };

  const skip = () => {
    // 什么都不填：保持初始「通用画像·待完善」状态，不落地任何画像，仅返回并使用通用清单
    router.back();
  };

  const familyToggles: { label: string; v: boolean; set: (b: boolean) => void }[] = [
    { label: "有老人", v: hasElderly, set: setHasElderly },
    { label: "有小孩", v: hasChildren, set: setHasChildren },
    { label: "有宠物", v: hasPets, set: setHasPets },
    { label: "有女性", v: hasFemale, set: setHasFemale },
    { label: "有孕妇", v: hasPregnant, set: setHasPregnant },
  ];

  // 结果页：突出一句话总结
  if (result) {
    const tags = computeTags(result);
    const summary = profileSummary(result);
    return (
      <AppShell withTab={false}>
        <TitleBar cnTitle="评估" enLabel="ASSESS" rankTitle={title.title} />
        <div className="relative shrink-0 overflow-hidden border-b-2 border-ink bg-card">
          <AtmosphereBg src="/bg/tower.png" opacity={0.12} />
          <div className="relative z-10 px-5 pb-6 pt-8">
            <div className="font-mono-label text-[11px] tracking-[0.2em] text-muted-foreground">YOUR PROFILE</div>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink">{summary}</h1>
            <p className="mt-2 text-[13px] text-muted-foreground">这就是你的一句话画像，会显示在首页和背包顶部。</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <Panel className="p-4">
            <div className="font-heading text-[15px] font-bold text-ink">清单会照这些帮你增减物资</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.length === 0 ? (
                <span className="text-sm text-muted-foreground">先用通用清单起步就好</span>
              ) : (
                tags.map((t) => <Tag key={t}>{t}</Tag>)
              )}
            </div>
          </Panel>

          {/* 本地低风险的在意灾害：让用户当场决定 保持不变 / 算了 */}
          {(() => {
            const alerts = lowRiskConcerns(result.province, result.concernedDisasters).filter(
              (d) => !geoHandled[d],
            );
            if (alerts.length === 0) return null;
            const keepDisaster = (d: DisasterId) => {
              setForceInclude(d, true); // 加回清单物资
              setGeoHandled((h) => ({ ...h, [d]: "keep" }));
            };
            const dropDisaster = (d: DisasterId) => {
              dismissConcern(d); // 从在意标签移除 → 清单无该物资
              setResult((r) =>
                r
                  ? { ...r, concernedDisasters: (r.concernedDisasters ?? []).filter((x) => x !== d) }
                  : r,
              );
              setConcerned((c) => c.filter((x) => x !== d));
              setGeoHandled((h) => ({ ...h, [d]: "drop" }));
            };
            return (
              <Panel className="border-amber-500/50 bg-amber-50 p-4">
                <div className="font-heading text-[15px] font-bold text-ink">你所在地区风险较低的灾害</div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  按当地地理环境，下面这些你不必过度囤货（相关知识仍会出现在小游戏里）。要保持就把物资留在清单，选「算了」会移除该标签、清单里也不再出现。
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {alerts.map((d) => (
                    <div
                      key={d}
                      className="flex items-center justify-between gap-2 border border-ink/15 bg-card px-3 py-2"
                    >
                      <span className="text-sm font-bold text-ink">{getDisaster(d)?.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => keepDisaster(d)}
                          className="border border-primary bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground"
                        >
                          保持不变
                        </button>
                        <button
                          onClick={() => dropDisaster(d)}
                          className="px-2 py-1 text-xs font-bold text-muted-foreground underline underline-offset-2"
                        >
                          算了
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            );
          })()}

          <button
            onClick={() => {
              // 未做选择的本地低风险在意灾害 → 默认「保持不变」（加进清单）
              lowRiskConcerns(result.province, result.concernedDisasters)
                .filter((d) => !geoHandled[d])
                .forEach((d) => setForceInclude(d, true));
              router.push("/bag");
            }}
            className="w-full border-2 border-primary bg-primary py-3 font-heading font-bold text-primary-foreground"
          >
            去看我的清单 ›
          </button>
          <button onClick={() => setResult(null)} className="w-full py-1 text-[13px] text-muted-foreground underline underline-offset-4">
            再改改
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell withTab={false}>
      <TitleBar cnTitle="评估" enLabel="ASSESS" rankTitle={title.title} />
      {/* Hero 头图 + 标题 */}
      <div className="relative shrink-0 overflow-hidden border-b-2 border-ink bg-card">
        <AtmosphereBg src="/bg/tower.png" opacity={0.12} />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-5 -right-2 z-0 select-none font-heading text-[96px] font-bold leading-none text-ink/[0.05]"
        >
          懂你
        </span>
        <div className="relative z-10 px-5 pb-6 pt-8">
          <div className="font-mono-label text-[11px] tracking-[0.2em] text-muted-foreground">MAKE IT YOURS</div>
          <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink">
            让清单<span className="text-primary">更懂你</span>
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">挑几个和你有关的就行，不填也没关系。</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-4 pb-8">
        <Section index="01" title="住得怎么样？" hint="用来判断火灾、进水、疏散这些风险">
          <div className="grid grid-cols-3 gap-2">
            {HOUSE_TYPES.map((h) => (
              <Chip key={h.id} active={houseType === h.id} onClick={() => setHouseType(houseType === h.id ? "" : h.id)}>
                {h.name}
              </Chip>
            ))}
          </div>
        </Section>

        <Section index="02" title="家里都有谁？" hint="老人、小孩、宠物需要的东西不一样">
          <div className="flex flex-wrap gap-2">
            {familyToggles.map((t) => (
              <Chip key={t.label} active={t.v} onClick={() => t.set(!t.v)}>
                {t.v && <Check className="mr-1 inline h-3.5 w-3.5" />}
                {t.label}
              </Chip>
            ))}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-[12px] text-muted-foreground">一共几口人</span>
            <button onClick={() => setMembers((m) => Math.max(1, m - 1))} className="flex h-8 w-8 items-center justify-center border border-ink/25 bg-card">
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-heading text-lg font-bold text-ink">{members}</span>
            <button onClick={() => setMembers((m) => m + 1)} className="flex h-8 w-8 items-center justify-center border border-ink/25 bg-card">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </Section>

        <Section index="03" title="在意什么情况？" hint="选了会在小游戏里多出这类相关题">
          <div className="flex flex-wrap gap-2">
            {DISASTERS.map((d) => (
              <Chip key={d.id} active={concerned.includes(d.id)} onClick={() => toggleIn(concerned, setConcerned, d.id)}>
                {d.name}
              </Chip>
            ))}
          </div>
        </Section>

        <Section index="04" title="住在哪一带？" hint="只到区县就够，用来估当地常见灾害">
          <div className="grid grid-cols-3 gap-2">
            <select
              value={province}
              onChange={(e) => { setProvince(e.target.value); setCityName(""); setDistrict(""); }}
              className="border border-ink/25 bg-card px-2 py-2 text-sm text-ink outline-none"
            >
              <option value="">省份</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={cityName}
              onChange={(e) => { setCityName(e.target.value); setDistrict(""); }}
              disabled={!province}
              className="border border-ink/25 bg-card px-2 py-2 text-sm text-ink outline-none disabled:opacity-40"
            >
              <option value="">城市</option>
              {citiesOf(province).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!cityName}
              className="border border-ink/25 bg-card px-2 py-2 text-sm text-ink outline-none disabled:opacity-40"
            >
              <option value="">区县</option>
              {districtsOf(province, cityName).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </Section>

        {/* 特别准备放最后一栏，选中后按需展开自定义输入 */}
        <Section index="05" title="特别准备？" hint="有这些的话，会帮你把对应物资加进清单">
          <div className="flex flex-wrap gap-2">
            {SPECIAL_TAGS.map((s) => (
              <Chip key={s} active={specialTags.includes(s)} onClick={() => toggleIn(specialTags, setSpecialTags, s)}>
                {s}
              </Chip>
            ))}
          </div>
          {specialTags
            .filter((t) => TAG_NOTE_PROMPT[t])
            .map((t) => (
              <input
                key={t}
                value={notes[t] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [t]: e.target.value }))}
                placeholder={TAG_NOTE_PROMPT[t]}
                className="mt-1 w-full border-b-2 border-ink/30 bg-transparent px-1 py-2 text-sm text-ink outline-none focus:border-primary"
                data-el={`assess-note-${t}`}
              />
            ))}
        </Section>

        <button
          onClick={submit}
          className="w-full border-2 border-primary bg-primary py-3 font-heading font-bold text-primary-foreground"
          data-el="assess-submit"
        >
          就按这些帮我准备 ›
        </button>
        <button onClick={skip} className="w-full py-1 text-[13px] text-muted-foreground underline underline-offset-4">
          都不填，先给我通用清单
        </button>
      </div>
    </AppShell>
  );
}
