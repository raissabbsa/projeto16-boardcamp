import { getCustomers, getCustomersById, putCustomersById, postCustomers} from "../controllers/customerControllers.js";
import { Router } from "express";

const router = Router();

router.get("/customers", getCustomers);

router.get("/customers/:id", getCustomersById);

router.put("/customers/:id", putCustomersById);

router.post("/customers", postCustomers);

export default router;
