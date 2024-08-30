'use server';

import { InstructionSet } from "./model";
import { functTable, hexTable, instructions, opcodeTable, regimmTable, registerTable } from "./Information_db";
import { registerToBinary } from "./Information_db";

export async function Convert(type: 'mips' | 'hex' | 'bin', instruction: string): Promise<{
                instructionSet: InstructionSet, 
                instruction: string,
                binaryForm: Array<Array<string | number>>, 
                hex: string}> {
    switch (type) {
        case 'mips':
            return convertFromMips(instruction);
        case 'hex':
            return convertFromHex(instruction);
        case 'bin':
            return convertFromBinary(instruction);
        default:
            throw new Error('Invalid conversion type');
    }
}

function getTypedInstructionBits(instructionObject:InstructionSet, typedInstruction:string){

    // parse typed instruction and actual instruction format from $ and 0x 
    var regexRegisters = /^(\$([0-9a-z])+|[a-z]([0-9a-z])*)$/g;
    var regexNumbers = /^0x([0-9a-f])+$/g;

    // remove comas, parenthesis and square brackets of the format string
    var format = instructionObject.format;
    format = format.replace(/\[[^\]]+\]/g, ''); 
    format = format.replace(/,/g, ' '); 
    format = format.replace(/\(/g, ' '); 
    format = format.replace(/\)/g, ' '); 

    // get all the pieces of the format string and typed instruction (consider whitespaces as separators)
    var formatPieces = format.replace(/\s+/g,' ').trim().split(' ');
    var instructionPieces = typedInstruction.replace(/\s+/g,' ').trim().split(' ');

    if(instructionPieces.length != formatPieces.length) return null;

    // check if the typed instruction is in the correct format
    for(let i = 1; i < instructionPieces.length; i++){ 

        // check if it is a register
        if(instructionPieces[i].match(regexRegisters) != null){
            if(formatPieces[i].match(/(rd|rs|rt|base|target)/) == null) return null; 
            if(typeof registerToBinary[instructionPieces[i] as keyof typeof registerToBinary] === 'undefined') return null; 
            continue;
        }
    
        // check if it is a number
        if(instructionPieces[i].match(regexNumbers) != null){
            if(formatPieces[i].match(/(immediate|offset|cop_fun|sa|target|hint|index)/) == null) return null;
            continue;
        }
        return null; 
    }

    let typedInstructionBits: Array<Array<number | string>> = [];

    // for each field of the instruction
    for(let i = 0; i < instructionObject.bits.length; i++){

        // copy field attributes (except for the content that must be computed)
        typedInstructionBits[i] = [];
        typedInstructionBits[i][0] = instructionObject.bits[i][0];
        typedInstructionBits[i][1] = instructionObject.bits[i][1];
        typedInstructionBits[i][2] = instructionObject.bits[i][2];
    
        // if the instruction field is a constant, copy
        if(instructionObject.bits[i][3] != ""){
            typedInstructionBits[i][3] = instructionObject.bits[i][3];
        }
        else{
            var binaryValue = "";
            var position = -1; // get position of field in the intruction format
                
            for(let j = 0; j < formatPieces.length; j++){
                if(formatPieces[j] == instructionObject.bits[i][2]) position = j;
            }
    
            // if this field is unknown (cannot be retrieved from typed instruction), fill it with X
            if(position == -1){
                for(let j = 0; j < instructionObject.bits[i][0] - instructionObject.bits[i][1] + 1; j++){
                    binaryValue = binaryValue + "X";
                }
            }
            else{
                var typedField = instructionPieces[position]; // get the field from the typed instruction
        
                for(let j = 0; j < instructionObject.bits[i][0] - instructionObject.bits[i][1] + 1; j++){
                    binaryValue = binaryValue + "0";
                }
    
                // if it is a number, get the binary value of the hexadecimal number
                if(typedField.match(regexNumbers) != null){
                    var binaryNumber = "";
        
                    // convert the hexadecimal number to a binary number
                    for(let j = typedField.length - 1; j >= 0 && typedField[j] != 'x'; j--){
                        const char = typedField[j].toLowerCase();
                        if (char in hexTable) {
                            binaryNumber = hexTable[char as keyof typeof hexTable] + binaryNumber;
                        }
                    }
        
                    // add zeros in the left to fill all the field positions
                    for(let j = binaryNumber.length; j < instructionObject.bits[i][0] - instructionObject.bits[i][1] + 1; j++){
                    binaryNumber = "0" + binaryNumber;
                    }
        
                    // get only the correct number of bits of the hexadecimal number
                    binaryValue = binaryNumber.substring(binaryNumber.length - (instructionObject.bits[i][0] - instructionObject.bits[i][1] + 1), binaryNumber.length);
                }
        
                // if it is a register, translate it to get the binary value
                if(typedField.match(regexRegisters) != null){
                    binaryValue = registerToBinary[typedField as keyof typeof registerToBinary] || '';
                    typedInstructionBits[i][2] = typedField;
                }
            }
            typedInstructionBits[i][3] = binaryValue;
        }
    }
    
    return typedInstructionBits;
}

