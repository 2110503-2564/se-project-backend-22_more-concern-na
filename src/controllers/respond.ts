import { Request, Response, NextFunction } from "express";
import Review from "models/Review";
import mongoose from "mongoose";

export async function addRespond( req: Request, res: Response, next: NextFunction) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      if(req.user.role !== "admin" && req.user.role !== "hotelManager") {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      const populateBooking = {
         path: 'booking',
         select: 'hotel'
      }
      const review: any = await Review.findById(req.params.ReviewId).populate(populateBooking);
      if(!review) {
         res.status(404).json({ success: false, msg: "Review not found" });
         return;
      }

      const respondExists = await Review.findOne({ reply: req.params.ReviewId });
      if(respondExists) {
         res.status(400).json({ success: false, msg: "Respond already exists" });
         return;
      }

      if(!review.booking) {
         res.status(404).json({ success: false, msg: "Booking not found" });
         return;
      }
      if(req.user.role !== 'admin' && review.booking.hotel.toString() !== req.user.hotel.toString()) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      const respond = {
         reply: new mongoose.Types.ObjectId(req.params.ReviewId),
         title: req.body.title as string,
         text: req.body.text as string,
      }

      await Review.create(respond);
      res.status(201).json({ success: true });
   } catch (error: any) {
      console.error(error.stack);
      res.status(500).json({ success: false, msg: "Server Error" });
   }
}

export async function updateRespond( req: Request, res: Response, next: NextFunction) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      const respond: any = await Review.findById(req.params.id);
      if(!respond) {
         res.status(404).json({ success: false, msg: "Respond not found" });
         return;
      }

      const populateBooking = {
         path: 'booking',
         select: 'hotel'
      }
      const review: any = await Review.findById(respond.reply).populate(populateBooking);
      if(!review) {
         res.status(404).json({ success: false, msg: "Review not found" });
         return;
      }
      if(!review.booking) {
         res.status(404).json({ success: false, msg: "Booking not found" });
         return;
      }

      if(req.user.role !== 'admin' && review.booking.hotel.toString() !== req.user.hotel.toString()) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      respond.title = req.body.title;
      respond.text = req.body.text;

      await respond.save();
      res.status(200).json({ success: true });
   } catch (error: any) {
      console.error(error.stack);
      res.status(500).json({ success: false, msg: "Server Error" });
   }
}