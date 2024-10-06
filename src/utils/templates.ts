

const methodImplementationTemplate = `\t{{visibility}}{{static}}{{final}} function {{methodName}}({{paramsString}}){{returnTypeString}} {
        // TODO
    }\n`;

const methodPsr12Template = `\t{{visibility}}{{static}}{{final}} function {{methodName}}({{paramsString}}){{returnTypeString}} 
    {
        // TODO
    }\n`;

const classTemplate = `<?php

{{namespace}}

{{useStatements}}

class {{className}} {{implementType}} {{parent}} 
{
{{methods}}
}
`;

export { methodImplementationTemplate, methodPsr12Template, classTemplate };