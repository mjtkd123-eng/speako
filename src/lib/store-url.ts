export const STORE_ORIGIN =
  import.meta.env.VITE_STORE_ORIGIN?.replace(/\/$/, "") || "http://localhost:3000";

export const COURSES_URL = `${STORE_ORIGIN}/courses`;
export const TUTOR_SETTLEMENTS_URL = `${STORE_ORIGIN}/tutor/settlements`;
