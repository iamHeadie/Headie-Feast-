import jollofChicken from "@/assets/jollof-chicken.jpg";
import jollofBeef from "@/assets/jollof-beef.jpg";
import jollofTurkey from "@/assets/jollof rice & turkey.jpg";
import jollofEgg from "@/assets/jollof rice and egg.jpg";
import spagChicken from "@/assets/jollof spag & chicken.jpg";
import spagBeef from "@/assets/jollof spag & beef.jpg";
import spagTurkey from "@/assets/spaghetti & turkey.jpg";
import spagEgg from "@/assets/spaghetti & egg.jpg";
import riceBeansChicken from "@/assets/rice and beans with chicken.jpg";
import riceBeansBeef from "@/assets/rice and beans with beef.jpg";
import riceBeansEgg from "@/assets/rice and beans with egg.jpg";
import riceBeansTurkey from "@/assets/rice and beans with turkey.jpg";
import macChicken from "@/assets/Maccaroni with chicken.jpg";
import macBeef from "@/assets/Maccaroni with beef.jpg";
import macEgg from "@/assets/Maccaroni with egg.jpg";
import macTurkey from "@/assets/Maccaroni with turkey.jpg";

// Unsplash URLs for menu items without local images
const burger =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80";
const sushi =
  "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80";
const pasta =
  "https://images.unsplash.com/photo-1551183053-bf91798d42ba?w=400&q=80";
const dessert =
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80";
const poke =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
const shawarma =
  "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=80";
const padthai =
  "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80";
const friedPlantain =
  "https://images.unsplash.com/photo-1560717845-968823efbee1?w=400&q=80";
const moiMoi =
  "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=400&q=80";
const boiledEgg =
  "https://images.unsplash.com/photo-1499202376083-e6ad66e7e2d8?w=400&q=80";
const sausageImg =
  "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&q=80";

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurant: string;
  rating: number;
  prepTime: string;
  tags: string[];
}

export interface Collection {
  id: string;
  title: string;
  emoji: string;
  description: string;
  restaurants: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  categories: string[];
  location: string;
  logo?: string;
}

export const restaurants: Restaurant[] = [
  {
    id: "choplife-kitchen",
    name: "Choplife Kitchen",
    categories: ["Jollof Rice", "Spaghetti", "Macaroni", "Grills", "Extras"],
    location: "Malete",
    logo: "/choplife-logo.svg",
  },
];

