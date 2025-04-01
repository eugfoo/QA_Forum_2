module.exports.validateRegister = (username, email, password, password2) => {
    const errors = [];
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }
    return errors;
};

module.exports.validatePasswordChange = (currentPassword, newPassword, confirmPassword) => {
    const errors = [];
    if (!currentPassword || !newPassword || !confirmPassword) {
        errors.push({ msg: 'Please fill in all fields' });
    }
    if (newPassword.length < 6) {
        errors.push({ msg: 'New password must be at least 6 characters' });
    }
    if (newPassword !== confirmPassword) {
        errors.push({ msg: 'New password and confirmation do not match' });
    }
    return errors;
};