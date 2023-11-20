import { writable, derived } from 'svelte/store';

/**
 * @param {string | null} _role
 */
export function roleStoreFactory(_role) {
    const { subscribe, set, update } = writable(_role);
    return {
        subscribe,
        /** @param {any} new_role */
        updateRole: (new_role) => update(() => new_role),
        clearRole: () => set(null)
    };
}

/**
 * @param {string | null} _workplace
 */
export function workplaceStoreFactory(_workplace) {
    const { subscribe, set, update } = writable(_workplace);
    return {
        subscribe,
        /** @param {any} new_workplace */
        updateWorkplace: (new_workplace) => update(() => new_workplace),
        clearWorkplace: () => set(null)
    };
}

export const workplaceStore = workplaceStoreFactory(null);
export const roleStore = roleStoreFactory(null);

const allRole = [
    {
        value: 1,
        label: 'Farm',
        role: [
            { value: 1, label: 'Harvester' },
            { value: 2, label: 'Processor' },
            { value: 3, label: 'Farm Packager' }
        ]
    },
    {
        value: 2,
        label: 'Roasting Plant',
        role: [
            { value: 1, label: "Warehouse Keeper" },
            { value: 2, label: "Roaster" },
            { value: 3, label: "Curer" },
            { value: 4, label: "Roasting Plant Packager" }
        ]
    },
    {
        value: 3,
        label: "Coffee Shop",
        role: [
            { value: 1, label: "Store Keeper" },
            { value: 2, label: "Barista" }
        ]
    },
    {
        value: 99,
        label: 'Manager',
        role: [
            { value: 99, label: 'Manager' }
        ]
    }
];

/**
 * @type {{ value: number; label: string; role: { value: number; label: string; }[]; } | undefined}
 */
let workplaceObject;

export const workplaceValueStore = derived(workplaceStore, ($workplaceStore) => {
    workplaceObject = allRole.find(wp => wp.label === $workplaceStore);
    return workplaceObject ? workplaceObject.value : null;
});

export const roleValueStore = derived(roleStore, ($roleStore) => {
    if (!workplaceObject) return null;

    const roleObject = workplaceObject.role.find(role => role.label === $roleStore);
    return roleObject ? roleObject.value : null;
});
