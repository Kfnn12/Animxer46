import kv from "@vercel/kv";
import { ANIME_URI, BASE_URI } from "@/utils/constants";

export default function useAnime() {
  let API = {
    recent: ANIME_URI + "/recent",
    popular: ANIME_URI + "/popular",
    info: ANIME_URI + "/anime",
    episode: BASE_URI + "/anime/gogoanime/watch",
    search: ANIME_URI + "/search",
  };

  async function getRecent() {
    const data = await fetch(API.recent, {
      cache: "no-store",
    });
    const json = await data.json();
    return json;
  }

  async function getPopular() {
    const data = await fetch(API.popular);
    return data.json();
  }

  async function getInfo(id: string) {
    const data = await fetch(API.info + "/" + id, {
      next: { revalidate: 5 * 60 },
    });
    return data.json();
  }

  async function getEpisode(id: string, serverName: string = "vidstreaming") {
    let KV;
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      KV = await kv.get(id);
      if (KV !== null) {
        return KV;
      }
    }
    const data = await fetch(API.episode + id + "?server=" + serverName);
    let json = await data.json();

    if (KV) {
      await kv.set(id, JSON.stringify(json));
    }
    return json;
  }

  async function getSearch(query: string) {
    const data = await fetch(API.search + "/" + query);
    return data.json();
  }

  return {
    getRecent,
    getPopular,
    getInfo,
    getEpisode,
    getSearch,
  };
}
