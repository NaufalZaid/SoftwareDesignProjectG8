const BASE_URL = "/api/v1/auth";


export async function registerCustomer(data) {
    const response = await fetch(`${BASE_URL}/register/customer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.text();
}
