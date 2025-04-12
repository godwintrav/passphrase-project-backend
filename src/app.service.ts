import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dtos/create-user.dto';  // Assuming you have the DTO
import { Analytic } from './entity/analytics.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Analytic)
    private analyticsRepository: Repository<Analytic>,
  ) {}


  // Create User function
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, passphrase } = createUserDto;

    // Check if the username already exists
    const existingUser = await this.usersRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password and passphrase
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
    const hashedPassphrase = await bcrypt.hash(passphrase, 10);

    // Create the new user
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      passphrase: hashedPassphrase,
    });

    // Save the user to the database
    return this.usersRepository.save(user);
  }

  // Login function (Update counters at DB level)
  async loginUser(loginDto: CreateUserDto): Promise<{ message: string }> {
    const { username, password, passphrase } = loginDto;

    // Check if the username exists
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('Username not found');
    }

    // Check if the analytics record exists (there is only one record)
    let analytic = (await this.analyticsRepository.find())[0];
    
    // If no analytics record exists, create a new one
    if (!analytic) {
      analytic = this.analyticsRepository.create({
        correctPassphraseCount: 0,
        incorrectPassphraseCount: 0,
        correctPasswordCount: 0,
        incorrectPasswordCount: 0,
      });
      await this.analyticsRepository.save(analytic); // Save the initial record
    }
    const isPassphraseCorrect = await this.checkPassphrase(passphrase, user.passphrase);
    const isPasswordCorrect = await this.checkPassword(password, user.password);
    // Use query builder to update analytics in one operation
    const updateQuery = this.analyticsRepository.createQueryBuilder()
      .update(Analytic)
      .set({
        correctPassphraseCount: () => `correctPassphraseCount + ${isPassphraseCorrect ? 1 : 0}`,
        incorrectPassphraseCount: () => `incorrectPassphraseCount + ${isPassphraseCorrect ? 0 : 1}`,
        correctPasswordCount: () => `correctPasswordCount + ${isPasswordCorrect ? 1 : 0}`,
        incorrectPasswordCount: () => `incorrectPasswordCount + ${isPasswordCorrect ? 0 : 1}`,
      })
      .where("id = :id", { id: analytic.id });

    await updateQuery.execute();

    return { message: 'Login successful and analytics updated' };
  }

  // Get the only analytics record
async getAnalytics(): Promise<Analytic> {
  const analytic = (await this.analyticsRepository.find())[0];

  if (!analytic) {
    // Optionally create the record if it doesn't exist yet
    const newAnalytic = this.analyticsRepository.create({
      correctPassphraseCount: 0,
      incorrectPassphraseCount: 0,
      correctPasswordCount: 0,
      incorrectPasswordCount: 0,
    });
    return this.analyticsRepository.save(newAnalytic);
  }

  return analytic;
}

  // Helper function to check passphrase validity
  private async checkPassphrase(inputPassphrase: string, storedPassphrase: string): Promise<boolean> {
    return await bcrypt.compare(inputPassphrase, storedPassphrase);
  }

  // Helper function to check password validity
  private async checkPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
    return await bcrypt.compare(inputPassword, storedPassword);
  }
}
