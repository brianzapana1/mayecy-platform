export const slugify = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const generateProductSlug = (name) => {
  const baseSlug = slugify(name) || 'producto'
  const suffix = Date.now().toString().slice(-6)

  return `${baseSlug}-${suffix}`
}