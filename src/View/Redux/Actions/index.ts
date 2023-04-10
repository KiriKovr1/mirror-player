export const DEFAULT = 'DEFAULT';

export const getPension = () => (
    {
        type: DEFAULT,
    }
) as const;

export type TyGetPensions = ReturnType<typeof getPension>;

export type TyAction = TyGetPensions;


export default {
    DEFAULT,

    getPension,
}