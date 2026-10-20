import { weekNumber } from "./dates";
import { WEEKDAYS, type Dish, type WeekMenu } from "./types";

export const MAIN_DISHES: Dish[] = [
  { id: "m-chicken-stew", name: "Chicken stew with root vegetables", description: "Slow-cooked chicken thighs with carrots, celeriac and thyme, served with rice.", allergens: ["celery", "milk"], labels: ["halal", "glutenFree"], hue: 32, no: { name: "Kyllinggryte med rotgrønnsaker", description: "Langtidskokte kyllinglår med gulrot, sellerirot og timian, servert med ris." } },
  { id: "m-baked-cod", name: "Baked cod with butter sauce", description: "Oven-baked cod loin, boiled potatoes, butter sauce and seasonal greens.", allergens: ["fish", "milk"], labels: ["glutenFree"], hue: 200, no: { name: "Ovnsbakt torsk med smørsaus", description: "Ovnsbakt torskeloin, kokte poteter, smørsaus og sesongens grønnsaker." } },
  { id: "m-meatballs", name: "Homemade meatballs", description: "Beef and pork meatballs with mashed potatoes, brown sauce and lingonberries.", allergens: ["gluten", "eggs", "milk", "celery"], labels: [], hue: 18, no: { name: "Hjemmelagde kjøttkaker", description: "Kjøttkaker av storfe og svin med potetmos, brun saus og tyttebær." } },
  { id: "m-salmon", name: "Oven-roasted salmon", description: "Salmon fillet with dill potatoes, cucumber salad and sour cream.", allergens: ["fish", "milk"], labels: ["glutenFree"], hue: 12, no: { name: "Ovnsbakt laks", description: "Laksefilet med dillpoteter, agurksalat og rømme." } },
  { id: "m-lasagne", name: "Beef lasagne", description: "Classic lasagne with béchamel, served with a green salad.", allergens: ["gluten", "milk", "eggs", "celery"], labels: [], hue: 8, no: { name: "Lasagne med kjøttsaus", description: "Klassisk lasagne med béchamel, servert med grønn salat." } },
  { id: "m-fish-soup", name: "Creamy west coast fish soup", description: "Fish soup with cod, salmon, shrimp and root vegetables, with bread.", allergens: ["fish", "crustaceans", "milk", "celery", "gluten"], labels: [], hue: 45, no: { name: "Kremet vestlandsk fiskesuppe", description: "Fiskesuppe med torsk, laks, reker og rotgrønnsaker, med brød." } },
  { id: "m-lamb-cabbage", name: "Lamb and cabbage stew", description: "Traditional lamb and cabbage stew with whole black pepper and potatoes.", allergens: ["gluten"], labels: ["lactoseFree"], hue: 90, no: { name: "Fårikål", description: "Tradisjonell fårikål med hel sort pepper og poteter." } },
  { id: "m-chicken-curry", name: "Mild chicken curry", description: "Chicken in a mild coconut curry with basmati rice and raita.", allergens: ["milk", "mustard"], labels: ["halal", "glutenFree"], hue: 40, no: { name: "Mild kyllingcurry", description: "Kylling i mild kokoscurry med basmatiris og raita." } },
  { id: "m-pork-belly", name: "Crispy pork belly", description: "Pork belly with sauerkraut, potatoes and gravy.", allergens: ["gluten", "milk", "celery"], labels: [], hue: 25, no: { name: "Sprøstekt svinesideflesk", description: "Sideflesk med surkål, poteter og saus." } },
  { id: "m-teriyaki-salmon", name: "Teriyaki salmon bowl", description: "Glazed salmon with rice, edamame, pickled vegetables and sesame.", allergens: ["fish", "soy", "sesame", "gluten"], labels: ["lactoseFree"], hue: 15, no: { name: "Teriyakilaks i bolle", description: "Glasert laks med ris, edamame, syltede grønnsaker og sesam." } },
  { id: "m-reindeer", name: "Reindeer stew", description: "Thinly sliced reindeer in a creamy sauce with mashed potatoes and lingonberries.", allergens: ["milk"], labels: ["glutenFree"], hue: 350, no: { name: "Finnbiff", description: "Tynnskåret reinsdyr i kremet saus med potetmos og tyttebær." } },
  { id: "m-chili", name: "Chili con carne", description: "Beef and bean chili with rice, lime and coriander.", allergens: ["celery"], labels: ["glutenFree", "lactoseFree"], hue: 5, no: { name: "Chili con carne", description: "Chili med storfekjøtt og bønner, med ris, lime og koriander." } },
  { id: "m-fishcakes", name: "Fishcakes with root mash", description: "Pan-fried fishcakes with carrot and swede mash and remoulade.", allergens: ["fish", "eggs", "milk", "gluten", "mustard"], labels: [], hue: 55, no: { name: "Fiskekaker med rotmos", description: "Stekte fiskekaker med kålrabistappe og remulade." } },
  { id: "m-beef-salad", name: "Thai beef salad", description: "Seared beef, noodles, herbs, crunchy vegetables and peanut dressing.", allergens: ["soy", "sesame", "peanuts"], labels: ["lactoseFree"], hue: 120, no: { name: "Thaisalat med biff", description: "Stekt biff, nudler, urter, sprø grønnsaker og peanøttdressing." } },
  { id: "m-chicken-wrap", name: "Grilled chicken wraps", description: "Tortilla wraps with grilled chicken, salsa, cheese and salad.", allergens: ["gluten", "milk"], labels: ["halal"], hue: 60, no: { name: "Grillede kyllingwraps", description: "Tortillawraps med grillet kylling, salsa, ost og salat." } },
];

