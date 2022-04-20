require("fs")
  .readdirSync(__dirname)
  .forEach((file) => {
    if (!file.endsWith(".js") || file === "index.js") return;
    exports[file.replace(".js", "")] = require("./" + file);
  });
