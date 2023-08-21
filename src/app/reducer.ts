"use client";

export type Action =
    | {
          type: "ADD_LINK";
          link: AssociatedLink;
      }
    | {
          type: "REMOVE_LINK";
          index: number;
      };

export type AssociatedLink =
    | { type: "twitter"; name: string; id: string }
    | { type: "github"; name: string; id: string };

export interface State {
    links: readonly AssociatedLink[];
}

export const nextState = (state: State, action: Action): State => {
    switch (action.type) {
        case "ADD_LINK":
            if (
                state.links.some(
                    ({ type, id }) =>
                        action.link.type === type && action.link.id === id,
                )
            ) {
                return state;
            }
            return { ...state, links: [...state.links, action.link] };
        case "REMOVE_LINK":
            return {
                ...state,
                links: [
                    ...state.links.slice(0, action.index),
                    ...state.links.slice(action.index + 1),
                ],
            };
        default:
            throw new Error("unreachable");
    }
};
