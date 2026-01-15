import validator from 'validator';

export const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || name.trim().length === 0) {
        errors.push('Name is required');
    }

    if (!email || !validator.isEmail(email)) {
        errors.push('Please provide a valid email');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (errors.length > 0) {
        res.status(400);
        throw new Error(errors.join(', '));
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !validator.isEmail(email)) {
        errors.push('Please provide a valid email');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        res.status(400);
        throw new Error(errors.join(', '));
    }

    next();
};
