import dns from "dns";

async function resolve(host: string) {
  return new Promise((resolve) => {
    dns.resolve4(host, (err, addresses) => {
      if (err) {
        console.error(`Failed to resolve ${host}:`, err.message);
        resolve(null);
      } else {
        console.log(`${host} resolves to:`, addresses);
        resolve(addresses);
      }
    });
  });
}

async function run() {
  await resolve("openrouter.ai");
  await resolve("api.notion.com");
  await resolve("google.com");
}

run();
