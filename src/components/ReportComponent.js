import React from 'react';

// This component is responsible for rendering the final AI-generated report.

export function ReportComponent({ aiReport, isGeneratingReport, reportStatusMessage }) {
    if (isGeneratingReport || !aiReport) {
        return <div className="p-6 text-center text-gray-600 animate-pulse">{reportStatusMessage}</div>;
    }
    
    return (
        <div id="report-content" className="p-4 sm:p-6 bg-white rounded-lg text-gray-800 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-blue-800 mb-2">Your Personalized Weight Management Plan</h2>
                <p className="text-sm text-gray-600">This plan is based on our conversation and aligned with NICE clinical guidelines. Please use it as a starting point for a discussion with your healthcare provider.</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-700 mb-2">Your Health Assessment</h3>
                <p className="text-base leading-relaxed">{aiReport.assessmentSummary}</p>
            </div>
            
            <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-2">1. Healthy Eating</h3>
                <p className="text-base leading-relaxed">{aiReport.healthyEating}</p>
            </div>
            
            <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-2">2. Physical Activity</h3>
                <p className="text-base leading-relaxed">{aiReport.physicalActivity}</p>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-2">3. Behavior and Mindset</h3>
                <p className="text-base leading-relaxed">{aiReport.behaviorAndMindset}</p>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-2">4. Treatment Considerations</h3>
                <p className="text-base leading-relaxed">{aiReport.treatmentConsiderations}</p>
            </div>

            <div className="border-t pt-4 text-xs text-gray-500"><p><strong>Disclaimer:</strong> This is a computer-generated plan based on NICE guidelines. It is for educational purposes and is not a substitute for a consultation with a qualified healthcare professional.</p></div>
        </div>
    );
};
