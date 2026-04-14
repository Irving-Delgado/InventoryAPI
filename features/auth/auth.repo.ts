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
    findUserById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    },
    updatePassword(id: string, passwordHash: string){
        return prisma.user.update({
            where: { id },
            data: { passwordHash },
        })
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
    },
    findUserById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    },
    createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
        return prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
    },
    findRefreshToken(tokenHash: string) {
        return prisma.refreshToken.findUnique({
            where: {
                tokenHash,
            },
        });
    },
    deleteRefreshToken(tokenHash: string) {
        return prisma.refreshToken.delete({
            where: {
                tokenHash
            },
        });
    }
};
