const apiRoutes = {
    version:            "/v1",
    objects: {
        users:          "/users",
        videos:         "/videos",
        likes:         "/likes"
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