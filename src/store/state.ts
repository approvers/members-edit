const STATE_KEY = "MEMBERS_EDIT_STATE_KEY";

export const saveState = (state: string): void =>
    sessionStorage.setItem(STATE_KEY, state);

export const getState = (): string | null => sessionStorage.getItem(STATE_KEY);

export const removeState = (): void => sessionStorage.removeItem(STATE_KEY);
