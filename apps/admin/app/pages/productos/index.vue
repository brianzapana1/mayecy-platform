<script setup>
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminProductById
} from '~/services/adminProductService'
import { getAdminCategories } from '~/services/adminCategoryService'
import { uploadProductImage } from '~/services/adminStorageService'
import { generateProductSlug, slugify } from '~/utils/slugify'
import {
  createAdminProductImage,
  deleteAdminProductImage
} from '~/services/adminProductImageService'

definePageMeta({
  layout: 'dashboard'
})

const products = ref([])
const categories = ref([])
const loading = ref(true)
const saving = ref(false)
const savingStage = ref('')
const deletingId = ref(null)
const deleteModal = ref({
  open: false,
  product: null
})
const errorMessage = ref('')
const successMessage = ref('')

const modalNotice = ref({
  type: '',
  text: ''
})
const imageNotice = ref({
  type: '',
  text: ''
})
const deletingImage = ref(false)

const imageDeleteConfirmRef = ref(null)

const imageDeleteConfirm = ref({
  open: false,
  type: '',
  image: null,
  selectedImageId: '',
  url: ''
})

const imageManagerLocked = computed(() => {
  return (
    saving.value ||
    deletingImage.value ||
    imageDeleteConfirm.value.open
  )
})

const searchTerm = ref('')
const selectedCategory = ref('')
const selectedVisibility = ref('')
const selectedStatus = ref('')

const currentPage = ref(1)
const productsPerPage = 15
let messageTimer = null

let modalNoticeTimer = null

let imageNoticeTimer = null

const isModalOpen = ref(false)
const editingProduct = ref(null)
const selectedImage = ref(null)
const existingImages = ref([])
const selectedImages = ref([])

const maxProductImages = 5
const maxImageSizeBytes = 5 * 1024 * 1024

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
])

const isDraggingImages = ref(false)

let imageDragDepth = 0


