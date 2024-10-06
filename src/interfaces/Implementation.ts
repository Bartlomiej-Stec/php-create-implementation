import { ParsedCode } from "./ParsedCode";
import { Expression } from "./Expression";

interface Implementation {
    expressions: Expression[];
    codeInfo: ParsedCode;
    type: 'interface' | 'abstract';
};

export { Implementation };
