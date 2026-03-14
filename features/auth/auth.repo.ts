import { prisma } from "../../lib/prisma";

export const authRepository = {
    findUserByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    },
    createUser(data: { name: string; email: string; passwordHash: string; role?: "ADMIN" | "USER" }) {
        return prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: data.passwordHash,
                role: data.role ?? "USER",
            },
        });
    },
    async findAllUsers() {
        return prisma.user.findMany({
            select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            },
        });
    }   
};
