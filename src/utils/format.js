import {formatEther, parseEther} from 'viem'

export const formatDisplayNumber = (value, digits = 3) => {
    if (value) {

        let numberString = formatEther(value);
        let parts = numberString.split('.');
        const integerPart = parts[0];
        const fractionalPart = parts[1] || '';
        const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const truncatedFractionalPart = fractionalPart.substring(0, digits);

        if (!truncatedFractionalPart) {
            return formattedIntegerPart;
        }

        // Join the parts back together
        return `${formattedIntegerPart}.${truncatedFractionalPart}`;
    }
    return '0';
};