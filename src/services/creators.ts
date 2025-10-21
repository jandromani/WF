export type Creator = { id: string; handle: string; price: number; subscribers: number };

let _creators: Creator[] = [
  { id: 'alice', handle: '@alice', price: 50, subscribers: 12 },
  { id: 'bob', handle: '@bob', price: 25, subscribers: 31 },
];

export async function listCreators() {
  return _creators;
}

export async function getCreator(id: string) {
  return _creators.find((c) => c.id === id)!;
}

export async function subscribe(id: string) {
  _creators = _creators.map((c) =>
    c.id === id ? { ...c, subscribers: c.subscribers + 1 } : c,
  );
  return true;
}
