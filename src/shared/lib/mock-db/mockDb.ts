/* ------------------------------------------------------------------ */
/* DEV MOCK — a localStorage-backed stand-in for the API's collections. */
/* Active only while VITE_API_URL is unset.                            */
/*                                                                     */
/* Writes persist across reloads on purpose: a create/edit/delete that  */
/* vanished on refresh would make the screens impossible to judge.      */
/* ------------------------------------------------------------------ */

const PREFIX = 'vfl.mock.'

export interface Identified {
  id: string
}

function read<T>(name: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + name)
    if (raw) return JSON.parse(raw) as T[]
  } catch {
    /* Unreadable or corrupt — fall through to the seed. */
  }
  write(name, seed)
  return seed
}

function write<T>(name: string, rows: T[]): void {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(rows))
  } catch {
    /* Storage unavailable; the collection degrades to this page view. */
  }
}

function nextId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

function notFound(id: string): never {
  /* Shaped like an axios error so apiErrorMessage reads it the same way
     it will read the real server's 404. */
  throw Object.assign(new Error('Not found.'), {
    isAxiosError: true,
    response: { status: 404, data: { message: `No record with id ${id}.` } },
  })
}

function delay(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface MockCollection<T extends Identified, TInput> {
  list(): Promise<T[]>
  get(id: string): Promise<T>
  create(input: TInput): Promise<T>
  update(id: string, input: TInput): Promise<T>
  remove(id: string): Promise<void>
}

/** Creates one persisted collection, seeded on first read. */
export function createMockCollection<T extends Identified, TInput>(
  name: string,
  seed: T[],
): MockCollection<T, TInput> {
  return {
    async list() {
      await delay()
      return read<T>(name, seed)
    },

    async get(id) {
      await delay(160)
      const found = read<T>(name, seed).find((row) => row.id === id)
      if (!found) notFound(id)
      return found
    },

    async create(input) {
      await delay(320)
      const rows = read<T>(name, seed)
      const created = { ...(input as object), id: nextId() } as T
      /* Newest first, matching what a real list endpoint would sort by. */
      write(name, [created, ...rows])
      return created
    },

    async update(id, input) {
      await delay(320)
      const rows = read<T>(name, seed)
      const index = rows.findIndex((row) => row.id === id)
      if (index === -1) notFound(id)
      const updated = { ...(input as object), id } as T
      const next = [...rows]
      next[index] = updated
      write(name, next)
      return updated
    },

    async remove(id) {
      await delay(280)
      const rows = read<T>(name, seed)
      if (!rows.some((row) => row.id === id)) notFound(id)
      write(
        name,
        rows.filter((row) => row.id !== id),
      )
    },
  }
}
