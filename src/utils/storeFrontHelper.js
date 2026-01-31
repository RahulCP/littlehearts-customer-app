// src/utils/storefrontHelpers.js

/**
 * Build lookup maps for category / subcategory names.
 */
export const buildCategoryMaps = (categories = []) => {
  const categoryMap = {};
  const subcategoryMap = {};

  categories.forEach((cat) => {
    categoryMap[cat.id] = cat.name;
    (cat.subcategories || []).forEach((sub) => {
      subcategoryMap[sub.id] = sub.name;
    });
  });

  return { categoryMap, subcategoryMap };
};

/**
 * Build compatibility maps for style <-> subcategory + lists of unique IDs.
 */
export const buildVariantCompatibility = (items = []) => {
  const styleToSubcats = {};
  const subcatToStyles = {};
  const styleIdsSet = new Set();
  const subcategoryIdsSet = new Set();

  items.forEach((item) => {
    const sId = item.style_id;
    const scId = item.subcategory_id;

    if (sId) {
      styleIdsSet.add(sId);
      if (!styleToSubcats[sId]) styleToSubcats[sId] = new Set();
      if (scId) {
        styleToSubcats[sId].add(scId);
      }
    }

    if (scId) {
      subcategoryIdsSet.add(scId);
      if (!subcatToStyles[scId]) subcatToStyles[scId] = new Set();
      if (sId) {
        subcatToStyles[scId].add(sId);
      }
    }
  });

  return {
    styleToSubcats,
    subcatToStyles,
    styleIds: Array.from(styleIdsSet),
    subcategoryIds: Array.from(subcategoryIdsSet),
  };
};

/**
 * Choose which item is currently "active" based on style/subcategory.
 */
export const pickPreferredItem = (
  items = [],
  selectedStyleId,
  selectedSubcategoryId
) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const match =
    items.find((i) => {
      const styleMatch = selectedStyleId
        ? i.style_id === selectedStyleId
        : true;
      const subcatMatch = selectedSubcategoryId
        ? i.subcategory_id === selectedSubcategoryId
        : true;
      return styleMatch && subcatMatch;
    }) || items[0];

  return match;
};
