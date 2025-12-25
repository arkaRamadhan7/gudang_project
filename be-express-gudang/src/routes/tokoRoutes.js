import express from "express";
import { 
fetchAllToko,
addToko,
editToko,
deleteToko
} from "../controllers/tokoController.js";

const router = express.Router();
router.get("/", fetchAllToko);
router.post("/add", addToko);
router.put("/edit/:id",editToko);
router.delete("/delete/:id", deleteToko);
export default router;