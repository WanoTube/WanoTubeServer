const apiRoutes = {
	version: "/v1",
	objects: {
		auth: "/auth",
		comments: "/comments",
		likes: "/likes",
		users: "/users",
		videos: "/videos",
		channels: "/channels",
	},
	actions:
	{
		login: "/login",

		create: "/add",
		search: "/search",
		update: "/update",
		delete: "/delete",
		upload: "/upload",
		confirm: "/confirm",
		register: "/register",

		musicRecognizer:
		{
			sample: "/sample",
			identify: "/identify"
		}
	}
}
module.exports = apiRoutes