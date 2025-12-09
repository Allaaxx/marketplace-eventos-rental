import { eq } from 'drizzle-orm';
import { db, users } from '@infrastructure/database';
import { User } from '@domain/entities/User';
import { IUserRepository } from '@domain/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        ...userData,
        emailVerified: userData.emailVerified || false,
      })
      .returning();
    return result[0];
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error('User not found');
    }
    
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}
