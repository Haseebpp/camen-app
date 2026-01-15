export const validateEvent = (req, res, next) => {
    const { name, date, location } = req.body;
    const errors = [];

    if (!name || name.trim().length === 0) {
        errors.push('Event name is required');
    }

    if (!date) {
        errors.push('Event date is required');
    }

    if (!location || location.trim().length === 0) {
        errors.push('Location is required');
    }

    if (errors.length > 0) {
        res.status(400);
        throw new Error(errors.join(', '));
    }

    next();
};

export const validateEventStatus = (req, res, next) => {
    const { status } = req.body;

    if (!status || !['OPEN', 'CLOSED'].includes(status)) {
        res.status(400);
        throw new Error('Status must be either OPEN or CLOSED');
    }

    next();
};
