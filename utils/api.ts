
// --- Định nghĩa Types ---
export interface Service {
    id: number;
    tenDichVu: string;
    moTa: string;
    gia: number;
    loaiDichVu: string;
    trangThai: string;
}

export type NewService = Omit<Service, 'id'>;

export interface PagedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

// --- Logic API ---
const API_BASE_URL = 'http://localhost:8081';

const apiFetch = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204 || options?.method === 'DELETE') {
        return null;
    }

    return response.json();
};

export const getServices = (
    page: number,
    size: number,
    keyword: string = ''
): Promise<PagedResponse<Service>> => {
    let url: string;

    if (keyword) {
        url = `${API_BASE_URL}/services/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
    } else {
        url = `${API_BASE_URL}/services?page=${page}&size=${size}`;
    }

    return apiFetch(url);
};


export const getServiceById = (id: number): Promise<Service> => {
    return apiFetch(`${API_BASE_URL}/services/${id}`);
};

export const addService = (newService: NewService): Promise<Service> => {
    return apiFetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        body: JSON.stringify(newService),
    });
};

export const updateService = (id: number, updatedData: NewService): Promise<Service> => {
    return apiFetch(`${API_BASE_URL}/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
    });
};

export const deleteService = (id: number): Promise<null> => {
    return apiFetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
    });
};