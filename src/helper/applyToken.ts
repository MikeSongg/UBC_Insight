import Decimal from "decimal.js";

export function computeMax(valueArray: number[]) {
	return Math.max(... valueArray);
}

export function computeMin(valueArray: number[]) {
	return Math.min(... valueArray);
}

export function computeAvg(valueArray: number[]) {
	let total: Decimal = new Decimal(0);
	for (let value of valueArray) {
		let decimalValue = new Decimal(value);
		total = total.add(decimalValue);
	}
	let avg = total.toNumber() / valueArray.length;

	return Number(avg.toFixed(2));
}

export function computeSum(valueArray: number[]) {
	let sum = 0;
	valueArray.forEach((x) => {
		sum += x;
	});
	return sum.toFixed(2);
}

export function computeCount(valueArray: any[]) {
	return new Set(valueArray).size;
}
