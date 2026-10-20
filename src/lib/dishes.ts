import { weekNumber } from "./dates";
import { WEEKDAYS, type Dish, type WeekMenu } from "./types";

export const MAIN_DISHES: Dish[] = [
  { id: "m-chicken-stew", name: "Chicken stew with root vegetables", description: "Slow-cooked chicken thighs with carrots, celeriac and thyme, served with rice.", allergens: ["celery", "milk"], labels: ["halal", "glutenFree"], hue: 32 },
  { id: "m-baked-cod", name: "Baked cod with butter sauce", description: "Oven-baked cod loin, boiled potatoes, butter sauce and seasonal greens.", allergens: ["fish", "milk"], labels: ["glutenFree"], hue: 200 },
  { id: "m-meatballs", name: "Homemade meatballs", description: "Beef and pork meatballs with mashed potatoes, brown sauce and lingonberries.", allergens: ["gluten", "eggs", "milk", "celery"], labels: [], hue: 18 },
  { id: "m-salmon", name: "Oven-roasted salmon", description: "Salmon fillet with dill potatoes, cucumber salad and sour cream.", allergens: ["fish", "milk"], labels: ["glutenFree"], hue: 12 },
  { id: "m-lasagne", name: "Beef lasagne", description: "Classic lasagne with béchamel, served with a green salad.", allergens: ["gluten", "milk", "eggs", "celery"], labels: [], hue: 8 },
  { id: "m-fish-soup", name: "Creamy west coast fish soup", description: "Fish soup with cod, salmon, shrimp and root vegetables, with bread.", allergens: ["fish", "crustaceans", "milk", "celery", "gluten"], labels: [], hue: 45 },
  { id: "m-lamb-cabbage", name: "Lamb and cabbage stew", description: "Traditional lamb and cabbage stew with whole black pepper and potatoes.", allergens: ["gluten"], labels: ["lactoseFree"], hue: 90 },
  { id: "m-chicken-curry", name: "Mild chicken curry", description: "Chicken in a mild coconut curry with basmati rice and raita.", allergens: ["milk", "mustard"], labels: ["halal", "glutenFree"], hue: 40 },
  { id: "m-pork-belly", name: "Crispy pork belly", description: "Pork belly with sauerkraut, potatoes and gravy.", allergens: ["gluten", "milk", "celery"], labels: [], hue: 25 },
  { id: "m-teriyaki-salmon", name: "Teriyaki salmon bowl", description: "Glazed salmon with rice, edamame, pickled vegetables and sesame.", allergens: ["fish", "soy", "sesame", "gluten"], labels: ["lactoseFree"], hue: 15 },
  { id: "m-reindeer", name: "Reindeer stew", description: "Thinly sliced reindeer in a creamy sauce with mashed potatoes and lingonberries.", allergens: ["milk"], labels: ["glutenFree"], hue: 350 },
  { id: "m-chili", name: "Chili con carne", description: "Beef and bean chili with rice, lime and coriander.", allergens: ["celery"], labels: ["glutenFree", "lactoseFree"], hue: 5 },
  { id: "m-fishcakes", name: "Fishcakes with root mash", description: "Pan-fried fishcakes with carrot and swede mash and remoulade.", allergens: ["fish", "eggs", "milk", "gluten", "mustard"], labels: [], hue: 55 },
  { id: "m-beef-salad", name: "Thai beef salad", description: "Seared beef, noodles, herbs, crunchy vegetables and peanut dressing.", allergens: ["soy", "sesame", "peanuts"], labels: ["lactoseFree"], hue: 120 },
  { id: "m-chicken-wrap", name: "Grilled chicken wraps", description: "Tortilla wraps with grilled chicken, salsa, cheese and salad.", allergens: ["gluten", "milk"], labels: ["halal"], hue: 60 },
];

export const VEG_DISHES: Dish[] = [
  { id: "v-veg-stew", name: "Vegetable and chickpea stew", description: "Hearty stew with chickpeas, root vegetables and tomato, with rice.", allergens: ["celery"], labels: ["vegetarian", "vegan", "glutenFree", "lactoseFree"], hue: 80 },
  { id: "v-dal", name: "Red lentil dal", description: "Spiced lentil dal with rice, naan and yoghurt.", allergens: ["gluten", "milk"], labels: ["vegetarian"], hue: 38 },
  { id: "v-halloumi", name: "Halloumi and roasted vegetable salad", description: "Grilled halloumi, roasted squash, quinoa and herb dressing.", allergens: ["milk"], labels: ["vegetarian", "glutenFree"], hue: 100 },
  { id: "v-risotto", name: "Mushroom risotto", description: "Creamy risotto with forest mushrooms and parmesan.", allergens: ["milk", "celery"], labels: ["vegetarian", "glutenFree"], hue: 30 },
  { id: "v-falafel", name: "Falafel bowl with hummus", description: "Falafel, hummus, pickled red onion, salad and flatbread.", allergens: ["sesame", "gluten"], labels: ["vegetarian", "vegan", "lactoseFree"], hue: 70 },
  { id: "v-veg-lasagne", name: "Vegetable lasagne", description: "Lasagne with spinach, courgette, ricotta and tomato.", allergens: ["gluten", "milk", "eggs"], labels: ["vegetarian"], hue: 10 },
  { id: "v-bean-chili", name: "Three-bean chili", description: "Bean chili with sweet potato, rice and avocado salsa.", allergens: ["celery"], labels: ["vegetarian", "vegan", "glutenFree", "lactoseFree"], hue: 20 },
  { id: "v-spinach-pie", name: "Spinach and feta pie", description: "Flaky pie with spinach and feta, with a tomato salad.", allergens: ["gluten", "eggs", "milk"], labels: ["vegetarian"], hue: 110 },
  { id: "v-tofu", name: "Tofu teriyaki bowl", description: "Glazed tofu with rice, edamame, pickled vegetables and sesame.", allergens: ["soy", "sesame", "gluten"], labels: ["vegetarian", "vegan", "lactoseFree"], hue: 150 },
  { id: "v-root-soup", name: "Root vegetable soup", description: "Smooth soup of roasted root vegetables, served with sourdough bread.", allergens: ["gluten", "celery"], labels: ["vegetarian", "vegan", "lactoseFree"], hue: 48 },
];

export const ALL_DISHES = [...MAIN_DISHES, ...VEG_DISHES];

/** Default menu rotation, used for any week Frænd has not edited. */
export function rotationMenu(weekStartIso: string, published: boolean): WeekMenu {
  const wk = weekNumber(weekStartIso);
  const days = {} as WeekMenu["days"];
  WEEKDAYS.forEach((wd, i) => {
    days[wd] = {
      main: MAIN_DISHES[(wk * 5 + i) % MAIN_DISHES.length],
      vegetarian: VEG_DISHES[(wk * 3 + i) % VEG_DISHES.length],
    };
  });
  return { weekStart: weekStartIso, published, days };
}
