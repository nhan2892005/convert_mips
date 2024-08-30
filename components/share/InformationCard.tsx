'use client'

import { InstructionSet } from "../../lib/actions/model"

interface InformationCardProps {
  instructionSet: InstructionSet;
  instruction?: string,
  binary?: Array<Array<number | string>>;
  hex?: string;
}

export default function InformationCard({ instructionSet, instruction, binary, hex }: InformationCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Instruction:</h3>
        <p className="font-mono bg-gray-100 p-2 rounded">{instruction}</p>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Binary Representation:</h3>
        <div className="flex flex-row mb-2 overflow-x-auto">
          {(binary ?? []).map((item, i) => (
            <div key={i} className="flex flex-col items-center mx-1">
              <div className="text-xs mt-1">{item[2]}</div>  
              <div className="border border-gray-300 flex items-center justify-center">
                {item[3] ?? '0'}
              </div>
              <div className="text-xs mt-1">{item[0] + " <- " + item[1]}</div>
            </div>
          ))}
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Hexadecimal:</h3>
        <p className="font-mono bg-gray-100 p-2 rounded">{hex}</p>
      </div>
      </div> 
      <h2 className="text-2xl font-bold mb-4">{instructionSet.symbol}: {instructionSet.name}</h2>
      <p className="text-gray-600 mb-4">Architecture: {instructionSet.architecture}</p>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Format:</h3>
        <p className="font-mono bg-gray-100 p-2 rounded">{instructionSet.format}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Purpose:</h3>
        <p>{instructionSet.purpose}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Description:</h3>
        <p dangerouslySetInnerHTML={{ __html: instructionSet.description }}></p>
      </div>
      
      {instructionSet.restrictions && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Restrictions:</h3>
          <p>{instructionSet.restrictions}</p>
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Operation:</h3>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{instructionSet.operation}</pre>
      </div>
      
      {instructionSet.exceptions && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Exceptions:</h3>
          <p>{instructionSet.exceptions}</p>
        </div>
      )}
      
      {instructionSet.programming_notes && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Programming Notes:</h3>
          <p>{instructionSet.programming_notes}</p>
        </div>
      )}
      
      {instructionSet.implementation_notes && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Implementation Notes:</h3>
          <p>{instructionSet.implementation_notes}</p>
        </div>
      )}
    </div>
  )
}

