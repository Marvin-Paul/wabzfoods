const path = require("path");

module.exports = {
  extends: [
    require.resolve("@commitlint/config-conventional", {
      paths: [path.resolve(__dirname, "../../wabz-next")],
    }),
  ],
};
