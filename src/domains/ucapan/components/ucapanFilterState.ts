export type TriState = "all" | "true" | "false";

export interface UcapanFilterState {
  search: string;
  hasPhoto: TriState;
  hasVoice: TriState;
  dateFrom: string;
  dateTo: string;
}

export const DEFAULT_UCAPAN_FILTERS: UcapanFilterState = {
  search: "",
  hasPhoto: "all",
  hasVoice: "all",
  dateFrom: "",
  dateTo: "",
};

export function hasActiveUcapanFilter(f: UcapanFilterState): boolean {
  return (
    f.search.trim() !== "" || f.hasPhoto !== "all" || f.hasVoice !== "all" || f.dateFrom !== "" || f.dateTo !== ""
  );
}

export function triToBool(v: TriState): boolean | undefined {
  return v === "all" ? undefined : v === "true";
}
