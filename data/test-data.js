const products = [
  {
    name: "UltraVision 4K Smart Projector",
    shortDescription:
      "Cinematic experience in your living room with 5000 lumens.",
    longDescription:
      "The UltraVision 4K Smart Projector offers unparalleled clarity and brightness. Built-in Haman Lardon speakers and Android TV support make it the ultimate home theater companion.",
    brand: "LeixTech",
    category: "65d1a2b3c4d5e6f7a8b9c0d1",
    tags: ["electronics", "home-theater", "4k"],
    attributes: [
      { key: "Brightness", value: "5000 Lumens" },
      { key: "Resolution", value: "3840 x 2160" },
    ],
    isFeatured: true,
    isDigital: false,
  },
  {
    name: "Eco-Friendly Organic Cotton Hoodie",
    shortDescription: "Sustainable comfort for everyday wear.",
    longDescription:
      "Made from 100% GODS certified organic cotton. Our hoodies are pre-shrunk and dyed with non-toxic pigments for a soft, planet-friendly feel.",
    brand: "PureEarth",
    category: "65d1a2b3c4d5e6f7a8b9c0d2",
    tags: ["clothing", "sustainable", "winter"],
    attributes: [
      { key: "Material", value: "100% Organic Cotton" },
      { key: "Weight", value: "350 GSM" },
    ],
    isFeatured: false,
    isDigital: false,
    isActive: true,
    isDeleted: false,
  },
  {
    name: "Pro Masterclass: E-commerce Development",
    shortDescription: "Master MEAN stack e-commerce development in 20 hours.",
    longDescription:
      "A comprehensive guide to building scalable online stores. Includes source code, deployment guides, and lifetime access to updates.",
    brand: "DevAcademy",
    category: "65d1a2b3c4d5e6f7a8b9c0d3",
    tags: ["course", "programming", "education"],
    attributes: [
      { key: "Duration", value: "20 Hours" },
      { key: "Format", value: "MP4 Video" },
    ],
    videoUrl: "https://vimeo.com/123456789",
    isFeatured: true,
    isDigital: true,
  },
];

const variants = [
  {
  "product": "65d1a2b3c4d5e6f7a8b9c0d1",
  "sku": "IP15PRO-BLACK-256GB",
  "options": {
    "color": "Space Black",
    "storage": "256GB"
  },
  "attributes": [
    { "key": "Material", "value": "Titanium" }
  ],
  "costPrice": 850,
  "price": 1099,
  "salePrice": 1049,
  "stock": 15,
  "images": [
    { "url": "https://cloudinary.com/ip15-black.jpg", "publicId": "v_black_01" }
  ]
},
{
  "product": "65d1a2b3c4d5e6f7a8b9c0d2",
  "sku": "TEE-NAVY-LARGE",
  "options": {
    "color": "Navy Blue",
    "size": "Large"
  },
  "attributes": [
    { "key": "Fabric", "value": "100% Organic Cotton" }
  ],
  "costPrice": 12,
  "price": 35,
  "salePrice": 29,
  "stock": 100,
  "images": [
    { "url": "https://cloudinary.com/navy-tee.jpg", "publicId": "v_navy_02" }
  ]
}
];
