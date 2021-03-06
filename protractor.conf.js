exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    directConnect: true,
    framework: 'jasmine2',
    params: {
        client: 'http://localhost:8080/#/'
    },
    specs: [
        './tests/e2e/**/*.spec.js'
        // './tests/e2e/hotSpots/hotSpots.spec.js'
        // './tests/e2e/outcomes/outcomes.spec.js'
        // './tests/e2e/overview/overview.spec.js'
        // './tests/e2e/reflections/reflections.spec.js'
        // './tests/e2e/register/register.spec.js'
        // './tests/e2e/security/security.spec.js'
    ],
    capabilities: {
        browserName: 'chrome'
    }
};