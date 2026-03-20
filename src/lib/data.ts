import jollof from "@/assets/jollof.jpg";
import burger from "@/assets/burger.jpg";
import sushi from "@/assets/sushi.jpg";
import pasta from "@/assets/pasta.jpg";
import dessert from "@/assets/dessert.jpg";
import poke from "@/assets/poke.jpg";
import shawarma from "@/assets/shawarma.jpg";
import padthai from "@/assets/padthai.jpg";

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
}

export const restaurants: Restaurant[] = [
  {
    id: "choplife-kitchen",
    name: "Choplife Kitchen",
    categories: ["Jollof Rice", "Spaghetti", "Swallows", "Grills"],
    location: "Malete",
  },
];

export const allItems: FoodItem[] = [
  {
    id: "ck-1",
    name: "Jollof Rice with Chicken/Beef (Big)",
    description: "Smoky party jollof rice served with your choice of grilled chicken or beef — big plate to satisfy the real hunger",
    price: 3300,
    image: jollof,
    restaurant: "Choplife Kitchen",
    rating: 4.8,
    prepTime: "20 min",
    tags: ["Nigerian", "Rice", "Chicken", "Beef"],
  },
  {
    id: "ck-2",
    name: "Jollof Rice with Chicken/Beef (Small)",
    description: "Classic smoky jollof rice with grilled chicken or beef — perfect small plate",
    price: 2800,
    image: jollof,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Nigerian", "Rice", "Chicken", "Beef"],
  },
  {
    id: "ck-3",
    name: "Jollof Rice with Turkey (Big)",
    description: "Premium smoky jollof loaded with succulent turkey — the big plate experience",
    price: 5000,
    image: jollof,
    restaurant: "Choplife Kitchen",
    rating: 4.9,
    prepTime: "25 min",
    tags: ["Nigerian", "Rice", "Turkey", "Premium"],
  },
  {
    id: "ck-4",
    name: "Jollof Rice with Turkey (Small)",
    description: "Smoky jollof rice with tender turkey — small plate, big flavour",
    price: 4500,
    image: jollof,
    restaurant: "Choplife Kitchen",
    rating: 4.8,
    prepTime: "25 min",
    tags: ["Nigerian", "Rice", "Turkey"],
  },
  {
    id: "ck-5",
    name: "Spaghetti with Turkey (Big)",
    description: "Rich seasoned spaghetti tossed with juicy turkey — Choplife style big plate",
    price: 5000,
    image: pasta,
    restaurant: "Choplife Kitchen",
    rating: 4.7,
    prepTime: "20 min",
    tags: ["Spaghetti", "Turkey", "Nigerian"],
  },
  {
    id: "ck-6",
    name: "Shawarma — Single Sausage",
    description: "Perfectly wrapped shawarma with one sausage, grilled chicken, veggies & sauce",
    price: 2500,
    image: shawarma,
    restaurant: "Choplife Kitchen",
    rating: 4.6,
    prepTime: "10 min",
    tags: ["Shawarma", "Sausage", "Grills"],
  },
  {
    id: "ck-7",
    name: "Shawarma — Double Sausage",
    description: "Loaded shawarma with two sausages, grilled chicken, veggies & secret sauce",
    price: 3000,
    image: shawarma,
    restaurant: "Choplife Kitchen",
    rating: 4.8,
    prepTime: "10 min",
    tags: ["Shawarma", "Sausage", "Grills"],
  },
  {
    id: "ck-8",
    name: "Moi-Moi",
    description: "Steamed bean pudding seasoned the Choplife way — a classic Nigerian side",
    price: 1000,
    image: poke,
    restaurant: "Choplife Kitchen",
    rating: 4.5,
    prepTime: "5 min",
    tags: ["Nigerian", "Side", "Extra"],
  },
  {
    id: "ck-9",
    name: "Fried Plantain",
    description: "Golden crispy plantain — the perfect sweet side to any Choplife plate",
    price: 200,
    image: dessert,
    restaurant: "Choplife Kitchen",
    rating: 4.4,
    prepTime: "5 min",
    tags: ["Nigerian", "Side", "Extra"],
  },
  {
    id: "ck-10",
    name: "Egg",
    description: "Boiled or fried egg to add that extra protein punch to your meal",
    price: 300,
    image: poke,
    restaurant: "Choplife Kitchen",
    rating: 4.3,
    prepTime: "5 min",
    tags: ["Extra", "Protein", "Side"],
  },
  {
    id: "1",
    name: "Party Jollof Rice",
    description: "The legendary smoky party jollof with grilled chicken & dodo",
    price: 4500,
    image: jollof,
    restaurant: "Mama's Kitchen",
    rating: 4.9,
    prepTime: "25 min",
    tags: ["Nigerian", "Rice", "Spicy"],
  },
  {
    id: "2",
    name: "The Big Stack",
    description: "Double smash patty, melted cheddar, special sauce, brioche bun",
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
    description: "Fresh salmon nigiri & maki rolls with wasabi and pickled ginger",
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
    description: "Al dente spaghetti, pecorino, guanciale, cracked black pepper",
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
    description: "Dark chocolate fondant with a gooey center & vanilla bean gelato",
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
    description: "Fresh salmon, avocado, edamame, crispy shallots over sushi rice",
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
    description: "Grilled chicken shawarma with garlic toum, pickles & fries inside",
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
    description: "Wok-tossed rice noodles with tiger prawns, peanuts & lime",
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
    restaurants: ["Choplife Kitchen", "Malete Kitchen", "Gate 1 Amala", "Grill House 24/7", "Wrap City"],
  },
  {
    id: "jollof-my-heart",
    title: "Jollof My Heart",
    emoji: "🇳🇬",
    description: "The best jollof joints your city has to offer",
    restaurants: ["Choplife Kitchen", "Mama's Kitchen", "Party Jollof HQ", "Jollof Express", "Auntie Bisi's"],
  },
  {
    id: "hidden-gems",
    title: "Hidden Gems",
    emoji: "💎",
    description: "Places only the cool kids know about",
    restaurants: ["The Corner Spot", "Buka Underground", "Aunty Ngozi's", "Off-Road Kitchen", "Secret Garden Bites"],
  },
  {
    id: "treat-yourself",
    title: "Treat Yourself",
    emoji: "💖",
    description: "Because you deserve it, bestie",
    restaurants: ["Patisserie Lagos", "Sweet Surrender", "The Dessert Bar", "Chocolat Royal", "Gelato & Co."],
  },
];

export const trackingSteps = [
  { id: 1, title: "Order received!", subtitle: "We told the kitchen. They're excited 🎉", completed: true },
  { id: 2, title: "The Chef is perfecting your meal", subtitle: "Magic is happening in the kitchen ✨", completed: true },
  { id: 3, title: "Your Chop Gee driver picked it up!", subtitle: "They're guarding your food with their life 🦸", completed: true },
  { id: 4, title: "Almost there!", subtitle: "Your Chop Gee driver is 2 minutes away 🏃‍♂️", completed: false },
  { id: 5, title: "Delivered! Enjoy!", subtitle: "Time to feast! Don't forget to rate 😋", completed: false },
];
