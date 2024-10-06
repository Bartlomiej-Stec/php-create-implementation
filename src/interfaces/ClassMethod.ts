interface Param {
    name: string;
    typeHint?: string;
};

interface ClassMethod {
    name: string;
    params: Param[];
    returnTypeHint: string | null;
    hasImplementation: boolean;
    isStatic: boolean;
    isAbstract: boolean;
    isFinal: boolean;
    visibility: string;
};

export { ClassMethod };

