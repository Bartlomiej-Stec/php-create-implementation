import { ClassMethod } from "../interfaces/ClassMethod";
import { UseStatement } from "../interfaces/UseStatement";

const findNamespaceFromString = (namespaces: UseStatement[], text: string): UseStatement => {
    let namespacePath = '';
    let alias = null;
    namespaces.forEach(namespace => {
        if (namespace.alias === text) {
            alias = namespace.alias;
            namespacePath = namespace.name;
        }

        const lastPart = getNamespaceLastPart(namespace.name);
        if (lastPart === text && !namespace.alias) {
            namespacePath = namespace.name;
        }
    });
    return {
        name: namespacePath,
        alias: alias,
    };
};

const useStatementExists = (text: string, useStatements: UseStatement[]): boolean => {
    return useStatements.some(use => {
        const lastPart = getNamespaceLastPart(use.name);
        const compare = use.alias ? use.alias : lastPart;
        return compare === text;
    });
};

const getNamespaceLastPart = (namespace: string): string => {
    return namespace.split('\\').pop() || '';
};


const generateUseStatementString = (useStatements: UseStatement[]): string => {
    return useStatements.map(use =>
        `use ${use.name}${use.alias ? ` as ${use.alias}` : ''};`
    ).join('\n');
};

const getMissingUseStatements = (methods: ClassMethod[], useStatements: UseStatement[], parentUseStatements: UseStatement[]): UseStatement[] => {
    const hints: string[] = [];
    
    methods.forEach((method: ClassMethod) => {
        if (method.returnTypeHint) {
            hints.push(method.returnTypeHint);
        }

        method.params.forEach(param => {
            if (param.typeHint) {
                hints.push(param.typeHint);
            }
        });
    });

    const missingHints = hints.filter(hint => !useStatementExists(hint, useStatements));
    const namespaces: UseStatement[] = [];
    missingHints.forEach(hint => {
        const namespace = findNamespaceFromString(parentUseStatements, hint);
        const lastPart = getNamespaceLastPart(namespace.name);
        if (hint === namespace.alias || lastPart === hint) {
            namespaces.push(namespace);
        }
    });
    return namespaces;
};

export {
    findNamespaceFromString,
    generateUseStatementString,
    getMissingUseStatements,
};

