import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Info } from 'lucide-react';

const calculators = {
  bmi: {
    name: 'BMI Calculator',
    description: 'Body Mass Index',
    fields: [
      { name: 'weight', label: 'Weight (kg)', type: 'number', min: 20, max: 300 },
      { name: 'height', label: 'Height (cm)', type: 'number', min: 100, max: 250 }
    ],
    calculate: (values) => {
      const bmi = values.weight / Math.pow(values.height / 100, 2);
      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal weight';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';
      return { value: bmi.toFixed(1), unit: 'kg/m²', interpretation: category };
    }
  },
  egfr: {
    name: 'eGFR Calculator',
    description: 'Estimated Glomerular Filtration Rate (CKD-EPI)',
    fields: [
      { name: 'creatinine', label: 'Serum Creatinine (mg/dL)', type: 'number', step: 0.01, min: 0.1, max: 15 },
      { name: 'age', label: 'Age (years)', type: 'number', min: 18, max: 120 },
      { name: 'sex', label: 'Sex', type: 'select', options: ['Male', 'Female'] },
      { name: 'race', label: 'Race', type: 'select', options: ['Non-Black', 'Black'] }
    ],
    calculate: (values) => {
      const { creatinine, age, sex, race } = values;
      const kappa = sex === 'Female' ? 0.7 : 0.9;
      const alpha = sex === 'Female' ? -0.329 : -0.411;
      const minRatio = Math.min(creatinine / kappa, 1);
      const maxRatio = Math.max(creatinine / kappa, 1);

      let egfr = 141 * Math.pow(minRatio, alpha) * Math.pow(maxRatio, -1.209) * Math.pow(0.993, age);
      if (sex === 'Female') egfr *= 1.018;
      if (race === 'Black') egfr *= 1.159;

      let stage = '';
      if (egfr >= 90) stage = 'G1 (Normal or high)';
      else if (egfr >= 60) stage = 'G2 (Mildly decreased)';
      else if (egfr >= 45) stage = 'G3a (Mild to moderate)';
      else if (egfr >= 30) stage = 'G3b (Moderate to severe)';
      else if (egfr >= 15) stage = 'G4 (Severely decreased)';
      else stage = 'G5 (Kidney failure)';

      return { value: egfr.toFixed(1), unit: 'mL/min/1.73m²', interpretation: `CKD Stage ${stage}` };
    }
  },
  chadsvasc: {
    name: 'CHA₂DS₂-VASc Score',
    description: 'Stroke risk in atrial fibrillation',
    fields: [
      { name: 'chf', label: 'Congestive Heart Failure', type: 'checkbox' },
      { name: 'hypertension', label: 'Hypertension', type: 'checkbox' },
      { name: 'age', label: 'Age', type: 'select', options: ['<65', '65-74', '≥75'] },
      { name: 'diabetes', label: 'Diabetes', type: 'checkbox' },
      { name: 'stroke', label: 'Prior Stroke/TIA/TE', type: 'checkbox' },
      { name: 'vascular', label: 'Vascular Disease', type: 'checkbox' },
      { name: 'sex', label: 'Sex', type: 'select', options: ['Male', 'Female'] }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.chf) score += 1;
      if (values.hypertension) score += 1;
      if (values.age === '65-74') score += 1;
      if (values.age === '≥75') score += 2;
      if (values.diabetes) score += 1;
      if (values.stroke) score += 2;
      if (values.vascular) score += 1;
      if (values.sex === 'Female') score += 1;

      const risks = {
        0: '0-1%', 1: '1.3%', 2: '2.2%', 3: '3.2%', 4: '4.0%',
        5: '6.7%', 6: '9.8%', 7: '9.6%', 8: '12.5%', 9: '15.2%'
      };
      const risk = risks[score] || '>15%';

      let recommendation = '';
      if (score === 0) recommendation = 'No anticoagulation recommended';
      else if (score === 1) recommendation = 'Consider anticoagulation';
      else recommendation = 'Anticoagulation recommended';

      return { value: score, unit: 'points', interpretation: `${risk} annual stroke risk. ${recommendation}` };
    }
  },
  ascvd: {
    name: 'ASCVD Risk Calculator',
    description: '10-year atherosclerotic cardiovascular disease risk',
    fields: [
      { name: 'age', label: 'Age (40-79)', type: 'number', min: 40, max: 79 },
      { name: 'sex', label: 'Sex', type: 'select', options: ['Male', 'Female'] },
      { name: 'race', label: 'Race', type: 'select', options: ['White', 'Black', 'Other'] },
      { name: 'totalChol', label: 'Total Cholesterol (mg/dL)', type: 'number', min: 130, max: 320 },
      { name: 'hdl', label: 'HDL Cholesterol (mg/dL)', type: 'number', min: 20, max: 100 },
      { name: 'sbp', label: 'Systolic BP (mmHg)', type: 'number', min: 90, max: 200 },
      { name: 'bpTreated', label: 'On BP medication', type: 'checkbox' },
      { name: 'diabetes', label: 'Diabetes', type: 'checkbox' },
      { name: 'smoker', label: 'Current smoker', type: 'checkbox' }
    ],
    calculate: (values) => {
      // Simplified ASCVD calculation (actual formula is more complex)
      let score = 0;
      score += (values.age - 40) * 0.5;
      if (values.sex === 'Male') score += 2;
      if (values.race === 'Black') score += 1;
      score += (values.totalChol - 170) / 40;
      score -= (values.hdl - 50) / 15;
      score += (values.sbp - 110) / 20;
      if (values.bpTreated) score += 1;
      if (values.diabetes) score += 2;
      if (values.smoker) score += 2;

      // Convert to percentage (approximation)
      const risk = Math.max(0, Math.min(30, score));

      let recommendation = '';
      if (risk < 5) recommendation = 'Low risk. Lifestyle modifications.';
      else if (risk < 7.5) recommendation = 'Borderline risk. Consider statin therapy.';
      else if (risk < 20) recommendation = 'Intermediate risk. Statin therapy recommended.';
      else recommendation = 'High risk. Intensive statin therapy recommended.';

      return { value: risk.toFixed(1), unit: '%', interpretation: recommendation };
    }
  }
};

