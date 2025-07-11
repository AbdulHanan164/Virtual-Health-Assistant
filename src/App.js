import React, { useState, useEffect, useRef } from 'react';
import { Printer, Volume2, XCircle, Calendar, Zap } from 'lucide-react';

// ======== INPUT COMPONENTS ========

function ButtonInput({ options, onSubmit }) {
    return (
        <div className="flex flex-wrap gap-3 p-4 justify-center">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onSubmit(opt)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-full transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}

function NumberUnitInput({ onSubmit, unitType, onUnitChange, placeholder = "Type your answer..." }) {
    const [value, setValue] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (value) onSubmit(value);
    };
    return (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 items-center">
            <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} className="flex-grow border-2 border-gray-300 p-3 rounded-full focus:border-blue-500 focus:outline-none transition" required />
            {unitType && (
                <select onChange={(e) => onUnitChange(e.target.value)} className="border-2 border-gray-300 p-3 rounded-full bg-white focus:outline-none">
                    {unitType === 'weight' ? <><option value="kg">kg</option><option value="lbs">lbs</option></> : <><option value="cm">cm</option><option value="in">in</option></>}
                </select>
            )}
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-full transition shadow-md hover:shadow-lg">Send</button>
        </form>
    );
}

function CheckboxInput({ options, onSubmit }) {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const handleCheckboxChange = (option) => {
        if (option.includes('Other')) {
            onSubmit(option);
            return;
        }
        if (option === 'None of these') {
            setSelectedOptions(prev => prev.includes('None of these') ? [] : ['None of these']);
        } else {
            setSelectedOptions(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev.filter(item => item !== 'None of these'), option]);
        }
    };
    return (
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {options.map(opt => (
                    <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${selectedOptions.includes(opt) ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'} border`}>
                        <input type="checkbox" checked={selectedOptions.includes(opt)} onChange={() => handleCheckboxChange(opt)} className="h-5 w-5 rounded-sm text-blue-600 focus:ring-blue-500 border-gray-300"/>
                        <span>{opt}</span>
                    </label>
                ))}
            </div>
            <button onClick={() => onSubmit(selectedOptions)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full transition shadow-md hover:shadow-lg">Confirm Selection</button>
        </div>
    );
}

function SliderInput({ min, max, onSubmit }) {
    const [value, setValue] = useState(min);
    return (
        <div className="p-4 flex flex-col items-center">
            <span className="font-bold text-3xl text-blue-600 mb-3">{value}</span>
            <input type="range" min={min} max={max} value={value} onChange={e => setValue(e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer" style={{background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((value - min)/(max-min))*100}%, #E5E7EB ${((value - min)/(max-min))*100}%, #E5E7EB 100%)`}}/>
            <button onClick={() => onSubmit(value)} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition shadow-md hover:shadow-lg">Submit</button>
        </div>
    );
}

function FreeTextInput({ onSubmit, placeholder = "Please specify..." }) {
    const [value, setValue] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (value) onSubmit(value);
    };
    return (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 items-center">
            <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} className="flex-grow border-2 border-gray-300 p-3 rounded-full focus:border-blue-500 focus:outline-none transition" required />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-full transition shadow-md hover:shadow-lg">Send</button>
        </form>
    );
}


// ======== Main App Component ========
export default function App() {
    // ======== STATE MANAGEMENT ========
    const [step, setStep] = useState('welcome');
    const [chatHistory, setChatHistory] = useState([]);
    const [patientData, setPatientData] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [units, setUnits] = useState({ weight: 'kg', height: 'cm' });
    const [promptingForOther, setPromptingForOther] = useState(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [aiReport, setAiReport] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const chatEndRef = useRef(null);

    // ======== CONVERSATION FLOW & QUESTIONS ========
    const conversationFlow = {
        'welcome': { text: "Hello, I'm your virtual health assistant. I'm here to help you create a personalized weight management plan. This tool is for guidance and is not a substitute for professional medical advice. Shall we begin?", type: 'button', options: ["Yes, let's begin"], next: 'ageCheck' },
        'ageCheck': { text: "Great. First, could you confirm if you are 18 years or older?", type: 'button', options: ['Yes, I am', 'No, I am not'], next: (answer) => answer === 'Yes, I am' ? 'gender' : 'exit_underage' },
        'gender': { text: "Thank you. What is your gender?", type: 'button', options: ['Male', 'Female', 'Other (please specify)'], next: (answer) => answer === 'Female' ? 'pregnancy' : 'age' },
        'pregnancy': { text: "Understood. Are you currently pregnant, planning to become pregnant in the next 6 months, or breastfeeding?", type: 'button', options: ['Yes', 'No'], key: 'pregnancy_status', next: 'age' },
        'age': { text: "And what is your age?", type: 'number', key: 'age', validation: (val) => val > 17 && val < 100, error: "Please enter a valid age.", next: 'weight' },
        'weight': { text: "Okay. Could you please provide your current weight?", type: 'number_units', unitType: 'weight', key: 'weight', validation: (val) => val > 20 && val < 500, error: "Please enter a valid weight.", next: 'height' },
        'height': { text: "Thanks. And your height?", type: 'number_units', unitType: 'height', key: 'height', validation: (val) => (units.height === 'cm' && val > 100 && val < 250) || (units.height === 'in' && val > 40 && val < 100), error: "Please enter a valid height.", next: 'diet_meals' },
        
        'diet_meals': { text: "Let's talk about your eating habits. How many meals do you typically eat per day?", type: 'number', key: 'meals_per_day', placeholder: "e.g., 3", next: 'diet_water' },
        'diet_water': { text: "How many glasses of water would you say you drink on an average day?", type: 'number', key: 'water_intake', placeholder: "e.g., 8", next: 'diet_snacks' },
        'diet_snacks': { text: "What are your go-to snacks? (e.g., fruits, chips, nuts)", type: 'free_text', key: 'snacks', placeholder: "e.g., fruits, chips, nuts", next: 'activity_current' },
        'activity_current': { text: "Now for physical activity. What is your current exercise routine like?", type: 'free_text', key: 'current_activity', placeholder: "e.g., I walk twice a week", next: 'activity_enjoy' },
        'activity_enjoy': { text: "What physical activities do you genuinely enjoy or would like to try?", type: 'free_text', key: 'enjoyable_activities', placeholder: "e.g., dancing, hiking, swimming", next: 'behavior_sleep' },
        'behavior_sleep': { text: "Let's discuss lifestyle. On average, how many hours of sleep do you get per night?", type: 'number', key: 'sleep_hours', placeholder: "e.g., 7", next: 'behavior_stress' },
        'behavior_stress': { text: "How would you rate your typical stress level on a scale of 1 to 10?", type: 'slider', key: 'stress_level', min: 1, max: 10, next: 'behavior_triggers' },
        'behavior_triggers': { text: "What situations, if any, typically lead to emotional or mindless eating for you?", type: 'free_text', key: 'eating_triggers', placeholder: "e.g., watching TV, feeling stressed", next: 'comorbidities' },

        'comorbidities': { text: "Thank you. Now, please select any weight-related health conditions you have.", type: 'checkbox', key: 'comorbidities', options: ['Hypertension', 'Obstructive Sleep Apnea', 'NAFLD (Fatty Liver)', 'PCOS', 'Cardiovascular Disease', 'Joint/Mobility Issues', 'Type 2 Diabetes', 'None of these', 'Other (please specify)'], next: 'contraindications' },
        'contraindications': { text: "And do you have a personal or family history of any of the following?", type: 'checkbox', key: 'contraindications', options: ['Medullary Thyroid Cancer (MTC)', 'MEN-2 Syndrome', 'Pancreatitis', 'Severe GI Disease (e.g., gastroparesis)', 'Current Steroid Use', 'None of these', 'Other (please specify)'], next: 'motivation' },
        'motivation': { text: "We're almost done. On that 1 to 10 scale, how motivated do you feel to make changes?", type: 'slider', key: 'motivation', min: 1, max: 10, next: 'readiness' },
        'readiness': { text: "That's a great score. Are you willing to combine lifestyle changes with a treatment plan?", type: 'button', options: ['Yes, I am', 'No, I prefer lifestyle only', 'I am unsure'], key: 'readiness', next: 'generate_report' },
        'prompt_for_other_text': { text: "Please provide more details.", type: 'free_text' },
        'generate_report': { text: "Thank you for all this information. I'm now analyzing your responses to create your personalized weight management plan.", type: 'summary' },
        'exit_underage': { text: "This tool is for adults aged 18 and over. It's best to speak with a pediatrician or a family doctor for guidance. Thank you.", type: 'final' }
    };

    // ======== UTILITY & HELPER FUNCTIONS ========
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, isTyping]);
    const addMessage = (sender, text) => setChatHistory(prev => [...prev, { sender, text }]);
    const doctorSays = (messageConfig) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            addMessage('doctor', messageConfig.text);
        }, 1000 + Math.random() * 500);
    };
    
    useEffect(() => { doctorSays(conversationFlow.welcome); }, []);

    const handleUserInput = (value) => {
        const currentStepConfig = conversationFlow[step];
        const userResponse = Array.isArray(value) ? value.join(', ') : value.toString();
        addMessage('patient', userResponse);

        if (userResponse.includes('Other (please specify)')) {
            setPromptingForOther({ key: currentStepConfig.key, nextStep: currentStepConfig.next });
            setStep('prompt_for_other_text');
            doctorSays(conversationFlow.prompt_for_other_text);
            return;
        }

        if (currentStepConfig.validation && !currentStepConfig.validation(value)) {
            doctorSays({ text: currentStepConfig.error });
            return;
        }

        setPatientData(prev => ({ ...prev, [currentStepConfig.key || step]: value }));

        let nextStepKey = typeof currentStepConfig.next === 'function' ? currentStepConfig.next(value) : currentStepConfig.next;
        setStep(nextStepKey);
        if (nextStepKey && conversationFlow[nextStepKey]) {
            doctorSays(conversationFlow[nextStepKey]);
        }
    };

    const handleOtherTextInput = (text) => {
        addMessage('patient', text);
        setPatientData(prev => ({ ...prev, [`${promptingForOther.key}_other`]: text }));
        
        const nextStepKey = promptingForOther.nextStep;
        setPromptingForOther(null);
        setStep(nextStepKey);
        if (nextStepKey && conversationFlow[nextStepKey]) {
            doctorSays(conversationFlow[nextStepKey]);
        }
    };
    
    const calculateBMI = () => {
        const { weight, height } = patientData;
        if (!weight || !height) return null;
        const weightInKg = units.weight === 'lbs' ? parseFloat(weight) * 0.453592 : parseFloat(weight);
        const heightInM = units.height === 'in' ? parseFloat(height) * 0.0254 : parseFloat(height) / 100;
        return heightInM > 0 ? (weightInKg / (heightInM * heightInM)).toFixed(1) : null;
    };

    // ======== REPORT GENERATION & AI INTEGRATION ========
    const fetchAiPlan = async (dataSummary) => {
        setIsGeneratingReport(true);
        setAiReport(null);
        
        const prompt = `
            Based on the following patient data and the "My Weight-Management Plan" guidelines, generate a comprehensive, personalized weight management report in JSON format. The report should have three main sections: "healthyEating", "physicalActivity", and "behaviorAndMindset", plus a "treatmentConsiderations" paragraph. Each main section should contain a bulleted list of 3-4 specific, actionable recommendations tailored to the user's input. The tone must be encouraging, professional, and empathetic.

            Patient Data:
            ${dataSummary}

            "My Weight-Management Plan" Guidelines:
            - Healthy Eating: Recommend 3 meals, 8 glasses of water, increased protein/fiber, reduced sugar/sodium, portion control. Tailor suggestions based on user's current habits (e.g., if they eat 1 meal, suggest starting with 2; if they like chips, suggest a healthier alternative).
            - Physical Activity: Recommend 30 mins/day, 5 days/week. Suggest activities the user enjoys. If they are inactive, suggest starting small (e.g., 10-minute walks). Address their stated barriers if any.
            - Behavior & Mindset: Recommend food journaling, 7-8 hours of sleep, and stress management. Address their specific eating triggers with a concrete strategy.
            - Treatment: Use clinical logic (BMI, comorbidities, contraindications) to determine eligibility for pharmacotherapy (GLP-1s first-line). Always frame this as a discussion to have with their doctor.

            Generate a JSON object with the following structure:
            {
              "healthyEating": ["recommendation 1", "recommendation 2", "recommendation 3"],
              "physicalActivity": ["recommendation 1", "recommendation 2", "recommendation 3"],
              "behaviorAndMindset": ["recommendation 1", "recommendation 2", "recommendation 3"],
              "treatmentConsiderations": "A paragraph of text."
            }
        `;

        try {
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            };
            // Use environment variable for the API key in production
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyDGSTzn0GJq3jCif6wfRBg5O4bwsBaGjwY";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                const rawText = result.candidates[0].content.parts[0].text;
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    let cleanedJsonString = jsonMatch[0].replace(/,\s*(?=[\}\]])/g, "");
                    const parsedJson = JSON.parse(cleanedJsonString);
                    setAiReport(parsedJson);
                } else {
                    throw new Error("No valid JSON object found in the API response.");
                }
            } else {
                 if (result.error) {
                    console.error("API Error:", result.error.message);
                    throw new Error(result.error.message);
                 }
                throw new Error("Invalid response structure from API.");
            }
        } catch (error) {
            console.error("Error fetching AI plan:", error);
            setAiReport({
                healthyEating: ["Eat 3 balanced meals a day.", "Drink at least 8 glasses of water.", "Focus on increasing protein and fiber."],
                physicalActivity: ["Aim for 30 minutes of moderate activity most days.", "Choose an activity you enjoy.", "Incorporate strength training twice a week."],
                behaviorAndMindset: ["Keep a food and activity journal.", "Aim for 7-8 hours of sleep.", "Identify and manage stress."],
                treatmentConsiderations: "We couldn't generate a fully personalized recommendation at this time. It is essential to discuss your full health profile, including lifestyle and potential treatments, with your healthcare provider to create the safest and most effective plan for you."
            });
        } finally {
            setIsGeneratingReport(false);
        }
    };

    useEffect(() => {
        if (step === 'generate_report') {
            const bmi = calculateBMI();
            let dataSummary = `BMI: ${bmi}, ${JSON.stringify(patientData)}`;
            fetchAiPlan(dataSummary);
        }
    }, [step]);

    const handleSpeak = () => {
        if (!aiReport || !window.speechSynthesis) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const bmi = calculateBMI();
        const textToSpeak = `
            Your personalized weight management plan.
            Patient Age: ${patientData.age}.
            Calculated BMI: ${bmi}.
            Section 1: Healthy Eating. ${aiReport.healthyEating.join('. ')}.
            Section 2: Physical Activity. ${aiReport.physicalActivity.join('. ')}.
            Section 3: Behavior and Mindset. ${aiReport.behaviorAndMindset.join('. ')}.
            Section 4: Treatment Considerations. ${aiReport.treatmentConsiderations}.
            Disclaimer: This is a computer-generated plan and not a substitute for professional medical advice.
        `;
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const ReportComponent = () => {
        const bmi = calculateBMI();
        if (isGeneratingReport || !aiReport) {
            return <div className="p-6 text-center text-gray-600 animate-pulse">Generating your personalized report...</div>;
        }
        return (
            <div id="report-content" className="p-6 bg-white rounded-lg text-gray-800">
                <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b pb-2">Your Personalized Weight Management Plan</h2>
                <div className="mb-4"><p><strong>Patient Age:</strong> {patientData.age}</p><p><strong>Calculated BMI:</strong> <span className="font-bold text-lg">{bmi}</span></p></div>
                <div className="mt-6"><h3 className="text-xl font-semibold text-blue-700 mb-3">1. Healthy Eating</h3><ul className="list-disc list-inside space-y-2">{aiReport.healthyEating.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                <div className="mt-6"><h3 className="text-xl font-semibold text-blue-700 mb-3">2. Physical Activity</h3><ul className="list-disc list-inside space-y-2">{aiReport.physicalActivity.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                <div className="mt-6"><h3 className="text-xl font-semibold text-blue-700 mb-3">3. Behavior and Mindset</h3><ul className="list-disc list-inside space-y-2">{aiReport.behaviorAndMindset.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                <div className="mt-6"><h3 className="text-xl font-semibold text-blue-700 mb-3">4. Treatment Considerations</h3><p className="text-base leading-relaxed">{aiReport.treatmentConsiderations}</p></div>
                <div className="mt-8 border-t pt-4 text-xs text-gray-500"><p><strong>Disclaimer:</strong> This is a computer-generated plan. It is for educational purposes and is not a substitute for a consultation with a qualified healthcare professional.</p></div>
            </div>
        );
    };
    
    const handlePrint = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        const printContent = document.getElementById('report-content').innerHTML;
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>Print Report</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
        printWindow.document.write('<style>body { font-family: "Inter", sans-serif; }</style>')
        printWindow.document.write('</head><body class="p-8">');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 500);
    };

    // ======== UI RENDERING ========
    const renderInputArea = () => {
        const currentStepConfig = conversationFlow[step];
        if (!currentStepConfig || currentStepConfig.type === 'final' || currentStepConfig.type === 'summary') return null;

        switch (currentStepConfig.type) {
            case 'button': return <ButtonInput options={currentStepConfig.options} onSubmit={handleUserInput} />;
            case 'number': return <NumberUnitInput onSubmit={handleUserInput} placeholder={currentStepConfig.placeholder} />;
            case 'number_units': return <NumberUnitInput onSubmit={handleUserInput} unitType={currentStepConfig.unitType} onUnitChange={(unit) => setUnits(prev => ({...prev, [currentStepConfig.unitType]: unit}))} />;
            case 'checkbox': return <CheckboxInput options={currentStepConfig.options} onSubmit={handleUserInput} />;
            case 'slider': return <SliderInput min={currentStepConfig.min} max={currentStepConfig.max} onSubmit={handleUserInput} />;
            case 'free_text': return <FreeTextInput onSubmit={promptingForOther ? handleOtherTextInput : handleUserInput} placeholder={currentStepConfig.placeholder} />;
            default: return null;
        }
    };

    return (
        <div className="bg-gray-100 font-sans flex items-center justify-center min-h-screen">
            <div className="w-full h-screen sm:h-auto sm:max-w-3xl bg-gray-50 rounded-none sm:rounded-2xl shadow-2xl flex flex-col" style={{maxHeight: '95vh'}}>
                <div className="bg-white border-b border-gray-200 p-4 rounded-t-none sm:rounded-t-2xl shadow-sm flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                           <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Virtual Health Assistant</h1>
                            <p className="text-sm text-green-500 font-semibold flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Online</p>
                        </div>
                    </div>
                    {step === 'generate_report' && !isGeneratingReport && aiReport && (
                        <div className="flex items-center gap-2">
                            <button onClick={handleSpeak} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition">
                                {isSpeaking ? <XCircle size={20} className="text-red-500"/> : <Volume2 size={20}/>}
                            </button>
                            <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition"><Printer size={20}/></button>
                        </div>
                    )}
                </div>
                <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-white custom-scrollbar">
                    <div className="space-y-6">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-3 ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'doctor' && <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center"><Zap className="w-5 h-5 text-blue-600" /></div>}
                                <div className={`max-w-md lg:max-w-lg px-5 py-3 rounded-2xl shadow-sm ${msg.sender === 'patient' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}><p className="leading-relaxed">{msg.text}</p></div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-end gap-3 justify-start">
                               <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center"><Zap className="w-5 h-5 text-blue-600" /></div>
                                <div className="px-5 py-3 rounded-2xl bg-gray-200 text-gray-500 rounded-bl-none shadow-sm"><div className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span></div></div>
                            </div>
                        )}
                        {step === 'generate_report' && !isTyping && <ReportComponent />}
                        <div ref={chatEndRef} />
                    </div>
                </div>
                <div className="border-t border-gray-200 bg-white rounded-b-none sm:rounded-b-2xl flex-shrink-0">{renderInputArea()}</div>
            </div>
        </div>
    );
}
