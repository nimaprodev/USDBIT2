export const formatDisplayNumber = (value) => {
    if (typeof value === 'undefined' || value === null) return '0';
    const number = parseFloat(value);
    if (isNaN(number)) return '0';
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 3,
    }).format(number);
};