const getOrderedProductImages = (product) => {
  return [...(product?.product_images || [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1

    return Number(a.sort_order || 0) - Number(b.sort_order || 0)
  })
}

const getProductMainImage = (product) => {
  const images = getOrderedProductImages(product)

  return (
    images[0]?.image_url ||
    product?.imagen_url ||
    ''
  )
}

const hasProductImage = (product) => {
  return Boolean(getProductMainImage(product))
}

const sortedImages = (images) => {
  return [...(images || [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return Number(a.sort_order || 0) - Number(b.sort_order || 0)
  })
}

const totalImageCount = computed(() => {
  return existingImages.value.length + selectedImages.value.length
})

const canAddImages = computed(() => {
  return totalImageCount.value < maxProductImages
})

const previewImages = computed(() => {
  const existing = existingImages.value.map((image) => ({
    type: 'existing',
    id: image.id_product_image,
    url: image.image_url,
    image
  }))

  const news = selectedImages.value.map((item, index) => ({
    type: 'new',
    id: item.id,
    url: item.previewUrl,
    file: item.file,
    index
  }))

  return [...existing, ...news]
})

const getSelectedImageSignature = (file) => {
  return [
    file.name,
    file.size,
    file.lastModified
  ].join('-')
}

const releaseSelectedImagePreview = (item) => {
  if (
    item?.previewUrl &&
    typeof URL !== 'undefined'
  ) {
    URL.revokeObjectURL(item.previewUrl)
  }
}

const clearSelectedImages = () => {
  selectedImages.value.forEach((item) => {
    releaseSelectedImagePreview(item)
  })

  selectedImages.value = []
}

const resetImageDragState = () => {
  imageDragDepth = 0
  isDraggingImages.value = false
}

const addImageFiles = (filesLike) => {
  if (imageManagerLocked.value) {
    return
  }

  clearImageNotice()

  const files = Array.from(filesLike || [])

  if (!files.length) {
    showImageError(
      'No se detectaron archivos para agregar.'
    )
    return
  }

  const availableSlots =
    maxProductImages - totalImageCount.value

  if (availableSlots <= 0) {
    showImageError(
      'Ya alcanzaste el máximo de 5 imágenes por producto.'
    )
    return
  }

  const selectedSignatures = new Set(
    selectedImages.value.map((item) => item.signature)
  )

  const acceptedItems = []

  let invalidTypeCount = 0
  let tooLargeCount = 0
  let duplicatedCount = 0
  let overLimitCount = 0

  for (const file of files) {
    if (!allowedImageTypes.has(file.type)) {
      invalidTypeCount += 1
      continue
    }

    if (file.size > maxImageSizeBytes) {
      tooLargeCount += 1
      continue
    }

    const signature =
      getSelectedImageSignature(file)

    if (selectedSignatures.has(signature)) {
      duplicatedCount += 1
      continue
    }

    if (acceptedItems.length >= availableSlots) {
      overLimitCount += 1
      continue
    }

    selectedSignatures.add(signature)

    acceptedItems.push({
      id: `new-${signature}`,
      file,
      signature,
      previewUrl: URL.createObjectURL(file)
    })
  }

  if (acceptedItems.length) {
    selectedImages.value = [
      ...selectedImages.value,
      ...acceptedItems
    ]
  }

  const messages = []

  if (invalidTypeCount) {
    messages.push(
      invalidTypeCount === 1
        ? '1 archivo no tiene un formato permitido. Solo se permiten imágenes JPEG, PNG y WEBP.'
        : `${invalidTypeCount} archivos no tienen un formato permitido. Solo se permiten imágenes JPEG, PNG y WEBP.`
    )
  }

  if (tooLargeCount) {
    messages.push(
      tooLargeCount === 1
        ? '1 imagen supera el tamaño máximo de 5 MB.'
        : `${tooLargeCount} imágenes superan el tamaño máximo de 5 MB.`
    )
  }

  if (duplicatedCount) {
    messages.push(
      duplicatedCount === 1
        ? '1 imagen ya estaba seleccionada y no se volvió a agregar.'
        : `${duplicatedCount} imágenes ya estaban seleccionadas y no se volvieron a agregar.`
    )
  }

  if (overLimitCount) {
    messages.push(
      overLimitCount === 1
        ? '1 imagen no se agregó porque el máximo permitido es de 5 imágenes.'
        : `${overLimitCount} imágenes no se agregaron porque el máximo permitido es de 5 imágenes.`
    )
  }

  if (messages.length) {
    const acceptedText =
      acceptedItems.length === 1
        ? 'Se agregó 1 imagen correctamente. '
        : acceptedItems.length > 1
          ? `Se agregaron ${acceptedItems.length} imágenes correctamente. `
          : ''

    showImageError(
      acceptedText + messages.join(' ')
    )

    return
  }

  if (acceptedItems.length === 1) {
    showImageSuccess(
      'La imagen fue agregada correctamente.'
    )
  } else if (acceptedItems.length > 1) {
    showImageSuccess(
      `Las ${acceptedItems.length} imágenes fueron agregadas correctamente.`
    )
  }
}

const handleImagesChange = (event) => {
  addImageFiles(event.target.files)
  event.target.value = ''
}

const handleImageDragEnter = () => {
  if (
    !canAddImages.value ||
    imageManagerLocked.value
  ) {
    return
  }

  imageDragDepth += 1
  isDraggingImages.value = true
}

const handleImageDragOver = (event) => {
  if (!event.dataTransfer) {
    return
  }

  event.dataTransfer.dropEffect =
    canAddImages.value &&
    !imageManagerLocked.value
      ? 'copy'
      : 'none'
}

const handleImageDragLeave = () => {
  imageDragDepth = Math.max(0, imageDragDepth - 1)

  if (imageDragDepth === 0) {
    isDraggingImages.value = false
  }
}

const handleImagesDrop = (event) => {
  resetImageDragState()

  if (
    !canAddImages.value ||
    imageManagerLocked.value
  ) {
    return
  }

  const files =
    event.dataTransfer?.files

  if (!files?.length) {
    showImageError(
      'No se detectaron archivos para agregar.'
    )
    return
  }

  addImageFiles(files)
}



const replaceProductInList = (updatedProduct) => {
  const index = products.value.findIndex((product) => {
    return product.id_producto === updatedProduct.id_producto
  })

  if (index >= 0) {
    products.value.splice(index, 1, updatedProduct)
    return
  }

  products.value.unshift(updatedProduct)
}

const removeNewImageById = (selectedImageId) => {
  const imageIndex = selectedImages.value.findIndex(
    (item, itemIndex) => {
      const currentId =
        item?.id ||
        `new-${itemIndex}`

      return currentId === selectedImageId
    }
  )

  if (imageIndex < 0) {
    return false
  }

  const imageToRemove =
    selectedImages.value[imageIndex]

  releaseSelectedImagePreview(imageToRemove)

  selectedImages.value =
    selectedImages.value.filter(
      (_, itemIndex) => itemIndex !== imageIndex
    )

  return true
}

const requestImageRemoval = async (preview) => {
  if (saving.value || deletingImage.value) {
    return
  }

  clearImageNotice()

  imageDeleteConfirm.value = {
    open: true,
    type: preview.type,
    image:
      preview.type === 'existing'
        ? preview.image
        : null,
    selectedImageId:
      preview.type === 'new'
        ? preview.id
        : '',
    url: preview.url
  }

  await nextTick()

  imageDeleteConfirmRef.value?.focus()
}

const cancelImageRemoval = () => {
  if (deletingImage.value) {
    return
  }

  resetImageDeleteConfirmation()
}

const confirmImageRemoval = async () => {
  const pendingDelete = {
    ...imageDeleteConfirm.value
  }

  if (
    !pendingDelete.open ||
    deletingImage.value
  ) {
    return
  }

  /*
   * Una imagen nueva todavía no está en Supabase.
   * Solo se retira de la selección local.
   */
  if (pendingDelete.type === 'new') {
    const removed = removeNewImageById(
      pendingDelete.selectedImageId
    )

    resetImageDeleteConfirmation()

    if (removed) {
      showImageSuccess(
      'La imagen se quitó de la selección. No se había subido todavía.'
    )
    }

    return
  }

  if (!pendingDelete.image) {
    resetImageDeleteConfirmation()
    return
  }

  deletingImage.value = true
  clearModalNotice()

  try {
    await deleteAdminProductImage(
      pendingDelete.image
    )

    existingImages.value =
      existingImages.value.filter((image) => {
        return (
          image.id_product_image !==
          pendingDelete.image.id_product_image
        )
      })

    const productId =
      editingProduct.value?.id_producto

    if (productId) {
      try {
        const refreshedProduct =
          await getAdminProductById(productId)

        editingProduct.value =
          refreshedProduct

        existingImages.value =
          sortedImages(
            refreshedProduct.product_images || []
          )

        replaceProductInList(
          refreshedProduct
        )
      } catch (refreshError) {
        /*
         * La eliminación ya fue realizada.
         * Si falla únicamente la actualización visual,
         * conservamos localmente la información correcta.
         */
        const fallbackProduct = {
          ...editingProduct.value,
          product_images: [
            ...existingImages.value
          ]
        }

        editingProduct.value =
          fallbackProduct

        replaceProductInList(
          fallbackProduct
        )

        console.warn(
          'La imagen se eliminó, pero no se pudo refrescar el producto:',
          refreshError
        )
      }
    }

    resetImageDeleteConfirmation()

    showImageSuccess(
      'La imagen fue eliminada correctamente del producto.'
    )
  } catch (error) {
    console.error(
      'Error al eliminar imagen:',
      error
    )

    showImageError(
      error.message ||
      'No se pudo eliminar la imagen. Intenta nuevamente.'
    )
  } finally {
    deletingImage.value = false
  }
}

const uploadSelectedImagesForProduct = async (product) => {
  if (!selectedImages.value.length) return []

  const uploaded = []
  const total = selectedImages.value.length

  for (const [index, selectedItem] of selectedImages.value.entries()) {
    const file = selectedItem?.file || selectedItem

    savingStage.value =
      `Subiendo imagen ${index + 1} de ${total}...`

    const uploadedImage = await uploadProductImage(
      file,
      product.nombre,
      product.id_producto
    )

    const sortOrder =
      existingImages.value.length +
      index +
      1

    const savedImage = await createAdminProductImage({
      id_producto: product.id_producto,
      image_url: uploadedImage.publicUrl,
      storage_path: uploadedImage.storagePath,
      alt_text: product.nombre,
      sort_order: sortOrder,
      is_primary:
        existingImages.value.length === 0 &&
        index === 0
    })

    uploaded.push(savedImage)
  }

  return uploaded
}

const statusOptions = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'stock_bajo', label: 'Stock bajo' },
  { value: 'consultar', label: 'Consultar' },
  { value: 'sin_stock', label: 'Sin stock' }
]

