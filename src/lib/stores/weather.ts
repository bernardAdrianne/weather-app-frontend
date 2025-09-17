// src/lib/stores/weather.ts
import { writable } from "svelte/store";

export const query = writable("");
export const weatherData = writable<any>(null);
export const errorMessage = writable("");
