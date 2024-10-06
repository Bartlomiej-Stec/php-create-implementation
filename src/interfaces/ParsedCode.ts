import { ClassMethod } from "./ClassMethod";
import { UseStatement } from "./UseStatement";

interface ParsedCode {
    name: string;
    namespace: string | null;
    methods: ClassMethod[];
    isAbstract: boolean;
    isInterface: boolean;
    useStatements: UseStatement[];
    extends: string | null;
    implements: string[];
    endPosition: number;
    startPosition: number;
    statementsEnd: number | null;
};

export { ParsedCode };