const emptyForm = () => ({
  id_categoria: '',
  codigo: '',
  nombre: '',
  slug: '',
  descripcion: '',
  imagen_url: '',
  estado_web: 'disponible',
  visible_web: true,
  destacado: false,
  marca: '',
  compatibilidad: '',
  seo_titulo: '',
  seo_descripcion: ''
})

const form = ref(emptyForm())

const normalizeText = (value) => {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

const filteredProducts = computed(() => {
  const term = normalizeText(searchTerm.value)

  return products.value.filter((product) => {
    const searchable = normalizeText([
      product.nombre,
      product.codigo,
      product.marca,
      product.categorias?.nombre,
      product.estado_web
    ].join(' '))

    const matchesSearch = term ? searchable.includes(term) : true

    const matchesCategory = selectedCategory.value
      ? Number(product.id_categoria) === Number(selectedCategory.value)
      : true

    const matchesVisibility = selectedVisibility.value
      ? String(product.visible_web) === selectedVisibility.value
      : true

    const matchesStatus = selectedStatus.value
      ? product.estado_web === selectedStatus.value
      : true

    return matchesSearch && matchesCategory && matchesVisibility && matchesStatus
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredProducts.value.length / productsPerPage))
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * productsPerPage
  const end = start + productsPerPage

  return filteredProducts.value.slice(start, end)
})

const paginationPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const groupSize = 4
  const visibleCount = 5

  const pageItem = (value) => ({
    type: 'page',
    value,
    key: `page-${value}`
  })

  const dotsItem = (position) => ({
    type: 'dots',
    value: '...',
    key: `dots-${position}`
  })

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => pageItem(index + 1))
  }

  const groupIndex = Math.floor((current - 1) / groupSize)

  let start = groupIndex * groupSize + 1
  let end = start + visibleCount - 1

  if (end > total) {
    end = total
    start = Math.max(1, total - visibleCount + 1)
  }

  const visiblePages = Array.from(
    { length: end - start + 1 },
    (_, index) => pageItem(start + index)
  )

  const pages = []

  if (start >= 9) {
    pages.push(pageItem(1))
    pages.push(dotsItem('start'))
  }

  pages.push(...visiblePages)

  if (end < total) {
    pages.push(dotsItem('end'))
    pages.push(pageItem(total))
  }

  return pages
})

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const showSuccess = (message) => {
  successMessage.value = message
  errorMessage.value = ''

  if (messageTimer) clearTimeout(messageTimer)

  messageTimer = setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 5000)
}

const showError = (message) => {
  errorMessage.value = message
  successMessage.value = ''

  if (messageTimer) clearTimeout(messageTimer)

  messageTimer = setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 5000)
}

