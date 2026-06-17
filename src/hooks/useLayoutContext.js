import { useOutletContext } from 'react-router-dom';

/**
 * @typedef {import('@base/sdk').User} BaseUser
 * @typedef {{ lang: string, user: BaseUser | null, role?: string }} LayoutContext
 */

/** @returns {LayoutContext} */
export function useLayoutContext() {
  return /** @type {LayoutContext} */ (useOutletContext());
}
