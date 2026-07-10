export const homeContent = {
  hero: {
    eyebrow: 'Mayecy',
    title: 'Impresoras, tintas, cintas, tóners, recargas y papel para plotter',
    description:
      'Nacimos para estar al servicio de la población oficinista, atendemos con gusto sus necesidades y requerimientos de manera muy dinámica y eficiente.',
    highlight:
      'IMPRESORAS • TINTAS • CINTAS • TÓNERS • RECARGAS • PAPEL PARA PLOTTER',
    secondaryText:
      'También atendemos pedidos de papel para plotter, material de escritorio y limpieza. Consulte sin compromiso.',
    primaryAction: {
      label: 'Ver nuestros productos',
      to: '/productos'
    },
    secondaryAction: {
      label: 'Contáctenos',
      href: 'https://wa.me/59171930704?text=Hola%20Mayecy%2C%20quiero%20consultar%20informaci%C3%B3n%20sobre%20sus%20productos.'
    }
  },

  offer: {
    badge: 'Oferta de temporada',
    title: 'Productos seleccionados hasta agotar stock',
    description:
    'Consulta ofertas disponibles en cartuchos, tóners, tintas, papel para plotter, insumos y productos para impresión. La disponibilidad puede variar, por eso te atendemos directamente por WhatsApp.',
    actionLabel: 'Consultar oferta',
    actionHref:
      'https://wa.me/59171930704?text=Hola%20Mayecy%2C%20quiero%20consultar%20las%20ofertas%20disponibles.'
  },

  categories: [
    {
        name: 'Papelería',
        description:
        'Contamos con gran variedad de material de escritorio y papel para impresoras y ploters.',
        image: '/images/categories/papeleria.png',
        accent: 'pink'
    },
    {
        name: 'Material de limpieza',
        description:
        'Tenemos todo tipo de insumos y artículos de limpieza para su oficina.',
        image: '/images/categories/limpieza.png',
        accent: 'cyan'
    },
    {
        name: 'Tóners',
        description:
        'Tóners para impresoras láser y fotocopiadoras en diferentes marcas y modelos.',
        image: '/images/categories/toners.png',
        accent: 'yellow'
    },
    {
        name: 'Tintas',
        description:
        'Tintas originales y alternativas para impresoras de uso doméstico, oficina y negocio.',
        image: '/images/categories/tintas.png',
        accent: 'pink'
    },
    {
        name: 'Recargas',
        description:
        'Servicio de recarga y asesoramiento para mantener tus equipos funcionando correctamente.',
        image: '/images/categories/recargas.png',
        accent: 'cyan'
    },
     {
        name: 'Papel para plotter',
        description:
        'Papel para plotter y materiales para impresión de gran formato según requerimiento.',
        image: '/images/categories/papel-plotter.png',
        accent: 'cyan'
    },
    ],

  services: [
    {
      title: 'Recargas',
      description:
        'Brindamos el servicio de recargas y asesoramiento sobre suministros que necesita su equipo.'
    },
    {
      title: 'Mantenimiento',
      description:
        'Para un buen funcionamiento, planifique mantenimiento periódico para sus equipos de oficina.'
    },
    {
      title: 'Asesoramiento',
      description:
        'Le ayudamos a identificar el insumo correcto según el modelo de su impresora o fotocopiadora.'
    }
  ]
}