const clearModalNotice = () => {
  if (modalNoticeTimer) {
    clearTimeout(modalNoticeTimer)
    modalNoticeTimer = null
  }

  modalNotice.value = {
    type: '',
    text: ''
  }
}

const showModalNotice = (type, text) => {
  clearModalNotice()

  modalNotice.value = {
    type,
    text
  }

  // Los errores permanecen hasta que el usuario los cierre.
  // Los mensajes positivos desaparecen automáticamente.
  if (type === 'success') {
    modalNoticeTimer = setTimeout(() => {
      modalNotice.value = {
        type: '',
        text: ''
      }

      modalNoticeTimer = null
    }, 5000)
  }
}

const showModalError = (message) => {
  showModalNotice('error', message)
}

const showModalSuccess = (message) => {
  showModalNotice('success', message)
}
const clearImageNotice = () => {
  if (imageNoticeTimer) {
    clearTimeout(imageNoticeTimer)
    imageNoticeTimer = null
  }

  imageNotice.value = {
    type: '',
    text: ''
  }
}

const showImageNotice = (type, text) => {
  clearImageNotice()

  imageNotice.value = {
    type,
    text
  }

  /*
   * Los mensajes positivos desaparecen después de 5 segundos.
   * Los errores permanecen hasta que el usuario los cierre
   * o realice otra acción relacionada con imágenes.
   */
  if (type === 'success') {
    imageNoticeTimer = setTimeout(() => {
      imageNotice.value = {
        type: '',
        text: ''
      }

      imageNoticeTimer = null
    }, 5000)
  }
}

const showImageError = (message) => {
  showImageNotice('error', message)
}

const showImageSuccess = (message) => {
  showImageNotice('success', message)
}
const resetImageDeleteConfirmation = () => {
  imageDeleteConfirm.value = {
    open: false,
    type: '',
    image: null,
    selectedImageId: '',
    url: ''
  }
}

const stats = computed(() => {
  const total = products.value.length
  const visible = products.value.filter((product) => product.visible_web).length
  const noImage = products.value.filter((product) => {
    return !hasProductImage(product)
  }).length
  const destacados = products.value.filter((product) => product.destacado).length

  return {
    total,
    visible,
    noImage,
    destacados
  }
})

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [productsData, categoriesData] = await Promise.all([
      getAdminProducts(),
      getAdminCategories()
    ])

    products.value = productsData
    categories.value = categoriesData
  } catch (error) {
    errorMessage.value = error.message || 'No se pudieron cargar los datos.'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  clearImageNotice()
  clearSelectedImages()
  clearModalNotice()
  resetImageDeleteConfirmation()
  resetImageDragState()

  editingProduct.value = null
  selectedImage.value = null
  existingImages.value = []
  form.value = emptyForm()
  isModalOpen.value = true
}

const openEditModal = (product) => {
  clearImageNotice()
  clearSelectedImages()
  resetImageDragState()
  clearModalNotice()
  resetImageDeleteConfirmation()

  editingProduct.value = product
  selectedImage.value = null

  form.value = {
    id_categoria: product.id_categoria || '',
    codigo: product.codigo || '',
    nombre: product.nombre || '',
    slug: product.slug || '',
    descripcion: product.descripcion || '',
    imagen_url: product.imagen_url || '',
    estado_web: product.estado_web || 'disponible',
    visible_web: Boolean(product.visible_web),
    destacado: Boolean(product.destacado),
    marca: product.marca || '',
    compatibilidad: product.compatibilidad || '',
    seo_titulo: product.seo_titulo || '',
    seo_descripcion: product.seo_descripcion || ''
  }

  existingImages.value = sortedImages(
    product.product_images || []
  )

  isModalOpen.value = true
}

const closeModal = (force = false) => {
  if (
    (saving.value || deletingImage.value) &&
    !force
  ) {
    return
  }

  clearSelectedImages()
  resetImageDragState()

  isModalOpen.value = false
  editingProduct.value = null
  selectedImage.value = null
  existingImages.value = []
  form.value = emptyForm()
  clearImageNotice()
  clearModalNotice()
  resetImageDeleteConfirmation()
}

const handleImageChange = (event) => {
  selectedImage.value = event.target.files?.[0] || null
}

const autoGenerateSlug = () => {
  if (!form.value.nombre) return

  form.value.slug = editingProduct.value
    ? slugify(form.value.nombre)
    : generateProductSlug(form.value.nombre)
}

