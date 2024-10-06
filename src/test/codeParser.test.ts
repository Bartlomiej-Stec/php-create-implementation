import * as assert from 'assert';
import * as vscode from 'vscode';
import { parsePhpFile } from '../utils/codeParser';

suite('PHP Parser Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Parse a simple class correctly', () => {
        const phpCode = `<?php
            namespace App\\Services;

            use Some\\OtherClass;

            class MyClass {
                public function myMethod(string $param1): string {
                    return $param1;
                }
            }
        `;

        const result = parsePhpFile(phpCode);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, 'MyClass');
        assert.strictEqual(result[0].namespace, 'App\\Services');
        assert.strictEqual(result[0].isAbstract, false);
        assert.strictEqual(result[0].isInterface, false);
        assert.strictEqual(result[0].methods.length, 1);
        assert.strictEqual(result[0].methods[0].name, 'myMethod');
        assert.strictEqual(result[0].methods[0].params.length, 1);
        assert.strictEqual(result[0].methods[0].params[0].name, 'param1');
        assert.strictEqual(result[0].methods[0].params[0].typeHint, 'string');
        assert.strictEqual(result[0].methods[0].returnTypeHint, 'string');
        assert.strictEqual(result[0].methods[0].hasImplementation, true);
        assert.strictEqual(result[0].methods[0].isStatic, false);
        assert.strictEqual(result[0].methods[0].isAbstract, false);
        assert.strictEqual(result[0].methods[0].isFinal, false);
        assert.strictEqual(result[0].methods[0].visibility, 'public');
        assert.strictEqual(result[0].useStatements.length, 1);
        assert.strictEqual(result[0].useStatements[0].name, 'Some\\OtherClass');
        assert.strictEqual(result[0].useStatements[0].alias, null);
        assert.strictEqual(result[0].extends, null);
        assert.strictEqual(result[0].implements.length, 0);
        assert.ok(typeof result[0].startPosition === 'number');
        assert.ok(typeof result[0].endPosition === 'number');
        assert.ok(typeof result[0].statementsEnd === 'number');
        assert.strictEqual(result[0].startPosition, 89);
        assert.strictEqual(result[0].endPosition, 239);
        assert.strictEqual(result[0].statementsEnd, 74);
    });

    test('Parse an interface correctly', () => {
        const phpCode = `<?php
            namespace App\\Services;

            use Framework\\Request as Request2;
            use Some\\OtherClass;

            interface ExampleInterface {
                public function myMethod(string $param1): string;

                protected static final function myMethod2(int $param2, OtherClass $param3): Request2;
            }
        `;

        const result = parsePhpFile(phpCode);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, 'ExampleInterface');
        assert.strictEqual(result[0].namespace, 'App\\Services');
        assert.strictEqual(result[0].isAbstract, false);
        assert.strictEqual(result[0].isInterface, true);
        assert.strictEqual(result[0].methods.length, 2);
        assert.strictEqual(result[0].methods[0].name, 'myMethod');
        assert.strictEqual(result[0].methods[0].params.length, 1);
        assert.strictEqual(result[0].methods[0].params[0].name, 'param1');
        assert.strictEqual(result[0].methods[0].params[0].typeHint, 'string');
        assert.strictEqual(result[0].methods[0].returnTypeHint, 'string');
        assert.strictEqual(result[0].methods[0].hasImplementation, false);
        assert.strictEqual(result[0].methods[0].isStatic, false);
        assert.strictEqual(result[0].methods[0].isAbstract, false);
        assert.strictEqual(result[0].methods[0].isFinal, false);
        assert.strictEqual(result[0].methods[0].visibility, 'public');

        assert.strictEqual(result[0].methods[1].name, 'myMethod2');
        assert.strictEqual(result[0].methods[1].params.length, 2);
        assert.strictEqual(result[0].methods[1].params[0].name, 'param2');
        assert.strictEqual(result[0].methods[1].params[0].typeHint, 'int');
        assert.strictEqual(result[0].methods[1].params[1].name, 'param3');
        assert.strictEqual(result[0].methods[1].params[1].typeHint, 'OtherClass');
        assert.strictEqual(result[0].methods[1].returnTypeHint, 'Request2');
        assert.strictEqual(result[0].methods[1].hasImplementation, false);
        assert.strictEqual(result[0].methods[1].isStatic, true);
        assert.strictEqual(result[0].methods[1].isAbstract, false);
        assert.strictEqual(result[0].methods[1].isFinal, true);
        assert.strictEqual(result[0].methods[1].visibility, 'protected');
        assert.strictEqual(result[0].useStatements.length, 2);
        assert.strictEqual(result[0].useStatements[0].name, 'Framework\\Request');
        assert.strictEqual(result[0].useStatements[0].alias, 'Request2');
        assert.strictEqual(result[0].useStatements[1].name, 'Some\\OtherClass');
        assert.strictEqual(result[0].useStatements[1].alias, null);
        assert.strictEqual(result[0].extends, null);
        assert.strictEqual(result[0].implements.length, 0);
    });

    test('Parse an abstract class correctly', () => {
        const phpCode = `<?php

            abstract class AbstractExample extends OtherClass implements ExampleInterface, AnotherInterface {
                public function test(){
                    $var1 = 0;
                    $var2 = 2;
                    return $i + $var2;
                }
                public abstract function myMethod($param1);
            }
        `;

        const result = parsePhpFile(phpCode);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, 'AbstractExample');
        assert.strictEqual(result[0].namespace, null);
        assert.strictEqual(result[0].isAbstract, true);
        assert.strictEqual(result[0].isInterface, false);
        assert.strictEqual(result[0].methods.length, 2);
        assert.strictEqual(result[0].methods[0].name, 'test');
        assert.strictEqual(result[0].methods[0].hasImplementation, true);
        assert.strictEqual(result[0].methods[0].isAbstract, false);
        assert.strictEqual(result[0].methods[1].name, 'myMethod');
        assert.strictEqual(result[0].methods[1].hasImplementation, false);
        assert.strictEqual(result[0].methods[1].isAbstract, true);
        assert.strictEqual(result[0].useStatements.length, 0);
        assert.strictEqual(result[0].extends, 'OtherClass');
        assert.strictEqual(result[0].implements.length, 2);
        assert.strictEqual(result[0].implements[0], 'ExampleInterface');
        assert.strictEqual(result[0].implements[1], 'AnotherInterface');
    });

    test('Throws error when parsing fail', () => {
        assert.throws(() => {
            const phpCode = `<?php

                abstract class AbstractExample implements ExampleInterface extends OtherClass  {
                    public function test(){
                        $var1 = 0;
                        $var2 = 2;
                        return $i + $var2;
                    }
                    public abstract function myMethod($param1);
                }
            `;
            parsePhpFile(phpCode);
        });
    });

});
