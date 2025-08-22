import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  handleSubmit,
  handleVehicleSearch,
  handleContactForm,
  renderHome,
  renderRecentSearches,
  renderAbout,
  renderContact,
} from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", asyncHandler(renderHome));
router.get("/about", asyncHandler(renderAbout));
router.get("/contact", asyncHandler(renderContact));
router.post("/contact", asyncHandler(handleContactForm));
router.get("/recent", asyncHandler(renderRecentSearches));
router.post("/recent/search", asyncHandler(handleVehicleSearch));
router.get("/submit", (req, res) => res.redirect("/"));
router.post("/submit", asyncHandler(handleSubmit));

// 404 fallback
router.use((req, res) => {
  res.status(404).render("404", { errorMessage: "Page not found" });
});

export default router;