export const VEG_DISHES: Dish[] = [
  { id: "v-veg-stew", name: "Vegetable and chickpea stew", description: "Hearty stew with chickpeas, root vegetables and tomato, with rice.", allergens: ["celery"], labels: ["vegetarian", "vegan", "glutenFree", "lactoseFree"], hue: 80, no: { name: "Grønnsaksgryte med kikerter", description: "Fyldig gryte med kikerter, rotgrønnsaker og tomat, med ris." } },
  { id: "v-dal", name: "Red lentil dal", description: "Spiced lentil dal with rice, naan and yoghurt.", allergens: ["gluten", "milk"], labels: ["vegetarian"], hue: 38, no: { name: "Rød linsedal", description: "Krydret linsedal med ris, naan og yoghurt." } },
  { id: "v-halloumi", name: "Halloumi and roasted vegetable salad", description: "Grilled halloumi, roasted squash, quinoa and herb dressing.", allergens: ["milk"], labels: ["vegetarian", "glutenFree"], hue: 100, no: { name: "Halloumi med ovnsbakte grønnsaker", description: "Grillet halloumi, ovnsbakt gresskar, quinoa og urtedressing." } },
  { id: "v-risotto", name: "Mushroom risotto", description: "Creamy risotto with forest mushrooms and parmesan.", allergens: ["milk", "celery"], labels: ["vegetarian", "glutenFree"], hue: 30, no: { name: "Soppisotto", description: "Kremet risotto med skogsopp og parmesan." } },
  { id: "v-falafel", name: "Falafel bowl with hummus", description: "Falafel, hummus, pickled red onion, salad and flatbread.", allergens: ["sesame", "gluten"], labels: ["vegetarian", "vegan", "lactoseFree"], hue: 70, no: { name: "Falafelbolle med hummus", description: "Falafel, hummus, syltet rødløk, salat og flatbrød." } },
  { id: "v-veg-lasagne", name: "Vegetable lasagne", description: "Lasagne with spinach, courgette, ricotta and tomato.", allergens: ["gluten", "milk", "eggs"], labels: ["vegetarian"], hue: 10, no: { name: "Grønnsakslasagne", description: "Lasagne med spinat, squash, ricotta og tomat." } },
  { id: "v-bean-chili", name: "Three-bean chili", description: "Bean chili with sweet potato, rice and avocado salsa.", allergens: ["celery"], labels: ["vegetarian", "vegan", "glutenFree", "lactoseFree"], hue: 20, no: { name: "Bønnechili", description: "Chili med tre slags bønner, søtpotet, ris og avokadosalsa." } },
  { id: "v-spinach-pie", name: "Spinach and feta pie", description: "Flaky pie with spinach and feta, with a tomato salad.", allergens: ["gluten", "eggs", "milk"], labels: ["vegetarian"], hue: 110, no: { name: "Pai med spinat og feta", description: "Sprø pai med spinat og feta, med tomatsalat." } },
  { id: "v-tofu", name: "Tofu teriyaki bowl", description: "Glazed tofu with rice, edamame, pickled vegetables and sesame.", allergens: ["soy", "sesame", "gluten"], labels: ["vegetarian", "vegan", "lactoseFree"], hue: 150, no: { name: "Teriyakitofu i bolle", description: "Glasert tofu med ris, edamame, syltede grønnsaker og sesam." } },
  { id: "v-root-soup", name: "Root vegetable soup", description: "Smooth soup of roasted root vegetables, served with sourdough bread.", allergens: ["gluten", "celery"], labels: ["vegetarian", "vegan", "lactoseFree"], hue: 48, no: { name: "Rotgrønnsakssuppe", description: "Glatt suppe av ovnsbakte rotgrønnsaker, servert med surdeigsbrød." } },
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
