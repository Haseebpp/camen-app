export const validateProduct = (req, res, next) => {
    const { itemCode, name, costPrice, sellingPrice, stockQuantity } = req.body;
    const errors = [];

    if (!itemCode || itemCode.trim().length === 0) {
        errors.push('Item code is required');
    }

    if (!name || name.trim().length === 0) {
        errors.push('Product name is required');
    }

    if (costPrice === undefined || costPrice < 0) {
        errors.push('Cost price must be a positive number');
    }

    if (sellingPrice === undefined || sellingPrice < 0) {
        errors.push('Selling price must be a positive number');
    }

    if (stockQuantity === undefined || stockQuantity < 0) {
        errors.push('Stock quantity must be a positive number');
    }

    if (errors.length > 0) {
        res.status(400);
        throw new Error(errors.join(', '));
    }

    next();
};
