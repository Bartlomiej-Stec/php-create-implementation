import { applyTemplate } from "./templateUtils";
import { methodImplementationTemplate, methodPsr12Template } from "./templates";
import { ClassMethod } from "../interfaces/ClassMethod";

const generateMethodImplementation = (method: ClassMethod, isPsr12: boolean) => {
    if (method.hasImplementation) {
        return '';
    }

    const paramsString = method.params
        .map(param => {
            const paramName = param.name;
            return param.typeHint ? `${param.typeHint} $${paramName}` : `$${paramName}`;
        })
        .join(', ');

    const returnTypeString = method.returnTypeHint ? `: ${method.returnTypeHint}` : '';

    const templateValues = {
        methodName: method.name,
        paramsString: paramsString,
        returnTypeString: returnTypeString,
        visibility: method.visibility,
        static: method.isStatic ? ' static' : '',
        final: method.isFinal ? ' final' : '',
    };

    const methodTemplate = isPsr12 ? methodPsr12Template : methodImplementationTemplate;
    const methodImplementation = applyTemplate(methodTemplate, templateValues);
    return methodImplementation;
};

const generateMissingImplementations = (methods: ClassMethod[], isPsr12: boolean): string => {
    return methods
        .map(method => generateMethodImplementation(method, isPsr12))
        .filter(method => method !== '')
        .join('\n');
};


export { generateMissingImplementations };