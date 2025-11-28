export const formatDisplayNumber = (value,  digits = 3) => {
    if (typeof value === 'undefined' || value === null) return '0';
    const number = parseFloat(value);
    if (isNaN(number)) return '0';
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: digits,
    }).format(number);
};