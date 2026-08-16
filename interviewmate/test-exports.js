import * as reactStart from "@tanstack/react-start";
import * as reactStartApi from "@tanstack/react-start/api" catch { }
console.log("react-start:", Object.keys(reactStart));
try {
  const api = require("@tanstack/react-start/api");
  console.log("react-start/api:", Object.keys(api));
} catch (e) {
  console.log("react-start/api not found");
}
