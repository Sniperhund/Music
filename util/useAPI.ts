import { cookies } from "next/headers";
import { defu } from "defu";
import refreshToken from "./refreshToken";

export default async function useAPI(
  path: string,
  options?: RequestInit | undefined | null
) {
  const accessToken = cookies().get("access_token");

  const defaults: RequestInit = {
    headers: {
      Authorization: `${accessToken?.value}`,
    },
  };

  const params = defu(options, defaults);

  const result = await fetch("https://api.lucasskt.dk" + path, params);

  if (result.status == 401) {
    try {
      await refreshToken();

      console.log(accessToken);
    } catch (error) {
      console.log("Token refresh failed: ", error);
    }
  }

  return result;
}
