import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // Log the user data before passing it to the service

    // Pass the data to the service for further processing (e.g., saving to the database)
    return await this.appService.createUser(createUserDto);
  }

  @Post("login")
  async login(@Body() loginUserDto: CreateUserDto) {
    // Log the user data before passing it to the service

    // Pass the data to the service for further processing (e.g., saving to the database)
    return await this.appService.loginUser(loginUserDto);
  }

  @Get()
  async getAnalytics() {
    return await this.appService.getAnalytics();
  }

  @Get("health")
  async health() {
    return {message: "success"};
  }
}