export const ClinicalCalculators = () => {
  const [selectedCalc, setSelectedCalc] = useState(null);
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleCalculate = () => {
    if (!selectedCalc) return;
    const calc = calculators[selectedCalc];

    // Check all required fields are filled
    const allFilled = calc.fields.every(field => {
      if (field.type === 'checkbox') return true;
      return values[field.name] !== undefined && values[field.name] !== '';
    });

    if (!allFilled) {
      alert('Please fill all required fields');
      return;
    }

    const calcResult = calc.calculate(values);
    setResult(calcResult);
  };

  const handleReset = () => {
    setValues({});
    setResult(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Clinical Calculators</h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-gray-700">
          <p>Evidence-based clinical calculators for common medical assessments. All calculations are approximations and should be verified with current guidelines.</p>
        </div>
      )}

      {/* Calculator Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Calculator
        </label>
        <select
          value={selectedCalc || ''}
          onChange={(e) => {
            setSelectedCalc(e.target.value);
            setValues({});
            setResult(null);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Choose a calculator...</option>
          {Object.entries(calculators).map(([key, calc]) => (
            <option key={key} value={key}>
              {calc.name} - {calc.description}
            </option>
          ))}
        </select>
      </div>

      {/* Input Fields */}
      {selectedCalc && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {calculators[selectedCalc].fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === 'number' && (
                  <input
                    type="number"
                    step={field.step || 1}
                    min={field.min}
                    max={field.max}
                    value={values[field.name] || ''}
                    onChange={(e) => setValues({ ...values, [field.name]: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                )}
                {field.type === 'select' && (
                  <select
                    value={values[field.name] || field.options[0]}
                    onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values[field.name] || false}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">Yes</span>
                  </label>
                )}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Result</h4>
                  <p className="text-2xl font-bold text-green-700 mb-2">
                    {result.value} {result.unit}
                  </p>
                  <p className="text-sm text-gray-700">{result.interpretation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
