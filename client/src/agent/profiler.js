import { toNumber } from '../utils/stats.js';

const isMissing = (value) => value === null || value === undefined || value === '';

export function profileDataset(data) {
  const rows = Array.isArray(data) ? data : [];
  const columns = Array.from(rows.reduce((set, row) => {
    Object.keys(row || {}).forEach((key) => set.add(key));
    return set;
  }, new Set()));

  const missingValues = {};
  const missingPercentages = {};
  const numericColumns = [];
  const categoricalColumns = [];

  columns.forEach((column) => {
    const values = rows.map((row) => row[column]);
    const nonEmpty = values.filter((value) => !isMissing(value));
    const numericCount = nonEmpty.filter((value) => toNumber(value) !== null).length;
    const uniqueCount = new Set(nonEmpty.map(String)).size;
    const missingCount = values.length - nonEmpty.length;
    missingValues[column] = missingCount;
    missingPercentages[column] = rows.length ? Number(((missingCount / rows.length) * 100).toFixed(1)) : 0;

    if (nonEmpty.length && numericCount / nonEmpty.length >= 0.8) {
      numericColumns.push(column);
    } else if (uniqueCount <= Math.max(20, rows.length * 0.5)) {
      categoricalColumns.push(column);
    }
  });

  return {
    rowCount: rows.length,
    columnCount: columns.length,
    columns,
    numericColumns,
    categoricalColumns,
    missingValues,
    missingPercentages,
    sampleRows: rows.slice(0, 5)
  };
}
