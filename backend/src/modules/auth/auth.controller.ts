import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly REFRESH_TOKEN_COOKIE = 'refreshToken';
  private readonly ACCESS_TOKEN_COOKIE = 'accessToken';

  constructor(private readonly authService: AuthService) {}

  /**
   * 🔥 COOKIE CONFIG (AUTO SWITCH LOCAL / PROD)
   */
  private getCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProd,                     // ✅ false in localhost, true in prod
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',  // ✅ critical fix
      path: '/',
    };
  }

  /**
   * ✅ LOGIN
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const result = await this.authService.login(dto);
    const cookieOptions = this.getCookieOptions();

    res.cookie(this.ACCESS_TOKEN_COOKIE, result.data.token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie(this.REFRESH_TOKEN_COOKIE, result.data.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      data: {
        user: result.data.user,
      },
    };
  }

  /**
   * ✅ REFRESH TOKEN
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Request() req: any,
  ): Promise<any> {
    const refreshToken = req.cookies?.[this.REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      return {
        success: false,
        message: 'Refresh token missing',
      };
    }

    const result = await this.authService.refreshToken(refreshToken);
    const cookieOptions = this.getCookieOptions();

    res.cookie(this.ACCESS_TOKEN_COOKIE, result.data.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    return {
      success: true,
      message: 'Token refreshed successfully',
    };
  }

  /**
   * ✅ GET CURRENT USER
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Request() req: any): Promise<any> {
    return this.authService.getProfile(req.user.id);
  }

  /**
   * ✅ LOGOUT
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const refreshToken = req.cookies?.[this.REFRESH_TOKEN_COOKIE];

    const result = await this.authService.logout(
      req.user.id,
      refreshToken,
    );

    const cookieOptions = this.getCookieOptions();

    res.clearCookie(this.ACCESS_TOKEN_COOKIE, cookieOptions);
    res.clearCookie(this.REFRESH_TOKEN_COOKIE, cookieOptions);

    return result;
  }
}