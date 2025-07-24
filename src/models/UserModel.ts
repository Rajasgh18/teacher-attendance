import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { config } from '@/config';
import type { User, NewUser } from '@/db/schema';

export class UserModel {
  static async create(userData: Omit<NewUser, 'passwordHash'> & { password: string }): Promise<User> {
    const { password, ...userWithoutPassword } = userData;
    const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userWithoutPassword,
        passwordHash,
      })
      .returning();

    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  static async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  }

  static async update(id: string, updates: Partial<Omit<NewUser, 'id' | 'createdAt'>>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new Error(`Failed to update user: User not found`);
    }

    return user;
  }

  static async updatePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    
    const [user] = await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new Error(`Failed to update password: User not found`);
    }
  }

  static async delete(id: string): Promise<void> {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new Error(`Failed to delete user: User not found`);
    }
  }

  static async list(limit = 50, offset = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  static async findByRole(role: 'admin' | 'principal' | 'teacher'): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .orderBy(desc(users.createdAt));
  }
} 