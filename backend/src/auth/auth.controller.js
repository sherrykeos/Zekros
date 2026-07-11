import * as authService from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  changePasswordSchema,
  
} from "./auth.validation.js";

import {
  clearRefreshTokenCookie,

} from "../services/cookie.service.js";
import { app } from "../config/app.config.js";



async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

    const result = await authService.register(data);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);

    const result = await authService.login(data, res);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}


async function verify(req, res, next) {
  try {
    const result = await authService.verifyEmail(req.query.token);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function resendVerification(req, res, next) {
  try {
    const data = resendVerificationSchema.parse(req.body);

    const result = await authService.resendVerification(data.email);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  // console.log(req.cookies);
  try {
    const refreshToken = req.cookies.refreshToken;

    const result = await authService.refresh(refreshToken, res);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;

    const result = await authService.logout(refreshToken);

    clearRefreshTokenCookie(res);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  console.log(req.body);
  try {
    const data = forgotPasswordSchema.parse(req.body);

    const result = await authService.forgotPassword(data);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const data = resetPasswordSchema.parse(req.body);

    const result = await authService.resetPassword(data);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function googleCallback(req, res, next) {
  try {
    await authService.googleLogin(req.user, res);

    return res.redirect(
      `${app.frontendUrl}/auth/success`
    );
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const data = changePasswordSchema.parse(req.body);

    const result = await authService.changePassword(
      req.user.id,
      data.currentPassword,
      data.newPassword,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}


export {
  register,
  login,
  verify,
  resendVerification,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  googleCallback,
  me,
  changePassword,
};
