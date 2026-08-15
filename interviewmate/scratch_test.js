import https from "https";
https.get("https://registry.npmjs.org/@tanstack/start", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => console.log(JSON.parse(data)["dist-tags"]));
}).on("error", (err) => console.log("Error: " + err.message));
