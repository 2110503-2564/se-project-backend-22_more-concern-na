import { NextFunction, Request, Response } from 'express';
import User, { AuthRequest, IUser } from '../models/User';

interface IOption {
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
}

const errMongoChecker = (err: any) => {
  if (err.code === 11000) {
    return 'Email Already Exists';
  } else if (err.name === 'ValidationError') {
    if (err.errors.password) {
      return 'Password must be at least 6 characters';
    }
    if (err.errors.tel_number) {
      return 'Invalid Tel Number';
    }
    if (err.errors.email) {
      return 'Invalid Email';
    }
    if (err.errors.name) {
      return 'Invalid Name';
    }
    return 'Invalid Data';
  } else if (err.name === 'CastError') {
    return 'Invalid Id';
  } else {
    return 'Error';
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, tel, password, role } = req.body;
    const user = await User.create({
      name,
      email,
      tel,
      password,
      role,
    });
    sendTokenResponse(user, 200, res);
  } catch (err: any) {
    const massage = errMongoChecker(err);
    res.status(400).json({ success: false, msg: massage });
    console.log(err.stack);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, msg: 'Please provide an email and password' });
  }

  const user: IUser | null = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(400).json({ success: false, msg: 'Invalid credentials' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, msg: 'Invalid credentials' });
  }

  sendTokenResponse(user, 200, res);
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.cookie('token', '', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, token: '' });
};

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = user.getSignedJwtToken();
  const options: IOption = {
    expires: new Date(
      Date.now() +
        (process.env.JWT_COOKIE_EXPIRE as any as number) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
};
