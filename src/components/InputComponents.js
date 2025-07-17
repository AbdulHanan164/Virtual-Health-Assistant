import React, { useState } from 'react';

// This file contains all the reusable input components for the chat interface.

export function ButtonInput({ options, onSubmit }) {
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

export function NumberUnitInput({ onSubmit, unitType, onUnitChange, placeholder = "Type your answer..." }) {
    const [value, setValue] = useState('');
    const [valueFt, setValueFt] = useState('');
    const [valueIn, setValueIn] = useState('');
    const [currentUnit, setCurrentUnit] = useState(unitType === 'weight' ? 'kg' : 'cm');

    const handleLocalUnitChange = (newUnit) => {
        setCurrentUnit(newUnit);
        if(onUnitChange) onUnitChange(newUnit);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentUnit === 'ft-in') {
            if (valueFt && valueIn) {
                const totalInches = (parseFloat(valueFt) * 12) + parseFloat(valueIn);
                onSubmit(totalInches.toString());
                setValueFt('');
                setValueIn('');
            }
        } else {
            if (value) {
                onSubmit(value);
                setValue('');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 items-center justify-center">
            {unitType === 'height' && currentUnit === 'ft-in' ? (
                <div className="flex gap-2">
                    <input type="number" value={valueFt} onChange={e => setValueFt(e.target.value)} placeholder="ft" className="w-24 border-2 border-gray-300 p-3 rounded-full focus:border-blue-500 focus:outline-none transition" required />
                    <input type="number" value={valueIn} onChange={e => setValueIn(e.target.value)} placeholder="in" className="w-24 border-2 border-gray-300 p-3 rounded-full focus:border-blue-500 focus:outline-none transition" required />
                </div>
            ) : (
                <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} className="flex-grow border-2 border-gray-300 p-3 rounded-full focus:border-blue-500 focus:outline-none transition" required />
            )}
            
            {unitType && (
                <select value={currentUnit} onChange={(e) => handleLocalUnitChange(e.target.value)} className="border-2 border-gray-300 p-3 rounded-full bg-white focus:outline-none">
                    {unitType === 'weight' ? <><option value="kg">kg</option><option value="lbs">lbs</option></> : <><option value="cm">cm</option><option value="ft-in">ft/in</option></>}
                </select>
            )}
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-full transition shadow-md hover:shadow-lg">Send</button>
        </form>
    );
}

export function CheckboxInput({ options, onSubmit }) {
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleCheckboxChange = (option) => {
        if (option.includes('Other') || option.includes('Prescription medications')) {
            onSubmit(option);
            return;
        }
        
        if (option === 'None' || option === 'None of these') {
             setSelectedOptions(prev => prev.includes(option) ? [] : [option]);
        } else {
            setSelectedOptions(prev => {
                const newSelection = prev.includes(option) 
                    ? prev.filter(item => item !== option) 
                    : [...prev.filter(item => item !== 'None' && item !== 'None of these'), option];
                return newSelection;
            });
        }
    };
    
    return (
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {options.map(opt => (
                    <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${selectedOptions.includes(opt) ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'} border`}>
                        <input type="checkbox" checked={selectedOptions.includes(opt)} onChange={() => handleCheckboxChange(opt)} className="h-5 w-5 rounded-sm text-blue-600 focus:ring-blue-500 border-gray-300" />
                        <span>{opt}</span>
                    </label>
                ))}
            </div>
            <button onClick={() => onSubmit(selectedOptions)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full transition shadow-md hover:shadow-lg">Confirm Selection</button>
        </div>
    );
}

export function SliderInput({ min, max, onSubmit }) {
    const [value, setValue] = useState(min);
    return (
        <div className="p-4 flex flex-col items-center">
            <span className="font-bold text-3xl text-blue-600 mb-3">{value}</span>
            <input type="range" min={min} max={max} value={value} onChange={e => setValue(e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%, #E5E7EB 100%)` }} />
            <button onClick={() => onSubmit(value)} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition shadow-md hover:shadow-lg">Submit</button>
        </div>
    );
}

export function FreeTextInput({ onSubmit, placeholder = "Please specify..." }) {
    const [value, setValue] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (value) {
            onSubmit(value);
            setValue('');
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 items-center">
            <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} className="flex-grow border-2 border-gray-300 p-3 rounded-full focus:border-blue-500 focus:outline-none transition" required />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-full transition shadow-md hover:shadow-lg">Send</button>
        </form>
    );
}
