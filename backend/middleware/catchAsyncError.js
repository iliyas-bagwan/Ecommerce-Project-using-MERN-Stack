module.exports = (receivedFunction) => (req, resp, next) => {
    Promise.resolve(receivedFunction(req, resp, next)).catch(next)
}