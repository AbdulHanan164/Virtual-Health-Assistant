// This file contains helper functions for calculating BMI and other clinical classifications.

export const calculateBMI = (patientData, units) => {
    const { weight, height } = patientData;
    if (!weight || !height) return null;
    const weightInKg = units.weight === 'lbs' ? parseFloat(weight) * 0.453592 : parseFloat(weight);
    const heightInM = units.height === 'cm' ? parseFloat(height) / 100 : parseFloat(height) * 0.0254; // height is in cm or total inches
    return heightInM > 0 ? (weightInKg / (heightInM * heightInM)).toFixed(1) : null;
};

export const getClassifications = (patientData, units) => {
    const bmi = calculateBMI(patientData, units);
    if (!bmi) return { bmi: null, bmiClass: 'N/A', whr: null, whrClass: 'N/A' };

    const { ethnicity, waist, height } = patientData;
    const isLowerThresholdGroup = ['Asian (e.g., South Asian, Chinese)', 'Black (e.g., African, Caribbean)', 'Middle Eastern'].some(group => ethnicity?.includes(group));

    let bmiClass = '';
    const overweightThreshold = isLowerThresholdGroup ? 23 : 25;
    const obesityThreshold = isLowerThresholdGroup ? 27.5 : 30;

    if (bmi < 18.5) bmiClass = "Underweight";
    else if (bmi < overweightThreshold) bmiClass = "Healthy weight";
    else if (bmi < obesityThreshold) bmiClass = "Overweight";
    else if (bmi < (isLowerThresholdGroup ? 32.5 : 35)) bmiClass = "Obesity Class I";
    else if (bmi < (isLowerThresholdGroup ? 37.5 : 40)) bmiClass = "Obesity Class II";
    else bmiClass = "Obesity Class III";

    let whr = null;
    let whrClass = 'N/A';
    if (waist && height) {
        const heightInCm = units.height === 'cm' ? parseFloat(height) : parseFloat(height) * 2.54;
        const waistInCm = units.height === 'cm' ? parseFloat(waist) : parseFloat(waist) * 2.54;
        if(heightInCm > 0) {
           whr = (waistInCm / heightInCm).toFixed(2);
           if (whr < 0.5) whrClass = "Healthy";
           else if (whr < 0.6) whrClass = "Increased health risks";
           else whrClass = "High health risks";
        }
    }

    return { bmi: parseFloat(bmi), bmiClass, whr, whrClass };
};
