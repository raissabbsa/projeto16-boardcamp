import { Router } from "express";
import { getRentals, postRentals, deleteRentals, postReturnRentals } from "../controllers/rentalsControllers.js";

const router = Router();

router.get("/rentals", getRentals);

router.post("/rentals", postRentals);

router.delete("/rentals/:id", deleteRentals);

router.post("/rentals/:id/return", postReturnRentals);

export default router;
