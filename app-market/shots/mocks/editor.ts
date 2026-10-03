// Stand-in for the Editor host: the panel reads the settings passed in the page URL.
const params = new URLSearchParams(location.search);
const props: Record<string, string> = JSON.parse(params.get('props') ?? '{}');

export const widget = {
  getProp: async (name: string) => props[name] ?? null,
  setProp: async () => {},
  setPreloadFonts: async () => {},
};
export const inputs = {
  selectColor: async () => {},
  selectFont: async () => {},
};
