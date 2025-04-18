import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import mongoose from "mongoose";
import sendTokenResponse from './auth';
import responseErrorMsg from './libs/responseMsg';
export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await User.find();
    const total = await User.countDocuments();
    res.status(200).json({
      success: true,
      total,
      users: users,
    });
  } catch (err: any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}

export async function updateUser(req: Request, res:Response, next: NextFunction){
  try{
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }
    const {picture, name, tel, password} = req.body;
    const user = await User.findById(req.user._id);
    if(!user){
      res
      .status(401)
      .json({ success: false, msg: 'Not authorized to access this route' });
    return;
    }
    user.name = name;
    user.picture = picture;
    user.tel = tel;
    user.password = password;
    await user.save();
    const newUser = await User.findById(req.user._id) as any as IUser;
    sendTokenResponse(newUser, 200, res);
  }catch(err: any){
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction){
  try{
    if (!mongoose.isValidObjectId(req.body.user)) {
      res.status(400).json({ success: false, msg: "Invalid user ID" });
      return;
    }
    if(req.body.role === "hotelManager"){
      await User.updateOne({_id: req.body.user},{$set:{hotel: req.body.hotel}});
    }
    await User.updateOne({_id: req.body.user},{$set:{role: req.body.role}});
    res.status(200).json({success: true})
  }catch(err:any){
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}