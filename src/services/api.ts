import { Sprint0StatusResponse } from '../types/status';
import { ApiUserResponse, UsernameCheckResponse } from '../types/auth';

// La URL de la API se define con VITE_API_URL (en Vercel apunta al servicio de Render).
function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  return envUrl.replace(/\/+$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiFieldError extends Error {
  public readonly field?: string;
  public readonly status: number;

  constructor(message: string, status: number, field?: string) {
    super(message);
    this.name = 'ApiFieldError';
    this.status = status;
    this.field = field;
  }
}

class BackendUnavailableError extends Error {
  public readonly status: number;
  constructor(status: number) {
    super(`Backend status ${status}`);
    this.name = 'BackendUnavailableError';
    this.status = status;
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 6000
): Promise<Response> {
  const controller = new AbortController();
  const id = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch {
    throw new BackendUnavailableError(0);
  } finally {
    window.clearTimeout(id);
  }
}

async function parseJsonOrFallback<T>(response: Response): Promise<T> {
  if (response.status === 404 || response.status >= 502) {
    throw new BackendUnavailableError(response.status);
  }
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new BackendUnavailableError(response.status);
  }
}

function validateUsernameFormat(rawUsername: string): string {
  const cleaned = rawUsername.trim();
  if (!cleaned) {
    throw new ApiFieldError(
      'Debes elegir un nombre de usuario único.',
      400,
      'username'
    );
  }
  if (cleaned.length < 3 || cleaned.length > 20) {
    throw new ApiFieldError(
      'El nombre de usuario debe tener entre 3 y 20 caracteres.',
      400,
      'username'
    );
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(cleaned)) {
    throw new ApiFieldError(
      'Usa solo letras, números, puntos (.), guiones (-) o guiones bajos (_), sin espacios.',
      400,
      'username'
    );
  }
  return cleaned;
}

export async function fetchSprint0FirestoreStatus(): Promise<Sprint0StatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sprint0/status`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const text = await response.text();
  let payload: Sprint0StatusResponse;
  try {
    payload = JSON.parse(text) as Sprint0StatusResponse;
  } catch {
    throw new Error('No se pudo leer la respuesta del servidor.');
  }

  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.error ||
        `Error HTTP ${response.status} al consultar el endpoint /api/sprint0/status`
    );
  }

  return payload;
}

export async function checkUsernameAvailabilityApi(
  username: string,
  excludeUid?: string
): Promise<UsernameCheckResponse> {
  const cleaned = validateUsernameFormat(username);
  const params = new URLSearchParams({ username: cleaned });
  if (excludeUid) {
    params.set('excludeUid', excludeUid);
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/users/check-username?${params.toString()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }
    );

    const payload = await parseJsonOrFallback<UsernameCheckResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No se pudo verificar el nombre de usuario.',
        response.status,
        payload.field || 'username'
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }

    throw new ApiFieldError(
      'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      0, 'username'
    );
  }
}

export async function fetchCurrentUserProfileApi(
  idToken: string
): Promise<ApiUserResponse> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });

    const payload = await parseJsonOrFallback<ApiUserResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No se pudo obtener tu perfil.',
        response.status,
        payload.field
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }

    throw new ApiFieldError(
      'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      0
    );
  }
}

export async function registerManualProfileApi(
  idToken: string,
  input: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    avatar: string;
  }
): Promise<ApiUserResponse> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/users/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(input),
      }
    );

    const payload = await parseJsonOrFallback<ApiUserResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No fue posible completar el registro.',
        response.status,
        payload.field
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }

    throw new ApiFieldError(
      'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      0
    );
  }
}

export async function syncGoogleProfileApi(
  idToken: string,
  input?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  }
): Promise<ApiUserResponse> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/users/google-sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(input || {}),
      }
    );

    const payload = await parseJsonOrFallback<ApiUserResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No fue posible sincronizar tu cuenta de Google.',
        response.status,
        payload.field
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }

    throw new ApiFieldError(
      'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      0
    );
  }
}

export async function assignUniqueUsernameApi(
  idToken: string,
  input: { username: string; avatar?: string }
): Promise<ApiUserResponse> {
  const cleanedUsername = validateUsernameFormat(input.username);

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/users/username`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          username: cleanedUsername,
          avatar: input.avatar,
        }),
      }
    );

    const payload = await parseJsonOrFallback<ApiUserResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No fue posible guardar el nombre de usuario.',
        response.status,
        payload.field || 'username'
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }

    throw new ApiFieldError(
      'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      0
    );
  }
}

export async function registerViaBackendAuthApi(input: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
}): Promise<ApiUserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonOrFallback<ApiUserResponse>(response);

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'No fue posible completar el registro.',
      response.status,
      payload.field
    );
  }

  return payload;
}

export async function loginViaBackendAuthApi(input: {
  email: string;
  password: string;
}): Promise<ApiUserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonOrFallback<ApiUserResponse>(response);

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'Correo o contraseña incorrectos',
      response.status,
      payload.field
    );
  }

  return payload;
}

export async function updateAvatarApi(
  idToken: string,
  avatar: string
): Promise<ApiUserResponse> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/users/avatar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ avatar }),
    });

    const payload = await parseJsonOrFallback<ApiUserResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No fue posible guardar tu avatar.',
        response.status,
        payload.field || 'avatar'
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }
    throw new ApiFieldError(
      'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      0
    );
  }
}
