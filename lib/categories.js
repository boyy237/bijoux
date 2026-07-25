// Source unique des catégories et sous-catégories du site.
// Pour ajouter une catégorie ou sous-catégorie plus tard : ajouter une entrée ici,
// elle apparaîtra automatiquement dans la navigation, la boutique et le formulaire admin.

export const CATEGORIES = [
  {
    slug: "bijoux",
    name: "Bijoux",
    tagline: "Or, argent, pierres précieuses",
    subcategories: [
      { slug: "bague", name: "Bagues" },
      { slug: "boucles-oreilles", name: "Boucles d'oreilles" },
      { slug: "collier", name: "Colliers" },
      { slug: "chaine", name: "Chaînes" },
    ],
  },
  {
    slug: "habits",
    name: "Habits",
    tagline: "Prêt-à-porter et pièces d'exception",
    subcategories: [
      { slug: "haut", name: "Hauts" },
      { slug: "ensemble", name: "Ensembles" },
      { slug: "pantalon", name: "Pantalons" },
      { slug: "veste", name: "Vestes" },
      { slug: "chaussures", name: "Chaussures" },
    ],
  },
  {
    slug: "sacs",
    name: "Sacs",
    tagline: "Du quotidien au voyage",
    subcategories: [
      { slug: "sac-main", name: "Sacs à main" },
      { slug: "sac-luxe", name: "Sacs de luxe" },
      { slug: "sac-ecole", name: "Sacs d'école" },
      { slug: "sac-voyage", name: "Sacs de voyage" },
    ],
  },
  {
    slug: "montres",
    name: "Montres",
    tagline: "Précision et prestige",
    subcategories: [
      { slug: "montre-homme", name: "Montres homme" },
      { slug: "montre-femme", name: "Montres femme" },
      { slug: "montre-luxe", name: "Montres de luxe" },
      { slug: "montre-connectee", name: "Montres connectées" },
    ],
  },
  {
    slug: "accessoires",
    name: "Accessoires",
    tagline: "Les détails qui font la différence",
    subcategories: [
      { slug: "ceinture", name: "Ceintures" },
      { slug: "lunettes", name: "Lunettes" },
      { slug: "echarpe", name: "Écharpes" },
      { slug: "casquette", name: "Casquettes" },
    ],
  },
];

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getSubcategory(catSlug, subSlug) {
  const cat = getCategory(catSlug);
  if (!cat) return null;
  return cat.subcategories.find((s) => s.slug === subSlug) || null;
}
