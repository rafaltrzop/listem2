const express = require('express');
const fs = require('fs');
const path = require('path');

const publicRoutes = express();
const privateRoutes = express();
const models = require('../models');
const basename = path.basename(__filename);

autoloadRoutes(path.join(__dirname, 'public'), publicRoutes);
autoloadRoutes(path.join(__dirname, 'private'), privateRoutes);

function autoloadRoutes(routesDir, app, directory = '') {
  fs
    .readdirSync(routesDir)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename);
    })
    .forEach(file => {
      const filePath = `${routesDir}/${file}`;

      fs.stat(filePath, (err, stats) => {
        if (stats.isDirectory()) {
          const dir = `${directory}${file}/`;
          autoloadRoutes(filePath, app, dir);
        } else {
          const router = express.Router();
          const routeName = path.basename(file, '.route.js');
          const controller = require(`../controllers/${directory}${routeName}.controller`)(models);
          const route = require(filePath)(router, controller);

          app.use(`/${directory}${routeName}`, route);
        }
      });
    });
}

module.exports = {
  publicRoutes,
  privateRoutes,
};
