const genders = ['Female', 'Male', 'Nonbinary'];
const regions = ['North', 'South', 'East', 'West'];
const products = ['Laptop', 'Phone', 'Tablet', 'Accessory'];
const prices = { Laptop: 1050, Phone: 720, Tablet: 430, Accessory: 55 };

export const studentPerformanceData = Array.from({ length: 80 }, (_, index) => {
  const studentNumber = index + 1;
  const studyHours = Number((2.4 + (index % 12) * 0.7 + Math.floor(index / 12) * 0.16).toFixed(1));
  const attendanceRate = Math.min(99, 58 + (index % 10) * 3.7 + Math.floor(index / 10) * 1.9);
  const sleepHours = Number((5.2 + (index % 7) * 0.35).toFixed(1));
  const previousScore = Math.min(96, 38 + (index % 16) * 3.1 + Math.floor(index / 16) * 2.4);
  const noise = ((index * 17) % 13) - 6;
  const finalScore = Math.max(
    24,
    Math.min(99, Math.round(previousScore * 0.47 + studyHours * 4.2 + attendanceRate * 0.28 + sleepHours * 1.3 + noise))
  );
  return {
    student_id: `S${String(studentNumber).padStart(3, '0')}`,
    gender: genders[index % genders.length],
    study_hours: studyHours,
    attendance_rate: Number(attendanceRate.toFixed(1)),
    sleep_hours: sleepHours,
    previous_score: Number(previousScore.toFixed(1)),
    final_score: finalScore,
    passed: finalScore >= 50 ? 'Yes' : 'No'
  };
});

export const salesData = Array.from({ length: 80 }, (_, index) => {
  const product = products[index % products.length];
  const region = regions[Math.floor(index / 2) % regions.length];
  const units = 8 + ((index * 7) % 29) + (region === 'North' ? 5 : 0) + (product === 'Accessory' ? 12 : 0);
  const revenue = Math.round(units * prices[product] * (0.92 + ((index % 9) * 0.025)));
  const ratingBase = 3.55 + (revenue / 55000) + (region === 'East' ? 0.16 : 0) - (product === 'Accessory' ? 0.1 : 0);
  return {
    date: `2026-${String(1 + Math.floor(index / 28)).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}`,
    region,
    product,
    units_sold: units,
    revenue,
    customer_rating: Number(Math.min(5, ratingBase + ((index % 5) - 2) * 0.08).toFixed(1))
  };
});

export const sampleDatasets = [
  { id: 'students', name: 'Student Performance Dataset', data: studentPerformanceData },
  { id: 'sales', name: 'Sales Dataset', data: salesData }
];
