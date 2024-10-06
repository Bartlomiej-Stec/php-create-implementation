import { ParsedCode } from "../interfaces/ParsedCode";
import { UseStatement } from "../interfaces/UseStatement";

const engine = require("php-parser");

const parser = new engine({
    parser: {
        extractDoc: true,
        php7: true,
    },
    ast: {
        withPositions: true,
    },
});

const getClassInfoFromAst = (ast: any): ParsedCode[] => {
    const classes: ParsedCode[] = [];
    let useStatements: UseStatement[] = [];
    let currentNamespace: string | null = null;
    let startPosition = 10;
    let statementsEnd: number | null = null;

    const traverseNode = (node: any) => {
        if (node.kind === 'namespace') {
            currentNamespace = node.name;
            
        }

        if (node.kind === 'usegroup' || node.kind === 'useitem') {
            const items = node.kind === 'usegroup' ? node.items : [node]; 
            
            useStatements = useStatements.concat(
                items.map((item: any) => ({
                    name: item.name,
                    alias: item?.alias?.name ?? null
                }))
            );

            statementsEnd = node.loc.end.offset;
        }

        if (node.kind === 'class' || node.kind === 'interface') {
            startPosition = node.loc.start.offset;
            const className = node.name.name;
            const endPosition = node.loc.end.offset;
            const methods = node.body
                .filter((bodyNode: any) => bodyNode.kind === 'method')
                .map((methodNode: any) => {
                    const methodName = methodNode.name.name;

                    const methodBody = methodNode.body ? methodNode.body.loc.source : '';
                    const hasImplementation = !!methodNode.body;
                    const visibility = methodNode.visibility;
                    const isStatic = methodNode.isStatic;

                    const params = methodNode.arguments
                        ? methodNode.arguments.map((arg: any) => {
                            return {
                                name: arg.name.name,
                                typeHint: arg.type ? arg.type.name : null
                            };
                        })
                        : [];

                    const returnTypeHint = methodNode.type ? methodNode.type.name : null;
                    return {
                        name: methodName,
                        body: methodBody,
                        params: params,
                        returnTypeHint: returnTypeHint,
                        hasImplementation: hasImplementation,
                        isStatic: isStatic || false,
                        isAbstract: methodNode.isAbstract || false,
                        isFinal: methodNode.isFinal || false,
                        visibility: visibility,
                    };
                });

            const isAbstract = node.isAbstract || false;
            const isInterface = node.kind === 'interface';

            const extendsClass = node.extends ? node.extends.name : null;

            const implementedInterfaces = node.implements
                ? node.implements.map((iface: any) => iface.name)
                : [];

            classes.push({
                name: className,
                namespace: currentNamespace,
                methods: methods,
                isAbstract: isAbstract,
                isInterface: isInterface,
                useStatements: useStatements,
                extends: extendsClass,
                implements: implementedInterfaces,
                endPosition: endPosition,
                startPosition: startPosition,
                statementsEnd: statementsEnd
            });
        }

        if (node.children) {
            node.children.forEach((child: any) => traverseNode(child));
        }
    };

    traverseNode(ast);
    return classes;
};

const parsePhpFile = (code: string) => {
    try {
        const ast = parser.parseCode(code);
        return getClassInfoFromAst(ast);
    } catch (err) {
        throw new Error(`Error parsing PHP code`);
    }
};

export { parsePhpFile };