const saveProduct = async () => {
  if (saving.value) return
  clearModalNotice()
  resetImageDeleteConfirmation()
  errorMessage.value = ''
  successMessage.value = ''
  saving.value = true
  savingStage.value = 'Guardando información del producto...'

  try {
    const payload = {
      ...form.value
    }

    if (!payload.slug) {
      payload.slug = editingProduct.value
        ? slugify(payload.nombre)
        : generateProductSlug(payload.nombre)
    }

    let savedProduct = null

    if (editingProduct.value) {
      savedProduct = await updateAdminProduct(
        editingProduct.value.id_producto,
        payload
      )
    } else {
      savedProduct = await createAdminProduct(payload)
    }

    if (selectedImages.value.length) {
      savingStage.value =
        selectedImages.value.length === 1
          ? 'Subiendo imagen...'
          : `Subiendo ${selectedImages.value.length} imágenes...`

      await uploadSelectedImagesForProduct(savedProduct)
    }

    savingStage.value = 'Actualizando la vista...'

    const refreshedProduct = await getAdminProductById(
      savedProduct.id_producto
    )

    replaceProductInList(refreshedProduct)

    const successText = editingProduct.value
      ? 'Producto actualizado correctamente.'
      : 'Producto creado correctamente.'

    showSuccess(successText)

    closeModal(true)
  } catch (error) {
    console.error('Error al guardar producto:', error)

    showModalError(
      error.message ||
      'No se pudo guardar el producto.'
    )
  } finally {
    saving.value = false
    savingStage.value = ''
  }
}

const openDeleteModal = (product) => {
  deleteModal.value = {
    open: true,
    product
  }
}

const closeDeleteModal = ({ force = false } = {}) => {
  if (deletingId.value && !force) return

  deleteModal.value = {
    open: false,
    product: null
  }
}

const confirmDeleteProduct = async () => {
  const product = deleteModal.value.product

  if (!product) return

  deletingId.value = product.id_producto

  try {
    await deleteAdminProduct(product.id_producto)

    products.value = products.value.filter((item) => {
      return item.id_producto !== product.id_producto
    })

    showSuccess('Producto eliminado correctamente. Puedes revertirlo desde Auditoría.')

    closeDeleteModal({ force: true })
  } catch (error) {
    showError(error.message || 'No se pudo eliminar el producto.')
  } finally {
    deletingId.value = null
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find((item) => {
    return Number(item.id_categoria) === Number(categoryId)
  })

  return category?.nombre || ''
}

const generateSeoFields = () => {
  const name = String(form.value.nombre || '').trim()
  const brand = String(form.value.marca || '').trim()
  const categoryName = getCategoryName(form.value.id_categoria)

  if (!name) {
    showModalError(
      'Primero escribe el nombre del producto para poder generar el contenido SEO.'
    )
    return
  }

  const brandText = brand ? ` ${brand}` : ''
  const categoryText = categoryName ? ` - ${categoryName}` : ''

  form.value.seo_titulo = `${name}${brandText}${categoryText} en La Paz Bolivia | Mayecy`

  form.value.seo_descripcion =
    `Consulta ${name}${brandText} en Mayecy, La Paz Bolivia. ` +
    `Disponibilidad de insumos para impresoras y fotocopiadoras, tóners, tintas, cartuchos, papel para plotter y recargas.`
}

const toggleProductVisibility = async (product) => {
  try {
    await updateAdminProduct(product.id_producto, {
      ...product,
      visible_web: !product.visible_web
    })

    await loadData()
  } catch (error) {
    showError(error.message || 'No se pudo cambiar la visibilidad.')
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedCategory.value = ''
  selectedVisibility.value = ''
  selectedStatus.value = ''
}

watch(
  [searchTerm, selectedCategory, selectedVisibility, selectedStatus],
  () => {
    currentPage.value = 1
  }
)

watch(filteredProducts, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }

  if (modalNoticeTimer) {
    clearTimeout(modalNoticeTimer)
  }

  if (imageNoticeTimer) {
    clearTimeout(imageNoticeTimer)
  }

  clearSelectedImages()
  resetImageDragState()
  clearModalNotice()
  clearImageNotice()
  resetImageDeleteConfirmation()
})

onMounted(() => {
  loadData()
})

