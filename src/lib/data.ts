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
  items: FoodItem[];
}

export const allItems: FoodItem[] = [
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
    items: [allItems[1], allItems[6], allItems[4]],
  },
  {
    id: "hidden-gems",
    title: "Hidden Gems",
    emoji: "💎",
    description: "Places only the cool kids know about",
    items: [allItems[0], allItems[5], allItems[7]],
  },
  {
    id: "jollof-map",
    title: "The Jollof Map",
    emoji: "🍚",
    description: "Your guide to the best jollof in town",
    items: [allItems[0], allItems[6]],
  },
  {
    id: "treat-yourself",
    title: "Treat Yourself",
    emoji: "✨",
    description: "Because you deserve it, bestie",
    items: [allItems[2], allItems[3], allItems[4]],
  },
];

export const trackingSteps = [
  { id: 1, title: "Order received!", subtitle: "We told the kitchen. They're excited 🎉", completed: true },
  { id: 2, title: "The Chef is perfecting your meal", subtitle: "Magic is happening in the kitchen ✨", completed: true },
  { id: 3, title: "Your Headie Hero picked it up!", subtitle: "They're guarding your food with their life 🦸", completed: true },
  { id: 4, title: "Almost there!", subtitle: "Your Headie Hero is 2 minutes away 🏃‍♂️", completed: false },
  { id: 5, title: "Delivered! Enjoy!", subtitle: "Time to feast! Don't forget to rate 😋", completed: false },
];
