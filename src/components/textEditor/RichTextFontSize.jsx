import { Extension } from "@tiptap/core";

/**
 * Adds a `fontSize` attribute to the `textStyle` mark (the same mark
 * Color/FontFamily already attach to), plus `setFontSize` / `unsetFontSize`
 * chain commands.
 *
 * Written as our own small extension instead of importing "FontSize" from
 * @tiptap/extension-text-style, since whether that package exports FontSize
 * depends on the exact installed version. This works regardless.
 */
const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return { types: ["textStyle"] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default FontSize;