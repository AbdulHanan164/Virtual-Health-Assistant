import React, { useState, useEffect, useRef } from 'react';
import { conversationFlow } from './config/conversationFlow';
import { getClassifications } from './utils/classification';
import { fetchAiPlan } from './services/aiService';
import { ButtonInput, NumberUnitInput, CheckboxInput, SliderInput, FreeTextInput } from './components/InputComponents';
import { ReportComponent } from './components/ReportComponent';
import { Printer, Volume2, XCircle, Calendar, Zap } from './assets/icons';

function App() {
    const [step, setStep] = useState('welcome');
    const [chatHistory, setChatHistory] = useState([]);
    const [patientData, setPatientData] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [units, setUnits] = useState({ weight: 'kg', height: 'cm' });
    const [promptingForOther, setPromptingForOther] = useState(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportStatusMessage, setReportStatusMessage] = useState("Generating your personalized report...");
    const [aiReport, setAiReport] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isTyping, aiReport]);

    const doctorSays = (messageConfig) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            if (messageConfig.type === 'info') {
                addMessage('doctor', messageConfig.text);
                const nextStepKey = messageConfig.next;
                setStep(nextStepKey);
                if (nextStepKey && conversationFlow[nextStepKey]) {
                    doctorSays(conversationFlow[nextStepKey]);
                }
            } else {
                addMessage('doctor', messageConfig.text);
            }
        }, 1000 + Math.random() * 500);
    };
    
    useEffect(() => {
        doctorSays(conversationFlow.welcome);
    }, []);

    const addMessage = (sender, text) => {
        setChatHistory(prev => [...prev, { sender, text }]);
    };

    const handleUserInput = (value) => {
        const currentStepConfig = conversationFlow[step];
        let userResponse = Array.isArray(value) ? value.join(', ') : value.toString();

        if (userResponse.includes('Other (please specify)')) {
            setPromptingForOther({ key: currentStepConfig.key, nextStep: currentStepConfig.next });
            setStep('prompt_for_other_text');
            doctorSays(conversationFlow.prompt_for_other_text);
            return;
        }
        if (userResponse.includes('Prescription medications')) {
            addMessage('patient', userResponse);
            setPatientData(prev => ({...prev, [currentStepConfig.key]: value}));
            setStep('specify_medication');
            doctorSays(conversationFlow.specify_medication);
            return;
        }

        addMessage('patient', userResponse);

        if (currentStepConfig.validation && !currentStepConfig.validation(value)) {
            doctorSays({ text: currentStepConfig.error });
            return;
        }
        
        const updatedPatientData = { ...patientData, [currentStepConfig.key || step]: value };
        setPatientData(updatedPatientData);

        let nextStepKey = typeof currentStepConfig.next === 'function' ? currentStepConfig.next(value, updatedPatientData) : currentStepConfig.next;
        setStep(nextStepKey);
        if (nextStepKey && conversationFlow[nextStepKey]) {
            doctorSays(conversationFlow[nextStepKey]);
        }
    };
    
    const handleOtherTextInput = (text) => {
        addMessage('patient', text);
        const keyToUpdate = promptingForOther.key === 'weight_loss_methods' ? 'weight_loss_meds_specify' : `${promptingForOther.key}_other`;
        setPatientData(prev => ({ ...prev, [keyToUpdate]: text }));

        const nextStepKey = promptingForOther.nextStep;
        setPromptingForOther(null);
        setStep(nextStepKey);
        if (nextStepKey && conversationFlow[nextStepKey]) {
            doctorSays(conversationFlow[nextStepKey]);
        }
    };
    
    useEffect(() => {
        const generatePlan = async () => {
            if (step === 'generate_report') {
                setIsGeneratingReport(true);
                setReportStatusMessage("Analyzing your information and generating your personalized plan...");
                const classifications = getClassifications(patientData, units);
                const report = await fetchAiPlan(patientData, classifications);
                setAiReport(report);
                setIsGeneratingReport(false);
            }
        };
        generatePlan();
    }, [step, patientData, units]);

    const handleSpeak = () => {
        if (!aiReport || !window.speechSynthesis) return;
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const textToSpeak = `
            Your personalized weight management plan.
            ${aiReport.assessmentSummary}.
            Regarding healthy eating: ${aiReport.healthyEating}.
            For your physical activity plan: ${aiReport.physicalActivity}.
            On behavior and mindset: ${aiReport.behaviorAndMindset}.
            Finally, some treatment considerations: ${aiReport.treatmentConsiderations}.
            Disclaimer: This is a computer-generated plan and not a substitute for professional medical advice.
        `;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const handlePrint = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        const printContent = document.getElementById('report-content').innerHTML;
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>Print Report</title>');
        printWindow.document.write('<style>body { font-family: "Inter", sans-serif; } .p-4 { padding: 1rem; } .sm\\:p-6 { padding: 1.5rem; } .bg-white { background-color: #fff; } .rounded-lg { border-radius: 0.5rem; } .text-gray-800 { color: #2d3748; } .space-y-6 > :not([hidden]) ~ :not([hidden]) { --tw-space-y-reverse: 0; margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse))); margin-bottom: calc(1.5rem * var(--tw-space-y-reverse)); } .text-2xl { font-size: 1.5rem; line-height: 2rem; } .font-bold { font-weight: 700; } .text-blue-800 { color: #2c5282; } .mb-2 { margin-bottom: 0.5rem; } .text-sm { font-size: 0.875rem; line-height: 1.25rem; } .text-gray-600 { color: #718096; } .bg-blue-50 { background-color: #ebf8ff; } .text-xl { font-size: 1.25rem; line-height: 1.75rem; } .font-semibold { font-weight: 600; } .text-blue-700 { color: #2b6cb0; } .text-base { font-size: 1rem; line-height: 1.5rem; } .leading-relaxed { line-height: 1.625; } .border-t { border-top-width: 1px; } .pt-4 { padding-top: 1rem; } .text-xs { font-size: 0.75rem; line-height: 1rem; } .text-gray-500 { color: #a0aec0; } h2, h3 { margin-bottom: 0.75rem; } </style>');
        printWindow.document.write('</head><body class="p-8">');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 500);
    };

    const renderInputArea = () => {
        const currentStepConfig = conversationFlow[step];
        if (!currentStepConfig || currentStepConfig.type === 'final' || currentStepConfig.type === 'summary') return null;
        switch (currentStepConfig.type) {
            case 'button': return <ButtonInput options={currentStepConfig.options} onSubmit={handleUserInput} />;
            case 'number': return <NumberUnitInput onSubmit={handleUserInput} placeholder={currentStepConfig.placeholder} />;
            case 'number_units': return <NumberUnitInput onSubmit={handleUserInput} unitType={currentStepConfig.unitType} onUnitChange={(unit) => setUnits(prev => ({ ...prev, [currentStepConfig.unitType]: unit }))} />;
            case 'checkbox': return <CheckboxInput options={currentStepConfig.options} onSubmit={handleUserInput} />;
            case 'slider': return <SliderInput min={currentStepConfig.min} max={currentStepConfig.max} onSubmit={handleUserInput} />;
            case 'free_text': return <FreeTextInput onSubmit={promptingForOther ? handleOtherTextInput : handleUserInput} placeholder={currentStepConfig.placeholder} />;
            case 'info': return null;
            default: return null;
        }
    };

    return (
        <div className="bg-gray-100 font-sans flex items-center justify-center min-h-screen">
            <div className="w-full h-screen sm:h-auto sm:max-w-3xl bg-gray-50 rounded-none sm:rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: '95vh' }}>
                <div className="bg-white border-b border-gray-200 p-4 rounded-t-none sm:rounded-t-2xl shadow-sm flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><Calendar /></div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Virtual Health Assistant</h1>
                            <p className="text-sm text-green-500 font-semibold flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Online</p>
                        </div>
                    </div>
                    {step === 'generate_report' && !isGeneratingReport && aiReport && (
                        <div className="flex items-center gap-2">
                            <button onClick={handleSpeak} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition">{isSpeaking ? <XCircle /> : <Volume2 />}</button>
                            <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition"><Printer /></button>
                        </div>
                    )}
                </div>
                <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-white custom-scrollbar">
                    <div className="space-y-6">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-3 ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'doctor' && <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center"><Zap /></div>}
                                <div className={`max-w-md lg:max-w-lg px-5 py-3 rounded-2xl shadow-sm ${msg.sender === 'patient' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}><p className="leading-relaxed">{msg.text}</p></div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-end gap-3 justify-start">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center"><Zap /></div>
                                <div className="px-5 py-3 rounded-2xl bg-gray-200 text-gray-500 rounded-bl-none shadow-sm"><div className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span></div></div>
                            </div>
                        )}
                        {step === 'generate_report' && !isTyping && <ReportComponent aiReport={aiReport} isGeneratingReport={isGeneratingReport} reportStatusMessage={reportStatusMessage} />}
                        <div ref={chatEndRef} />
                    </div>
                </div>
                <div className="border-t border-gray-200 bg-white rounded-b-none sm:rounded-b-2xl flex-shrink-0">{renderInputArea()}</div>
            </div>
        </div>
    );
}

export default App;
