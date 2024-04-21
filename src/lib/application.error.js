function createApplicationError(msg, errorCode, cause) {
    const error = Error(msg, {cause});
    error.isApplicationError = true;
    error.errorCode = errorCode;
    return error;
}

export default createApplicationError;