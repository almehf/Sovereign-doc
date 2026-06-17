export function toast(props: Record<string, unknown>): void;
export function useToast(): { toasts: Array<Record<string, unknown>>; toast: typeof toast; dismiss: (id?: string) => void };