function searchInstruction(instruction: string){
    
    //replace the variable part of the instruction
    instruction = instruction.replace(/\.([^\.]*)$/, ".fmt");

    //search is case insensitive
    var symbol = instruction.replace(".", "").toUpperCase();
    var symbolFound = 0;
    let instructionObject : InstructionSet | undefined;

    for (let i = 0; i < instructions.length; i++) {
        if (instructions[i].symbol.replace(".", "").toUpperCase() === symbol) {
            instructionObject = instructions[i] as InstructionSet;
            symbolFound = 1;
            break;
        }
    }

    if(symbolFound == 0){
	    var errorMessage = "Error: Instruction was not found. Please check to make sure you are entering a valid instruction.";
	    throw errorMessage;
    }

    return instructionObject;
}

async function convertFromMips(instruction: string): Promise<{
                instructionSet: InstructionSet, 
                instruction: string,
                binaryForm: Array<Array<string | number>>, 
                hex: string}> {
    try{
        let typedInstruction = instruction.toLowerCase();

        // remove comas, parenthesis and extra spaces of the typed instruction
        typedInstruction = typedInstruction.replace(/,/g, ' '); 
        typedInstruction = typedInstruction.replace(/\(/g, ' '); 
        typedInstruction = typedInstruction.replace(/\)/g, ' '); 
        typedInstruction = typedInstruction.trim(); 
        typedInstruction = typedInstruction.replace(/\s{2,}/g, ' '); 
        let typedInstructionSymbol = typedInstruction.split(' ')[0].toUpperCase();

        let instructionObject = searchInstruction(typedInstructionSymbol);

        if(typeof instructionObject === 'undefined' || typeof instructionObject.format === 'undefined'){
            throw "Not Found"
        }

        let bitForm = getTypedInstructionBits(instructionObject, typedInstruction) || []

        var bin = ""; //get the binary value of the typed instruction
        for(let j = 0; j < bitForm.length; j++){
            if (String(bitForm[j][3]).length == Number(bitForm[j][0]) - Number(bitForm[j][1]) + 1){
                bin += bitForm[j][3];
            } else {
                const paddedBits = String(bitForm[j][3]).padStart(Number(bitForm[j][0]) - Number(bitForm[j][1]) + 1, '0');
                bin += paddedBits;
            }
        }
        
        // Convert binary to hex
        let hexForm = '';
        for (let i = 0; i < bin.length; i += 4) {
            const chunk = bin.slice(i, i + 4);
            const hexDigit = parseInt(chunk, 2).toString(16);
            hexForm += hexDigit;
        }
        hexForm = '0x' + hexForm.toUpperCase();
        
        return {
            instructionSet: instructionObject,
            instruction: instruction,
            binaryForm: bitForm, 
            hex: hexForm};
    } catch (error) {
        if (error === "Not Found") {
            throw new Error("Instruction not found in the database.");
        } else {
            throw new Error("An unexpected error occurred while converting from MIPS.");
        }
    }
}

