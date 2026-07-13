// Fix CSV Final row aggregates
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'NUST_Merit_List_2025_Final_Format.csv');
let csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n');

// Correct final aggregates: [Discipline, School, correctAggregate]
const csvCorrections = [
  ['BE Mechanical Engineering', 'SMME', 68.80],
  ['BE Mechanical Engineering', 'CEME', 61.60],
  ['BE Aerospace Engineering', 'CAE', 68.47],
  ['BE Electrical Engineering', 'SEECS', 70.63],
  ['BE Electrical Engineering', 'CEME', 62.08],
  ['BE Software Engineering', 'SEECS', 75.18],
  ['BS Computer Science', 'PNEC', 63.88],
  ['BS Computer Science', 'SEECS', 75.03],
  ['BE Civil Engineering', 'NBC', 45.18],
  ['BS Computer Science', 'NBC', 50.45],
  ['BE Avionics Engineering', 'CAE', 67.20],
  ['BE Geoinformatics', 'IGIS', 59.36],
  ['BE Environmental Engineering', 'IESE', 59.01],
  ['BS Information Security', 'MCS', 64.60],
  ['BE Aerospace Engineering', 'SMME', 68.32],
  ['BS Data Science', 'SEECS', 74.70],
  ['BS Food Science', 'ASAB', 62.97],
  ['BS Artificial Intelligence', 'SEECS', 76.58],
  ['BS Artificial Intelligence', 'NBC', 50.30],
  ['Environmental Sciences', 'IESE', 65.91],
  ['BS Biotechnology', 'ASAB', 73.40],
  ['BS Agriculture', 'ASAB', 56.28],
  ['BBA', 'NBS', 69.65],
  ['BS Accounting & Finance', 'NBS', 69.74],
  ['BS Tourism & Hospitality', 'NBS', 59.39],
  ['BS Economics', 'S3H', 66.63],
  ['BS Mass Communication', 'S3H', 59.87],
  ['BS Public Administration', 'S3H', 60.63],
  ['LLB', 'NLS', 65.07],
  ['BS Psychology', 'S3H', 61.82],
  ['BS Architecture', 'SADA', 70.28],
  ['BS Industrial Design', 'SADA', 66.22],
  ['BS Bioinformatics', 'SINES', 72.12],
  ['BE Computer Engineering', 'CEME', 66.33],
  ['BE Mechatronics Engineering', 'CEME', 64.29],
  ['BE Civil Engineering', 'NICE', 61.63],
  ['BE Electrical Engineering', 'MCS', 58.04],
  ['BE Electrical Engineering', 'PNEC', 57.19],
  ['BE Civil Engineering', 'MCE', 54.79],
  ['BE Computer Engineering', 'SEECS', 73.08],
  ['BE Chemical Engineering', 'SCME', 61.69],
  ['BE Material Engineering', 'SCME', 58.02],
  ['BE Software Engineering', 'MCS', 65.96],
  ['BE Mechanical Engineering', 'PNEC', 59.05],
  ['BE Naval Architecture', 'PNEC', 47.70],
  ['BS Mathematics', 'SNS', 45.33],
  ['BS Physics', 'SNS', 49.07],
  ['BS Chemistry', 'SNS', 31.74],
  ['BS Liberal Arts', 'S3H', 56.94],
];

let fixedCount = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const parts = line.split(',');
  if (parts.length < 5) continue;
  
  const discipline = parts[0];
  const school = parts[1];
  const listNum = parts[2];
  
  if (listNum !== 'Final') continue;
  
  // Find matching correction
  const correction = csvCorrections.find(
    ([d, s]) => d === discipline && s === school
  );
  
  if (correction) {
    const oldAgg = parts[4];
    parts[4] = correction[2].toString();
    lines[i] = parts.join(',');
    if (oldAgg !== parts[4]) {
      console.log(`Fixed: ${discipline} (${school}) Final: ${oldAgg} -> ${parts[4]}`);
      fixedCount++;
    }
  }
}

fs.writeFileSync(csvPath, lines.join('\n'), 'utf8');
console.log(`\nTotal CSV Final rows fixed: ${fixedCount}`);
