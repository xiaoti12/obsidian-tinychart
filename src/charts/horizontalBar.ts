import { PluginSettings } from "../settings/pluginSettings";
import { DataEntry } from "./parseInput";

// 图表度量指标接口
interface ChartMetrics {
	maxValue: number;
	minValue: number;
	range: number;
	zeroPos: number;
	hasNegative: boolean;
	hasPositive: boolean;
}

// 计算图表度量指标
function calculateChartMetrics(
	data: DataEntry[],
	chartLength: number
): ChartMetrics {
	const values = data.map((entry) => entry.value);
	const maxValue = Math.max(...values, 0);
	const minValue = Math.min(...values, 0);
	const range = maxValue - minValue;
	const hasNegative = minValue < 0;
	const hasPositive = maxValue > 0;

	let zeroPos: number;
	if (minValue >= 0) {
		// 全正数：零点在最左侧
		zeroPos = 0;
	} else if (maxValue <= 0) {
		// 全负数：零点在最右侧
		zeroPos = chartLength;
	} else {
		// 正负混合：按比例分配空间
		zeroPos = Math.floor((Math.abs(minValue) / range) * chartLength);
	}

	return {
		maxValue,
		minValue,
		range,
		zeroPos,
		hasNegative,
		hasPositive,
	};
}

// 生成单条双向条形
function generateBidirectionalBar(
	value: number,
	metrics: ChartMetrics,
	chartLength: number,
	fillChar: string,
	emptyChar: string,
	zeroPointChar: string,
	showZeroPoint: boolean
): string {
	const { maxValue, minValue, zeroPos } = metrics;

	if (value === 0) {
		// 零值：仅显示零点标记
		const leftEmpty = emptyChar.repeat(zeroPos);
		const rightEmpty = emptyChar.repeat(chartLength - zeroPos);
		const zeroMark = showZeroPoint ? zeroPointChar : " ";
		return leftEmpty + zeroMark + rightEmpty;
	} else if (value > 0) {
		// 正数：从零点向右延伸
		const rightLength = Math.floor(
			(value / maxValue) * (chartLength - zeroPos)
		);
		const leftEmpty = emptyChar.repeat(zeroPos);
		const zeroMark = showZeroPoint ? zeroPointChar : " ";
		const rightFill = fillChar.repeat(rightLength);
		const rightEmpty = emptyChar.repeat(chartLength - zeroPos - rightLength);
		return leftEmpty + zeroMark + rightFill + rightEmpty;
	} else {
		// 负数：从零点向左延伸
		const leftLength = Math.floor(
			(Math.abs(value) / Math.abs(minValue)) * zeroPos
		);
		const leftEmpty = emptyChar.repeat(zeroPos - leftLength);
		const leftFill = fillChar.repeat(leftLength);
		const zeroMark = showZeroPoint ? zeroPointChar : " ";
		const rightEmpty = emptyChar.repeat(chartLength - zeroPos);
		return leftEmpty + leftFill + zeroMark + rightEmpty;
	}
}

export function generateBarChart(
	data: DataEntry[],
	settings: PluginSettings
): string {
	const chartLength: number = settings.chartLength;
	const fillChar: string = settings.fillChar;
	const emptyChar: string = settings.emptyChar;
	const zeroPointChar: string = settings.zeroPointChar;
	const showZeroPoint: boolean = settings.showZeroPoint;
	const showLabelsFlag: boolean = settings.showLabels;
	const rightAlignLabelsFlag: boolean = settings.rightAlignLabels;
	const prefixChar: string = settings.prefixChar;
	const suffixChar: string = settings.suffixChar;

	// 计算图表度量指标
	const metrics = calculateChartMetrics(data, chartLength);

	// 计算标签宽度（考虑负号）
	const maxValueLength: number = Math.max(
		...data.map((entry) => {
			const absLength = Math.abs(entry.value).toString().length;
			return entry.value < 0 ? absLength + 1 : absLength;
		})
	);
	const maxKeyLength: number = Math.max(
		...data.map((entry) => entry.key.length)
	);

	const barChart: string[] = [];

	// 如果没有负数，使用原有逻辑确保向后兼容
	if (!metrics.hasNegative) {
		for (const { key, value } of data) {
			const barLength: number = Math.floor(
				(value / metrics.maxValue) * chartLength
			);
			const bars: string =
				fillChar.repeat(barLength) +
				emptyChar.repeat(chartLength - barLength);
			let value_padded: string = " " + value.toString();

			if (rightAlignLabelsFlag === true) {
				value_padded = value_padded.padStart(maxValueLength + 1);
			}

			if (showLabelsFlag === true) {
				barChart.push(
					`${key.padEnd(
						maxKeyLength + 2
					)} ${prefixChar}${bars}${suffixChar}${value_padded}`
				);
			} else {
				barChart.push(
					`${key.padEnd(
						maxKeyLength + 2
					)} ${prefixChar}${bars}${suffixChar}`
				);
			}
		}
	} else {
		// 包含负数：使用双向逻辑
		for (const { key, value } of data) {
			const bars: string = generateBidirectionalBar(
				value,
				metrics,
				chartLength,
				fillChar,
				emptyChar,
				zeroPointChar,
				showZeroPoint
			);

			let value_padded: string = " " + value.toString();

			if (rightAlignLabelsFlag === true) {
				value_padded = value_padded.padStart(maxValueLength + 1);
			}

			if (showLabelsFlag === true) {
				barChart.push(
					`${key.padEnd(
						maxKeyLength + 2
					)} ${prefixChar}${bars}${suffixChar}${value_padded}`
				);
			} else {
				barChart.push(
					`${key.padEnd(
						maxKeyLength + 2
					)} ${prefixChar}${bars}${suffixChar}`
				);
			}
		}
	}

	return barChart.join("\n");
}
