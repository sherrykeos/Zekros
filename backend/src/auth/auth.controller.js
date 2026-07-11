// const { googleLogin, authService } = require("./auth.service");
const authService = require("./auth.service");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  
} = require("./auth.validation");

const {
  clearRefreshTokenCookie,

} = require("../services/cookie.service");
const { app } = require("../config/app.config");



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


module.exports = {
  register,
  login,
  verify,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  googleCallback,
  me,
};


// const { registerUser, loginUser, verifyEmail, resendVerificationEmail } = require("./auth.service");

// function statusFrom(error) {
//   return error.statusCode || 400;
// }

// async function register(req, res) {
//   try {
//     const user = await registerUser(req.body);

//     return res.status(201).json({
//       success: true,
//       message: "Account created successfully. Please check your email to verify your account.",
//       data: user,
//     });
//   } catch (error) {
//     return res.status(statusFrom(error)).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

// async function login(req, res) {
//   try {
//     const result = await loginUser(req.body);

//     return res.status(200).json({
//       success: true,
//       message: "Signed in successfully.",
//       data: result,
//     });
//   } catch (error) {
//     return res.status(statusFrom(error)).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

// async function verify(req, res) {
//   try {
//     const result = await verifyEmail(req.query.token);

//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(statusFrom(error)).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

// async function resendVerification(req, res) {
//   try {
//     const result = await resendVerificationEmail(req.body);

//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(statusFrom(error)).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

// module.exports = {
//   register,
//   login,
//   verify,
//   resendVerification,
// };
