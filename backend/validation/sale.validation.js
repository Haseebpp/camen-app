export const validateSale = (req, res, next) => {
    const { items, type } = req.body;
    const errors = [];

    if (!items || !Array.isArray(items) || items.length === 0) {
        errors.push('At least one item is required');
    } else {
        items.forEach((item, index) => {
            if (!item.productId) {
                errors.push(`Item ${index + 1}: Product ID is required`);
            }
            if (!item.quantity || item.quantity < 1) {
                errors.push(`Item ${index + 1}: Quantity must be at least 1`);
            }
            if (item.unitPrice === undefined || item.unitPrice < 0) {
                errors.push(`Item ${index + 1}: Unit price must be a positive number`);
            }
        });
    }

    if (type && !['INDIVIDUAL', 'COMBO'].includes(type)) {
        errors.push('Type must be either INDIVIDUAL or COMBO');
    }

    if (errors.length > 0) {
        res.status(400);
        throw new Error(errors.join(', '));
    }

    next();
};
