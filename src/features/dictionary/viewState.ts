import { EMPTY_FILTERS, type DictionaryFilters } from "../../domain/dictionary";

/**
 * What the dictionary list remembers while the user stays in its area (detail page, edit,
 * add word, legend): filters and scroll position. Switching to another tab resets it.
 */
let filters: DictionaryFilters = EMPTY_FILTERS;
let scroll = 0;

/** Pages reached from the dictionary; going anywhere else resets the view state. */
const DICTIONARY_AREA = /^\/(dictionary|add|legend)(\/|$)/;

export const isDictionaryArea = (pathname: string) =>
  DICTIONARY_AREA.test(pathname);

export const getSavedFilters = () => filters;
export const saveFilters = (f: DictionaryFilters) => {
  filters = f;
};
export const getSavedScroll = () => scroll;
export const saveScroll = (y: number) => {
  scroll = y;
};

export function resetDictionaryView() {
  filters = EMPTY_FILTERS;
  scroll = 0;
}

/** Called on every route change: leaving the dictionary area resets the view. */
export function onNavigate(pathname: string) {
  if (!isDictionaryArea(pathname)) resetDictionaryView();
}
