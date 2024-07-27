import { Router } from "express";
import {
  getAllContacts,
  getContactsForDM,
  searchContacts,
} from "../controllers/ContactsController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const contactRoutes = Router();

contactRoutes.post("/search", verifyToken, searchContacts);
contactRoutes.get("/get-contacts-for-dm", verifyToken, getContactsForDM);
contactRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

export default contactRoutes;
