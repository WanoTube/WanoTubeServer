const apiRoutes = {
    version:            "/v1",
    objects: {
        users:          "/users",
        videos:         "/videos"
    },
    actions:
    {
        login:          "/login",

        create:         "/add",
        search:         "/search",
        update:         "/update",
        delete:         "/delete",

        confirm:        "/confirm",

        musicRecognizer:
        {
            sample: "/sample",
            identify: "/identify"
        }
    }
}
module.exports = apiRoutes