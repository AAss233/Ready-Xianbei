import { Pill } from "lucide-react";
import { Panel, SectionLabel } from "@/components/shell/ui";
import { MED_GUIDE, MED_DISCLAIMER } from "@/lib/prep/med-guide";

// 药症速查表：常见症状 → 对应常用药 / 用法。展示在「急救医疗包」详情页。
export function MedGuide() {
  return (
    <Panel className="p-4" data-el="item-med-guide">
      <SectionLabel en="MED CHEAT SHEET" cn="药症速查卡" />
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
        按症状快速对应常用药，断网时也能照卡去药店找药自救。
      </p>
      <ul className="mt-2 divide-y divide-ink/10">
        {MED_GUIDE.map((r) => (
          <li key={r.symptom} className="py-2.5">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-ink">
              <Pill className="h-3.5 w-3.5 shrink-0 text-primary" />
              {r.symptom}
            </div>
            <div className="mt-1 text-[12px] font-semibold text-primary">{r.drugs}</div>
            <div className="text-[11px] leading-snug text-muted-foreground">{r.usage}</div>
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-ink/10 pt-2 text-[10px] leading-snug text-muted-foreground">
        {MED_DISCLAIMER}
      </p>
    </Panel>
  );
}
