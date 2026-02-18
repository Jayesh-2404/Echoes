const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

const OUTPUT = path.resolve(process.cwd(), "theme-refresh-home.png");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 120000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          res.resume();
          resolve();
        });
        req.on("error", reject);
      });
      return;
    } catch {
      await wait(1000);
    }
  }

  throw new Error("Dev server did not start in time.");
}

function getFreePort(start = 3001, attempts = 50) {
  return new Promise((resolve, reject) => {
    let port = start;
    let remaining = attempts;

    const tryPort = () => {
      const server = net.createServer();
      server.unref();

      server.once("error", () => {
        server.close();
        remaining -= 1;
        port += 1;
        if (remaining <= 0) {
          reject(new Error("No free port available for screenshot capture."));
          return;
        }
        tryPort();
      });

      server.listen(port, "127.0.0.1", () => {
        const selected = port;
        server.close(() => resolve(selected));
      });
    };

    tryPort();
  });
}

function captureScreenshot(url, outputPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    const command =
      `npx playwright screenshot ` +
      `--browser=chromium --channel=msedge --device="Desktop Chrome" ` +
      `"${url}" "${outputPath}"`;

    const proc = spawn(command, [], {
      stdio: "inherit",
      shell: true,
    });

    let finished = false;
    const finalize = (err) => {
      if (finished) return;
      finished = true;
      clearInterval(watcher);
      if (err) reject(err);
      else resolve();
    };

    const started = Date.now();
    const watcher = setInterval(() => {
      const exists = fs.existsSync(outputPath);
      const valid = exists && fs.statSync(outputPath).size > 0;

      if (valid) {
        if (!proc.killed) {
          proc.kill("SIGTERM");
        }
        finalize();
        return;
      }

      if (Date.now() - started > 120000) {
        if (!proc.killed) {
          proc.kill("SIGKILL");
        }
        finalize(new Error("Screenshot command timed out."));
      }
    }, 500);

    proc.on("exit", (code) => {
      const exists = fs.existsSync(outputPath);
      const valid = exists && fs.statSync(outputPath).size > 0;
      if (valid || code === 0) {
        finalize();
      } else {
        finalize(new Error(`Screenshot command exited with code ${code}.`));
      }
    });
  });
}

async function main() {
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;

  const dev = spawn(`npm run dev -- --hostname 127.0.0.1 --port ${port}`, {
    stdio: "inherit",
    shell: true,
  });

  try {
    await waitForServer(url);
    await captureScreenshot(url, OUTPUT);
    console.log(`Saved screenshot: ${OUTPUT}`);
  } finally {
    if (!dev.killed) {
      dev.kill("SIGTERM");
      await wait(1200);
      if (!dev.killed) {
        dev.kill("SIGKILL");
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
