# PHP create implementation
A Visual Studio Code extension for implementing all required methods. When called from an interface or abstract class, it will create a new file with the implementation. When called from an implementation, it will check if all required methods are implemented, add any missing methods, and add any missing use namespaces.

## Usage

To implement missing methods in the currently open file, use the shortcut ```Alt + I``` or the command: ```Implement all possible methods```.
![Usage gif](https://raw.githubusercontent.com/Bartlomiej-Stec/php-create-implementation/main/images/usage.gif)

## Advanced configuration
By default, when creating a file for an implementation, the **Service** suffix is added to the name. For interfaces, the **Interface** suffix and the **I** prefix are removed if followed by an uppercase letter. 

**Example**:
- ExampleInterface -> ExampleService,
- IExample -> ExampleService

In the settings file, you can customize this option using regular expressions to replace matching parts with your specified replacements.

You can configure these settings separately for abstract classes and interfaces. Both suffixes and prefixes are customizable. Additionally, you can choose whether the implemented methods should adhere to PSR-12 standards, such as starting the curly bracket on a new line.

## Support
If this extension is helpful to you, you can support my work on Ko-fi.

[![ko-fi](https://storage.ko-fi.com/cdn/brandasset/kofi_button_blue.png)](https://ko-fi.com/S6S6PH8KM)
