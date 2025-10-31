import type { Auth, Register } from "@/types/auth"
import { client, errorValidation } from "./service";
import type { LoginResponse, LogoutResponse, RegisterResponse } from "@/types/api";
import type { User } from "@/types/user";

export const loginService = async function ({
    email, password
}: Auth) {
    try {
        const response = await client.post('/login', {
            email,
            password
        });
        if (response.status !== 200) { throw response.data; }
        const data : LoginResponse = response.data;
        return data;
    } catch (e: unknown) {
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}

export const registerService = async function ({
    name,
    email,
    password,
    password_confirmation,
} : Register) {
    try {
        const response = await client.post('/register', {
            name,
            email,
            password,
            password_confirmation,
        });
        if (response.status !== 200) { throw response.data; }
        const data : RegisterResponse = response.data;
        return data;
    } catch (e: unknown) {
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}

export const getMeService = async function () {
    try {
        const response = await client.get('/api/me');
        if (response.status !== 200) { throw response.data; }
        const data : User = response.data;
        return data;
    } catch (e: unknown) {
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}

export const logoutService = async function () {
    try {
        const response = await client.post('/logout');
        if (response.status !== 200) { throw response.data; }
        const data : LogoutResponse = response.data;
        return data;
    } catch (e: unknown) {
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}