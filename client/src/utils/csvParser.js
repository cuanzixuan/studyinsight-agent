import Papa from 'papaparse';

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        const fatalErrors = result.errors.filter((error) => error.type !== 'FieldMismatch');
        if (fatalErrors.length) {
          reject(new Error(fatalErrors.map((error) => error.message).join(' ')));
          return;
        }
        resolve(result.data.filter((row) => Object.values(row).some((value) => value !== null && value !== undefined && value !== '')));
      },
      error: (error) => reject(new Error(error.message || 'CSV parsing failed.'))
    });
  });
}
