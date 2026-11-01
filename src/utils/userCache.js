import { deleteCache, getCache, setCache } from "./redisCache.js";

const USER_LIST_CACHE_KEY = "users:all";
const USER_LIST_CACHE_TTL_SECONDS = 60;

export const getCachedUserList = async () => {
  const users = await getCache(USER_LIST_CACHE_KEY);
  return Array.isArray(users) ? users : null;
};

export const cacheUserList = (users) => setCache(USER_LIST_CACHE_KEY, users, USER_LIST_CACHE_TTL_SECONDS);

export const invalidateUserListCache = () => deleteCache(USER_LIST_CACHE_KEY);
