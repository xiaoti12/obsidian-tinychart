export interface PluginSettings {
	fillChar: string;
	emptyChar: string;
	zeroPointChar: string;
	showZeroPoint: boolean;
	prefixChar: string;
	suffixChar: string;
	chartLength: number;
	codeBlock: boolean;
	showLabels: boolean;
	rightAlignLabels: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	fillChar: "█",
	emptyChar: "-",
	zeroPointChar: "|",
	showZeroPoint: true,
	prefixChar: "",
	suffixChar: "",
	chartLength: 20,
	codeBlock: true,
	showLabels: true,
	rightAlignLabels: true,
};
