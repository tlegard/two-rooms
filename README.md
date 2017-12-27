This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the create-react-app with typescript guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Git cloning

You can clone this project by just typing in your terminal:

git clone https://github.com/isaacsinuhe/create-react-app-ts-express-basic.git

## After cloning

As create-react-app --scripts-version=react-scripts-ts uses yarn you must install it to run this repository.<br>
When you have already cloned this repository you must run `yarn install` to install all of the dependencies.

## Folder Structure

After creation, your project should look like this:

```
my-app/
  build/
  dist/
  node_modules/
  public/
    index.html
    favicon.ico
  server/
    index.ts
    tsconfig.json
  src/
    App.css
    App.js
    App.test.js
    index.css
    index.js
    logo.svg
  .gitignore
  package.json
  README.md
  tsconfig.json
  tsconfig.test.json
  tslint.json
  yarn.lock

```

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](#running-tests) for more information.

### `yarn run dev`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Transpiles the server and runs it<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.<br>
Client calls are automatically proxied to [http://localhost:8000](http://localhost:8000)<br>
If you need to add more routes do it using express routes.<br>
If you need to change the configuration of the proxy do it in the package.json file<br>
changing the property "proxy": "http://localhost:8000" to "proxy": "http://localhost:8000/foo"<br>
or whatever your requirements are.

### `yarn run build`

Builds the app for production to the `build` folder.<br>
Builds the app server code for production to the `dist` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
The dist is transpiled from ts to js.<br>
Your app is ready to be deployed!

See the section about [deployment](#deployment) for more information.

### `yarn run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
