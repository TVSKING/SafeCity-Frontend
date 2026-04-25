import React, { useState } from 'react';
import { MessageSquare, Send, X, Bot, AlertTriangle, ShieldCheck } from 'lucide-react';

const AITriage = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const questions = [
    {
      id: 'conscious',
      text: "Is the victim conscious and breathing?",
      options: ['Yes', 'No', 'Unsure']
    },
    {
      id: 'bleeding',
      text: "Is there any severe bleeding or visible life-threatening injury?",
      options: ['Yes', 'No']
    },
    {
      id: 'trapped',
      text: "Is anyone trapped or unable to move?",
      options: ['Yes', 'No']
    }
  ];

  const handleAnswer = (answer) => {
    const newResponses = [...responses, { question: questions[step].text, answer }];
    setResponses(newResponses);
    
    if (step < questions.length - 1) {
      setIsTyping(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsTyping(false);
      }, 600);
    } else {
      // Calculate triage level
      let level = 3; // Default
      const isConscious = newResponses.find(r => r.question.includes('conscious'))?.answer === 'No';
      const isBleeding = newResponses.find(r => r.question.includes('bleeding'))?.answer === 'Yes';
      const isTrapped = newResponses.find(r => r.question.includes('trapped'))?.answer === 'Yes';

      if (isConscious || (isBleeding && isTrapped)) level = 5;
      else if (isBleeding || isTrapped) level = 4;
      
      onComplete(level, newResponses);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-red-600 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Bot className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Triage Assistant</h3>
              <p className="text-xs text-red-100 opacity-80">Crisis categorization engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 bg-gray-50 min-h-[300px] overflow-y-auto flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
              <Bot size={18} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-800 text-sm leading-relaxed">
              I'll help categorize your emergency to ensure the right priority. Please answer these questions.
            </div>
          </div>

          {responses.map((res, i) => (
            <React.Fragment key={i}>
              <div className="flex justify-end">
                <div className="bg-red-600 text-white p-3 px-5 rounded-2xl rounded-tr-none shadow-md text-sm">
                  {res.answer}
                </div>
              </div>
              {i < step && (
                <div className="flex gap-3">
                   <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
                    <Bot size={18} />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-800 text-sm">
                    {questions[i+1].text}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          {!isTyping && responses.length === step && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-800 text-sm">
                {questions[step].text}
              </div>
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="p-6 bg-white border-t border-gray-100">
          {!isTyping && responses.length === step ? (
            <div className="grid grid-cols-2 gap-3">
              {questions[step].options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className="py-3 px-4 bg-gray-50 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-xl font-semibold text-sm transition-all active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-400 text-sm italic">
              AI is processing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITriage;
