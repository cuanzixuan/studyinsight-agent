const isValidNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export function toNumber(value) {
  if (isValidNumber(value)) return value;
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function cleanNumbers(values) {
  return values.map(toNumber).filter(isValidNumber);
}

export function mean(values) {
  const nums = cleanNumbers(values);
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

export function median(values) {
  const nums = cleanNumbers(values).sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

export function min(values) {
  const nums = cleanNumbers(values);
  return nums.length ? Math.min(...nums) : null;
}

export function max(values) {
  const nums = cleanNumbers(values);
  return nums.length ? Math.max(...nums) : null;
}

export function standardDeviation(values) {
  const nums = cleanNumbers(values);
  if (nums.length < 2) return null;
  const avg = mean(nums);
  const variance = nums.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (nums.length - 1);
  return Math.sqrt(variance);
}

export function correlation(xValues, yValues) {
  const pairs = xValues
    .map((x, index) => [toNumber(x), toNumber(yValues[index])])
    .filter(([x, y]) => isValidNumber(x) && isValidNumber(y));
  if (pairs.length < 2) return null;
  const xs = pairs.map(([x]) => x);
  const ys = pairs.map(([, y]) => y);
  const xMean = mean(xs);
  const yMean = mean(ys);
  const numerator = pairs.reduce((sum, [x, y]) => sum + (x - xMean) * (y - yMean), 0);
  const xDen = Math.sqrt(xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0));
  const yDen = Math.sqrt(ys.reduce((sum, y) => sum + (y - yMean) ** 2, 0));
  return xDen && yDen ? numerator / (xDen * yDen) : null;
}

export function groupByMean(data, categoryColumn, numericColumn) {
  const groups = new Map();
  data.forEach((row) => {
    const category = row[categoryColumn] === '' || row[categoryColumn] == null ? 'Missing' : String(row[categoryColumn]);
    const value = toNumber(row[numericColumn]);
    if (!isValidNumber(value)) return;
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(value);
  });
  return Array.from(groups.entries())
    .map(([category, values]) => ({
      category,
      mean: mean(values),
      count: values.length
    }))
    .sort((a, b) => b.mean - a.mean);
}

function quantile(sortedValues, q) {
  if (!sortedValues.length) return null;
  const position = (sortedValues.length - 1) * q;
  const base = Math.floor(position);
  const rest = position - base;
  return sortedValues[base + 1] !== undefined
    ? sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base])
    : sortedValues[base];
}

export function detectOutliersIQR(data, numericColumn) {
  const values = cleanNumbers(data.map((row) => row[numericColumn])).sort((a, b) => a - b);
  if (values.length < 4) {
    return { q1: null, q3: null, iqr: null, lowerBound: null, upperBound: null, anomalyRows: [], normalCount: values.length };
  }
  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const anomalyRows = data.filter((row) => {
    const value = toNumber(row[numericColumn]);
    return isValidNumber(value) && (value < lowerBound || value > upperBound);
  });
  return {
    q1,
    q3,
    iqr,
    lowerBound,
    upperBound,
    anomalyRows,
    normalCount: values.length - anomalyRows.length
  };
}

export function topValueCounts(data, column, limit = 8) {
  const counts = new Map();
  data.forEach((row) => {
    const label = row[column] === '' || row[column] == null ? 'Missing' : String(row[column]);
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function numericSummary(data, column) {
  const values = cleanNumbers(data.map((row) => row[column]));
  return {
    column,
    count: values.length,
    mean: mean(values),
    median: median(values),
    min: min(values),
    max: max(values),
    standardDeviation: standardDeviation(values)
  };
}

export function round(value, digits = 2) {
  return typeof value === 'number' && Number.isFinite(value) ? Number(value.toFixed(digits)) : value;
}
