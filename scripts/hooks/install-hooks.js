const { execSync } = require("child_process");

try {
  execSync("git config core.hooksPath .githooks", {
    stdio: "ignore",
  });
  console.log("✅ Git hooks installed");
} catch {
  console.warn("⚠️ Git hooks not installed (not a git repo?)");
}
