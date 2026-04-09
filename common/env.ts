if(!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
}

if(!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not set in environment variables");
}

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET;