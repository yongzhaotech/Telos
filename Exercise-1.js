/**
 * Imagine you have an array (with a length of at least 3, but can be larger) which contains integers.
 * With the exception of a single integer N, this array only contains even integers or odd integers. 
 * Your task is to write a function that returns this "deviation" N and takes the array as a parameter.
 */
const getDeviation = args => {
	if (!Array.isArray(args) || args.length < 3) {
		return "Invalid arguments";
	}

	const numbers = args
		.reduce((acc, cur) => {
			const type = cur % 2 === 0 ? "even" : "odd";

			return {
				...acc,
				[type]: Reflect.has(acc, type) ? [...acc[type], cur] : [cur]
			};
		}, {}),
		result = Reflect.ownKeys(numbers)
			.reduce((message, type) =>
				numbers[type].length > 1 ? message : `${numbers[type][0]} (the only ${type} interger)`, "");

	return result || "No single deviation is in the array";
};

/** jest unit test */

test("passing in [8, 2, 0, 200, 13, 6, 1602, 32], 13 is found to be the deviation", () => {
	expect(getDeviation([8, 2, 0, 200, 13, 6, 1602, 32])).toBe(`13 (the only odd integer)`);
});

test("passing in [172, 71, 2599, 19, 17, 13, -61], 172 is found to be the deviation", () => {
	expect(getDeviation([172, 71, 2599, 19, 17, 13, -61])).toBe(`172 (the only even integer)`);
});

test("passing in [1, 3, 5, 7, 9, 37, 91], no deviation is found", () => {
	expect(getDeviation([1, 3, 5, 7, 9, 37, 91])).toBe(`No single deviation is in the array`);
});

test("passing in [1, 2], invalid argument", () => {
	expect(getDeviation([1, 2])).toBe(`Invalid arguments`);
});