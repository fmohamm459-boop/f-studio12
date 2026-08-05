import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type OwnerRecord = {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
};

export async function getOwner(): Promise<OwnerRecord | null> {
  return prisma.owner.findFirst();
}

export async function hasOwner(): Promise<boolean> {
  const owner = await prisma.owner.findFirst();
  return owner !== null;
}

export async function createOwner(input: {
  name: string;
  username: string;
  password: string;
}) {
  if (await hasOwner()) {
    throw new Error("An owner account already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  return prisma.owner.create({
    data: {
      name: input.name,
      username: input.username,
      passwordHash,
    },
  });
}

export async function verifyOwnerCredentials(
  username: string,
  password: string
) {
  const owner = await prisma.owner.findUnique({
    where: {
      username,
    },
  });

  if (!owner) return null;

  const matches = await bcrypt.compare(
    password,
    owner.passwordHash
  );

  return matches ? owner : null;}

  export async function updateOwnerPassword(newPassword: string) {
  const owner = await prisma.owner.findFirst();

  if (!owner) {
    throw new Error("Owner account not found.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  return prisma.owner.update({
    where: {
      id: owner.id,
    },
    data: {
      passwordHash,
    },
  });

}