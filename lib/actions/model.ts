export interface InstructionSet {
    symbol: string;
    name: string;
    architecture: string;
    bits: Array<[number, number, string, string]>;
    format: string;
    purpose: string;
    description: string;
    restrictions: string;
    operation: string;
    exceptions: string;
    programming_notes: string;
    implementation_notes: string;
}