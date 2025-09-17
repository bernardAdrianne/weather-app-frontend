<script lang="ts">
    import { onMount } from "svelte";
    import { Sun, CloudRain, Umbrella, Wind, Droplet, Cloud, CloudLightning } from "lucide-svelte";
    import { query, weatherData, errorMessage } from "$lib/stores/weather";
    import { fade, scale } from "svelte/transition";

  let activeTab: "today" | "tomorrow" | "week" = "today";
  let todayForecast: any[] = [];
  let tomorrowForecast: any[] = [];
  let weekForecast: any[] = [];

  const gradients: Record<string, string[]> = {
    sunny: ["#bfdbfe", "#fef9c3", "#fed7aa"], 
    cloudy: ["#9ca3af", "#e5e7eb", "#9ca3af"], 
    rainy: ["#93c5fd", "#f3f4f6", "#93c5fd"], 
    stormy: ["#9ca3af", "#e5e7eb", "#9ca3af"], 
    snowy: ["#dbeafe", "#ffffff", "#e5e7eb"], 
    default: ["#c7d2fe", "#e0f2fe", "#ddd6fe"]
  };

  function mapCondition(condition: string): string {
    const lower = condition.toLowerCase();
    if (lower.includes("sun")) return "sunny";
    if (lower.includes("rain")) return "rainy";
    if (lower.includes("cloud")) return "cloudy";
    if (lower.includes("storm")) return "stormy";
    if (lower.includes("snow")) return "snowy";
    return "default";
  }

  function getWeatherIcon(condition: string) {
    const lower = condition.toLowerCase();
    if (lower.includes("sun")) return Sun;
    if (lower.includes("rain")) return CloudRain;
    if (lower.includes("storm")) return CloudLightning;
    if (lower.includes("cloud")) return Cloud;
    if (lower.includes("snow")) return Droplet;
    return Cloud;
  }

  function getWeatherColor(condition: string) {
    const lower = condition.toLowerCase();
    if (lower.includes("sun")) return "text-yellow-500";
    if (lower.includes("rain")) return "text-blue-500";
    if (lower.includes("storm")) return "text-purple-600";
    if (lower.includes("cloud")) return "text-gray-500";
    if (lower.includes("snow")) return "text-sky-300";
    return "text-gray-400";
  }

  function getDailyForecast(hourly: any[], targetDate: string) {
    return hourly
      .filter(f => f.time.startsWith(targetDate))
      .map(f => ({
        time: new Date(f.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        temp: Math.round(f.temp),
        description: f.description,
        icon: getWeatherIcon(f.description),
        color: getWeatherColor(f.description),
      }));
  }

  function getWeeklySummary(hourly: any[]) {
    const days: Record<string, any[]> = {};
    hourly.forEach(f => {
      const day = new Date(f.time).toISOString().split("T")[0];
      if (!days[day]) days[day] = [];
      days[day].push(f);
    });

    return Object.keys(days).map(day => {
      const temps = days[day].map(f => f.temp);
      const desc = days[day][0].description;
      return {
        day,
        temp: Math.round(Math.max(...temps)),
        description: desc,
        icon: getWeatherIcon(desc),
        color: getWeatherColor(desc),
      };
    });
  }

  $: if ($weatherData) {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const yyyyMMdd = (date: Date) => date.toISOString().split("T")[0];

    todayForecast = getDailyForecast($weatherData.hourly ?? [], yyyyMMdd(today));
    tomorrowForecast = getDailyForecast($weatherData.hourly ?? [], yyyyMMdd(tomorrow));
    weekForecast = getWeeklySummary($weatherData.hourly ?? []);
  }

  $: currentGradient = gradients[mapCondition($weatherData?.current?.description || "")] || gradients.default;

  onMount(() => {
  if (currentGradient.length) {
    document.documentElement.style.setProperty("--gradient-from", currentGradient[0]);
    document.documentElement.style.setProperty("--gradient-via", currentGradient[1]);
    document.documentElement.style.setProperty("--gradient-to", currentGradient[2]);
  }
});
</script>

<section class="p-6 flex flex-col min-h-screen transition-all duration-1000"
  style="background: linear-gradient(to bottom right,
    {currentGradient[0]}, 
    {currentGradient[1]}, 
    {currentGradient[2]})"
  >
  <!-- City name + Date -->
  <div class="text-left">
    <h1 class="text-5xl font-semibold text-black">{$weatherData?.city || "City"}</h1>
    <p class="text-gray-500">{new Date().toDateString()}</p>
  </div>

  <!-- Weather Section -->
  <div class="flex flex-col items-center justify-center flex-1 mt-12">
    <!-- Icon + Celsius beside each other -->
    <div class="flex items-center gap-8 relative">
  {#if $weatherData?.current?.description}
    {#key $weatherData.current.description}
      <div
        class="absolute left-0 top-1/2 -translate-y-1/2"
        in:fade={{ duration: 400 }}
        out:fade={{ duration: 400 }}
      >
        <svelte:component
          this={getWeatherIcon($weatherData.current.description)}
          class="w-20 h-20"
        />
      </div>
    {/key}
  {/if}

  <div class="flex flex-col ml-24">
    <h1 class="text-6xl font-bold text-black">
      {$weatherData?.current?.temp ?? "--"}°
    </h1>
    <h2 class="text-2xl font-semibold text-black">
      {$weatherData?.current?.description || "Loading..."}
    </h2>
  </div>
</div>

    <!-- Rectangle boxes (today's weather info) -->
    <div class="flex flex-col gap-4 mt-12">
    <div
        class="h-16 w-64 rounded-xl flex items-center justify-between px-4 text-black font-light
           bg-white/40 backdrop-blur-md shadow-md
           transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
    >
    <!-- Left: Icon + Label -->
    <div class="flex items-center gap-3">
        <Umbrella class="w-6 h-6 text-blue-600" />
        <span>Rainfall</span>
    </div>
    <!-- Right value -->
        <span class="text-sm font-medium text-black-700">{$weatherData?.current?.rainfall ?? 0} cm</span>
    </div>

    <div
        class="h-16 w-64 rounded-xl flex items-center justify-between px-4 text-black font-light
           bg-white/40 backdrop-blur-md shadow-md
           transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
    >
    <div class="flex items-center gap-3">
        <Wind class="w-6 h-6 text-green-600" />
        <span>Wind</span>
    </div>
        <span class="text-sm font-medium text-black-700">{$weatherData?.current?.wind_kmh ?? 0} km/h</span>
    </div>

    <div
        class="h-16 w-64 rounded-xl flex items-center justify-between px-4 text-black font-light
           bg-white/40 backdrop-blur-md shadow-md
           transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
    >
    <div class="flex items-center gap-3">
        <Droplet class="w-6 h-6 text-orange-600" />
        <span>Humidity</span>
    </div>
        <span class="text-sm font-medium text-black-700">{$weatherData?.current?.humidity ?? 0}%</span>
    </div>
    </div>

    <!-- Hourly Forecast (Today) -->
<div class="w-full max-w-4xl mt-16">
  <!-- Tabs -->
    <div class="flex justify-around border-b border-gray-400 pb-2 text-gray-600 font-medium">
        <button class="pb-1" class:border-b-2={activeTab==="today"} class:text-black={activeTab==="today"} on:click={()=>activeTab="today"}>Today</button>
        <button class="pb-1" class:border-b-2={activeTab==="tomorrow"} class:text-black={activeTab==="tomorrow"} on:click={()=>activeTab="tomorrow"}>Tomorrow</button>
        <button class="pb-1" class:border-b-2={activeTab==="week"} class:text-black={activeTab==="week"} on:click={()=>activeTab="week"}>Next 7 Days</button>
    </div>
    <div class="flex gap-4 overflow-x-auto mt-6 pb-4 h-full">
        {#if activeTab === "today"}
          {#each todayForecast as forecast}
            <div class="flex flex-col items-center bg-white/40 backdrop-blur-md rounded-xl p-4 shadow-md min-w-[100px] min-h-[120px] transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                <p class="font-medium">{forecast.time}</p>
                <svelte:component this={forecast.icon} class={`w-8 h-8 ${forecast.color}`} />
                <p class="text-sm text-gray-600">{forecast.temp}°</p>
            </div>
          {/each}
        {:else if activeTab === "tomorrow"}
          {#each tomorrowForecast as forecast}
            <div class="flex flex-col items-center bg-white/40 backdrop-blur-md rounded-xl p-4 shadow-md min-w-[100px] min-h-[120px] transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                <p class="font-medium truncate">{forecast.time}</p>
                <svelte:component this={forecast.icon} class={`w-8 h-8 ${forecast.color}`} />
                <p class="text-sm text-gray-600">{forecast.temp}°</p>
            </div>
          {/each}
        {:else if activeTab === "week"}
          {#each weekForecast as forecast}
            <div class="flex flex-col items-center bg-white/40 backdrop-blur-md rounded-xl p-4 shadow-md min-w-[100px] min-h-[120px] transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                <p class="font-medium">{new Date(forecast.day).toLocaleDateString([], { weekday: 'short' })}</p>
                <svelte:component this={forecast.icon} class={`w-8 h-8 ${forecast.color}`} />
                <p class="text-sm text-gray-600">{forecast.temp}°</p>
            </div>
          {/each}
        {/if}
    </div>
</div>

</section>

