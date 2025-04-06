import express from 'express';
import { login,register,getMe } from '../controllers/auth';
import { authorize, protect } from '../middleware/auth';

const router = express.Router();

router.post("/login");
router.post("/register");
router.route("/getMe").get(protect,getMe);
export default router;
