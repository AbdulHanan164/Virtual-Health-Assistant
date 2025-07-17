// This file contains the entire conversation logic for the chatbot.

export const conversationFlow = {
    'welcome': { text: "Hello, I'm your virtual health assistant, providing guidance based on NICE clinical standards. I'm here to help you create a personalized weight management plan. This tool is for guidance and is not a substitute for professional medical advice. Shall we begin?", type: 'button', options: ["Yes, let's begin"], next: 'ageCheck' },
    'ageCheck': { text: "Great. First, could you confirm if you are 18 years or older?", type: 'button', options: ['Yes, I am', 'No, I am not'], next: (answer) => answer === 'Yes, I am' ? 'gender' : 'exit_underage' },
    'gender': { text: "Thank you. What is your gender?", type: 'button', options: ['Male', 'Female', 'Other (please specify)'], next: 'ethnicity' },
    'ethnicity': { text: "To help provide the most accurate assessment based on NICE guidelines, could you please share which ethnic background best describes you?", type: 'button', options: ['White', 'Asian (e.g., South Asian, Chinese)', 'Black (e.g., African, Caribbean)', 'Middle Eastern', 'Mixed or Multiple ethnic groups', 'Prefer not to say'], key: 'ethnicity', next: (answer, data) => data.gender === 'Female' ? 'pregnancy_current' : 'age' },
    
    'pregnancy_current': { text: "Are you currently pregnant or breastfeeding?", type: 'button', options: ['Yes', 'No', 'Other/Prefer not to say'], key: 'pregnancy_current_status', next: 'pregnancy_planning' },
    'pregnancy_planning': { text: "Are you planning pregnancy in the next 6 months?", type: 'button', options: ['Yes', 'No', 'Other/Prefer not to say'], key: 'pregnancy_planning_status', next: 'age' },
    
    'age': { text: "And what is your age?", type: 'number', key: 'age', validation: (val) => val > 17 && val < 100, error: "Please enter a valid age.", next: 'weight' },
    'weight': { text: "Okay. Could you please provide your current weight?", type: 'number_units', unitType: 'weight', key: 'weight', validation: (val) => val > 20 && val < 500, error: "Please enter a valid weight.", next: 'height' },
    'height': { text: "Thanks. And your height?", type: 'number_units', unitType: 'height', key: 'height', validation: (val) => (val > 100 && val < 250) || (val > 40 && val < 100), error: "Please enter a valid height.", next: 'waist' },
    'waist': { text: "Great. The NICE guidelines also use waist measurement to assess health risks. Could you provide your waist size (measured midway between your ribs and hips)?", type: 'number_units', unitType: 'height', key: 'waist', next: 'comorbidities' },

    'comorbidities': { text: "Thank you. Now, please select any weight-related health conditions you have.", type: 'checkbox', key: 'comorbidities', options: ['Hypertension', 'Obstructive Sleep Apnea', 'NAFLD (Fatty Liver)', 'PCOS', 'Cardiovascular Disease', 'Joint/Mobility Issues', 'Type 2 Diabetes', 'None of these', 'Other (please specify)'], next: 'contraindications' },
    'contraindications': { text: "Do you have a history of any of the following?", type: 'checkbox', key: 'contraindications', options: ['Medullary Thyroid Cancer (MTC)', 'MEN-2 Syndrome', 'Pancreatitis', 'Severe GI Disease (e.g., gastroparesis)', 'Current Steroid Use', 'None of these', 'Other (please specify)'], next: 'medications' },
    'medications': { text: "Are you currently taking any of the following medications?", type: 'checkbox', key: 'medications', options: ['Insulin or oral diabetes meds', 'Corticosteroids', 'Antipsychotics', 'Antidepressants', 'Metformin', 'None'], next: 'diet_intro' },

    'diet_intro': { text: "To help assess your calorie intake, I'd like to know what your typical daily diet looks like. Let’s break it down by meals. First, what do you usually have for breakfast?", type: 'free_text', key: 'diet_breakfast', placeholder: "e.g., Two eggs, toast with butter...", next: 'diet_lunch' },
    'diet_lunch': { text: "Got it! Now, what about lunch? What do you typically eat?", type: 'free_text', key: 'diet_lunch', placeholder: "e.g., Chicken salad sandwich, apple...", next: 'diet_dinner' },
    'diet_dinner': { text: "And for dinner — what does a usual evening meal include for you?", type: 'free_text', key: 'diet_dinner', placeholder: "e.g., Salmon, rice, broccoli...", next: 'diet_snacks' },
    'diet_snacks': { text: "Do you usually have any snacks or beverages during the day or evening? Please include things like coffee, soft drinks, fruits, sweets, etc.", type: 'free_text', key: 'diet_snacks', placeholder: "e.g., Coffee with milk, a banana, a cookie...", next: 'diet_portions' },
    'diet_portions': { text: "Thanks! Just to make sure we have everything — would you like to mention portion sizes or how much of each item you usually have? This helps us estimate calories more accurately.", type: 'free_text', key: 'diet_portions', placeholder: "e.g., 'About a cup of rice', '2 slices of toast'...", next: 'activity_intro' },
    
    'activity_intro': { text: "To better understand your energy needs, I'd like to ask about your typical daily physical activity.", type: 'info', next: 'activity_work' },
    'activity_work': { text: "First, how physically active are you at work or during the day? For example, do you mostly sit (like at a desk), stand or walk around, or do more active/manual work?", type: 'free_text', key: 'activity_work_level', placeholder: "e.g., Mostly sit at a desk", next: 'activity_planned' },
    'activity_planned': { text: "Great! Now, do you do any planned exercise or sports? If yes, what kind, how often per week, and for how long each session?", type: 'free_text', key: 'activity_planned_exercise', placeholder: "e.g., I run 3 times a week for 30 minutes", next: 'activity_routine' },
    'activity_routine': { text: "Do you walk, cycle, or use stairs as part of your daily routine (e.g., walking to work, taking stairs instead of elevators)?", type: 'free_text', key: 'activity_daily_routine', placeholder: "e.g., I take the stairs every day", next: 'activity_sedentary' },
    'activity_sedentary': { text: "How much time do you usually spend sitting or inactive during the day — like watching TV, working on a computer, or resting?", type: 'free_text', key: 'activity_sedentary_time', placeholder: "e.g., About 6 hours", next: 'activity_summary' },
    'activity_summary': { text: "Thanks! Would you say your overall activity level is: sedentary, lightly active, moderately active, or very active?", type: 'button', options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'], key: 'activity_overall_level', next: 'sleep_hours' },

    'sleep_hours': { text: "On average, how many hours of sleep do you get per night?", type: 'button', options: ['Less than 5 hours', '5-6 hours', '7-8 hours', 'More than 8 hours'], key: 'sleep_hours', next: 'sleep_quality' },
    'sleep_quality': { text: "How would you rate the quality of your sleep?", type: 'button', options: ['Very good', 'Good', 'Fair', 'Poor'], key: 'sleep_quality', next: 'sleep_issues' },
    'sleep_issues': { text: "Do you experience any of the following sleep-related issues?", type: 'checkbox', key: 'sleep_issues', options: ['Difficulty falling asleep', 'Difficulty staying asleep', 'Loud snoring or gasping', 'Excessive daytime sleepiness', 'Restless legs', 'None'], next: 'sleep_willingness' },
    'sleep_willingness': { text: "Are you willing to adopt strategies to improve your sleep, such as maintaining a consistent sleep schedule?", type: 'button', options: ['Yes', 'No', 'Unsure'], key: 'sleep_willingness', next: 'smoking_intro' },
    
    'smoking_intro': { text: "Do you currently smoke or use tobacco products?", type: 'button', options: ['Yes', 'No'], next: (answer) => answer === 'Yes' ? 'smoking_quantity' : 'alcohol_intro' },
    'smoking_quantity': { text: "How many cigarettes or tobacco products do you use per day?", type: 'number', key: 'smoking_quantity', next: 'smoking_cessation' },
    'smoking_cessation': { text: "Are you interested in smoking cessation support?", type: 'button', options: ['Yes', 'No'], key: 'smoking_cessation_interest', next: 'alcohol_intro' },
    'alcohol_intro': { text: "Do you consume alcohol?", type: 'button', options: ['Yes', 'No'], next: (answer) => answer === 'Yes' ? 'alcohol_frequency' : 'behavior_stress' },
    'alcohol_frequency': { text: "How often do you have a drink containing alcohol?", type: 'button', options: ['Never', 'Monthly or less', '2-4 times a month', '2-3 times a week', '4+ times a week'], key: 'alcohol_frequency', next: 'cage1' },
    'cage1': { text: "Have you ever felt you should Cut down on your drinking?", type: 'button', options: ['Yes', 'No'], key: 'cage1', next: 'cage2' },
    'cage2': { text: "Have people Annoyed you by criticizing your drinking?", type: 'button', options: ['Yes', 'No'], key: 'cage2', next: 'cage3' },
    'cage3': { text: "Have you ever felt bad or Guilty about your drinking?", type: 'button', options: ['Yes', 'No'], key: 'cage3', next: 'cage4' },
    'cage4': { text: "Have you ever had a drink first thing in the morning to steady your nerves (Eye-opener)?", type: 'button', options: ['Yes', 'No'], key: 'cage4', next: 'behavior_stress' },
    'behavior_stress': { text: "How would you rate your typical stress level on a scale of 1 to 10?", type: 'slider', key: 'stress_level', min: 1, max: 10, next: 'behavior_triggers' },
    'behavior_triggers': { text: "What situations, if any, typically lead to emotional or mindless eating for you?", type: 'free_text', key: 'eating_triggers', placeholder: "e.g., watching TV, feeling stressed", next: 'weight_loss_history' },

    'weight_loss_history': { text: "Have you tried to lose weight before?", type: 'button', options: ['Yes', 'No'], next: (answer) => answer === 'Yes' ? 'weight_loss_methods' : 'motivation' },
    'weight_loss_methods': { text: "What methods have you tried?", type: 'checkbox', key: 'weight_loss_methods', options: ['Diet or exercise', 'Prescription medications', 'Supplements', 'Surgery'], next: 'weight_loss_supervision' },
    'specify_medication': { text: "Please specify the prescription medication(s) you tried.", type: 'free_text', key: 'weight_loss_meds_specify', next: 'weight_loss_supervision' },
    'weight_loss_supervision': { text: "Were your previous weight loss attempts supervised by a healthcare professional?", type: 'button', options: ['Yes', 'No'], key: 'weight_loss_supervision', next: 'motivation' },

    'motivation': { text: "On a scale of 1 to 10, how motivated are you to manage your weight?", type: 'slider', min: 1, max: 10, key: 'motivation_level', next: 'readiness' },
    'readiness': { text: "Are you willing to make lifestyle changes alongside medication (if prescribed)?", type: 'button', options: ['Yes', 'No', 'Unsure'], key: 'readiness_for_changes', next: 'goal_setting_short' },
    'goal_setting_short': { text: "What are your short-term (1-month) weight management goals?", type: 'free_text', key: 'goal_short_term', placeholder: "e.g., Build a routine...", next: 'goal_setting_medium' },
    'goal_setting_medium': { text: "What are your medium-term (2–5 months) weight management goals?", type: 'free_text', key: 'goal_medium_term', placeholder: "e.g., Continue progress...", next: 'goal_setting_long' },
    'goal_setting_long': { text: "What are your long-term (6–12 months) weight management goals?", type: 'free_text', key: 'goal_long_term', placeholder: "e.g., Plan for challenges...", next: 'goal_setting_year_plus' },
    'goal_setting_year_plus': { text: "What are your goals beyond 1 year?", type: 'free_text', key: 'goal_year_plus', placeholder: "e.g., Discuss maintenance...", next: 'generate_report' },
    
    'prompt_for_other_text': { text: "Please provide more details.", type: 'free_text' },
    'generate_report': { text: "Thank you for all this information. I'm now analyzing your responses to create your personalized weight management plan, based on NICE guidelines.", type: 'summary' },
    'exit_underage': { text: "This tool is for adults aged 18 and over. It's best to speak with a pediatrician or a family doctor for guidance. Thank you.", type: 'final' }
};
