# FacetChat client app

Front-end app for [FacetChat](https://github.com/gamalon/facetchat) created via `React` and `Webpack` bundler.

### Development

You should preferably have [Node](https://nodejs.org/en/) `16.14.0` LTS or later, which includes NPM `8.3.1`.

### Setup

* Install Node
* `npm install`
* `npm install -g serve` (if we want to run the dist bundle)

### Run the client

* To run the local dev instance (mostly for people who's working on front-end): `npm start`
* We can set the app configuration by modifying the `/client/dist/index.html` script tag.
```
GAMALON.init({
  organizationId: : "{organizationId}",
  socketURL: "{socketURL}",
});
```
* To run the bundle app: run `serve -s dist` (make sure we already have the app built in `/dist` folder, if not run the `npm run build:dev` or `npm run build:prod`command)

### Building the client bundle
To build the transpiled bundle run: `npm run build:dev` or `npm run build:prod` command, this will create a `facet-chat.js` in the `/dist` folder.