async function convertFromBinary(instruction: string): Promise<{
    instructionSet: InstructionSet, 
    instruction: string,
    binaryForm: Array<Array<string | number>>, 
    hex: string
}> {
    try {
        // Đảm bảo instruction chỉ chứa 0 và 1, và có độ dài 32 bit
        if (!/^[01]{32}$/.test(instruction)) {
            throw new Error("Invalid binary instruction. Must be 32 bits of 0s and 1s.");
        }

        // Chuyển đổi binary thành hex
        let hexForm = '';
        for (let i = 0; i < 32; i += 4) {
            const chunk = instruction.slice(i, i + 4);
            const hexDigit = parseInt(chunk, 2).toString(16);
            hexForm += hexDigit;
        }
        hexForm = '0x' + hexForm.toUpperCase();

        // Xác định opcode
        const opcode = instruction.slice(0, 6);
        let instructionObject: InstructionSet | undefined;

        if (opcode === '000000') {
            // R-type instruction
            const funct = instruction.slice(26, 32);
            const functCode = functTable[funct as keyof typeof functTable];
            instructionObject = searchInstruction(functCode);
        } else if (opcode === '000001') {
            // REGIMM instruction
            const rt = instruction.slice(16, 21);
            const regimmCode = regimmTable[rt as keyof typeof regimmTable];
            instructionObject = searchInstruction(regimmCode);
        } else {
            // I-type or J-type instruction
            const opcodeInstruction = opcodeTable[opcode as keyof typeof opcodeTable];
            instructionObject = searchInstruction(opcodeInstruction);
        }

        if (!instructionObject) {
            throw new Error("Instruction not found in the database.");
        }

        // Xây dựng binaryForm
        let binaryForm: Array<Array<string | number>> = [];
        for (let i = 0; i < instructionObject.bits.length; i++) {
            const [start, end, name, value] = instructionObject.bits[i];
            const bitValue = instruction.slice(32 - start - 1, 32 - end);
            binaryForm.push([start, end, name, bitValue]);
        }

        // Xây dựng MIPS instruction string
        let mipsInstruction = instructionObject.symbol + ' ';
        const format = instructionObject.format.split(' ').slice(1);
        for (let i = 0; i < format.length; i++) {
            const field = format[i].replace(/[,\(\)\[\]]/g, '');
            const bitField = binaryForm.find(b => b[2] === field);
            if (bitField) {
                if (field.match(/^(rd|rs|rt|base)$/)) {
                    mipsInstruction += registerTable[bitField[3] as keyof typeof registerTable] + ' ';
                } else {
                    mipsInstruction += parseInt(bitField[3] as string, 2) + ' ';
                }
            }
        }
        mipsInstruction = mipsInstruction.trim();

        return {
            instructionSet: instructionObject,
            instruction: mipsInstruction,
            binaryForm: binaryForm,
            hex: hexForm
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("An unexpected error occurred while converting from binary.");
        }
    }
}

async function convertFromHex(instruction: string): Promise<{
    instructionSet: InstructionSet, 
    instruction: string,
    binaryForm: Array<Array<string | number>>, 
    hex: string
}> {
    try {
        // Kiểm tra xem instruction có phải là một chuỗi hex hợp lệ không
        if (!/^0x[0-9A-Fa-f]{8}$/.test(instruction)) {
            throw new Error("Invalid hexadecimal instruction. Must be in the format 0xXXXXXXXX.");
        }

        // Chuyển đổi hex thành binary
        let binaryInstruction = '';
        for (let i = 2; i < instruction.length; i++) {
            const hexDigit = instruction[i];
            const binaryDigit = parseInt(hexDigit, 16).toString(2).padStart(4, '0');
            binaryInstruction += binaryDigit;
        }

        // Gọi convertFromBinary với chuỗi binary đã chuyển đổi
        return await convertFromBinary(binaryInstruction);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("An unexpected error occurred while converting from hexadecimal.");
        }
    }
}