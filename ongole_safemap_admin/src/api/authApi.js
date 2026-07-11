import apiClient from "./client";

export async function login(email, password) {
  const { data } = await apiClient.post("/admin/login", {
    email,
    password,
  });

  return data; // { access_token, token_type }
}