export const allItems: FoodItem[] = [
  // ── CHOPLIFE KITCHEN — JOLLOF RICE ──────────────────────────────────────
  {
    id: "ck-1a",
    name: "Jollof Rice with Chicken (Small Plate)",
    description:
      "Smoky party jollof rice served with a grilled chicken quarter — cooked to perfection, small plate",
    price: 2800,
    image: jollofChicken,
    restaurant: "Choplife Kitchen",
    rating: 4.8,
    prepTime: "20 min",
    tags: ["Jollof Rice", "Main Meal", "Nigerian", "Chicken"],
  },
  {
    id: "ck-1b",
    name: "Jollof Rice with Chicken (Big Plate)",
    description:
      "Smoky party jollof rice loaded with extra protein — a generous grilled chicken piece and golden dodo piled high for the real hunger",
    price: 3800,
    image: jollofChicken,
    restaurant: "Choplife Kitchen",
    rating: 4.9,
    prepTime: "20 min",
    tags: ["Jollof Rice", "Main Meal", "Nigerian", "Chicken"],
  },
  {
    id: "ck-1c",
    name: "Jollof Rice with Beef (Small Plate)",
    description:
      "Classic smoky jollof rice loaded with tender seasoned beef chunks — small plate, full flavour",
    price: 2800,
    image: jollofBeef,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Jollof Rice", "Main Meal", "Nigerian", "Beef"],
  },
  {
    id: "ck-1d",
    name: "Jollof Rice with Beef (Big Plate)",
    description:
      "Smoky party jollof piled high with rich, juicy beef chunks — larger portions, extra protein, the big plate experience",
    price: 3800,
    image: jollofBeef,
    restaurant: "Choplife Kitchen",
    rating: 4.8,
    prepTime: "20 min",
    tags: ["Jollof Rice", "Main Meal", "Nigerian", "Beef"],
  },
  {
    id: "ck-1e",
    name: "Jollof Rice with Turkey (Small Plate)",
    description:
      "Smoky jollof rice with tender, well-seasoned turkey — small plate, big flavour",
    price: 4500,
    image: jollofTurkey,
    restaurant: "Choplife Kitchen",
    rating: 4.8,
    prepTime: "25 min",
    tags: ["Jollof Rice", "Main Meal", "Nigerian", "Turkey"],
  },
  {
    id: "ck-1f",
    name: "Jollof Rice with Turkey (Big Plate)",
    description:
      "Premium smoky jollof loaded with succulent turkey — larger portions and extra protein for the big plate experience",
    price: 5000,
    image: jollofTurkey,
    restaurant: "Choplife Kitchen",
    rating: 4.9,
    prepTime: "25 min",
    tags: ["Jollof Rice", "Main Meal", "Nigerian", "Turkey", "Premium"],
  },
  {
    id: "ck-1g",
    name: "Jollof Rice with Egg (Small Plate)",
    description:
      "Smoky party jollof rice paired with a perfectly cooked egg — a simple, satisfying small plate",
    price: 2000,
    image: jollofEgg,
    restaurant: "Choplife Kitchen",
    rating: 4.5,
    prepTime: "15 min",
    tags: ["Jollof Rice", "Main Meal", "Nigerian", "Egg"],
  },
  {
    id: "ck-1h",
    name: "Jollof Rice with Egg (Big Plate)",
    description:
      "Generous smoky jollof rice topped with a rich egg — bigger portions for a hearty, comforting big plate",
    price: 2800,
    image: jollofEgg,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "15 min",
    tags: ["Jollof Rice", "Main Meal", "Nigerian", "Egg"],
  },
  // ── CHOPLIFE KITCHEN — SPAGHETTI ────────────────────────────────────────
  {
    id: "ck-5a",
    name: "Spaghetti with Chicken (Small Plate)",
    description:
      "Rich stir-fried Nigerian spaghetti tossed in a smoky tomato base with grilled chicken — Choplife style small plate",
    price: 2800,
    image: spagChicken,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "20 min",
    tags: ["Spaghetti", "Main Meal", "Nigerian", "Chicken"],
  },
  {
    id: "ck-5b",
    name: "Spaghetti with Chicken (Big Plate)",
    description:
      "Rich stir-fried Nigerian spaghetti with extra grilled chicken — larger portions for the real Choplife experience",
    price: 3800,
    image: spagChicken,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Spaghetti", "Main Meal", "Nigerian", "Chicken"],
  },
  {
    id: "ck-5c",
    name: "Spaghetti with Beef (Small Plate)",
    description:
      "Stir-fried Nigerian spaghetti in a smoky tomato-pepper base with juicy beef chunks — small plate",
    price: 2800,
    image: spagBeef,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "20 min",
    tags: ["Spaghetti", "Main Meal", "Nigerian", "Beef"],
  },
  {
    id: "ck-5d",
    name: "Spaghetti with Beef (Big Plate)",
    description:
      "Choplife spaghetti piled high with extra protein — generous beef chunks in a rich smoky tomato base, big plate",
    price: 3800,
    image: spagBeef,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Spaghetti", "Main Meal", "Nigerian", "Beef"],
  },
  {
    id: "ck-5e",
    name: "Spaghetti with Turkey (Small Plate)",
    description:
      "Rich stir-fried Nigerian spaghetti with juicy turkey in a smoky tomato base — small plate",
    price: 4500,
    image: spagTurkey,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Spaghetti", "Main Meal", "Nigerian", "Turkey"],
  },
  {
    id: "ck-5f",
    name: "Spaghetti with Turkey (Big Plate)",
    description:
      "Choplife-style stir-fried spaghetti packed with extra protein — succulent turkey and a rich tomato base in larger portions",
    price: 5000,
    image: spagTurkey,
    restaurant: "Choplife Kitchen",
    rating: 4.8,
    prepTime: "20 min",
    tags: ["Spaghetti", "Main Meal", "Nigerian", "Turkey"],
  },
  {
    id: "ck-5g",
    name: "Spaghetti with Egg (Small Plate)",
    description:
      "Nigerian stir-fried spaghetti in a smoky tomato-pepper base, crowned with a perfectly cooked egg — small plate",
    price: 2000,
    image: spagEgg,
    restaurant: "Choplife Kitchen",
    rating: 4.5,
    prepTime: "15 min",
    tags: ["Spaghetti", "Main Meal", "Nigerian", "Egg"],
  },
  {
    id: "ck-5h",
    name: "Spaghetti with Egg (Big Plate)",
    description:
      "Generous Choplife stir-fried spaghetti with a rich egg on top — bigger portions, full flavour, big plate",
    price: 2800,
    image: spagEgg,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "15 min",
    tags: ["Spaghetti", "Main Meal", "Nigerian", "Egg"],
  },
  // ── CHOPLIFE KITCHEN — MACARONI ─────────────────────────────────────────
  {
    id: "ck-11a",
    name: "Macaroni with Chicken (Small Plate)",
    description:
      "Nigerian-style stir-fried macaroni in a rich tomato-pepper sauce with a juicy grilled chicken piece — Choplife style, small plate",
    price: 2800,
    image: macChicken,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "20 min",
    tags: ["Macaroni", "Main Meal", "Nigerian", "Chicken"],
  },
  {
    id: "ck-11b",
    name: "Macaroni with Chicken (Big Plate)",
    description:
      "Rich stir-fried Nigerian macaroni with extra grilled chicken in a smoky tomato-pepper base — bigger portions, full flavour, big plate",
    price: 3800,
    image: macChicken,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Macaroni", "Main Meal", "Nigerian", "Chicken"],
  },
  {
    id: "ck-11c",
    name: "Macaroni with Beef (Small Plate)",
    description:
      "Stir-fried Nigerian macaroni in a smoky tomato-pepper base with tender, seasoned beef chunks — small plate",
    price: 2800,
    image: macBeef,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "20 min",
    tags: ["Macaroni", "Main Meal", "Nigerian", "Beef"],
  },
  {
    id: "ck-11d",
    name: "Macaroni with Beef (Big Plate)",
    description:
      "Choplife macaroni loaded with extra protein — juicy beef chunks in a rich smoky tomato-pepper sauce, big plate",
    price: 3800,
    image: macBeef,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Macaroni", "Main Meal", "Nigerian", "Beef"],
  },
  {
    id: "ck-11e",
    name: "Macaroni with Egg (Small Plate)",
    description:
      "Nigerian stir-fried macaroni in a smoky tomato-pepper base, crowned with a perfectly cooked egg — simple and satisfying, small plate",
    price: 2000,
    image: macEgg,
    restaurant: "Choplife Kitchen",
    rating: 4.5,
    prepTime: "15 min",
    tags: ["Macaroni", "Main Meal", "Nigerian", "Egg"],
  },
  {
    id: "ck-11f",
    name: "Macaroni with Egg (Big Plate)",
    description:
      "Generous Choplife stir-fried macaroni with a rich egg on top — bigger portions, full flavour, big plate",
    price: 2800,
    image: macEgg,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "15 min",
    tags: ["Macaroni", "Main Meal", "Nigerian", "Egg"],
  },
  {
    id: "ck-11g",
    name: "Macaroni with Turkey (Small Plate)",
    description:
      "Nigerian-style stir-fried macaroni with a rich tomato-pepper sauce and succulent turkey pieces — small plate",
    price: 4500,
    image: macTurkey,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Macaroni", "Main Meal", "Nigerian", "Turkey"],
  },
  {
    id: "ck-11h",
    name: "Macaroni with Turkey (Big Plate)",
    description:
      "Nigerian-style stir-fried macaroni loaded with extra protein — generous turkey portions in a rich tomato-pepper sauce, big plate",
    price: 5000,
    image: macTurkey,
    restaurant: "Choplife Kitchen",
    rating: 4.8,
    prepTime: "20 min",
    tags: ["Macaroni", "Main Meal", "Nigerian", "Turkey"],
  },
  // ── CHOPLIFE KITCHEN — RICE & BEANS ─────────────────────────────────────
  {
    id: "ck-12a",
    name: "Rice and Beans with Chicken (Small Plate)",
    description:
      "Classic Nigerian one-pot rice and beans paired with a juicy grilled chicken piece — comforting, filling, small plate",
    price: 2800,
    image: riceBeansChicken,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "20 min",
    tags: ["Rice & Beans", "Main Meal", "Nigerian", "Chicken"],
  },
  {
    id: "ck-12b",
    name: "Rice and Beans with Chicken (Big Plate)",
    description:
      "Hearty Nigerian rice and beans loaded with extra grilled chicken — a generous big plate for real hunger",
    price: 3800,
    image: riceBeansChicken,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Rice & Beans", "Main Meal", "Nigerian", "Chicken"],
  },
  {
    id: "ck-12c",
    name: "Rice and Beans with Beef (Small Plate)",
    description:
      "Classic Nigerian one-pot rice and beans with tender seasoned beef chunks — full of flavour, small plate",
    price: 2800,
    image: riceBeansBeef,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "20 min",
    tags: ["Rice & Beans", "Main Meal", "Nigerian", "Beef"],
  },
  {
    id: "ck-12d",
    name: "Rice and Beans with Beef (Big Plate)",
    description:
      "Hearty Nigerian rice and beans piled high with juicy beef chunks — bigger portions, extra protein, big plate",
    price: 3800,
    image: riceBeansBeef,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Rice & Beans", "Main Meal", "Nigerian", "Beef"],
  },
  {
    id: "ck-12e",
    name: "Rice and Beans with Egg (Small Plate)",
    description:
      "Classic Nigerian one-pot rice and beans topped with a perfectly cooked egg — simple, satisfying, small plate",
    price: 2000,
    image: riceBeansEgg,
    restaurant: "Choplife Kitchen",
    rating: 4.5,
    prepTime: "15 min",
    tags: ["Rice & Beans", "Main Meal", "Nigerian", "Egg"],
  },
  {
    id: "ck-12f",
    name: "Rice and Beans with Egg (Big Plate)",
    description:
      "Generous Nigerian rice and beans with a rich egg on top — bigger portions for a comforting big plate",
    price: 2800,
    image: riceBeansEgg,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "15 min",
    tags: ["Rice & Beans", "Main Meal", "Nigerian", "Egg"],
  },
  {
    id: "ck-12g",
    name: "Rice and Beans with Turkey (Small Plate)",
    description:
      "Hearty Nigerian one-pot rice and beans with well-seasoned, succulent turkey — premium flavour in a small plate",
    price: 4500,
    image: riceBeansTurkey,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "25 min",
    tags: ["Rice & Beans", "Main Meal", "Nigerian", "Turkey"],
  },
  {
    id: "ck-12h",
    name: "Rice and Beans with Turkey (Big Plate)",
    description:
      "Premium Nigerian rice and beans loaded with extra succulent turkey — generous portions for the ultimate big plate experience",
    price: 5000,
    image: riceBeansTurkey,
    restaurant: "Choplife Kitchen",
    rating: 4.8,
    prepTime: "25 min",
    tags: ["Rice & Beans", "Main Meal", "Nigerian", "Turkey", "Premium"],
  },
  // ── CHOPLIFE KITCHEN — GRILLS / SHAWARMA ────────────────────────────────
  {
    id: "ck-6",
    name: "Shawarma — Single Sausage",
    description:
      "Perfectly wrapped shawarma with one sausage, grilled chicken, veggies & sauce",
    price: 2500,
    image: shawarma,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "10 min",
    tags: ["Shawarma", "Main Meal", "Grills", "Sausage"],
  },
  {
    id: "ck-7",
    name: "Shawarma — Double Sausage",
    description:
      "Loaded shawarma with two sausages, grilled chicken, veggies & secret sauce",
    price: 3000,
    image: shawarma,
    restaurant: "Choplife Kitchen",
    rating: 4.8,
    prepTime: "10 min",
    tags: ["Shawarma", "Main Meal", "Grills", "Sausage"],
  },
  // ── CHOPLIFE KITCHEN — EXTRAS ────────────────────────────────────────────
  {
    id: "ck-8",
    name: "Moi-Moi",
    description:
      "Steamed bean pudding seasoned the Choplife way — a classic Nigerian side",
    price: 1000,
    image: moiMoi,
    restaurant: "Choplife Kitchen",
    rating: 4.5,
    prepTime: "5 min",
    tags: ["Extra", "Nigerian", "Side", "Moi-Moi"],
  },
  {
    id: "ck-9",
    name: "Fried Plantain (Dodo)",
    description:
      "Golden crispy dodo — the perfect sweet side to any Choplife plate",
    price: 200,
    image: friedPlantain,
    restaurant: "Choplife Kitchen",
    rating: 4.4,
    prepTime: "5 min",
    tags: ["Extra", "Nigerian", "Side", "Plantain"],
  },
  {
    id: "ck-10",
    name: "Egg",
    description:
      "Boiled or fried egg to add that extra protein punch to your meal",
    price: 300,
    image: boiledEgg,
    restaurant: "Choplife Kitchen",
    rating: 4.3,
    prepTime: "5 min",
    tags: ["Extra", "Protein", "Side"],
  },
  {
    id: "ck-13",
    name: "Sausage (Extra)",
    description:
      "Juicy grilled sausage to add extra protein to your main meal",
    price: 500,
    image: sausageImg,
    restaurant: "Choplife Kitchen",
    rating: 4.4,
    prepTime: "5 min",
    tags: ["Extra", "Protein", "Sausage", "Side"],
  },
  // ── OTHER RESTAURANTS ────────────────────────────────────────────────────
  {
    id: "1",
    name: "Party Jollof Rice",
    description: "The legendary smoky party jollof with grilled chicken & dodo",
    price: 4500,
    image: jollofChicken,
    restaurant: "Mama's Kitchen",
    rating: 4.9,
    prepTime: "25 min",
    tags: ["Nigerian", "Rice", "Spicy"],
  },
  {
    id: "2",
    name: "The Big Stack",
    description:
      "Double smash patty, melted cheddar, special sauce, brioche bun",
    price: 5200,
    image: burger,
    restaurant: "Burger Republic",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["American", "Burger"],
  },
  {
    id: "3",
    name: "Salmon Love Platter",
    description:
      "Fresh salmon nigiri & maki rolls with wasabi and pickled ginger",
    price: 8900,
    image: sushi,
    restaurant: "Tokyo Bites",
    rating: 4.8,
    prepTime: "15 min",
    tags: ["Japanese", "Sushi", "Premium"],
  },
  {
    id: "4",
    name: "Creamy Carbonara",
    description:
      "Al dente spaghetti, pecorino, guanciale, cracked black pepper",
    price: 6200,
    image: pasta,
    restaurant: "Pasta La Vista",
    rating: 4.6,
    prepTime: "18 min",
    tags: ["Italian", "Pasta"],
  },
  {
    id: "5",
    name: "Molten Lava Cake",
    description:
      "Dark chocolate fondant with a gooey center & vanilla bean gelato",
    price: 3800,
    image: dessert,
    restaurant: "Sweet Surrender",
    rating: 4.9,
    prepTime: "12 min",
    tags: ["Dessert", "Chocolate"],
  },
  {
    id: "6",
    name: "Aloha Poké Bowl",
    description:
      "Fresh salmon, avocado, edamame, crispy shallots over sushi rice",
    price: 5800,
    image: poke,
    restaurant: "Bowl'd Over",
    rating: 4.5,
    prepTime: "10 min",
    tags: ["Hawaiian", "Healthy", "Bowl"],
  },
  {
    id: "7",
    name: "Loaded Shawarma",
    description:
      "Grilled chicken shawarma with garlic toum, pickles & fries inside",
    price: 3500,
    image: shawarma,
    restaurant: "Shawarma Republic",
    rating: 4.7,
    prepTime: "15 min",
    tags: ["Middle Eastern", "Wrap"],
  },
  {
    id: "8",
    name: "Prawn Pad Thai",
    description:
      "Wok-tossed rice noodles with tiger prawns, peanuts & lime",
    price: 5500,
    image: padthai,
    restaurant: "Bangkok Street",
    rating: 4.6,
    prepTime: "20 min",
    tags: ["Thai", "Noodles", "Spicy"],
  },
];

