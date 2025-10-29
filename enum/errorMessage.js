const errorMessage = Object.freeze({
    401: "Unauthorized!",
    404: "Resource not found!",
    429: "Too many request!",
    500: "Internal Server Error!",
    503: "Service Unavailable!"
});

module.exports = errorMessage;