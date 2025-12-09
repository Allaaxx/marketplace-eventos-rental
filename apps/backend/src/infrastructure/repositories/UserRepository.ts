import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { db, users } from '@infrastructure/database';
import { eq } from 'drizzle-orm';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user || null;
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        emailVerified: data.emailVerified || false,
      })
      .returning();

    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}
