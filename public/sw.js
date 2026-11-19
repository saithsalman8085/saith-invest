
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data?.text() || "A new request has arrived." };
  }

  const title = data.title || "ClaudeInvest Admin";
  const options = {
    body: data.body || "A new deposit or withdrawal request has arrived.",
    icon: "/cloudinvest-logo.svg",
    badge: "/cloudinvest-logo.svg",
    data: {
      url: data.url || "/admin",
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/admin")
  );
});
