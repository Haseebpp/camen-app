export const validateExpense = (req, res, next) => {
    const { description, amount } = req.body;
    const errors = [];

    if (!description || description.trim().length === 0) {
        errors.push('Description is required');
    }

    if (amount === undefined || amount < 0) {
        errors.push('Amount must be a positive number');
    }

    if (errors.length > 0) {
        res.status(400);
        throw new Error(errors.join(', '));
    }

    next();
};
