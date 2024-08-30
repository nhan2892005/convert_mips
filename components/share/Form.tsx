"use client"

import React, { useState } from 'react';
import { Convert } from '../../lib/actions/convert';
import InformationCard from './InformationCard';

interface FormProps {
  title: string;
  placeholder: string;
  type: 'mips' | 'hex' | 'bin';
}

const getExampleByType = (type: 'mips' | 'hex' | 'bin') => {
  switch (type) {
    case 'mips':
      return 'add $t1, $t2, $t3 hoặc add t1 t2 t3 hoặc ADD t1 t2 t3';
    case 'hex':
      return '0x01095020';
    case 'bin':
      return '00000001000010010101000000100000';
    default:
      return '';
  }
};

const Form: React.FC<FormProps> = ({ title, placeholder, type }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [send, setSend] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setSend(true);
    e.preventDefault();
    try {
      const convertedData = await Convert(type, inputValue);
      setResult(convertedData);
    } catch (error) {
      console.error('Conversion error:', error);
    }
    setInputValue('');
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="text-black bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow hover:cursor-pointer"
          placeholder={placeholder}
        />
        <button
          type="submit"
          disabled={!inputValue}
          className={`bg-blue-500 text-white px-4 py-2 rounded transition-all duration-300 ${
            isFocused ? 'w-20' : 'w-24'
          } ${!inputValue ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          {isFocused ? 'Gửi' : 'Gửi đi'}
        </button>
      </form>
      {send === false ?
        <p>Hãy nhập một lệnh. Ex: {getExampleByType(type)}</p>
        :<>
        {result ? (
        <InformationCard
          instructionSet={result.instructionSet}
          instruction={result.instruction}
          binary={result.binaryForm}
          hex={result.hex}
        />
        ) : (
          <p></p>
        )}</>
      }
    </div>
  );
};

export default Form;
