export const applyTemplate = (template: string, values: Record<string, string>): string => {
    return Object.keys(values).reduce((result, key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        return result.replace(regex, values[key]);
    }, template);
};