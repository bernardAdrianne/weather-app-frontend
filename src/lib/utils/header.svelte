<script lang="ts">
  import { query, weatherData, errorMessage } from "$lib/stores/weather";
  import { fly } from "svelte/transition";
  import { get } from "svelte/store";
  import { browser } from "$app/environment";

  let showSearch = false;
  let headerColor = "rgba(255,255,255,0.4)";

  function toggleSearch() {
    showSearch = !showSearch;
  }

  async function handleSearch() {
    if (!get(query).trim()) {
      errorMessage.set("Please enter a city name");
      return;
    }

    try {
      const res = await fetch(`https://weather-app-backend-1-pe5e.onrender.com/api/weather/${get(query)}`);
      if (!res.ok) throw new Error("City not found");

      weatherData.set(await res.json());
      errorMessage.set("");
      showSearch = false;
    } catch (err: any) {
      errorMessage.set(err.message || "Failed to fetch weather data");
      weatherData.set(null);
    }
  }

  // --- Weather-based header color ---
  function mapCondition(condition: string): string {
    const lower = condition.toLowerCase();
    if (lower.includes("sun")) return "rgba(254,240,138,0.6)"; // yellow-200/60
    if (lower.includes("rain")) return "rgba(191,219,254,0.6)"; // blue-200/60
    if (lower.includes("cloud")) return "rgba(209,213,219,0.6)"; // gray-300/60
    if (lower.includes("storm")) return "rgba(196,181,253,0.6)"; // purple-300/60
    if (lower.includes("snow")) return "rgba(186,230,253,0.6)"; // sky-200/60
    return "rgba(255,255,255,0.4)";
  }

  $: if (browser && $weatherData?.current?.description) {
    headerColor = mapCondition($weatherData.current.description);
  }
</script>

<section class="flex items-center justify-between p-4 backdrop-blur-md shadow-md transition-colors duration-500"
  style="background-color: {headerColor}">
                
  <!-- Search Icon -->
  <svg
    class="w-6 h-6 text-gray-800 dark:text-black cursor-pointer transition-transform duration-300 hover:rotate-12"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    on:click={toggleSearch}
  >
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
      d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
    />
  </svg>

  <h1 class="font-bold text-xl text-black">WetheringWyou</h1>
</section>

<!-- Full-Screen Search Bar -->
{#if showSearch}
  <div
    class="fixed top-0 left-0 w-screen h-16 flex items-center px-4 z-50
          backdrop-blur-md shadow-md"
    in:fly={{ x: -500, duration: 400 }}
    out:fly={{ x: -500, duration: 400 }}
  >
    <input
      type="text"
      bind:value={$query}
      placeholder="Search eg..(Manila)"
      class="flex-1 px-4 py-2 rounded-full border border-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
      on:keydown={(e) => e.key === "Enter" && handleSearch()}
    />
    <button
      on:click={toggleSearch}
      class="ml-2 text-gray-600 dark:text-gray-300 font-bold"
    >
      ✕
    </button>
  </div>
{/if}