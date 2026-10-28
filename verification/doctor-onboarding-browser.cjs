/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("http");
const assert = require("assert/strict");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(path, method = "GET") {
  return new Promise((resolve, reject) => {
    const request = http.request({ hostname: "localhost", port: 9333, path, method }, (response) => {
      let body = "";
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve(JSON.parse(body)));
    });
    request.on("error", reject);
    request.end();
  });
}

async function main() {
  const target = await json("/json/new?http://localhost:3000/register", "PUT");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  const events = [];
  let id = 0;
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      return message.error ? reject(message.error) : resolve(message.result);
    }
    if (["Runtime.consoleAPICalled", "Runtime.exceptionThrown", "Network.responseReceived", "Network.loadingFailed"].includes(message.method)) {
      events.push(message);
    }
  };
  await new Promise((resolve) => { socket.onopen = resolve; });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  await Promise.all([send("Runtime.enable"), send("Network.enable"), send("Page.enable")]);
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const evaluate = (expression) => send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  await evaluate(`document.querySelector('#register-tab-doctor')?.click()`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const before = await evaluate(`({url: location.href, fallback: document.body.innerText.includes('Could not load this page'), options: [...document.querySelectorAll('#specialization option')].map(o => ({value:o.value,text:o.textContent}))})`);
  await evaluate(`(() => { const select=document.querySelector('#specialization'); if (!select || !select.options.length) return false; select.options[0].selected=true; select.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const after = await evaluate(`({url: location.href, fallback: document.body.innerText.includes('Could not load this page'), selected: [...document.querySelectorAll('#specialization option:checked')].map(o => ({value:o.value,text:o.textContent})), text: document.body.innerText.slice(0,500)})`);
  const relevant = events.filter((event) => {
    if (event.method.startsWith("Runtime.")) return true;
    const url = event.params?.response?.url ?? event.params?.requestId ?? "";
    return String(url).includes("specializations");
  });
  const specializationResponse = relevant.find((event) => event.method === "Network.responseReceived");
  const exceptions = relevant.filter((event) => event.method === "Runtime.exceptionThrown");
  assert.equal(specializationResponse?.params?.response?.status, 200, "specialization GET must succeed");
  assert.equal(before.result.value.options.length, 22, "selector must contain all 22 backend records");
  assert.ok(before.result.value.options.every((option) => UUID_PATTERN.test(option.value)), "all selector values must be UUIDs");
  assert.equal(after.result.value.url, "http://localhost:3000/register", "selection must not navigate");
  assert.equal(after.result.value.fallback, false, "selection must not trigger an error boundary");
  assert.equal(after.result.value.selected.length, 1, "selection must update controlled state");
  assert.equal(exceptions.length, 0, "selection must not throw a runtime exception");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send("Page.reload", { ignoreCache: true });
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await evaluate(`document.querySelector('#register-tab-doctor')?.click()`);
  await new Promise((resolve) => setTimeout(resolve, 700));
  const mobile = await evaluate(`({width: innerWidth, options: document.querySelectorAll('#specialization option').length, fallback: document.body.innerText.includes('Could not load this page')})`);
  assert.deepEqual(mobile.result.value, { width: 390, options: 22, fallback: false }, "mobile selector must render without fallback");
  await send("Network.setBlockedURLs", { urls: ["*://localhost:4000/api/v1/specializations"] });
  await send("Page.reload", { ignoreCache: true });
  await new Promise((resolve) => setTimeout(resolve, 1800));
  await evaluate(`document.querySelector('#register-tab-doctor')?.click()`);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const failedState = await evaluate(`({error: document.body.innerText.includes('Specializations could not be loaded'), retry: [...document.querySelectorAll('button')].some(button => button.textContent?.trim() === 'Try again')})`);
  assert.deepEqual(failedState.result.value, { error: true, retry: true }, "failed GET must show a retry action");
  await send("Network.setBlockedURLs", { urls: [] });
  await evaluate(`[...document.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Try again')?.click()`);
  await new Promise((resolve) => setTimeout(resolve, 1400));
  const retriedState = await evaluate(`({options: document.querySelectorAll('#specialization option').length, error: document.body.innerText.includes('Specializations could not be loaded')})`);
  assert.deepEqual(retriedState.result.value, { options: 22, error: false }, "retry must repopulate the selector");
  await send("Page.navigate", { url: "http://localhost:3000/doctor/application" });
  await new Promise((resolve) => setTimeout(resolve, 1800));
  const directRoute = await evaluate(`({url: location.href, signIn: document.body.innerText.includes('Sign in required'), fallback: document.body.innerText.includes('Could not load')})`);
  assert.deepEqual(directRoute.result.value, { url: "http://localhost:3000/login?redirect=%2Fdoctor%2Fapplication", signIn: false, fallback: false }, "direct unauthenticated navigation must redirect to login without crashing");
  for (const role of ["USER", "PATIENT"]) {
    const payload = Buffer.from(JSON.stringify({ role, exp: Math.floor(Date.now() / 1000) + 600 })).toString("base64url");
    const token = `eyJhbGciOiJub25lIn0.${payload}.`;
    await send("Network.setCookie", { name: "token", value: token, domain: "localhost", path: "/" });
    await send("Page.navigate", { url: "http://localhost:3000/doctor/application" });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const applicantRoute = await evaluate(`location.pathname`);
    assert.equal(applicantRoute.result.value, "/doctor/application", `${role} applicant must pass the application route guard`);
  }
  process.stdout.write(JSON.stringify({ before: before.result.value, after: after.result.value, events: relevant }, null, 2));
  socket.close();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