useSeoMeta({
  title: 'Productos | Admin Mayecy',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div>
    <div class="admin-page-heading admin-products-heading">
      <div>
        <span class="admin-eyebrow">Catálogo</span>
        <h1>Productos</h1>
        <p>
          Crea, edita, oculta, destaca y administra imágenes de los productos publicados en la web.
        </p>
      </div>

      <button
        type="button"
        class="admin-button admin-button-primary"
        @click="openCreateModal"
      >
        Nuevo producto
      </button>
    </div>

    <div class="admin-products-stats">
      <article class="admin-mini-card">
        <span>Total</span>
        <strong>{{ stats.total }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Visibles</span>
        <strong>{{ stats.visible }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Sin imagen</span>
        <strong>{{ stats.noImage }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Destacados</span>
        <strong>{{ stats.destacados }}</strong>
      </article>
    </div>

    <div class="admin-toolbar">
      <input
        v-model="searchTerm"
        type="search"
        placeholder="Buscar por nombre, código, marca o categoría..."
        class="admin-search-input"
      >

      <select v-model="selectedCategory" class="admin-select">
        <option value="">Todas las categorías</option>
        <option
          v-for="category in categories"
          :key="category.id_categoria"
          :value="category.id_categoria"
        >
          {{ category.nombre }}
        </option>
      </select>

      <select v-model="selectedStatus" class="admin-select">
        <option value="">Todos los estados</option>
        <option
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <select v-model="selectedVisibility" class="admin-select">
        <option value="">Toda visibilidad</option>
        <option value="true">Visible</option>
        <option value="false">Oculto</option>
      </select>

      <button
        type="button"
        class="admin-button admin-button-secondary"
        @click="clearFilters"
      >
        Limpiar
      </button>
    </div>

    <nav
        v-if="totalPages > 1"
        class="admin-pagination admin-pagination-top"
        aria-label="Paginación superior de productos"
        >
        <button
            type="button"
            class="admin-pagination-button"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
        >
            Anterior
        </button>

        <template
            v-for="page in paginationPages"
            :key="page.key"
        >
            <button
            v-if="page.type === 'page'"
            type="button"
            class="admin-pagination-number"
            :class="{ 'admin-pagination-active': currentPage === page.value }"
            @click="goToPage(page.value)"
            >
            {{ page.value }}
            </button>

            <span
            v-else
            class="admin-pagination-dots"
            >
            ...
            </span>
        </template>

        <button
            type="button"
            class="admin-pagination-button"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
        >
            Siguiente
        </button>
        </nav>

    <p v-if="errorMessage" class="admin-alert admin-alert-error">
      {{ errorMessage }}
    </p>

    <p v-if="successMessage" class="admin-alert admin-alert-success">
      {{ successMessage }}
    </p>

    <div v-if="loading" class="admin-card">
      Cargando productos...
    </div>

    <div v-else class="admin-products-panel">
      <div class="admin-products-panel-header">
        <strong>{{ filteredProducts.length }} producto(s)</strong>
        <span>Resultado según búsqueda y filtros</span>
      </div>

      <div class="admin-products-table">
        <article
          v-for="product in paginatedProducts"
          :key="product.id_producto"
          class="admin-product-row"
        >
          <div class="admin-product-image">
            <img
              v-if="getProductMainImage(product)"
              :src="getProductMainImage(product)"
              :alt="product.nombre"
              loading="lazy"
            >

            <span v-else>
              {{ product.nombre?.slice(0, 2) || 'P' }}
            </span>
          </div>

          <div class="admin-product-main">
            <div class="admin-product-title-line">
              <h2>{{ product.nombre }}</h2>

              <span
                class="admin-status-pill"
                :class="`admin-status-${product.estado_web}`"
              >
                {{ product.estado_web }}
              </span>
            </div>

            <p>
              {{ product.categorias?.nombre || 'Sin categoría' }}
              <span v-if="product.marca"> · {{ product.marca }}</span>
            </p>

            <div class="admin-product-flags">
              <span :class="{ 'admin-flag-active': product.visible_web }">
                {{ product.visible_web ? 'Visible en web' : 'Oculto' }}
              </span>

              <span :class="{ 'admin-flag-active': product.destacado }">
                {{ product.destacado ? 'Destacado' : 'No destacado' }}
              </span>
            </div>
          </div>

          <div class="admin-product-actions">
            <button
              type="button"
              class="admin-action-button"
              @click="openEditModal(product)"
            >
              Editar
            </button>

            <button
              type="button"
              class="admin-action-button"
              @click="toggleProductVisibility(product)"
            >
              {{ product.visible_web ? 'Ocultar' : 'Mostrar' }}
            </button>

            <button
              type="button"
              class="admin-action-button admin-action-danger"
              :disabled="deletingId === product.id_producto"
                @click="openDeleteModal(product)"            >
              {{ deletingId === product.id_producto ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </article>
      </div>

      <nav
            v-if="totalPages > 1"
            class="admin-pagination admin-pagination-bottom"
            aria-label="Paginación inferior de productos"
            >
            <button
                type="button"
                class="admin-pagination-button"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
            >
                Anterior
            </button>

            <template
                v-for="page in paginationPages"
                :key="page.key"
            >
                <button
                v-if="page.type === 'page'"
                type="button"
                class="admin-pagination-number"
                :class="{ 'admin-pagination-active': currentPage === page.value }"
                @click="goToPage(page.value)"
                >
                {{ page.value }}
                </button>

                <span
                v-else
                class="admin-pagination-dots"
                >
                ...
                </span>
            </template>

            <button
                type="button"
                class="admin-pagination-button"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
            >
                Siguiente
            </button>
            </nav>
    </div>

    <div
        v-if="isModalOpen"
        class="admin-modal-backdrop"
        @click.self="closeModal()"
      >
      <section class="admin-product-modal">
        <div class="admin-modal-header">
          <div>
            <span class="admin-eyebrow">
              {{ editingProduct ? 'Editar producto' : 'Nuevo producto' }}
            </span>
            <h2>
              {{ editingProduct ? 'Actualizar producto' : 'Crear producto' }}
            </h2>
          </div>

          <button
            type="button"
            class="admin-modal-close"
            :disabled="saving"
            @click="closeModal()"
          >
            ×
          </button>
        </div>

        <form class="admin-product-form" @submit.prevent="saveProduct">
          <div
            v-if="modalNotice.text"
            class="admin-modal-notice"
            :class="{
              'admin-modal-notice-error':
                modalNotice.type === 'error',
              'admin-modal-notice-success':
                modalNotice.type === 'success'
            }"
            :role="
              modalNotice.type === 'error'
                ? 'alert'
                : 'status'
            "
            :aria-live="
              modalNotice.type === 'error'
                ? 'assertive'
                : 'polite'
            "
          >
            <span class="admin-modal-notice-icon">
              {{ modalNotice.type === 'error' ? '!' : '✓' }}
            </span>

            <div class="admin-modal-notice-content">
              <strong>
                {{
                  modalNotice.type === 'error'
                    ? 'Revisa lo siguiente'
                    : 'Listo'
                }}
              </strong>

              <p>
                {{ modalNotice.text }}
              </p>
            </div>

            <button
              type="button"
              class="admin-modal-notice-close"
              aria-label="Cerrar mensaje"
              @click="clearModalNotice"
            >
              ×
            </button>
          </div>
          <label class="admin-form-field admin-form-field-wide">
            Nombre del producto
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="Ej. Toner HP 85A"
            >
          </label>

          <label class="admin-form-field">
            Slug / URL
            <div class="admin-inline-field">
              <input
                v-model="form.slug"
                type="text"
                placeholder="toner-hp-85a"
              >
              <button
                type="button"
                class="admin-small-button"
                @click="autoGenerateSlug"
              >
                Generar
              </button>
            </div>
          </label>

          <label class="admin-form-field">
            Categoría
            <select v-model="form.id_categoria">
              <option value="">Sin categoría</option>
              <option
                v-for="category in categories"
                :key="category.id_categoria"
                :value="category.id_categoria"
              >
                {{ category.nombre }}
              </option>
            </select>
          </label>

          <label class="admin-form-field">
            Código interno
            <input
              v-model="form.codigo"
              type="text"
              placeholder="Opcional"
            >
          </label>

          <label class="admin-form-field">
            Marca
            <input
              v-model="form.marca"
              type="text"
              placeholder="HP, Canon, Epson..."
            >
          </label>

          <label class="admin-form-field">
            Estado web
            <select v-model="form.estado_web">
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="admin-form-field admin-form-field-wide">
            <span>Imágenes del producto</span>

            <div
              class="admin-image-dropzone"
              :class="{
                'admin-image-dropzone-active': isDraggingImages,
                'admin-image-dropzone-disabled':
                !canAddImages || imageManagerLocked
              }"
              :aria-disabled="!canAddImages || imageManagerLocked"
              @dragenter.prevent="handleImageDragEnter"
              @dragover.prevent="handleImageDragOver"
              @dragleave.prevent="handleImageDragLeave"
              @drop.prevent="handleImagesDrop"
            >
              <input
                id="admin-product-images"
                type="file"
                class="admin-image-dropzone-input"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                :disabled="!canAddImages || imageManagerLocked"
                @change="handleImagesChange"
              >

              <label
                for="admin-product-images"
                class="admin-image-dropzone-label"
              >
                <span class="admin-image-dropzone-icon">
                  🖼️
                </span>

                <strong v-if="isDraggingImages">
                  Suelta las imágenes aquí
                </strong>

                <strong v-else-if="canAddImages">
                  Arrastra imágenes aquí
                </strong>

                <strong v-else>
                  Ya alcanzaste el máximo de 5 imágenes
                </strong>

                <small v-if="canAddImages && !saving">
                  También puedes hacer clic para seleccionarlas
                </small>

                <small v-else-if="saving">
                  Espera mientras termina el guardado
                </small>

                <span class="admin-image-dropzone-count">
                  {{ totalImageCount }} de {{ maxProductImages }} imágenes
                </span>
              </label>
            </div>

            <div
              v-if="previewImages.length"
              class="admin-image-manager"
            >
              <div
                v-for="preview in previewImages"
                :key="preview.id"
                class="admin-image-preview"
              >
                <img
                  :src="preview.url"
                  alt="Vista previa del producto"
                >

                <button
                    type="button"
                    class="admin-image-delete"
                    title="Quitar imagen"
                    :disabled="saving || deletingImage"
                    @click="requestImageRemoval(preview)"
                  >
                    🗑️
                  </button>
              </div>
            </div>

            <div class="admin-image-feedback-slot">
        <div
          v-if="imageNotice.text"
          class="admin-modal-notice admin-image-notice"
          :class="{
            'admin-modal-notice-error':
              imageNotice.type === 'error',
            'admin-modal-notice-success':
              imageNotice.type === 'success'
          }"
          :role="
            imageNotice.type === 'error'
              ? 'alert'
              : 'status'
          "
          :aria-live="
            imageNotice.type === 'error'
              ? 'assertive'
              : 'polite'
          "
        >
          <span class="admin-modal-notice-icon">
            {{ imageNotice.type === 'error' ? '!' : '✓' }}
          </span>

          <div class="admin-modal-notice-content">
            <strong>
              {{
                imageNotice.type === 'error'
                  ? 'Revisa las imágenes'
                  : 'Imágenes actualizadas'
              }}
            </strong>

            <p>
              {{ imageNotice.text }}
            </p>
          </div>

          <button
            type="button"
            class="admin-modal-notice-close"
            aria-label="Cerrar mensaje de imágenes"
            @click="clearImageNotice"
          >
            ×
          </button>
        </div>

        <section
          v-else-if="imageDeleteConfirm.open"
          ref="imageDeleteConfirmRef"
          class="admin-image-delete-confirmation"
          tabindex="-1"
          role="group"
          aria-labelledby="admin-image-delete-title"
        >
          <div class="admin-image-delete-confirmation-preview">
            <img
              :src="imageDeleteConfirm.url"
              alt="Imagen que se desea quitar"
            >
          </div>

          <div class="admin-image-delete-confirmation-content">
            <span class="admin-eyebrow">
              Confirmar eliminación
            </span>

            <strong id="admin-image-delete-title">
              {{
                imageDeleteConfirm.type === 'existing'
                  ? '¿Eliminar esta imagen del producto?'
                  : '¿Quitar esta imagen de la selección?'
              }}
            </strong>

            <p v-if="imageDeleteConfirm.type === 'existing'">
              La imagen se eliminará del almacenamiento y dejará de aparecer en el producto.
            </p>

            <p v-else>
              Esta imagen todavía no fue subida. Únicamente se quitará de la selección actual.
            </p>
          </div>

          <div class="admin-image-delete-confirmation-actions">
            <button
              type="button"
              class="admin-button admin-button-secondary"
              :disabled="deletingImage"
              @click="cancelImageRemoval"
            >
              Cancelar
            </button>

            <button
              type="button"
              class="admin-button admin-button-danger"
              :disabled="deletingImage"
              @click="confirmImageRemoval"
            >
              {{
                deletingImage
                  ? 'Eliminando...'
                  : imageDeleteConfirm.type === 'existing'
                    ? 'Sí, eliminar imagen'
                    : 'Sí, quitar imagen'
              }}
            </button>
          </div>
        </section>
      </div>

            <small class="admin-field-help">
              Formatos permitidos: JPEG, PNG y WEBP.
              Máximo 5 MB por imagen y 5 imágenes por producto.
            </small>
          </div>

          <label class="admin-form-field admin-form-field-wide">
            Descripción
            <textarea
              v-model="form.descripcion"
              rows="3"
              placeholder="Descripción visible en la web"
            />
          </label>

          <label class="admin-form-field admin-form-field-wide">
            Compatibilidad
            <textarea
              v-model="form.compatibilidad"
              rows="3"
              placeholder="Modelos compatibles, impresoras, observaciones..."
            />
          </label>

          <div class="admin-seo-generator admin-form-field-wide">
            <div>
                <strong>SEO automático</strong>
                <p>Genera el título y la descripción SEO usando el nombre, marca y categoría del producto.</p>
            </div>

            <button
                type="button"
                class="admin-small-button admin-small-button-pink"
                @click="generateSeoFields"
            >
                Generar SEO
            </button>
            </div>

          <label class="admin-form-field admin-form-field-wide">
            Título SEO
            <input
              v-model="form.seo_titulo"
              type="text"
              placeholder="Título para buscadores"
            >
          </label>

          <label class="admin-form-field admin-form-field-wide">
            Descripción SEO
            <textarea
              v-model="form.seo_descripcion"
              rows="2"
              placeholder="Descripción para buscadores"
            />
          </label>

          <div class="admin-form-toggles admin-form-field-wide">
            <label>
              <input
                v-model="form.visible_web"
                type="checkbox"
              >
              Visible en la web
            </label>

            <label>
              <input
                v-model="form.destacado"
                type="checkbox"
              >
              Producto destacado
            </label>
          </div>

          <div class="admin-modal-actions admin-form-field-wide">
            <button
              type="button"
              class="admin-button admin-button-secondary"
              :disabled="saving"
              @click="closeModal()"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="admin-button admin-button-primary"
              :disabled="saving"
            >
              {{ saving ? savingStage || 'Guardando...' : 'Guardar producto' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>

  <div
  v-if="deleteModal.open"
  class="admin-modal-backdrop"
  @click.self="closeDeleteModal()"
>
  <section class="admin-delete-modal">
    <div class="admin-delete-icon">
      🗑️
    </div>

    <div>
      <span class="admin-eyebrow">Confirmar eliminación</span>

      <h2>¿Eliminar este producto?</h2>

      <p>
        Estás por eliminar
        <strong>{{ deleteModal.product?.nombre }}</strong>.
        Esta acción se registrará en auditoría y podrás intentar revertirla desde la sección Auditoría.
      </p>
    </div>

    <div class="admin-delete-product-preview">
      <div class="admin-product-image">
        <img
            v-if="getProductMainImage(deleteModal.product)"
            :src="getProductMainImage(deleteModal.product)"
            :alt="deleteModal.product?.nombre"
          >
        <span v-else>
          {{ deleteModal.product?.nombre?.slice(0, 2) || 'P' }}
        </span>
      </div>

      <div>
        <strong>{{ deleteModal.product?.nombre }}</strong>
        <small>{{ deleteModal.product?.categorias?.nombre || 'Sin categoría' }}</small>
      </div>
    </div>

    <div class="admin-delete-actions">
      <button
        type="button"
        class="admin-button admin-button-secondary"
        :disabled="Boolean(deletingId)"
        @click="closeDeleteModal()"
      >
        Cancelar
      </button>

      <button
        type="button"
        class="admin-button admin-button-danger"
        :disabled="Boolean(deletingId)"
        @click="confirmDeleteProduct"
      >
        {{ deletingId ? 'Eliminando...' : 'Sí, eliminar producto' }}
      </button>
    </div>
  </section>
</div>
</template>