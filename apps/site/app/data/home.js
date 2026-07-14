export const homeContent = {
    hero: {
      title: 'Tintas - cintas - tóners',
      subtitle: 'Originales y alternativos',
      offerTitle: 'Además le ofrecemos:',
      offerItems: [
        'Papel para plotter',
        'Impresoras',
        'Rollos termicos'
      ],
      description:
        'Atendemos con gusto las necesidades de oficinas, empresas y clientes particulares, ofreciendo productos e insumos para impresión de manera dinámica y eficiente.',
      primaryAction: {
        label: 'Ver nuestros productos',
        to: '/productos'
      },
      secondaryAction: {
        label: 'Contáctenos',
        href:
          'https://wa.me/59171930704?text=Hola%20Mayecy%2C%20quiero%20consultar%20informaci%C3%B3n%20sobre%20sus%20productos.'
      }
    },

  offer: {
    badge: 'Oferta de temporada',
    title: 'Productos seleccionados hasta agotar stock',
    description:
      'Consulta ofertas disponibles en cartuchos, tóners, tintas, papel para plotter, rollos térmicos, insumos y productos para impresión. La disponibilidad puede variar, por eso te atendemos directamente por WhatsApp.',
    actionLabel: 'Consultar oferta',
    actionHref:
      'https://wa.me/59171930704?text=Hola%20Mayecy%2C%20quiero%20consultar%20las%20ofertas%20disponibles.'
  },

  categories: [
    {
      name: 'Papelería',
      description:
        'Contamos con variedad de material de escritorio y papel para impresoras y oficinas.',
      image: '/images/categories/papeleria.png',
      accent: 'pink'
    },
    {
      name: 'Papel para plotter',
      description:
        'Papel para plotter y materiales para impresión de gran formato según requerimiento.',
      image: '/images/categories/papel-plotter.png',
      accent: 'cyan'
    },
    {
      name: 'Tóners',
      description:
        'Tóners originales y alternativos para impresoras láser y fotocopiadoras de diferentes marcas y modelos.',
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
      name: 'Rollos térmicos',
      description:
        'Rollos térmicos para impresoras de recibos, puntos de venta, cajas registradoras y otros equipos comerciales.',
      image: '/images/categories/rollos-termicos.png',
      accent: 'cyan'
    },
  ],

  services: [
    {
      title: 'Recargas',
      description:
        'Brindamos el servicio de recargas y asesoramiento sobre los suministros que necesita su equipo.'
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