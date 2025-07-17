// This file handles the communication with the AI model.

export const fetchAiPlan = async (patientData, classifications) => {
    
    const fullSummary = `
        Patient Demographics: ${JSON.stringify({age: patientData.age, gender: patientData.gender, ethnicity: patientData.ethnicity})}
        Measurements: BMI: ${classifications.bmi}, BMI Class: ${classifications.bmiClass}, Waist-to-Height Ratio: ${classifications.whr}, WHR Class: ${classifications.whrClass}
        Medical History: Currently Pregnant/Breastfeeding: ${patientData.pregnancy_current_status}, Planning Pregnancy: ${patientData.pregnancy_planning_status}, Comorbidities: ${patientData.comorbidities}, Contraindications: ${patientData.contraindications}, Current Medications: ${patientData.medications}
        Dietary Intake: Breakfast: ${patientData.diet_breakfast}, Lunch: ${patientData.diet_lunch}, Dinner: ${patientData.diet_dinner}, Snacks/Beverages: ${patientData.diet_snacks}, Portions: ${patientData.diet_portions}
        Activity Levels: Work Activity: ${patientData.activity_work_level}, Planned Exercise: ${patientData.activity_planned_exercise}, Daily Routine: ${patientData.activity_daily_routine}, Sedentary Time: ${patientData.activity_sedentary_time}, Overall Level: ${patientData.activity_overall_level}
        Sleep Habits: Hours: ${patientData.sleep_hours}, Quality: ${patientData.sleep_quality}, Issues: ${patientData.sleep_issues}
        Lifestyle Factors: Smoking: ${patientData.smoking_quantity ? 'Yes' : 'No'}, Alcohol Use: ${patientData.alcohol_frequency}, Stress Level: ${patientData.stress_level}, Eating Triggers: ${patientData.eating_triggers}
        Weight Loss History: Previous Attempts: ${patientData.weight_loss_history}, Methods: ${patientData.weight_loss_methods}, Supervised: ${patientData.weight_loss_supervision}
        Personal Goals: Short-term: ${patientData.goal_short_term}, Medium-term: ${patientData.goal_medium_term}, Long-term: ${patientData.goal_long_term}, Beyond 1 Year: ${patientData.goal_year_plus}
        Motivation: ${patientData.motivation_level}/10
    `;

    const prompt = `
        You are a helpful medical AI assistant. Based on the following comprehensive patient data, generate a personalized weight management plan that is **strictly aligned with the NICE guideline for Overweight and Obesity Management (NG246)**.
        The output must be in a professional, narrative format, as if a doctor is giving advice in person.

        ${fullSummary}

        Your task is to generate ONLY the JSON object with the following structure. Each value should be a string containing a paragraph or two of professional, empathetic advice.
        {
          "assessmentSummary": "Start with a summary of the assessment, mentioning the BMI and waist-to-height ratio classifications and what they mean in a professional, empathetic tone. Acknowledge their provided goals.",
          "healthyEating": "Provide a narrative paragraph on healthy eating. It should include a brief analysis of the user's diet, an estimate of calorie intake, and specific, actionable recommendations woven into the text. Reference the foods the user mentioned.",
          "physicalActivity": "Provide a narrative paragraph on physical activity. Discuss a general strategy based on their current activity levels and then suggest 3-4 specific, tailored exercises within the text, explaining why they are suitable.",
          "behaviorAndMindset": "Provide a narrative paragraph on behavior and mindset. Discuss the importance of sleep (referencing their specific sleep issues), stress management, smoking/alcohol use, and identifying triggers in a conversational, supportive way.",
          "treatmentConsiderations": "Provide a narrative paragraph analyzing the patient's eligibility for pharmacotherapy and bariatric surgery based on the **strict criteria in the NICE NG246 guideline**. Factor in all provided data, including medications, comorbidities, and contraindications. Frame this as a topic for discussion with their doctor."
        }

        The tone must be encouraging, professional, non-stigmatizing, and empathetic, as recommended by NICE. Do not use bullet points or checklists.
    `;

    try {
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                      assessmentSummary: { type: "STRING" },
                      healthyEating: { type: "STRING" },
                      physicalActivity: { type: "STRING" },
                      behaviorAndMindset: { type: "STRING" },
                      treatmentConsiderations: { type: "STRING" }
                    },
                    required: ["assessmentSummary", "healthyEating", "physicalActivity", "behaviorAndMindset", "treatmentConsiderations"]
                }
            }
        };
        const apiKey = "AIzaSyDGSTzn0GJq3jCif6wfRBg5O4bwsBaGjwY"; // The environment should provide the key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0) {
            const jsonText = result.candidates[0].content.parts[0].text;
            return JSON.parse(jsonText);
        } else {
            throw new Error("Invalid response structure from AI.");
        }

    } catch (error) {
        console.error("Error fetching AI plan:", error);
        // Return a fallback report structure on error
        return {
            assessmentSummary: "There was an error generating your personalized assessment. Please review the information with your healthcare provider.",
            healthyEating: "General advice is to focus on a balanced diet with plenty of fruits, vegetables, and lean protein, while limiting processed foods and sugary drinks.",
            physicalActivity: "Starting with regular, gentle activity like walking is recommended for most people. Please consult your doctor before starting a new exercise program.",
            behaviorAndMindset: "Focusing on getting adequate sleep and managing stress are key components of a healthy lifestyle.",
            treatmentConsiderations: `We couldn't generate a fully personalized recommendation due to an error: ${error.message}. It is essential to discuss your full health profile with your healthcare provider.`
        };
    }
};
