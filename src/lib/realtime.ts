const clients = new Map<string, Set<ReadableStreamDefaultController>>();

export function addClient(userId: string, controller: ReadableStreamDefaultController) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(controller);
}

export function removeClient(userId: string, controller: ReadableStreamDefaultController) {
  const userClients = clients.get(userId);
  if (userClients) {
    userClients.delete(controller);
    if (userClients.size === 0) {
      clients.delete(userId);
    }
  }
}

export function broadcastToUser(userId: string, message: { type: string; data: unknown }) {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const data = `event: ${message.type}\ndata: ${JSON.stringify(message)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);

  userClients.forEach((controller) => {
    try {
      controller.enqueue(encoded);
    } catch {
      removeClient(userId, controller);
    }
  });
}

export function getConnectedClients(): number {
  let total = 0;
  clients.forEach((clientSet) => {
    total += clientSet.size;
  });
  return total;
}
