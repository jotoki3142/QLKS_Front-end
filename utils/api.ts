
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
        let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.text();
            if (errorData) {
                errorMessage += ` - ${errorData}`;
            }
        } catch (e) {
            // Ignore if we can't parse error
        }
        throw new Error(errorMessage);
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

// --- Employee Types ---
export type EmployeeRole = 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING' | 'SECURITY';
export type EmployeeShift = 'MORNING' | 'AFTERNOON' | 'NIGHT';
export type EmployeeStatus = 'WORKING' | 'RESIGNED';

export interface Employee {
    employeeId: number;
    name: string;
    position: EmployeeRole; // Maps to 'role' in backend entity
    phoneNumber: number;
    email: string;
    shift: EmployeeShift;
    salary: number; // Will be sent as number, backend converts to BigDecimal
    employeeStatus: EmployeeStatus;
}

export type NewEmployee = Omit<Employee, 'employeeId'>;

// --- Employee API Functions ---
export const getEmployees = async (): Promise<Employee[]> => {
    const data = await apiFetch(`${API_BASE_URL}/employee/api/list`);
    // Map backend field 'role' to frontend field 'position' if needed
    return data.map((emp: any) => ({
        ...emp,
        position: emp.position || emp.role, // Handle both field names
    }));
};

export const getEmployeeById = async (id: number): Promise<Employee> => {
    const data = await apiFetch(`${API_BASE_URL}/employee/api/${id}`);
    // Map backend field 'role' to frontend field 'position' if needed
    return {
        ...data,
        position: data.position || data.role,
    };
};

export const addEmployee = (newEmployee: NewEmployee): Promise<Employee> => {
    // Clean the data - remove empty strings that would cause enum parsing errors
    const cleanedData = {
        ...newEmployee,
        position: newEmployee.position || undefined,
        shift: newEmployee.shift || undefined,
    };
    
    console.log('Cleaned employee data:', cleanedData);
    
    return apiFetch(`${API_BASE_URL}/employee/api/add`, {
        method: 'POST',
        body: JSON.stringify(cleanedData),
    });
};

export const updateEmployee = (id: number, updatedData: NewEmployee): Promise<Employee> => {
    return apiFetch(`${API_BASE_URL}/employee/api/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
    });
};

export const deleteEmployee = (id: number): Promise<null> => {
    return apiFetch(`${API_BASE_URL}/employee/api/${id}`, {
        method: 'DELETE',
    });
};