export const collections: Collection[] = [
  {
    id: "late-night",
    title: "Late Night Cravings",
    emoji: "🌙",
    description: "When your stomach growls at midnight",
    restaurants: [
      "Choplife Kitchen",
      "Malete Kitchen",
      "Gate 1 Amala",
      "Grill House 24/7",
      "Wrap City",
    ],
  },
  {
    id: "jollof-my-heart",
    title: "Jollof My Heart",
    emoji: "🇳🇬",
    description: "The best jollof joints your city has to offer",
    restaurants: [
      "Choplife Kitchen",
      "Mama's Kitchen",
      "Party Jollof HQ",
      "Jollof Express",
      "Auntie Bisi's",
    ],
  },
  {
    id: "hidden-gems",
    title: "Hidden Gems",
    emoji: "💎",
    description: "Places only the cool kids know about",
    restaurants: [
      "The Corner Spot",
      "Buka Underground",
      "Aunty Ngozi's",
      "Off-Road Kitchen",
      "Secret Garden Bites",
    ],
  },
  {
    id: "treat-yourself",
    title: "Treat Yourself",
    emoji: "💖",
    description: "Because you deserve it, bestie",
    restaurants: [
      "Patisserie Lagos",
      "Sweet Surrender",
      "The Dessert Bar",
      "Chocolat Royal",
      "Gelato & Co.",
    ],
  },
];

export const trackingSteps = [
  {
    id: 1,
    title: "Order received!",
    subtitle: "We told the kitchen. They're excited 🎉",
    completed: true,
  },
  {
    id: 2,
    title: "The Chef is perfecting your meal",
    subtitle: "Magic is happening in the kitchen ✨",
    completed: true,
  },
  {
    id: 3,
    title: "Your Chop Gee driver picked it up!",
    subtitle: "They're guarding your food with their life 🦸",
    completed: true,
  },
  {
    id: 4,
    title: "Almost there!",
    subtitle: "Your Chop Gee driver is 2 minutes away 🏃‍♂️",
    completed: false,
  },
  {
    id: 5,
    title: "Delivered! Enjoy!",
    subtitle: "Time to feast! Don't forget to rate 😋",
    completed: false,
  },
];
