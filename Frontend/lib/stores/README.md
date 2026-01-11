# Zustand Store Conventions

This directory contains Zustand state management stores for the Lego Builder application.

## Naming Conventions

**Store Files:**
- Pattern: `use[Domain]Store.ts`
- Examples: `useInventoryStore.ts`, `useBuildsStore.ts`, `useUIStore.ts`

**Export Pattern:**
```typescript
export const use[Domain]Store = create<[Domain]Store>()(...)
```

**Action Naming:**
- Use `camelCase` verbs
- Examples: `addBrick`, `setLoading`, `updateBuild`, `clearInventory`

## Example Store Structure

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';

// Custom IndexedDB storage for Zustand
const indexedDBStorage = {
  getItem: async (name: string) => await idbGet(name),
  setItem: async (name: string, value: unknown) => await idbSet(name, value),
  removeItem: async (name: string) => await idbDel(name),
};

interface InventoryStore {
  bricks: Brick[];
  addBrick: (brick: Brick) => void;
  removeBrick: (id: string) => void;
  getBricksByColor: (color: string) => Brick[];
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      bricks: [],
      addBrick: (brick) => set((state) => ({ bricks: [...state.bricks, brick] })),
      removeBrick: (id) => set((state) => ({ bricks: state.bricks.filter(b => b.id !== id) })),
      getBricksByColor: (color) => get().bricks.filter(b => b.color === color),
    }),
    {
      name: 'brick-inventory',
      storage: indexedDBStorage,
    }
  )
);
```

## References

- [Architecture: Zustand Store Naming](file:///home/juan/Desktop/DEV/Lego%20builder%20python/_bmad-output/planning-artifacts/architecture.md#L691-L709)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [idb-keyval Documentation](https://github.com/jakearchibald/idb-keyval)
