const apiRoutes = {
    version:            "/v1",
    objects: {
        auth:          "/auth",
        comments:      "/comments",
        likes:         "/likes",
        users:         "/users",
        videos:        "/videos",
    },
    actions:
    {
        login:          "/login",

        create:         "/add",
        search:         "/results",
        update:         "/update",
        delete:         "/delete",
        upload:         "/upload",
        confirm:        "/confirm",

        musicRecognizer:
        {
            sample: "/sample",
            identify: "/identify"
        }
    }
}
module.exports = apiRoutes