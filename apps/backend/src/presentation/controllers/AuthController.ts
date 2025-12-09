import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { Email } from '@domain/value-objects/Email';

export class AuthController {
  private userRepository = new UserRepository();

  async register(data: { email: string; name: string; password: string; role?: string }) {
    const emailVO = new Email(data.email);

    const existingUser = await this.userRepository.findByEmail(emailVO.getValue());
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password - in production use bcrypt
    const passwordHash = `hashed_${data.password}`;

    const user = await this.userRepository.create({
      email: emailVO.getValue(),
      name: data.name,
      passwordHash,
      role: (data.role as any) || 'customer',
      emailVerified: false,
    });

    // Remove password from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token: user.id, // Temporary: return userId as token
    };
  }

  async login(data: { email: string; password: string }) {
    const emailVO = new Email(data.email);

    const user = await this.userRepository.findByEmail(emailVO.getValue());
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password - in production use bcrypt.compare
    if (user.passwordHash !== `hashed_${data.password}`) {
      throw new Error('Invalid credentials');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token: user.id, // Temporary: return userId as token
    };
  }

  async me(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
